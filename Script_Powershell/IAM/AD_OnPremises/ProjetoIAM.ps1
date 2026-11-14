<#
.SYNOPSIS
Script de Consulta e Relatório do Active Directory
.DESCRIPTION
Realiza consultas de grupos, usuários, propriedades e dados de segurança sob demanda.
Para consultas em massa, abre um seletor de arquivos para carregar dados de um CSV.
Exporta os resultados dinamicamente para um arquivo CSV.
#>

Import-Module ActiveDirectory

$datahora = Get-Date -Format "yyyyMMdd_HHmm"
$arquivoSaida = "c:\temp\RelatorioAD_$datahora.csv"
$resultados = @()

#region Funções de Apoio
function Abrir-DialogoCSV {
    <#
    .SYNOPSIS
    Abre uma janela para o usuário selecionar um arquivo CSV.
    .DESCRIPTION
    Lê a primeira coluna do arquivo CSV selecionado, independentemente do nome do cabeçalho,
    e retorna os valores como uma lista.
    .RETURNS
    Um array de strings com os dados da primeira coluna ou $null se a operação for cancelada.
    #>
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $openFileDialog = New-Object System.Windows.Forms.OpenFileDialog
        $openFileDialog.InitialDirectory = [Environment]::GetFolderPath('Desktop')
        $openFileDialog.Filter = "Arquivos CSV (*.csv)|*.csv"
        $openFileDialog.Title = "Selecione o arquivo CSV para a consulta em massa"
        
        if ($openFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            $caminhoArquivo = $openFileDialog.FileName
            Write-Host "Lendo o arquivo: $caminhoArquivo" -ForegroundColor Cyan
            
            # Importa o CSV (tentando com ; e , como delimitadores) e pega o nome da primeira coluna
            try {
                $csvData = Import-Csv -Path $caminhoArquivo -Delimiter ';' -ErrorAction Stop
            } catch {
                $csvData = Import-Csv -Path $caminhoArquivo -Delimiter ',' -ErrorAction Stop
            }

            if ($csvData) {
                $primeiroHeader = $csvData[0].PSObject.Properties.Name | Select-Object -First 1
                if ($primeiroHeader) {
                    # Extrai todos os valores dessa primeira coluna, ignorando linhas vazias
                    $dadosColuna = $csvData | ForEach-Object { $_.$primeiroHeader } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
                    Write-Host "Foram encontrados $($dadosColuna.Count) itens na primeira coluna." -ForegroundColor Green
                    return $dadosColuna
                }
            }
        }
    } catch {
        Write-Host "ERRO ao processar o arquivo CSV: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "Nenhum arquivo selecionado ou erro na leitura." -ForegroundColor Yellow
    return $null
}


