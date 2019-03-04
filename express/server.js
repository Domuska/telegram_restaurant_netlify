'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

const router = express.Router();

console.log('starting up!');

const botUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_KEY}/`;

function getChatId(data) {
    return data.message.chat.id;
}

function getMessage(data){
    return data.message.text;
}

function revertMessage(msg) {
    return msg.split("").reverse().join("");
}

router.get('/', (req, res) => {
    console.log('stuff requested, req:');
    console.log(req);
    //const chatId = getChatId(req);
    const url = `${botUrl}sendMessage?chat_id=384892774&text=something_nice!`;
    //const url = `${botUrl}sendMessage?chat_id=384892774&text=${req}`;
    console.log(url);

    axios.post(url)
        .then((response) => {
            console.log('got response:');
            console.log(response);
            res.status(200).send();
        })
        .catch((err) => {
            console.log(err);
        });


    //res.writeHead(200, { 'Content-Type': 'text/html' });
    //res.write('<h1>Hello from Express.js!</h1>');
    //res.end();
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