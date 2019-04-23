/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

var myQRCodesArray = undefined;
var savedQRCodesArray = undefined;
var currentMyDeleteID = undefined;
var currentSavedDeleteID = undefined;
document.addEventListener("DOMContentLoaded", function () {
    getMyQRCodes();
    getMySavedQRCodes();
});

//My QRCodes
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
                qrItem.innerHTML = '<img src="' + myQRCodesArray[i].qrCodeData + '" alt="QR Code" class="smallQR" width="100%"><br><span class="smallQR">' + myQRCodesArray[i].qrCodeName + '</span>';
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
    enlargedQRDiv.innerHTML = '<div id="myEnlargedQR"><img id="enlargedImage" src="' + enlargedQRData + '" alt="QR Code" width="100%"></div><br><span>Name : ' + enlargedQRName + '</span><br><span>Default amount : $' + enlargedQRAmount + '</span><br><span>Type : ' + enlargedQRType + '</span><br><br><div id="qrOptions"><span id="printEnlarged" style="color:blue; font-size:16px">print</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteEnlarged" class="red-response" style="font-size: 16px">delete</span></div><div id="deleteYesNo"></div><br><br><span id="closeEnlarged" onClick="closeEnlargedQR()">close</span>';
    enlargedQRDiv.style.display = "";
    document.getElementById('deleteEnlarged').addEventListener('click', function () {
        prepareDeleteMyQR(enlargedQRIndex);
    });
    document.getElementById('printEnlarged').addEventListener('click', function () {
        printQR('myEnlargedQR');
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
    currentMyDeleteID = index;
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
            if (myQRCodesArray[i].qrCodeID == currentMyDeleteID) {
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
            qrItem.innerHTML = '<img src="' + myQRCodesArray[i].qrCodeData + '" alt="QR Code" class="smallQR" width="100%"><br><span class="smallQR">' + myQRCodesArray[i].qrCodeName + '</span>';
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


//Saved QR Codes

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
    var savedQRCodesDiv = document.getElementById('savedQRCodes');
    var loadingSavedQRDiv = document.getElementById('savedQRLoadingImg');
    loadingSavedQRDiv.style.display = "none";
    if (this.status === 200) {
        savedQRCodesArray = this.response.qrcodes;
        if (savedQRCodesArray.length == 0) {
            savedQRCodesDiv.innerHTML = "<span class='red-response'>You currently have no saved QR codes.</span>";
        } else {
            for (var i = 0; i < savedQRCodesArray.length; i++) {
                var qrItem = document.createElement('div');
                qrItem.className = "qrItem";
                qrItem.id = "saved" + i;
                qrItem.innerHTML = '<img src="' + savedQRCodesArray[i].qrCodeData + '" alt="QR Code" class="smallQR" width="100%"><br><span class="smallQR">' + savedQRCodesArray[i].qrCodeUser + '</span>';
                savedQRCodesDiv.appendChild(qrItem);
            }
            savedQRCodesDiv.innerHTML += '<div style="clear: both;"></div>';
            for (var i = 0; i < this.response.qrcodes.length; i++) {
                document.getElementById("saved" + i).addEventListener('click', function () {
                    enlargeSavedQR(this.id);
                });
            }
        }

    } else {
        savedQRCodesDiv.innerHTML = "<span class='red-response'>" + this.response.message + "</span>";
    }
}

function enlargeSavedQR(index) {
    var indexConverted = index.substring(5);
    var enlargedQRDiv = document.getElementById('enlargedSavedQR');
    var enlargedQRIndex = savedQRCodesArray[indexConverted].qrCodeID;
    var enlargedQRData = savedQRCodesArray[indexConverted].qrCodeData;
    var enlargedQRUser = savedQRCodesArray[indexConverted].qrCodeUser;
    var enlargedQRAmount = savedQRCodesArray[indexConverted].qrCodeDefaultAmount;
    var enlargedQRType = savedQRCodesArray[indexConverted].qrCodeType;
    var savedQRCodesDiv = document.getElementById('savedQRCodes');
    savedQRCodesDiv.style.display = "none";
    enlargedQRDiv.innerHTML = '<div id="mySavedEnlargedQR"><img src="' + enlargedQRData + '" alt="QR Code" id="savedEnlargedQR" width="100%"></div><br><span>User : ' + enlargedQRUser + '</span><br><span>Default amount : $' + enlargedQRAmount + '</span><br><span>Type : ' + enlargedQRType + '</span><br><br><div id="savedQROptions"><span id="printSavedEnlarged" style="color:blue; font-size:16px">print</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteSavedEnlarged" class="red-response" style="font-size: 16px">delete</span></div><div id="deleteYesNoSaved"></div><br><br><span id="closeSavedEnlarged" onClick="closeSavedEnlargedQR()">close</span>';
    enlargedQRDiv.style.display = "";
    document.getElementById('deleteSavedEnlarged').addEventListener('click', function () {
        prepareSavedDeleteMyQR(enlargedQRIndex);
    });
    document.getElementById('printSavedEnlarged').addEventListener('click', function () {
        printQR('mySavedEnlargedQR');
    });
}

function closeSavedEnlargedQR() {
    var enlargedQR = document.getElementById('enlargedSavedQR');
    var myQRCodesDiv = document.getElementById('savedQRCodes');
    enlargedQR.style.display = "none";
    myQRCodesDiv.style.display = "";
}

function prepareSavedDeleteMyQR(index) {
    var qrOptions = document.getElementById('savedQROptions');
    var deleteYesNo = document.getElementById('deleteYesNoSaved');
    qrOptions.style.display = "none";
    deleteYesNo.style.display = "";
    deleteYesNo.innerHTML = '<span style="font-size:16px">are you sure?</span><br>' + '<span id="deleteYesSaved" style="color:blue; font-size:16px">yes</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="deleteNoSaved" style="color:red; font-size:16px">no</span>';
    document.getElementById('deleteYesSaved').addEventListener('click', function () {
        deleteSavedQR(index);
        document.getElementById('deleteYesNoSaved').style.display = "none";
    });
    document.getElementById('deleteNoSaved').addEventListener('click', function () {
        document.getElementById('deleteYesNoSaved').style.display = "none";
        document.getElementById('savedQROptions').style.display = "";
    });
}

function deleteSavedQR(index) {
    currentMyDeleteID = index;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', deleteSavedQRResponse);
    xhr.responseType = 'json';
    xhr.open('POST', '/api/user/deleteSavedQRCode');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('authorization', localStorage.getItem('qr4gloginAuthTokenDesktop'));
    xhr.send(
        JSON.stringify({
            deleteID: index
        })
    );
}

function deleteSavedQRResponse() {
    if (this.status === 200) {
        for (var i = 0; i < savedQRCodesArray.length; i++) {
            if (savedQRCodesArray[i].qrCodeID == currentMyDeleteID) {
                savedQRCodesArray.splice(i, 1);
            }
        }
        updateSavedQRCodes();
    }
}

function updateSavedQRCodes() {
    var myQRCodesDiv = document.getElementById('savedQRCodes');
    myQRCodesDiv.innerHTML = "";
    closeSavedEnlargedQR();
    if (savedQRCodesArray.length == 0) {
        myQRCodesDiv.innerHTML = "<span class='red-response'>You currently have no saved QR codes.</span>";
    } else {
        for (var i = 0; i < savedQRCodesArray.length; i++) {
            var qrItem = document.createElement('div');
            qrItem.className = "qrItem";
            qrItem.id = "saved" + i;
            qrItem.innerHTML = '<img src="' + savedQRCodesArray[i].qrCodeData + '" alt="QR Code" class="smallQR" width="100%"><br><span class="smallQR">' + savedQRCodesArray[i].qrCodeUser + '</span>';
            myQRCodesDiv.appendChild(qrItem);
        }
        myQRCodesDiv.innerHTML += '<div style="clear: both;"></div>';
        for (var i = 0; i < savedQRCodesArray.length; i++) {
            document.getElementById("saved" + i).addEventListener('click', function () {
                enlargeSavedQR(this.id);
            });
        }
    }
}


function printQR(elem) {
    var mywindow = window.open('', 'PRINT', 'height=600,width=900');
    var qrCode = document.getElementById(elem).innerHTML;
    var qrCodeFinal = qrCode.replace('width="100%"', 'width="1000"');
    mywindow.document.write(qrCodeFinal);
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
    mywindow.print();
    mywindow.close();
    return true;
}