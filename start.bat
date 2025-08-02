@echo off
title Token Checker - By @krexdll
echo Starting Token Checker...
npm start
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Program crashed with error code %errorlevel%
    echo Check the error messages above.
    echo.
)
echo.
echo Program finished. Press any key to close...
pause >nul