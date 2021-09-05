@echo off
title Robotic Intuition Operator
echo RIO is about to be started.
echo Please make sure that there is an internet connection, a webcam and all the necessary equipments
echo Starting Robotic Intuition Operator..
pause
start node backend.js
"C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:3555/file/frontend.html
exit