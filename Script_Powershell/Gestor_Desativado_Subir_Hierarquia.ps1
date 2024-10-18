Clear-Host

Write-Host "Script em execução ..."

$ous = "unidadeorganizacional"

$results=@();
foreach ($ou in $ous){

$users = Get-ADUser -Filter * -SearchBase $ou -Properties manager,Department,Title | Where-Object {$_.Manager -like "*unidadeorganizacionaldesativado*"}
 [System.GC]::GetTotalMemory('forcefullcollection') | Out-Null
 [System.GC]::GetTotalMemory($true) | Out-Null

foreach ($user in $users) {
$login = (Get-ADUser $user -Properties manager,Department,Title)
$manager = Get-aduser $login.Manager 
$ajuste = (Get-ADUser -Filter * -SearchBase $ou -Properties manager,Department,Title  | Where-Object {$_.Name -like "*$($manager.Name)*"}).SamAccountName
$myObject = [PSCustomObject]@{

"Status Conta" = $login.Enabled
"Login" = $login.SamAccountName
"Nome" = $login.Name
"Cargo" = $login.Title
"Departamento" = $login.Department
"Gestor Desativado" = $login.manager.split(',')[0].trim('CN=')
"Gestor Correto" = $ajuste

}
$results+= $myObject;
$results | Export-Csv -Path "caminho" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 
}
}