const find = require("lodash/find");
const findIndex = require("lodash/findIndex");
const fs = require("fs");
const { LoggerSingleton } = require("../../log");
const { deepClone } = require("../../utils");

const { log } = LoggerSingleton.getInstance();
const FILE_OUTPUTS = "outputs/data";

export const pushUniqueBox = (box, boxes) => {
  const element = find(boxes, { id: box.id });
  const cloned = deepClone(box);
  if (!element) {
    boxes.push(cloned);
    return;
  }

  boxes[findIndex(boxes, { id: box.id })] = cloned;
};

export const getFromFile = (file) => {
  const fullpath = `${global.appFolder}/${FILE_OUTPUTS}/${file}`;
  if (!fs.existsSync(fullpath)) {
    return null;
  }

  const content = fs.readFileSync(fullpath, { encoding: "utf8" });

  if (content) {
    let result = null;
    try {
      result = JSON.parse(content);
    } catch (e) {
      throw "#991";
    }
    return result;
  }
  return null;
};

export const saveToFile = ({ data, filename }) => {
  const partials = [`${global.appFolder}/${FILE_OUTPUTS}`, filename.split("/")];

  let acc = "";
  for (let i = 0; i < partials.length - 1; i += 1) {
    acc += i === 0 ? partials[i] : `/${partials[i]}`;
    try {
      fs.mkdirSync(acc);
    } catch (e) {}
  }

  const content = JSON.stringify(data);

  fs.writeFileSync(
    `${global.appFolder}/${FILE_OUTPUTS}/${filename}`,
    content,
    "utf8"
  );
};

export const saveFiles = (list) => {
  if (!list || !list.length) {
    return false;
  }

  list.forEach(({ object, name }) => {
    log(["SAVING FILE", `${name}.json`], {
      system: true,
    });
    saveToFile({
      data: object,
      filename: `${name}.json`,
    });

    log("SAVED", { emoji: "☑️ " });
  });
};

export const refactorObject = (object, removed = []) => {
  const keys = Object.keys(object);
  const result = {};
  keys.forEach((key) => {
    if (removed.indexOf(key) === -1) {
      result[key] = object[key];
    }
  });
  return result;
};

export const customObjectToOrderedArray = (obj, names, limit = 100) => {
  const cloned = deepClone(obj);

  const recursively = (obj) => {
    const keys = Object.keys(obj);
    let list = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const value = obj[key];
      if (typeof value === "object") {
        list = recursively(value);
      }
      if (typeof value !== "object") {
        list.push({
          [`${names[0]}`]: key,
          [`${names[1]}`]: value,
        });
      }
      if (list) {
        obj[key] = {
          total: list.length,
          list: list.sort((a, b) => b[names[1]] - a[names[1]]).slice(0, limit),
        };
      }
    }
    return list;
  };

  recursively(cloned);
  return cloned;
};
