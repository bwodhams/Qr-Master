const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');

const userService = require('../user-service');

router.get('/users', (req, res) => {
  userService.get(req, res);
});

router.get('/verify/:email&:code', (req, res) => {
  userService.verify(req, res);
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
  /*
  req.body.emailVerifCode = randomVerificationCode(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  host = req.get('host');
  link = "http://" + host + "/api/verify/" + req.body.email + "&" + req.body.emailVerifCode;
  mailOptions={
    to : req.body.email,
    subject : "Please confirm your account",
    html : "Hello, <br> Please click on the link to verify your email. <br><a href=" + link + ">Click here to verify</a>"
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message was sent successfully!");
    }
  });
  */
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
