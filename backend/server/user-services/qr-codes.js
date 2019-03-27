const User = require('../user-model');
var jwt = require('jsonwebtoken');
var QRCode = require('qrcode');

var secret = '2CWukLuOME4D16I';

require('./mongo').connect();

var port = '8080';
var hostLink = 'https://www.qrcodes4good.com';

function generateQRCode(req, res) {
	const { paymentType, defaultAmount, loginAuthToken, qrCodeGivenName } = req.body;
	jwt.verify(loginAuthToken, secret, function(err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Login auth token has expired'
			});
		} else if (decoded) {
			var email = decoded[`email`];
			User.findOne(
				{
					email
				},
				function(err, user) {
					if (err) {
						res.status(401).json({
							message: 'Error communicating with database.'
						});
					} else if (!user) {
						res.status(401).json({
							message: "Account doesn't exist."
						});
					} else if (user) {
						if (user.generatedQRCodes.length + 1 > 5) {
							res.status(401).json({
								message: 'User is only allowed to have 5 saved QRCodes at any given time.'
							});
						} else {
							var finalPaymentType = '';
							if (paymentType == 0) {
								finalPaymentType = 'Service';
							} else {
								finalPaymentType = 'Donation';
							}
							var QRCodeData =
								'{"u": "' +
								user._id +
								'","a": "' +
								defaultAmount +
								'","p": "' +
								finalPaymentType +
								'"}';
							var qrCodeIDNum = 0;
							if (user.generatedQRCodes.length > 0) {
								qrCodeIDNum = user.generatedQRCodes[user.generatedQRCodes.length - 1].qrCodeID + 1;
							}
							QRCode.toDataURL(QRCodeData, {
								errorCorrectionLevel: 'L'
							})
								.then((qrdata) => {
									QRCode.toString(QRCodeData, {
										errorCorrectionLevel: 'L'
									})
										.then((qrstring) => {
											user.generatedQRCodes.push({
												qrCodeID: qrCodeIDNum,
												qrCodeData: qrdata,
												qrCodeString: qrstring,
												qrCodeName: qrCodeGivenName,
												qrCodeDefaultAmount: defaultAmount,
												qrCodeType: finalPaymentType
											});
											user.save();
											res.status(200).json({
												message: 'QRCode generated successfully',
												qrcodeData: qrdata,
												qrcodeString: qrstring
											});
										})
										.catch((err) => {
											console.log('QRCode generation had an error of : ' + err);
											res.status(401).json({
												message: 'Error generating QRCode 1',
												error: err
											});
											return;
										});
								})
								.catch((err) => {
									console.log('QRCode generation had an error of : ' + err);
									res.status(401).json({
										message: 'Error generating QRCode 2',
										error: err
									});
								});
						}
					} else {
						res.status(401).json({
							message: 'Error. Please try again later.'
						});
					}
				}
			);
		}
	});
}

function getQRCodes(req, res) {
	const { loginAuthToken } = req.body;
	jwt.verify(loginAuthToken, secret, function(err, valid) {
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
			var email = valid[`email`];
			User.findOne(
				{
					email
				},
				function(err, user) {
					if (err) {
						res.status(401).json({
							message: 'Error communicating with database.'
						});
					} else if (!user) {
						res.status(401).json({
							message: "Account doesn't exist."
						});
					} else {
						res.status(200).json({
							message: 'Successfully retrieved QRCodes.',
							qrcodes: user.generatedQRCodes
						});
					}
				}
			);
		}
	});
}

function deleteQRCode(req, res) {
	const { loginAuthToken, deleteID } = req.body;
	jwt.verify(loginAuthToken, secret, function(err, valid) {
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
			User.findOne(
				{
					email
				},
				function(err, user) {
					if (err) {
						res.status(401).json({
							message: 'Error communicating with database.'
						});
					} else if (!user) {
						res.status(401).json({
							message: "Account doesn't exist."
						});
					} else {
						User.collection
							.update(
								{
									email: email
								},
								{
									$pull: {
										generatedQRCodes: {
											qrCodeID: deleteID
										}
									}
								}
							)
							.then(() => {
								res.status(200).json({
									message: 'Successfully deleted QRCode.',
									qrcodes: user.generatedQRCodes
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
	generateQRCode,
	getQRCodes,
	deleteQRCode
};
