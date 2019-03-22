const User = require('./user-model');
const ReadPreference = require('mongodb').ReadPreference;
var bcrypt = require("bcryptjs");
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var QRCode = require('qrcode');
var stripe = require("stripe")("sk_test_w5PEuWfNwsE2EODIr52JXvNu");

var secret = '2CWukLuOME4D16I';

require('./mongo').connect();

var port = "8080";
var hostLink = "https://www.qrcodes4good.com";

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

//Email verification stuff
var smtpTransport = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "qrcodes4good@outlook.com",
    pass: "MicrosoftGive4G"
  }
});

var mailOptions, host, link;

function randomVerificationCode(length, chars) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function createStripe(email, name, successCallback) {
  stripe.accounts.create({
    country: "US",
    type: "custom",
    email: email,
    legal_entity: {
      type: "individual",
      first_name: name,
      last_name: "Customer",
    },
  }).then(function (acct) {
    successCallback(acct.id);
  });
}

function StripeWrapper(email, name) {
  return new Promise((resolve, reject) => {
    createStripe(email, name, (successResponse) => {
      resolve(successResponse);
    });
  });
}

function acceptTos(req, res) {
  const {
    email
  } = req.body;
  console.log("in tos");
  User.findOne({
      email
    })
    .then(user => {
      stripe.accounts.update(
        user.stripeToken, {
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: "104.42.36.29"
          }
        }
      );
      user.tosAccepted = true
      user.save();
      res.status(200).json({
        message: "You have successfully accepted our terms of service.",
        tosAccepted: true
      });
      return true;

    })
    .catch(err => {
      res.status(500).json({
        message: "Account with that email address doesn't exist"
      });
    });
}

async function create(req, res) {
  const {
    email,
    name,
    password
  } = req.body;
  let emailVerifCode = randomVerificationCode(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let loginAuthToken = jwt.sign({
    email: email
  }, secret, {
    expiresIn: 600
  });
  User.findOne({
    email
  }, async function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database.",
        accountCreated: false
      });
    } else if (!user) {
      stripeToken = await StripeWrapper(email, name);
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, passwordHash) {
          const user = new User({
            email,
            name,
            passwordHash,
            emailVerifCode,
            loginAuthToken,
            stripeToken
          });
          user
            .save()
            .then(() => {
              host = req.get('host');
              console.log("host = " + host);
              //local host testing
              //link = "http://" + host + "/api/verify/" + req.body.email + "&" + req.body.emailVerifCode;
              //website testing
              link = hostLink + ":" + port + "/api/verify/" + email + "&" + emailVerifCode;
              mailOptions = {
                to: email,
                subject: "Please confirm your account",
                html: "Hello, <br> Please click on the link to verify your email. <br><a href=" + link + ">Click here to verify</a>"
              }
              smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Confirmation email sent successfully!");
                }
              });
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
    newEmail,
    name,
    currentPassword,
    newPassword,
    confirmNewPassword
  } = req.body;
  var changePass = false;
  if (email == undefined || currentPassword == undefined) {
    res.status(400).json({
      message: "Request must contain email and currentPassword."
    })
  } else {
    User.findOne({
        email
      })
      .then(user => {
        if (user.emailVerified == false) {
          res.status(403).json({
            message: "You cannot change account details without first confirming your email."
          })
          return false;
        }
        if (name != undefined) {
          user.name = name;
        }
        if (newPassword != undefined) {
          if (newPassword != confirmNewPassword) {
            res.status(400).json({
              message: "New password and confirm new password don't match."
            })
            return false;
          } else {
            changePass = true;
          }
        }
        bcrypt.compare(currentPassword, user.passwordHash, function (err, valid) {
          if (err) {
            res.status(401).json({
              message: "Error authenticating."
            });
          } else if (valid) {
            if (newEmail != undefined && newEmail != email) {
              let emailVerifCode = randomVerificationCode(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
              host = req.get('host');
              console.log("host = " + host);
              //local host testing
              //link = "http://" + host + "/api/verify/" + req.body.email + "&" + req.body.emailVerifCode;
              //website testing
              link = hostLink + ":" + port + "/api/verify/" + newEmail + "&" + emailVerifCode;
              mailOptions = {
                to: newEmail,
                subject: "Please confirm your account",
                html: "Hello, <br> Please click on the link to verify your email. <br><a href=" + link + ">Click here to verify</a>"
              }
              smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Confirmation email sent successfully!");
                  user.email = newEmail;
                  user.emailVerifCode = emailVerifCode;
                  user.emailVerified = false;
                  if (changePass == true) {
                    bcrypt.genSalt(10, function (err, salt) {
                      bcrypt.hash(newPassword, salt, function (err, passwordHash) {
                        if (!err) {
                          user.passwordHash = passwordHash;
                          user.save();
                          res.status(200).json({
                            message: "You have updated your information successfully.",
                          });
                          return true;
                        }
                      })
                    })
                  } else {
                    user.save();
                    res.status(200).json({
                      message: "You have updated your information successfully.",
                    });
                    return true;
                  }
                }
              });
            } else if (changePass == true) {
              bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newPassword, salt, function (err, passwordHash) {
                  if (!err) {
                    user.passwordHash = passwordHash;
                    user.save();
                    res.status(200).json({
                      message: "You have updated your information successfully.",
                    });
                    return true;
                  }
                })
              })
            } else {
              user.save();
              res.status(200).json({
                message: "You have updated your information successfully.",
              });
            }
          } else {
            res.status(401).json({
              message: "Your current password entered is incorrect."
            })
          }
        })
      })
      .catch(err => {
        res.status(500).json({
          message: "Account with that email address doesn't exist"
        });
      });
  }

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

