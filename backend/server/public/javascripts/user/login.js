function login() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var serverResponse = document.getElementById('serverResponse');

    if (email == "" || password == "") {
        serverResponse.innerHTML = "<span class='red-response'>Email and password fields required.</span>"
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