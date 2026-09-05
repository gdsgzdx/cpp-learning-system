# 上传项目到 GitHub（PowerShell）
# 用法：.\scripts\push-to-github.ps1 -RepoUrl "https://github.com/<user>/<repo>.git"

param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,

  [string]$CommitMessage = "feat: 初始化 C++ 学习管理系统 MVP V1",

  [string]$Branch = "main"
)

Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "==> 1/5 检查 git" -ForegroundColor Cyan
git --version | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "git 未安装"; exit 1
}

Write-Host "==> 2/5 初始化仓库（如未初始化）" -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
  git init
  git branch -M $Branch
}

Write-Host "==> 3/5 安全检查 — 确认机密文件不会被追踪" -ForegroundColor Cyan
$dangerous = @(".env", "prisma/dev.db")
foreach ($f in $dangerous) {
  if (Test-Path $f) {
    git check-ignore $f | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "[!] $f 不会被 .gitignore 排除，请手动检查！"
    } else {
      Write-Host "    [OK] $f 已被 .gitignore 排除"
    }
  }
}

Write-Host "==> 4/5 添加文件并预览" -ForegroundColor Cyan
git add .
Write-Host "    -- 待提交文件："
git status --short | Select-Object -First 30 | ForEach-Object { Write-Host "      $_" }

$confirm = Read-Host "    确认提交? (y/n)"
if ($confirm -ne "y") {
  Write-Host "已取消"; exit 0
}

git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
  Write-Warning "无变更可提交，继续 push"
}

Write-Host "==> 5/5 推送到远程" -ForegroundColor Cyan
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  git remote add origin $RepoUrl
} elseif ($remote -ne $RepoUrl) {
  Write-Host "    远程已存在: $remote"
  $change = Read-Host "    是否覆盖为 $RepoUrl ? (y/n)"
  if ($change -eq "y") {
    git remote set-url origin $RepoUrl
  }
}

git push -u origin $Branch
if ($LASTEXITCODE -eq 0) {
  Write-Host "`n✅ 推送成功!" -ForegroundColor Green
  Write-Host "    访问: $RepoUrl`n"
} else {
  Write-Error "推送失败，请检查网络 / 权限"
}
