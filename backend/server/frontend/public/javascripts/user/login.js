/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signin').addEventListener('click', login);
    document.getElementById('forgotPassword').addEventListener('click', forgotPassword);
});

function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var serverResponse = document.getElementById('serverResponse');

    if (email == "" || password == "") {
        serverResponse.innerHTML = "<span class='red-response'>Email and password fields required.</span>";
    } else {
        var loginErrorCheckResponse = loginErrorCheck(email, password);
        if (loginErrorCheckResponse.length > 0) {
            serverResponse.innerHTML = "<span class='red-response'>" + loginErrorCheckResponse + "</span>";
        } else {
            serverResponse.innerHTML = "";
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', loginResponse);
            xhr.responseType = 'json';
            xhr.open('POST', '/api/user/login');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(
                JSON.stringify({
                    email: email,
                    inputPassword: password
                })
            );
        }

    }
}

function loginResponse() {
    if (this.status === 200) {
        window.location.href = "/home.html";
        window.localStorage.setItem("qr4gloginAuthTokenDesktop", this.response.loginAuthTokenDesktop);
    } else {
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function forgotPassword() {
    var passwordField = document.getElementById('password');
    var signinBtn = document.getElementById('signin');
    var forgotPasswordText = document.getElementById('forgotPassword');
    var formDiv = document.getElementById('form');
    var submitBtn = document.createElement('button');
    passwordField.parentNode.removeChild(passwordField);
    signinBtn.parentNode.removeChild(signinBtn);
    forgotPasswordText.parentNode.removeChild(forgotPasswordText);
    for (var i = 0; i < document.getElementsByClassName('breaks').length - 2; i++) {
        document.getElementsByClassName('breaks')[i].style.display = "none";
    }
    submitBtn.id = "submitBtn";
    submitBtn.innerHTML = "submit";
    formDiv.appendChild(submitBtn);
    document.getElementById('submitBtn').addEventListener('click', resetPassword);
}

function resetPassword() {
    var email = document.getElementById('email').value;
    var serverResponse = document.getElementById('serverResponse');
    var emailCheck = emailErrorCheck(email);

    if (emailCheck.length > 0) {
        serverResponse.innerHTML = "<span class='red-response'>" + emailCheck + "</span>";
    } else {
        serverResponse.innerHTML = "";
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', resetPasswordResponse);
        xhr.responseType = 'json';
        xhr.open('POST', '/api/user/forgotPassword');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(
            JSON.stringify({
                email: email
            })
        );
    }

}

function resetPasswordResponse() {
    if (this.status === 201) {
        window.location.href = "forgotPassword.html";
    } else {
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function loginErrorCheck(email, password) {
    let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let pwdLowerReg = /[a-z]+/;
    let pwdUpperReg = /[A-Z]+/;
    let pwdNumReg = /.*\d.*/;

    let outputString = '';


    if (!emailReg.test(email)) {
        outputString += ' Invalid email. ';
    }

    if (password.length < 6 || password.length > 20) {
        outputString += ' Incorrect password. ';
    }

    if (!pwdLowerReg.test(password)) {
        if (!(outputString.indexOf('Incorrect password') > 0)) {
            outputString += ' Incorrect password. ';
        }
    }

    if (!pwdUpperReg.test(password)) {
        if (!(outputString.indexOf('Incorrect password') > 0)) {
            outputString += ' Incorrect password. ';
        }
    }

    if (!pwdNumReg.test(password)) {
        if (!(outputString.indexOf('Incorrect password') > 0)) {
            outputString += ' Incorrect password. ';
        }
    }
    return outputString;
}

function emailErrorCheck(email) {
    let emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let outputString = '';
    if (!emailReg.test(email)) {
        outputString += ' Invalid email. ';
    }
    return outputString;
}