require('dotenv').config();
const { Client } = require('discord.js');
const { EVENT_POST_TIME, EVENT_SOON_NOTIFICATION} = require('./src/eventConstants');
const ClientInterface = require('./src/ClientInterface');
const Time = require('./src/Time');

const interface = new ClientInterface(new Client());

Time.queueWeeklyCallbackForDate(interface.postEvent, EVENT_POST_TIME);
Time.queueWeeklyCallbackForDate(interface.sendEventSoonNotification, EVENT_SOON_NOTIFICATION.TIME);
