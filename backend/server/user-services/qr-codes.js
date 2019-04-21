const User = require('../user-model');
var jwt = require('jsonwebtoken');
var QRCode = require('qrcode');

var secret = '2CWukLuOME4D16I';

var hostLink = 'https://www.qrcodes4good.com';

function generateQRCode(req, res) {
	const {
		paymentType,
		defaultAmount,
		loginAuthToken,
		qrCodeGivenName
	} = req.body;
	jwt.verify(loginAuthToken, secret, function (err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Login auth token has expired'
			});
		} else if (decoded) {
			var email = decoded[`email`];
			if (defaultAmount > 50.00 || defaultAmount <= 0.00) {
				res.status(401).json({
					message: "Default amount must be greater than 0.00 and less than 50.00"
				});
				return;
			}
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
					} else if (user) {
						if (user.generatedQRCodes.length + 1 > 10) {
							res.status(401).json({
								message: 'User is only allowed to have 10 saved QRCodes at any given time.'
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
	console.log(req.body);
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
	const {
		loginAuthToken,
		deleteID
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
						User.collection
							.update({
								email: email
							}, {
								$pull: {
									generatedQRCodes: {
										qrCodeID: deleteID
									}
								}
							})
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

function saveQRCode(req, res) {
	var {
		userID,
		qrcodeData
	} = req.body;
	if (qrcodeData.includes('data') != true) {
		QRCode.toDataURL(qrcodeData, {
			errorCorrectionLevel: 'L'
		}).then((qrdata) => {
			qrcodeData = qrdata;
		});
	}
	var _id = userID;
	const loginAuthToken = req.headers.authorization;
	jwt.verify(loginAuthToken, secret, function (err, decoded) {
		if (err) {
			res.status(401).json({
				message: 'Login auth token has expired'
			});
		} else if (decoded) {
			let email = decoded[`email`];
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
					} else if (user) {
						for (var i = 0; i < user.savedQRCodes.length; i++) {
							if (user.savedQRCodes[i].qrCodeData == qrcodeData) {
								res.status(401).json({
									message: 'QRCode already saved to account.'
								});
								return;
							}
						}
						User.findOne({
								_id
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
								} else if (user) {
									let defaultAmount = '';
									for (var i = 0; i < user.generatedQRCodes.length; i++) {
										if (user.generatedQRCodes[i].qrCodeData == qrcodeData) {
											defaultAmount = user.generatedQRCodes[i].qrCodeDefaultAmount;
										}
									}
									var qrCodeUser = user.name;
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
											} else if (user) {
												var qrCodeIDNum = 0;
												if (user.savedQRCodes.length > 0) {
													qrCodeIDNum =
														user.savedQRCodes[user.savedQRCodes.length - 1].qrCodeID + 1;
												}
												user.savedQRCodes.push({
													qrCodeID: qrCodeIDNum,
													qrCodeData: qrcodeData,
													qrCodeUser: qrCodeUser,
													qrCodeUserID: _id,
													qrCodeDefaultAmount: defaultAmount
												});
												user.save();
												res.status(200).json({
													message: 'QRCode saved successfully'
												});
											} else {
												res.status(401).json({
													message: 'Error. Please try again later.'
												});
											}
										}
									);
								}
							}
						);
					}
				}
			);
		}
	});
}

function getSavedQRCodes(req, res) {
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
						res.status(200).json({
							message: 'Successfully retrieved QRCodes.',
							qrcodes: user.savedQRCodes
						});
					}
				}
			);
		}
	});
}

function deleteSavedQRCode(req, res) {
	const {
		deleteID
	} = req.body;
	const loginAuthToken = req.headers.authorization;
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
						User.collection
							.update({
								email: email
							}, {
								$pull: {
									savedQRCodes: {
										qrCodeID: deleteID
									}
								}
							})
							.then(() => {
								res.status(200).json({
									message: 'Successfully deleted QRCode.',
									qrcodes: user.savedQRCodes
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
	deleteQRCode,
	saveQRCode,
	getSavedQRCodes,
	deleteSavedQRCode
};