<# 
Script para identificar grupos (segurança e distribuição)
onde um usuário é owner (ManagedBy) no AD
#>

$user = "SamAccountName_do_usuario"

# Busca o usuário
$managedDN = (Get-ADUser -Identity $user).DistinguishedName

# Busca grupos onde o usuário é owner
Get-ADGroup -LDAPFilter "(managedBy=$managedDN)" -Properties ManagedBy, GroupCategory, DistinguishedName |
Select-Object @{Name='Grupo'; Expression={$_.SamAccountName}},
    	      @{Name='Categoria'; Expression={$_.GroupCategory}},
              @{Name='OU'; Expression={$_.DistinguishedName}},
              @{Name='Proprietario'; Expression={
        if ($_.ManagedBy) {
            ($_.ManagedBy -split ',')[0] -replace '^CN='
        }
        
    }} |
Export-Csv -Path "C:\Temp\$user-GroupsOwner.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
