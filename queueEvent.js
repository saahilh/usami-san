require('dotenv').config();
const { Client } = require('discord.js');
const { EVENT_POST_TIME, EVENT_SOON_NOTIFICATION} = require('./src/eventConstants');
const ClientInterface = require('./src/ClientInterface');
const Time = require('./src/Time');

const interface = new ClientInterface(new Client());

// TODO: add unit tests
// TODO: clear carlbot notifications & reactions when this is done
// TODO: have bot message you when error occurs
// TODO: implement functionality to mark users as inactive if they haven't attended for 4 weeks

Time.queueWeeklyCallbackForDate(interface.postEvent, EVENT_POST_TIME);
Time.queueWeeklyCallbackForDate(interface.sendEventSoonNotification, EVENT_SOON_NOTIFICATION.TIME);
