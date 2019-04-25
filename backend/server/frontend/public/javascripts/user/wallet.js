/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */
var allMyCards = undefined;

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
    var response = this.response;
    if (this.status === 200) {
        allMyCards = this.response;
        var loadingCircle = document.getElementById('loadingImg');
        var allCards = document.getElementById('myCards');
        var addNewCardBtn = document.getElementById('addNewCardBtn');
        var outputHTML = '<span class="selectPrimaryText">Click on a card to select as your primary payment method</span><br>';
        for (var i = 0; i < this.response.name.length; i++) {
            if (this.response.primaryCard[i] == true) {
                outputHTML += '<div id="card' + i + '" style="position: relative"><div id="clickableCard' + i + '"><img src="../images/primaryCreditCardImage.png" id="cardImage' + i + '" alt="creditCard" width="100%" style="z-index: 0; position: relative">' +
                    '<span class="ccType">' + this.response.creditCardType[i] + "</span><br>" + '<span class="ccName">' + this.response.name[i] + '</span>' + '<span class="ccDigits">**** **** **** ' + this.response.creditCardLastDigits[i] + "</span>" + '</div><span class="deleteCard" id="deleteCard' + i + '" style="font-size: 16px">delete</span>' + "</div>" + '<span id="deleteYesNo' + i + '" style="display: none">' + '<span style="font-size:16px">are you sure?</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span id="deleteYes' + i + '" class="deleteYes" style="color:blue; font-size:16px">yes</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteNo' + i + '" class="deleteNo" style="color:red; font-size:16px">no</span><br>' + '</span><br>';
            } else {
                outputHTML += '<div id="card' + i + '" style="position: relative"><div id="clickableCard' + i + '"><img src="../images/creditCardImage.png" id="cardImage' + i + '" alt="creditCard" width="100%" style="z-index: 0; position: relative">' +
                    '<span class="ccType">' + this.response.creditCardType[i] + "</span><br>" + '<span class="ccName">' + this.response.name[i] + '</span>' + '<span class="ccDigits">**** **** **** ' + this.response.creditCardLastDigits[i] + "</span>" + '</div><span class="deleteCard" id="deleteCard' + i + '" style="font-size: 16px">delete</span>' + "</div>" + '<span id="deleteYesNo' + i + '" style="display: none">' + '<span style="font-size:16px">are you sure?</span>&nbsp;&nbsp;&nbsp;&nbsp;' + '<span id="deleteYes' + i + '" class="deleteYes" style="color:blue; font-size:16px">yes</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteNo' + i + '" class="deleteNo" style="color:red; font-size:16px">no</span><br>' + '</span><br>';
            }

        }
        outputHTML += '<div style="clear: both;"></div>';
        allCards.innerHTML = outputHTML;
        for (var i = 0; i < this.response.name.length; i++) {
            document.getElementById('clickableCard' + i).addEventListener('click', function () {
                makePrimary(this.id, response);
            });
            document.getElementById('deleteCard' + i).addEventListener('click', function () {
                prepareDeleteCard(this.id);
            });
        }
        loadingCircle.style.display = "none";
        addNewCardBtn.style.display = "";
    }
}

function makePrimary(elem, response) {
    console.log(response);
    var primaryCardIndex = elem.substring(13);
    var primaryCardImage = document.getElementById('cardImage' + primaryCardIndex);
    for (var i = 0; i < response.name.length; i++) {
        document.getElementById('cardImage' + i).src = '../images/creditCardImage.png';
    }
    primaryCardImage.src = '../images/primaryCreditCardImage.png';
}

function prepareDeleteCard(elem) {
    var deleteIndex = elem.substring(10);
    var deleteYesNo = document.getElementById('deleteYesNo' + deleteIndex);
    var deleteBtn = document.getElementById(elem);
    deleteBtn.style.display = "none";
    deleteYesNo.style.display = "";
    document.getElementById('deleteYes' + deleteIndex).addEventListener('click', function () {
        deleteCard(deleteIndex);
        deleteYesNo.style.display = "none";
    });
    document.getElementById('deleteNo' + deleteIndex).addEventListener('click', function () {
        deleteYesNo.style.display = "none";
        deleteBtn.style.display = "";
    });
}

function deleteCard(index) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', deleteCardResponse);
    xhr.responseType = 'json';
    xhr.open('POST', '/api/user/deletePayment');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send(
        JSON.stringify({
            deleteIndex: index
        })
    );
}

function deleteCardResponse() {
    var serverResponse = document.getElementById('serverResponse');
    if (this.status === 200) {
        getCards();
    } else {
        serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
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