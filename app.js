const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/testsDB', {useNewUrlParser: true, useUnifiedTopology: true});

const questionSchema = new mongoose.Schema({
  question: String,
  answer: String
});

const Question = mongoose.model('Question', questionSchema);

const defaultQuestion = new Question({
  question: 'What is Createst?',
  answer: "Createst is a web application that allows users to submit questions and answers to create a test. It's essentially a flashcard maker."
});

const testSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema]
});

const Test = mongoose.model('Test', testSchema);

const defaultTest = new Test({
  title: 'Default',
  questions: [defaultQuestion]
});

app.get('/', function(req, res) {
  Test.find({}, function(err, foundTests) {
    if (foundTests.length === 0) {
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

/* go to test after submitting on create page */
app.post('/test/:testTitle', function(req, res) {
  const question = new Question({
    question: req.body.question,
    answer: req.body.answer
  });
  Test.findOne({title: req.params.testTitle}, function(err, foundTest) {
    foundTest.questions.push(question);
    foundTest.save();
  });
  res.redirect('/test/' + req.params.testTitle);
});

app.get('/create/:testTitle', function(req, res) {
  res.render('create', {testTitle: req.params.testTitle});
});

app.post('/create', function(req, res) {
  const test = new Test({
    title: req.body.testTitle,
    questions: []
  });
  test.save();
  res.redirect('/create/' + test.title);
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});