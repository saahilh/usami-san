require('dotenv').config();
const { createEventEmbedForDate, HIATUS_EMBED } = require('./constants');
const { Client } = require('discord.js');
const MyTime = require('./time');
// TODO: add unit tests

const client = new Client();

const EMOTE_LIST = ['🟩', '🟦', '🟧', '🟥'];

const EMOTE_TO_ROLE_ID = {
  '🟩': process.env.COMING_ROLE_ID,
  '🟦': process.env.PROBABLY_COMING_ROLE_ID,
  '🟧': process.env.PROBABLY_BUSY_ROLE_ID,
  '🟥': process.env.BUSY_ROLE_ID,
};

const logMessage = (message) => {
  const date = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
  return console.log(`${date}: ${message}`);
};

async function postEvent () {
  const eventDate = new MyTime();
  eventDate.advanceToDate('saturday', '20:30');

  const eventEmbed = createEventEmbedForDate(eventDate.getDate());

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    const server = await client.guilds.cache.get(process.env.SERVER_ID);

    const eventChannel = await client.channels.cache.get(process.env.CHANNEL_ID);
    const postedEmbed = await eventChannel.send({ embed: eventEmbed });
    
    const postedReactionList = [];
    for (const EMOTE of EMOTE_LIST) {
      const postedReaction = await postedEmbed.react(EMOTE);
      postedReactionList.push(postedReaction);
    }
    
    const clearAllEventRoles = async () => {
      const clearRoles = [];

      // TODO: verify this works
      await server.members.fetch();
      for (let member of Object.values(server.members.cache)) {
        // TODO: only do this if member is not on hiatus & is not a bot
        // console.log(member.roles.cache.has(process.env.HIATUS_ROLE_ID));

        // TODO: uncomment after making sure this work
        // clearRoles.push(member.roles.remove(EMOTE_TO_ROLE_ID[postedReaction.emoji.name]));
        // clearRoles.push(member.roles.add(process.env.INTERESTED_ROLE_ID));
      }

      if (!clearRoles.length) return;
      
      await Promise.all(...clearRoles);
    }

    const filter = (reaction) => {
      return EMOTE_LIST.indexOf(reaction.emoji.name) !== -1;
    };
    
    // TODO: make the time for this go until 1am on Sunday
    const collector = await postedEmbed.createReactionCollector(filter, { dispose: true, time: 5000 });
    
    collector.on('collect', async (newReaction, user) => {
      const member = await server.members.cache.get(user.id);
      member.roles.add(EMOTE_TO_ROLE_ID[newReaction.emoji.name]);
      member.roles.remove(process.env.INTERESTED_ROLE_ID);
      
      for (let postedReaction of postedReactionList) {
        if (postedReaction.emoji.name === newReaction.emoji.name || !postedReaction.users.cache.has(user.id)) continue;

        postedReaction.users.remove(user.id);
        member.roles.remove(EMOTE_TO_ROLE_ID[postedReaction.emoji.name]);
      }

      logMessage(`Collected ${newReaction.emoji.name} from ${user.tag}`);
    });

    collector.on('remove', async (removedReaction, user) => {
      const member = await server.members.cache.get(user.id);
      member.roles.remove(EMOTE_TO_ROLE_ID[removedReaction.emoji.name]);
      member.roles.add(process.env.INTERESTED_ROLE_ID);

      logMessage(`Removed ${removedReaction.emoji.name} from ${user.tag}`);
    });

    collector.on('end', async () => {
      await clearAllEventRoles();
      client.destroy();

      logMessage('Event ended & member roles cleared.');
    });
  
    // MyTime.queueCallbackForDate(clearAllEventRoles, 'sunday', '09:00', true);

    // const sendEventNotification = () => {
    //   // TODO: implement
    // };
    
    // const eventSoonNotification = () => {
    //   // TODO: implement
    // };
    
    console.log(`Posted event for ${MyTime.DAYS[eventDate.getDate().getDay()].toUpperCase()} ${eventDate.getDateAsString()}`);
  } catch (e) {
    console.error('Failed to post event. Error: ', { e });
    client.destroy();
  }
};

// TODO: delete line (used for testing)
postEvent();

// TODO: uncomment
// MyTime.queueCallbackForDate(postEvent, 'monday', '19:00', true);

// TODO: implement
// MyTime.queueCallbackForDate(sendEventNotification, 'wednesday', '19:00', true);

// TODO: implement
// MyTime.queueCallbackForDate(eventSoonNotification, 'saturday', '20:00', true);

// TODO: 
