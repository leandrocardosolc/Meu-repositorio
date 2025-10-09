$users = #Usar o Get ADUser ou Import-csv com a coluna de nome SamAccountName#
$results = @();
 
foreach ($user in $users){
 
$dados = Get-ADuser -Identity $user.SamAccountName -properties UserPrincipalName, Manager | Select-Object SamAccountName, Name, Manager, UserPrincipalName
$upn = $dados.UserPrincipalName
 
 
    $azureGroups = Get-AzureADUserMembership -ObjectId $upn -ErrorAction SilentlyContinue | Where-Object {$_.OnPremisesSecurityIdentifier -eq $null -and $_.ObjectType -eq "Group" -and $_.DisplayName -notlike "*All Users*"}
    $azureRoles = Get-AzureADUserMembership -ObjectId $upn -ErrorAction SilentlyContinue | Where-Object {$_.ObjectType -eq "Role" }
    $appRoles = Get-AzureADUserAppRoleAssignment -ObjectId $upn -ErrorAction SilentlyContinue | Where-Object {$_.PrincipalDisplayName -match "$($dados.SamAccountName)"}
 
   
    if (($azureGroups.Count -gt 0) -or ($azureRoles.Count -gt 0) -or ($appRoles.Count -gt 0)) {
 
        foreach ($group in $azureGroups) {
            $results += [PSCustomObject]@{
                Login_AD      = $dados.SamAccountName
                Nome          = $dados.Name
                UPN           = $upn
                TipoPermissao = "Grupo"
                NomePermissao = $group.DisplayName
                Id            = $group.ObjectId
                Descricao     = $group.Description
            }
        }
 
        foreach ($role in $azureRoles) {
            $results += [PSCustomObject]@{
                Login_AD      = $dados.SamAccountName
                Nome          = $dados.Name
                UPN           = $upn
                TipoPermissao = "Role"
                NomePermissao = $role.DisplayName
                Id            = $role.ObjectId
                Descricao     = $role.Description
            }
        }
 
        foreach ($appRole in $appRoles) {
            $results += [PSCustomObject]@{
                Login_AD      = $dados.SamAccountName
                Nome          = $dados.Name
                UPN           = $upn
                TipoPermissao = "AppRole"
                NomePermissao = $appRole.ResourceDisplayName
                Id            = $appRole.Id
                Descricao     = "App Azure AD"
            }
        }
    }
}
 
# Exportar o resultado
$results | Export-Csv -Path "C:\Temp\Azure.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
 
