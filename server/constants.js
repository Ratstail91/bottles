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

//formatting TODO: use this
String.prototype.lpad = (padString, length) => {
    let str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}

//export
module.exports = {
  facing,
  turnRight,
  turnLeft,
  damageDir
}