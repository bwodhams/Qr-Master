/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

const express = require('express');
const router = express.Router();

const loginService = require('../user-services/login');
const qrService = require('../user-services/qr-codes');
const transactionService = require('../user-services/transactions');

router.get('/users', (req, res) => {
	loginService.get(req, res);
});

router.get('/verify/:email&:code', (req, res) => {
	loginService.verify(req, res);
});

function registrationErrorCheck(fullName, email, password, confirmPassword) {
	let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	let pwdLowerReg = /[a-z]+/;
	let pwdUpperReg = /[A-Z]+/;
	let pwdNumReg = /.*\d.*/;

	let outputString = '';

	if (fullName.length < 1) {
		outputString += ' Invalid name. ';
	}

	if (!emailReg.test(email)) {
		outputString += ' Invalid email. ';
	}

	if (password.length < 6 || password.length > 20) {
		outputString += ' Password must be longer than 6 characters and less than 20 characters. ';
	}

	if (!pwdLowerReg.test(password)) {
		outputString += ' Password must contain at least one lowercase character. ';
	}

	if (!pwdUpperReg.test(password)) {
		outputString += ' Password must contain at least one uppercase character. ';
	}

	if (!pwdNumReg.test(password)) {
		outputString += ' Password must contain at least one digit. ';
	}

	if (password != confirmPassword) {
		outputString += " Password and confirmation password don't match. ";
	}

	return outputString;
}

router.put('/user/create', (req, res) => {
	var errorCheck = registrationErrorCheck(req.body.name, req.body.email, req.body.password, req.body.confirmPassword);
	if (errorCheck.length > 0) {
		res.status(400).json({
			message: errorCheck,
			accountCreated: false
		});
	} else {
		loginService.create(req, res);
	}
});

function validUpdateCheck(email, password) {
	let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	let pwdLowerReg = /[a-z]+/;
	let pwdUpperReg = /[A-Z]+/;
	let pwdNumReg = /.*\d.*/;

	let outputString = '';

	if (!emailReg.test(email)) {
		outputString += ' New email is invalid. ';
	}

	if (password.length < 6 || password.length > 20) {
		outputString += ' Password must be longer than 6 characters and less than 20 characters. ';
	}

	if (!pwdLowerReg.test(password)) {
		outputString += ' Password must contain at least one lowercase character. ';
	}

	if (!pwdUpperReg.test(password)) {
		outputString += ' Password must contain at least one uppercase character. ';
	}

	if (!pwdNumReg.test(password)) {
		outputString += ' Password must contain at least one digit. ';
	}

	return outputString;
}

router.put('/user/update', (req, res) => {
	if (req.body.email == undefined) {
		res.status(400).json({
			message: 'You must have an email in the body.'
		});
		return false;
	}
	if (req.body.newPassword == undefined && req.body.newEmail != undefined) {
		var updateCheck = validUpdateCheck(req.body.newEmail, 'Abc1234');
	} else if (req.body.newPassword != undefined && req.body.newEmail == undefined) {
		var updateCheck = validUpdateCheck('abc@gmail.com', req.body.newPassword);
	} else if (req.body.newPassword != undefined && req.body.newEmail != undefined) {
		var updateCheck = validUpdateCheck(req.body.newEmail, req.body.newPassword);
	} else {
		var updateCheck = '';
	}

	if (updateCheck.length > 0) {
		res.status(400).json({
			message: updateCheck
		});
	} else {
		loginService.update(req, res);
	}
});

router.delete('/user/:email', (req, res) => {
	loginService.destroy(req, res);
});

router.post('/user/login', (req, res) => {
	loginService.login(req, res);
});

router.post('/user/tosUpdate', (req, res) => {
	loginService.acceptTos(req, res);
});

router.post('/user/bioLogin', (req, res) => {
	loginService.bioLogin(req, res);
});

router.post('/user/updateStripe', (req, res) => {
	transactionService.updateStripe(req, res);
});

router.post('/user/verifyStripe', (req, res) => {
	transactionService.verifyStripe(req, res);
});

router.post('/user/transaction', (req, res) => {
	transactionService.transaction(req, res);
});

router.get('/user/getCards/:email', (req, res) => {
	transactionService.getCards(req, res);
});

