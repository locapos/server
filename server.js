const express = require('express');
const app = express();

app.get('/', function(req, res){
  res.send('ok');
});

app.listen(process.env.PORT);
