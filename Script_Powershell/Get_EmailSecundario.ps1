Get-ADUser 'login' -Properties * | 
Select-Object name, mail, whencreated, SamAccountName, @{Name='proxyddresses';Expression={$_.proxyAddresses -join ';'}} | 
Export-Csv -Path "c:\temp\emailsecudrario.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
