'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

const router = express.Router();

console.log('starting up!');

// const botUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_KEY}/`;
// const botUrl = 'https://api.telegram.org/bot767469404:AAEthedTo6elOuJ_4hbHKwiuiBzVDvSzREU/';

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
    console.log('stuff requested');
    //const url = `${botUrl}sendMessage?chat_id=${getChatId(req)}&text=${getMessage(req)}`;
    const url = 'https://api.telegram.org/bot767469404:AAEthedTo6elOuJ_4hbHKwiuiBzVDvSzREU/sendMessage?chat_id=384892774&text=test';
    //const url = `${botUrl}sendMessage?chat_id=384892774&text=${req}`;
    console.log(url);

    axios.post(url)
        .then((response) => {
            console.log('got response:');
            console.log(response);
        })
        .catch((err) => {
            console.log(err);
        });

    res.status(200).send();
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