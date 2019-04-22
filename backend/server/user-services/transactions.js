/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Corey Miner
 *  @author Benjamin Wodhams
 *
 */

const User = require('../user-model');
var jwt = require('jsonwebtoken');
var stripe = require("stripe")("sk_test_w5PEuWfNwsE2EODIr52JXvNu");

var secret = '2CWukLuOME4D16I';

var hostLink = 'https://www.qrcodes4good.com';

function updateStripe(req, res) {
	const {
		email,
		cvc,
		expiry,
		name,
		number,
		postalCode,
		type,
		card,
		routing_number,
		account_number
	} = req.body;
	console.log(req.body)


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
			} else if (card) {
				let exp_year = expiry.substring(expiry.indexOf("/") + 1, expiry.length);
				let exp_month = expiry.substring(0, 2);
				let ccLastDigits = number.slice(-4);
				console.log("in card")
				createCard(res, user, cvc, exp_year, exp_month, ccLastDigits, name, number, postalCode, type);
			} else {
				console.log("in bank")
				createBank(res, user, name, routing_number, account_number);
			}
		})
		.catch(err => {
			console.log("oh no!")
			res.status(500).send(err);
		});
}

function cardsDoNotExistCheck(user) {
	if (user.stripeData.name.length == 0) {
		return true;
	} else {
		for (i = 0; i < user.stripeData.name.length; i++) {
			if (user.stripeData.token[i].substring(0, 2) != "ba") {
				return false;
			}
		}
	}
	return true;

}

function createCard(res, user, cvc, exp_year, exp_month, ccLastDigits, name, number, postalCode, type) {
	stripe.tokens.create({
		card: {
			number,
			exp_month,
			exp_year,
			cvc,
			name,
			address_zip: postalCode
		}
	}, function (err, token) {
		if (err) {
			console.log('Adding card failed with error: ' + err.message);
			res.status(500).send(err);
		} else {
			if (cardsDoNotExistCheck(user)) {
				stripe.customers.create({
					description: 'Customer for MSGive',
					source: "tok_visa" //source: token.id,
				}, function (err, customer) {
					console.log(customer)
					if (err) {
						res.status(500).send(err);
					} else {
						user.customerToken = customer.id;
						user.stripeData.token.push(token.id);
						user.stripeData.title.push(type);
						user.stripeData.name.push(name);
						user.stripeData.primaryCard.push(true);
						user.stripeData.creditCardLastDigits.push(ccLastDigits);
						user.stripeData.creditCardType.push(type);
						user.stripeData.numberOfDigits.push(number.length);
						user.save()
							.then(() => {
								res.status(200).json({
									message: "Card Added.",
									cardCreated: true
								})
							});
					}
				});
			} else {
				stripe.customers.createSource(
					user.customerToken, {
						source: token.id
					},
					function (err, card) {
						if (err) {
							console.log(err);
							res.status(500).send(err);
						} else {
							user.stripeData.token.push(token.id);
							user.stripeData.title.push(type);
							user.stripeData.name.push(name);
							user.stripeData.primaryCard.push(false);
							user.stripeData.creditCardLastDigits.push(ccLastDigits);
							user.stripeData.creditCardType.push(type);
							user.stripeData.numberOfDigits.push(number.length);
							user.save()
								.then(() => {
									res.status(200).json({
										message: "Card Added.",
										cardCreated: true
									})
								});
						}
					});
			}
		}
	});
}

function createBank(res, user, name, routing_number, account_number) {
	console.log("in bank")
	stripe.tokens.create({
		bank_account: {
			country: 'US',
			currency: 'usd',
			account_holder_name: name,
			account_holder_type: 'individual',
			routing_number: '110000000', //routing_number,
			account_number: '000123456789' //account_number,
		}
	}, function (err, token) {
		if (err) {
			console.log('Adding bank account failed with error: ' + err.message);
			res.status(500).send(err);
		} else {
			console.log(user);
			stripe.accounts.createExternalAccount(
				user.stripeToken, {
					external_account: token.id
				},
				function (err, bank_account) {
					if (err) {
						res.status(500).send(err);
					} else {
						user.stripeData.token.push(bank_account.id);
						user.stripeData.title.push(bank_account.bank_name);
						user.stripeData.name.push(name);
						user.stripeData.primaryCard.push(false);
						user.stripeData.creditCardLastDigits.push(bank_account.last4);
						user.stripeData.creditCardType.push('bank_account');
						user.stripeData.numberOfDigits.push(account_number.length);
						user.save()
							.then(() => {
								res.status(200).json({
									message: "Bank Added.",
									bankCreated: true,
									stripeVerified: user.stripeVerified,
								})
							});
					}
				}
			);

		}
	});

}

function getCards(req, res) {
	var authToken = req.headers.authorization;
	const email = req.params.email;
	jwt.verify(authToken, secret, function (err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Token has expired'
			});
		} else if (decoded && decoded['email'] == email) {
			//TODO
			User.findOne({
					email
				},
				function (err, user) {
					if (err) {
						res.status(401).json({
							message: 'Error communicating with database'
						});
					} else if (!user) {
						res.status(401).json({
							message: 'A user with this email address was not found'
						});
					} else {
						res.status(200).json(user.stripeData);
					}
				}
			);
		} else {
			res.status(401).json({
				message: 'Token has expired'
			});
		}
	});
}

