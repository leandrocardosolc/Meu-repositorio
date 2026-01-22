Clear-Host
Connect-ExchangeOnline

$shares = Get-Mailbox -Filter * -ResultSize Unlimited | Where-Object {$_.RecipientTypeDetails -like "*SharedMailbox*"} 
$results = @()

foreach ($share in $shares) {
    
    # ----- Enviar Como -----
    $sendAsPerms = Get-RecipientPermission $share.PrimarySmtpAddress -ErrorAction SilentlyContinue | 
        Where-Object { $_.AccessControlType -eq "Allow" -and $_.Trustee -ne "NT AUTHORITY\SELF" } |
        Select-Object Trustee

    # ----- Acesso Total -----
    $fullAccessPerms = Get-MailboxPermission $share.Identity -ErrorAction SilentlyContinue | 
        Where-Object { $_.AccessRights -contains "FullAccess" -and $_.User -ne "NT AUTHORITY\SELF" } |
        Select-Object @{Name='Trustee';Expression={$_.User}}

    # ----- Combina permissões -----
    $allUsers = @{}
    
    foreach ($p in $sendAsPerms) {
        $key = $p.Trustee.ToString()
        if (-not $allUsers.ContainsKey($key)) {
            $allUsers[$key] = @("Enviar como")
        } else {
            $allUsers[$key] += "Enviar como"
        }
    }

    foreach ($p in $fullAccessPerms) {
        $key = $p.Trustee.ToString()
        if (-not $allUsers.ContainsKey($key)) {
            $allUsers[$key] = @("Acesso total")
        } else {
            $allUsers[$key] += "Acesso total"
        }
    }

    # ----- Verifica contas desativadas -----
    foreach ($userKey in $allUsers.Keys) {
        $dados = Get-ADUser -Filter "UserPrincipalName -eq '$($userKey)'" -Properties * -ErrorAction SilentlyContinue |
                 Where-Object {($_.Enabled -ne $true) -and ($_.DistinguishedName -like "*OU=Disabled Accounts*")}

        if ($dados -ne $null) {
            $tipoAcesso = ($allUsers[$userKey] | Sort-Object -Unique) -join " e "

            $myObject = [PSCustomObject]@{
                Login          = $dados.SamAccountName
                Nome           = $dados.Name
                UPN            = $dados.UserPrincipalName
                Caixa_Setorial = $share.Identity
                Setorial_Email = $share.PrimarySmtpAddress 
                Tipo_Acesso    = $tipoAcesso
            }

            $results += $myObject
        }
    }
}

# ----- Exporta o resultado consolidado -----
$results | Export-Csv -Path "C:\Temp\Setorial Desativados.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation

Write-Host "Relatório gerado em C:\Temp\Setorial Desativados.csv" -ForegroundColor Green
