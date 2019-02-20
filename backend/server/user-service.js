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
    password,
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
        bcrypt.hash(password, salt, function (err, passwordHash) {
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
  } = req.body;
  User.findOne({
    email
  }, function (err, user) {
    if (!user) {
      res.status(401).json({
        message: "The email or password provided was invalid.",
        loggedIn: false
      })
    }else{
      if(user.emailVerified === true){
        if (err) {
          res.status(401).json({
            message: "Error communicating with database.",
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
              var currentTime = (new Date).getTime();
              user.lastAccess = currentTime;
              user.save();
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
    }
  })
}

function updateStripe(req, res){
  const {
    email,
    creditCard,
    cvv,
    billingFirstName,
    billingLastName,
    billingAddress,
    billingCity,
    billingState,
    billingZip
  } = req.body;
  let expYear = req.body.exp.substring(req.body.exp.indexOf("/") + 1, req.body.exp.length);
  let expMonth = req.body.exp.substring(0, 2);
  let ccLastDigits = 0;
  let ccType = "";
  let ccFirstDigit = creditCard.charAt(0);
  if(ccFirstDigit == 3){
    ccType = "American Express";
    ccLastDigits = String(creditCard).substring(creditCard.length - 5, creditCard.length);
  }else if(ccFirstDigit == 4){
    ccType = "Visa";
    ccLastDigits = String(creditCard).substring(creditCard.length - 4, creditCard.length);
  }else if(ccFirstDigit == 5){
    ccType = "MasterCard";
    ccLastDigits = String(creditCard).substring(creditCard.length - 4, creditCard.length);
  }else{
    ccType = "Discover Card";
    ccLastDigits = String(creditCard).substring(creditCard.length - 4, creditCard.length);
  }


  User.findOne({
      email
    })
    .then(user => {
      user.stripeData.creditCard.push(creditCard);
      user.stripeData.cvv.push(cvv);
      user.stripeData.billingFirstName.push(billingFirstName);
      user.stripeData.billingLastName.push(billingLastName);
      user.stripeData.billingAddress.push(billingAddress);
      user.stripeData.billingCity.push(billingCity);
      user.stripeData.billingState.push(billingState);
      user.stripeData.billingZip.push(billingZip);
      user.stripeData.expYear.push(expYear);
      user.stripeData.expMonth.push(expMonth);
      user.stripeData.creditCardType.push(ccType);
      user.stripeData.creditCardLastDigits.push(ccLastDigits);
      user.save().then(res.json(user));
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function getCards(req, res){
  const email = req.params.email;
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
      res.json(user.stripeData);
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
  verify,
  updateStripe,
  getCards
};