function bioLogin(req, res) {
  const {
    touchAuthToken,
    devID
  } = req.body;
  if (touchAuthToken == undefined || devID == undefined) {
    res.status(400).json({
      message: "Request must have a token and device ID",
      loggedIn: false
    })
  } else {
    jwt.verify(touchAuthToken, secret, function (err, decoded) {
      if (decoded && decoded['devID'] == devID) {
        console.log(JSON.stringify(decoded));
        email = decoded['email'];
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
            user.lastAccess = (new Date).getTime();
            user.resetPassword = false;
            user.save();
            var loginAuthToken = jwt.sign({
              email: email
            }, secret, {
              expiresIn: 600
            });
            var touchAuthToken = jwt.sign({
              email: email,
              devID: devID,
              time: (new Date).getTime()
            }, secret, {
              expiresIn: 604800
            });
            res.status(200).json({
              message: "Authentication success",
              name: user.name,
              email: user.email,
              loginAuthToken: loginAuthToken,
              touchAuthToken: touchAuthToken,
              loggedIn: true
            });
          }
        });
      } else {
        res.status(401).json({
          message: "Incorrect token",
          loggedIn: false
        });
      }
    });
  }
}

function login(req, res) {
  const {
    email,
    inputPassword,
    devID
  } = req.body;
  if (email == undefined) {
    res.status(400).json({
      message: "Request must have an email in the body.",
      loggedIn: false
    })
  } else {
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
        })
      } else {
        if (user.emailVerified === true) {
          if (err) {
            res.status(401).json({
              message: "Error communicating with database.",
              loggedIn: false
            });
          } else if (inputPassword != undefined) {
            bcrypt.compare(inputPassword, user.passwordHash, function (err, valid) {
              if (err) {
                res.status(401).json({
                  message: "Error authenticating.",
                  loggedIn: false
                });
              } else if (valid) {
                var currentTime = (new Date).getTime();
                var loginAuthToken = jwt.sign({
                  email: email
                }, secret, {
                  expiresIn: 600
                });
                var touchAuthToken = (devID == undefined) ? "" : jwt.sign({
                  email: email,
                  devID: devID,
                  time: (new Date).getTime()
                }, secret, {
                  expiresIn: 604800
                });
                user.lastAccess = currentTime;
                user.resetPassword = false;
                user.save();
                res.status(200).json({
                  message: "You have signed in successfully.",
                  name: user.name,
                  loginAuthToken: loginAuthToken,
                  touchAuthToken: touchAuthToken,
                  loggedIn: true,
                  tosAccepted: user.tosAccepted
                });
              } else {
                res.status(401).json({
                  message: "The email or password provided was invalid.",
                  loggedIn: false
                })
              }
            })
          } else {
            res.status(400).json({
              message: "Unable to authenticate user.",
              loggedIn: false
            })
          }
        } else {
          res.status(401).json({
            message: "You must confirm your email address before you may login.",
            loggedIn: false
          });
        }
      }
    })
  }
}

