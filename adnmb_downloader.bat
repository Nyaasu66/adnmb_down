@echo off
title adnmb_downloader
set /p s=请输入需要下载的串号: 
node adnmb.js %s%
pause