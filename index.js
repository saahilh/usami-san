require('dotenv').config();
const { Client } = require('discord.js');

const client = new Client();

// const notificationTime = {
//   year: 2021,
//   month: 4,
//   day: 5,
//   hours: 19,
// };

// const { year, month, day, hours } = notificationTime;
// const messageTime = new Date(year, month, day, hours);


const getNextDay() {
  const 
}

const days = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

// TODO: get date of next Wednesday @ 19:00 to send the notification then instead of manually updating days

const eventPostTime = new Date('5 May, 2021 19:00:00');
const timeToEventPosted = eventPostTime - Date.now();

const eventEmbed = {
  "color": 0,
  "title": ":game_die: BOARD GAME NIGHT :game_die: ",
  "url": "https://store.steampowered.com/app/286160/Tabletop_Simulator/",
  "author": {
    "name": "Get Tabletop Simulator here",
    "icon_url": "https://pbs.twimg.com/profile_images/1368668417549557761/cwmgoiJ2.png ",
  },
  "description": "Weekly board game night. React to let us know if you'll be there this weekend. It gives us something more to look forward to this weekend!\n\n**React in #about to let us know if you can make it!**",
  "thumbnail": { "url": "https://i.imgur.com/chqFIZn.png" },
  "image": { "url": "https://animananimedotcom.files.wordpress.com/2017/04/mpv-shot00014.jpg?w=636" },
  "timestamp": eventPostTime,
  "footer": { "text": "Location: MSAC Gaming VC on Tabletop Simulator" },
};

// const channel =...
// channel.send({ embed: eventEmbed });

console.log({ timeToMessage });
client.login(process.env.DISCORD_BOT_TOKEN);
