var Citibike = require('citibike')
  , citibike = new Citibike;

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
  client.get(req.params.time, function (err, reply) {
    console.log(reply.toString());
    res.json(reply);
  });
});

app.get('/load', function(req, res){
  stream.on('data', function(line) {
    var arr = line.split(',');
    var date = arr[1].replace(/(^"|"$)/g, '');
    var coords = { latitude: arr[5].replace(/(^"|"$)/g, ''), longitude: arr[6].replace(/(^"|"$)/g, '') };
    client.set(date, JSON.stringify(coords), redis.print);
  });
});
 
app.listen(3012);