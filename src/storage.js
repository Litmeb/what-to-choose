export const STORAGE_KEYS = {
  preferences: 'wtc.preferences.v1',
  history: 'wtc.history.v1',
};

export const defaultPreferences = {
  food: {
    budget: 28,
    tastes: ['清淡', '微辣'],
    healthy: true,
    avoid: '太油、太甜',
    favorites: '麻辣烫、盖浇饭、轻食、砂锅',
  },
  outfit: {
    style: '清爽休闲',
    formality: '日常上课',
    temperatureSensitivity: '正常',
    commonOutfits: '卫衣、长裤、运动鞋、薄外套',
  },
  study: {
    bestTime: '晚上',
    courses: '高数、英语、专业课、论文写作',
    habit: '先做紧急且难的任务，再处理轻量任务',
    routine: '23:30 前睡觉',
  },
  environment: {
    weather: '多云',
    temperature: 22,
    rain: '无雨',
  },
  reminders: {
    morning: '08:00',
    noon: '12:00',
    evening: '19:30',
    items: [
      { id: 'morning-outfit', actionLabel: '今天穿什么', kind: 'outfit', time: '08:00' },
      { id: 'noon-food', actionLabel: '今天吃什么', kind: 'food', time: '12:00' },
      { id: 'evening-study', actionLabel: '现在先学什么', kind: 'study', time: '19:30' },
    ],
  },
  other: {
    options: '散步 20 分钟\n整理书桌\n看一集轻松视频\n先完成最小的一件事',
    quickEntries: [],
    weights: {},
  },
};

export function loadPreferences() {
  return mergeDefaults(defaultPreferences, readJson(STORAGE_KEYS.preferences, {}));
}

export function savePreferences(preferences) {
  writeJson(STORAGE_KEYS.preferences, preferences);
}

export function loadHistory() {
  const history = readJson(STORAGE_KEYS.history, []);
  return Array.isArray(history) ? history : [];
}

export function saveHistory(history) {
  writeJson(STORAGE_KEYS.history, history);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app should remain usable even if storage is blocked.
  }
}

function mergeDefaults(defaultValue, savedValue) {
  if (!savedValue || typeof savedValue !== 'object' || Array.isArray(savedValue)) {
    return defaultValue;
  }

  return Object.fromEntries(
    Object.entries(defaultValue).map(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return [key, mergeDefaults(value, savedValue[key])];
      }
      return [key, savedValue[key] ?? value];
    })
  );
}
