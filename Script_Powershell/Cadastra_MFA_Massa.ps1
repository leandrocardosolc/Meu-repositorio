Clear-Host

connect-graph
$users = Import-Csv -Path "caminho" -Delimiter ";" -Encoding Default

foreach ($user in $users){
if ($user.ColunaComTelefone -ne $null){
Write-Host "Não há telefone para cadastrado de MFA"
}else{

New-MgUserAuthenticationPhoneMethod -UserId "inserir UPN" -PhoneType "mobile" -PhoneNumber ("55" + $user.ColunaComTelefone)

}
}