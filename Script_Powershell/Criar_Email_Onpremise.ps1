$session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri urlservidor  -Authentication Kerberos
	
Import-Pssession $Session

$login = ""

Enable-Mailbox -Identity $login -Alias $login -PrimarySmtpAddress "$($login)@dominio"
Set-CASMailbox -Identity $login -ActiveSyncEnabled $false

#Em caso de politica e configurações inserir Set-Mailx $login -'Nome da politica/configuração'#
