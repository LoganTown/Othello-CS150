/********************************/
/* setup the static file server */
let static = require('node-static');
/* will allow program to serve files from file system */

/* setup the http server */
let http = require('http');
/* not running https, because you need to pay on heroku, and also do some cryptography
also not high security */

/* assume we are running on heroku*/
let port = process.env.PORT;
let directory = __dirname + '/public';

/* if not on heroky then need to adjust port and directory*/
if ((typeof port == 'undefined') || port === null) {
    port = 8080;
    directory = './public';
}

/* setup the static file server to deliver files from file system */
let file = new static.Server(directory);

let app = http.createServer( 
    function(request,response) {
        request.addListender('end', 
            function(){
                file.serve(request,response);
            }
        ).resume();
    }
).listen(port);

console.log('The server is running');