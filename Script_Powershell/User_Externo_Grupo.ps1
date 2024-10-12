#Script para verificar email interno em grupo da instituição

$grupos = Get-DistributionGroup -ResultSize Unlimited | Select-Object Name
$results=@();
foreach ($grupo in $grupos){
$users = Get-DistributionGroupMember -Identity "$($grupo.name)" | Where-Object {$_.RecipientType -contains "MailContact"} | Select-Object PrimarySmtpAddress
foreach ($user in $users){

$myObject = [PSCustomObject] @{

 'Grupo' = $grupo.name
 'EMAIL' = $user.PrimarySmtpAddress

}

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\User_Externo.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
 
}
}