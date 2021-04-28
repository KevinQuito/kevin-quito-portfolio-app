// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/", function(req, res){
  var now = new Date();
  res.json({
    "unix" : now.getTime(),
    "utc" : now.toUTCString()
  });
});

// The api endpoint is GET [project_url]/api/timestamp/:date_string
app.get("/api/:date_string", function(req, res){
  console.log(req); // shows all the data in a big json object including params

  let dateString = req.params.date_string;
  if(parseInt(dateString) > 10000){
    let unixTime = new Date(parseInt(dateString));
    res.json({"unix" : unixTime.getTime(),
              "utc" : unixTime.toUTCString()
            });
  }
  let passedInValue = new Date(dateString);
  console.log(dateString, typeof dateString, Object.keys(dateString)); // This should give us a lot more information so we know what to do with the dateString object.
  if(passedInValue == "Invalid Date"){
    res.json({"error" : "Invalid Date" });
  }else{
    res.json({"unix" : passedInValue.getTime(),
              "utc" : passedInValue.toUTCString()
            });
  }
});



// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