function Obter-DetalhesUsuario {
    param(
        [string]$Usuario,
        [string]$NomeGrupo = $null,
        [string]$TipoGrupo = $null,
        [switch]$IncluirUltimoLogin,
        [switch]$IncluirResetSenha,
        [switch]$IncluirStatusBloqueio
    )
    try {
        # Define propriedades básicas a buscar no AD
        $propsToFetch = @("Title", "Manager", "Department")
        
        # Adiciona propriedades apenas se solicitado nas opções de segurança
        if ($IncluirUltimoLogin) { $propsToFetch += "LastLogonDate", "LastBadPasswordAttempt" }
        if ($IncluirResetSenha) { $propsToFetch += "PasswordLastSet" }
        if ($IncluirStatusBloqueio) { $propsToFetch += "LockedOut" }
        
        $adUser = Get-ADUser -Identity $Usuario -Properties $propsToFetch -ErrorAction Stop
        
        $nomeGestor = "Sem Gestor"
        if ($adUser.Manager) {
            try {
                $nomeGestor = (Get-ADUser -Identity $adUser.Manager).Name
            } catch {
                $nomeGestor = "Erro ao buscar gestor"
            }
        }
        
        # 1. Monta o objeto PADRÃO
        $out = [ordered]@{
            Login       = $adUser.SamAccountName
            Nome        = $adUser.Name
            Cargo       = $adUser.Title
            Departamento= $adUser.Department
            Gestor      = $nomeGestor
        }
        
        # 2. Adiciona Propriedades de Grupo
        if ($NomeGrupo) {
            $out.Add("NomeDoGrupo", $NomeGrupo)
            $out.Add("TipoDeGrupo", $TipoGrupo)
        }
        
        # 3. Adiciona Propriedades de Segurança
        if ($IncluirUltimoLogin) {
            $out.Add("UltimoLogin", $adUser.LastLogonDate)
            $out.Add("UltimaTentativaLogin", $adUser.LastBadPasswordAttempt)
        }
        if ($IncluirResetSenha) {
            $out.Add("UltimoResetSenha", $adUser.PasswordLastSet)
        }
        if ($IncluirStatusBloqueio) {
            $status = if ($adUser.LockedOut) { "Bloqueado" } else { "Desbloqueado" }
            $out.Add("StatusBloqueio", $status)
        }
        
        return [PSCustomObject]$out
    } catch {
        Write-Host "Erro ao consultar detalhes do usuário [$Usuario]: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Obter-GruposDoUsuario {
    param([string]$LoginUsuario)
    $listaGrupos = @()
    try {
        $userObj = Get-ADUser -Identity $LoginUsuario -Properties MemberOf -ErrorAction Stop
        
        foreach ($groupDN in $userObj.MemberOf) {
            try {
                $grpObj = Get-ADGroup -Identity $groupDN -Properties GroupCategory -ErrorAction Stop
                $listaGrupos += $grpObj
            } catch {
                Write-Host "Aviso: Não foi possível obter detalhes do grupo [$groupDN]" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "Erro ao carregar grupos do usuário [$LoginUsuario]: $($_.Exception.Message)" -ForegroundColor Red
    }
    return $listaGrupos
}
#endregion

# --- MENU PRINCIPAL ---
do {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "       CONSULTA ACTIVE DIRECTORY    " -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "1.1 - Consultar membros de " -NoNewline; Write-Host "UM" -ForegroundColor Yellow -NoNewline; Write-Host " grupo"
    Write-Host "1.2 - Consultar membros de " -NoNewline; Write-Host "VÁRIOS" -ForegroundColor Yellow -NoNewline; Write-Host " grupos (via CSV)"
    Write-Host "2.1 - Consultar grupos de " -NoNewline; Write-Host "UM" -ForegroundColor Yellow -NoNewline; Write-Host " usuário"
    Write-Host "2.2 - Consultar grupos de "-NoNewline; Write-Host "VÁRIOS" -ForegroundColor Yellow -NoNewline; Write-Host " usuários (via CSV)"
    Write-Host "3.1 - Consultar por " -NoNewline; Write-Host "DEPARTAMENTO" -ForegroundColor Yellow
    Write-Host "3.2 - Consultar por " -NoNewline; Write-Host "GESTOR (buscar subordinados)" -ForegroundColor Yellow
    Write-Host "4.1 - Consultar segurança: " -NoNewline; Write-Host "Último Login / Tentativa" -ForegroundColor Yellow
    Write-Host "4.2 - Consultar segurança: " -NoNewline; Write-Host "Último Reset de Senha" -ForegroundColor Yellow
    Write-Host "4.3 - Consultar segurança: " -NoNewline; Write-Host "Status de Bloqueio" -ForegroundColor Yellow
    Write-Host "0   - Sair e Exportar Relatório" -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Cyan
    
    $opcao = Read-Host "Favor informar a opção desejada"
    
    switch ($opcao) {
        "1.1" {
            $grupo = Read-Host "Favor informar o nome do Grupo"
            try {
                $adGroup = Get-ADGroup -Identity $grupo -Properties GroupCategory -ErrorAction Stop
                $membros = Get-ADGroupMember -Identity $grupo -ErrorAction Stop
                foreach ($membro in $membros) {
                    if ($membro.ObjectClass -eq "user") {
                        $detalhe = Obter-DetalhesUsuario -Usuario $membro.SamAccountName -NomeGrupo $adGroup.Name -TipoGrupo $adGroup.GroupCategory
                        if ($detalhe) { $resultados += $detalhe }
                    }
                }
                Write-Host "Consulta do grupo '$grupo' concluída com sucesso!" -ForegroundColor Green
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "1.2" {
            # MODIFICADO: Utiliza o seletor de arquivo CSV
            $grupos = Abrir-DialogoCSV
            if ($grupos) {
                foreach ($grp in $grupos) {
                    try {
                        $adGroup = Get-ADGroup -Identity $grp -Properties GroupCategory -ErrorAction Stop
                        $membros = Get-ADGroupMember -Identity $grp -ErrorAction Stop
                        foreach ($membro in $membros) {
                            if ($membro.ObjectClass -eq "user") {
                                $detalhe = Obter-DetalhesUsuario -Usuario $membro.SamAccountName -NomeGrupo $adGroup.Name -TipoGrupo $adGroup.GroupCategory
                                if ($detalhe) { $resultados += $detalhe }
                            }
                        }
                        Write-Host "Consulta do grupo '$grp' concluída!" -ForegroundColor Green
                    } catch {
                        Write-Host "Erro no grupo '$grp': $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
            Pause
        }
        "2.1" {
            $login = Read-Host "Favor informar o Login do usuário"
            try {
                $gruposUsuario = Obter-GruposDoUsuario -LoginUsuario $login
                if ($gruposUsuario.Count -gt 0) {
                    foreach ($grp in $gruposUsuario) {
                        $detalhe = Obter-DetalhesUsuario -Usuario $login -NomeGrupo $grp.Name -TipoGrupo $grp.GroupCategory
                        if ($detalhe) { $resultados += $detalhe }
                    }
                    Write-Host "Consulta de grupos do usuário '$login' concluída!" -ForegroundColor Green
                } else {
                    Write-Host "Nenhum grupo encontrado para o usuário '$login'." -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "2.2" {
            # MODIFICADO: Utiliza o seletor de arquivo CSV
            $logins = Abrir-DialogoCSV
            if ($logins) {
                foreach ($log in $logins) {
                    try {
                        $gruposUsuario = Obter-GruposDoUsuario -LoginUsuario $log
                        if ($gruposUsuario.Count -gt 0) {
                            foreach ($grp in $gruposUsuario) {
                                $detalhe = Obter-DetalhesUsuario -Usuario $log -NomeGrupo $grp.Name -TipoGrupo $grp.GroupCategory
                                if ($detalhe) { $resultados += $detalhe }
                            }
                            Write-Host "Consulta do usuário '$log' concluída!" -ForegroundColor Green
                        } else {
                            Write-Host "Nenhum grupo encontrado para o usuário '$log'." -ForegroundColor Yellow
                        }
                    } catch {
                        Write-Host "Erro no usuário '$log': $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
            Pause
        }
        "3.1" {
            $departamento = Read-Host "Favor informar o nome do Departamento"
            try {
                $usuariosDept = Get-ADUser -Filter "Department -eq '$departamento'"
                foreach ($usr in $usuariosDept) {
                    $detalhe = Obter-DetalhesUsuario -Usuario $usr.SamAccountName
                    if ($detalhe) { $resultados += $detalhe }
                }
                Write-Host "Consulta do departamento '$departamento' concluída!" -ForegroundColor Green
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "3.2" {
            $gestorLogin = Read-Host "Favor informar o Login do Gestor para buscar subordinados"
            try {
                $gestorDN = (Get-ADUser -Identity $gestorLogin).DistinguishedName
                $subordinados = Get-ADUser -Filter "Manager -eq '$gestorDN'"
                foreach ($usr in $subordinados) {
                    $detalhe = Obter-DetalhesUsuario -Usuario $usr.SamAccountName
                    if ($detalhe) { $resultados += $detalhe }
                }
                Write-Host "Consulta da gestão de '$gestorLogin' concluída!" -ForegroundColor Green
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "4.1" {
            $login = Read-Host "Favor informar Login"
            try {
                $detalhe = Obter-DetalhesUsuario -Usuario $login -IncluirUltimoLogin
                if ($detalhe) { 
                    $resultados += $detalhe 
                    $ultimoLogin = if ($detalhe.UltimoLogin) { ([datetime]$detalhe.UltimoLogin).ToString("dd/MM/yyyy HH:mm:ss") } else { "Nunca registrado" }
                    $ultimaTentativa = if ($detalhe.UltimaTentativaLogin) { ([datetime]$detalhe.UltimaTentativaLogin).ToString("dd/MM/yyyy HH:mm:ss") } else { "Nunca registrada" }
                    Write-Host "Último Login: $ultimoLogin" -ForegroundColor Cyan
                    Write-Host "Última Tentativa de Login: $ultimaTentativa" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "4.2" {
            $login = Read-Host "Favor informar Login"
            try {
                $detalhe = Obter-DetalhesUsuario -Usuario $login -IncluirResetSenha
                if ($detalhe) { 
                    $resultados += $detalhe 
                    $resetSenha = if ($detalhe.UltimoResetSenha) { ([datetime]$detalhe.UltimoResetSenha).ToString("dd/MM/yyyy HH:mm:ss") } else { "Nunca registrado" }
                    Write-Host "Último Reset de Senha: $resetSenha" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "4.3" {
            $login = Read-Host "Favor informar Login"
            try {
                $detalhe = Obter-DetalhesUsuario -Usuario $login -IncluirStatusBloqueio
                if ($detalhe) { 
                    $resultados += $detalhe 
                    Write-Host "Status de Bloqueio: $($detalhe.StatusBloqueio)" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause
        }
        "0" {
            Write-Host "Finalizando script e gerando relatório..." -ForegroundColor Yellow
        }
        default {
            Write-Host "Opção inválida, tente novamente." -ForegroundColor Red
            Pause
        }
    }
} while ($opcao -ne "0")

# --- EXPORTAÇÃO DINÂMICA ---
if ($resultados.Count -gt 0) {
    try {
        $todasPropriedades = $resultados | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name -Unique
        
        $colunasOrdenadas = @("Login", "Nome", "Cargo", "Departamento", "Gestor")
        
        foreach ($prop in $todasPropriedades) {
            if ($prop -notin $colunasOrdenadas) {
                $colunasOrdenadas += $prop
            }
        }
        
        $resultados | Select-Object $colunasOrdenadas | Export-Csv -Path $arquivoSaida -NoTypeInformation -Encoding UTF8 -Delimiter ";"
        
        Write-Host "Relatório gerado com sucesso em: $arquivoSaida" -ForegroundColor Green
        Write-Host "Colunas exportadas: $($colunasOrdenadas -join ', ')" -ForegroundColor Green
    } catch {
        Write-Host "ERRO ao exportar o arquivo CSV: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Nenhum dado foi coletado para exportar." -ForegroundColor Yellow
}
