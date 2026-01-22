$users = Import-Csv -Path "caminho" -Delimiter ";" -Encoding Default

foreach ($user in $users) {
ForEach-Object {
Set-ADAccountPassword -Identity $user.NomedaColuna -NewPassword (ConvertTo-SecureString $user.ColunaSenha -AsPlainText -Force) -Reset
Set-ADUser $user.login -Enabled $true  
Set-ADUser $user.login -ChangePasswordAtLogon $true
}
}