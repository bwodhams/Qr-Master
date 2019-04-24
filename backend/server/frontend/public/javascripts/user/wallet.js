/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

document.addEventListener("DOMContentLoaded", function () {
    var loadingCircle = document.getElementById('loadingImg');
    loadingCircle.innerHTML = '<img src="../images/loading_screen.svg" alt="loading" height="125px" width="125px">';
    getCards();
    document.getElementById('addNewCardBtn').addEventListener('click', prepareAddNewCard);
});

function getCards() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', getCardsResponse);
    xhr.responseType = 'json';
    xhr.open('GET', '/api/user/getCards/' + getCookie("accEmail"));
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send();
}

function getCardsResponse() {
    console.log(this.response);
    if (this.status === 200) {
        var loadingCircle = document.getElementById('loadingImg');
        var allCards = document.getElementById('myCards');
        var addNewCardBtn = document.getElementById('addNewCardBtn');
        var outputHTML = "";
        for (var i = 0; i < this.response.name.length; i++) {
            outputHTML += "name = " + this.response.name[i] + " CCLastDigits = " + this.response.creditCardLastDigits[i] + "<br>";
        }
        allCards.innerHTML = outputHTML;
        loadingCircle.style.display = "none";
        addNewCardBtn.style.display = "";
    }
}

function prepareAddNewCard() {
    var myCardsContainer = document.getElementById('myCardsContainer');
    var addNewCardDiv = document.getElementById('addNewCard');
    addNewCardDiv.style.display = "";
    myCardsContainer.style.display = "none";
    var card = new Card({
        form: 'form',
        container: '.card',
        formSelectors: {
            numberInput: 'input[name=number]',
            expiryInput: 'input[name=expiry]',
            cvcInput: 'input[name=cvv]',
            nameInput: 'input[name=name]'
        },
        width: 350, // optional — default 350px
        formatting: true
    });
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