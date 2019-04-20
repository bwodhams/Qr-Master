document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('logoutBtn').addEventListener('click', function () {
        window.localStorage.removeItem("qr4gloginAuthTokenDesktop");
        delete_cookie("accName");
        delete_cookie("accEmail");
        window.location = "/";
    });
    document.getElementById('logoutBtnMini').addEventListener('click', function () {
        window.localStorage.removeItem("qr4gloginAuthTokenDesktop");
        delete_cookie("accName");
        delete_cookie("accEmail");
        window.location = "/";
    });
});

function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}