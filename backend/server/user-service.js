const User = require('./user-model');
const ReadPreference = require('mongodb').ReadPreference;
var bcrypt = require("bcryptjs");

require('./mongo').connect();

function get(req, res) {
  const docquery = User.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function create(req, res) {
  const {
    email,
    name,
    passwordHash
  } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(passwordHash, salt, function (err, passwordHash) {
      const user = new User({
        email,
        name,
        passwordHash
      });
      user
        .save()
        .then(() => {
          res.json(user);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    })
  })
}

function update(req, res) {
  const {
    email,
    name
  } = req.body;

  User.findOne({
      email
    })
    .then(user => {
      user.name = name;
      user.save().then(res.json(user));
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function destroy(req, res) {
  console.log("req.params" + req.params);
  const {
    email
  } = req.params;

  User.findOneAndRemove({
      email
    })
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function login(req, res) {
  const {
    email,
    inputPassword
  } = req.params;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database.",
        loggedIn: false
      });
    } else if (!user) {
      res.status(401).json({
        message: "The email or password provided was invalid.",
        loggedIn: false
      });
    } else {
      bcrypt.compare(inputPassword, user.passwordHash, function (err, valid) {
        if (err) {
          res.status(401).json({
            message: "Error authenticating.",
            loggedIn: false
          });
        } else if (valid) {
          res.status(201).json({
            message: "You have signed in successfully."
          });
        } else {
          res.status(401).json({
            message: "The email or password provided was invalid.",
            loggedIn: false
          })
        }
      })
    }
  })
}

module.exports = {
  get,
  create,
  update,
  destroy,
  login
};