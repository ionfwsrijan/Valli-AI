from __future__ import annotations

import socket
import threading
import time
import urllib.error
import urllib.request

import uvicorn

from backend.app.main import app

try:
    import webview
except ImportError as exc:  # pragma: no cover - runtime dependency for packaged app
    raise SystemExit("pywebview is required for the native desktop build.") from exc


WINDOW_TITLE = "Valli Pre-Anesthetic Assessment"
WINDOW_SIZE = (1480, 960)
WINDOW_MIN_SIZE = (1180, 760)


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def wait_for_server(base_url: str, timeout_seconds: float = 25.0) -> None:
    deadline = time.time() + timeout_seconds
    health_url = f"{base_url}/api/health"

    while time.time() < deadline:
        try:
            with urllib.request.urlopen(health_url, timeout=1.5) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.25)

    raise TimeoutError(f"Desktop server did not become ready at {health_url}")


def run_server(server: uvicorn.Server) -> None:
    server.run()


def main() -> None:
    port = free_port()
    base_url = f"http://127.0.0.1:{port}"
    server = uvicorn.Server(
        uvicorn.Config(
            app,
            host="127.0.0.1",
            port=port,
            log_level="warning",
            access_log=False,
        )
    )

    server_thread = threading.Thread(target=run_server, args=(server,), daemon=True)
    server_thread.start()

    try:
        wait_for_server(base_url)
        webview.create_window(
            WINDOW_TITLE,
            base_url,
            width=WINDOW_SIZE[0],
            height=WINDOW_SIZE[1],
            min_size=WINDOW_MIN_SIZE,
            text_select=True,
        )
        webview.start(gui="edgechromium", debug=False, private_mode=False)
    finally:
        server.should_exit = True
        server_thread.join(timeout=5)


if __name__ == "__main__":
    main()
