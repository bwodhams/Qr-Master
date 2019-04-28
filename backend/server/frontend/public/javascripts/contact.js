/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams, Amanda Chesin
 *
 */

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('sendBtn').addEventListener('click', sendEmail);
    var loggedInHeader = document.getElementById('loggedInHeader');
    if (getCookie("accName").length > 0) {
        removeElement('loggedOutHeader');
        loggedInHeader.style.display = "";
    } else {
        removeElement('loggedInHeader');
    }
});


function sendEmail() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var message = document.getElementById('message').value;
    var serverResponse = document.getElementById('serverResponse');
    serverResponse.innerHTML = "";
    if (name.length == 0 || email.length == 0 || message.length == 0) {
        serverResponse.innerHTML = "<span class='red-response'>All fields must be filled out.</span>";
    } else {
        if (getCookie('sentEmail').length == 0) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', sendEmailResponse);
            xhr.responseType = 'json';
            xhr.open('POST', '/api/user/contactUs');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(
                JSON.stringify({
                    email: email,
                    name: name,
                    message: message
                })
            );
        } else {
            serverResponse.innerHTML = "<span class='red-response'>You have recently sent us an email, please wait a few minutes before sending again. If this message persists, please reload the page.</span>";
        }

    }

}

function sendEmailResponse() {
    var serverResponse = document.getElementById('serverResponse');
    var successMessage = document.getElementById('success_message');
    var formDiv = document.getElementById('contact_form');
    if (this.status == 201) {
        formDiv.style.display = "none";
        successMessage.style.display = "";
    } else {
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

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}