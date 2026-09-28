# Will's Latin Cards - static-file watchdog (scheduled task, runs as the logged-on user, no elevation).
# Same pattern as the other Doggett-* watchdogs. If http://127.0.0.1:8600/ does not answer, restart it.
$ErrorActionPreference = 'SilentlyContinue'
$root = 'C:\Doggett-Curated\latin-quiz'
$log  = "$root\watchdog.log"
function Log($m) { Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) }

$healthy = $false
try { $r = Invoke-WebRequest http://127.0.0.1:8600/ -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { $healthy = $true } } catch {}
if ($healthy) { exit 0 }

$stale = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -match 'latin-quiz' }
foreach ($p in $stale) { Stop-Process -Id $p.ProcessId -Force; Log "killed stale server pid $($p.ProcessId)" }

$proc = Start-Process -FilePath python -ArgumentList '-m','http.server','8600','--bind','0.0.0.0','--directory',$root `
        -WorkingDirectory $root -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput "$root\server_stdout.log" -RedirectStandardError "$root\server_stderr.log"
Log "started server pid $($proc.Id)"
