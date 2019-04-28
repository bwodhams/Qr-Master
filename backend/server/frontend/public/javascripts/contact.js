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
    var success = document.getElementById('success_message');
    var form = document.getElementById('contact_form');
    success.style.display = "";
    form.style.display = "none";
    removeElement('contact_form');
}

function sendEmailResponse() {

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