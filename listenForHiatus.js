require('dotenv').config();
const { Client } = require('discord.js');
const { HIATUS_EMBED } = require('./src/eventConstants');
const { logError, logMessage } = require('./src/helper');
const ReactionRoleManager = require('./src/ReactionRoleManager');

const client = new Client();

const begin = async () => {
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    const aboutChannel = client.channels.cache.get(process.env.ABOUT_CHANNEL_ID) || await client.channels.fetch(process.env.ABOUT_CHANNEL_ID);

    let message;

    if (process.env.HIATUS_MESSAGE_ID) {
      message = await aboutChannel.messages.fetch(process.env.HIATUS_MESSAGE_ID);
    } else {
      const aboutMessage = `Hello everyone! This server's primarily dedicated to arranging events for alumni. Really, it's primarily targeted at anyone who's maintaining a fairly consistent schedule and can manage fairly consistent attendance. That can include McGill alumni, other alumni, or even people who never went to uni but have been working for a while. Beyond that, I'd say that grad students, phd students, and people that are just about to graduate are welcome to join as well.\n\nThere's no voice channel in this server at present as event should be held on the MSAC server. The goal of this server isn't to exclude the undergraduate students. Instead, it's more to focus on being inclusive of people in a similar place in life, and hopefully to get to know that we'll be seeing each other fairly regularly because exams won't be getting in the way. Honestly, I'd make a group chat but we can only have up to 10 people in them. I also decided not to create a channel on the MSAC server for this because I wanted more freedom to explore different bot options for handling alerts without worrying about setting that up in the MSAC ecosystem.\n\nFor now we've just got board game night and honestly that's good enough for me. See y'all there!`;
      await aboutChannel.send(aboutMessage);
      message = await aboutChannel.send({ embed: HIATUS_EMBED });
    }

    const reactionRoles = new ReactionRoleManager({ '🟪': process.env.HIATUS_ROLE_ID });
    await reactionRoles.addReactionRolesToMessage(message);

    logMessage('Now listening for hiatus message reacts.');
  } catch (e) {
    logError('Failed to post event. Error: ', e);
    client.destroy();
  }
};

begin();
