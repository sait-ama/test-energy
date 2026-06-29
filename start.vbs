Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
objShell.CurrentDirectory = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.Run "taskkill /f /im node.exe", 0, True
objShell.Run "taskkill /f /im ngrok.exe", 0, True
objShell.Run "node server.js", 0, False
objShell.Run "cmd /c npx.cmd ngrok http 3000 --url=patrina-unlusty-vince.ngrok-free.dev", 0, False
