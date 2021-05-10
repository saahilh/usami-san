const Time = require('./Time');

const EVENT_POST_TIME = ['wednesday', '19:00'];
const EVENT_TIME = ['saturday', '20:30'];
const ROLE_RESET_TIME = ['sunday', '01:00'];

const EMOTE_TO_ROLE_ID = {
  '🟩': process.env.COMING_ROLE_ID,
  '🟦': process.env.PROBABLY_COMING_ROLE_ID,
  '🟧': process.env.PROBABLY_BUSY_ROLE_ID,
  '🟥': process.env.BUSY_ROLE_ID,
};

const EMOTE_LIST = Object.keys(EMOTE_TO_ROLE_ID);
const EMOTE_ROLE_ID_LIST = Object.values(EMOTE_TO_ROLE_ID);

const EVENT_SOON_NOTIFICATION = {
  TIME: ['saturday', '20:00'],
  ROLES: [process.env.COMING_ROLE_ID, process.env.PROBABLY_COMING_ROLE_ID],
  MESSAGE: 'Board game night in 30 minutes. See you soon!',
};

const createEventEmbed = () => ({ ...EVENT_EMBED_BASE, timestamp:  new Time(...EVENT_TIME) });
const EVENT_EMBED_BASE = {
  color: 0,
  title: ':game_die: BOARD GAME NIGHT :game_die: ',
  author: {
    name: 'Get Tabletop Simulator here',
    icon_url: 'https://pbs.twimg.com/profile_images/1368668417549557761/cwmgoiJ2.png',
    url: 'https://store.steampowered.com/app/286160/Tabletop_Simulator/',
  },
  description: `
    Weekly board game night. React to let us know if you'll be there this weekend. It gives us something more to look forward to this weekend!
    \n:green_square: Coming\n\n:blue_square: Probably coming\n\n:orange_square: Probably busy\n\n:red_square: Busy
  `,
  thumbnail: { url: 'https://i.imgur.com/chqFIZn.png' },
  image: { url: 'https://animananimedotcom.files.wordpress.com/2017/04/mpv-shot00014.jpg?w=636' },
  footer: { text: 'Location: MSAC Gaming VC on Tabletop Simulator' },
};

const HIATUS_EMBED = {
  fields: [{
    name: ':sleeping: Going on hiatus',
    value: 'React to receive the hiatus role and stop receiving notifications. You\'ll also be marked with this role if you haven\'t attended for four consecutive weeks since joining or since your last event. If circumstances change and you want to start coming regularly, you can always change your reaction here!',
    inline: false,
  }, {
    name: 'What does hiatus mean?',
    value: 'It lets us know you won\'t be attending regularly in the near future. You might have other stuff going on in life, you might have the time block already booked off, you might just not feel like playing these days.\n\nWhatever the case, don\'t hesitate to let us know! There\'s no judgment here, and there\'s no need to feel like you have to defend your choices to us - it\'s perfectly fine and normal!. You\'ll still be able to attend any individual event. Do let us know that you\'ve decided to come this week! React with the appropriate indicator in #event-schedule for next week\'s event!',
    inline: false,
  }],
  color: 2105893,
};

module.exports = {
  createEventEmbed,
  HIATUS_EMBED,
  EMOTE_LIST,
  EMOTE_ROLE_ID_LIST,
  EMOTE_TO_ROLE_ID,
  EVENT_EMBED_BASE,
  EVENT_POST_TIME,
  EVENT_SOON_NOTIFICATION,
  EVENT_TIME,
  ROLE_RESET_TIME,
};
