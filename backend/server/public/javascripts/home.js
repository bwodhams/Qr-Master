if (!window.localStorage.getItem("qr4gloginAuthTokenDesktop")) {
    window.location.replace("/");
} else {
    getInfo();
}

function getInfo() {
    var loginAuthTokenDesktop = window.localStorage.getItem("qr4gloginAuthTokenDesktop");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', getInfoResponse);
    xhr.responseType = 'json';
    xhr.open('GET', '/api/user/getSimpleInfo');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', loginAuthTokenDesktop);
    xhr.send();
}

function getInfoResponse() {
    if (this.status === 200) {
        document.getElementById("main").innerHTML = "<h2>You are logged in though......" + this.response.name + "   ;)</h2>";
    } else {
        console.log("there was an error, couldn't get your name ;( ;( ;(");
    }
}