/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

var myQRCodesArray = undefined;
var currentDeleteID = undefined;
document.addEventListener("DOMContentLoaded", function () {
    getMyQRCodes();
    getMySavedQRCodes();
});

function getMyQRCodes() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', getMyQRCodesResponse);
    xhr.responseType = 'json';
    xhr.open('GET', '/api/user/getQRCodes');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send();
}

function getMyQRCodesResponse() {
    var myQRCodesDiv = document.getElementById('myQRCodes');
    var loadingMyQRDiv = document.getElementById('myQRLoadingImg');
    loadingMyQRDiv.style.display = "none";
    if (this.status === 200) {
        myQRCodesArray = this.response.qrcodes;
        if (myQRCodesArray.length == 0) {
            myQRCodesDiv.innerHTML = "<span class='red-response'>You currently have no QR codes.</span>";
        } else {
            for (var i = 0; i < myQRCodesArray.length; i++) {
                var qrItem = document.createElement('div');
                qrItem.className = "qrItem";
                qrItem.id = i;
                qrItem.innerHTML = '<img src="' + myQRCodesArray[i].qrCodeData + '" alt="QR Code" width="100%"><br><span>' + myQRCodesArray[i].qrCodeName + '</span>';
                myQRCodesDiv.appendChild(qrItem);
            }
            myQRCodesDiv.innerHTML += '<div style="clear: both;"></div>';
            for (var i = 0; i < this.response.qrcodes.length; i++) {
                document.getElementById(i).addEventListener('click', function () {
                    enlargeQR(this.id);
                });
            }
        }

    } else {
        myQRCodesDiv.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function enlargeQR(index) {
    var enlargedQRDiv = document.getElementById('enlargedQR');
    var enlargedQRIndex = myQRCodesArray[index].qrCodeID;
    var enlargedQRData = myQRCodesArray[index].qrCodeData;
    var enlargedQRName = myQRCodesArray[index].qrCodeName;
    var enlargedQRAmount = myQRCodesArray[index].qrCodeDefaultAmount;
    var enlargedQRType = myQRCodesArray[index].qrCodeType;
    var myQRCodesDiv = document.getElementById('myQRCodes');
    myQRCodesDiv.style.display = "none";
    enlargedQRDiv.innerHTML = '<img src="' + enlargedQRData + '" alt="QR Code" width="100%"><br><span>Name : ' + enlargedQRName + '</span><br><span>Default amount : $' + enlargedQRAmount + '</span><br><span>Type : ' + enlargedQRType + '</span><br><br><div id="qrOptions"><span id="printEnlarged" style="color:blue; font-size:16px">print</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteEnlarged" class="red-response" style="font-size: 16px">delete</span></div><div id="deleteYesNo"></div><br><br><span id="closeEnlarged" onClick="closeEnlargedQR()">close</span>';
    enlargedQRDiv.style.display = "";
    document.getElementById('deleteEnlarged').addEventListener('click', function () {
        prepareDeleteMyQR(enlargedQRIndex);
    });
}

function closeEnlargedQR() {
    var enlargedQR = document.getElementById('enlargedQR');
    var myQRCodesDiv = document.getElementById('myQRCodes');
    enlargedQR.style.display = "none";
    myQRCodesDiv.style.display = "";

}

function prepareDeleteMyQR(index) {
    var qrOptions = document.getElementById('qrOptions');
    var deleteYesNo = document.getElementById('deleteYesNo');
    qrOptions.style.display = "none";
    deleteYesNo.style.display = "";
    deleteYesNo.innerHTML = '<span style="font-size:16px">are you sure?</span><br>' + '<span id="deleteYes" style="color:blue; font-size:16px">yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteNo" style="color:red; font-size:16px">no</span>';
    document.getElementById('deleteYes').addEventListener('click', function () {
        deleteMyQR(index);
        document.getElementById('deleteYesNo').style.display = "none";
    });
    document.getElementById('deleteNo').addEventListener('click', function () {
        document.getElementById('deleteYesNo').style.display = "none";
        document.getElementById('qrOptions').style.display = "";
    });
}

function deleteMyQR(index) {
    currentDeleteID = index;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', deleteMyQRResponse);
    xhr.responseType = 'json';
    xhr.open('POST', '/api/user/deleteQRCode');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(
        JSON.stringify({
            loginAuthToken: localStorage.getItem('qr4gloginAuthTokenDesktop'),
            deleteID: index
        })
    );
}

function deleteMyQRResponse() {
    if (this.status === 200) {
        for (var i = 0; i < myQRCodesArray.length; i++) {
            if (myQRCodesArray[i].qrCodeID == currentDeleteID) {
                myQRCodesArray.splice(i, 1);
            }
        }
        updateMyQRCodes();
    }
}

function updateMyQRCodes() {
    var myQRCodesDiv = document.getElementById('myQRCodes');
    myQRCodesDiv.innerHTML = "";
    closeEnlargedQR();
    if (myQRCodesArray.length == 0) {
        myQRCodesDiv.innerHTML = "<span class='red-response'>You currently have no QR codes.</span>";
    } else {
        for (var i = 0; i < myQRCodesArray.length; i++) {
            var qrItem = document.createElement('div');
            qrItem.className = "qrItem";
            qrItem.id = i;
            qrItem.innerHTML = '<img src="' + myQRCodesArray[i].qrCodeData + '" alt="QR Code" width="100%"><br><span>' + myQRCodesArray[i].qrCodeName + '</span>';
            myQRCodesDiv.appendChild(qrItem);
        }
        myQRCodesDiv.innerHTML += '<div style="clear: both;"></div>';
        for (var i = 0; i < myQRCodesArray.length; i++) {
            document.getElementById(i).addEventListener('click', function () {
                enlargeQR(this.id);
            });
        }
    }
}

function getMySavedQRCodes() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', getMySavedQRCodesResponse);
    xhr.responseType = 'json';
    xhr.open('GET', '/api/user/getSavedQRCodes');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send();
}

function getMySavedQRCodesResponse() {

}