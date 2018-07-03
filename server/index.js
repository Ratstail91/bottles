let express = require('express');
let app = express();
let http = require('http').Server(app);

//test
app.get('/ping', function(req, res) {
  res.write('<p>pong</p>');
});

app.get('*', (req, res) => {
  res.write('<p>error</p>');
});

http.listen(6000, () => {
  console.log('listening to *:6000');
});
