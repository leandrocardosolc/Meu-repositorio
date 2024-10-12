Clear-host
Connect-ExchangeOnline

# Script para verificar login desativado com acesso ao em shared mailbox 
# Ambiente O365 porem funciona no ambiente onpremise

$shares = Get-Mailbox -Filter *  -ResultSize Unlimited | Where-Object {$_.RecipientTypeDetails -like "*SharedMailbox*"} 
$results=@();

foreach ($share in $shares){

$users = Get-MailboxPermission $share.PrimarySmtpAddress | Select-Object User -ea 0 

foreach ($user in $users){

$dados = Get-ADUser -Filter "UserPrincipalName -like '*$($user.User)*'" -Properties * | Where-Object {($_.Enabled -ne $true) -and ($_.DistinguishedName -like "*unidade_organizacional_desativados*")}
if ($dados -ne $null){

$myObject = [PSCustomObject]@{
  
  # atributos de acordo com a necessidade
  

}

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\SharedDesativados.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 

}
}
}
