function register() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var serverResponse = document.getElementById('serverResponse');

    if (name == "" || email == "" || password == "" || confirmPassword == "") {
        serverResponse.innerHTML = "<span class='red-response'>All fields required.</span>"
    } else {
        if (password != confirmPassword) {
            serverResponse.innerHTML = "<span class='red-response'>Passwords don't match.</span>"
        } else {
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
                    name: name,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                })
            );
        }

    }
}

function registerResponse() {
    console.log("in here");
    if (this.status === 201) {
        document.getElementById('inputForm').style.filter = "";
        document.getElementById('loadingImg').innerHTML = "";
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + "Account created successfully" + "</span>";
        //window.location.href = "/";
    } else {
        document.getElementById('inputForm').form.style.filter = "";
        document.getElementById('loadingImg').innerHTML = "";
        document.getElementById('serverResponse').innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('registerBtn').addEventListener('click', register);
});