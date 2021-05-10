require('dotenv').config();
const { createEventEmbed, EVENT_TIME, EVENT_SOON_NOTIFICATION, EMOTE_TO_ROLE_ID, ROLE_RESET_TIME} = require('./eventConstants');
const { logError, logMessage } = require('./helper');
const ReactionRoleManager = require('./ReactionRoleManager');
const Time = require('./Time');

class ClientInterface {
  constructor(client) {
    this.client = client;
  } 
  
  async postEvent () {
    const eventEmbed = createEventEmbed();
  
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
  
      const eventChannel = this.client.channels.cache.get(process.env.CHANNEL_ID) || await this.client.channels.fetch(process.env.CHANNEL_ID);
      const postedEmbed = await eventChannel.send({ embed: eventEmbed });
      const reactionRoles = new ReactionRoleManager(EMOTE_TO_ROLE_ID);
  
      await reactionRoles.addReactionRolesToMessage(postedEmbed, EVENT_TIME);
    
      const eventDate = new Time(...ROLE_RESET_TIME);
      logMessage(`Posted event for ${Time.DAYS[eventDate.getDay()]} ${eventDate.toLocaleString()}`);
    } catch (e) {
      logError('Failed to post event. Error: ', e);
      this.client.destroy();
    }
  }
  
  async sendEventSoonNotification() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
  
      const eventChannel = client.channels.cache.get(process.env.CHANNEL_ID) || await client.channels.fetch(process.env.channel_ID);
      const roleMentions = EVENT_SOON_NOTIFICATION.ROLES.map((ROLE_ID) => `<@&${ROLE_ID}>`);
      const eventSoonNotification = `${roleMentions.join(' ')}: ${EVENT_SOON_NOTIFICATION.MESSAGE}`;
      await eventChannel.send(eventSoonNotification);
  
      logMessage(`Successfully sent message to channel: ${EVENT_SOON_NOTIFICATION.MESSAGE}`);
    } catch (e) {
      logError('Failed to post event. Error: ', e);
      this.client.destroy();
    }
  }
}

module.exports = ClientInterface;
