<#/ Digitar o nome completo do usuário no variavel $user.
Caso possua o login retirar o campo -Filter {name -eq $user} e insera -Identity  /#>


$SamAccountName = @{l='Nome'; e={$_.SamAccountName}}
$GroupCategory = @{l='Categoria'; e={$_.GroupCategory}}
$ManagedBy = @{l='Proprietário'; e={$_.ManagedBy.split(',')[0].trim('CN=')}}


Get-ADGroup -LDAPFilter "(Managedby=*)" -Properties *| 
Where-Object {!(Get-ADUser -Identity $_.managedby).Enabled} |
Select-Object $SamAccountName, $GroupCategory, $ManagedBy |
Export-Csv -Path "c:\temp\GrupoOwnerDisabled.csv" -Append -Force -Delimiter ";" -Encoding UTF8 -NoTypeInformation
Clear-Variable -Name "managed", "user", "SamAccountName", "GroupCategory", "distinguishedName", "managedby"