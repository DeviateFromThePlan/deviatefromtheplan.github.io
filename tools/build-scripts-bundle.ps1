# Builds assets/tampermonkey-scripts.zip from a Tampermonkey export, for one-step
# "Import from URL" on the restore page.
#
#   .\tools\build-scripts-bundle.ps1 -Backup "C:\path\to\tampermonkey-backup-chrome-....zip"
#
# Removes every *.storage.json (script data, e.g. the GitHub token in Site Stats Sync)
# and any scripts listed in -Exclude. Script code and Tampermonkey options are kept, so
# each script still auto-updates from its own @updateURL after import.
param(
  [Parameter(Mandatory)] [string] $Backup,
  [string[]] $Exclude = @('WME Send to Discord')   # replaced by "WME Send to Discord (Reloaded)"
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'assets\tampermonkey-scripts.zip'
$work = Join-Path ([IO.Path]::GetTempPath()) ("tm-bundle-" + [guid]::NewGuid())

Expand-Archive -LiteralPath $Backup -DestinationPath $work
try {
  Get-ChildItem $work -Filter '*.storage.json' | Remove-Item
  foreach ($name in $Exclude) {
    # Exact script name: "<name>.user.js", "<name>.options.json", "<name>.user.js-<hash>-<lib>"...
    Get-ChildItem $work | Where-Object { $_.Name.StartsWith("$name.") } | Remove-Item
  }
  $scripts = (Get-ChildItem $work -Filter '*.user.js').Count
  if (Test-Path $out) { Remove-Item $out }
  Compress-Archive -Path (Join-Path $work '*') -DestinationPath $out
  "Wrote $out ($scripts scripts, {0:N0} KB)" -f ((Get-Item $out).Length / 1KB)
} finally {
  Remove-Item $work -Recurse -Force
}
