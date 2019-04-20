document.addEventListener("DOMContentLoaded", function () {
    window.localStorage.removeItem("qr4gloginAuthTokenDesktop");
    delete_cookie("accName");
    delete_cookie("accEmail");
    delete_cookie("autoLogout");
});

function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}