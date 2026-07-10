@echo off
rem はまどりパズルをローカルサーバーで開く（ダブルクリックで動かない場合の保険）
cd /d "%~dp0"
echo ブラウザで http://localhost:8765/ を開いてください（このウィンドウは閉じないでね）
start http://localhost:8765/
python -m http.server 8765 2>nul || py -m http.server 8765
pause
