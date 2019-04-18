function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var serverResponse = document.getElementById('serverResponse');

    if (email == "" || password == "") {
        serverResponse.innerHTML = "<span class='red-response'>Email and password fields required.</span>"
    } else {
        var loginErrorCheckResponse = loginErrorCheck(email, password);
        if (loginErrorCheckResponse.length > 0) {
            serverResponse.innerHTML = "<span class='red-response'>" + loginErrorCheckResponse + "</span>";
        } else {
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
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signin').addEventListener('click', login);
});

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