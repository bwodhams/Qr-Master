/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('addNewCardBtn').addEventListener('click', prepareAddNewCard);
});

function prepareAddNewCard() {
    var addNewCardDiv = document.getElementById('addNewCard');
    addNewCardDiv.style.display = "";
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