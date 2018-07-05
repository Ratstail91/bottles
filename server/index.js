//imports
let net = require('net');

//constants
const facing = {
  "N": { x: 1, y: 0 },
  "S": { x: -1, y: 0 },
  "E": { x: 0, y: 1 },
  "W": { x: 0, y: -1 },
}

const turnRight = {
  "N": "E",
  "E": "S",
  "S": "W",
  "W": "N"
}

const turnLeft = {
  "N": "W",
  "W": "S",
  "S": "E",
  "E": "N"
}

const damageDir = {
  "N": "S",
  "S": "N",
  "W": "E",
  "E": "W"
}

//TODO: second map, same dimentions, store bot in map cords
// this will allow rapid checking if a bot is at a location and save some really bad looping

//TODO: make a function that returns a list of 'projected' cordinates in a direction
// going to need this behavior in multiple locations

//world data goes here
let world = {
  map: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ],
  //the list of clients
  clients: [],

  onTick: () => {
    world.HandleMovement();
    world.HandleVision();
    world.HandleShooting();
    world.HandleDeadBots();
    world.ResetBots();
  },

  HandleMovement: () => {
    //Handle Movement
    world.clients.forEach((client) => {
      if (client.command == "F") {
        var newX = client.location.x + facing[client.facing].x;
        var newY = client.location.y + facing[client.facing].y;
        if (
          //TODO: CheckValidSpace(newX, newY)
          newX >= 0 &&
          newX < world.map.length &&
          newY >= 0 &&
          newY < world.map[0].length
          && (world.map[newX][newY] == 0)
        ) {
          //check for a bot in the new position
          //TODO: CheckForBot(newX, newY)
          let botcheck = world.clients.map((bcClient) => {
            return bcClient.location.x == newX && bcClient.location.y == newY;
          });
          //if there is no bot in the new position, move there
          if (!botcheck.includes(true)) {
            client.location.x = newX;
            client.location.y = newY;
          }
        }
      }

      //turn left or turn right
      if (client.command == "R") {
        client.facing = turnRight[client.facing];
      }
      if (client.command == "L") {
        client.facing = turnLeft[client.facing];
      }
    });
  },

  HandleVision: () => {
    //Handle Vision
    world.clients.forEach((client) => {
      var dir = facing[client.facing];
      var start = client.location;

      var distance = 1;
      var foundWall = false;
      var seen = "W";
      while (!foundWall) {
        newX = start.x + dir.x * distance;
        newY = start.y + dir.y * distance;

        if (
          //TODO: CheckValidSpace(newX, newY)
          newX >= 0 &&
          newX < world.map.length &&
          newY >= 0 &&
          newY < world.map[0].length
          && (world.map[newX][newY] == 0)

        ) {
          //TODO: CheckForBot(newX, newY)
          let botcheck = world.clients.map((bcClient) => {
            return bcClient.location.x == newX && bcClient.location.y == newY;
          });
          if (botcheck.includes(true)) {
            foundWall = true;
            seen = "B";
          } else {
            distance += 1;
          }
        } else {
          foundWall = true
        }
      }

      //TODO: PrintSuchAndSuch()
      //TODO: make the number format a fixed number of characters
      client.socket.write(client.location.x.toString() + ":" + client.location.y.toString() + ":" + client.facing + "\n");
      client.socket.write(distance.toString() + seen + "\n");
    });
  },

  HandleShooting: () => {
    //Handle Shooting
    world.clients.forEach((client) => {
      //TODO: Actually Do This
      if (client.command == "S") {
        var dir = facing[client.facing];
        var xFacing = client.facing;
        var start = client.location;

        var distance = 1;
        var hitSomething = false;
        while (!hitSomething) {
          newX = start.x + dir.x * distance;
          newY = start.y + dir.y * distance;

          if (
            newX >= 0 &&
            newX < world.map.length &&
            newY >= 0 &&
            newY < world.map[0].length
            && (world.map[newX][newY] == 0)

          ) {
            world.clients.forEach((client) => {
              if (client.location.x == newX && client.location.y == newY) {
                hitSomething = true;
                client.socket.write("D" + damageDir[xFacing] + "\n");
                client.hp -= 1;
              }
            });

            distance += 1;
          } else {
            hitSomething = true;
          }

        }
      }
    });
  },

  HandleDeadBots: () => {
    //TODO handle "Dead" Bots
    // could either disconnect them or send mesage + reset HP + "response"
  },

  ResetBots: () => {
    //Reset command & print current HP
    world.clients.forEach((client) => {
      //TODO: PrintSuchAndSuch(), with carriage return
      client.socket.write("HP" + client.hp.toString() + "\n\n");
      client.command = "W";
    });
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
    location: { x: 0, y: 0 },  //TODO: pick a random valid location on the map
    facing: 'N',
    command: 'W'
  });

  //handle disconnections
  socket.on('end', () => {
    console.log('a user disconnected');

    world.clients = world.clients.filter((client) => {
      return client.socket !== socket
    });
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
