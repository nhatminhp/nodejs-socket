var express = require('express');
var app = express();
var port = 3000;
const db = require('./utils/db');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const {
    UserSession 
} = require('./models/UserSession');
const {
    Notification
} = require('./models/Notification');


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

// var http = require('http').Server(app);

// var io = require('socket.io')(http, {'pingInterval': 2000, 'pingTimeout': 5000}).listen(app.listen(port));

// var sessionID;

function sendHeartbeat(){
    console.log("ping");
    setTimeout(sendHeartbeat, 8000);
    io.sockets.emit('ping', { beat : 1 });
}

io.sockets.on('connection', function (socket) {
    var sessionID = socket.id;
    // setTimeout(function() {
    //     socket.send('Sent a message 3 seconds after connection!');
    //  }, 3000);
    socket.on('disconnect', function () {
        console.log(sessionID + ' disconnected');
     });
    socket.on('pong', function(data){
        console.log("Pong received from client");
    });
    socket.emit('message', { message: "your session id is: " + sessionID });
    socket.on('send', function (data) {
        console.log(data.user_id);
        var r = Math.random();
        var find = UserSession.findOne({
            userID: data.user_id
        }).then((user) => {
            console.log(user);
            if (user == null) {
                var userSession = new UserSession({
                    usID: r,
                    userID: data.user_id,
                    sessionID: sessionID,
                    isActive: "1",
                });
                userSession.save(function (err) {
                    if (err) {
                        console.log(err)
                    }
                    console.log('User Session Created successfully')
                })
            } else {
                user.sessionID = sessionID;
                user.save(function(err) {   
                    if (err)
                      console.log(err)
                    else
                      console.log('updated user session successfully')
                  });
            }
        }, (e) => {
            console.log(e);
        });

        io.sockets.emit('message', data);
    });
});

setTimeout(sendHeartbeat, 8000);

//handle notification
app.post("/notification", function(req, res) {
    var user_id = req.body.user_id;
    var content = req.body.content;
    var url = req.body.url;
    if (!url || !user_id || !url) {
        res.statusCode = 400;
        return res.json({});
    } 
    var r = Math.random();
    var notification = new Notification({
        nID: r,
        userID: user_id,
        content: content,
        url: url
    });
    notification.save(function (err) {
        if (err) {
            console.log(err);
            res.statusCode = 500
            return res.json({});
        }
        console.log('Notification Created successfully')
        
    })
    var query = UserSession.findOne({userID: user_id}, function(err, document) {
        if (err) {
            console.log(err);
            // return res.status(404).send();
        }
        io.to(document.sessionID).emit("notify", {
            "content": content,
            "url": url
        });
    });
    res.statusCode = 200
    return res.json({});
});