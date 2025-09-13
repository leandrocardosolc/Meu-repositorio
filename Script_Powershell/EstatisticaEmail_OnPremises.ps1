

# Script para verificar dados de email ON PREMISES#
$mailboxes = Get-Mailbox -ResultSize Unlimited -RecipientTypeDetails UserMailbox
$results = @();
foreach ($mailbox in $mailboxes) {
    $stats = Get-MailboxStatistics -Identity $mailbox.Identity

    # Pasta Enviados (Sent Items)
    $sent = Get-MailboxFolderStatistics -Identity $mailbox.Identity |
            Where-Object { $_.Name -eq "Sent Items" }

    # Pasta Entrada (Inbox)
    $inbox = Get-MailboxFolderStatistics -Identity $mailbox.Identity |
             Where-Object { $_.Name -eq "Inbox" }

    $myObject = [PSCustomObject]@{
        DisplayName         = $mailbox.DisplayName
        UserPrincipalName   = $mailbox.UserPrincipalName
        LastLogonTime       = $stats.LastLogonTime
        TotalItemCount      = $stats.ItemCount
        TotalSizeMB         = [math]::Round(($stats.TotalItemSize.ToMB()), 2)
        IssueWarningQuotaMB = [math]::Round(($mailbox.IssueWarningQuota.ToMB()), 2)
        LastSentItem        = $sent.LastModifiedTime
        LastReceivedItem    = $inbox.LastModifiedTime
    }
$results += $myObject;
}
$results | Export-Csv -Path "C:\temp\Relatorio_Mailbox_OnPrem.csv" -NoTypeInformation -Encoding UTF8
