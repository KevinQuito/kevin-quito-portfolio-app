// server.js
// where your node app starts

// init project
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
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

app.get("/fileMetadata", function(req, res){
  res.sendFile(__dirname + '/views/fileMetadata.html');
})
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
// app.get("/api/:date_string", function(req, res){
//   console.log(req); // shows all the data in a big json object including params
//
//   let dateString = req.params.date_string;
//   if(parseInt(dateString) > 10000){
//     let unixTime = new Date(parseInt(dateString));
//     res.json({"unix" : unixTime.getTime(),
//               "utc" : unixTime.toUTCString()
//             });
//   }
//   let passedInValue = new Date(dateString);
//   console.log(dateString, typeof dateString, Object.keys(dateString)); // This should give us a lot more information so we know what to do with the dateString object.
//   if(passedInValue == "Invalid Date"){
//     res.json({"error" : "Invalid Date" });
//   }else{
//     res.json({"unix" : passedInValue.getTime(),
//               "utc" : passedInValue.toUTCString()
//             });
//   }
// });
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
  const myURL = new URL(client_requested_url);  // node.js URL
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
// below are the schema models we are using
// var ExerciseUser = mongoose.model('ExerciseUser', new mongoose.Schema({
//   _id: String,
//   username: {type: String, required: true}
// }));
// var NewExercise = mongoose.model('NewExercise', new mongoose.Schema({
//   description: {type: String, required: true},
//   duration: {type: Number, required: true},
//   date: String
// }));
//
// app.post("/api/users", (req, res) => {
//   // console.log(req.body)
//   let mongooseGeneratedID = mongoose.Types.ObjectId();
//   // console.log(mongooseGeneratedID, "<= mongooseGeneratedID")
//   let exerciseUser = new ExerciseUser({
//     username: req.body.username,
//     _id: mongooseGeneratedID
//   });
//   // console.log(newExercise, " <= newExercise");
// // this will save it to our mongodb database
//   exerciseUser.save((err, doc) => {
//     if(err) return console.log(err);
//     // console.log("About to save exerciseUser")
//     res.json({
//       "username": exerciseUser.username,
//       "_id": exerciseUser["_id"]
//     });
//   });
// });
//
// app.get("/api/users", (req, res) => {
//   ExerciseUser.find({}, (err, exerciseUsers) => {
//     res.json(exerciseUsers);
//   });
//   });
// app.post("/api/users/:_id/exercises", (req, res) => {
//
// });
let exerciseSessionSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: String
});
let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseSessionSchema]
});
let Session = mongoose.model('Session', exerciseSessionSchema);
let User = mongoose.model('User', userSchema);

app.post("/api/users", bodyParser.urlencoded({extended:false}), (req, res)  =>{
  // console.log(req.body);
  let newUser = new User({username: req.body.username})
  newUser.save((err, savedUser) => {
    if(!err){
      let responseObject = {};
      responseObject['username'] = savedUser.username;  // this will be taken from the mongodb database
      responseObject['_id'] = savedUser.id;
      res.json(responseObject);
    }
  })
});
app.get("/api/users", (req, res) => {
  User.find({}, (err, arrayOfUsers) => {
    if(!err){
      res.json(arrayOfUsers);
    }
  })
});
app.post("/api/users/:_id/exercises", bodyParser.urlencoded({extended:false}), (req, res)  =>{
    // console.log(req.body)
    let newSession = new Session({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date
    });
    // console.log(newSession.date, "before")
    if(newSession.date === undefined || newSession.date === ''){
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + '/' + mm + '/' + dd;
      newSession.date = today;
      // console.log(newSession.date, "after")
    }else{
      var parts = newSession.date.split('-');
      var yyyy = parseInt(parts[0]);
      var mm = parseInt(parts[1]);
      var dd = parseInt(parts[2])

      date = yyyy + '/' + mm + '/' + dd;
      newSession.date = date;
      // console.log(newSession.date, "test")
    }
    User.findByIdAndUpdate(
      req.params._id,
      {$push: {log: newSession}},
      {new: true},
      (err, updatedUser) => {
        if(!err){
        let responseObject = {};
        // console.log(newSession.date)
        responseObject['_id'] = updatedUser.id;
        responseObject['username'] = updatedUser.username;
        responseObject['date'] = new Date(newSession.date).toDateString();
        responseObject['description'] = newSession.description;
        responseObject['duration'] = newSession.duration;
        // console.log(responseObject);
        res.json(responseObject);
        }
      }
    )
});
app.get("/api/users/:_id/logs", (req, res) => {
  inputID = req.params._id;
  // console.log(inputID);
  User.findById(inputID, (err, result) => {
    let responseObj = {...result._doc};
    // console.log(responseObj)
    if(err) {
      res.json({error: err});
    } else {

      if(req.query.from || req.query.to){
        let fromDate = new Date(0);
        let toDate = new Date();

        if(req.query.from){
          fromDate = new Date(req.query.from);
        }
        if(req.query.to){
          toDate = new Date(req.query.to);
        }
        // in order to compare we need to use unix timestamps so .getTime() will convert it to a unix timestamp
        fromDate = fromDate.getTime();
        toDate = toDate.getTime();

        responseObj.log = responseObj.log.filter((session) => {
          let sessionDate = new Date(session.date).getTime();

          return sessionDate >= fromDate && sessionDate <= toDate
        });
      }
      if(req.query.limit){
        responseObj.log = responseObj.log.slice(0, req.query.limit);
      }

      responseObj['count'] = result.log.length
      res.json(responseObj);
      // console.log(responseObj);
    }
  })
});


// FILE METADATA
// use multer to look into the upfile input that was in the fileMetada.html form and
// picked out the file that was attached to it that was in the html form uploader. then
// it put that file into the buff field in the req.file
var FileInfo = mongoose.model('FileInfo', new mongoose.Schema({
  name: String,
  type: String,
  size: Number
}));

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  console.log(req.file);
  let newFile = new FileInfo({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
  newFile.save((err, doc) => {
    if(err) return console.log(err);
    console.log(newFile)
    res.json({
               "name" : newFile.name,
               "type" : newFile.type,
               "size" : newFile.size
    });
  });
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
