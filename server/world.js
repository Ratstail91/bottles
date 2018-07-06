let { facing, turnLeft, turnRight, damageDir } = require("./constants");

//TODO: second map, same dimentions, store bots in map coords; this will allow rapid checking if a bot is at a location and save some really bad looping (CheckForBot())
//TODO: make a function that returns a list of 'projected' cordinates in a direction; going to need this behavior in multiple locations

//world data goes here
let world = {
  //the map data
  //TODO: Initialize() - generate map and tick the world
  map: [
    [0, 0, 0, 0, 0, 0], //   --> East
    [0, 0, 0, 0, 0, 0], // |
    [1, 0, 1, 1, 0, 0], // |
    [0, 0, 1, 1, 0, 0], // V North
    [0, 0, 0, 0, 0, 0], //
    [0, 0, 0, 0, 0, 0]  // Starts at top left, facing north by default
  ],

  //the list of clients
  clients: [],

  //called once per second
  onTick: () => {
    HandleMovement();
    HandleVision();
    HandleShooting();
    HandleDeadBots();
    ResetBots();
  }
};

//onTick functions
function HandleMovement() {
  //Handle Movement
  world.clients.forEach((client) => {
    //move forward
    if (client.command == "F") {
      var newX = client.location.x + facing[client.facing].x;
      var newY = client.location.y + facing[client.facing].y;
      if (CheckValidSpace(newX, newY) && CheckSpaceFree(newX, newY)) {
        client.location.x = newX;
        client.location.y = newY;
      }
    }

    //turn left or turn right
    else if (client.command == "R") {
      client.facing = turnRight[client.facing];
    }
    else if (client.command == "L") {
      client.facing = turnLeft[client.facing];
    }
  });
}

function HandleVision() {
  //Handle Vision
  world.clients.forEach((client) => {
    let dir = facing[client.facing];
    let start = client.location;

    let distance = 1;
    let foundWall = false;
    let seen = "";

    //extrude outwards until something is found in a certain direction
    while (!foundWall) {
      newX = start.x + dir.x * distance;
      newY = start.y + dir.y * distance;

      if (CheckValidSpace(newX, newY)) {
        if (!CheckSpaceFree(newX, newY)) {
          foundWall = true;
          seen = "B";
        } else {
          distance += 1;
        }
      } else {
        foundWall = true;
        seen = "W";
      }
    }

    //TODO: PrintSuchAndSuch()
    //TODO: make the number format a fixed number of characters
    PrintToClient(client, client.location.x, ":", client.location.y, ":", client.facing);
    PrintToClient(client, distance, seen);
  });
}

function HandleShooting() {
  //Handle Shooting
  world.clients.forEach((client) => {
    if (client.command == "S") {
      let dir = facing[client.facing];
      let xFacing = client.facing;
      let start = client.location;

      let distance = 1;
      let hitSomething = false;
      //find a thing to hit
      while (!hitSomething && distance <= 3) {
        newX = start.x + dir.x * distance;
        newY = start.y + dir.y * distance;

        if (CheckValidSpace(newX, newY)) {
          //NOTE: bad looping here; a reference within a second map would be useful if the map gets larger
          world.clients.forEach((target) => {
            if (target.location.x == newX && target.location.y == newY) {
              PrintToClient(target, "D", damageDir[xFacing]);
              PrintToClient(client, "H", distance);
              target.hp -= 1;
              hitSomething = true;
            }
          });
          distance += 1;
        } else {
          hitSomething = true;
        }
      }
    }
  });
}

function HandleDeadBots() {
  //TODO handle "Dead" Bots; could either disconnect them or send mesage + reset HP + "response"
}

function ResetBots() {
  //Reset command & print current HP
  world.clients.forEach((client) => {
    PrintToClient(client, "HP", client.hp);
    client.command = "W";
  });
}

//utility functions
function CheckValidSpace(x, y) {
  //returns true if x & y are within bounds and equal to zero
  return (x >= 0) && (x < world.map.length) && (y >= 0) && (y < world.map[0].length) && (world.map[x][y] == 0);
}

function CheckSpaceFree(x, y) {
  //returns true if the space (x, y) is free of bots
  let botcheck = world.clients.map((bcClient) => {
    return bcClient.location.x == x && bcClient.location.y == y;
  });
  return !botcheck.includes(true);
}

function PrintToClient(client, ...args) {
  //returns nothing, prints each argument to the client
  for (let i = 0; i < args.length; i++) {
    client.socket.write(args[i].toString());
  }
  //end line character
  client.socket.write("\r\n");
}

//export
module.exports = { world };