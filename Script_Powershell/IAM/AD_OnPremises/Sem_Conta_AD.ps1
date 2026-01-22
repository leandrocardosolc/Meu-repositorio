$users = Import-Csv -Path "C:\temp\Planilha com login de sistemas corpotativos.csv" -Delimiter ";" -Encoding Default
$loginsInex = @()
foreach ($user in $users){

try {
 
 $usuario = Get-ADUser $user.Login -ErrorAction Stop

} catch {

 $loginsInex += $user.Login

}

} 

$loginsInex | export-csv -Path "c:\temp\Sem_Conta_No_AD.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation

