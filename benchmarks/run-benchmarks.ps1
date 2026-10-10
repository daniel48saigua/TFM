<#
.SYNOPSIS
  Mediciones experimentales Micronaut vs Spring Boot.

.DESCRIPTION
  Ejecuta, para cada framework y con los JAR ya compilados:
    1. Tiempo de arranque (N arranques, tiempo hasta la primera respuesta HTTP 200).
    2. Memoria en reposo (proceso, heap, metaspace, memoria nativa, clases, hilos) con jcmd.
    3. Pruebas de carga con k6 (respuesta pequeña y grande, varios niveles de usuarios,
       varias repeticiones, con calentamiento previo) muestreando CPU y memoria del proceso.
    4. Una grabación de Java Flight Recorder durante la carga más exigente.
  Guarda todo en benchmarks/results/<fecha>/ y genera summary.json con los resúmenes.

  Antes de ejecutarlo:
    - PostgreSQL en marcha con la base de datos tfm_micronaut (ver database/).
    - JAR compilados:  Micronaut/tfm> gradlew shadowJar    Spring/tfm-spring> gradlew bootJar
    - Puertos 8080 y 8081 libres. Cerrar programas pesados y no usar el equipo durante la prueba.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File benchmarks\run-benchmarks.ps1
  powershell -ExecutionPolicy Bypass -File benchmarks\run-benchmarks.ps1 -Quick   # prueba rápida del script
#>
param(
    [int]$StartupRuns = 10,
    [int]$Reps = 3,
    [int[]]$Vus = @(10, 50, 100),
    [string]$Duration = '30s',
    [string]$WarmupDuration = '15s',
    [int]$CooldownSeconds = 5,
    [string[]]$Frameworks = @('micronaut', 'spring'),
    [switch]$Quick
)

$ErrorActionPreference = 'Stop'
if ($Quick) { $StartupRuns = 2; $Reps = 1; $Vus = @(10); $Duration = '5s'; $WarmupDuration = '3s'; $CooldownSeconds = 1 }

$root = Split-Path -Parent $PSScriptRoot
$jvmOptions = @('-Xmx512m', '-XX:+UseG1GC')
$apps = @{
    micronaut = @{ name = 'Micronaut';   port = 8080; jar = "$root\Micronaut\tfm\build\libs\tfm-0.1-all.jar";
                   startupPattern = 'Startup completed in (\d+)ms'; startupUnit = 'ms' }
    spring    = @{ name = 'Spring Boot'; port = 8081; jar = "$root\Spring\tfm-spring\build\libs\tfm-spring-0.0.1-SNAPSHOT.jar";
                   startupPattern = 'Started \w+ in ([\d.]+) seconds'; startupUnit = 's' }
}
$endpoints = @(
    @{ key = 'small'; path = '/api/teams/1'; label = 'Respuesta pequeña (1 equipo)' },
    @{ key = 'large'; path = '/api/teams';   label = 'Respuesta grande (1000 equipos)' }
)

$javaExe = (Get-Command java).Source
$javaBin = Split-Path -Parent $javaExe
$jcmd = Join-Path $javaBin 'jcmd.exe'
$jfrTool = Join-Path $javaBin 'jfr.exe'
$k6Script = Join-Path $PSScriptRoot 'k6\load-test.js'

$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm'
if ($Quick) { $stamp = "$stamp`_quick" }
$outDir = Join-Path $PSScriptRoot "results\$stamp"
$rawDir = Join-Path $outDir 'raw'
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

Add-Type -AssemblyName System.Net.Http
$http = New-Object System.Net.Http.HttpClient
$http.Timeout = [TimeSpan]::FromSeconds(5)

function Log($msg) { Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $msg) }

function Assert-PortFree($port) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) {
        throw "El puerto $port está ocupado. Detén la aplicación que lo usa antes de medir."
    }
}

function Test-Ok($url) {
    try { return ($http.GetAsync($url).Result.StatusCode -eq 200) } catch { return $false }
}

