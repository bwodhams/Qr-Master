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
            var qrItem = document.createElement('div');
            qrItem.className = "qrItem";
            qrItem.innerHTML = '<img src="' + this.response.qrcodes[i].qrCodeData + '" alt="QR Code" width="100%"><br><span>' + this.response.qrcodes[i].qrCodeName + '</span>';
            myQRCodesDiv.appendChild(qrItem);
            //outputHTML += '<div class="qrItem"><img src="' + this.response.qrcodes[i].qrCodeData + '" alt="QR Code" width="70%"><br><span>' + this.response.qrcodes[i].qrCodeName + '</span></div>';
            if (i % 2 == 1) {
                //outputHTML += '<span style="margin-left: -50px">abcd</span> <span style="right: 0px">efgh</span><br>';
                outputHTML += '<br>';
            }
        }
        myQRCodesDiv.innerHTML += '<div style="clear: both;"></div>';
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