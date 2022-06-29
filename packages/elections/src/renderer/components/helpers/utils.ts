export const objectToOrderedArray = (obj, labels) => {
  const keys = Object.keys(obj);
  const result = [];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    result.push({ [`${labels[0]}`]: key, [`${labels[1]}`]: obj[key] });
  }
  return result.sort((a, b) => b[labels[1]] - a[labels[1]]);
};

export const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

export const richObjectToArray = (obj, labels, prop) => {
  const cloned = deepClone(obj);
  const keys = Object.keys(cloned);
  const result = [];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    result.push({ [`${labels[0]}`]: key, [`${labels[1]}`]: cloned[key][prop] });
  }
  return result;
};

const VAGAS = {
  deputado_distrital: {
    DF: 24,
  },
  deputado_federal: {
    AC: 8,
    AL: 9,
    AM: 8,
    AP: 8,
    BA: 39,
    CE: 22,
    DF: 8,
    ES: 10,
    GO: 17,
    MA: 18,
    MG: 53,
    MS: 8,
    MT: 8,
    PA: 17,
    PB: 12,
    PE: 25,
    PI: 10,
    PR: 30,
    RJ: 46,
    RN: 8,
    RO: 8,
    RR: 8,
    RS: 31,
    SC: 16,
    SE: 8,
    SP: 70,
    TO: 8,
  },
  deputado_estadual: {
    AC: 24,
    AL: 27,
    AM: 24,
    AP: 24,
    BA: 63,
    CE: 46,
    DF: 24,
    ES: 30,
    GO: 41,
    MA: 42,
    MG: 77,
    MS: 24,
    MT: 24,
    PA: 41,
    PB: 36,
    PE: 49,
    PI: 30,
    PR: 54,
    RJ: 70,
    RN: 24,
    RO: 24,
    RR: 24,
    RS: 55,
    SC: 40,
    SE: 24,
    SP: 94,
    TO: 24,
  },
};
