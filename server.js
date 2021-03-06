var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var app = express();
port = 8080;

app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.json());

app.get('/', function(req, res){
    var html = fs.readFileSync('app/index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.get(/.js|.html|.css|.gif/, function(req, res) {
	if (req.url.indexOf(".js") > -1) {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
	}
	if (req.url.indexOf(".gif") > -1) {
		res.writeHead(200, {'Content-Type': 'image/gif' });
	}
	if (req.url.indexOf(".html") > -1) {
		res.writeHead(200, {'Content-Type': 'text/html'});
	}
	if (req.url.indexOf(".css") > -1) {
		res.writeHead(200, {'Content-Type': 'text/css'});
	}
    res.end(fs.readFileSync("app/" + req.url));
});

app.listen(port);
console.log('Listening at http://localhost:' + port);