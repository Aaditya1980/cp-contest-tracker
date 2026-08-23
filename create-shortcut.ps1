$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "CodePulse CP Tracker.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "C:\Users\Administrator\.gemini\antigravity\scratch\contest-tracker\launch-app.bat"
$shortcut.WorkingDirectory = "C:\Users\Administrator\.gemini\antigravity\scratch\contest-tracker"
$shortcut.WindowStyle = 1
$shortcut.Description = "Launch CodePulse CP Contest Tracker Desktop App"
$shortcut.Save()
Write-Host "Desktop shortcut created successfully at: $shortcutPath"
