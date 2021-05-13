const updateDotenv = require('update-dotenv');
const Time = require('./Time');
const { asyncMutativeMap, logError, logMessage } = require('./helper');

class ReactionRoleManager {
  constructor (reactionToRoleId, defaultRole=process.env.INTERESTED_ROLE_ID) { 
    this.reactionToRoleId = reactionToRoleId;
    this.reactionList = Object.keys(reactionToRoleId);
    this.roleIdList = Object.values(reactionToRoleId);

    this.defaultRole = defaultRole;
    
    this.addReactionRolesToMessage = this.addReactionRolesToMessage.bind(this);
    this.clearOtherContext = this.clearOtherContext.bind(this);
    this.getMemberRoles = this.getMemberRoles.bind(this);
  }
  
  async addReactionRolesToMessage(message, endTime) {
    try {
      await asyncMutativeMap(this.reactionList, async (reaction) => message.react(reaction));
      
      const filter = (reaction) => (this.reactionList.indexOf(reaction.emoji.name) !== -1);
      const config = { dispose: true };
      if (endTime) config.time = Time.getTimeToDate(endTime);

      const collector = await message.createReactionCollector(filter, config);
      const handleEventEnd = await this.makeHandleEventEnd(message);

      collector.on('collect', this.handleReactionAdd.bind(this));
      collector.on('remove', this.handleReactionRemove.bind(this));
      collector.on('end', handleEventEnd.bind(this));
      
      logMessage(`Added role reaction listener to event embed ${message.id}`);
    } catch (e) {
      logError('Failed to post event. Error: ', e);
    }
  }

  async getMemberFromReaction(user, reaction) {
    return reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
  }

  getMemberRoles(member) {
    const emotesWithRoles = [];

    for (const emote of this.reactionList) {
      const emoteRoleId = this.reactionToRoleId[emote];
      if (!member.roles.cache.has(emoteRoleId)) continue;

      emotesWithRoles.push(emote);
    }

    return emotesWithRoles;
  }

  // Clears all context except that for this reaction
  async clearOtherContext(reaction, user) {
    const member = await this.getMemberFromReaction(user, reaction);
    const emotesWithRoles = this.getMemberRoles(member);

    // Unrelated emotes that are mapped to a role that the member currently has
    const unrelatedEmotesWithRoles = emotesWithRoles.reduce((unrelatedEmotesWithRoles, emote) => {
      return reaction.emoji.name === emote ? unrelatedEmotesWithRoles : [emote, ...unrelatedEmotesWithRoles];
    }, []);

    const unrelatedRoleIds = [this.defaultRole, ...unrelatedEmotesWithRoles.map(reaction => this.reactionToRoleId[reaction])];
    const clearUnrelatedRoles = asyncMutativeMap(unrelatedRoleIds, (roleId) => member.roles.remove(roleId));
    
    const discordReactions = [...reaction.message.reactions.cache.values()];
    const removeUserFromReaction = (reaction) => unrelatedEmotesWithRoles.includes(reaction.emoji.name) && reaction.users.remove(user.id);
    const clearUnrelatedEmojis = asyncMutativeMap(discordReactions, removeUserFromReaction);

    return Promise.all([clearUnrelatedRoles, clearUnrelatedEmojis]);
  }

  async handleReactionAdd(reaction, user) {
    this.clearOtherContext(reaction, user);

    const member = await this.getMemberFromReaction(user, reaction);
    member.roles.remove(this.defaultRole);
    member.roles.add(this.reactionToRoleId[reaction.emoji.name]);

    logMessage(`Collected ${reaction.emoji.name} from ${user.tag}`);
  }

  async handleReactionRemove(reaction, user) {
    this.clearOtherContext(reaction, user);

    const member = await this.getMemberFromReaction(user, reaction);
    member.roles.remove(this.reactionToRoleId[reaction.emoji.name]);
    member.roles.add(this.defaultRole);

    logMessage(`Removed ${reaction.emoji.name} from ${user.tag}`);
  };

  async makeHandleEventEnd(message) {
    updateDotenv({ EVENT_POST_ID: '' });
    const allRolesList = await message.guild.roles.fetch();

    const removedMemberIds = [];
    const removeEventRoles = () => {
      const removeRoleList = this.roleIdList.map((roleId) => allRolesList.get(roleId));
      
      const removeAllMembersFromRole = (role) => {
        const memberIdList = [...role.members.keys()];
        removedMemberIds.push(...memberIdList);
        return asyncMutativeMap(memberList, (member) => role.members.remove(member));
      }

      return asyncMutativeMap(removeRoleList, removeAllMembersFromRole);
    }
    
    const setRemovedMembersInterested = () => {
      const interestedRole = allRolesList.get(this.defaultRole);
      return asyncMutativeMap(removedMemberIds, () => interestedRole.members.add(memberId));
    }

    return (async () => {
      await [removeEventRoles(), setRemovedMembersInterested()];
      logMessage(`Event ended & member roles cleared.`);
    });
  }
}

module.exports = ReactionRoleManager;
