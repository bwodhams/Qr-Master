/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

function register() {
    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var confirmPassword = document.getElementById('confirmPassword');
    var submitBtn = document.getElementById('registerBtn');
    name.readOnly = true;
    email.readOnly = true;
    password.readOnly = true;
    confirmPassword.readOnly = true;
    submitBtn.disabled = true;
    var serverResponse = document.getElementById('serverResponse');

    if (name.value == "" || email.value == "" || password.value == "" || confirmPassword.value == "") {
        serverResponse.innerHTML = "<span class='red-response'>All fields required.</span>"
    } else {
        var errorCheck = registrationErrorCheck(name.value, email.value, password.value, confirmPassword.value);
        if (errorCheck.length > 0) {
            serverResponse.innerHTML = "<span class='red-response'>" + errorCheck + "</span>";
            resetFields();
        } else {
            serverResponse.innerHTML = "";
            var form = document.getElementById('inputForm');
            var loadingCircle = document.getElementById('loadingImg');
            form.style.filter = "blur(4px)";
            loadingCircle.innerHTML = '<img src="../images/loading_screen.svg" alt="loading" height="125px" width="125px">';

            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', registerResponse);
            xhr.responseType = 'json';
            xhr.open('PUT', '/api/user/create');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(
                JSON.stringify({
                    name: name.value,
                    email: email.value,
                    password: password.value,
                    confirmPassword: confirmPassword.value
                })
            );
        }

    }
}

function registerResponse() {
    if (this.status === 201) {
        window.location.href = "/newAccount.html";
    } else {
        resetFields();
        document.getElementById('inputForm').style.filter = "";
        document.getElementById('loadingImg').innerHTML = "";
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('registerBtn').addEventListener('click', register);
});

function resetFields() {
    document.getElementById('name').readOnly = false;
    document.getElementById('email').readOnly = false;;
    document.getElementById('password').readOnly = false;;
    document.getElementById('confirmPassword').readOnly = false;;
    document.getElementById('registerBtn').disabled = false;
}

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