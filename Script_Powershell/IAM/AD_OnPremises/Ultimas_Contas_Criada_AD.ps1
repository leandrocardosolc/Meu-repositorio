#Alterar data do campos Month e Day
$startDate = (Get-Date -Year 2023 -Month 3 -Day 31).Date
$endDate   = (Get-Date).Date.AddDays(3)


#Atributos de acordo com a necessidade
$SamAccountName = @{l='LOGIN'; e={$_.SamAccountName}}


Get-ADUser -Filter 'Created -gt $startDate -and Created -le $endDate' -Properties * | 
 Where-Object {$_.Description -like "*DRT*"} | 
   Select-Object $SamAccountName |
      Export-Csv -path "c:\temp\Base_Account.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation