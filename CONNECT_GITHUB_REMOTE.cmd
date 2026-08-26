@echo off
setlocal
cd /d "%~dp0"

echo Islamic Fasting Planner PRO - GitHub Remote Connector
echo.
set /p REPO_URL=Paste empty GitHub repo URL, then press Enter: 

if "%REPO_URL%"=="" (
  echo No repo URL supplied.
  exit /b 1
)

git remote get-url origin >nul 2>nul
if "%ERRORLEVEL%"=="0" (
  git remote set-url origin "%REPO_URL%"
) else (
  git remote add origin "%REPO_URL%"
)

git branch -M main
git push -u origin main

echo.
echo Done. If Git asks for credentials, sign in using Git Credential Manager.
