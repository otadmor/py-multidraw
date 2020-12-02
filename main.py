#python2
try:
    from BaseHTTPServer import HTTPServer
    from CGIHTTPServer import CGIHTTPRequestHandler
except:
    from socketserver import TCPServer as HTTPServer
    from http.server import CGIHTTPRequestHandler
import pickle
import json
#static_page = open("index.html", "rt").read()
#jquery_page = open("jquery.min.js", "rt").read()
lines = []
redo = []
lines_index = 0

allowed_files = ["multidraw.js","sgbeal-colorpicker.jquery.js", "jquery.min.js", "jquery.nouislider.min.js"]

clients = 0


class CompGeoRequestHandler(CGIHTTPRequestHandler):
    def myheaders(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def log_message(self, format, *args):
        if not self.path[1:].isdigit():
            return CGIHTTPRequestHandler.log_message(self,format, *args)

    def do_GET(self):
        global lines_index
        global lines
        global redo
        global clients

        if self.path[1:].isdigit():
            ind = int(self.path[1:])
            if ind - lines_index < 0:
                lines_index = 0
                ind = 0
            self.myheaders()
            self.wfile.write(json.dumps([lines[ind - lines_index:], lines_index, len(lines)]).encode('utf-8'))
        elif self.path.startswith('/add'):
            coords = [a for a in self.path[len('/add/'):].split('/')]
            lines.append(coords)
            redo = []
            self.myheaders()
            self.wfile.write(b"")
        elif self.path.startswith('/clean'):
            lines_index += len(lines)
            lines = []
            self.myheaders()
            self.wfile.write(b"")
        elif self.path.startswith('/save/'):
            p = self.path[len('/save/'):].replace('.','_').replace('/', '_').replace('\\', '_')
            pickle.dump((clients, lines, redo), open(p + '.pkl', 'wb'))
            self.myheaders()
            self.wfile.write(b"")
        elif self.path.startswith('/load/'):
            p = self.path[len('/load/'):].replace('.','_').replace('/', '_').replace('\\', '_')
            lines_index = 0
            clients, lines, redo = pickle.load(open(p + '.pkl', 'rb'))
            self.myheaders()
            self.wfile.write(b"")
        elif self.path.startswith('/undo'):
            if len(lines) != 0:
                remove_index = lines[len(lines) - 1][0]
                redo.extend(l for l in lines if l[0] == remove_index)
                lines = [l for l in lines if l[0] != remove_index]
            self.myheaders()
            self.wfile.write(b"")
        elif self.path.startswith('/redo'):
            if len(redo) != 0:
                readd_index = redo[len(redo) - 1][0]
                lines.extend(l for l in redo if l[0] == readd_index)
                redo = [l for l in redo if l[0] != readd_index]
            self.myheaders()
            self.wfile.write(b"")
        elif self.path == '/':
            client_id = clients
            clients+=1
            #self.wfile.write(static_page)
            self.myheaders()
            self.wfile.write(open("index.html", "rt").read().replace("client_id=0", "client_id=" + str(client_id)).encode('utf-8'))
        elif self.path.startswith('/image/'):
            width, height = self.path[len('/image/'):].split('/')
            self.myheaders()
            #self.send_response(200)
            #self.send_header('Content-type', 'image/png')
            #self.end_headers()

            self.wfile.write((open("image.html", "rt").read() % ( width, height)).encode('utf-8'))
        elif self.path[1:] in allowed_files:
            #self.wfile.write(jquery_page)
            CGIHTTPRequestHandler.do_GET(self)


def start_server(port):
    global lines
    global clients
    global redo
    try:
        clients, lines, redo = pickle.load(open('objects.pkl', "rb"))
    except:
        lines = []

    HTTPServer.allow_reuse_address = True
    server = HTTPServer(('', port), CompGeoRequestHandler)
    server.allow_reuse_address = True
    try:
        server.serve_forever()
    except:
        pickle.dump((clients, lines, redo), open('objects.pkl', 'wb'))



if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 32156
    start_server(port)
