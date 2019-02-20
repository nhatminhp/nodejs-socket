var express = require('express');
var app = express();
var port = 3701;
const db = require('./utils/db');
const bodyParser = require('body-parser');
const {
    UserSession 
} = require('./models/UserSession');
app.use(bodyParser.json())
//Template
app.set('views', __dirname + '/template');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("index");
});


//handle notification
app.post("/notification", function(req, res) {
    console.log(req.body);
    res.status(200).send();
});



//Socket
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    var sessionID = socket.id;
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
