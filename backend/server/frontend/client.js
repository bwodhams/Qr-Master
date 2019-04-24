/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

const express = require('express');
const router = express.Router();

router.get('/home.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        if (req.cookies['autoLogout'] == undefined) {
            res.redirect('/');
        } else {
            res.redirect('/autoLogout.html');
        }
    } else {
        if (req.cookies['tosNotAccepted'] != undefined) {
            res.redirect('/user/acceptTos.html');
        } else {
            res.sendFile(__dirname + '/public/home.html');
        }
    }
});

router.get('/user/acceptTos.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        if (req.cookies['autoLogout'] == undefined) {
            res.redirect('/');
        } else {
            res.redirect('/autoLogout.html');
        }
    } else {
        if (req.cookies['tosNotAccepted'] != undefined) {
            res.sendFile(__dirname + '/public/user/acceptTos.html');
        } else {
            res.redirect('/home.html');
        }
    }
});

router.get('/user/*', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        if (req.cookies['autoLogout'] == undefined) {
            res.redirect('/');
        } else {
            res.redirect('/autoLogout.html');
        }
    } else {
        if (req.cookies['tosNotAccepted'] != undefined) {
            res.redirect('/user/acceptTos.html');
        } else {
            res.sendFile(__dirname + '/public/' + req.path);
        }
    }
});


router.get('/', (req, res) => {
    if (req.cookies['accName'] != undefined) {
        res.redirect('/home.html');
    } else {
        if (req.cookies['autoLogout'] == undefined) {
            res.sendFile(__dirname + '/public/' + req.path);
        } else {
            res.redirect('/autoLogout.html');
        }
    }
});

router.get('/login.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        res.sendFile(__dirname + '/public/login.html');
    } else {
        res.redirect('/home.html');
    }
});

router.get('/register.html', (req, res) => {
    if (req.cookies['accName'] == undefined) {
        res.sendFile(__dirname + '/public/register.html');
    } else {
        res.redirect('/home.html');
    }
});

router.get('/images/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/javascripts/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/styles/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/transaction/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});

router.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.path);
});
module.exports = router;