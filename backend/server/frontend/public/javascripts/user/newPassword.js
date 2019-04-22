/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

var url = new URL(window.location);
var email = url.searchParams.get('email');
var code = url.searchParams.get('code');

function changePassword() {
	var newPassword = document.getElementById('newPassword').value;
	var confirmNewPassword = document.getElementById('newPasswordConfirm').value;

	if (newPassword != confirmNewPassword) {
		document.getElementById('response').innerHTML = "Passwords don't match";
	} else {
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load', changePasswordResponse);
		xhr.responseType = 'json';
		xhr.open('POST', '/api/user/updateResetPassword');
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.send(
			JSON.stringify({
				email: email,
				resetPasswordCode: code,
				newPassword: newPassword,
				confirmNewPassword: confirmNewPassword
			})
		);
	}
}

function changePasswordResponse() {
	if (this.status === 201) {
		document.getElementById('response').innerHTML =
			'Password successfully changed. You may now login with your new password.';
	} else {
		document.getElementById('response').innerHTML = JSON.stringify(this.response);
	}
}
document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('submitBtn').addEventListener('click', changePassword);
});