router.get('/user/transactionHistory', (req, res) => {
	transactionService.getTransactions(req, res);
});

function validEmailCheck(email) {
	let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	let outputString = '';

	if (!emailReg.test(email)) {
		outputString += ' Email address is invalid. ';
	}

	return outputString;
}

router.post('/user/forgotPassword', (req, res) => {
	var validEmail = validEmailCheck(req.body.email);
	if (validEmail.length > 0) {
		res.status(400).json({
			message: validEmail
		});
	} else {
		loginService.forgotPassword(req, res);
	}
});

function validResetCheck(password) {
	let pwdLowerReg = /[a-z]+/;
	let pwdUpperReg = /[A-Z]+/;
	let pwdNumReg = /.*\d.*/;

	let outputString = '';

	if (password.length < 6 || password.length > 20) {
		outputString += ' Password must be longer than 6 characters and less than 20 characters. ';
	}

	if (!pwdLowerReg.test(password)) {
		outputString += ' Password must contain at least one lowercase character. ';
	}

	if (!pwdUpperReg.test(password)) {
		outputString += ' Password must contain at least one uppercase character. ';
	}

	if (!pwdNumReg.test(password)) {
		outputString += ' Password must contain at least one digit. ';
	}

	return outputString;
}

router.post('/user/updateResetPassword', (req, res) => {
	if (
		req.body.email == undefined ||
		req.body.resetPasswordCode == undefined ||
		req.body.newPassword == undefined ||
		req.body.confirmNewPassword == false
	) {
		res.status(400).json({
			message: 'Your request must contain a body of email, resetPasswordCode, newPassword, confirmNewPassword'
		});
	} else {
		var checkNewPassword = validResetCheck(req.body.newPassword);
		if (checkNewPassword.length > 0) {
			res.status(400).json({
				message: checkNewPassword
			});
		} else if (req.body.newPassword != req.body.confirmNewPassword) {
			res.status(400).json({
				message: "New password and confirm new password don't match."
			});
		} else {
			loginService.updateResetPassword(req, res);
		}
	}
});

router.post('/user/generateQRCode', (req, res) => {
	var data = req.body;
	console.log(data);
	if (
		data.loginAuthToken == undefined ||
		data.paymentType == undefined ||
		data.defaultAmount == undefined ||
		data.qrCodeGivenName == undefined
	) {
		res.status(400).json({
			message: 'Your request must contain a body of loginAuthToken, paymentType, defaultAmount, qrCodeName.'
		});
	} else {
		qrService.generateQRCode(req, res);
	}
});

router.get('/user/getQRCodes', (req, res) => {
	qrService.getQRCodes(req, res);
});

router.post('/user/deleteQRCode', (req, res) => {
	var data = req.body;
	if (data.loginAuthToken == undefined || data.deleteID == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of loginAuthToken, deleteID'
		});
	} else {
		qrService.deleteQRCode(req, res);
	}
});

router.post('/user/resendConfirmationEmail', (req, res) => {
	var data = req.body;
	if (data.email == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of email.'
		});
	} else {
		loginService.resendConfirmationEmail(req, res);
	}
});

router.put('/user/saveQRCode', (req, res) => {
	var data = req.body;
	if (data.userID == undefined || data.qrcodeData == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of userID and qrcodeData'
		});
	} else {
		qrService.saveQRCode(req, res);
	}
});

router.post('/user/deleteSavedQRCode', (req, res) => {
	var data = req.body;
	if (data.deleteID == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of deleteID'
		});
	} else {
		qrService.deleteSavedQRCode(req, res);
	}
});

router.put('/user/updateDefaultPayment', (req, res) => {
	var data = req.body;
	if (data.defaultIndex == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of defaultIndex'
		});
	} else{
		transactionService.updateDefaultPayment(req, res);
	}
});

router.post('/user/deletePayment', (req, res) => {
	var data = req.body;
	if (data.deleteIndex == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of deleteIndex'
		});
	} else {
		transactionService.deletePayment(req, res);
	}
});

router.get('/user/getSavedQRCodes', (req, res) => {
	qrService.getSavedQRCodes(req, res);
});

router.get('/user/getSimpleInfo', (req, res) => {
	loginService.getSimpleInformation(req, res);
})

module.exports = router;