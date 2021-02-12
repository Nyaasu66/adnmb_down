@echo off
title adnmb_downloader
set /p s=请输入需要下载的串号: 
echo 正在下载: No.%s%
node adnmb.js %s%
pause