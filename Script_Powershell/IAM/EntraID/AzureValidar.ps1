#< Esse script validar se o user tem MFA cadastrado caso não tenha te retorna com os dados, 
tambem verificado que usa instituição tenha grupo de bloqueio de não pertence aos grupos >#

Clear-Host
Connect-Graph


$groups = @(
 "DistinguishedName do grupo"
)

$ous = (Get-ADOrganizationalUnit -Filter * -SearchBase "unidade_organizacional").DistinguishedName
$ous = $ous[2..($ous.Length - 1)]



@(
    [PSCustomObject]@{
        user          = ''
        MFAstatus     = ''
        email         = $false
        fido2         = $false
        app           = $false
        password      = $false
        phone         = $false
        softwareoath  = $false
        tempaccess    = $false
        hellobusiness = $false
    }
) | Select-Object * | Export-Csv -Path "C:\temp\SemMFACadastrado.csv" -NoTypeInformation -Delimiter ';' -Encoding UTF8

foreach ($ou in $ous) {

    Write-Host "Processando OU: $ou" -ForegroundColor Cyan

    # Pega usuários habilitados na OU
    $allUsers = Get-ADUser -Filter {Enabled -eq $true} -Properties memberof -SearchBase $ou

    foreach ($user in $allUsers) {

       
        $userGroups = $user.MemberOf
        if ($groups | Where-Object { $userGroups -contains $_ }) {
           
            continue
        }

        Write-Host "Verificando MFA do usuário $($user.UserPrincipalName)..."

        # Inicializa objeto para o resultado
        $myObject = [PSCustomObject]@{
            user          = $user.UserPrincipalName
            Login         = $user.SamAccountName
            MFAstatus     = "Disabled"
            email         = $false
            fido2         = $false
            app           = $false
            password      = $false
            phone         = $false
            softwareoath  = $false
            tempaccess    = $false
            hellobusiness = $false
        }

        # Pega métodos MFA via Microsoft Graph
        $MFAData = Get-MgUserAuthenticationMethod -UserId $user.UserPrincipalName -ErrorAction SilentlyContinue

        if ($MFAData) {
            foreach ($method in $MFAData) {
                switch ($method.AdditionalProperties["@odata.type"]) {
                    "#microsoft.graph.emailAuthenticationMethod"               { $myObject.email = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.fido2AuthenticationMethod"                { $myObject.fido2 = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.microsoftAuthenticatorAuthenticationMethod" { $myObject.app = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.passwordAuthenticationMethod"              { $myObject.password = $true }
                    "#microsoft.graph.phoneAuthenticationMethod"                 { $myObject.phone = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.softwareOathAuthenticationMethod"          { $myObject.softwareoath = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.temporaryAccessPassAuthenticationMethod"   { $myObject.tempaccess = $true; $myObject.MFAstatus = "Enabled" }
                    "#microsoft.graph.windowsHelloForBusinessAuthenticationMethod" { $myObject.hellobusiness = $true; $myObject.MFAstatus = "Enabled" }
                }
            }
        }

        # Se MFA desabilitado, exporta diretamente para CSV (append)
        if ($myObject.MFAstatus -eq "Disabled") {
            $myObject | Export-Csv -Path "C:\temp\SemMFACadastrado.csv" -NoTypeInformation -Append -Delimiter ';' -Encoding UTF8
            Write-Host "Usuário $($user.UserPrincipalName) SEM MFA cadastrado." -ForegroundColor Yellow
        }
    }
}
