const User = require('../user-model');
var jwt = require('jsonwebtoken');
var stripe = require('stripe')('sk_test_w5PEuWfNwsE2EODIr52JXvNu');

var secret = '2CWukLuOME4D16I';

require('../mongo').connect();

var port = '8080';
var hostLink = 'https://www.qrcodes4good.com';

function updateStripe(req, res) {
	const { email, cvc, expiry, name, number, postalCode, type } = req.body;
	let exp_year = expiry.substring(expiry.indexOf('/') + 1, expiry.length);
	let exp_month = expiry.substring(0, 2);
	let ccLastDigits = number.slice(-4);
	let ccToken = null;
	let ccPrimaryCard = false;

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
				Stripe.card.createToken(
					{
						number,
						exp_month,
						exp_year,
						cvc,
						name,
						address_zip: postalCode
					},
					(status, response) => {
						if (response.error) {
							alert('Adding card failed with error: ' + response.error.message);
						} else {
							ccToken = response.id;
							stripe.accounts.createSource(user.stripeToken, { source: ccToken }, function(err, card) {
								if (err) {
									res.status(401).json({
										message: 'Error communicating with database'
									});
								}
							});
						}
					}
				);
				user.stripeData.token.push(ccToken);
				user.stripeData.title.push(type);
				user.stripeData.name.push(name);
				user.stripeData.primaryCard.push(ccPrimaryCard);
				user.stripeData.creditCardLastDigits.push(ccLastDigits);
				user.stripeData.creditCardType.push(type);
				user.stripeData.numberOfDigits.push(number.length);
				user.save().then(() => {
					res.status(200).json({
						message: 'Card Added.',
						cardCreated: true
					});
				});
			}
		}
	).catch((err) => {
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
