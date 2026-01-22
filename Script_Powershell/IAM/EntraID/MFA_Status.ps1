$users = Import-Csv -Path "C:\temp\Nome do arquivo" -Delimiter ";" -Encoding Default

$results=@();
Write-Host  "Users $($users.Count) encontrado" -ForegroundColor White ;
#loop through each user account
foreach ($user in $users) {

Write-Host  "$($user.UserPrincipalName)";
$myObject = [PSCustomObject]@{
    user               = "-"
    MFAstatus          = "_"
    email              = "-"
    fido2              = "-"
    app                = "-"
    password           = "-"
    phone              = "-"
    softwareoath       = "-"
    tempaccess         = "-"
    hellobusiness      = "-"
}

$MFAData=Get-MgUserAuthenticationMethod -UserId $user.UserPrincipalName -ErrorAction SilentlyContinue

$myobject.user = $user.UserPrincipalName;

    ForEach ($method in $MFAData) {
	
        Switch ($method.AdditionalProperties["@odata.type"]) {
          "#microsoft.graph.emailAuthenticationMethod"  { 
             $myObject.email = $true 
             $myObject.MFAstatus = "Enabled"
          } 
          "#microsoft.graph.fido2AuthenticationMethod"                   { 
            $myObject.fido2 = $true 
            $myObject.MFAstatus = "Enabled"
          }    
          "#microsoft.graph.microsoftAuthenticatorAuthenticationMethod"  { 
            $myObject.app = $true 
            $myObject.MFAstatus = "Enabled"
          }    
          "#microsoft.graph.passwordAuthenticationMethod"                {              
                $myObject.password = $true 
                 if($myObject.MFAstatus -ne "Enabled")
                {
                    $myObject.MFAstatus = "Disabled"
                }                
           }     
           "#microsoft.graph.phoneAuthenticationMethod"  { 
            $myObject.phone = $true 
            $myObject.MFAstatus = "Enabled"
          }   
            "#microsoft.graph.softwareOathAuthenticationMethod"  { 
            $myObject.softwareoath = $true 
            $myObject.MFAstatus = "Enabled"
          }           
            "#microsoft.graph.temporaryAccessPassAuthenticationMethod"  { 
            $myObject.tempaccess = $true 
            $myObject.MFAstatus = "Enabled"
          }           
            "#microsoft.graph.windowsHelloForBusinessAuthenticationMethod"  { 
            $myObject.hellobusiness = $true 
            $myObject.MFAstatus = "Enabled"
          }                   
        }
    }

  

$results+= $myObject;
$results | Export-Csv -Path "c:\temp\nome do arquivo.csv" -Delimiter ";" -Encoding UTF8 -NoTypeInformation
}