function updateStripe(req, res) {
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
  if (ccFirstDigit == 3) {
    ccType = "American Express";
    ccLastDigits = String(creditCard).substring(creditCard.length - 5, creditCard.length);
  } else if (ccFirstDigit == 4) {
    ccType = "Visa";
    ccLastDigits = String(creditCard).substring(creditCard.length - 4, creditCard.length);
  } else if (ccFirstDigit == 5) {
    ccType = "MasterCard";
    ccLastDigits = String(creditCard).substring(creditCard.length - 4, creditCard.length);
  } else {
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

function getCards(req, res) {
  var authToken = req.headers['Authorization'];
  const email = req.params.email;
  jwt.verify(authToken, secret, function (err, decoded) {
    if (err) {
      res.status(401).json({
        message: "Token has expired"
      });
    }
    if (decoded && decoded['email'] == email) {
      //TODO
      User.findOne({
        email
      }, function (err, user) {
        if (err) {
          res.status(401).json({
            message: "Error communicating with database",
          });
        } else if (!user) {
          res.status(401).json({
            message: "A user with this email address was not found",
          });
        } else {
          res.status(200).json(user.stripeData);
        }
      });
    } else {
      res.status(401).json({
        message: "Token has expired"
      });
    }
  });
}

function verify(req, res) {
  const {
    email,
    code
  } = req.params;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database.",
      });
    } else if (!user) {
      res.status(401).json({
        message: "The verification link is incorrect, please try again or request a new verification email be sent.",
      });
    } else {
      if (user.emailVerified == true) {
        res.status(202).json({
          message: "Your email has already been verified."
        })
      } else if (code === user.emailVerifCode) {
        user.emailVerified = true;
        user.save();
        res.status(201).json({
          message: "Email successfully verified! You may now login."
        });
      } else if (code != user.emailVerifCode) {
        res.status(401).json({
          message: "Incorrect verification code, please check if you have a newer verification link, or request a new confirmation link."
        })
      } else {
        res.status(401).json({
          message: "Error occured, please try again later"
        })
      }
    }
  })
}

function forgotPassword(req, res) {
  const {
    email
  } = req.body;
  if (email == undefined) {
    res.status(400).json({
      message: "Request must contain email."
    })
  } else {
    User.findOne({
      email
    }, function (err, user) {
      if (err) {
        res.status(401).json({
          message: "Error communicating with database.",
        });
      } else if (!user) {
        res.status(401).json({
          message: "Account associated with this email address was not found.",
        });
      } else {
        let resetPasswordCode = randomVerificationCode(16, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        host = req.get('host');
        console.log("host = " + host);
        //local host testing
        //link = "http://" + host + "/api/verify/" + req.body.email + "&" + req.body.emailVerifCode;
        //website testing
        link = hostLink + ":" + port + "/api/user/resetPassword/" + email + "&" + resetPasswordCode;
        mailOptions = {
          to: email,
          subject: "Reset your password",
          html: "Hello " + user.name + ", <br> A request has been made to reset your password. <br><a href=" + link + ">Click here to reset your password</a>"
        }
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            console.log(error);
          } else {
            console.log("Reset password email sent successfully!");
            user.resetPasswordCode = resetPasswordCode;
            user.save();
            res.status(200).json({
              message: "Reset password email has been sent successfully.",
            });
          }
        });
      }
    })
  }
}

function resetPassword(req, res) {
  const {
    email,
    code
  } = req.params;
  console.log("email = " + email);
  console.log("code = " + code);
  if (email == undefined || code == undefined) {
    res.status(400).json({
      message: "Request must contain email."
    })
  } else {
    User.findOne({
      email
    }, function (err, user) {
      if (err) {
        res.status(401).json({
          message: "Error communicating with database.",
        });
      } else if (!user) {
        res.status(401).json({
          message: "Account associated with this email address was not found.",
        });
      } else {
        if (user.resetPasswordCode === code) {
          user.resetPassword = true;
          user.save();
          res.status(200).json({
            message: "You may now reset your password"
          });
        } else {
          res.status(401).json({
            message: "Incorrect verification code."
          });
        }
      }
    })
  }
}

function updateResetPassword(req, res) {
  const {
    email,
    resetPasswordCode,
    newPassword
  } = req.body;

  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database.",
      });
    } else if (!user) {
      res.status(401).json({
        message: "Account associated with this email address was not found.",
      });
    } else {
      if (user.resetPassword == true) {
        if (user.resetPasswordCode = resetPasswordCode) {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newPassword, salt, function (err, passwordHash) {
              user.passwordHash = passwordHash;
              user.resetPassword = false;
              user.save();
            })
          })
          user.resetPassword = true;
          user.save();
          res.status(200).json({
            message: "Your password has been changed, please login now."
          });
          return true;
        } else {
          res.status(401).json({
            message: "Incorrect password reset code."
          });
        }
      } else {
        res.status(403).json({
          message: "Access Denied."
        });
      }
    }
  })
}

