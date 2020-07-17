"use strict";

const express = require('express');
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./server/routes/index');
const client = require('./client/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicossssn(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb', parameterLimit: 100000}));
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000, extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

/*-------------MANDATORY TO HAVE--------------
create a Banknote collection in mongo and insert some values in it like
---db.Banknote.insert({amount:1000,value:4,notAllowed:false})
--db.Banknote.insert({amount:500,value:4,notAllowed:false})
---db.Banknote.insert({amount:200,value:4,notAllowed:false})
*amount is the amount of the bank note and value indicates the number of notes 
*ifnotAllowed is set to true then that value will not be considered in calculation
The solution provided is a general solution considering atm supports any type of note
---------------------------------------------------
Run node ./bin/www
Amount is the amount of note, value is number of notes, and the text dialog box before 
a button get balance is used for inputting user
*/

app.use('/api/', index);
app.use('/', client);


// catch 404 and forward to error handler
app.use(function (req, res, next) {

	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	if(err.pass) {
		return;
	}
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	console.error('******error request****\n', {
		url: req.originalUrl,
		method: req.method,
		message: err.message,
		status: err.status,
		body: JSON.stringify(req.body),
		query: JSON.stringify(req.query),
		params: JSON.stringify(req.params),
	});

	console.error("******error*****\n", err);

	res.status(err.status || 500);

	res.json({
		status: false,
		message: err.message,
	});
});

module.exports = app;
