var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var app = express();
port = 8080;

app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.json());

app.get('/', function(req, res){
    var html = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
});

app.get(/.js|.html/, function(req, res) {
	if (req.url.indexOf(".js") > -1) {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
	}
	if (req.url.indexOf(".html") > -1) {
		res.writeHead(200, {'Content-Type': 'text/html'});
	}
    res.end(fs.readFileSync("./" + req.url));
});

app.post('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("Greetings from the server: " + JSON.stringify(req.body));
});
app.listen(port);
console.log('Listening at http://localhost:' + port);