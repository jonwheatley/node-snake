var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
		, path = require('path');

var loadFile = function(file, callback) {
	console.log(file + "<--- that is the console log for file");
  path.exists(file, function(exists) {
    if (!exists) {
      callback(null);
    } else {
      fs.readFile(file, 'binary', function(err, data) {
        callback(data);
      });
    }
  });
};

function handler (req, res) {
  var url = req.url;
  
  var serveStatic = function( contentType ) {
  
    var status;
    loadFile(__dirname + url, function(body) {
      if (body) {
        status = 200;
      } else {
        status = 404;
      }
      res.writeHead(status, {
        'content-type': contentType,
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'expires': '-1'
      });
      res.end(body, 'binary');
    });
  
  };


  if (url.indexOf('.css') > -1) {
    serveStatic( 'text/css' );
  } else if (url.indexOf('.js') > -1) {
    serveStatic( 'text/js' );
  } else {
  
    req.setEncoding('utf-8');
    fs.readFile(__dirname + '/index.html', 'utf8', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
  
        res.writeHead(200);
        res.end(data);
    });
  }
}

io.sockets.on('connection', function (socket) {
    socket.on('login', function (name) {
        socket.set('nickname', name, function() {
            console.log(name);
            socket.emit('ready', name);
            socket.broadcast.emit('ready', name);
        });
    });
    
    socket.on('mensagem', function (msg) {
        socket.get('nickname', function (err, name) {
            socket.emit('mensagemclient', msg, name);
            socket.broadcast.emit('mensagemclient', msg, name); 
        });
    });
    
    socket.on('disconnect', function () {
        socket.get('nickname', function (err, name) {
            socket.broadcast.emit('mensagemclient', 'saiu', name);
        });
        console.log('saiu fora');
    });
});

app.listen(8000);