'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

console.log('starting up!');

router.get('/', (req, res) => {
    console.log('stuff requested');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Hello from Express.js!</h1>');
    res.end();
});

router.get('/heitomi', (req, res) => {
    console.log('heitomi');
    res.status(200).send({msg: 'hei tomi'});
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);