const TelegramBot = require('node-telegram-bot-api');
var express = require('express');
var app = express();
const mongoose = require('mongoose');
require("dotenv").config();
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {
    polling: true
});
const URLModel = require('./model/urls');
const UserModel = require('./model/user');


/* Listening to the message sent by the user and responding to it. */
bot.on('message', (msg) => {
    if (msg.text.toString().toLowerCase() === 'hi') {
        bot.sendMessage(msg.chat.id, "Hello " + msg.from.first_name);
    } else if (msg.text.toString().toLowerCase().includes("bye")) {
        bot.sendMessage(msg.chat.id, "bye, See you soon");
    } else if (msg.text.toString().toLowerCase() === "/coming_soon") {
        bot.sendMessage(msg.chat.id, "More features coming soon...\n Stick around to see what we have in store for you.");
    } else if (msg.text.toString().toLowerCase() === "/contact" || msg.text.toString().toLowerCase() === "/start" || msg.text.toString().toLowerCase() === "/help" || msg.text.toString().toLowerCase() === "/register" || msg.text.toString().toLowerCase() === "/profile") {

    } else if (msg.text.toString().toLowerCase().includes("https://" || "http://")) {
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
        UserModel.findOne({
            userId: msg.from.id
        }, (err, result) => {
            if (!result) {
                bot.sendMessage(msg.chat.id, "Please /register first");
                return;
            }
            if (!err && result) {
                var thi = result.links.map(link => link.original_url)
                // console.log(result.links.map(link => link.original_url));
                if (thi.includes(url)) {
                    bot.sendMessage(msg.chat.id, "URL already exists");
                    return;
                } else {
                    URLModel.findOne({}, {}, {
                        sort: {
                            'short_url': -1
                        }
                    }, (err, result) => {
                        if (!err && result) {
                            rest.short_url = result.short_url + 1;
                            // console.log(rest, result);
                            URLModel.create(rest, (err, result) => {
                                if (!err && result) {
                                    UserModel.findOneAndUpdate({
                                        userId: msg.from.id
                                    }, {
                                        $push: {
                                            links: rest
                                        }
                                    }, (err, result) => {
                                        if (!err && result) {
                                            bot.sendMessage(msg.chat.id, "URL shortened successfully\n check your profile for the shortened URL");
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }
        });



        // URLModel.findOne({
        //     original_url: url
        // }, (err, result) => {
        //     if (!result) {
        //         let short = 1;
        //         URLModel.findOne({})
        //             .sort({
        //                 short_url: -1
        //             })
        //             .exec((err, result) => {
        //                 if (!err && result != undefined) {
        //                     console.log(result);
        //                     short = result.short_url + 1;
        //                 }
        //                 if (!err) {
        //                     URLModel.findOneAndUpdate({
        //                             original_url: url
        //                         }, {
        //                             original_url: url,
        //                             short_url: short
        //                         }, {
        //                             new: true,
        //                             upsert: true
        //                         },
        //                         (err, result) => {
        //                             if (!err) {
        //                                 rest.short_url = result.short_url;
        //                                 var shrin = result.short_url;
        //                                 bot.sendMessage(msg.chat.id, `Here's your squezeed URL: [https://squezee.up.railway.app/${shrin}](https://squezee.up.railway.app/${shrin})`, {
        //                                     parse_mode: "Markdown"
        //                                 });
        //                             }
        //                         }
        //                     )
        //                 }
        //             })
        //     } else if (!err && result) {
        //         shrin = result.short_url;
        //         bot.sendMessage(msg.chat.id, `Your shortened URL is: [https://squezee.up.railway.app/${shrin}](https://squezee.up.railway.app/${shrin})`, {
        //             parse_mode: "Markdown"
        //         });
        //     }
        // });
    } else {
        // console.log(msg);
        bot.sendMessage(msg.chat.id, "Enter a valid Url");
    }
});
// bot.on("polling_error", (msg) => console.log(msg));
app.get("/:short", (req, res) => {
    let short = req.params.short;
    URLModel.findOne({
        short_url: short
    }, (err, result) => {
        if (!err) {
            res.redirect(result.original_url);
        }
        if (err || result === null) {
            res.json({
                "URL not found": "Please enter a valid URL"
            });
        }
    });
});

// this is a command to start the bot
bot.onText(/\/start/, (msg) => {
    var name = msg.from.first_name
    bot.sendMessage(msg.chat.id,
        `Welcome ${name} to URL shortener. \n An easier and cheaper way to shorten URL.\n Enter a url in this fromat \n<pre>https://www.squesee.com</pre>\n to 'squesee' it \n click /help for more options \n \n Brought to you by @HiASSea`, {
            parse_mode: "HTML"
        }
    );
});

/* This is a command to contact the bot owner. */
bot.onText(/\/contact/, (msg) => {
    bot.sendMessage(msg.chat.id, "Contact us at \nhttps://t.me/HiASSea\nhttps://github.com/dvdslab", {
        // "reply_markup": {
        //     "inline_keyboard": [
        //         [{
        //             text: 'test',
        //             callback_data: 'test'
        //         }]
        //     ]
        // }
    });
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Type \n/start to get started \n /contact to contact the bot owner\n /coming_soon... to see what we have in store for you \n Enter a url in this fromat <pre>https://www.squesee.com</pre> to 'squesee' it \n and \n /help to see this message again (obviously)", {
        parse_mode: "HTML"
    });
});

bot.onText(/\/register/, (msg) => {
    const U = msg.chat;
    let last = ""
    if (U.last_name) {
        last = U.last_name
    }
    try {
        UserModel.findOne({
            userId: U.id
        }, (err, result) => {
            if (!result) {
                UserModel.findOneAndUpdate({
                    userId: U.id
                }, {
                    userId: U.id,
                    fullname: U.first_name + " " + last,
                    username: U.username,
                }, {
                    new: true,
                    upsert: true
                }, (err, result) => {
                    // console.log(result);
                    if (!err && result) {
                        bot.sendMessage(U.id, `You have been registered ${U.username}`)
                    }
                })
            } else if (!err && result) {
                bot.sendMessage(U.id, 'You already have an account')
            }
        })
    } catch (err) {
        console.log(err);
    }
})

bot.onText(/\/profile/, (msg) => {
    const U = msg.chat
    // const iterate = (link) => {
    //     return "\n" + link;
    // }
    try {
        UserModel.findOne({
            userId: U.id
        }, (err, result) => {
            if (!result) {
                bot.sendMessage(U.id, '/register your account')
            } else if (!err && result) {
                let table = ""
                for (let i of result.links) {
                    table += "\n" + i.original_url.substr(0, 22) + "... ==> https://squezee.up.railway.app/" + i.short_url + "\n";
                }
                bot.sendMessage(U.id, `<b>Account Profile</b>.\n\n<b>Fullname</b>: ${result.fullname} \n<b>Username</b>: ${result.username} \n<b>Links created</b>: ${result.links.length} \n<b>Links</b>: ${table}`, {
                    parse_mode: 'HTML'
                })
            }
        })
    } catch (err) {
        console.log(err);
    }
})

/* Listening to the port 3000. */
const URI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000;
mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        app.listen(PORT, function () {
            console.log('Bot turned on');
        });
    }).catch(() => {
        console.log('Connection failed!');
    });