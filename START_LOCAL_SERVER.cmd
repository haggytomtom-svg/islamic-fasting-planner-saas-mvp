@echo off
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3000
