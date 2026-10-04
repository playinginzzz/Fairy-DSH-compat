# ASCII-only normalizer for this repo's text files.
#
# Repo conventions (verified against git HEAD):
#   * .ps1 / .psm1  -> UTF-8 **with** BOM, LF endings
#     (PowerShell 5.1 + CP936 console mis-decodes a BOM-less UTF-8 .ps1,
#      turning Chinese text into mojibake and breaking the parser)
#   * everything else -> UTF-8 **without** BOM, LF endings
#
# Why this exists: several editing tools silently strip the BOM or rewrite
# line endings to CRLF. Both corrupt this repo. Run this after any bulk edit:
#   pwsh -File tools\normalize-encoding.ps1            # report only
#   pwsh -File tools\normalize-encoding.ps1 -Fix       # normalize
param(
  [string]$Root = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)),
  [switch]$Fix
)

$ErrorActionPreference = 'Stop'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$utf8Bom   = [System.Text.UTF8Encoding]::new($true)

$exts = @('.md', '.ps1', '.psm1', '.js', '.mjs', '.cjs', '.json', '.yml', '.yaml', '.txt', '.cmd', '.bat', '.gitattributes', '.gitignore')
$bomExts = @('.ps1', '.psm1')

$files = Get-ChildItem -LiteralPath $Root -Recurse -File |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\snapshots\\|\\release\\' -and
    ($exts -contains $_.Extension.ToLower() -or $_.Name -in @('.gitattributes', '.gitignore'))
  }

$rows = @()
foreach ($f in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $bom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $crlf = 0
  for ($i = 0; $i -lt $bytes.Length; $i++) { if ($bytes[$i] -eq 10 -and $i -gt 0 -and $bytes[$i - 1] -eq 13) { $crlf++ } }

  $wantBom = $bomExts -contains $f.Extension.ToLower()
  $problems = @()
  if ($bom -ne $wantBom) { $problems += $(if ($wantBom) { 'MISSING_BOM' } else { 'UNWANTED_BOM' }) }
  if ($crlf -gt 0) { $problems += "CRLF($crlf)" }

  if ($problems.Count -gt 0 -and $Fix) {
    # Decode with the encoding implied by the current BOM state, then write back normalized.
    $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.UTF8Encoding]::new($bom))
    $text = $text.Replace("`r`n", "`n").Replace("`r", "`n")
    [System.IO.File]::WriteAllText($f.FullName, $text, $(if ($wantBom) { $utf8Bom } else { $utf8NoBom }))
    $problems = @('FIXED')
  }

  if ($problems.Count -gt 0) {
    $rows += [pscustomobject]@{ Status = ($problems -join ','); Path = $f.FullName.Substring($Root.Length).TrimStart('\') }
  }
}

if ($rows.Count -eq 0) {
  Write-Output "OK: all $($files.Count) text file(s) match repo encoding conventions (LF; BOM only on .ps1/.psm1)."
} else {
  Write-Output "=== encoding deviations ($($rows.Count) file(s)) ==="
  $rows | Sort-Object Path | ForEach-Object { "{0,-22} {1}" -f $_.Status, $_.Path }
}
