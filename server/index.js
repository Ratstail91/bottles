let net = require('net');

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
net.createServer((socket) => {
  console.log('a user connected');

  //add to the list of clients
  world.clients.push({
    socket: socket,
    name: socket.remoteAddress + ':' + socket.remotePort,
    hp: 10,
    location: { x: 0, y: 0 },
    facing: 'N'
  });

  //handle disconnections
  socket.on('end', () => {
    console.log('a user disconnected');

    world.clients = world.clients.filter((client) => {
      return client.socket !== socket
    });
  });

  //handle data
  socket.on('data', (data) => {
    broadcast(data, socket);
  });
}).listen(6000);

console.log('Server listening on port 6000');

//for debugging
function broadcast(message, senderSocket) {
  world.clients.forEach((client) => {
    if (client.socket == senderSocket) {
      return;
    }
    client.socket.write(message);
  });
}
