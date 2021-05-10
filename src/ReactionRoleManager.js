const updateDotenv = require('update-dotenv');
const Time = require('./Time');
const { asyncMutativeMap, logError, logMessage } = require('./helper');

class ReactionRoleManager {
  constructor (reactionToRoleId, defaultRole=process.env.INTERESTED_ROLE_ID) { 
    this.reactionToRoleId = reactionToRoleId;
    this.reactionList = Object.keys(reactionToRoleId);
    this.roleIdList = Object.values(reactionToRoleId);

    this.defaultRole = defaultRole;
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

  async handleReactionAdd(newReaction, user) {
    const message = newReaction.message;
    const member = message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id);
    
    member.roles.add(this.reactionToRoleId[newReaction.emoji.name]);

    const reactionListWithoutCurrent = this.reactionList.filter((reaction) => reaction !== newReaction.emoji.name)
    const roleIdList = reactionListWithoutCurrent.map((reaction) => this.reactionToRoleId[reaction]);
    const emoteRoleIdToRemoveList = [this.defaultRole, ...roleIdList];

    const clearRoles = asyncMutativeMap(emoteRoleIdToRemoveList, (emoteRoleIdToRemove) => member.roles.cache.has(emoteRoleIdToRemove) && member.roles.remove(emoteRoleIdToRemove));
    
    const postedReactionList = [...message.reactions.cache.values()];
    const clearEmojis = asyncMutativeMap(postedReactionList, (postedReaction) => postedReaction.emoji.name !== newReaction.emoji.name && postedReaction.users.remove(user.id));

    await [clearRoles, clearEmojis];

    logMessage(`Collected ${newReaction.emoji.name} from ${user.tag}`);
  }

  async handleReactionRemove(removedReaction, user) {
    const member = removedReaction.message.guild.members.cache.get(user.id) || await removedReaction.message.guild.members.fetch(user.id);
    
    member.roles.remove(this.reactionToRoleId[removedReaction.emoji.name]);
    member.roles.add(this.defaultRole);

    logMessage(`Removed ${removedReaction.emoji.name} from ${user.tag}`);
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
