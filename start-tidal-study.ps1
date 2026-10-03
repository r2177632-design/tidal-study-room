param(
  [int]$Port = 8765,
  [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://127.0.0.1:$Port/index.html#farm"
$probeUrl = "http://127.0.0.1:$Port/index.html?launcher=1"
$dataRoot = "D:\codex文件数据\潮汐书斋"
$profileDir = Join-Path $dataRoot "edge-profile"
$logDir = Join-Path $dataRoot "logs"
$serverOutLog = Join-Path $logDir "server.out.log"
$serverErrorLog = Join-Path $logDir "server.error.log"
$launcherErrorLog = Join-Path $logDir "launcher.error.log"

function Test-TidalStudyServer {
  param([string]$TargetUrl)

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $TargetUrl -TimeoutSec 2
    return (
      ($response.StatusCode -eq 200) -and
      ($response.Content -match "TIDAL STUDY ROOM")
    )
  } catch {
    return $false
  }
}

function Find-FirstFile {
  param([string[]]$Candidates)

  foreach ($candidate in $Candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }
  return $null
}

$serverProcess = $null
try {
  if (-not (Test-TidalStudyServer -TargetUrl $probeUrl)) {
    $python = Find-FirstFile -Candidates @(
      "D:\python\python.exe",
      "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
      "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
      "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
    )
    if (-not $python) {
      throw "没有找到可用的 Python，无法启动本地服务。"
    }

    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    $serverProcess = Start-Process `
      -FilePath $python `
      -ArgumentList @(
        "-m",
        "http.server",
        "$Port",
        "--bind",
        "127.0.0.1",
        "--directory",
        $root
      ) `
      -WorkingDirectory $root `
      -WindowStyle Hidden `
      -RedirectStandardOutput $serverOutLog `
      -RedirectStandardError $serverErrorLog `
      -PassThru

    $serverReady = $false
    for ($attempt = 0; $attempt -lt 24; $attempt++) {
      if (Test-TidalStudyServer -TargetUrl $probeUrl) {
        $serverReady = $true
        break
      }
      if ($serverProcess.HasExited) {
        break
      }
      Start-Sleep -Milliseconds 250
    }
    if (-not $serverReady) {
      throw "本地服务未能启动，请查看 $serverErrorLog。"
    }
  }

  if ($ValidateOnly) {
    Write-Output "LAUNCHER_OK $probeUrl"
    exit 0
  }

  $edge = Find-FirstFile -Candidates @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
  )
  if (-not $edge) {
    throw "没有找到 Microsoft Edge，无法打开桌面应用窗口。"
  }

  New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
  $edgeProcess = Start-Process `
    -FilePath $edge `
    -ArgumentList @(
      "--app=$url",
      "--user-data-dir=$profileDir",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1500,950"
    ) `
    -WorkingDirectory $root `
    -PassThru
  $edgeProcess.WaitForExit()
} catch {
  $message = $_.Exception.Message
  try {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    $logLine = (
      "[{0}] {1}{2}" -f
      (Get-Date -Format "yyyy-MM-dd HH:mm:ss"),
      $message,
      [Environment]::NewLine
    )
    [System.IO.File]::AppendAllText(
      $launcherErrorLog,
      $logLine,
      (New-Object System.Text.UTF8Encoding($false))
    )
  } catch {
    # 如果日志目录也不可写，仍尝试显示错误提示。
  }
  try {
    $shell = New-Object -ComObject WScript.Shell
    $null = $shell.Popup(
      "潮汐书斋启动失败。`n`n$message",
      18,
      "潮汐书斋",
      16
    )
  } catch {
    # 隐藏启动时无法显示界面时，保留日志作为诊断入口。
  }
  exit 1
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
