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

/*
restaurants_dict2 = {
    "foobar": {
        "restaurant_id": 490051,
        "menu_ids": [60, 78, 3, 23, 84]
    },
    "mara": {
        "restaurant_id": 49,
        "menu_ids": [60, 93, 23, 84]
    },
    "väistö": {
        "restaurant_id": 480066,
        "menu_ids": [95, 84]
    },
    "kylymä": {
        "restaurant_id": 490052,
        "menu_ids": [60, 23, 84]
    },
    "napa": {
        "restaurant_id": 480054,
        "menu_ids": [60, 93, 77, 86, 84]
    }
}
 */

const knownRestaurants = [
    {
        id: 480054,
        name: "napa",
        //menuTypeIds: [93, 84, 60, 86, 77],
        // for dev only use one menu
        menuTypeIds: [93],
    },
    {
        id: 49,
        name: "mara",
        menuTypeIds: []
    },
    {
        id: 490051,
        name: "foobar",
        menuTypeIds: [3, 78, 84, 60, 23],
    },
    {
        id: 480066,
        name: "väistö",
        menuTypeIds: [93, 95],
    },
    {
        id: 480052,
        name: "kylymä",
        menuTypeIds: [84, 95],
    },
];

const getMenuByDateUrl = "https://juvenes.fi//DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetMenuByDate?lang=en&";
// KitchenId=480054&MenuTypeId=93&Date=2019-03-05T19:24:31.610Z&

async function getMenu(restaurant, date) {
    const promises = [];
    const urlWithDate = `${getMenuByDateUrl}Date=${date}&`;
    restaurant.menuTypeIds.forEach((menuTypeId) => {
        const menuUrl = `${urlWithDate}KitchenId=${menuTypeId}`;
        console.log('finished url:');
        console.log(menuUrl);
        promises.push(axios.get(menuUrl));
    });
    try{
        const menus = await Promise.all(promises);
        return menus.map((menu) => {
            return {
                food: menu.MealOptions.MenuItems.Name,
                menuName: menu.name,
            };
        });
    } catch(error) {
        console.log("error fetching menus:");
        console.log(error);
    }
}

async function handleInlineQuery(body, resHandle) {
    console.log('handling inline query!');
    console.log(body);
    const url = `${botUrl}answerInlineQuery`;
    const results = [];
    /*
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
    */

    /*
    9:02:28 PM: { update_id: 681007098,
  inline_query:
   { id: '1653101880932669400',
     from:
      { id: 384892774,
        is_bot: false,
        first_name: 'Tomi',
        last_name: 'Lämsä',
        language_code: 'en' },
     query: 'something',
     offset: '' } }
     */

    const { inline_query } = body;

    const inlineResponseBody = {
        inline_query_id: body.inline_query.id,
        // short cache time for dev purposes
        cache_time: 10,
    };

    const restaurant = knownRestaurants.find((knownRestaurant) => {
        return knownRestaurant.name === inline_query.query;
    });

    if (restaurant) {
        // found restaurant
        console.log(`found restaurant by name ${restaurant.name}`);
        console.log('fetching data and returning it....');
        const dateNow = new Date();
        const menu = await getMenu(restaurant, dateNow.toISOString());
        inlineResponseBody.results = [
            {
                type: "article",
                id: 1,
                title: restaurant.name,
                description: `Menu for ${restaurant.name}`,
                input_message_content: {
                    message_text: `${menu}`,
                },
            },
        ];
        const response = await axios.post(url, inlineResponseBody);
        console.log('response got from telegram:');
        //console.log(response);
        resHandle.status(200).send();
    } else {
        try {
            console.log('sending error response, restaurant not found');
            inlineResponseBody.results = [
                {
                    type: "article",
                    id: 1,
                    title: "Oops...",
                    description: "Please give a restaurant name",
                    input_message_content: {
                        message_text: "Enter a restaurant name after @oy_restaurant_bot to fetch a menu",
                    },
                }
            ];
            const response = await axios.post(url, inlineResponseBody);
            console.log('response got from telegram:');
            //console.log(response);
            resHandle.status(200).send();
        } catch(error) {
            console.log('error sending error.. What is this.');
            resHandle.status(500).send();
        }

    }


    /*
    try{
        //const response = await axios.post(url, inlineResponseBody);
        console.log('response got from telegram:');
        console.log(response);
        resHandle.status(200).send();
    } catch(error) {
        console.log('error while sending inline query response');
        console.log(error);
        resHandle.status(500).send();
    }
    */
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