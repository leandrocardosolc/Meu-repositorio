Clear-Host


$SamAccountName = @{l='LOGIN'; e={$_.SamAccountName}}
$name =  @{l='Nome'; e={$_.Name}}


$ous =  "unidade_organizacional"

foreach ($ou in $ous) {

 Get-ADUser -Filter {Enabled -eq $true} -Properties SamAccountName, Name -SearchBase $ou |
    Where-Object {($_.name -like "*ç*") -or $_.name -like "*á*" -or ($_.name -like "*ã*") -or ($_.name -like "*à*") -or ($_.name -like "*â*") `
    -or ($_.name -like "*é*") -or ($_.name -like "*ê*") -or ($_.name -like "*í*") -or ($_.name -like "*ú*") -or ($_.name -like "*ô*") -or ($_.name -like "*ó*") -or ($_.name -like "*õ*")} |
        Select-Object $SamAccountName, $name |
            Export-Csv -path "c:\temp\Nome_Acentuacao.csv" -Append -Force -Delimiter ";" -NoTypeInformation -Encoding UTF8

[System.GC]::GetTotalMemory('forcefullcollection') | Out-Null
[System.GC]::GetTotalMemory($true) | Out-Null
 
}