/********************************/
/* setup the static file server */
let static = require('node-static');
/* will allow program to serve files from file system */

/* setup the http server */
let http = require('http');

//idk why but this was a extra line, gonna block it off and see if that fixes everything
/*const { Server } = require('node-static'); */

/* not running https, because you need to pay on heroku, and also do some cryptography
also not high security */

/* assume we are running on heroku*/
let port = process.env.PORT;
let directory = __dirname + '/public';

/* if not on heroky then need to adjust port and directory*/
if ((typeof port == 'undefined') || (port === null)) {
    port = 8080;
    directory = './public';
}

/* setup the static file server to deliver files from file system */
let file = new static.Server(directory);

let app = http.createServer(
    function (request, response) {
        request.addListener('end',
            function () {
                file.serve(request, response);
            }
        ).resume();
    }
).listen(port);

console.log('The server is running');

/********************************/
/* setup the web socket server */
const { Server } = require("socket.io");
const io = new Server(app);

io.on('connection', (socket) => {

    /*Output a log message on server and send it to clients */
    function serverLog(...messages) {
        io.emit('log', ['**** Message from the server:\n']);
        messages.forEach((item) => {
            io.emit('log', ['****\t' + item]);
            console.log(item);
        });
    }

    serverLog('a page connected to the server: ' + socket.id);

    socket.on('disconnect', () => {
        serverLog('a page disconnected from the server: ' + socket.id);
    });


    /*join_room command handler
    expected payload:
        {
            'room': room to be joined
            'username': the name of the user joining the room
        }
    join_room_response:
        {
            'result': success
            'room': room that was joined
            'username': the user that joined the room
            'count': number of users in the chat room
        }
    or
        {
            'result': fail
            'message': reason for failure
        }
    */




    //may need to switch payload to something else
    socket.on('join_room', (payload) => {
        serverLog('Server received a command', '\'join_room\'', JSON.stringify(payload));
        //check the data coming from the client is good
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a payload';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }

        let room = payload.room;
        let username = payload.username;
        if ((typeof room == 'undefined') || (room === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a valid room to join';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;

        }
        if ((typeof username == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a valid username to join the chat room';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;

        }

        //handle the command
        socket.join(room);

        //make sure the client was put in the room
        io.in(room).fetchSockets().then((sockets) => {
            serverLog('There are ' + sockets.length + ' clients in the room,' + room);
            //socket didnt join the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.includes(socket)) {
                response = {};
                response.result = 'fail';
                response.messages = 'server internal error joining chat room';
                socket.emit('join_room_response', response);
                serverLog('join_room command failed', JSON.stringify(response));
            } else {
                //socket did join the room
                response = {};
                response.result = 'success';
                response.room = room;
                response.username = username;
                response.count = sockets.length;
                //tell everyone that a new user has joined the chatroom
                io.of('/').to(room).emit('join_room_response', response);
                serverLog('join_room succeeded ', JSON.stringify(response));
            }
        });
    });



    /*send_chat command handler
    expected payload:
        {
            'room': room to which the message should be sent
            'username': the name of the sender
            'message': the message to broadcast
        }
    send_chat_message_response:
        {
            'result': success
            'username': the user that send the message
            'message': the message that was sent
        }
    or
        {
            'result': fail
            'message': reason for failure
        }
    */




    //may need to switch payload to something else
    socket.on('send_chat_message', (payload) => {
        serverLog('Server received a command', '\'send_chat_message\'', JSON.stringify(payload));
        //check the data coming from the client is good
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a payload';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }

        let room = payload.room;
        let username = payload.username;
        let message = payload.message;
        if ((typeof room == 'undefined') || (room === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a valid message';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;

        }
        if ((typeof username == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a valid username as a message source';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        if ((typeof message == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.messages = 'client did not send a valid message ';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }

        //handle the command
        let response = {};
        response.result = 'success';
        response.username = username;
        response.room = room;
        response.message = message;
        //tell everyone in the room what the message is
        io.of('/').to(room).emit('send_chat_message_response', response);
        serverLog('send_chat_message command succeeded', JSON.stringify(response));

    });
});















