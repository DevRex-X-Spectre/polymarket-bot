$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$research = Join-Path $root "research"
$python = Get-Command python3.12 -ErrorAction SilentlyContinue
if (-not $python) {
  $python312 = "C:\Users\MY PC\AppData\Local\Programs\Python\Python312\python.exe"
  if (Test-Path $python312) {
    $pythonExe = $python312
  } else {
    throw "Python 3.12 is required for the research environment."
  }
} else {
  $pythonExe = $python.Source
}

$venv = Join-Path $research ".venv"
if (-not (Test-Path $venv)) {
  & $pythonExe -m venv $venv
}

$venvPython = Join-Path $venv "Scripts\python.exe"
& $venvPython -m pip install -U pip
& $venvPython -m pip install -e "$research[dev]"
Write-Output "Research environment ready: $venvPython"
