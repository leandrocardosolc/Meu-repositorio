#Script para validar user com dois grupos (duplicadade de grupo)

$ous = "unidades_organizacional"
$group1 = "Inserir nome do grupo"
$group2 = "Inserir nome do grupo"


foreach ($ou in $ous){

Get-aduser -filter * -Properties * -SearchBase $ou |
Where-Object {($PSItem.memberof -like "*$($group1)*") -and ($PSItem.memberof -like "*$($group2)*")} |
Select-Object SamAccountName, @{l='Group';e={$_.memberof.where({$_ -like "*$($group2)*"}).split(",")[0].trim('CN=') -join ";"}} |
Export-Csv -Path "caminho.csv" -Delimiter ";" -Append -Force -NoTypeInformation -Encoding UTF8
 
}
