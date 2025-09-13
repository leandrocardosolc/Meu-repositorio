Clear-Host

# Script para verificar grupo dentro de grupo que traz insegurança no AD #

$groups = Get-ADGroup -Identity "SamAccountName do Grupo" | Select-Object SamAccountName
$results=@();
foreach ($group in $groups){

$members = Get-ADGroupMember -Identity $group.SamAccountName
foreach ($member in $members){

if ($member.distinguishedName -notlike "*OU De Grupos*"){
$dados = Get-ADUser -Identity $member.SamAccountName -Properties *
$myObject = [PSCustomObject]@{
    
  Login = $dados.SamAccountName
  # Inserir atributos do Usuário de acordo com a necessidade #
  Grupo = $group.SamAccountName
}
$results+= $myObject;
} else{
$subGroup = Get-ADGroup -Identity $member.SamAccountName
$subMembers = Get-ADGroupMember -Identity $subGroup.SamAccountName | Where-Obejct {
    $_.distinguishedName -notlike "*OU De Grupos*"
} foreach ($subMember in $subMembers){
$dados = Get-ADUser -Identity $member.SamAccountName -Properties *
$myObject = [PSCustomObject]@{
    
  Login = $dados.SamAccountName
  # Inserir atributos do Usuário de acordo com a necessidade #
  Grupo = "$($group.SamAccountName) / $($subGroup.SamAccountName)"
} 
$results+= $myObject;
}
}
}
}

$results | Export-csv -path "c:\temp\Nome Arquivo.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