function generateQRCode(req, res) {
  const {
    email,
    paymentType,
    defaultAmount,
    loginAuthToken,
    qrCodeGivenName,
  } = req.body;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database."
      });
    } else if (!user) {
      res.status(401).json({
        message: "Account doesn't exist."
      })
    } else if (user) {
      jwt.verify(loginAuthToken, secret, function (err, valid) {
        if (err) {
          if (err.message == "jwt expired") {
            res.status(401).json({
              message: "Auth token has expired, please login again."
            });
          } else {
            res.status(401).json({
              message: "Error authenticating.",
            });
          }
        } else if (valid) {
          if (valid['email'] == user.email) {
            if (user.generatedQRCodes.length + 1 > 5) {
              res.status(401).json({
                message: "User is only allowed to have 5 saved QRCodes at any given time."
              })
            } else {
              var QRCodeData = '{"userID": "' + user._id + '","defaultAmount": "' + defaultAmount + '","paymentType": "' + paymentType + '"}';
              var qrCodeIDNum = 0;
              if (user.generatedQRCodes.length > 0) {
                qrCodeIDNum = user.generatedQRCodes[user.generatedQRCodes.length - 1].qrCodeID + 1;
              }
              QRCode.toDataURL(QRCodeData, {
                  errorCorrectionLevel: 'H'
                })
                .then(qrdata => {
                  QRCode.toString(QRCodeData, {
                      errorCorrectionLevel: 'H'
                    })
                    .then(qrstring => {
                      user.generatedQRCodes.push({
                        qrCodeID: qrCodeIDNum,
                        qrCodeData: qrdata,
                        qrCodeString: qrstring,
                        qrCodeName: qrCodeGivenName,
                        qrCodeDefaultAmount: defaultAmount,
                        qrCodeType: paymentType
                      });
                      user.save();
                      res.status(200).json({
                        message: "QRCode generated successfully",
                        qrcodeData: qrdata,
                        qrcodeString: qrstring
                      });
                    })
                    .catch(err => {
                      console.log("QRCode generation had an error of : " + err);
                      res.status(401).json({
                        message: "Error generating QRCode 1",
                        error: err
                      });
                      return;
                    })
                })
                .catch(err => {
                  console.log("QRCode generation had an error of : " + err);
                  res.status(401).json({
                    message: "Error generating QRCode 2",
                    error: err
                  });
                })
            }
          } else {
            res.status(401).json({
              message: "The email or loginAuthToken provided was invalid."
            })
          }
        }
      })
    } else {
      res.status(401).json({
        message: "Error. Please try again later."
      });
    }
  });
}

function getQRCodes(req, res) {
  const {
    email,
    loginAuthToken
  } = req.body;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database."
      });
    } else if (!user) {
      res.status(401).json({
        message: "Account doesn't exist."
      })
    } else if (user) {
      jwt.verify(loginAuthToken, secret, function (err, valid) {
        if (err) {
          if (err.message == "jwt expired") {
            res.status(401).json({
              message: "Auth token has expired, please login again."
            });
          } else {
            res.status(401).json({
              message: "Error authenticating.",
            });
          }
        } else if (valid) {
          if (valid['email'] == user.email) {
            res.status(200).json({
              message: "Successfully retrieved QRCodes.",
              qrcodes: user.generatedQRCodes
            })
          } else {
            res.status(401).json({
              message: "The email or loginAuthToken provided was invalid."
            })
          }
        }
      })
    } else {
      res.status(401).json({
        message: "Error. Please try again later."
      });
    }
  });
}

function deleteQRCode(req, res) {
  const {
    email,
    loginAuthToken,
    deleteID
  } = req.body;
  User.findOne({
    email
  }, function (err, user) {
    if (err) {
      res.status(401).json({
        message: "Error communicating with database."
      });
    } else if (!user) {
      res.status(401).json({
        message: "Account doesn't exist."
      })
    } else if (user) {
      jwt.verify(loginAuthToken, secret, function (err, valid) {
        if (err) {
          if (err.message == "jwt expired") {
            res.status(401).json({
              message: "Auth token has expired, please login again."
            });
          } else {
            res.status(401).json({
              message: "Error authenticating.",
            });
          }
        } else if (valid) {
          if (valid['email'] == user.email) {
            User.collection.update({
              email: email
            }, {
              $pull: {
                'generatedQRCodes': {
                  qrCodeID: deleteID
                }
              }
            });
            res.status(200).json({
              message: "Successfully deleted QRCode.",
              qrcodes: user.generatedQRCodes
            })
          } else {
            res.status(401).json({
              message: "The email or loginAuthToken provided was invalid."
            })
          }
        }
      })
    } else {
      res.status(401).json({
        message: "Error. Please try again later."
      });
    }
  });
}

module.exports = {
  get,
  create,
  update,
  destroy,
  login,
  bioLogin,
  verify,
  updateStripe,
  getCards,
  forgotPassword,
  resetPassword,
  updateResetPassword,
  generateQRCode,
  acceptTos,
  getQRCodes,
  deleteQRCode
};