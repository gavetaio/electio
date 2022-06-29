const fs = require("fs");
const { getBoxHeaders } = require("./eleicoes/helpers");
const { LoggerSingleton } = require("./log");
const {
  SPLIT_THRESHOLD,
  PARTIALS_FOLDER,
  IGNORED,
  USED_ROWS,
  ORIGINAL_FILES_FOLDER,
} = require("./constants");

const { log } = LoggerSingleton.getInstance();

export const getFromTXTStream = (file, header, election, setScope) => {
  let turno = null;

  if (file.match(/1t/gim)) {
    turno = "1";
  }
  if (file.match(/2t/gim)) {
    turno = "2";
  }

  return new Promise(async (resolve) => {
    let result = [];
    const info = {
      last: "",
      header: null,
      params: header,
      turno,
    };

    const transformed = await streamFile(
      `${global.appFolder}/${ORIGINAL_FILES_FOLDER}/${file}`,
      result,
      info,
      election,
      setScope
    );

    resolve(transformed);
  });
};

const getFilename = (prefix, index) => {
  const number = index > 9 ? `${index}` : `0${index}`;
  return `${global.appFolder}/${PARTIALS_FOLDER}/${prefix}-${number}.json`;
};

const getHeaderInfo = (result) => {
  let header = null;
  const firstRow = result[0].replace(/"/gim, "");
  if (!firstRow.match(/(^[a-z_]{4,6})(.*)?/gim)) {
    return header;
  }
  header = sanitizeLineFromClearStringRaw(result[0]);
  return header.map((label) => {
    return label.replace(/\s+/, "").replace(/#NULO#|#NE/gim, "");
  });
};

const splitLineFromRaw = (raw) => {
  return raw.replace(/";"/gim, "|").replace(/"/gim, "").split("|");
};

const whichSanitization = (raw) => {
  const raw_1 = raw.split(";");
  const raw_2 = raw.split('";"');

  if (raw_1.length === raw_2.length) {
    return sanitizeLineFromStringRaw;
  }

  return sanitizeLineFromIntRaw;
};

const sanitizeLineFromRaw = (raw) => {};

const sanitizeLineFromStringRaw = (raw) => {
  let result = raw.replace(/\|/gim, "");
  result = result.replace(/";"/gim, "|");
  result = result.replace(/;/gim, "");
  result = result.replace(/#NULO#|#NE/gim, "-1");
  result = result.replace(/"/gim, "");
  result = result.split("|");
  return result;
};

const sanitizeLineFromIntRaw = (raw) => {
  let result = raw.replace(/\|/gim, "");
  result = result.replace(/"/gim, "");
  result = result.replace(/#NULO#|#NE/gim, "-1");
  result = result.split(";");

  return result;
};

const sanitizeLineFromClearStringRaw = (raw) => {
  let result = raw.replace(/\|/gim, "");
  result = result.replace(/"/gim, "");
  result = result.split(";");
  return result;
};

const getHeader = (header, line) => {
  if (header) {
    return header;
  }

  if (line.length === 32) {
    line.splice(19, 1);
  }

  if (line.length === 32) {
  }

  if (line.length === 31) {
    if (!turno || (turno != 1 && turno != 2)) {
      throw "#9837";
    }

    return {
      ANO_ELEICAO: ano,
      NR_TURNO: turno,
      SG_UF: data[4],
      NR_ZONA: data[7],
      NR_SECAO: data[8],
      CD_MUNICIPIO: data[12],
      NR_VOTAVEL: data[21],
      NM_VOTAVEL: `${data[6]}-${data[21]}`,
      NR_URNA_EFETIVADA: data[25],
      QT_VOTOS: data[23],
      CD_TIPO_VOTAVEL: data[24],
      NM_MUNICIPIO: data[13],
      NR_PARTIDO: data[10],
      CD_CARGO_PERGUNTA: data[5],
      DS_CARGO_PERGUNTA: data[6],
      DS_TIPO_URNA: data[20],
      QT_COMPARECIMENTO: data[17],
      QT_APTOS: data[15],
      NR_LOCAL_VOTACAO: data[9],
    };

    return [
      "DATA_GERACAO",
      "HORA_GERACAO",
      "ANO_ELEICAO",
      "NUM_TURNO",
      "DESCRICAO_ELEICAO",
      "SIGLA_UF",
      "SIGLA_UE",
      "CODIGO_MUNICIPIO",
      "NOME_MUNICIPIO",
      "NUMERO_ZONA",
      "NUMERO_SECAO",
      "CODIGO_CARGO",
      "DESCRICAO_CARGO",
      "QTD_APTOS",
      "QTD_COMPARECIMENTO",
      "QTD_ABSTENCOES",
      "QT_VOTOS_NOMINAIS",
      "QT_VOTOS_BRANCOS",
      "QT_VOTOS_NULOS",
      "QT_VOTOS_LEGENDA",
      "QT_VOTOS_ANULADOS_APU_SEP",
    ];
  }

  if (line.length === 15) {
  }

  if (line.length === 12 || line.length === 13) {
  }
};

const transformLineFromRaw = (original, line, header, turno, force = false) => {
  if (header) {
    return transformWithHeader(original, line, header, force, turno);
  }

  if (line.length === 32) {
    line.splice(19, 1);
  }

  if (line.length === 31) {
    if (!turno || (turno != 1 && turno != 2)) {
      throw "#98768";
    }
    return transform31(original, line, turno);
  }

  if (line.length === 15) {
    return transform15(original, line);
  }

  if (line.length === 12 || line.length === 13) {
    return transform12(original, line, turno);
  }

  throw "#0789";
};

const getPrefix = (item, file, params) => {
  if (file.match(/votacao_secao_[0-9]{4}_BR/)) {
    const year = file.replace(/^(.*)votacao_secao_([0-9]{4})_BR(.*)/gim, "$2");

    return `PRESIDENTE-${year}-${item.NR_TURNO}`;
  }

  if (!item) {
    return null;
  }

  const uf = params.uf || item.SG_UF;

  if (item.NR_URNA_ESPERADA) {
    const ANO =
      item.ANO_ELEICAO ||
      item.DT_CARGA_URNA_ESPERADA.replace(/.*\/([0-9]{4}).*/gim, "$1");
    return `CESC-${uf}-${ANO}`;
  }

  if (item.CD_SITUACAO_LEGENDA && item.DS_SITUACAO) {
    return `COLIGACAO-${uf}-${item.ANO_ELEICAO}`;
  }

  if (item.SQ_COLIGACAO) {
    return `CANDIDATO-${uf}-${item.ANO_ELEICAO}`;
  }

  return `${uf}-${item.ANO_ELEICAO}-${item.NR_TURNO}`;
};

const createPartial = (filename, data) => {
  const name = filename.replace(/^(.*)\/(.*)$/gim, "$2");
  log(["CREATING PARTIAL", name], {
    emoji: "⌛",
    stdout: true,
  });

  fs.writeFileSync(filename, JSON.stringify(data), "utf8");

  log(["CREATED", name], {
    emoji: "☑️ ",
  });
};

const transformRawLine = ({ raw, sanitized, header, turno }) => {
  if (sanitized.length < 3) {
    return null;
  }
  return transformLineFromRaw(raw, sanitized, header, turno);
};

const transform31 = (original, data, turno = "1") => {
  const ano = data[14].match(/[0-9]{4}/gim)
    ? data[14].replace(/(.*)([0-9]{4})(.*)/gim, "$2")
    : data[14].replace(/(.*)(-)([0-9]{2})$/gim, "20$3");
  const CD_ELEICAO = data[3];
  let DS_ELEICAO = "ELEICAO ORDINARIA";

  if (CD_ELEICAO === "50" || CD_ELEICAO === "185") {
    return null;
  }

  if (
    CD_ELEICAO !== "47" &&
    CD_ELEICAO !== "48" &&
    CD_ELEICAO !== "220" &&
    CD_ELEICAO !== "221" &&
    CD_ELEICAO !== "143" &&
    CD_ELEICAO !== "144"
  ) {
    throw "#6789";
  }

  return {
    ANO_ELEICAO: ano,
    NR_TURNO: turno,
    SG_UF: data[4],
    NR_ZONA: data[7],
    DS_ELEICAO,
    NR_SECAO: data[8],
    CD_MUNICIPIO: data[12],
    NR_VOTAVEL: data[21],
    NM_VOTAVEL: `${data[6]}-${data[21]}`,
    NR_URNA_EFETIVADA: data[25],
    QT_VOTOS: data[23],
    CD_TIPO_VOTAVEL: data[24],
    NM_MUNICIPIO: data[13],
    NR_PARTIDO: data[10],
    CD_CARGO_PERGUNTA: data[5],
    DS_CARGO_PERGUNTA: data[6],
    DS_TIPO_URNA: data[20],
    QT_COMPARECIMENTO: data[17],
    QT_APTOS: data[15],
    NR_LOCAL_VOTACAO: data[9],
  };
};

const transformWithHeader = (original, data, header, force, turno) => {
  let result = {};
  let is_cesc = false;
  let is_colig = false;
  for (let i = 0; i < header.length; i += 1) {
    const label = header[i];
    const info = data[i];
    if (label.match(/ESPERADA/gim)) {
      is_cesc = true;
    }
    if (label.match(/COLIGAC/gim)) {
      is_colig = true;
    }
    if (label === "DS_ELEICAO" && info && info.match(IGNORED) && !force) {
      return null;
    }
    if (USED_ROWS.indexOf(label) !== -1) {
      result[label] = info;
    }
  }

  if (is_cesc && !result.NR_TURNO) {
    result.NR_TURNO = turno;
  }

  if (!result.QT_VOTOS && !is_cesc && !is_colig) {
    throw "#879689";
  }

  return result;
};

const transform12 = (original, data, turno) => {
  const result = {
    ANO_ELEICAO: data[0].split("/")[2],
    NR_TURNO: turno,
    NR_ZONA: data[6],
    SG_UF: data[3],
    NR_SECAO: data[7],
    CD_MUNICIPIO: data[4],
    NM_MUNICIPIO: data[5],
    NR_URNA_ESPERADA: data[8],
  };

  return result;
};

const transform15 = (original, data) => {
  const NR_PARTIDO = data[13].replace(/^([0-9]{2})(.*)/gim, "$1");
  const NM_VOTAVEL = `${data[12]}-${data[13]}`;
  const NR_VOTAVEL = data[13];
  const DS_ELEICAO = data[4];

  if (DS_ELEICAO.match(IGNORED)) {
    return null;
  }

  let CD_TIPO_VOTAVEL = "1";

  if (
    NR_VOTAVEL.length === 2 &&
    !NR_VOTAVEL.match(/^(95|96|97)$/gim) &&
    data[12].match(/deputado/gim)
  ) {
    CD_TIPO_VOTAVEL = "4";
  }

  if (NR_VOTAVEL === "95") {
    CD_TIPO_VOTAVEL = "2";
  }
  if (NR_VOTAVEL === "96") {
    CD_TIPO_VOTAVEL = "3";
  }

  const CD_MUNICIPIO = data[6] && data[6].length > 2 ? data[6] : data[7];

  const result = {
    ANO_ELEICAO: data[2],
    NR_TURNO: data[3],
    NR_ZONA: data[9],
    SG_UF: data[5],
    NR_SECAO: data[10],
    CD_MUNICIPIO,
    NR_VOTAVEL,
    NM_VOTAVEL,
    DS_ELEICAO,
    QT_VOTOS: data[14],
    NM_MUNICIPIO: data[8],
    NR_PARTIDO,
    CD_TIPO_VOTAVEL,
    CD_CARGO_PERGUNTA: data[11],
    DS_CARGO_PERGUNTA: data[12],
    DS_TIPO_URNA: "Apurada",
  };

  return result;
};

export const streamFile = (file, result, info, populate, setScope) => {
  return new Promise((resolve) => {
    let partials = 0;
    fs.createReadStream(`${file}`, {
      encoding: "latin1",
    })
      .on("data", (partial) => {
        const lines = (info.last + partial).replace(/\r/gim, "").split("\n");

        if (result.length === 0 && lines.length <= 2) {
          return;
        }

        const sanitize = whichSanitization(lines[lines.length - 2]);

        info.last = "";

        if (!info.checkHeader) {
          info.header = getHeaderInfo(lines);
          if (info.header) {
            lines.shift();
          }
          info.checkHeader = true;
        }

        if (!info.prefix) {
          const sanitized = transformLineFromRaw(
            "",
            sanitize(lines[2]),
            info.header,
            info.turno,
            true
          );
          info.prefix = getPrefix(sanitized, file, info.params);
        }

        if (result.length > SPLIT_THRESHOLD) {
          partials += 1;
          const filename = getFilename(info.prefix, partials);
          createPartial(filename, result);
          const newResult = [];
          result = newResult;
        }

        for (let i = 0; i < lines.length - 1; i += 1) {
          const line = transformRawLine({
            raw: lines[i],
            sanitized: sanitize(lines[i]),
            header: info.header,
            turno: info.turno,
          });

          if (line && line.SG_UF && line.SG_UF === "BR") {
            setScope(line);
          }

          if (
            !line ||
            line.SG_UF !== info.params.uf ||
            info.params.uf === "BR"
          ) {
            continue;
          }

          result.push(line);
        }

        if (!info.size) {
          if (!lines.length > 1 || !lines[lines.length - 2]) {
            return;
          }

          info.size = splitLineFromRaw(lines[lines.length - 2]).length;
        }

        const last = lines[lines.length - 1];
        const lastSplit = splitLineFromRaw(last);
        const lastLength = lastSplit.length;

        if (lastLength !== info.size) {
          info.last = last;
        } else {
          const final = lastSplit[lastLength - 1];

          if (final.match(/"/gim)) {
            const double = final.split('"').length;
            if (double !== 3) {
              info.last = last;
            } else {
              result.push(
                transformRawLine({
                  raw: last,
                  sanitized: sanitize(last),
                  header: info.header,
                  turno: info.turno,
                })
              );
              info.last = "";
            }
          } else if (final.match(/^[0-9]{1,4}$/)) {
            if (final.length === 4) {
              result.push(
                transformRawLine({
                  raw: last,
                  sanitized: sanitize(last),
                  header: info.header,
                  turno: info.turno,
                })
              );
              info.last = "";
            } else {
              info.last = last;
            }
          } else {
            info.last = last;
          }
        }
      })
      .on("end", () => {
        if (result.length > 0) {
          partials += 1;
          const filename = getFilename(info.prefix, partials);

          createPartial(filename, result);
        }

        log(
          [
            `STREAMED ${file.replace(/^(.*)\/(.*)$/gim, "$2").toUpperCase()}`,
            result.length,
          ],
          {
            emoji: "☑️ ",
          }
        );

        result = null;
        resolve(getRawFromPartials(info.prefix, populate));
      });
  });
};

export const getRawFromPartials = (prefix, populate) => {
  const list = fs.readdirSync(`${global.appFolder}/${PARTIALS_FOLDER}`);
  const reg = new RegExp(`${prefix}`, "mig");

  for (let i = 0; i < list.length; i += 1) {
    if (list[i].match(reg)) {
      const data = JSON.parse(
        fs.readFileSync(`${global.appFolder}/${PARTIALS_FOLDER}/${list[i]}`)
      );

      data.forEach((item) => {
        try {
          populate(item);
        } catch (e) {}
      });

      log(["READ PARTIAL", list[i]], {
        emoji: "☑️ ",
      });
    }
  }

  return true;
};

export const clearFolder = (folder) => {
  const list = fs.readdirSync(folder);

  for (let i = 0; i < list.length; i += 1) {
    fs.unlink(`${folder}/${list[i]}`, () => {});
  }
};

export const getHeadersFromRaw = (data) => {
  const { UF, ANO } = getBoxHeaders(data);

  return {
    uf: UF,
    ano: ANO,
  };
};

export const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

export const getDataFromFiles = async (files, header, election, setScope) => {
  for (let i = 0; i < files.length; i += 1) {
    await getFromTXTStream(files[i], header, election, setScope);
  }

  return true;
};
