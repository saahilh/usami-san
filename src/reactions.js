const Time = require('./Time');
const { asyncMutativeMap, logError, logMessage } = require('./helper');
const { EMOTE_LIST, EMOTE_ROLE_ID_LIST, ROLE_RESET_TIME } = require('./eventConstants');

async function addRoleReactionsToMessage(message) {
  try {
    await asyncMutativeMap(EMOTE_LIST, async (EMOTE) => message.react(EMOTE));
    
    const filter = (reaction) => (EMOTE_LIST.indexOf(reaction.emoji.name) !== -1);
    const config = {
      dispose: true,
      time: Time.getTimeToDate(...ROLE_RESET_TIME),
    };
    const collector = await message.createReactionCollector(filter, config);

    collector.on('collect', handleReactionAdd);
    collector.on('remove', handleReactionRemove);
    collector.on('end', handleEventEnd(message));
    
    logMessage(`Added role reaction listener to event embed ${message.id}`);
  } catch (e) {
    logError('Failed to post event. Error: ', e);
  }
}

async function handleReactionAdd(newReaction, user) {
  const message = newReaction.message;
  const member = message.guild.members.cache.get(user.id) || await message.guild.members.fetch(user.id);
  
  const currentEmoteRoleId = EMOTE_TO_ROLE_ID[newReaction.emoji.name];
  member.roles.add(currentEmoteRoleId);

  const EMOTE_LIST_WITHOUT_CURRENT = EMOTE_LIST.filter((EMOTE) => EMOTE !== newReaction.emoji.name)
  
  const EMOTE_ROLE_ID_LIST_WITHOUT_CURRENT = EMOTE_LIST_WITHOUT_CURRENT.map((EMOTE) => EMOTE_TO_ROLE_ID[EMOTE]);
  const emoteRoleIdToRemoveList = [process.env.INTERESTED_ROLE_ID, ...EMOTE_ROLE_ID_LIST_WITHOUT_CURRENT]
  
  const postedReactionList= [...message.reactions.cache.values()];

  const clearRoles = asyncMutativeMap(emoteRoleIdToRemoveList, (emoteRoleIdToRemove) => member.roles.cache.has(emoteRoleIdToRemove) && member.roles.remove(emoteRoleIdToRemove));
  const clearEmojis = asyncMutativeMap(postedReactionList, (postedReaction) => postedReaction.emoji.name !== newReaction.emoji.name && postedReaction.users.remove(user.id));

  await [clearRoles, clearEmojis];

  logMessage(`Collected ${newReaction.emoji.name} from ${user.tag}`);
}

const handleReactionRemove = async (removedReaction, user) => {
  const member = removedReaction.message.guild.members.cache.get(user.id) || await removedReaction.message.guild.members.fetch(user.id);
  
  member.roles.remove(EMOTE_TO_ROLE_ID[removedReaction.emoji.name]);
  member.roles.add(process.env.INTERESTED_ROLE_ID);

  logMessage(`Removed ${removedReaction.emoji.name} from ${user.tag}`);
};

async function handleEventEnd(message) {
  const allRolesList = await message.guild.roles.fetch();

  const removedMemberIds = [];
  const removeEventRoles = () => {
    const removeRoleList = EMOTE_ROLE_ID_LIST.map((EMOTE_ROLE_ID) => allRolesList.get(EMOTE_ROLE_ID));
    
    const removeAllMembersFromRole = (role) => {
      const memberIdList = [...role.members.keys()];
      removedMemberIds.push(...memberIdList);
      return asyncMutativeMap(memberList, (member) => role.members.remove(member));
    }

    return asyncMutativeMap(removeRoleList, removeAllMembersFromRole);
  }
  
  const setRemovedMembersInterested = () => {
    const interestedRole = allRolesList.get(process.env.INTERESTED_ROLE_ID);
    return asyncMutativeMap(removedMemberIds, () => interestedRole.members.add(memberId));
  }

  return async () => {
    await [removeEventRoles(), setRemovedMembersInterested()];
    logMessage(`Event ended & member roles cleared.`);
  };
}

module.exports = {
  addRoleReactionsToMessage,
};
