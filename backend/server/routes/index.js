const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');

const userService = require('../user-service');

 //Email verification stuff
 var smtpTransport = nodemailer.createTransport({
  service: "hotmail",
  auth:{
    user: "qrcodes4good@outlook.com",
    pass: "MicrosoftGive4G"
  }
});

var mailOptions, host, link;

router.get('/users', (req, res) => {
  userService.get(req, res);
});

router.put('/user', (req, res) => {
  rand = Math.floor((Math.random() * 10000) + 54);
  host = req.get('host');
  link = "http://" + host + "/verify?id=" + rand;
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
