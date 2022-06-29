const unzipper = require('unzipper');
const fs = require('fs');

const FEDERAL = [
  '1989',
  '1994',
  '1998',
  '2002',
  '2006',
  '2010',
  '2014',
  '2018',
  '2022',
  '2024',
  '2028',
];

const federalReg = new RegExp(FEDERAL.join('|'), 'mig');

module.exports.unzipFile = (folder, path, UF) => {
  const dir = `${folder}/outputs/files`;

  const files = [];
  return new Promise((resolve) => {
    fs.createReadStream(path)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        const fileName = entry.path;
        const isFederal = fileName.match(federalReg);
        const location = isFederal ? 'BRASIL' : UF;
        const reg = new RegExp(
          `(consulta_coligacao_[0-9]{4}_${location}|consulta_cand_[0-9]{4}_${location}|csec_|votacao_secao|bweb_).*\.(csv|txt)`,
          'mig'
        );
        if (fileName.match(reg)) {
          entry.pipe(fs.createWriteStream(`${dir}/${fileName}`));
          files.push(fileName);
        } else {
          entry.autodrain();
        }
      })
      .on('finish', () => {
        resolve(files);
      })
      .on('error', () => {});
  });
};

const getFilesFromList = (list, fromArray = false) => {
  return new Promise((resolve) => {
    const result = [];
    let loading = 0;
    let loaded = 0;

    const push = (data) => {
      if (fromArray) {
        result.push(...data);
      } else {
        result.push(data);
      }

      if (loaded === loading) {
        resolve(result);
      }
    };

    for (let i = 0; i < list.length; i += 1) {
      const file = list[i];
      loading += 1;
      fs.readFile(file, { encoding: 'utf8' }, (err, content) => {
        loaded += 1;
        push(JSON.parse(content));
      });
    }
  });
};

module.exports.getList = ({ folder, callback, years = [] }) => {
  const path = `${folder}/outputs/data`;
  const list = fs.readdirSync(path);

  const result = [];
  let loading = 0;

  if (!list?.length) {
    callback(result);
    return;
  }

  const push = (data) => {
    result.push(data);
    if (result.length === loading) {
      callback(result);
    }
  };

  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];
    if (!file.match(/json/gim) || file.match(/box/gim)) {
      continue;
    }

    const year = file.replace(/(.*)?([0-9]{4})(.*)?/gim, '$2');

    if (years?.length) {
      if (years.indexOf(year) === -1) {
        continue;
      }
    }

    loading += 1;
    fs.readFile(`${path}/${file}`, { encoding: 'utf8' }, (err, content) => {
      push(JSON.parse(content));
    });
  }

  if (!loading) {
    callback(result);
  }
};

module.exports.getJsons = ({ folder, callback }) => {
  const path = `${folder}/outputs/data`;
  const list = fs.readdirSync(path);

  const result = [];

  if (!list?.length) {
    callback(result);
    return;
  }

  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];

    if (!file.match(/^[a-z]{2}-[0-9]{4}/gim)) {
      continue;
    }

    const stats = fs.statSync(`${path}/${file}`);
    result.push({
      name: file,
      path: `${path}/${file}`,
      size: stats.size,
      time: stats.mtimeMs,
    });
  }

  callback(result);
};

module.exports.getBoxes = ({ folder, callback, years = [] }) => {
  const path = `${folder}/outputs/data`;
  const list = fs.readdirSync(path);

  const result = [];
  let loading = 0;
  let loaded = 0;

  if (!list?.length) {
    callback(result);
    return;
  }

  const push = (data) => {
    result.push(...data);

    if (loaded === loading) {
      callback(result);
    }
  };

  for (let i = 0; i < list.length; i += 1) {
    const file = list[i];
    if (!file.match(/json/gim) || !file.match(/^boxes/gim)) {
      continue;
    }

    const year = file.replace(/(.*)?([0-9]{4})(.*)?/gim, '$2');

    if (years?.length) {
      if (years.indexOf(year) === -1) {
        continue;
      }
    }

    loading += 1;

    fs.readFile(`${path}/${file}`, { encoding: 'utf8' }, (err, content) => {
      const parsed = JSON.parse(content);
      loaded += 1;
      if (parsed?.length) {
        push(parsed);
      }
    });
  }
  if (!loading && !loaded) {
    callback(result);
  }
};