function transaction(req, res) {
	const {
		email,
		receiverID,
		amount,
	} = req.body;
	const authToken = req.headers.authorization;
	jwt.verify(authToken, secret, function (err, valid) {
		if (err) {
			if (err.message == 'jwt expired') {
				res.status(401).json({
					message: 'Auth token has expired'
				});
			} else {
				res.status(401).json({
					message: 'Error authenticating'
				});
			}
		} else if (valid) {
			var payer = valid['email'];
			User.findOne({
					email: payer
				}, async function (err, user) {
					if (err) {
						res.status(401).json({
							message: "Error communicating with database",
						});
					} else if (!user) {
						res.status(401).json({
							message: "A user with this email address was not found",
						});
					} else {
						logTransaction(req, email, amount, receiverID);
						processTransaction(res, user.customerToken, amount * 100, receiverID);
					}
				})
				.catch(err => {
					console.log("oh no!")
					res.status(500).send(err);
				});
		}
	});
}

function logTransaction(req, email, amount, _id) {
	User.findOne({
		_id
	}, function (err, user) {
		if (!err) {
			User.findOne({
				email
			}, function (err2, user2) {
				if (!err2) {
					user.receivedPayments.push({
						name: user2.name,
						amount: amount,
						anonymous: false,
						date: new Date()
					});
					user2.sentPayments.push({
						name: user.name,
						amount: amount,
						anonymous: false,
						date: new Date()
					});
					user.save();
					user2.save();
					console.log("Transaction logged");
				} else {
					console.log("Couldn't find sender");
				}
			});
		} else {
			console.log("Couldn't find receiver");
		}
	});
}

async function processTransaction(res, customerToken, chargeAmmount, _id) {
	User.findOne({
			_id
		}, async function (err, user) {
			if (err) {
				res.status(401).json({
					message: "Error communicating with database",
				});
			} else if (!user) {
				res.status(401).json({
					message: "A user with this id was not found",
				});
			} else {
				console.log(customerToken, chargeAmmount, user.stripeToken);
				stripe.charges.create({
					amount: chargeAmmount,
					currency: "usd",
					description: 'QR4G charge',
					customer: customerToken,
					transfer_data: {
						amount: chargeAmmount - (Math.ceil(chargeAmmount * 0.029) + 30),
						destination: user.stripeToken,
					},
				}).then(function (charge) {
					// asynchronously called
				});
				res.status(200).json({
					message: "Winning",
					success: true
				});
			}
		})
		.catch(err => {
			console.log("oh no!")
			res.status(500).send(err);
		});
}

function verifyStripe(req, res) {
	const {
		email,
		ssn_last_4,
		dob_day,
		dob_month,
		dob_year,
		city,
		line1,
		postal_code,
		state,
	} = req.body;
	console.log(req.body)

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
				console.log("in verify")
				stripe.accounts.update(
					user.stripeToken, {
						legal_entity: {
							ssn_last_4,
							dob: {
								day: dob_day,
								month: dob_month,
								year: dob_year
							},
							address: {
								city,
								country: 'US',
								line1,
								line2: null,
								postal_code,
								state,
							},
						},
					},
					function (err, account) {
						if (err) {
							res.status(500).send(err);
						} else {
							user.stripeVerified = true;
							user.save()
								.then(() => {
									res.status(200).json({
										message: "Verification Sent",
										verification: true
									})
								});
						}
						console.log(account)
					});
			}
		})
		.catch(err => {
			console.log("oh no!")
			res.status(500).send(err);
		});
}

function getTransactions(req, res) {
	var authToken = req.headers.authorization;
	jwt.verify(authToken, secret, function (err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Token has expired'
			});
		} else if (decoded) {
			var email = decoded['email'];
			User.findOne({
					email
				},
				function (err, user) {
					if (err) {
						res.status(401).json({
							message: 'Error communicating with database'
						});
					} else if (!user) {
						res.status(401).json({
							message: 'A user with this email address was not found'
						});
					} else {
						res.status(200).json({
							sent: user.sentPayments,
							received: user.receivedPayments
						});
					}
				}
			);
		} else {
			res.status(401).json({
				message: 'Token has expired'
			});
		}
	});
}

function deletePayment(req, res) {
	const {
		loginAuthToken,
		deleteIndex
	} = req.body;
	jwt.verify(loginAuthToken, secret, function (err, valid) {
		if (err) {
			if (err.message == 'jwt expired') {
				res.status(401).json({
					message: 'Login auth token has expired, please login again.'
				});
			} else {
				res.status(401).json({
					message: 'Error authenticating.'
				});
			}
		} else if (valid) {
			var email = valid[`email`];
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
							message: "Account doesn't exist."
						});
					} else {
						user.stripeData.token = user.stripeData.token.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.title = user.stripeData.title.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.name = user.stripeData.name.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.primaryCard = user.stripeData.primaryCard.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.creditCardLastDigits = user.stripeData.creditCardLastDigits.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.creditCardType = user.stripeData.creditCardType.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.stripeData.numberOfDigits = user.stripeData.numberOfDigits.filter(function (value, index, arr) {
							return index != deleteIndex;
						});
						user.save()
							.then(() => {
								res.status(200).json({
									message: 'Successfully deleted Payment Method.',
									stripeData: user.stripeData
								});
							})
							.catch((err) => {
								res.status(500).json({
									message: 'Error deleting QRCode.'
								});
							});
					}
				}
			);
		}
	});
}


module.exports = {
	updateStripe,
	getCards,
	transaction,
	getTransactions,
	verifyStripe,
	deletePayment
};