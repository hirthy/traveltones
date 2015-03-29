var express = require('express');
var app     = express();

var redis = require("redis")
  , client = redis.createClient();

var fs = require('fs'),
    byline = require('byline');
 
var stream = byline(fs.createReadStream('bike_data.csv', { encoding: 'utf8' }));
client.on("error", function (err) {
  console.log("Error " + err);
});

app.use(express.static(__dirname));

app.all('/trip/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/trip/:time', function(req, res){
  client.hgetall(req.params.time, function (err, reply) {
    res.json(reply);
  });
});

app.get('/load', function(req, res){
  stream.on('data', function(line) {
    var arr = line.split(',');
    var id = arr[0];
    var date = arr[1];
    var coords = { latitude: arr[3], longitude: arr[4] };
    //client.set(date, JSON.stringify(coords), redis.print);
    client.hset(date, id, JSON.stringify(coords), redis.print);
  });
});
 
app.listen(3012);

