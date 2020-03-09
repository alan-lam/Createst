# Createst
A Quizlet-like web application that allows users to create flashcards

https://creatests.herokuapp.com/

## API

### Get All Tests

GET: `https://creatests.herokuapp.com/tests`

Returns an array of Test objects:

```
[{
  _id: String,
  title: String,
  questions: [{
    _id: String,
    question: String,
    answer: String
    }] (an array of Question objects)
}]
```

### Get a Single Test

GET: `https://creatests.herokuapp.com/tests/<testTitle>`

Returns a single Test object:

```
{"title":"Default","questions":{"q1":{"question":"What is Creatests?","answer":"Creatests is a web application that allows users to submit questions and answers to create a test. It's essentially a flashcard maker."}}}
```

What the object looks like:

```
{
  title: 'Default',
  questions: {
    q1: {
      question: 'What is Creatests?',
      answer: 'Creatests is a web application ...'
    }
  }
}
```

This isn't how Test objects are stored in the database, but this is returned to make PUT and PATCH requests easier.

### Create a Test

POST: `https://creatests.herokuapp.com/tests`

**Parameters**
| name      | description                | example                                                                     |
|-----------|----------------------------|-----------------------------------------------------------------------------|
| title     | the name of the test       | 'Test'                                                                      |
| questions | the questions for the test | {"q1":{"question":"q1","answer":"a1"},"q2":{"question":"q2","answer":"a2"}} |

The format for the `questions` parameter can be copied and pasted from the result of a GET request for a *single* test.

### Update a Test

PUT: `https://creatests.herokuapp.com/tests` (if changing both `title` and `questions`)

PATCH: `https://creatests.herokuapp.com/tests` (if changing `title` or `questions` or both)

**Parameters**
| name      | description                | example                                                                     |
|-----------|----------------------------|-----------------------------------------------------------------------------|
| title     | the name of the test       | 'Test'                                                                      |
| questions | the questions for the test | {"q1":{"question":"q1","answer":"a1"},"q2":{"question":"q2","answer":"a2"}} |

The format for the `questions` parameter can be copied and pasted from the result of a GET request for a *single* test.

## Resources
https://stackoverflow.com/questions/46249541/change-arrow-colors-in-bootstraps-carousel
