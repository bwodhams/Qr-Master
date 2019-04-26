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
    document.getElementById('addNewBankBtn').addEventListener('click', prepareAddNewBank);
    document.getElementById('closeAddNewCardBtn').addEventListener('click', closeAddNewCardWindow);
    document.getElementById('submitNewCardBtn').addEventListener('click', addNewCard);
    document.getElementById('submitNewBankBtn').addEventListener('click', addNewBank);
    document.getElementById('submitVerifyStripeBtn').addEventListener('click', verifyStripe);
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
        var addNewBankBtn = document.getElementById('addNewBankBtn');
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
        addNewBankBtn.style.display = "";
    } else {
        var serverResponse = document.getElementById('serverResponse');
        serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function makePrimary(elem, response) {
    console.log(response);
    var primaryCardIndex = elem.substring(13);
    var primaryCardImage = document.getElementById('cardImage' + primaryCardIndex);
    for (var i = 0; i < response.name.length; i++) {
        document.getElementById('cardImage' + i).src = '../images/creditCardImage.png';
    }
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
        makePrimaryResponse(this, primaryCardIndex);
    });
    xhr.responseType = 'json';
    xhr.open('PUT', '/api/user/updateDefaultPayment');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send(
        JSON.stringify({
            defaultIndex: primaryCardIndex
        })
    );
    primaryCardImage.src = '../images/primaryCreditCardImage.png';
}

