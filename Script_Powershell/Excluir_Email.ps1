 $users = Import-Csv -Path "caminho" -Delimiter ";" -Encoding Default
 foreach $user in $users {
   Disable-Mailbox -Identity $user.NomedaColuna -Confirm:$false
   }
