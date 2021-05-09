require('dotenv').config();
const { Client } = require('discord.js');
const Time = require('./src/Time');
const { createEventEmbed, HIATUS_EMBED, EVENT_POST_TIME, EVENT_SOON_NOTIFICATION_TIME } = require('./src/eventConstants');
const { logError, logMessage } = require('./src/helper');
const { addRoleReactionsToMessage } = require('./src/reactions');
// TODO: add unit tests

const client = new Client();

const postEvent = async () => {
  const eventEmbed = createEventEmbed();

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    const eventChannel = client.channels.cache.get(process.env.CHANNEL_ID) || await client.channels.fetch(process.env.channel_ID);
    const postedEmbed = await eventChannel.send({ embed: eventEmbed });
    await addRoleReactionsToMessage(postedEmbed);
    
    logMessage(`Posted event for ${Time.DAYS[eventDate.getDay()]} ${eventDate.toLocaleString()}`);
  } catch (e) {
    logError('Failed to post event. Error: ', e);
    client.destroy();
  }
};

Time.queueWeeklyCallbackForDate(postEvent, ...EVENT_POST_TIME);

// TODO: add in a mid-week notification?

// TODO: implement this message. It should @ both 'coming' and 'probably coming'
// Time.queueWeeklyCallbackForDate(eventSoonNotification, EVENT_SOON_NOTIFICATION_TIME);

// TODO: have log write to a file
// TODO: implement functionality to mark users as inactive if they haven't attended for 4 weeks