const User = require('../user-model');
var jwt = require('jsonwebtoken');
var stripe = require('stripe')('sk_test_w5PEuWfNwsE2EODIr52JXvNu');

var secret = '2CWukLuOME4D16I';

var port = '8080';
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
	} = req.body;
	let exp_year = expiry.substring(expiry.indexOf("/") + 1, expiry.length);
	let exp_month = expiry.substring(0, 2);
	let ccLastDigits = number.slice(-4);
  
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
		stripe.tokens.create({
		  card: {
			number,
			exp_month,
			exp_year,
			cvc,
			name,
			address_zip: postalCode
		  }
		}, function(err, token) {
		  if (err) {
			alert('Adding card failed with error: ' + result.error.message);
		  } else {
			if (user.stripeData.name.length == 0) {
				stripe.customers.create({
					description: 'Customer for MSGive',
					source: "tok_visa" //token.id
				  }, function(err, customer) {
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
					user.customerToken,
					{ source: token.id},
					function(err, card) {
						if (err) {
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
					}
				  );
			}
		  }
		});
	  }
	})
	.catch(err => {
	  res.status(500).send(err);
	});
  }

function getCards(req, res) {
	var authToken = req.headers['Authorization'];
	const email = req.params.email;
	jwt.verify(authToken, secret, function(err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Token has expired'
			});
		}
		if (decoded && decoded['email'] == email) {
			//TODO
			User.findOne(
				{
					email
				},
				function(err, user) {
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

module.exports = {
	updateStripe,
	getCards
};
