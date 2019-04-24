/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

document.addEventListener("DOMContentLoaded", function () {
    var welcomeText = document.getElementById("welcomeText");
    welcomeText.innerText = "Welcome to QRCodes4Good " + getCookie("accName") + "!";
    document.getElementById('acceptTosBtn').addEventListener('click', acceptTos);
});

function acceptTos() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', acceptTosResponse);
    xhr.responseType = 'json';
    xhr.open('POST', '/api/user/tosUpdate');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send(
        JSON.stringify({
            email: getCookie("accEmail")
        })
    );
}

function acceptTosResponse() {
    var serverResponse = document.getElementById('serverResponse');
    serverResponse.innerHTML = "";
    if (this.status === 200) {
        delete_cookie("tosNotAccepted");
        window.location.href = "/home.html";
    } else {
        if (this.response.message == "Error authenticating.") {
            serverResponse.innerHTML = "<span class='red-response'>Error authenticating, please reload the page.</span>";
        } else {
            serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
        }
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