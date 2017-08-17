const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Person = require('./models.js');

const port = process.env.PORT || 3000;

const app = express();

// error status code constants
const STATUS_SERVER_ERROR = 500;
const STATUS_USER_ERROR = 422;

app.use(bodyParser.json());

// Your API will be built out here.
app.get('/users', (req, res) => {
  Person.find({}, (err, users) => {
    if (err) {
      res.status(STATUS_USER_ERROR);
      res.json({ error: 'error' });
    } else {
      res.json(users);
    }
  });
});
// GET '/users/:direction sort the data by asc & desc
app.get('/users/:direction', (req, res) => {
  const { direction } = req.params;
  let order = -1
  if (direction === 'asc') {
    order = 1;
  }
  Person.find({})
    .sort({ firstName: order })
    .exec((err, users) => {
      if (err) {
        res.status(STATUS_USER_ERROR);
        res.json({ error: err});
      } else {
        res.json(users);
      }
    });
});
// Get 'users/:id return a single user id
app.get('/users-get-friends/:id', (req, res) => {
  const { id } = req.params;
  Person.findById(id, (err, user) => {
    if (err) {
      res.status(STATUS_USER_ERROR);
      res.json({ error: err})
    } else {
      res.json(user)
    }
  });
});
// Put update the user firstName & lastName
app.put('/users-get-friends/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  if (!id) {
    res.status(STATUS_USER_ERROR);
    res.json({ error: 'Must provide an id'} );
    return;
  }
  if (!firstName) {
    res.status(STATUS_USER_ERROR);
    res.json({ error: 'Must provide first name'} );
    return;
  }
  if (!lastName) {
    res.status(STATUS_USER_ERROR);
    res.json({ error: 'Must provide last name'} );
    return;
  }
  // update the user object
  const user = Person.findByIdAndUpdate(id, { firstName, lastName }, (err, user) => {
    if (!user) {
      res.status(STATUS_SERVER_ERROR);
      res.json({ error: `Couldn't find user with id ${id}` });
      return
    }
    res.json(user);
  });
});

mongoose.Promise = global.Promise;
const connect = mongoose.connect(
  'mongodb://localhost/people',
  { useMongoClient: true }
);
/* eslint no-console: 0 */
connect.then(() => {
  app.listen(port);
  console.log(`Server Listening on ${port}`);
}, (err) => {
  console.log('\n************************');
  console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
  console.log('************************\n');
});
