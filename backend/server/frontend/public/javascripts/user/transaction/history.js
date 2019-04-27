/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

var myServerResponse = document.getElementById('myServerResponse');
var savedServerResponse = document.getElementById('savedServerResponse');
document.addEventListener("DOMContentLoaded", function () {
    getAllTransactions();
});

function getAllTransactions() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', getAllTransactionsResponse);
    xhr.responseType = 'json';
    xhr.open('GET', '/api/user/transactionHistory');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send();
}

function getAllTransactionsResponse() {
    var myPaymentsLoadingImg = document.getElementById('myPaymentsLoadingImg');
    var myReceivedPaymentsLoadingImg = document.getElementById('receivedPaymentsLoadingImg');
    var myServerResponse = document.getElementById('myServerResponse');
    if (this.status === 200) {
        myPaymentsLoadingImg.style.display = "none";
        myReceivedPaymentsLoadingImg.style.display = "none";
        console.log(this.response);
        displayMyPayments(this.response.sent);
        displayMyReceivedPayments(this.response.received);
    } else {
        if (this.response.message == "Token has expired") {
            myServerResponse.innerHTML = "<span class='red-response'>Error authenticating, please reload this page. If this message persists, please logout and then log back in.</span>";
        } else {
            myServerResponse.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
        }
    }
}

function displayMyPayments(payments) {
    var myServerResponse = document.getElementById('myServerResponse');
    var myPaymentsDiv = document.getElementById('myPaymentsWell');
    var outputHTML = "";
    if (payments.length == 0) {
        myServerResponse.innerHTML = "<span class='red-response'>You haven't made any payments yet.</span>";
    } else {
        for (var i = 0; i < payments.length; i++) {
            var paymentDate = payments[i].date.substring(5, 7);
            paymentDate += '/' + payments[i].date.substring(8, 10);
            paymentDate += '/' + payments[i].date.substring(0, 4);
            if (payments[i].anonymous == true) {
                outputHTML += '<div id="myPayment' + i + '" class="well"><span class="paymentAmount">-$' + parseFloat(payments[i].amount).toFixed(2) + '</span><span class="paymentToAnon"><img src="../../images/anonIcon.png" alt="loading" height="35px" width="35px">You paid ' + payments[i].name + '</span><br><span class="paymentDate">' + paymentDate + '</span></div>';
            } else {
                outputHTML += '<div id="myPayment' + i + '" class="well"><span class="paymentAmount">-$' + parseFloat(payments[i].amount).toFixed(2) + '</span><span class="paymentTo"><img src="../../images/userIcon.png" alt="loading" height="25px" width="25px">You paid ' + payments[i].name + '</span><br><span class="paymentDate">' + paymentDate + '</span></div>';
            }
        }
        myPaymentsDiv.innerHTML = outputHTML;
    }
}

function displayMyReceivedPayments(payments) {
    var myServerResponse = document.getElementById('receivedServerResponse');
    var myReceivedPaymentsDiv = document.getElementById('receivedPaymentsWell');
    var outputHTML = "";
    if (payments.length == 0) {
        myServerResponse.innerHTML = "<span class='red-response'>You haven't received any payments yet.</span>";
    } else {
        for (var i = 0; i < payments.length; i++) {
            var paymentDate = payments[i].date.substring(5, 7);
            paymentDate += '/' + payments[i].date.substring(8, 10);
            paymentDate += '/' + payments[i].date.substring(0, 4);
            if (payments[i].anonymous == true) {
                outputHTML += '<div id="rPayment' + i + '" class="well"><span class="paymentAmount">+$' + parseFloat(payments[i].amount).toFixed(2) + '</span><span class="paymentFromAnon"><img src="../../images/anonIcon.png" alt="loading" height="35px" width="35px">Anonymous paid you</span><br><span class="paymentDate">' + paymentDate + '</span></div>';
            } else {
                outputHTML += '<div id="rPayment' + i + '" class="well"><span class="paymentAmount">+$' + parseFloat(payments[i].amount).toFixed(2) + '</span><span class="paymentFrom"><img src="../../images/userIcon.png" alt="loading" height="25px" width="25px">' + payments[i].name + ' paid you</span><br><span class="paymentDate">' + paymentDate + '</span></div>';
            }
        }
        myReceivedPaymentsDiv.innerHTML = outputHTML;
    }
}