require('dotenv').config();
// const { createEventEmbedForDate, hiatusEmbed } = require('./constants');
// const { Client } = require('discord.js');
const MyTime = require('./time');

// const client = new Client();
// console.log({ timeToMessage });
// client.login(process.env.DISCORD_BOT_TOKEN);

const postEventNotification = () => {
  // TODO: implement
};

const timer = new MyTime();
// TODO: uncomment when done
// timer.queueCallbackForDate(postEventNotification, 'wednesday', '19:00', true);

const resetEventAndRoles = () => {
  // TODO: implement
};

// TODO: uncomment when done
// timer.queueCallbackForDate(resetEventAndRoles, 'sunday', '09:00', true);


const nextEventDate = new MyTime();
nextEventDate.advanceToDate('saturday', '20:30');
console.log({ nextEventDate: nextEventDate.getDate() });
// TODO: add reactions + handle reaction roles after event is created; delete reaction message from #about

// const timeToEventPosted = eventPostTime - Date.now();
// const channel =...
// channel.send({ embed: eventEmbed });
