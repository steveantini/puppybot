const KEYS = {
  PUPPY: 'puppybot_puppy',
  LOGS: 'puppybot_logs',
  HEALTH: 'puppybot_health',
};

export function getPuppy() {
  const data = localStorage.getItem(KEYS.PUPPY);
  return data ? JSON.parse(data) : null;
}

export function savePuppy(puppy) {
  localStorage.setItem(KEYS.PUPPY, JSON.stringify(puppy));
}

export function getAllLogs() {
  const data = localStorage.getItem(KEYS.LOGS);
  return data ? JSON.parse(data) : {};
}

export function getDayLog(date) {
  const logs = getAllLogs();
  return logs[date] || createEmptyDayLog(date);
}

export function saveDayLog(date, dayLog) {
  const logs = getAllLogs();
  logs[date] = dayLog;
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

export function createEmptyDayLog(date) {
  return {
    date,
    wakeUpTimes: [],
    bedTime: null,
    pottyBreaks: [],
    naps: [],
    meals: [],
    skills: '',
    notes: '',
  };
}

export function getHealthRecords() {
  const data = localStorage.getItem(KEYS.HEALTH);
  return data ? JSON.parse(data) : [];
}

export function saveHealthRecords(records) {
  localStorage.setItem(KEYS.HEALTH, JSON.stringify(records));
}
