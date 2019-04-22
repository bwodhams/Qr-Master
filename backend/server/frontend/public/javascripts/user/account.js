/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

var changeName = false;
var changeEmail = false;
var changePassword = false;
var oldEmail = undefined;
var oldName = undefined;

document.addEventListener("DOMContentLoaded", function () {
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    email.value = getCookie("accEmail");
    name.value = getCookie("accName");
    oldEmail = getCookie("accEmail");
    oldName = getCookie("accName");
    document.getElementById('changePass').addEventListener('click', activateChangePass);
    document.getElementById('editName').addEventListener('click', editName);
    document.getElementById('editEmail').addEventListener('click', editEmail);
    document.getElementById('submitBtn').addEventListener('click', updateAccount);
});

function activateChangePass() {
    changePassword = true;
    document.getElementById('changePass').hidden = true;
    document.getElementById('changePassDiv').hidden = false;
}

function editName() {
    changeName = true;
    document.getElementById('editName').hidden = true;
    document.getElementById('name').disabled = false;
}

function editEmail() {
    changeEmail = true;
    document.getElementById('editEmail').hidden = true;
    document.getElementById('email').disabled = false;
}

function updateAccount() {
    var ready = true;
    var errorResponse = "";
    var name = undefined;
    var newEmail = undefined;
    var newPassword = undefined;
    var confirmNewPassword = undefined;
    var serverResponse = document.getElementById('serverResponse');
    var currentPassword = document.getElementById('currentPassword').value;
    var checkCurrentPassword = passwordErrorCheck(currentPassword);
    serverResponse.innerHTML = "";
    if (currentPassword == "") {
        ready = false;
        serverResponse.innerHTML = '<span class="red-response">Current password field is required.</span>';
    } else {
        if (checkCurrentPassword.length > 0) {
            errorResponse += checkCurrentPassword;
            ready = false;
        } else {
            if (changeName == true) {
                name = document.getElementById('name').value;
                if (name == oldName) {
                    name = undefined;
                    changeName = false;
                }
            }
            if (changeEmail == true) {
                newEmail = document.getElementById('email').value;
                if (newEmail == oldEmail) {
                    newEmail = undefined;
                    changeEmail = false;
                } else {
                    if (emailErrorCheck(newEmail).length > 0) {
                        errorResponse += " Invalid email.";
                        ready = false;
                    }
                }
            }
            if (changePassword == true) {
                newPassword = document.getElementById('password').value;
                confirmNewPassword = document.getElementById('confirmPassword').value;
                if (newPassword != confirmNewPassword) {
                    errorResponse += " New password and confirm new password don't match."
                    ready = false;
                } else {
                    var newPasswordCheck = newPasswordErrorCheck(newPassword);
                    if (newPasswordCheck.length > 0) {
                        errorResponse += newPasswordCheck;
                        ready = false;
                    }
                }
            }
        }
    }
    if (ready == true) {
        if (changeName == false && changeEmail == false && changePassword == false) {
            ready = false;
            serverResponse.innerHTML = '<span class="red-response">If nothing is changed, pressing submit does nothing.</span>';
        }
    }
    if (ready == true) {
        var form = document.getElementById('inputForm');
        var loadingCircle = document.getElementById('loadingImg');
        form.style.filter = "blur(4px)";
        loadingCircle.innerHTML = '<img src="../images/loading_screen.svg" alt="loading" height="125px" width="125px">';
        serverResponse.innerHTML = "";
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', updateAccountResponse);
        xhr.responseType = 'json';
        xhr.open('PUT', '/api/user/update');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(
            JSON.stringify({
                email: oldEmail,
                currentPassword: currentPassword,
                newEmail: newEmail,
                newPassword: newPassword,
                confirmNewPassword: confirmNewPassword,
                name: name
            })
        );
    } else {
        if (errorResponse.length > 0) {
            serverResponse.innerHTML = "<span class='red-response'>" + errorResponse + "</span>";
        }
    }

}

function updateAccountResponse() {
    if (this.status === 200) {
        document.getElementById('inputForm').style.filter = "";
        document.getElementById('loadingImg').innerHTML = "";
        if (this.response.emailChanged === true) {
            window.localStorage.removeItem("qr4gloginAuthTokenDesktop");
            delete_cookie("accName");
            delete_cookie("accEmail");
            window.location.href = "/accountEmailUpdated.html";
        } else {
            window.location.href = "/user/account.html";
        }
    } else {
        document.getElementById('inputForm').style.filter = "";
        document.getElementById('loadingImg').innerHTML = "";
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function newPasswordErrorCheck(password) {
    let pwdLowerReg = /[a-z]+/;
    let pwdUpperReg = /[A-Z]+/;
    let pwdNumReg = /.*\d.*/;

    let outputString = '';

    if (password.length < 6 || password.length > 20) {
        outputString += ' New password must be longer than 6 characters and less than 20 characters. ';
    }

    if (!pwdLowerReg.test(password)) {
        outputString += ' New password must contain at least one lowercase character. ';
    }

    if (!pwdUpperReg.test(password)) {
        outputString += ' New password must contain at least one uppercase character. ';
    }

    if (!pwdNumReg.test(password)) {
        outputString += ' New password must contain at least one digit. ';
    }

    return outputString;
}

function passwordErrorCheck(password) {
    let pwdLowerReg = /[a-z]+/;
    let pwdUpperReg = /[A-Z]+/;
    let pwdNumReg = /.*\d.*/;

    let outputString = '';

    if (password.length < 6 || password.length > 20) {
        outputString += ' Incorrect current password. ';
    }

    if (!pwdLowerReg.test(password)) {
        if (!(outputString.indexOf('Incorrect current password') > 0)) {
            outputString += ' Incorrect current password. ';
        }
    }

    if (!pwdUpperReg.test(password)) {
        if (!(outputString.indexOf('Incorrect current password') > 0)) {
            outputString += ' Incorrect current password. ';
        }
    }

    if (!pwdNumReg.test(password)) {
        if (!(outputString.indexOf('Incorrect current password') > 0)) {
            outputString += ' Incorrect current password. ';
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

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}