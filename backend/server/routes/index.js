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
		userService.create(req, res);
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

router.post('/user/update', (req, res) => {
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
		userService.update(req, res);
	}
});

router.delete('/user/:email', (req, res) => {
	userService.destroy(req, res);
});

router.post('/user/login', (req, res) => {
	userService.login(req, res);
});

router.post('/user/tosUpdate', (req, res) => {
	userService.acceptTos(req, res);
});

router.post('/user/bioLogin', (req, res) => {
	userService.bioLogin(req, res);
});

router.post('/user/updateStripe', (req, res) => {
	userService.updateStripe(req, res);
});

router.get('/user/getCards/:email', (req, res) => {
	userService.getCards(req, res);
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
		userService.forgotPassword(req, res);
	}
});

router.get('/user/resetPassword/:email&:code', (req, res) => {
	console.log('in here');
	console.log(req.params.email + ' = email');
	console.log(req.params.code + ' = code');
	userService.resetPassword(req, res);
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
			userService.updateResetPassword(req, res);
		}
	}
});

router.post('/user/generateQRCode', (req, res) => {
	var data = req.body;
	console.log(data);
	if (
		data.email == undefined ||
		data.loginAuthToken == undefined ||
		data.paymentType == undefined ||
		data.defaultAmount == undefined ||
		data.qrCodeGivenName == undefined
	) {
		res.status(400).json({
			message:
				'Your request must contain a body of email, loginAuthToken, paymentType, defaultAmount, qrCodeName.'
		});
	} else {
		userService.generateQRCode(req, res);
	}
});

router.post('/user/getQRCodes', (req, res) => {
	var data = req.body;
	if (data.email == undefined || data.loginAuthToken == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of email, loginAuthToken.'
		});
	} else {
		userService.getQRCodes(req, res);
	}
});

router.post('/user/deleteQRCode', (req, res) => {
	var data = req.body;
	if (data.email == undefined || data.loginAuthToken == undefined || data.deleteID == undefined) {
		res.status(400).json({
			message: 'Your request must contain a body of email, loginAuthToken, deleteID'
		});
	} else {
		userService.deleteQRCode(req, res);
	}
});

module.exports = router;
