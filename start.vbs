Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
objShell.CurrentDirectory = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.Run "taskkill /f /im node.exe", 0, True
objShell.Run "taskkill /f /im ngrok.exe", 0, True
objShell.Run "node server.js", 0, False
objShell.Run "node tunnel.js", 0, False
