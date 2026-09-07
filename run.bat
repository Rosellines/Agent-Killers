@echo off
node src\cli.js self-test
if errorlevel 1 exit /b 1
node src\server.js
