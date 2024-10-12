Clear-Host

# Script para verificar grupo dentro de grupo que traz insegurança no AD #

$groups = Get-ADGroup -Identity "SamAccountName do Grupo" | Select-Object SamAccountName
$results=@();
foreach ($group in $groups){

$users = Get-ADGroupMember -Identity $group.SamAccountName | Where-Object {$_.distinguishedName -notlike "*unidade_organizicional*"} | Select-Object SamAccountName
foreach ($user in $users){

if ($user -ne $null){
$dados = Get-ADUser -Identity $user.SamAccountName -Properties *
$myObject = [PSCustomObject]@{
    
  Login = $dados.SamAccountName
  # Inserir atributos do Usuário de acordo com a necessidade #
  Grupo = $group.SamAccountName
}

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\Nome do Grupo Principal.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 
}
}

$membergroups = Get-ADGroupMember -Identity $group.SamAccountName | Where-Object {$_.distinguishedName -like "*unidade_organizicional*"}
foreach ($membergroup in $membergroups) {

$grupotwo = Get-ADGroup -Identity $membergroup.SamAccountName
$members = Get-ADGroupMember -Identity $grupotwo.SamAccountName | Where-Object {$_.distinguishedName -notlike "*unidade_organizicional*"} | Select-Object SamAccountName
foreach ($member in $members){

$dados = Get-ADUser -Identity $member.SamAccountName -Properties *
$myObject = [PSCustomObject]@{
  
  Login = $dados.SamAccountName
  # Inserir atributos do Usuário de acordo com a necessidade #
  Grupo = $group.SamAccountName + ("/") + $grupotwo.SamAccountName

}

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\Nome do Grupo Principal.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation 
}
}
}