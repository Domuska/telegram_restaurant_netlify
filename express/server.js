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
    let reversed;
    try {
        reversed = msg.split("").reverse().join("");
    }
    catch(error ) {
        reversed = "don't tell me what to do.";
        console.log('unable to reverse, sending empty msg')
    }
    return reversed;
}

/*
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
*/

async function handleInlineQuery(body, resHandle) {
    console.log('handling inline query!');
    console.log(body);
    const url = `${botUrl}answerInlineQuery`;
    const results = [];
    const result = {
        type: "article",
        id: 1,
        title: "Napa",
        description: "Menu for napa",
        input_message_content: {
            message_text: "From napa you can get healthy ärtsoppa",
        },
    };
    results.push(result);

    const inlineResponseBody = {
        inline_query_id: body.inline_query.id,
        results,
        // short cache time for dev purposes
        cache_time: 10,
    };

    try{
        const response = axios.post(url, inlineResponseBody);
        console.log('response got from telegram:');
        console.log(response);
        resHandle.status(200).send();
    } catch(error) {
        console.log('error while sending inline query response');
        console.log(error);
        resHandle.status(500).send();
    }
}

// todo voitaisiin käyttää middlewareja johon hypitään tästä handlerista,
// todo tää vois vaan toimia semmosena routterina
router.post('/', (req, res) => {
    console.log('______ request coming in, req body:');
    console.log(req.body);
    //const chatId = getChatId(req);
    if (req.body.hasOwnProperty("inline_query")) {
        console.log('handling inline query...');
        handleInlineQuery(req.body, res);
    } else {
        let reverted = revertMessage(getMessage(req.body));
        reverted = encodeURIComponent(reverted);
        const url = `${botUrl}sendMessage?chat_id=${getChatId(req.body)}&text=${reverted}`;
        //const url = `${botUrl}sendMessage?chat_id=384892774&text=something_nice!`;
        console.log(url);

        axios.post(url)
            .then((response) => {
                console.log('got response from tellygram');
                //console.log(response);
                res.status(200).send();
            })
            .catch((err) => {
                console.log(err);
            });
    }
});


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);