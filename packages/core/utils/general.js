export const stripSpecial = (str) => {
  const txt = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s]+/gim, '')
    .toLowerCase();
  return txt;
};

export const forEachList = (list, callback) => {
  if (!list) {
    return;
  }

  const keys = Object.keys(list);
  if (!keys?.length) {
    return;
  }
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    callback(key, list[key]);
  }
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const forEachListBreakable = (list, callback) => {
  if (!list) {
    return;
  }
  const keys = Object.keys(list);
  if (!keys?.length) {
    return;
  }
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (callback(key, list[key])) {
      break;
    }
  }
};

export const arrayMax = (list) => {
  return Math.max.apply(null, list);
};

export const arrayMin = (list) => {
  return Math.min.apply(null, list);
};

export const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

export function arrayUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export function arrayFilterUnique(list) {
  return list.filter(arrayUnique);
}

export function getOtherBox(box, boxes) {
  const { id } = box;

  if (!id) {
    return null;
  }

  const otherTurno = box.turno === '1' ? '2' : '1';
  const reg = new RegExp(`^([a-z]{2}-[0-9]{4})(-${box.turno}-)`, 'mig');
  const otherId = id.replace(reg, `$1-${otherTurno}-`);
  let otherBox = null;

  if (Array.isArray(boxes)) {
    otherBox = boxes.find((other) => other.id === otherId);
  } else if (typeof boxes === 'object') {
    otherBox = boxes[otherId];
  }

  return otherBox || null;
}

export const isEmptyObject = (obj) => {
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys?.length) {
      return false;
    }
  }
  return true;
};

export const roundTwo = (num) => {
  return Math.round(num * 100) / 100;
};

export const roundOne = (num) => {
  return Math.round(num * 10) / 10;
};

export const roundThree = (num) => {
  return Math.round(num * 1000) / 1000;
};

export const pushUnique = (array, item) => {
  if (array.indexOf(item) === -1) {
    array.push(item);
  }
};

export const shuffleList = (array) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const unique = (array) => {
  return [...new Set(array)];
};

export const sumObject = (obj, prop, sum) => {
  if (!obj[prop]) {
    obj[prop] = 0;
  }
  if (sum && typeof sum === 'number') {
    obj[prop] += sum;
  }
};

export const getPercentage = (a, b) => {
  if (a && b) {
    return ((a * 100) / b).toFixed(1);
  }
  return 0;
};

export const getPercentageString = (a, b) => {
  return `${getPercentage(a, b)}%`.replace(/\./, ',');
};

export const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

export const sanitizeName = (name) => {
  return name
    .toLowerCase()
    .replace(/[\s]+/gim, '_')
    .replace(/[aâàáã]+/gim, 'a')
    .replace(/[eêèé]+/gim, 'e')
    .replace(/[iíì]+/gim, 'i')
    .replace(/[óóõo]+/gim, 'o')
    .replace(/[ùúu]+/gim, 'u');
};

export const getDeviationInfo = (array) => {
  const { length } = array;
  const mean = array.reduce((a, b) => a + b, 0) / length;
  const variance =
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / length;
  const deviation = Math.sqrt(variance);
  const av = average(array.map((x) => Math.abs(mean - x) / deviation));
  const error = deviation / Math.sqrt(length);
  const z = array.map((x) => (x - mean) / deviation);

  return {
    mean,
    deviation,
    average: av,
    z,
    error,
    variance,
  };
};
