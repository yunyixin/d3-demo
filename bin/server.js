#!/usr/bin/env node
// const path = require('path');
const express = require('express');

const favicon = require('serve-favicon');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const env = require('../env');
const path = require('path');

const app = express();

// local static serve
app.use(serveStatic('data'));
app.use(serveStatic('demo'));

// express middleware
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.jpg')));

if (process.env.NODE_ENV === 'development') {
  app.use('/', serveIndex('demo', {'icons': true}));
}

const {host, port} = env.devServer;
app.listen(port, function listen(err) {
  if (err) {
    console.error(err);
  }
  console.info('==>  Server listening on http://%s:%s', host, port);
});
