"""Scoped launcher tests: no upstream network or protected files are modified."""
import io
import threading
import unittest
from http.client import HTTPConnection
from unittest.mock import patch
from email.message import Message
import launch

class Response:
    status = 200
    def __init__(self):
        self.headers = Message()
        self.headers['Content-Type'] = 'text/html'
        self.headers['Content-Security-Policy'] = "default-src 'self'"
        self.headers['X-Frame-Options'] = 'SAMEORIGIN'
        self.headers['Set-Cookie'] = 'secret=discard'
    def read(self): return b'<html>unchanged upstream bytes</html>'
    def __enter__(self): return self
    def __exit__(self, *args): pass

class LauncherTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = launch.ThreadingHTTPServer(('127.0.0.1', 0), launch.Handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown(); cls.server.server_close()
    def get(self, path, headers=None, method='GET'):
        conn = HTTPConnection('127.0.0.1', self.server.server_port)
        conn.request(method, path, headers=headers or {})
        response = conn.getresponse(); result = response.status, dict(response.headers), response.read()
        conn.close(); return result
    def test_fixed_root_and_unchanged_bytes(self):
        with patch('launch.build_opener') as factory:
            factory.return_value.open.return_value = Response()
            status, headers, body = self.get('/live/assets/demo.js?look=engineering', {'Cookie':'private','Authorization':'private'})
            req = factory.return_value.open.call_args.args[0]
            self.assertEqual(req.full_url, launch.UPSTREAM + 'assets/demo.js?look=engineering')
            self.assertNotIn('Cookie', req.headers); self.assertNotIn('Authorization', req.headers)
            self.assertEqual(status, 200); self.assertEqual(body, Response().read())
            self.assertEqual(headers['X-Frame-Options'], 'SAMEORIGIN')
            self.assertIn('Content-Security-Policy', headers); self.assertNotIn('Set-Cookie', headers)
    def test_paths_and_host(self):
        for path in ['/live/../next/', '/live/%2e%2e/x', '/live/%252e%252e/x', '/live/next/', '/live//evil.test/', '/live/%5cnext/', '/launch.py', '/evidence/']:
            self.assertIn(self.get(path)[0], [403,404], path)
        self.assertEqual(self.get('/', {'Host':'evil.test'})[0], 403)
    def test_read_only_and_static(self):
        self.assertEqual(self.get('/')[0], 200)
        self.assertEqual(self.get('/launcher-status')[0], 200)
        self.assertEqual(self.get('/live/', method='POST')[0], 501)
    def test_redirect_denied(self):
        self.assertIsNone(launch.NoRedirect().redirect_request(None,None,302,'',{},'https://evil.test'))
    def test_upstream_failure(self):
        with patch('launch.build_opener') as factory:
            factory.return_value.open.side_effect = launch.URLError('offline')
            self.assertEqual(self.get('/live/')[0], 502)

if __name__ == '__main__': unittest.main()
