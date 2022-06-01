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
if ((typeof port == 'undefined') || ( port === null)) {
    port = 8080;
    directory = './public';
}

/* setup the static file server to deliver files from file system */
let file = new static.Server(directory);

let app = http.createServer( 
    function(request,response){
        request.addListener('end', 
            function(){
                file.serve(request,response);
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
    function serverLog(...messages){
        io.emit('log',['**** Message from the server:\n']);
        messages.forEach((item) => {
            io.emit('log',['****\t'+item]);
            console.log(item);
        });
    }

    serverLog('a page connected to the server: '+socket.id);

    socket.on('disconnect', () => {
        serverLog('a page disconnected from the server: '+socket.id);
    });
});















