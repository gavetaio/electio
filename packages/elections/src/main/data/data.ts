/* eslint-disable no-continue */
/* eslint-disable import/prefer-default-export */

const fs = require('fs');

const getInfoFromFileName = (filename) => {
  const info = {
    id: filename.replace(/^([a-z]{2}-[0-9]{4}-[0-9]{1})(.*)/gim, '$1'),
    type: 'eleicao',
  };

  if (filename.match(/-cidades/)) {
    info.type = 'cidades';
  }

  if (filename.match(/-candidatos/)) {
    info.type = 'candidatos';
  }

  if (filename.match(/-boxes/)) {
    info.type = 'boxes';
  }

  return info;
};

export const loadFilesFromReg = ({ folder, callback, reg }) => {
  const path = `${folder}/outputs/data`;
  const list = fs.readdirSync(path);
  const result = {};
  let loaded = 0;
  let loading = 0;

  if (!list?.length) {
    callback(result);
    return;
  }

  const push = ({ data, type, id }) => {
    if (!result[id]) {
      result[id] = {};
    }
    if (!result[id][type]) {
      result[id][type] = {};
    }
    result[id][type] = data;

    loaded += 1;
    if (loaded === loading) {
      //
      callback(result);
    }
  };

  //
  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];
    if (!file.match(reg)) {
      continue;
    }

    loading += 1;
    const info = getInfoFromFileName(file);
    fs.readFile(`${path}/${file}`, { encoding: 'utf8' }, (err, content) => {
      push({ data: JSON.parse(content), ...info });
    });
  }

  if (!loading) {
    callback(result);
  }
};

export const loadFile = ({ folder, file, callback, reg }) => {
  const path = `${folder}/outputs/data/${file}`;
  const result = {
    data: null,
    ...getInfoFromFileName(file),
  };
  fs.readFile(`${path}/${file}`, { encoding: 'utf8' }, (err, content) => {
    result.data = JSON.parse(content);
    callback(result);
  });
};

export const loadElectionList = ({ folder, callback }) => {
  const path = `${folder}/outputs/data`;
  const list = fs.readdirSync(path);
  const result = { loaded: 0 };
  let loading = 0;

  if (!list?.length) {
    callback(result);
    return;
  }

  const push = ({ data, type, id }) => {
    if (!result[id]) {
      result[id] = {};
    }
    if (!result[id][type]) {
      result[id][type] = {};
    }
    result[id][type] = data;

    result.loaded += 1;
    if (result.loaded === loading) {
      //
      callback(result);
    }
  };

  //
  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];
    if (!file.match(/[a-z]{2}-[0-9]{4}-[0-9]{1}.json/gim)) {
      continue;
    }

    loading += 1;
    const info = getInfoFromFileName(file);
    fs.readFile(`${path}/${file}`, { encoding: 'utf8' }, (err, content) => {
      try {
        const parsed = JSON.parse(content);
        if (parsed?.situacao?.list) {
          parsed.situacao.list = null;
        }
        push({ data: parsed, ...info });
      } catch (e) {
        result.loaded += 1;
      }
    });
  }

  if (!loading) {
    callback(result);
  }
};
