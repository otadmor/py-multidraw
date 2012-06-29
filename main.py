from BaseHTTPServer import HTTPServer
from CGIHTTPServer import CGIHTTPRequestHandler
import pickle
#static_page = open("index.html", "rt").read()
#jquery_page = open("jquery.min.js", "rt").read()
lines = []
lines_index = 0

allowed_files = ["jquery.min.js", "jquery.ui.core.js", "jquery.ui.widget.js", "jquery.ui.mouse.js", "jquery.ui.slider.js",]
    
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
            self.wfile.write(repr([lines[ind - lines_index:], lines_index, len(lines)]).replace("'", '"'))
        except ValueError:
            if self.path.startswith('/add'):
                coords = [a for a in self.path[len('/add/'):].split('/')]
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
            elif self.path[1:] in allowed_files:
                #self.wfile.write(jquery_page)
                
                if self.path.endswith('.js'):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/javascript')
                    self.end_headers()
                    self.wfile.write(open(self.path[1:], "rt").read())

        

def start_server(port):
    global lines
    try:
        lines = pickle.load(open('objects.pkl', "rb"))
    except:
        lines = []
        
    server = HTTPServer(('', port), CompGeoRequestHandler)
    try:
        server.serve_forever()
    except:
        pickle.dump(lines, open('objects.pkl', 'wb'))



if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 32156
    start_server(port)
