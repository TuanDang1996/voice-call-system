# Run command:
#
#   $ python3 HttpPostServer.py
#
# Test POST with a complete file:
#
#   $ curl --data-binary "@small_file.bin" "http://127.0.0.1:8080/small.bin"
#
# Test POSTing a file progressively (chunked mode):
#
#   $ curl --header "Transfer-Encoding: chunked" \
#          --data-binary "@large_file.bin" "http://127.0.0.1:8080/large.bin"


from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 3000


class TestHTTPRequestHandler(SimpleHTTPRequestHandler):
    # Comment out to use the default base implementation of do_GET().
    def do_GET(self):
        print("### GET handler")
        print(self.headers)

        self.send_response(200)
        self.end_headers()

        self.wfile.write(b"Hello, world!")

    def do_POST(self):
        print("### POST handler")
        print(self.headers)

        self.send_response(200)
        self.end_headers()

        path = self.translate_path(self.path)

        if "Content-Length" in self.headers:
            content_length = int(self.headers["Content-Length"])
            body = self.rfile.read(content_length)
            with open(path, "wb") as out_file:
                out_file.write(body)
        elif "chunked" in self.headers.get("Transfer-Encoding", ""):
            with open(path, "wb") as out_file:
                while True:
                    line = self.rfile.readline().strip()
                    chunk_length = int(line, 16)
                    if chunk_length == 0:
                        break
                    chunk = self.rfile.read(chunk_length)
                    out_file.write(chunk)

                    # Each chunk is followed by an additional empty newline
                    # that we have to consume.
                    self.rfile.readline()

    def do_PUT(self):
        print("### PUT handler")
        self.do_POST()


httpd = HTTPServer(("", PORT), TestHTTPRequestHandler)

print("Serving at port:", httpd.server_port)
httpd.serve_forever()