# Arranca la aplicación y devuelve el proceso y el tiempo hasta la primera respuesta 200.
function Start-App($key, [string[]]$extraJvm, $logName) {
    $app = $apps[$key]
    Assert-PortFree $app.port
    $log = Join-Path $rawDir "$logName.log"
    $javaArgs = @($jvmOptions + $extraJvm + @('-jar', "`"$($app.jar)`""))
    $watch = [Diagnostics.Stopwatch]::StartNew()
    $proc = Start-Process -FilePath $javaExe -ArgumentList $javaArgs -RedirectStandardOutput $log `
        -RedirectStandardError "$log.err" -PassThru -WindowStyle Hidden
    $url = "http://localhost:$($app.port)/api/teams/1"
    while (-not (Test-Ok $url)) {
        if ($proc.HasExited) { throw "$($app.name) terminó al arrancar. Revisa $log" }
        if ($watch.Elapsed.TotalSeconds -gt 90) { Stop-App $proc; throw "$($app.name) no respondió en 90 s" }
        Start-Sleep -Milliseconds 20
    }
    $firstResponseMs = $watch.Elapsed.TotalMilliseconds
    Start-Sleep -Milliseconds 300   # deja que el log termine de escribirse
    $reported = $null
    $m = [regex]::Match((Get-Content $log -Raw), $app.startupPattern)
    if ($m.Success) {
        $reported = [double]::Parse($m.Groups[1].Value, [Globalization.CultureInfo]::InvariantCulture)
        if ($app.startupUnit -eq 's') { $reported = $reported * 1000 }
    }
    return @{ process = $proc; firstResponseMs = [math]::Round($firstResponseMs, 1); reportedMs = $reported }
}

function Stop-App($proc) {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force; $proc.WaitForExit(15000) | Out-Null }
    Start-Sleep -Milliseconds 500
}

function Invoke-Jcmd($procId, [string[]]$command) {
    $out = & $jcmd $procId @command 2>&1 | Out-String
    return $out
}

function KbToMb($kb) { return [math]::Round([double]$kb / 1024, 1) }

function Get-Stats([double[]]$values) {
    $sorted = @($values | Sort-Object)
    $n = $sorted.Count
    $mean = ($sorted | Measure-Object -Average).Average
    $median = if ($n % 2) { $sorted[[int][math]::Floor($n / 2)] } else { ($sorted[$n / 2 - 1] + $sorted[$n / 2]) / 2 }
    $var = 0; foreach ($v in $sorted) { $var += [math]::Pow($v - $mean, 2) }
    $stdev = if ($n -gt 1) { [math]::Sqrt($var / ($n - 1)) } else { 0 }
    return [ordered]@{ n = $n; mean = [math]::Round($mean, 2); median = [math]::Round($median, 2);
        min = [math]::Round($sorted[0], 2); max = [math]::Round($sorted[$n - 1], 2); stdev = [math]::Round($stdev, 2) }
}

# ------------------------------------------------------------------ entorno
Log "Resultados en $outDir"
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$os = Get-CimInstance Win32_OperatingSystem
$javaVersion = (cmd /c "`"$javaExe`" -version 2>&1" | Select-Object -First 1)
$k6Version = (& k6 version 2>&1 | Select-Object -First 1)
$environment = [ordered]@{
    date = (Get-Date -Format 'yyyy-MM-dd HH:mm'); quick = [bool]$Quick
    cpu = $cpu.Name.Trim(); cores = $cpu.NumberOfCores; logicalProcessors = $cpu.NumberOfLogicalProcessors
    ramGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1); os = "$($os.Caption) $($os.Version)"
    java = "$javaVersion"; k6 = "$k6Version"; jvmOptions = ($jvmOptions -join ' ')
    jarSizeMB = [ordered]@{}
    parameters = [ordered]@{ startupRuns = $StartupRuns; reps = $Reps; vus = $Vus; duration = $Duration; warmup = $WarmupDuration }
}
foreach ($key in $Frameworks) {
    if (-not (Test-Path $apps[$key].jar)) { throw "No existe $($apps[$key].jar). Compila primero el JAR." }
    $environment.jarSizeMB[$key] = [math]::Round((Get-Item $apps[$key].jar).Length / 1MB, 1)
    Assert-PortFree $apps[$key].port
}

# ------------------------------------------------------------------ 1. arranque
$startup = [ordered]@{}
foreach ($key in $Frameworks) { $startup[$key] = [ordered]@{ runs = @() } }
for ($i = 1; $i -le $StartupRuns; $i++) {
    foreach ($key in $Frameworks) {   # se alternan los frameworks para repartir posibles variaciones del equipo
        $r = Start-App $key @() "startup-$key-$i"
        Stop-App $r.process
        $startup[$key].runs += [ordered]@{ run = $i; firstResponseMs = $r.firstResponseMs; reportedMs = $r.reportedMs }
        Log ("Arranque {0} {1}/{2}: {3} ms hasta la primera respuesta (el framework indica {4} ms)" -f $apps[$key].name, $i, $StartupRuns, $r.firstResponseMs, $r.reportedMs)
    }
}
foreach ($key in $Frameworks) {
    $startup[$key].firstResponseMs = Get-Stats ($startup[$key].runs | ForEach-Object { $_.firstResponseMs })
    $reportedValues = @($startup[$key].runs | Where-Object { $_.reportedMs } | ForEach-Object { $_.reportedMs })
    if ($reportedValues.Count) { $startup[$key].reportedMs = Get-Stats $reportedValues }
}

# ------------------------------------------------------------------ 2. memoria en reposo
$memoryIdle = [ordered]@{}
foreach ($key in $Frameworks) {
    $r = Start-App $key @('-XX:NativeMemoryTracking=summary') "memory-$key"
    $procId = $r.process.Id
    Start-Sleep -Seconds 10
    $p = Get-Process -Id $procId
    $heap = Invoke-Jcmd $procId @('GC.heap_info')
    $null = Invoke-Jcmd $procId @('GC.run'); Start-Sleep -Seconds 2
    $heapGc = Invoke-Jcmd $procId @('GC.heap_info')
    $nmt = Invoke-Jcmd $procId @('VM.native_memory', 'summary')
    $perf = Invoke-Jcmd $procId @('PerfCounter.print')
    Set-Content -Path (Join-Path $rawDir "memory-$key-jcmd.txt") -Value @($heap, $heapGc, $nmt) -Encoding UTF8
    $rx = { param($text, $pattern) $m = [regex]::Match($text, $pattern); if ($m.Success) { $m.Groups[1].Value } else { $null } }
    $memoryIdle[$key] = [ordered]@{
        workingSetMB      = [math]::Round($p.WorkingSet64 / 1MB, 1)
        privateMemoryMB   = [math]::Round($p.PrivateMemorySize64 / 1MB, 1)
        heapUsedMB        = KbToMb (& $rx $heap 'heap\s+total \d+K, used (\d+)K')
        heapCommittedMB   = KbToMb (& $rx $heap 'heap\s+total (\d+)K')
        heapUsedAfterGcMB = KbToMb (& $rx $heapGc 'heap\s+total \d+K, used (\d+)K')
        metaspaceUsedMB   = KbToMb (& $rx $heapGc 'Metaspace\s+used (\d+)K')
        classSpaceUsedMB  = KbToMb (& $rx $heapGc 'class space\s+used (\d+)K')
        nativeCommittedMB = KbToMb (& $rx $nmt 'Total: reserved=\d+KB, committed=(\d+)KB')
        loadedClasses     = [int](& $rx $perf 'java\.cls\.loadedClasses=(\d+)')
        liveThreads       = [int](& $rx $perf 'java\.threads\.live=(\d+)')
    }
    Stop-App $r.process
    Log ("Memoria en reposo {0}: heap tras GC {1} MB, metaspace {2} MB, {3} clases, proceso {4} MB" -f $apps[$key].name,
        $memoryIdle[$key].heapUsedAfterGcMB, $memoryIdle[$key].metaspaceUsedMB, $memoryIdle[$key].loadedClasses, $memoryIdle[$key].workingSetMB)
}

# ------------------------------------------------------------------ 3 y 4. carga (k6) + JFR
$cores = [Environment]::ProcessorCount
function Invoke-K6($key, $endpoint, $vus, $duration, $summaryFile, $procId) {
    $app = $apps[$key]
    $k6Args = @('run', '--quiet', '--summary-trend-stats', 'avg,min,med,max,p(90),p(95),p(99)',
        '-e', "BASE_URL=http://localhost:$($app.port)", '-e', "RESOURCE_PATH=$($endpoint.path)",
        '-e', "VUS=$vus", '-e', "DURATION=$duration", "`"$k6Script`"")
    if ($summaryFile) { $k6Args = @($k6Args[0..1] + @('--summary-export', "`"$summaryFile`"") + $k6Args[2..($k6Args.Count - 1)]) }
    $k6Log = if ($summaryFile) { [IO.Path]::ChangeExtension($summaryFile, '.k6.log') } else { Join-Path $rawDir 'warmup.k6.log' }
    $k6 = Start-Process -FilePath 'k6' -ArgumentList $k6Args -RedirectStandardOutput $k6Log -RedirectStandardError "$k6Log.err" -PassThru -WindowStyle Hidden
    # Muestreo de CPU y memoria del proceso Java mientras dura la prueba.
    $samples = @()
    $p = Get-Process -Id $procId
    $lastCpu = $p.TotalProcessorTime.TotalMilliseconds; $lastT = [Diagnostics.Stopwatch]::StartNew()
    while (-not $k6.HasExited) {
        Start-Sleep -Milliseconds 1000
        $p.Refresh()
        $cpuNow = $p.TotalProcessorTime.TotalMilliseconds; $elapsed = $lastT.Elapsed.TotalMilliseconds
        $samples += [pscustomobject]@{ cpu = (($cpuNow - $lastCpu) / $elapsed / $cores) * 100; ws = $p.WorkingSet64 / 1MB }
        $lastCpu = $cpuNow; $lastT.Restart()
    }
    $k6.WaitForExit()
    return $samples
}

$load = @()
$jfr = [ordered]@{}
$jfrVus = ($Vus | Measure-Object -Maximum).Maximum
foreach ($key in $Frameworks) {
    $r = Start-App $key @() "load-$key"
    $procId = $r.process.Id
    foreach ($endpoint in $endpoints) {
        Log ("Calentamiento {0} - {1} ({2})" -f $apps[$key].name, $endpoint.label, $WarmupDuration)
        Invoke-K6 $key $endpoint 10 $WarmupDuration $null $procId | Out-Null
        Start-Sleep -Seconds $CooldownSeconds
        foreach ($v in $Vus) {
            for ($rep = 1; $rep -le $Reps; $rep++) {
                $name = "k6-$key-$($endpoint.key)-$($v)vus-rep$rep"
                $summaryFile = Join-Path $rawDir "$name.json"
                $recordJfr = ($endpoint.key -eq 'large' -and $v -eq $jfrVus -and $rep -eq 1)
                $jfrFile = Join-Path $rawDir "jfr-$key-large-$($v)vus.jfr"
                $jfrTemp = Join-Path $env:TEMP "tfm-jfr-$key.jfr"   # jcmd no admite rutas con espacios
                if ($recordJfr) {
                    Remove-Item $jfrTemp -ErrorAction SilentlyContinue
                    $null = Invoke-Jcmd $procId @('JFR.start', 'name=bench', 'settings=profile', "filename=$jfrTemp")
                }
                $samples = Invoke-K6 $key $endpoint $v $Duration $summaryFile $procId
                if ($recordJfr) {
                    $null = Invoke-Jcmd $procId @('JFR.stop', 'name=bench')
                    if (Test-Path $jfrTemp) { Move-Item $jfrTemp $jfrFile -Force } else { Log "Aviso: no se generó la grabación JFR de $($apps[$key].name)" }
                }
                $s = Get-Content $summaryFile -Raw | ConvertFrom-Json
                $d = $s.metrics.http_req_duration
                $row = [ordered]@{
                    framework = $key; endpoint = $endpoint.key; vus = $v; rep = $rep
                    requests = [int]$s.metrics.http_reqs.count; rps = [math]::Round($s.metrics.http_reqs.rate, 1)
                    avgMs = [math]::Round($d.avg, 3); medMs = [math]::Round($d.med, 3); p90Ms = [math]::Round($d.'p(90)', 3)
                    p95Ms = [math]::Round($d.'p(95)', 3); p99Ms = [math]::Round($d.'p(99)', 3); maxMs = [math]::Round($d.max, 3)
                    errorRate = [math]::Round($s.metrics.http_req_failed.value, 5)
                    cpuAvgPct = [math]::Round((($samples | Measure-Object cpu -Average).Average), 1)
                    cpuMaxPct = [math]::Round((($samples | Measure-Object cpu -Maximum).Maximum), 1)
                    workingSetAvgMB = [math]::Round((($samples | Measure-Object ws -Average).Average), 1)
                    workingSetMaxMB = [math]::Round((($samples | Measure-Object ws -Maximum).Maximum), 1)
                }
                $load += $row
                Log ("{0} {1} {2} VUs rep {3}: {4} req/s, media {5} ms, p95 {6} ms, errores {7}, CPU {8}%" -f $apps[$key].name,
                    $endpoint.key, $v, $rep, $row.rps, $row.avgMs, $row.p95Ms, $row.errorRate, $row.cpuAvgPct)
                Start-Sleep -Seconds $CooldownSeconds
            }
        }
    }
    $heapAfter = Invoke-Jcmd $procId @('GC.heap_info')
    Set-Content -Path (Join-Path $rawDir "after-load-$key-heap.txt") -Value $heapAfter -Encoding UTF8
    Stop-App $r.process

    # Resumen de la grabación JFR: recolecciones de basura y pausas.
    $jfrFile = Join-Path $rawDir "jfr-$key-large-$($jfrVus)vus.jfr"
    if (Test-Path $jfrFile) {
        & $jfrTool summary "$jfrFile" | Out-File (Join-Path $rawDir "jfr-$key-summary.txt") -Encoding UTF8
        & $jfrTool view --width 160 gc "$jfrFile" 2>$null | Out-File (Join-Path $rawDir "jfr-$key-gc.txt") -Encoding UTF8
        $gcJson = (& $jfrTool print --json --events jdk.GarbageCollection "$jfrFile" | Out-String) | ConvertFrom-Json
        $events = @($gcJson.recording.events)
        $pauseMs = 0; $maxPauseMs = 0
        foreach ($e in $events) {
            $v = "$($e.values.sumOfPauses)"
            $ms = 0
            $m = [regex]::Match($v, 'PT(?:(\d+)M)?([\d.]+)S')
            if ($m.Success) { $ms = ([double]("0" + $m.Groups[1].Value) * 60 + [double]::Parse($m.Groups[2].Value, [Globalization.CultureInfo]::InvariantCulture)) * 1000 }
            $pauseMs += $ms; if ($ms -gt $maxPauseMs) { $maxPauseMs = $ms }
        }
        $jfr[$key] = [ordered]@{ scenario = "large-$($jfrVus)vus"; gcCount = $events.Count;
            gcPauseTotalMs = [math]::Round($pauseMs, 2); gcPauseMaxMs = [math]::Round($maxPauseMs, 2) }
        Log ("JFR {0}: {1} recolecciones, {2} ms de pausa total" -f $apps[$key].name, $events.Count, $jfr[$key].gcPauseTotalMs)
    }
}

# ------------------------------------------------------------------ agregado por escenario (media de repeticiones)
$loadSummary = @()
foreach ($group in ($load | Group-Object { "$($_.framework)|$($_.endpoint)|$($_.vus)" })) {
    $rows = $group.Group
    $agg = [ordered]@{ framework = $rows[0].framework; endpoint = $rows[0].endpoint; vus = $rows[0].vus; reps = $rows.Count }
    foreach ($field in 'rps', 'avgMs', 'medMs', 'p90Ms', 'p95Ms', 'p99Ms', 'maxMs', 'errorRate', 'cpuAvgPct', 'workingSetAvgMB', 'workingSetMaxMB') {
        $agg[$field] = [math]::Round((($rows | ForEach-Object { $_[$field] } | Measure-Object -Average).Average), 3)
    }
    $agg['rpsStdev'] = (Get-Stats ($rows | ForEach-Object { $_.rps })).stdev
    $loadSummary += $agg
}

$summary = [ordered]@{
    environment = $environment; startup = $startup; memoryIdle = $memoryIdle
    load = $loadSummary; loadRuns = $load; jfr = $jfr
}
$summaryPath = Join-Path $outDir 'summary.json'
[IO.File]::WriteAllText($summaryPath, ($summary | ConvertTo-Json -Depth 8), (New-Object System.Text.UTF8Encoding $false))
if (-not $Quick) {   # el frontend muestra siempre la última medición completa
    $frontendData = Join-Path $root 'Micronaut\tfm\frontend\src\data\benchmark-summary.json'
    New-Item -ItemType Directory -Force -Path (Split-Path $frontendData) | Out-Null
    Copy-Item $summaryPath $frontendData -Force
    Log "Copiado al frontend: $frontendData"
}
Log "Terminado. Resumen en $summaryPath"
