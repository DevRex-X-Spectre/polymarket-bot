$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$research = Join-Path $root "research"
$venvPython = Join-Path $research ".venv\Scripts\python.exe"
if (Test-Path $venvPython) {
  $pythonExe = $venvPython
} else {
  $python312 = "C:\Users\MY PC\AppData\Local\Programs\Python\Python312\python.exe"
  if (Test-Path $python312) {
    $pythonExe = $python312
  } else {
    $pythonExe = "python"
  }
}

Set-Location $research
& $pythonExe -m pytest
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
