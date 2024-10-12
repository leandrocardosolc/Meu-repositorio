#Enviar como#

Add-RecipientPermission -Identity "sharebox" -Trustee "Mailbox User" -AccessRights SendAs

#Acesso total#

Add-MailboxPermission -Identity "sharebox" -User "Mailbox User" -AccessRights FullAccess -InheritanceType All