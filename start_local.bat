@echo off
chcp 65001 >nul
echo 手話検定シミュレーター - ローカルサーバー起動
echo ==========================================
echo.
echo ブラウザで http://localhost:8888 を開きます...
echo サーバーを停止するには Ctrl+C を押してください。
echo.
start http://localhost:8888
python -m http.server 8888
