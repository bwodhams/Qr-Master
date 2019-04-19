var accName = getCookie("accName");
if (accName != "") {
    if (!window.localStorage.getItem("qr4gloginAuthTokenDesktop")) {
        window.location.replace("/");
    } else {
        getInfo();
    }
} else {
    window.location.replace("/");
}

function getInfo() {
    var accName = getCookie("accName");
    document.getElementById("main").innerHTML = "<h2>You are logged in though......" + accName + "   ;)</h2>";
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