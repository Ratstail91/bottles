let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

//world data goes here
let world = {
  //the list of clients
  clients: [],

  onTick: () => {
    //do stuff
    console.log('tick');
  }
};

//tick the world
setInterval(world.onTick, 1000);

//connections
io.on('connection', (socket) => {
  console.log('a user connected');

  //add to the list of clients
  world.clients.push({
    //client data goes here
    socket: socket
  });

  socket.on('disconnect', () => {
    client.log('a user disconnected');
  });

  //each type of message we can receive
  socket.on('request', (msg) => {
    io.emit('response', msg); //echo the message as a response
  });
});

//finally
http.listen(6000, () => {
  console.log('listening to *:6000');
});
