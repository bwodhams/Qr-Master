const express = require('express');
const router = express.Router();

const userService = require('../user-service');

router.get('/users', (req, res) => {
  userService.get(req, res);
});

router.get('/verify/:email&:code', (req, res) => {
  userService.verify(req, res);
});


function registrationErrorCheck(fullName, email, password, confirmPassword) {


  let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let pwdLowerReg = /[a-z]+/;
  let pwdUpperReg = /[A-Z]+/;
  let pwdNumReg = /.*\d.*/;

  let outputString = '';

  if (fullName.length < 1) {
    outputString += " Invalid name. ";
  }

  if (!emailReg.test(email)) {
    outputString += " Invalid email. ";
  }

  if (password.length < 6 || password.length > 20) {
    outputString += " Password must be longer than 6 characters and less than 20 characters. ";
  }

  if (!pwdLowerReg.test(password)) {
    outputString += " Password must contain at least one lowercase character. ";
  }

  if (!pwdUpperReg.test(password)) {
    outputString += " Password must contain at least one uppercase character. ";
  }

  if (!pwdNumReg.test(password)) {
    outputString += " Password must contain at least one digit. ";
  }

  if (password != confirmPassword) {
    outputString += " Password and confirmation password don't match. ";
  }

  return outputString;

}

router.put('/user/create', (req, res) => {
  let errorCheck = registrationErrorCheck(req.body.name, req.body.email, req.body.password, req.body.confirmPassword);
  if(errorCheck.length > 0){
    res.status(400).json({
      message: errorCheck,
      accountCreated: false
    });
  }else{
    userService.create(req, res);
  }
  
});

router.post('/user/update', (req, res) => {
  userService.update(req, res);
});

router.delete('/user/:email', (req, res) => {
  userService.destroy(req, res);
});

router.post('/user/login', (req, res) => {
  userService.login(req, res);
});

router.post('/user/updateStripe', (req, res) => {
  userService.updateStripe(req, res);
});

router.get('/user/getCards/:email', (req, res) => {
  userService.getCards(req, res);
});


module.exports = router;
