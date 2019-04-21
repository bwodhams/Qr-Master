document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('submitBtn').addEventListener('click', createQR);
});

function createQR() {
    var ready = true;
    var qrName = document.getElementById('qrName').value;
    var defaultAmount = document.getElementById('defaultAmount').value;
    var serverResponse = document.getElementById('serverResponse');
    var paymentType = 0;
    for (var i = 0; i < document.getElementsByName('radio').length; i++) {
        if (document.getElementsByName('radio')[i].checked) {
            paymentType = i;
        }
    }
    serverResponse.innerHTML = "";
    if (qrName.length == 0) {
        if (defaultAmount.length == 0) {
            ready = false;
            serverResponse.innerHTML = "<span class='red-response'>You must name your QR code and give it a default payment amount.</span>";
        } else {
            ready = false;
            serverResponse.innerHTML = "<span class='red-response'>You must give your QR code a name.</span>";
        }
    } else if (defaultAmount.length == 0) {
        ready = false;
        serverResponse.innerHTML = "<span class='red-response'>You must give your QR code a default payment amount.</span>";
    }

    if (defaultAmount <= 0.00 || defaultAmount > 50.00) {
        ready = false;
        serverResponse.innerHTML = "<span class='red-response'>Default payment amount must be greater than 0.00 and less than 50.00</span>";
    }
    if (ready == true) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', createQRResponse);
        xhr.responseType = 'json';
        xhr.open('POST', '/api/user/generateQRCode');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(
            JSON.stringify({
                loginAuthToken: localStorage.getItem('qr4gloginAuthTokenDesktop'),
                defaultAmount: defaultAmount,
                paymentType: paymentType,
                qrCodeGivenName: qrName
            })
        );
    }
}

function createQRResponse() {
    if (this.status === 200) {
        window.location.href = "/user/qrcode/saved.html";
    } else {
        var serverResponse = document.getElementById('serverResponse');
        serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }

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