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

// send ping to client every n seconds to prevent connection timeout
function sendHeartbeat(){
    // console.log("ping");
    io.sockets.emit('ping', { beat : 1 });
    setTimeout(sendHeartbeat, 10000);
}

// setTimeout(sendHeartbeat, 10000);

io.sockets.on('connection', function (socket) {
    var sessionID = socket.id;
    // setTimeout(function() {
    //     socket.send('Sent a message 3 seconds after connection!');
    //  }, 3000);
    socket.on('disconnect', function () {
        console.log(sessionID + ' disconnected');
     });
     // ?????? still having problem with listening to pong event
    socket.on('pong', function(data){
        console.log(data);
    });

    sendHeartbeat();
    
    socket.emit('message', { message: "your session id is: " + sessionID });

    socket.on('seen', function (data) {
        var notification_id = data.id;
        var user_id = data.user_id;
        var find = Notification.findOne({
            _id : notification_id,
            userID: user_id
        }).then((notification) => {
            if (notification != null) {
                notification.seen = "1"
                notification.save(function(err) {   
                    if (err)
                        console.log(err)
                    else
                        console.log(notification)
                });
            } else {
                console.log("not found")
            }
        });
    });

    socket.on('send', function (data) {
        console.log(data.user_id);
        var r = Math.random();
        var find = UserSession.findOne({
            userID: data.user_id
        }).then((user) => {
            // console.log(user);
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
                console.log(user.sessionID != sessionID);
                if (user.sessionID != sessionID) {
                    user.sessionID = sessionID;
                    user.save(function(err) {   
                        if (err)
                            console.log(err)
                        else
                            console.log('updated user session successfully')
                    });
                }
            }
        }, (e) => {
            console.log(e);
        });

        io.sockets.emit('message', data);
    });
});



//handle notification
app.post("/notifications", function(req, res) {
    var user_id = req.body.user_id;
    var content = req.body.content;
    var url = req.body.url;
    var time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (!url || !user_id || !content) {
        res.statusCode = 400;
        return res.json({});
    }
    var r = Math.random();
    var notification = new Notification({
        nID: r,
        userID: user_id,
        content: content,
        url: url,
        createdAt: time
    });

    notification.save(function (err) {
        if (err) {
            console.log(err);
            //
            res.statusCode = 500;
            return res.json({});
        }
        console.log(notification.id)    
    })

    var query = UserSession.findOne({userID: user_id}, function(err, document) {
        if (err) {
            console.log(err);
            // return res.status(404).send();
        }
        io.to(document.sessionID).emit("notify", {
            "id": notification.id,
            "content": content,
            "url": url,
            "time": time
        });
    });
    res.statusCode = 200
    return res.json({});
});

app.get("/notifications", function(req, res) {
    var page = req.query.page;
    var user_id = req.query.user_id;
    console.log(page, user_id);
    if (!page || !user_id) {
        res.statusCode = 400;
        return res.json();
    }
    let query = Notification.find({
        userID: user_id,
        //
    }).sort('-lastModifiedAt').exec(function(err, notifications) {
        if (err) {
            console.log(err);
            //
            res.statusCode = 500;
            return res.json();
        }
        // console.log(notifications)
        if (!notifications || notifications.length == 0) {
            //
            console.log("aaa");
            res.statusCode = 404;
            return res.json();
        }
        let result = [];
        for (i = 0; i < notifications.length; i++) { 
            var item = notifications[i];
            let noti = {};
            noti["notification_id"] = item.id;
            noti["seen"] = item.seen;
            noti["content"] = item.content;
            noti["url"] = item.url;
            result.push(noti);
        }
        result = result.slice(10*page, 10)
        if (result.length == 0) {
            res.statusCode = 404;
            return res.json();
        }

        return res.json(result);
    });
});

app.put("/notifications", function(req, res) {
    var notification_id = req.body.notification_id;
    var user_id = req.body.user_id;
    console.log(notification_id, user_id);
    if (!notification_id || !user_id) {
        res.statusCode = 400;
        return res.json();
    }
    let query = Notification.find({
        userID: user_id,
        _id: notification_id
        //
    }).exec(function(err, notifications) {
        if (err) {
            console.log(err);
            //
            res.statusCode = 500;
            return res.json();
        }
        // console.log(notifications)
        notification = notifications[0];
        if (!notification) {
            //
            console.log("aaa");
            res.statusCode = 404;
            return res.json();
        }
        notification.seen = "1";
        notification.save(function(err) {   
            if (err){
                console.log(err);
                res.statusCode = 500;
                return res.json();
            }
            else
                // console.log(notification);
                return res.json();
        });

    });
});