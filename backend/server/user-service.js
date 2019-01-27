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

module.exports = {
  get,
  create,
  update,
  destroy
};