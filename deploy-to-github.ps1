# GitHub Deployment Script for Majror City Website
# This script helps you deploy the website to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Majror City Website - GitHub Deploy  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Get user information
Write-Host "Please provide your GitHub information:" -ForegroundColor Cyan
Write-Host ""

$userName = Read-Host "Enter your GitHub username"
$userEmail = Read-Host "Enter your email (same as GitHub)"
$repoName = Read-Host "Enter repository name (e.g., www.majror.com)"

Write-Host ""
Write-Host "Configuring Git..." -ForegroundColor Yellow

# Configure Git
git config --global user.name "$userName"
git config --global user.email "$userEmail"

Write-Host "✓ Git configured successfully" -ForegroundColor Green
Write-Host ""

# Initialize Git repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "⚠ Git repository already exists" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

Write-Host ""

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added" -ForegroundColor Green
Write-Host ""

# Create first commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Majror City Website"
Write-Host "✓ Commit created" -ForegroundColor Green
Write-Host ""

# Set up remote
Write-Host "Setting up GitHub remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/$userName/$repoName.git"

try {
    git remote add origin $remoteUrl
    Write-Host "✓ Remote added: $remoteUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠ Remote already exists, updating..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
    Write-Host "✓ Remote updated: $remoteUrl" -ForegroundColor Green
}

Write-Host ""

# Set main branch
Write-Host "Setting up main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ Main branch configured" -ForegroundColor Green
Write-Host ""

# Instructions for pushing
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to GitHub and create a new repository:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor White
Write-Host ""
Write-Host "2. Repository name: $repoName" -ForegroundColor White
Write-Host "   Description: موقع مدينة المجرور البحير - السودان" -ForegroundColor White
Write-Host "   Make it PUBLIC" -ForegroundColor White
Write-Host "   Do NOT add README, .gitignore, or license" -ForegroundColor White
Write-Host ""
Write-Host "3. After creating the repository, run this command:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "4. Enable GitHub Pages:" -ForegroundColor Yellow
Write-Host "   - Go to repository Settings > Pages" -ForegroundColor White
Write-Host "   - Source: Deploy from branch 'main' / (root)" -ForegroundColor White
Write-Host "   - Save" -ForegroundColor White
Write-Host ""
Write-Host "5. Your website will be available at:" -ForegroundColor Yellow
Write-Host "   https://$userName.github.io/$repoName/" -ForegroundColor Green
Write-Host ""
Write-Host "6. Update URLs in these files with your actual GitHub Pages URL:" -ForegroundColor Yellow
Write-Host "   - index.html" -ForegroundColor White
Write-Host "   - sitemap.xml" -ForegroundColor White
Write-Host "   - robots.txt" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: GITHUB_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ready to push? Run: git push -u origin main" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
