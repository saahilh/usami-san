require('dotenv').config();
// const { createEventEmbedForDate, hiatusEmbed } = require('./constants');
// const { Client } = require('discord.js');
const MyTime = require('./time');
// TODO: add unit tests

// const client = new Client();
// client.login(process.env.DISCORD_BOT_TOKEN);
// const botTestChannel = client.channels.find((channel) => channel.name === process.env.CHANNEL_NAME);

async function postEvent () {
  const botTestChannel = client.channels.find((channel) => channel.name === process.env.CHANNEL_NAME);
  await botTestChannel.send({ embed: eventEmbed });
  client.destroy();
};

const sendEventNotification = () => {

};

const eventSoonNotification = () => {
  // TODO: implement
};

const resetEventAndRoles = () => {
  // TODO: implement
};

// MyTime.queueCallbackForDate(postEvent, 'monday', '19:00', true);
// MyTime.queueCallbackForDate(sendEventNotification, 'wednesday', '19:00', true);
// MyTime.queueCallbackForDate(eventSoonNotification, 'saturday', '20:00', true);
// MyTime.queueCallbackForDate(resetEventAndRoles, 'sunday', '09:00', true);



// TODO: add reactions + handle reaction roles after event is created; delete reaction message from #about






// const timeToEventPosted = eventPostTime - Date.now();
// const channel =...
// channel.send({ embed: eventEmbed });
