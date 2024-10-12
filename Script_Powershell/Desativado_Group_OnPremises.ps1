Clear-Host
# Script para verificar users que não possui ao grupo de segurança
# Inserir nome do grupo de segurança na variavel $group

$group = "SamAccountName Groupo" 

$SamAccountName = @{l='LOGIN'; e={$_.SamAccountName}}
# inserir atributos de acordo com a necessidade

$groups = Get-ADGroup $group | Select-Object distinguishedName
$ous = unidades_organizacionais

foreach ($ou in $ous) {
ForEach-Object {
 Get-ADUser -Filter {Enabled -eq $true} -Properties * -SearchBase $ou |
    Where-Object {($groups.distinguishedName -notin $_.memberof)} |
        Select-Object $SamAccountName, ... |
            Export-Csv -path "c:\temp\$($group).csv" -Append -Force -Delimiter ";" -NoTypeInformation -Encoding UTF8

[System.GC]::GetTotalMemory('forcefullcollection') | Out-Null
[System.GC]::GetTotalMemory($true) | Out-Null
}
}