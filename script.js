// 'use strict';

// const Script = require('smooch-bot').Script;

// module.exports = new Script({
//     processing: {
//         prompt: (bot) => bot.say('Beep boop...'),
//         receive: () => 'processing'
//     },

//     start: {
//         receive: (bot) => {
//             return bot.say('Hi! I\'m Pedro\'s Bot Assistant!')
//                 .then(() => 'askName');
//         }
//     },

//     askName: {
//         prompt: (bot) => bot.say('What\'s your name?'),
//         receive: (bot, message) => {
//             const name = message.text;
//             return bot.setProp('name', name)
//                 .then(() => bot.say(`Great! I'll call you ${name}`))
//                 .then(() => 'finish');
//         }
//     },

//     finish: {
//         receive: (bot, message) => {
//             return bot.getProp('name')
//                 .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
//                         'teach me how to do anything else!'))
//                 .then(() => 'finish');
//         }
//     }
// });

'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('So you want to learn about Pedro? Just say HELLO to get started.')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`I didn't understand that.`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split(/(<img src=\'[^>]*\'\/>)/);

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    if (!line.startsWith("<")) {
                        p = p.then(function() {
                            return bot.say(line);
                        });
                    } else {
                        // p = p.then(function() {
                        //     var start = line.indexOf("'") + 1;
                        //     var end = line.lastIndexOf("'");
                        //     var imageFile = line.substring(start, end);
                        //     return bot.sendImage(imageFile);
                        // });
                    }
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
