require('dotenv').config();
const { createEventEmbedForDate, hiatusEmbed } = require('./constants');
const { Client } = require('discord.js');
const MyTime = require('./time');
// TODO: add unit tests

async function postEvent () {
  const client = new Client();
  const eventDate = new MyTime();
  eventDate.advanceToDate('saturday', '20:30');

  const eventEmbed = createEventEmbedForDate(eventDate.getDate());

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    const eventChannel = await client.channels.cache.get(process.env.CHANNEL_ID);
    const postedEmbed = await eventChannel.send({ embed: eventEmbed });
    
    await postedEmbed.react('🟩')
    await postedEmbed.react('🟦');
    await postedEmbed.react('🟧');
    await postedEmbed.react('🟥');

    // TODO: listen for reactions, add roles when they occur
    // TODO: clear roles after certain timeout (after event finishes)
    // const resetEventRoles = () => {};
    // MyTime.queueCallbackForDate(resetEventRoles, 'sunday', '09:00', true);

    // const sendEventNotification = () => {
    //   // TODO: implement
    // };
    
    // const eventSoonNotification = () => {
    //   // TODO: implement
    // };
    
    // MyTime.queueCallbackForDate(sendEventNotification, 'wednesday', '19:00', true);
    // MyTime.queueCallbackForDate(eventSoonNotification, 'saturday', '20:00', true);
    
    console.log({ embed })
    console.log(`Posted event for ${MyTime.DAYS[eventDate.getDate().getDay()].toUpperCase()} ${eventDate.getDateAsString()}`);
  } catch (e) {
    console.error('Failed to post event.');
    console.log({ e });
  } finally {
    client.destroy();
  }
};

postEvent();
// MyTime.queueCallbackForDate(postEvent, 'monday', '19:00', true);
