const User = require('../user-model');
const ReadPreference = require('mongodb').ReadPreference;
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var stripe = require('stripe')('sk_test_w5PEuWfNwsE2EODIr52JXvNu');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');

var verificationEmailTemplate = fs.readFileSync(path.resolve(__dirname, 'confirmationEmailHTML.html'), 'utf8');
var changedAccEmailTemplate = fs.readFileSync(path.resolve(__dirname, 'changedAccEmailHTML.html'), 'utf8');
var passwordResetEmailTemplate = fs.readFileSync(path.resolve(__dirname, 'passwordResetEmailHTML.html'), 'utf8');


var secret = '2CWukLuOME4D16I';

require('../mongo').connect();

var hostLink = 'https://www.qrcodes4good.com';

function get(req, res) {
	const docquery = User.find({}).read(ReadPreference.NEAREST);
	docquery
		.exec()
		.then((users) => {
			res.json(users);
		})
		.catch((err) => {
			res.status(500).send(err);
		});
}

//Email verification stuff
var smtpTransport = nodemailer.createTransport({
	host: 'mail.privateemail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'support@qrcodes4good.com',
		pass: '.48MuQJtj6Bzm'
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
	stripe.accounts
		.create({
			country: 'US',
			type: 'custom',
			email: email,
			legal_entity: {
				type: 'individual',
				first_name: name,
				last_name: 'Customer'
			}
		})
		.then(function (acct) {
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
	const loginAuthToken = req.headers.authorization;
	jwt.verify(loginAuthToken, secret, function (err, valid) {
		if (err) {
			if (err.message == 'jwt expired') {
				res.status(401).json({
					message: 'Auth token has expired, please login again.'
				});
			} else {
				res.status(401).json({
					message: 'Error authenticating.'
				});
			}
		} else if (valid) {
			User.findOne({
					email
				})
				.then((user) => {
					stripe.accounts.update(user.stripeToken, {
						tos_acceptance: {
							date: Math.floor(Date.now() / 1000),
							ip: '104.42.36.29'
						}
					});
					user.tosAccepted = true;
					user.save();
					res.status(200).json({
						message: 'You have successfully accepted our terms of service.',
						tosAccepted: true
					});
					return true;
				})
				.catch((err) => {
					res.status(500).json({
						message: "Account with that email address doesn't exist"
					});
				});
		} else {
			res.status(401).json({
				message: 'Error'
			});
		}
	})
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
		},
		secret, {
			expiresIn: 600
		}
	);
	let loginAuthTokenDesktop = jwt.sign({
			email: email,
			name: name
		},
		secret, {
			expiresIn: 600
		});
	User.findOne({
			email
		},
		async function (err, user) {
			if (err) {
				res.status(401).json({
					message: 'Error communicating with database.',
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
							loginAuthTokenDesktop,
							stripeToken
						});

						host = req.get('host');
						console.log('host = ' + host);
						//local host testing
						//link = "http://" + host + "/api/verify/" + req.body.email + "&" + req.body.emailVerifCode;
						//website testing
						link = hostLink + '/api/verify/' + email + '&' + emailVerifCode;
						var finalVerificationLink = verificationEmailTemplate.replace(
							'https://www.changeThisLinkToConfirmationLink.com',
							link
						);
						finalVerificationLink = finalVerificationLink.replace(
							'Hey there! Welcome to QRCodes4Good!',
							'Hey there ' + name + '! Welcome to QRCodes4Good!'
						);
						mailOptions = {
							from: '"Support - QRCodes4Good" <support@qrcodes4good.com>',
							to: email,
							subject: 'Please confirm your account',
							html: finalVerificationLink
						};
						smtpTransport.sendMail(mailOptions, function (error, response) {
							if (error) {
								console.log(error);
								res.status(500).json({
									message: 'Error creating account.',
									error: error
								});
							} else {
								console.log('Confirmation email sent successfully!');
								user
									.save()
									.then((user) => {
										res.status(201).json({
											message: "User doesn't exist. Able to create account.",
											accountCreated: true
										});
									})
									.catch((err) => {
										res.status(500).json({
											message: 'Error saving account.',
											error: error
										});
									});
							}
						});
					});
				});
			} else {
				res.status(401).json({
					message: 'User with this email already exists.',
					accountCreated: false
				});
			}
		}
	);
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
			message: 'Request must contain email and currentPassword.'
		});
	} else {
		User.findOne({
				email
			})
			.then((user) => {
				if (user.emailVerified == false) {
					res.status(403).json({
						message: 'You cannot change account details without first confirming your email.'
					});
					return false;
				}
				if (name != undefined) {
					user.name = name;
				}
				var userName = user.name;
				if (newPassword != undefined) {
					if (newPassword != confirmNewPassword) {
						res.status(400).json({
							message: "New password and confirm new password don't match."
						});
						return false;
					} else {
						changePass = true;
					}
				}
				bcrypt.compare(currentPassword, user.passwordHash, function (err, valid) {
					if (err) {
						res.status(401).json({
							message: 'Error authenticating.'
						});
					} else if (valid) {
						if (newEmail != undefined && newEmail != email) {
							User.findOne({
									newEmail
								},
								async function (err, usedUser) {
									if (err) {
										res.status(401).json({
											message: 'Error communicating with database.',
										});
									} else if (!usedUser) {
										let emailVerifCode = randomVerificationCode(
											10,
											'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
										);
										host = req.get('host');
										link = hostLink + '/api/verify/' + newEmail + '&' + emailVerifCode;
										var finalChangeLink = changedAccEmailTemplate.replace(
											'https://www.changeThisLinkToConfirmationLink.com',
											link
										);
										finalChangeLink = finalChangeLink.replace(
											'Hey there! Welcome to QRCodes4Good!',
											'Hey there ' + userName + '!'
										);
										mailOptions = {
											from: '"Support - QRCodes4Good" <support@qrcodes4good.com>',
											to: newEmail,
											subject: 'Please confirm your new email',
											html: finalChangeLink
										};
										smtpTransport.sendMail(mailOptions, function (error, response) {
											if (error) {
												console.log(error);
												res.status(500).json({
													message: 'Error changing email.',
													error: error
												});
											} else {
												user.email = newEmail;
												user.emailVerifCode = emailVerifCode;
												user.emailVerified = false;
												if (changePass == true) {
													bcrypt.genSalt(10, function (err, salt) {
														bcrypt.hash(newPassword, salt, function (err, passwordHash) {
															if (!err) {
																user.passwordHash = passwordHash;
																user.save();
																res.cookie('accName', user.name, {
																	maxAge: 600000,
																});
																res.cookie('accEmail', user.email, {
																	maxAge: 600000,
																});
																res.status(200).json({
																	message: 'You have updated your information successfully.'
																});
																return true;
															}
														});
													});
												} else {
													user.save();
													res.cookie('accName', user.name, {
														maxAge: 600000,
													});
													res.cookie('accEmail', user.email, {
														maxAge: 600000,
													});
													res.status(200).json({
														message: 'You have updated your information successfully.'
													});
													return true;
												}
											}
										});
									} else {
										res.status(401).json({
											message: 'Account with this new email already exists.'
										});
									}
								}
							);
						} else if (changePass == true) {
							bcrypt.genSalt(10, function (err, salt) {
								bcrypt.hash(newPassword, salt, function (err, passwordHash) {
									if (!err) {
										user.passwordHash = passwordHash;
										user.save();
										res.cookie('accName', user.name, {
											maxAge: 600000,
										});
										res.cookie('accEmail', user.email, {
											maxAge: 600000,
										});
										res.status(200).json({
											message: 'You have updated your information successfully.'
										});
										return true;
									}
								});
							});
						} else {
							user.save();
							res.cookie('accName', user.name, {
								maxAge: 600000,
							});
							res.cookie('accEmail', user.email, {
								maxAge: 600000,
							});
							res.status(200).json({
								message: 'You have updated your information successfully.'
							});
						}
					} else {
						res.status(401).json({
							message: 'Your current password entered is incorrect.'
						});
					}
				});
			})
			.catch((err) => {
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
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
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
			message: 'Request must have a token and device ID',
			loggedIn: false
		});
	} else {
		jwt.verify(touchAuthToken, secret, function (err, decoded) {
			if (decoded && decoded['devID'] == devID) {
				console.log(JSON.stringify(decoded));
				email = decoded['email'];
				User.findOne({
						email
					},
					function (err, user) {
						if (err) {
							res.status(401).json({
								message: 'Error communicating with database.',
								loggedIn: false
							});
						} else if (!user) {
							res.status(401).json({
								message: 'The email or password provided was invalid.',
								loggedIn: false
							});
						} else {
							user.lastAccess = new Date().getTime();
							user.resetPassword = false;
							user.save();
							var loginAuthToken = jwt.sign({
									email: email
								},
								secret, {
									expiresIn: 600
								}
							);
							var touchAuthToken = jwt.sign({
									email: email,
									devID: devID,
									time: new Date().getTime()
								},
								secret, {
									expiresIn: 604800
								}
							);
							res.status(200).json({
								message: 'Authentication success',
								name: user.name,
								email: user.email,
								loginAuthToken: loginAuthToken,
								touchAuthToken: touchAuthToken,
								loggedIn: true
							});
						}
					}
				);
			} else {
				res.status(401).json({
					message: 'Incorrect token',
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
			message: 'Request must have an email in the body.',
			loggedIn: false
		});
	} else {
		User.findOne({
				email
			},
			function (err, user) {
				if (err) {
					res.status(401).json({
						message: 'Error communicating with database.',
						loggedIn: false
					});
				} else if (!user) {
					res.status(401).json({
						message: 'The email or password provided was invalid.',
						loggedIn: false
					});
				} else {
					if (user.emailVerified === true) {
						if (err) {
							res.status(401).json({
								message: 'Error communicating with database.',
								loggedIn: false
							});
						} else if (inputPassword != undefined) {
							bcrypt.compare(inputPassword, user.passwordHash, function (err, valid) {
								if (err) {
									res.status(401).json({
										message: 'Error authenticating.',
										loggedIn: false
									});
								} else if (valid) {
									var currentTime = new Date().getTime();
									var loginAuthToken = jwt.sign({
											email: email
										},
										secret, {
											expiresIn: 600
										}
									);
									var loginAuthTokenDesktop =
										devID == undefined ?
										jwt.sign({
												email: email,
												name: user.name
											},
											secret, {
												expiresIn: 600
											}) : '';
									var touchAuthToken =
										devID == undefined ?
										'' :
										jwt.sign({
												email: email,
												devID: devID,
												time: new Date().getTime()
											},
											secret, {
												expiresIn: 604800
											}
										);
									user.lastAccess = currentTime;
									user.resetPassword = false;
									user.save();
									res.cookie('accName', user.name, {
										maxAge: 600000,
									});
									res.cookie('accEmail', user.email, {
										maxAge: 600000,
									});
									res.status(200).json({
										message: 'You have signed in successfully.',
										name: user.name,
										loginAuthToken: loginAuthToken,
										loginAuthTokenDesktop: loginAuthTokenDesktop,
										touchAuthToken: touchAuthToken,
										loggedIn: true,
										tosAccepted: user.tosAccepted
									});
								} else {
									res.status(401).json({
										message: 'The email or password provided was invalid.',
										loggedIn: false
									});
								}
							});
						} else {
							res.status(400).json({
								message: 'Unable to authenticate user.',
								loggedIn: false
							});
						}
					} else {
						res.status(401).json({
							message: 'You must confirm your email address before you may login.',
							loggedIn: false
						});
					}
				}
			}
		);
	}
}

function verify(req, res) {
	const {
		email,
		code
	} = req.params;
	User.findOne({
			email
		},
		function (err, user) {
			if (err) {
				res.status(401).json({
					message: 'Error communicating with database.'
				});
			} else if (!user) {
				res.status(401).json({
					message: 'The verification link is incorrect, please try again or request a new verification email be sent.'
				});
			} else {
				if (user.emailVerified == true) {
					res.status(202).json({
						message: 'Your email has already been verified.'
					});
				} else if (code === user.emailVerifCode) {
					user.emailVerified = true;
					user.save();
					res.writeHead(301, {
						Location: "https://" + req.headers['host'] + "/user/accountVerified.html"
					});
					res.end();
				} else if (code != user.emailVerifCode) {
					res.status(401).json({
						message: 'Incorrect verification code, please check if you have a newer verification link, or request a new confirmation link.'
					});
				} else {
					res.status(401).json({
						message: 'Error occured, please try again later'
					});
				}
			}
		}
	);
}

function forgotPassword(req, res) {
	const {
		email
	} = req.body;
	if (email == undefined) {
		res.status(400).json({
			message: 'Request must contain email.'
		});
	} else {
		User.findOne({
				email
			},
			function (err, user) {
				if (err) {
					res.status(401).json({
						message: 'Error communicating with database.'
					});
				} else if (!user) {
					res.status(401).json({
						message: 'Account associated with this email address was not found.'
					});
				} else {
					let resetPasswordCode = randomVerificationCode(
						16,
						'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
					);
					link =
						hostLink + '/user/newPassword.html?email=' + email + '&code=' + resetPasswordCode;
					var finalVerificationLink = passwordResetEmailTemplate.replace(
						'https://www.changeThisLinkToConfirmationLink.com',
						link
					);
					finalVerificationLink = finalVerificationLink.replace(
						'Seems like you forgot your password for',
						'Hey there ' + user.name + '! Seems like you forgot your password for'
					);
					mailOptions = {
						from: '"Support - QRCodes4Good" <support@qrcodes4good.com>',
						to: email,
						subject: 'Reset your password',
						html: finalVerificationLink
					};
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
							res.status(500).json({
								message: 'Error sending password reset email.',
								error: error
							});
						} else {
							console.log('Password reset email sent successfully!');
							user.resetPasswordCode = resetPasswordCode;
							user.resetPassword = true;
							user.save();
							res.status(201).json({
								message: 'Password reset email sent successfully!'
							});
						}
					});
				}
			}
		);
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
		},
		function (err, user) {
			if (err) {
				res.status(401).json({
					message: 'Error communicating with database.'
				});
			} else if (!user) {
				res.status(401).json({
					message: 'Account associated with this email address was not found.'
				});
			} else {
				if (user.resetPassword == true) {
					if ((user.resetPasswordCode = resetPasswordCode)) {
						bcrypt.genSalt(10, function (err, salt) {
							bcrypt.hash(newPassword, salt, function (err, passwordHash) {
								user.passwordHash = passwordHash;
								user.resetPassword = false;
								user.save();
							});
						});
						user.resetPassword = true;
						user.save();
						res.status(200).json({
							message: 'Your password has been changed, please login now.'
						});
						return true;
					} else {
						res.status(401).json({
							message: 'Incorrect password reset code.'
						});
					}
				} else {
					res.status(403).json({
						message: 'Access Denied.'
					});
				}
			}
		}
	);
}

