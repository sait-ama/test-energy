Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
objShell.CurrentDirectory = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.Run "node server.js", 0, False
objShell.Run "cmd /c npx.cmd ngrok http 3000", 0, False
