require("dotenv").config();
var express = require('express');
var app = express();
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const token = '5959300484:AAHwWPKV7VBfGPAtrxkbLP_H-WDZiHm9DmA';
const bot = new TelegramBot(token, {polling: true});
const URLModel = require('./model/urls');


/* Listening to the message sent by the user and responding to it. */
    bot.on('message', (msg) => {
        var Hi = "hi";
        var soon = "/coming_soon...";
        var con = "/contact";
        var start = "/start";
        var help = "/help";
        // console.log(msg);
        if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id,"Hello  " + msg.from.first_name);
        }
        else if(msg.text.toString().toLowerCase().includes("bye")) {
        bot.sendMessage(msg.chat.id,"bye, See you soon");
        }
        else if (msg.text.toString().toLowerCase().indexOf(soon) === 0) {
        bot.sendMessage(msg.chat.id,"More features coming soon...\n Stick around to see what we have in store for you.");
        }else if(msg.text.toString().toLowerCase().indexOf(con) === 0 || msg.text.toString().toLowerCase().indexOf(start) === 0 || msg.text.toString().toLowerCase().indexOf(help) === 0){
            
        }else if(msg.text.toString().toLowerCase().includes("https://")){
            let rest = {};
            let url = msg.text.toString();
            rest.original_url = url;
            
            let urlRegex = new RegExp(
                /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
            );
            
            if (!url.match(urlRegex)) {
                bot.sendMessage(msg.chat.id, "Please enter a valid URL");
                return;
            }
            URLModel.findOne({original_url: url}, (err, result) => {
                if(!result){
                    let short = 1;
                URLModel.findOne({})
                    .sort({ short_url: -1 })
                    .exec((err, result) => {
                    if (!err && result != undefined) {
                        short = result.short_url + 1;
                    }
                    if (!err) {
                        URLModel.findOneAndUpdate(
                        { original_url: url },
                        { original_url: url, short_url: short },
                        { new: true, upsert: true },
                        (err, result) => {
                            if (!err) {
                            rest.short_url = result.short_url;
                            var shrin = result.short_url;
                            bot.sendMessage(msg.chat.id, `[http://localhost:3000/${shrin}](http://localhost:3000/${shrin})`, {parse_mode: "Markdown"});
                            }
                        }
                    )
                    }
                    })
                    bot.sendMessage(msg.chat.id,"Here's your squezeed URL",{
                        "reply_markup": {
                            "keyboard": [["bye"]]
                        }
                    });
                }else if(!err && result){
                    shrin = result.short_url;
                    bot.sendMessage(msg.chat.id, `Your shortened URL is: [http://localhost:3000/${shrin}](http://localhost:3000/${shrin})`,{parse_mode: "Markdown"});
                }
            });
        }else{
            bot.sendMessage(msg.chat.id,"Sorry, I don't understand what you mean.");
        }

            });
            
            
        app.get("/:short", (req, res) => {
            let short = req.params.short;
            URLModel.findOne({ short_url: short }, (err, result) => {
            if (!err) {
                res.redirect(result.original_url);
            }
            });
        });

// this is a command to start the bot
    bot.onText(/\/start/, (msg) => {
        var name = msg.from.first_name
        bot.sendMessage(msg.chat.id,
            `Welcome ${name} to URL shortener. \n An easier and cheaper way to shorten URL.\n \n Brought to you by @dvdslab`, {
                "reply_markup": {
                    "keyboard": [["/help"],["/contact"],["/coming_soon..."] ]
                }
            }
        );
    });

/* This is a command to contact the bot owner. */
    bot.onText(/\/contact/, (msg) => {
        bot.sendMessage(msg.chat.id, "Contact us at \nhttps://t.me/dvdslab\nhttps://github.com/dvdslab");
    });

    bot.onText(/\/help/, (msg) => {
        bot.sendMessage(msg.chat.id, "Type \n/start to get started \n /contact to contact the bot owner\n /coming_soon... to see what we have in store for you");
    });

/* Listening to the port 3000. */
const URI = process.env.MONGO_URI
mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {   
    app.listen(3000, function () {
        console.log('listening...');
        });
}).catch(() => {
    console.log('Connection failed!');
});
