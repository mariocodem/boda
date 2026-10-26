"""Servidor local para probar la invitación y el panel.

Igual que `python3 -m http.server`, pero le pide al navegador que siempre
pregunte si un archivo cambió: así nunca se queda con una versión vieja de un
JavaScript o una hoja de estilos mientras se prueba.

Uso: python3 servir.py [puerto]   (8000 si no se dice)
"""
import http.server
import sys


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
servidor = http.server.ThreadingHTTPServer(('', puerto), SinCache)
print(f'Invitación: http://localhost:{puerto}/index.html')
print(f'Panel:      http://localhost:{puerto}/admin.html')
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    pass
