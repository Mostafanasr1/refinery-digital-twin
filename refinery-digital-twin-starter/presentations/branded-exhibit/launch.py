#!/usr/bin/env python3
"""Loopback-only deck + fixed read-only HTTPS pass-through. Python 3.10+."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import URLError, HTTPError
import argparse
import json
import webbrowser

ROOT = Path(__file__).resolve().parent
UPSTREAM = 'https://mostafanasr1.github.io/refinery-digital-twin/'

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None  # Fail closed; never follow to /next/, another root or host.


def safe_path(raw):
    path = urlsplit(raw).path
    for _ in range(4):
        decoded = unquote(path)
        if decoded == path:
            break
        path = decoded
    if '%' in path or '\\' in path or '\x00' in path or any(x in ('.', '..', 'next') for x in path.split('/')) or '//' in path:
        return None
    return path


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.headers.get('Host') not in (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}'):
            self.send_error(403); return
        path = safe_path(self.path)
        if path is None:
            self.send_error(403); return
        if path == '/launcher-status':
            body = json.dumps({'service':'branded-exhibit-loopback-v1'}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body); return
        if path.startswith('/live/'):
            suffix = path[len('/live/'):]
            # Relative, fixed-root assets only; request queries are presentation parameters.
            target = UPSTREAM + suffix
            query = urlsplit(self.path).query
            if query:
                target += '?' + query
            try:
                # No incoming cookies, Authorization, client headers or redirect credentials.
                request = Request(target, headers={'Accept-Encoding':'identity'}, method='GET')
                with build_opener(NoRedirect()).open(request, timeout=20) as response:
                    body = response.read()
                    self.send_response(response.status)
                    excluded = {'connection','transfer-encoding','content-length','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','upgrade','set-cookie'}
                    for key, value in response.headers.items():
                        if key.lower() not in excluded:
                            self.send_header(key, value)
                    # CSP, X-Frame-Options and other upstream protections remain intact.
                    self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
            except (URLError, HTTPError, TimeoutError, OSError):
                self.send_error(502, 'Live demo unavailable')
            return
        if path not in ('/', '/index.html', '/style.css', '/deck.js', '/assets/engineering.png'):
            self.send_error(404); return
        super().do_GET()

    def do_HEAD(self):
        self.send_error(405)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'Branded exhibit: {url}', flush=True)
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
