require('dotenv').config();
const { createEventEmbedForDate, HIATUS_EMBED } = require('./constants');
const { Client } = require('discord.js');
const MyTime = require('./time');
// TODO: add unit tests

const EMOTE_TO_ROLE_ID = {
  '🟩': process.env.COMING_ROLE_ID,
  '🟦': process.env.PROBABLY_COMING_ROLE_ID,
  '🟧': process.env.PROBABLY_BUSY_ROLE_ID,
  '🟥': process.env.BUSY_ROLE_ID,
};

const EMOTE_LIST = Object.keys(EMOTE_TO_ROLE_ID);
const EMOTE_ROLE_ID_LIST = Object.values(EMOTE_TO_ROLE_ID);

const client = new Client();

const logMessage = (message) => {
  const date = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
  return console.log(`${date}: ${message}`);
};

const getActiveMemberList = async (memberList) => {
  const activeMemberList = [];

  const memberIsActive = async (member) => member.user.bot || await member.roles.cache.has(process.env.HIATUS_ROLE_ID);

  const addMemberIfActive = async (member) => {
    if (!(await memberIsActive(member))) return;

    activeMemberList.push(member);
  }

  const getMembersPromises = [];
  for (const member of memberList) {
    getMembersPromises.push(addMemberIfActive(member));
  }

  return Promise.all(getMembersPromises).then(() => activeMemberList);
}

const asyncMutativeMap = async (itemList, asyncCallback) => {
  const promiseList = [];

  for (const item of itemList) {
    const promise = asyncCallback(item);
    promiseList.push(promise);
  }
  
  return Promise.all(promiseList);
}

const markMemberInterested = async (member) => member.roles.add(process.env.INTERESTED_ROLE_ID);
const markMembersInterested = async (memberList) => asyncMutativeMap(memberList, markMemberInterested);

const makeRemoveRole = async (memberList) => async (role) => {
  const removeRole = async (member) => member.roles.remove(role);
  return asyncMutativeMap(memberList, removeRole);
};
const clearEventRoles = async (memberList, roleList=EMOTE_ROLE_ID_LIST) => asyncMutativeMap(roleList, makeRemoveRole(memberList));

async function postEvent () {
  const eventDate = new MyTime();
  eventDate.advanceToDate('saturday', '20:30');

  const eventEmbed = createEventEmbedForDate(eventDate.getDate());

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    const server = await client.guilds.cache.get(process.env.SERVER_ID);

    const eventChannel = await server.channels.cache.get(process.env.CHANNEL_ID);
    const postedEmbed = await eventChannel.send({ embed: eventEmbed });
    
    const postedReactionList = [];
    for (const EMOTE of EMOTE_LIST) {
      const postedReaction = await postedEmbed.react(EMOTE);
      postedReactionList.push(postedReaction);
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
      const memberList = await server.members.fetch();
      const activeMemberList = await getActiveMemberList(memberList);
      
      // await clearEventRoles(activeMemberList);
      // await markMembersInterested(activeMemberList);

      client.destroy();

      logMessage('Event ended & member roles cleared.');
    });
  
    // MyTime.queueCallbackForDate(() => clearAllEventRoles(server), 'sunday', '09:00', true);

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
