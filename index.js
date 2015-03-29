var express = require('express');
var app     = express();
var path    = require('path');

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

var fs = require('fs'),
    byline = require('byline');
 
var stream = byline(fs.createReadStream('bike_data.csv', { encoding: 'utf8' }));
redis.on("error", function (err) {
  console.log("Error " + err);
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/trip/:time', function(req, res){
  redis.hgetall(req.params.time, function (err, reply) {
    res.json(reply);
  });
});

app.get('/load', function(req, res){
  stream.on('data', function(line) {
    var arr = line.split(',');
    var id = arr[0];
    var date = arr[1];
    var coords = { latitude: arr[3], longitude: arr[4] };
    redis.hset(date, id, JSON.stringify(coords), redis.print);
  });
});
 
app.listen(process.env.PORT || 3000);

