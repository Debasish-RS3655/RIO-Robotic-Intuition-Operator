@echo off
title Exit code
echo Exiting from Robotic Intuition Operator...
echo Closing all programs..
taskkill /F /IM chrome.exe
rem taskkill /F /IM firefox.exe
taskkill /F /IM node.exe
taskkill /F /IM python.exe
cd nginx-1.19.2
nginx -s quit
echo Exited from Robotic Intuition Opearator.
exit