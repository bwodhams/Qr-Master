/*
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *
 *  @author Benjamin Wodhams
 *
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const fs = require('fs');

const index = require('./routes/index');
const frontend = require('./frontend/client')

const app = express();

const logFile = fs.createWriteStream(path.join(__dirname, 'entireLog.log'), {
	flags: 'a'
});

const morganMiddleware = logger(function (tokens, req, res) {
	return [
		chalk.hex('#34ace0').bold(tokens.method(req, res)),
		chalk.hex('#ffb142').bold(tokens.status(req, res)),
		chalk.hex('#ff5252').bold(tokens.url(req, res)),
		chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
		chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res)),
		chalk.yellow(tokens['remote-addr'](req, res)),
		'\n'
	].join(' ');
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(logger(':date[clf] :remote-addr :method :url :status - :response-time ms'));
app.use(morganMiddleware);
app.use(logger('combined', {
	stream: logFile
}));
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/api', index);
app.use('/', frontend);
//app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	//res.locals.message = err.message;
	//res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	//res.status(err.status || 500);
	//res.render('error');

	res.status(404).render('404.jade', {
		title: '404: File Not Found'
	});
});

module.exports = app;