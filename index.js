require('dotenv').config();
const { Client } = require('discord.js');
const Time = require('./src/Time');
const { createEventEmbedForDate, logError, logMessage } = require('./src/helper');
const { addRoleReactionsToMessage } = require('./src/reactions');
// TODO: add unit tests

const client = new Client();

const postEvent = async (client) => {
  const eventDate = new Time('saturday', '20:30');
  const eventEmbed = createEventEmbedForDate(eventDate);

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



// TODO: delete line (used for testing)
postEvent(client);

// TODO: uncomment
// Time.queueWeeklyCallbackForDate(() => postEvent(client), 'monday', '19:00', true);

// TODO: implement
// Time.queueWeeklyCallbackForDate(sendEventNotification, 'wednesday', '19:00', true);

// TODO: implement
// Time.queueWeeklyCallbackForDate(eventSoonNotification, 'saturday', '20:00', true);

// TODO: implement functionality to mark users as inactive if they haven't attended for 4 weeks