function resendConfirmationEmail(req, res) {
	const {
		email
	} = req.body;
	User.findOne({
			email
		},
		async function (err, user) {
			if (err) {
				res.status(401).json({
					message: 'Error communicating with database.'
				});
			} else if (!user) {
				res.status(201).json({
					message: 'If an account with this email exists and is not verified, an account confirmation email will be sent.'
				});
			} else if (user) {
				if (user.emailVerified == false) {
					host = req.get('host');
					console.log('host = ' + host);
					link = hostLink + '/api/verify/' + email + '&' + user.emailVerifCode;
					var finalVerificationLink = verificationEmailTemplate.replace(
						'https://www.changeThisLinkToConfirmationLink.com',
						link
					);
					finalVerificationLink = finalVerificationLink.replace(
						'Hey there! Welcome to QRCodes4Good!',
						'Hey there ' + user.name + '! Welcome to QRCodes4Good!'
					);
					mailOptions = {
						from: '"Support - QRCodes4Good" <support@qrcodes4good.com>',
						to: email,
						subject: 'Please confirm your account',
						html: finalVerificationLink
					};
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
							res.status(500).json({
								message: 'Error sending confirmation email.',
								error: error
							});
						} else {
							console.log('Confirmation email sent successfully!');
							res.status(201).json({
								message: 'If an account with this email exists and is not verified, an account confirmation email will be sent.'
							});
						}
					});
				} else {
					res.status(201).json({
						message: 'If an account with this email exists and is not verified, an account confirmation email will be sent.'
					});
				}
			}
		}
	);
}

function getSimpleInformation(req, res) {
	const loginAuthTokenDesktop = req.headers.authorization;
	jwt.verify(loginAuthTokenDesktop, secret, function (err, valid) {
		if (err) {
			if (err.message == 'jwt expired') {
				res.status(401).json({
					message: 'Auth token has expired, please login again.'
				});
			} else {
				res.status(401).json({
					message: 'Error authenticating.'
				});
			}
		} else if (valid) {
			var name = valid['name'];
			res.status(200).json({
				name: name
			});
		} else {
			res.status(401).json({
				message: 'Error'
			});
		}
	})
}


module.exports = {
	get,
	create,
	update,
	destroy,
	login,
	bioLogin,
	verify,
	forgotPassword,
	updateResetPassword,
	acceptTos,
	resendConfirmationEmail,
	getSimpleInformation
};