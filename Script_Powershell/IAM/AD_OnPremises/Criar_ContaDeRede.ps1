<#
.SYNOPSIS
Script de criação de contas de rede no Active Directory a partir de CSV
com validação de campos, checagem de existência, grupos padrão e regras especiais.

.AUTHOR
Leandro Cardoso
#>

Clear-Host
Import-Module ActiveDirectory

# =====================
# CONFIGURAÇÕES (PARAMETRIZADAS)
# =====================
$Config = @{
    ExchangeUri = "http://exchange-server/powershell/"  # servidor fictício
    DomainUPN   = "@empresa.local"                       # domínio fictício
    DefaultOU   = "OU=ThirdParty,OU=Users,DC=empresa,DC=local"
    CsvPath     = ".\input\Criar_ContaDeRede.csv"
}

# Grupos genéricos para portfólio
$DefaultGroups = @(
    "IAM_Licenca",
    "IAM_Base_Access",
    "IAM_MFA_Required",
    "IAM_Communication"
)


# =====================
# CONEXÃO EXCHANGE
# =====================
$Session = New-PSSession -ConfigurationName Microsoft.Exchange `
                          -ConnectionUri $Config.ExchangeUri `
                          -Authentication Kerberos
Import-PSSession $Session -DisableNameChecking

# =====================
# IMPORTAÇÃO DO CSV
# =====================
$users = Import-Csv $Config.CsvPath -Encoding Default -Delimiter ";"
$CsvErro = ".\UsuariosComErro_$(Get-Date -Format 'dd_MM_yyyy').csv"

foreach ($user in $users) {

    # =====================
    # VALIDAÇÃO DE CAMPOS
    # =====================
 foreach ($campo in "LOGIN","CHAMADO","DESCRICAO","NOME_COMPLETO","CRIAR_EMAIL","SENHA","USUARIO_GESTOR") {
    if (-not $user.$campo) {
        Write-Host "❌ Usuário '$($user.NOME_COMPLETO)' não será criado. Campo '$campo' não preenchido!" -ForegroundColor Red
        [PSCustomObject]@{
                LOGIN          = $user.LOGIN
                NOME_COMPLETO  = $user.NOME_COMPLETO
                CampoFaltando  = "Favor preencher o campo faltante $($campo) e recriar a conta de rede"
                DataExecucao   = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            } | Export-Csv -Path $CsvErro -NoTypeInformation -Append -Encoding UTF8

            continue 2  # Pula para o próximo usuário
    }

}
    # =====================
    # VERIFICA SE USUÁRIO EXISTE
    # =====================
    try {
        if (Get-ADUser $user.LOGIN -ErrorAction Stop) {
            Write-Host "O usuário $($user.NOME_COMPLETO) já existe" -ForegroundColor Yellow
            continue
        }
    } catch {
        # =====================
        # CRIAÇÃO DO USUÁRIO
        # =====================
            $option = [System.StringSplitOptions]::RemoveEmptyEntries
            $givenName = $user.NOME_COMPLETO.Split(" ",2, $option)[0]
            $surname = $user.NOME_COMPLETO.Split(" ",2, $option)[1]

        try {
            New-ADUser -SamAccountName $user.LOGIN -Name $user.NOME_COMPLETO `
                       -GivenName $givenName -Surname $surname `
                       -DisplayName ($user.NOME_COMPLETO).toString() -UserPrincipalName ($user.LOGIN + $Config.DomainUPN) `
                       -Fax $user.CHAMADO -Description $user.DESCRICAO -Manager $user.USUARIO_GESTOR `
                       -Title "Generico" -Company $user.EMPRESA `
                       -AccountPassword (ConvertTo-SecureString $user.SENHA -AsPlainText -Force) `
                       -Enabled $true -Path $Config.DefaultOU -ChangePasswordAtLogon $true

            Write-Host "Usuário $($user.NOME_COMPLETO) criado com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "Falha ao criar usuário $($user.NOME_COMPLETO). Conta pode já existir." -ForegroundColor White
            continue
        }
    }

    # =====================
    # ATRIBUIÇÃO DE GRUPOS PADRÃO
    # =====================
    $NewMember = Get-ADUser $user.LOGIN
    foreach ($group in $DefaultGroups) {
        try {
            Add-ADGroupMember -Identity $group -Members $NewMember
            Write-Host "Usuário $($user.NOME_COMPLETO) adicionado ao grupo $group" -ForegroundColor Cyan
        } catch {
            Write-Host "Usuário $($user.NOME_COMPLETO) já pertence ao grupo $group" -ForegroundColor DarkYellow
        }
    }

    # =====================
    # REGRAS ESPECIAIS (exemplo portfólio)
    # =====================
    if ($user.PERFIL -eq "DESENVOLVIMENTO") {
        Add-ADGroupMember -Identity "IAM_Dev_Access" -Members $NewMember
    }

    # =====================
    # CRIAÇÃO DE EMAIL CONDICIONAL
    # =====================
    try {
        if ($user.CRIAR_EMAIL -match "Sim") {
            Add-ADGroupMember -Identity "IAM_Licenca_F3" -Members $NewMember
            Enable-Mailbox -Identity $NewMember.SamAccountName -Alias $NewMember.SamAccountName `
                           -PrimarySmtpAddress ($NewMember.SamAccountName + $Config.DomainUPN) `
            Write-Host "Mailbox criada para $($user.NOME_COMPLETO) com sucesso ! " -ForegroundColor Cyan
        } else {
            Add-ADGroupMember -Identity "IAM_Licenca_F1" -Members $NewMember
            Write-Host "Mailbox NÃO criada para $($user.NOME_COMPLETO)" -ForegroundColor White
        }
    } catch {
        Write-Host "Erro ao criar mailbox para $($user.NOME_COMPLETO)" -ForegroundColor DarkRed
    }

    # =====================
    # CAMPOS OFFICE/DEPARTMENT HERDADOS DO GESTOR
    # =====================
    try {
        $Gestor = Get-ADUser $user.USUARIO_GESTOR -Properties Office, Department
        Set-ADUser -Identity $NewMember -Office $Gestor.Office
        Set-ADUser -Identity $NewMember -Department $Gestor.Department
    } catch {
        Write-Host "Falha ao herdar Office/Department do gestor" -ForegroundColor Yellow
    }

}
