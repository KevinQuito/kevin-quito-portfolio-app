// server.js
// where your node app starts

// init project
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var app = express();
var port = process.env.PORT || 3000;
// database for production app
//  mongoose.connect(process.env.DB_URI);
// database for local app
/* Database Connection */
database_uri = 'mongodb+srv://KevinQuito:chipmunk1@cluster0.laogv.mongodb.net/Cluster0?retryWrites=true&w=majority'
  mongoose.connect(database_uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

// controller
// These are where you set up the routes, so when the user clicks
// on a link like Timestamp Microservices, Request Header Parser, or URL
// Shortener Microservice, then it will take the user to that page
app.get("/timestamp", function(req, res){
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function(req, res){
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlShortenerMicroservice", function(req, res){
  res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
});
app.get("/exerciseTracker", function(req, res){
  res.sendFile(__dirname + '/views/exerciseTracker.html');
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
// REQUEST HEADER PARSER
app.get("/api/whoami", function(req, res){
  res.json({
    // "value": Object.keys(req),
    "ipaddress": req.ip, // gets ip address from node request
    "language": req.headers["accept-language"], // gets the language from a user via node
    "software": req.headers["user-agent"] // gets the software from the user
    // "req-inspection": req.headers // gives all the information needed from the user
  });
});
// TIMESTAMP
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
// URL SHORTENER SERVICE
// Note: A body parser makes it so that when someone posts a url to us, then we can receive it as a json Object
// Build a schema and model to store saved URLS
var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String,
  protocol: String
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}));

// parse application/json
app.use(bodyParser.json());

// app.post('/api/users', jsonParser, function(req, res){
// create user in req.body
//})
app.post("/api/shorturl/", (req,res) => {
  // console.log(req.body);
  if(!req.body.url.includes('http')){
    console.log("error");
      res.json({ error: 'invalid url' });
      return;
  }
  let client_requested_url = req.body.url;
  const myURL = new URL(client_requested_url);
console.log(myURL.protocol);
  let protocol = myURL.protocol;
  let suffix = shortid.generate();

  let newURL = new ShortURL({
    short_url: suffix,
    original_url: client_requested_url,
    suffix: suffix,
    protocol: protocol
  });
  // this will save it to our mongodb database
  newURL.save((err, doc) => {
    if(err) return console.log(err);
    res.json({ "saved" : true,
               "short_url" : newURL.short_url,
               "original_url" : newURL.original_url,
               "suffix" : newURL.suffix,
               "protocol" : newURL.protocol
    });
  });
});
app.get("/api/shorturl/:suffix", (req, res) => {
    let userGeneratedSuffix = req.params.suffix;
    ShortURL.find({suffix: userGeneratedSuffix}).then(foundUrls => {
      // console.log(foundUrls)
      let userRedirect = foundUrls[0];
        res.redirect(userRedirect.original_url);
    });
  });

// EXERCISE TRACKER
var ExerciseUser = mongoose.model('ExerciseUser', new mongoose.Schema({
  _id: String,
  username: String
}));

app.post("/api/users", (req, res) => {
  console.log(req.body)
  let mongooseGeneratedID = mongoose.Types.ObjectId();
  console.log(mongooseGeneratedID, "<= mongooseGeneratedID")
  let newExercise = new ExerciseUser({
    username: req.body.username,
    _id: mongooseGeneratedID
  });
  console.log(newExercise, " <= newExercise");
// this will save it to our mongodb database
  newExercise.save((err, doc) => {
    if(err) return console.log(err);
    console.log("About to save newExercise")
    res.json({
      "username": newExercise.username,
      "_id": newExercise._id
    });
  });
});



// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
