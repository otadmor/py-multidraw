#python2
from BaseHTTPServer import HTTPServer
from CGIHTTPServer import CGIHTTPRequestHandler
import pickle
import json
#static_page = open("index.html", "rt").read()
#jquery_page = open("jquery.min.js", "rt").read()
lines = []
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
        global clients

        if self.path[1:].isdigit():
            ind = int(self.path[1:])
            if ind - lines_index < 0:
                lines_index = 0
                ind = 0
            self.myheaders()
            self.wfile.write(json.dumps([lines[ind - lines_index:], lines_index, len(lines)]))
        elif self.path.startswith('/add'):
            coords = [a for a in self.path[len('/add/'):].split('/')]
            lines.append(coords)
            self.myheaders()
            self.wfile.write("")
        elif self.path.startswith('/clean'):
            lines_index += len(lines)
            lines = []
            self.myheaders()
            self.wfile.write("")
        elif self.path.startswith('/save/'):
            p = self.path[len('/save/'):].replace('.','_').replace('/', '_').replace('\\', '_')
            pickle.dump(lines, open(p + '.pkl', 'wb'))
            self.myheaders()
            self.wfile.write("")
        elif self.path.startswith('/load/'):
            p = self.path[len('/load/'):].replace('.','_').replace('/', '_').replace('\\', '_')
            lines_index = 0
            lines = pickle.load(open(p + '.pkl', 'rb'))
            self.myheaders()
            self.wfile.write("")
        elif self.path.startswith('/undo'):
            if len(lines) != 0:
                remove_index = lines[len(lines) - 1][0]
                lines = [l for l in lines if l[0] != remove_index]
                # del lines[len(lines) - 1]
            self.myheaders()
            self.wfile.write("")
        elif self.path == '/':
            client_id = clients
            clients+=1
            #self.wfile.write(static_page)
            self.myheaders()
            self.wfile.write(open("index.html", "rt").read().replace("client_id=0", "client_id=" + str(client_id)))
        elif self.path.startswith('/image/'):
            width, height = self.path[len('/image/'):].split('/')
            self.myheaders()
            #self.send_response(200)
            #self.send_header('Content-type', 'image/png')
            #self.end_headers()

            self.wfile.write(open("image.html", "rt").read() % ( width, height))
        elif self.path[1:] in allowed_files:
            #self.wfile.write(jquery_page)

            if self.path.endswith('.js'):
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.end_headers()
                self.wfile.write(open(self.path[1:], "rt").read())



def start_server(port):
    global lines
    global clients
    try:
        clients, lines = pickle.load(open('objects.pkl', "rb"))
    except:
        lines = []

    server = HTTPServer(('', port), CompGeoRequestHandler)
    try:
        server.serve_forever()
    except:
        pickle.dump((clients, lines), open('objects.pkl', 'wb'))



if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 32156
    start_server(port)
