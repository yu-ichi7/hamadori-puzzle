@echo off
rem はまどりパズルをローカルサーバーで開く（ダブルクリックで動かない場合の保険）
rem 同じWi-Fiのスマホからも、表示される「スマホで見るとき」のアドレスで開ける
cd /d "%~dp0"
echo このウィンドウは閉じないでね
start http://localhost:8765/
python tools\serve.py 8765 2>nul || py tools\serve.py 8765
pause
