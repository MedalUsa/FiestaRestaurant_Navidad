param(
    [string]$Zip = (Join-Path (Join-Path $env:USERPROFILE "Downloads") "Fiesta-Landing-Figma.zip")
)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
$root = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0) { throw "Esta carpeta debe ser la raiz de tu repositorio Git." }
if ((Resolve-Path -LiteralPath $root).Path -ne (Resolve-Path -LiteralPath ".").Path) {
    throw "Extrae el ZIP en la raiz del repositorio."
}
$branch = git branch --show-current
if ($LASTEXITCODE -ne 0 -or $branch -ne "main") { throw "Cambia a main antes de publicar." }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Zip).Path)
try {
    $paths = @($archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName })
} finally {
    $archive.Dispose()
}
if ($paths.Count -eq 0 -or $paths -notcontains "src/main.tsx") {
    throw "El archivo debe ser Fiesta-Landing-Figma.zip."
}
git --literal-pathspecs add -- @paths
if ($LASTEXITCODE -ne 0) { throw "No se pudieron preparar los archivos del ZIP." }
git --literal-pathspecs diff --cached --quiet -- @paths
$diffResult = $LASTEXITCODE
if ($diffResult -eq 1) {
    git --literal-pathspecs commit --only -m "Implementa la carta navidena de Fiesta segun el prototipo aprobado" -- @paths
    if ($LASTEXITCODE -ne 0) { throw "Git no pudo crear el commit." }
} elseif ($diffResult -ne 0) {
    throw "Git no pudo revisar los cambios."
}
git push origin main
if ($LASTEXITCODE -ne 0) { throw "El push no termino. Tu commit sigue en main local. Revisa el mensaje de Git." }
git log -1 --oneline
