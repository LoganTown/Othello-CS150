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
    return null;
}

let username = decodeURI(getIRIParameterValue('username'));
if ((typeof username == 'undefined') || (username === null) || (username === 'null')) {
    username = "Anonymous_"+Math.floor(Math.random()*1000);
}


//$('#messages').prepend('<br>'+username+':</br>');
let chatRoom = decodeURI(getIRIParameterValue('game_id'));
if ((typeof chatRoom == 'undefined') || (chatRoom === null) || (chatRoom === 'null')) {
    chatRoom = "Lobby";
}


//set up the socket.io connection to the server
let socket = io();
socket.on('log',function(array) {
    console.log.apply(console,array);
});

socket.on('join_room_response', (payload) => {
    if(( typeof payload == 'undefined') || (payload === null)){
        console.log('Server did not send a payload');
        return;
    }
    if(payload.result === 'fail'){
        console.log(payload.message);
        return;
    }  
    let newHTML = '<p class=\'join_room_response\'>'+payload.username+' joined the '+payload.room+'. (There are '+ payload.count+' users in this room)</p>';
    let newNode = $(newHTML);
    newNode.hide()
    $('#messages').prepend(newNode);
    newNode.show("fade",500);
})

function sendChatMessage(){
    let request = {};
    request.room = chatRoom;
    request.username = username;
    request.message = $('#chatMessage').val();
    console.log('**** Client log message, sending \'send_chat_message\' command: '+JSON.stringify(request));
    socket.emit('send_chat_message', request);
}

socket.on('send_chat_message_response', (payload) => {
    if (( typeof payload == 'undefined') || (payload === null)){
        console.log('Server did not send a payload');
        return;
    }
    if(payload.result === 'fail'){
        console.log(payload.message);
        return;
    }  //something is broken where chat messages arent showing up, not even enter lobby
    let newHTML = '<p class=\'chat_message\'><b>' + payload.username + '</b>:  ' + payload.message + '</p>';
    let newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
    newNode.show("fade", 500);
})


/* request to join chatroom*/
$(() => {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    console.log('**** Client log message, sending \'join_room\' command: '+JSON.stringify(request));
    socket.emit('join_room',request);

    $('#lobbyTitle').html(username + "'s Lobby");

    $('#chatMessage').keypress(function (e) {
        let key = e.which;
        if (key == 13) { //enter key
          $('button[id = chatButton]').click();
          return false;
        }
    })

});

