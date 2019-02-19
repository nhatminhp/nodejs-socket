window.onload = function() {

    var messages = [];
    var socket = io.connect('http://localhost:3701');
    var field = document.getElementById("field");
    var user_id_field = document.getElementById("user-id-field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    socket.emit('send', { message: "an user have just joined", user_id: "default"});
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html +=  messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    sendButton.onclick = function() {
        var text = field.value;     
        var user_id = user_id_field.value;
        socket.emit('send', { message: text, user_id: user_id});        
    };

}