//imports
let net = require('net');
let { world } = require('./world');

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
    location: { x: 0, y: 0 },  //TODO: pick a random valid location on the map
    facing: 'N',
    command: 'W'
  });

  //handle disconnections
  socket.on('close', () => {
    console.log('a user disconnected');

    world.clients = world.clients.filter((client) => {
      return client.socket !== socket
    });
  });

  socket.on('error', (e) => {
    console.log('error detected', e);
  });

  //handle data
  //TODO: this is some bad looping, need index
  socket.on('data', (data) => {
    world.clients.forEach((client) => {
      if (client.socket === socket) {
        client.command = data.toString()[0].toUpperCase();
      }
    });
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
