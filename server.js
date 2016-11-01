var express = require('express'),
    http = require('http'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    redis = require("redis"),
    redisClient,
    counts = {};

app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());



mongoose.connect('mongodb://localhost/assignment04');
redisClient = redis.createClient();

http.createServer(app).listen(3000);
console.log('Listening on port 3000');

// Creating Model for questions, answers, and answerId.
// This also names the collection to 'trivia' for the TriviaSchema.
var TriviaSchema = new mongoose.Schema({
  'question': String,
  'answer': String,
  'answerId': Number
}, {collection: 'trivia'});

var Trivia = mongoose.model('Trivia', TriviaSchema);

// GET method for /question
// Sends the user a question from the database
app.get('/question', function(req, res) {

  // Get last entry from the database.
  // Then using it as a total to generate random numbers.
  Trivia.findOne().sort({'answerId': -1}).exec(function(err, data) {
    if(err) {
      console.log("Error: not found!");
    }
    else {
      var randomNum = Math.floor((Math.random() * data.answerId) + 1);

      // Send random generated question.
      // reference: http://mongoosejs.com/docs/queries.html
      Trivia.findOne({answerId: randomNum}, function(err, data) {
        if(err) {
          return handleError(err);
        }
        else {
          res.json(data);
        }
      });
    }
  });
});

app.post('/answer', function(req, res) {

  var userInfo = req.body.data;

  console.log(typeof(userInfo));
  userInfo = JSON.parse(userInfo);
  console.log(typeof(userInfo));

  var userAnswer = userInfo.answer;
  var answerKey = userInfo.answerId;

  console.log(userAnswer);
  console.log(answerKey);

  Trivia.findOne({answerId: answerKey}, function(err, data) {
    if(err) {
      console.log('Question not found.');
    }
    else {
      console.log(data + " type: " + typeof(data));
      console.log(data.answer);

      if(data.answer === userAnswer) {

        redisClient.incr('right');
        res.json({correct: true});
      }
      else {

        redisClient.incr('wrong');
        res.json({correct: false});
      }
    }
  });
});

// POST method for /question
// Grabs the user data and creates a new trivia question and answer.
app.post('/question', function(req, res) {

  var data = req.body.data;
  data = JSON.parse(data);

  var userQuestion = data.userQuestion;
  var userAnswer = data.userAnswer;

  // Going to find the most recent entry in the
  // Trivia collection using the answerId.
  // This is to appropriately define the next entry.
  // The line below is a reference from stackoverflow: http://stackoverflow.com/questions/12467102/how-to-get-the-latest-and-oldest-record-in-mongoose-js-or-just-the-timespan-bet
  Trivia.findOne().sort({'answerId': -1}).exec(function(err, data) {
    if(err) {
      console.log("Error: not found!");
    }
    else {
      console.log("Finding most recent.. TEST : " + typeof(data));

      // If no entry is in the Trivia collection, create the first entry.
      if(data === null) {

        var setAnswerID = 1;

        var userTrivia = new Trivia({
          'question': userQuestion,
          'answer': userAnswer,
          'answerId': setAnswerID
        });

        userTrivia.save(function(err) {
          if(err !== null) {
            console.log(err);
          }
          else {
            console.log('Question Saved');
          }
        });
      } // One or more collection
      else {

        var mostRecentAnswerID = data.answerId;
        ++mostRecentAnswerID;

        var userTrivia = new Trivia({
          'question': userQuestion,
          'answer': userAnswer,
          'answerId': mostRecentAnswerID
        });

        userTrivia.save(function(err) {
          if(err !== null) {
            console.log(err);
          }
          else {
            console.log('Question Saved');
          }
        });
      }
    }
  });

  data = JSON.stringify(data);
  res.send(data);
});

app.get('/scores', function(req, res) {

  // This code was taken from the book Learning Web App Development.
  // Page 222
  redisClient.mget(['right', 'wrong'], function(err, results) {

    if (err !== null) {
        console.log("ERROR: " + err);
        return;
    }

    counts.right = parseInt(results[0], 10) || 0;
    counts.wrong = parseInt(results[1], 10) || 0;

    console.log("Right:");
    console.log(counts.right);
    console.log("Wrong:");
    console.log(counts.wrong);

    res.json(counts);
  });
});

app.post('/reset', function(req, res) {
    redisClient.flushall();
    res.send("score reset....");
});
