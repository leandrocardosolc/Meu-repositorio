$users = Get-ADUser -Filter {Enabled -ne $true} -SearchBase "DC=br" -properties memberof | Where-Object {$_.SamAccountName -notlike "*admin*"} |Select-Object SamAccountName
$results=@();

foreach ($user in $users) {
$user.memberof | Foreach-Object {
$groupname = (Get-ADObject $_).Name

$myObject = [PSCustomObject]@{
 
 'Login' = $user.SamAccountName
 'Nome' = $user.Name
Status = $user.Enabled
 'GrupoAD' = $groupname 
 
}
$results+= $myObject;
$results | Export-Csv -Path "c:\temp\DESATIVADOS GROUPS.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 
}
}
