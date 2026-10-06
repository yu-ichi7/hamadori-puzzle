# はまどりパズルをローカルで動かす開発用サーバー。
# 同じWi-Fiにつないだスマホからも開けるよう、LAN内のすべての端末からの接続を受け付ける。
#   使い方: python tools/serve.py [ポート番号]   （start.bat から呼ばれる）
import http.server
import os
import socket
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def lan_ip():
    # 外へ向かう経路に使われるIPv4アドレス（例: 192.168.1.23）を調べる。実際には通信しない
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # 編集した内容をスマホで再読み込みしたときにすぐ反映させるため、ブラウザにキャッシュさせない
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # アクセスごとのログは出さない


def main():
    os.chdir(ROOT)
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), NoCacheHandler)
    print(f"PCで見るとき:    http://localhost:{PORT}/")
    ip = lan_ip()
    if ip:
        print(f"スマホで見るとき: http://{ip}:{PORT}/  （PCと同じWi-Fiにつなぐ）")
    print("止めるときは Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
