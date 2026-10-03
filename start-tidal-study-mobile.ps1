param(
  [int]$Port = 8768,
  [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataRoot = "D:\codex文件数据\潮汐书斋"
$logDir = Join-Path $dataRoot "logs"
$serverOutLog = Join-Path $logDir "mobile-server.out.log"
$serverErrorLog = Join-Path $logDir "mobile-server.error.log"
$launcherErrorLog = Join-Path $logDir "mobile-launcher.error.log"

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

function Get-LanIPv4 {
  $addresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
    Where-Object {
      $_.IPAddress -notmatch "^(127\.|169\.254\.|0\.)" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object {
      if ($_.InterfaceAlias -match "WLAN|Wi-Fi") { 0 }
      elseif ($_.InterfaceAlias -match "Ethernet|以太网") { 1 }
      else { 2 }
    }
  return $addresses | Select-Object -First 1
}

function Find-Python {
  foreach ($candidate in @(
    "D:\python\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe"
  )) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }
  return $null
}

$serverProcess = $null
try {
  $lanAddress = Get-LanIPv4
  if (-not $lanAddress) {
    throw "没有找到可供手机访问的局域网 IPv4 地址。"
  }

  $python = Find-Python
  if (-not $python) {
    throw "没有找到可用的 Python，无法启动手机服务。"
  }

  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
  $serverProcess = Start-Process `
    -FilePath $python `
    -ArgumentList @(
      "-m",
      "http.server",
      "$Port",
      "--bind",
      "0.0.0.0",
      "--directory",
      $root
    ) `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $serverOutLog `
    -RedirectStandardError $serverErrorLog `
    -PassThru

  $serverReady = $false
  $probeUrl = "http://127.0.0.1:$Port/index.html?mobile=1"
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
    throw "手机服务未能启动。端口 $Port 可能已被占用，或 Python 无法监听局域网。"
  }

  $mobileUrl = "http://$($lanAddress.IPAddress):$Port/index.html#today"
  if ($ValidateOnly) {
    Write-Output "MOBILE_LAUNCHER_OK $mobileUrl"
    exit 0
  }

  try {
    Set-Clipboard -Value $mobileUrl -ErrorAction Stop
    $clipboardCopy = "地址已复制到电脑剪贴板。"
  } catch {
    $clipboardCopy = "请手动输入下面的地址。"
  }

  $host.UI.RawUI.WindowTitle = "潮汐书斋 · 手机服务"
  Write-Host ""
  Write-Host "潮汐书斋 · 手机服务" -ForegroundColor Cyan
  Write-Host "----------------------------------------"
  Write-Host "1. 手机与电脑连接同一个 Wi-Fi。"
  Write-Host "2. 手机浏览器打开：" -NoNewline
  Write-Host $mobileUrl -ForegroundColor Yellow
  Write-Host "3. 首次打开后选择“添加到主屏幕”。"
  Write-Host ""
  Write-Host $clipboardCopy -ForegroundColor DarkGray
  Write-Host "如果手机无法打开，请在 Windows 防火墙中允许 Python 访问专用网络。" -ForegroundColor DarkGray
  Write-Host ""
  Read-Host "保持此窗口开启。按 Enter 停止手机服务"
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
    # 日志不可写时仍向当前窗口输出错误。
  }
  Write-Host ""
  Write-Host "手机服务启动失败：" -ForegroundColor Red
  Write-Host $message
  Write-Host ""
  Read-Host "按 Enter 关闭"
  exit 1
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
