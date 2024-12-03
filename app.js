var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var shipmentsRouter = require('./routes/shipments');

var app = express();
const port = 3000;

app.listen(port, ()=> console.log(`Express app listening on port ${port}!`))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/shipments', shipmentsRouter);

module.exports = app;