function makePrimaryResponse(response, primaryCardIndex) {
    var serverResponse = document.getElementById('serverResponse');
    if (response.status === 200) {

    } else {
        document.getElementById('cardImage' + primaryCardIndex).src = '../images/creditCardImage.png';
        serverResponse.innerHTML = "<span class='red-response'>" + response.response.message + "</span>";
    }
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

function addNewCard() {
    var ccNum = document.getElementById('ccNum').value;
    var ccType = determineCardType(ccNum);
    var ccExp = document.getElementById('ccExp').value;
    var ccName = document.getElementById('ccName').value;
    var ccCVV = document.getElementById('ccCVV').value;
    var ccZip = document.getElementById('ccZip').value;
    var ccExpFinal = ccExp.substring(0, 2);
    ccExpFinal += "/" + ccExp.substring(5);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', addNewCardResponse);
    xhr.responseType = 'json';
    xhr.open('POST', '/api/user/updateStripe');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send(
        JSON.stringify({
            email: getCookie("accEmail"),
            cvc: ccCVV,
            expiry: ccExpFinal,
            name: ccName,
            number: ccNum,
            card: true,
            postalCode: ccZip,
            type: ccType
        })
    );
}

function determineCardType(cardNumber) {
    var ccFirstDigit = cardNumber.substring(0, 1);
    var ccType = undefined;
    if (ccFirstDigit == 3) {
        ccType = "american_express";
    } else if (ccFirstDigit == 4) {
        ccType = "visa";
    } else if (ccFirstDigit == 5) {
        ccType = "master_card";
    } else {
        ccType = "discover_card";
    }
    return ccType;
}

function addNewCardResponse() {
    var serverResponse = document.getElementById('serverResponse');
    if (this.status === 200) {
        document.getElementById('closeAddNewCardBtn').click();
        getCards();
    } else {
        serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function closeAddNewCardWindow() {
    var addNewCardContainer = document.getElementById('addNewCard');
    var myCardsContainer = document.getElementById('myCardsContainer');
    addNewCardContainer.style.display = "none";
    myCardsContainer.style.display = "";
}

function prepareAddNewBank() {
    var myCardsContainer = document.getElementById('myCardsContainer');
    var addNewBankDiv = document.getElementById('addNewBank');
    addNewBankDiv.style.display = "";
    myCardsContainer.style.display = "none";
}

function addNewBank() {
    var form = document.getElementById('inputBankForm');
    var loadingCircle = document.getElementById('loadingImgBank');
    var name = document.getElementById('firstLastName').value;
    var routingNum = document.getElementById('bankRoutingNum').value;
    var accountNum = document.getElementById('bankAccNum').value;
    var serverResponse = document.getElementById('serverResponse');

    document.getElementById('firstLastName').readOnly = true;
    document.getElementById('bankRoutingNum').readOnly = true;
    document.getElementById('bankAccNum').readOnly = true;
    document.getElementById('submitNewBankBtn').disabled = true;

    if (name.length == 0 || routingNum.length == 0 || accountNum.length == 0) {
        serverResponse.innerHTML = "<span class='red-response'>" + "All fields must be filled out." + "</span>";
        resetFields();
    } else {
        form.style.filter = "blur(4px)";
        loadingCircle.innerHTML = '<img src="../images/loading_screen.svg" alt="loading" height="125px" width="125px">';
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', addNewBankResponse);
        xhr.responseType = 'json';
        xhr.open('POST', '/api/user/updateStripe');
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
        xhr.send(
            JSON.stringify({
                email: getCookie("accEmail"),
                name: name,
                routing_number: routingNum,
                account_number: accountNum,
                card: false
            })
        );
    }
}

function addNewBankResponse() {
    var serverResponse = document.getElementById('serverResponse');
    var form = document.getElementById('inputBankForm');
    var loadingCircle = document.getElementById('loadingImgBank');
    form.style.filter = "";
    loadingCircle.innerHTML = '';
    if (this.status === 200) {
        if (this.response.stripeVerified == true) {
            document.getElementById('addNewBank').style.display = "none";
            getCards();
        } else {
            prepareVerifyStripe();
        }
    } else {
        serverResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function prepareVerifyStripe() {
    var addNewBankDiv = document.getElementById('addNewBank');
    var verifyStripeDiv = document.getElementById('verifyStripe');
    addNewBankDiv.style.display = "none";
    verifyStripeDiv.style.display = "";
}

function verifyStripe() {
    var ssnLastDigits = document.getElementById('ssnInfo').value;
    var userAddress = document.getElementById('userAddress').value;
    var userCity = document.getElementById('userCity').value;
    var userState = document.getElementById('userState').value;
    var userZip = document.getElementById('userZip').value;
    var userBday = document.getElementById('userBday').value;
    var form = document.getElementById('verifyStripeForm');
    var loadingCircle = document.getElementById('loadingImgStripe');

    document.getElementById('ssnInfo').readOnly = true;
    document.getElementById('userAddress').readOnly = true;
    document.getElementById('userCity').readOnly = true;
    document.getElementById('userState').readOnly = true;
    document.getElementById('userZip').readOnly = true;
    document.getElementById('submitVerifyStripeBtn').disabled = true;

    if (ssnLastDigits.length == 0 || userAddress.length == 0 || userCity.length == 0 || userState.length == 0 || userZip.length == 0 || userBday.length == 0) {
        serverResponse.innerHTML = "<span class='red-response'>" + "All fields must be filled out." + "</span>";
        resetFields();
    } else {
        if (userBday.length != 10) {
            serverResponse.innerHTML = "<span class='red-response'>" + "Birthday not entered correctly." + "</span>";
            resetFields();
        } else {
            var dobMonth = userBday.substring(0, 2);
            var dobDay = userBday.substring(3, 5);
            var dobYear = userBday.substring(6, 10);
            form.style.filter = "blur(4px)";
            loadingCircle.innerHTML = '<img src="../images/loading_screen.svg" alt="loading" height="125px" width="125px">';
            var xhr = new XMLHttpRequest();
            xhr.addEventListener('load', addNewBankResponse);
            xhr.responseType = 'json';
            xhr.open('POST', '/api/user/verifyStripe');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
            xhr.send(
                JSON.stringify({
                    email: getCookie("accEmail"),
                    ssn_last_4: ssnLastDigits,
                    dob_day: dobDay,
                    dob_month: dobMonth,
                    dob_year: dobYear,
                    city: userCity,
                    line1: userAddress,
                    postal_code: userZip,
                    state: userState
                })
            );
        }
    }

}

function resetFields() {
    document.getElementById('firstLastName').readOnly = false;
    document.getElementById('bankRoutingNum').readOnly = false;
    document.getElementById('bankAccNum').readOnly = false;
    document.getElementById('ssnInfo').readOnly = false;
    document.getElementById('userAddress').readOnly = false;
    document.getElementById('userCity').readOnly = false;
    document.getElementById('userState').readOnly = false;
    document.getElementById('userZip').readOnly = false;
    document.getElementById('submitNewBankBtn').disabled = false;
    document.getElementById('submitVerifyStripeBtn').disabled = false;
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