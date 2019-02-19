var express = require('express');
var app = express();
var port = 3701;

//Template
app.set('views', __dirname + '/template');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("index");
});

//Socket
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: "your session id is: " + socket.id });
    socket.on('send', function (data) {
        console.log(data);
        io.sockets.emit('message', data);
    });
});
