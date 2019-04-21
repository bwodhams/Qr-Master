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
    var outputHTML = "";
    if (this.status === 200) {
        for (var i = 0; i < this.response.qrcodes.length; i++) {
            outputHTML += '<img src="' + this.response.qrcodes[i].qrCodeData + '" alt="QR Code" width="45%">';
            if (i % 2 == 1) {
                outputHTML += '<br>';
            }
        }
        myQRCodesDiv.innerHTML = outputHTML;
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