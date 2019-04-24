/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

document.addEventListener("DOMContentLoaded", function () {
    window.localStorage.removeItem("qr4gloginAuthTokenDesktop");
    delete_cookie("accName");
    delete_cookie("accEmail");
    delete_cookie("autoLogout");
    delete_cookie("tosNotAccepted");
});

function delete_cookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
}