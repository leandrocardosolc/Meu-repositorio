Clear-Host
# Script para verificar login desativado com grupo no Azure/AD 

$users = Get-ADUser -Filter {Enabled -ne $true} -SearchBase "unidade_organizacional_desativados"
$results = @();
foreach ($user in $users){
$distinguishedName = $user.distinguishedName.split(',')[1].split('=')[1]
$azuregroups = Get-AzureADUserMembership -ObjectId "$($user.UserPrincipalName)" | Where-Object {$_.OnPremisesSecurityIdentifier -eq $null}  |Select-Object ObjectId, DisplayName

foreach ($azuregroup in $azuregroups){

$loginazure = Get-AzureADUser -ObjectId "$($user.UserPrincipalName)" | Select-Object ObjectId

$myObject = [PSCustomObject]@{
  
  #atributos de acordo com a necessidade
  #remoção / adição precisa ser realizado pelo ID
 
}

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\AzureAD_Disabled.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 

}
}