from BaseHTTPServer import HTTPServer
from CGIHTTPServer import CGIHTTPRequestHandler

#static_page = open("index.html", "rt").read()
#jquery_page = open("jquery.min.js", "rt").read()
lines = []
lines_index = 0
    
class CompGeoRequestHandler(CGIHTTPRequestHandler):
    def myheaders(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        global lines_index
        global lines
        #global static_page

        try:
            ind = int(self.path[1:])
            if ind - lines_index < 0: 
                lines_index = 0
                ind = 0
            self.myheaders()
            self.wfile.write(repr([lines[ind - lines_index:], lines_index, len(lines)]))
        except ValueError:
            if self.path.startswith('/add'):
                coords = [int(a) for a in self.path[len('/add/'):].split('/')]
                lines.append(coords)
                self.myheaders()
                self.wfile.write("")
            elif self.path.startswith('/clean'):
                lines_index += len(lines)
                lines = []
                self.myheaders()
                self.wfile.write("")
            elif self.path.startswith('/undo'):
                #lines_index -= 1
                del lines[len(lines) - 1]
                self.myheaders()
                self.wfile.write("")
            elif self.path == '/':
                #self.wfile.write(static_page)
                self.myheaders()
                self.wfile.write(open("index.html", "rt").read())
            elif self.path == '/jquery.min.js':
                #self.wfile.write(jquery_page)
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.end_headers()
                self.wfile.write(open("jquery.min.js", "rt").read())

        

def start_server(port):
    server = HTTPServer(('', port), CompGeoRequestHandler)
    server.serve_forever()



if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 32156
    start_server(port)
