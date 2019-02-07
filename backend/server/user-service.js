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
    passwordHash,
    emailVerifCode
  } = req.body;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database.",
        accountCreated: false
      });
    } else if (!user) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(passwordHash, salt, function (err, passwordHash) {
          const user = new User({
            email,
            name,
            passwordHash,
            emailVerifCode
          });
          user
            .save()
            .then(() => {
              res.status(201).json({
                message: "User doesn't exist. Able to create account.",
                accountCreated: true
              })
            })
            .catch(err => {
              res.status(500).json(err);
            });
        })
      })
    } else {
      res.status(401).json({
        message: "User with this email already exists.",
        accountCreated: false
      });
    }
  });
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

function login(req, res) {
  const {
    email,
    inputPassword
  } = req.params;
  User.findOne({
    email
  }, function (err, user) {
    if(user.emailVerified === true){
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
              message: "You have signed in successfully.",
              loggedIn: true
            });
          } else {
            res.status(401).json({
              message: "The email or password provided was invalid.",
              loggedIn: false
            })
          }
        })
      }
    }else{
      res.status(401).json({
        message: "You must confirm your email address before you may login.",
        loggedIn: false
      });
    }
    
  })
}

function verify(req, res){
  const{
    email,
    code
  } = req.params;
  User.findOne({
    email
  }, function(err, user){
    if(err){
      res.status(401).json({
        message: "Error communicating with database.",
      });
    }else if(!user){
      res.status(401).json({
        message: "The verification link is incorrect, please try again or request a new verification email be sent.",
      });
    }else {
      if(code === user.emailVerifCode){
        user.emailVerified = true;
        user.save();
        res.status(201).json({
          message: "Email successfully verified! You may now login."
        });
      }else{
        res.status(401).json({
          message: "Error occured, please try again later"
        })
      }
    }
  })
}

module.exports = {
  get,
  create,
  update,
  destroy,
  login,
  verify
};