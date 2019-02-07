const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');

const userService = require('../user-service');

router.get('/users', (req, res) => {
  console.log("in users index.js");
  userService.get(req, res);
});

router.get('/verify', (req, res) => {
  console.log("in verify before request is sent");
  userService.verify(req, res);
  console.log("verify account res message = " + res.message);
});


 //Email verification stuff
 var smtpTransport = nodemailer.createTransport({
  service: "hotmail",
  auth:{
    user: "qrcodes4good@outlook.com",
    pass: "MicrosoftGive4G"
  }
});

var mailOptions, host, link;

function randomVerificationCode(length, chars){
  let result = '';
  for(let i = 0; i < length; i++){
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

router.put('/user', (req, res) => {
  req.body.emailVerifCode = randomVerificationCode(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  host = req.get('host');
  link = "http://" + host + "/verify?email=" + req.body.email + "&code=" + req.body.emailVerifCode;
  console.log("req body" + JSON.stringify(req.body));
  mailOptions={
    to : req.body.email,
    subject : "Please confirm your account",
    html : "Hello, <br> Please click on the link to verify your email. <br><a href=" + link + ">Click here to verify</a>"
  }
  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message was sent successfully!");
    }
  });
 console.log("right before userService.create in index.js");
  userService.create(req, res);
});

router.post('/user', (req, res) => {
  userService.update(req, res);
});

router.delete('/user/:email', (req, res) => {
  userService.destroy(req, res);
});

router.get('/user/:email&:inputPassword', (req, res) => {
  userService.login(req, res);
});



module.exports = router;
