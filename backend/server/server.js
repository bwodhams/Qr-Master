#!/usr/bin/env node

/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('express-react:server');
var https = require('https');
var http = require('http');
var fs = require('fs');

var localTesting = false;

if (localTesting) {
	//Local testing

	var options = {
		ca: fs.readFileSync(
			'C:/Users/Ben/Documents/Senior_Design_498/QRCodes4GoodDBWorking/Qr-Master/backend/server/ssl/qrcodes4good_com.ca-bundle'
		),
		key: fs.readFileSync(
			'C:/Users/Ben/Documents/Senior_Design_498/QRCodes4GoodDBWorking/Qr-Master/backend/server/ssl/qrcodes4good_com.key'
		),
		cert: fs.readFileSync(
			'C:/Users/Ben/Documents/Senior_Design_498/QRCodes4GoodDBWorking/Qr-Master/backend/server/ssl/qrcodes4good_com.crt'
		)
	};
} else {
	//Public website testing

	var options = {
		ca: fs.readFileSync('/home/qrcodes4good/ssl/qrcodes4good_com.ca-bundle'),
		key: fs.readFileSync('/home/qrcodes4good/ssl/qrcodes4good_com.key'),
		cert: fs.readFileSync('/home/qrcodes4good/ssl/qrcodes4good_com.crt')
	};
}

/**
 * Get port from environment and store in Express.
 */

//Set port for backend to 8080 to work with cloudflare http (will change once HTTPS is working)

var port = normalizePort(process.env.PORT || '443');
app.set('port', port);

/**
 * Create HTTP server to redirect if user doesn't go to HTTPS website
 * 
 */
http.createServer(function (req, res) {
	res.writeHead(301, {
		"Location": "https://" + req.headers['host'] + req.url
	});
	res.end();
}).listen(80);
var server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
}