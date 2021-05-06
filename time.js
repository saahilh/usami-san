class Time {
  constructor(currentTime = new Date(), timezone = 'America/Toronto') {
    this.date = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
  }

  static get ONE_WEEK_MS() {
    return 86400000;
  }

  static get DAYS() {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  } 

  getDate() {
    return this.date;
  }

  getDateAsString(timezone = 'America/Toronto') {
    return this.date.toLocaleString('en-US', { timeZone: timezone });
  }

  advanceDay() {
    this.date.setDate(this.date.getDate() + 1);
  }

  advanceToHour(hour, minute = 0) {
    if (this.date.getHours() > hour) {
      this.advanceDay();
    }

    this.date.setHours(hour, minute, 0, 0);
    return this.date;
  }

  // Stays at current day if match
  advanceToDay(dayString) {
    const targetDayNum = Time.DAYS.indexOf(dayString.toLowerCase());

    while (this.date.getDay() !== targetDayNum) {
      this.advanceDay();
    }

    return this.date;
  }

  advanceToDate(dayString, timeString='00:00') {
    const [hour, minute] = timeString.split(':').map((num) => parseInt(num));
    this.advanceToHour(hour, minute);
    this.advanceToDay(dayString);
    return this.date;
  }

  getCurrentTime() {
    return new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
  }

  static queueCallbackForDate(callback, dayString, timeString = '00:00', repeatWeekly) {
    const originalTime = getCurrentTime();
    
    const targetTime = getCurrentTime();
    targetTime.advanceToDate(dayString, timeString);

    const timeToNextCallback = targetTime - originalTime;
    
    setTimeout(() => {
      setInterval(callback, Time.ONE_WEEK_MS);
      callback();
    }, timeToNextCallback);
  }
}

module.exports = Time;
