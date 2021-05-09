const asyncMutativeMap = async (itemList, asyncCallback) => {
  const promiseList = [];

  for (const item of itemList) {
    const promise = asyncCallback(item);
    promiseList.push(promise);
  }
  
  return Promise.all(promiseList);
};

const logError = (message, e) => {
  const date = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
  return console.log(`${date}: ${message}`, { e });
};

const logMessage = (message) => {
  const date = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
  return console.log(`${date}: ${message}`);
};

module.exports = {
  asyncMutativeMap,
  logError,
  logMessage,
};
