function getIRIParameterValue(requestedKey){
    let pageIRI = window.location.search.substring(1);
    let pageIRIVariables = pageIRI.split('&');
    for(let i = 0 ; i < pageIRIVariables.length; i++){
        let data = pageIRIVariables[i].split('=');
        let key = data[0];
        let value = data[1];
        if (key === requestedKey){
            return value;
        }
    }
}

let username = decodeURI(getIRIParameterValue('username'));
if ((typeof username == 'undefined') || (username === null)){
    username = "Anonymous_"+Math.floor(Math.random()*1000);
}


//$('#messages').prepend('<br>'+username+':</br>');
let chatRoom = 'Lobby';


let socket = io();
socket.on('log',function(array) {
    console.log.apply(console,array);
});



