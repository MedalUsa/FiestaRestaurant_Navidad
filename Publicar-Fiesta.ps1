param([string]$Zip = (Join-Path $env:USERPROFILE 'Downloads\Fiesta-Navidad-Final.zip'))

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Check-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "Fallo en $Step. Revisa la salida anterior." }
}

$branch = git symbolic-ref --short HEAD
Check-Exit 'Git'
if ($branch -ne 'main') { throw 'Ejecuta este script desde la rama main.' }
git remote get-url origin | Out-Null
Check-Exit 'origin'

# Stage only the paths shipped in the downloaded archive.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Zip).Path)
try {
    $files = @($archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName })
} finally { $archive.Dispose() }

npm.cmd ci
Check-Exit 'npm ci'
npm.cmd run build
Check-Exit 'npm run build'

git add -- @files
Check-Exit 'git add'
git diff --cached --quiet -- @files
if ($LASTEXITCODE -eq 1) {
    git commit --only -m "Completa la carta de Fiesta y ajusta las transiciones" -- @files
    Check-Exit 'git commit'
} elseif ($LASTEXITCODE -ne 0) {
    throw 'No se pudo verificar el contenido del commit.'
}
git push origin main
Check-Exit 'git push'
