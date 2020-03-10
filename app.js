const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-ntrllog:adminntrllog@cluster0-0lb8n.mongodb.net/testsDB', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb://localhost:27017/testsDB', {useNewUrlParser: true, useUnifiedTopology: true});

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String
});

const Question = mongoose.model('Question', questionSchema);

const defaultQuestion = new Question({
  question: 'What is Creatests?',
  answer: "Creatests is a web application that allows users to submit questions and answers to create a test. It's essentially a flashcard maker."
});

const testSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema]
});

const Test = mongoose.model('Test', testSchema);

app.get('/', function(req, res) {
  Test.find(function(err, foundTests) {
    if (foundTests.length === 0) {
      const defaultTest = new Test({
        title: 'Default',
        questions: [defaultQuestion]
      });
      defaultTest.save();
      res.redirect('/');
    }
    else {
      res.render('home', {tests: foundTests});
    }
  });
});

app.get('/test/:testTitle', function(req, res) {
  Test.findOne({title: req.params.testTitle}, function(err, foundTest) {
    res.render('test', {testTitle: foundTest.title, testQuestions: foundTest.questions});
  });
});

/* select test from home page */
app.post('/test', function(req, res) {
  res.redirect('/test/' + req.body.testTitle);
});

/* create test from create page */
app.post('/test/:testTitle', function(req, res) {
  /* only one question/answer submitted */
  if (typeof req.body.question === 'string') {
    const question = new Question({
      question: req.body.question,
      answer: req.body.answer
    });
    const test = new Test({
      title: req.body.testTitle,
      questions: [question]
    });
    test.save();
  }
  /* more than one question/answer submitted */
  else {
    const questions = [];
    for (let i = 0; i < req.body.question.length; i++) {
      const question = new Question({
        question: req.body.question[i],
        answer: req.body.answer[i]
      });
      questions.push(question);
    }
    const test = new Test({
      title: req.params.testTitle,
      questions: questions
    });
    test.save();
  }
  res.redirect('/test/' + req.params.testTitle);
});

app.get('/create/:testTitle', function(req, res) {
  res.render('create', {testTitle: req.params.testTitle});
});

/* go to create test page from home page */
app.post('/create', function(req, res) {
  const title = req.body.testTitle.replace(/\s+/g, '-');
  Test.find({title: title}, function(err, foundTests) {
    if (err) {
      res.send(err);
    }
    else if (foundTests.length > 0) {
      res.send('Test with that title already exists');
    }
    else {
      res.redirect('/create/' + title);
    }
  });
});

app.post('/back', function(req, res) {
  res.redirect('/');
});

/* RESTful API */
app.route('/tests')
  .get(function(req, res) {
    Test.find(function(err, foundTests) {
      if (err) {
        res.send(err);
      }
      else {
        res.send(foundTests);
      }
    });
  })
  .post(function(req, res) {
    const title = req.body.title.replace(/\s+/g, '-');
    Test.find({title: title}, function(err, foundTests) {
      if (err) {
        res.send(err);
      }
      else if (foundTests.length > 0) {
        res.send('Test with that title already exists');
      }
      else {
        const questions = [];
        const submittedQuestions = JSON.parse(req.body.questions);
        for (q in submittedQuestions) {
          const question = new Question(submittedQuestions[q]);
          questions.push(question);
        }
        const test = new Test({
          title: req.body.title,
          questions: questions
        });
        test.save(function(err) {
          if (err) {
            res.send(err);
          }
          else {
            res.send('Successfully submitted test');
          }
        });
      }
    });
  });

app.route('/tests/:testTitle')
  .get(function(req, res) {
    Test.findOne({title: req.params.testTitle}, function(err, foundTest) {
      if (err) {
        res.send(err);
      }
      else {
        if (foundTest) {
          console.log(foundTest);
          const questions = {};
          for (let i = 0; i < foundTest.questions.length; i++) {
            questions['q'+(i+1)] = {
              question: foundTest.questions[i].question,
              answer: foundTest.questions[i].answer
            };
          }
          const test = JSON.stringify({
            title: foundTest.title,
            questions: questions
          });
          res.send(test);
        }
        else {
          res.send('No test with that title found');
        }
      }
    });
  })
  .put(function(req, res) {
    if (req.body.title === undefined) {
      res.send('No title specified');
    }
    else {
      const questions = [];
      const submittedQuestions = JSON.parse(req.body.questions);
      for (q in submittedQuestions) {
        const question = new Question(submittedQuestions[q]);
        questions.push(question);
      }
      const title = req.body.title.replace(/\s+/g, '-');
      Test.updateOne(
        {title: req.params.testTitle},
        {title: title, questions: questions},
        function(err) {
          if (err) {
            res.send(err);
          }
          else {
            res.send('Successfully updated test');
          }
        }
      );
    }
  })
  .patch(function(req, res) {
    let correctProperties = false;
    if (req.body.hasOwnProperty('title')) {
      correctProperties = true;
      const title = req.body.title.replace(/\s+/g, '-');
      Test.updateOne(
        {title: req.params.testTitle},
        {$set: {title: title}},
        function(err) {
          if (err) {
            res.send(err);
          }
          else {
            res.send('Successfully updated test title');
          }
        }
      );
    }
    if (req.body.hasOwnProperty('questions')) {
      correctProperties = true;
      const questions = [];
      const submittedQuestions = JSON.parse(req.body.questions);
      for (q in submittedQuestions) {
        const question = new Question(submittedQuestions[q]);
        questions.push(question);
      }
      Test.updateOne(
        {title: req.params.testTitle},
        {$set: {questions: questions}},
        function(err, writeOpResult) {
          if (err) {
            res.send(err);
          }
          else if (writeOpResult.nModified === 0) {
            res.send('No test with that title exists');
          }
          else {
            res.send('Successfully updated test questions');
          }
        }
      );
    }
    if (!correctProperties) {
      res.send('Incorrect Keys. Should be "title" and/or "questions"');
    }
  });

app.listen(process.env.PORT || 3000, function() {
  console.log('Server started on port 3000');
});