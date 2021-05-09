class Time {
  constructor(dayString, timeString='00:00') {
    this.date = new Date();
    
    if (dayString) {
      this.advanceToDate(dayString, timeString);
    }

    return this.date;
  }

  advanceToDate(dayString, timeString='00:00') {
    const [hour, minutes] = timeString.split(':').map((num) => parseInt(num));

    const hourHasPassedToday = this.date.getHours() > hour;
    const minutesHavePassedToday = this.date.getMinutes() > minutes;
    if (hourHasPassedToday && minutesHavePassedToday) {
      // Advance day
      this.date.setDate(this.date.getDate() + 1);
    }

    this.date.setHours(hour, minutes, 0, 0);

    const targetDayNum = Time.DAYS.indexOf(dayString.toLowerCase());
    while (this.date.getDay() !== targetDayNum) {
      // Advance day
      this.date.setDate(this.date.getDate() + 1);
    }

    return this.date;
  }

  static getTimeToDate(dayString, timeString = '00:00') {
    const currentTime = new Date();
    const targetTime = new Time(dayString, timeString);
    return targetTime - currentTime;
  }

  static queueWeeklyCallbackForDate(callback, dayString, timeString = '00:00') {
    const timeToNextCallback = Time.getTimeToDate(dayString, timeString);

    setTimeout(() => {
      // Creates a weekly interval for the callback
      setInterval(callback, Time.ONE_WEEK_MS);
      callback();
    }, timeToNextCallback);
  }


  static get ONE_WEEK_MS() {
    return 86400000;
  }

  static get DAYS() {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  } 
}

module.exports = Time;
