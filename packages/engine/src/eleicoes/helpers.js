const { getSituationStale, getSituationSimplified } = require("../situations");

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

export const objectToArray = (obj) => {
  const keys = Object.keys(obj);
  return keys.map((key) => obj[key]);
};

export const getMissingCandidates = ({ box, candidatos }) => {
  const missing = [];
  const validos = box.validos;

  if (!validos || !validos.length || !candidatos || !candidatos.length) {
    return null;
  }

  for (let i = 0; i < candidatos.length; i += 1) {
    const candidato = candidatos[i];
    let didVote = false;
    for (let j = 0; j < validos.length; j += 1) {
      const vote = validos[j];
      if (candidato === vote.nome) {
        didVote = true;
      }
    }
    if (!didVote) {
      missing.push(candidato);
    }
  }

  return missing;
};

export const getBallotTree = ({ path, scope = null }) => {
  if (scope === null) {
    return {
      treeString: path,
      tree: path.split("."),
    };
  }
  return {
    treeString: `cidades.${scope}.${path}`,
    tree: ["cidades", scope, ...path.split(".")],
  };
};

const CARGO_NOME = {
  1: "presidente",
  3: "governador",
  5: "senador",
  6: "deputado_federal",
  7: "deputado_estadual",
  11: "",
};

const getColigacao = (SQ_COLIGACAO, PARTIDO) => {
  if (SQ_COLIGACAO === -1 || SQ_COLIGACAO === "-1") {
    return PARTIDO;
  }
  const length = `${SQ_COLIGACAO}`.length;

  if (length < 4) {
    let coligacao = "";
    for (let i = 0; i < length; i += 1) {
      coligacao += "0";
    }
    return `${coligacao}${SQ_COLIGACAO}`;
  }

  return SQ_COLIGACAO;
};

export const getCargoFromData = ({
  DS_CARGO_PERGUNTA,
  DS_CARGO,
  CD_CARGO_PERGUNTA,
}) => {
  const cargo = getSanitizedString(DS_CARGO_PERGUNTA || DS_CARGO || "");

  if (!cargo && CD_CARGO_PERGUNTA) {
    return CARGO_NOME[CD_CARGO_PERGUNTA] || "";
  }
  if (cargo.match(/suplente/gim)) {
    return `senador_${cargo.replace(/º/gim, "")}`;
  }
  return cargo;
};

export const forEachList = (list, callback) => {
  if (!list) {
    return;
  }
  const keys = Object.keys(list);
  if (!keys?.length) {
    return null;
  }
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const res = callback(key, list[key]);
  }
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

export const getDeviationInfo = (array) => {
  const length = array.length;
  const mean = array.reduce((a, b) => a + b, 0) / length;
  const deviation = Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / length
  );
  const error = deviation / Math.sqrt(length);

  return {
    mean,
    deviation,
    error,
  };
};

export const getNumber = (number) => {
  if (typeof number === "string") {
    if (number === "-1") {
      return null;
    }
    return parseInt(number, 10) || 0;
  }
  if (typeof number === "number") {
    return number;
  }
  return null;
};

const getSanitizedString = (str) => {
  return str.toLowerCase().trim().replace(/\s|-/gim, "_");
};

const getNumeroPartido = ({ NR_PARTIDO, NUMERO }) => {
  if (NR_PARTIDO) {
    return NR_PARTIDO;
  }
  if (NUMERO?.match(/-/)) {
    return NUMERO.splt("-")[1].slice(0, 2);
  }
  if (!NUMERO) {
    return "00";
  }
  return NUMERO.slice(0, 2);
};

const getFieldData = (data) => {
  if (!data || data === "-" || data === "-1") {
    return null;
  }
  if (data === "#NULO#" || data === "#NE") {
    return null;
  }
  return `${data}`.trim();
};

const getFieldStringData = (data) => {
  if (!data || data === "-" || data === "-1") {
    return "";
  }
  if (data === "#NULO#" || data === "#NE") {
    return "";
  }
  return `${data}`.trim();
};

const getSitTotTurno = (resultado, cargo) => {
  if (resultado.match(/^n[aã]o(.*)eleito$/gim)) {
    return 4;
  }

  if (resultado.match(/^suplente$/gim)) {
    return 5;
  }

  if (resultado.match(/^eleito$/gim)) {
    if (cargo.match(/deputado|vereador/gim)) {
      return 2;
    }
    return 1;
  }

  if (resultado.match(/^eleito(.*)qp$/gim)) {
    return 2;
  }

  if (
    resultado.match(/^eleito(.*)m[ée]dia$/gim) ||
    resultado.match(/m[ée]dia/gim)
  ) {
    return 3;
  }

  return 9;
};

export const getBoxHeaders = (data, uf = null, federal = null) => {
  const {
    DS_ELEICAO,
    ANO_ELEICAO,
    CD_MUNICIPIO,
    NR_ZONA,
    NR_TURNO,
    NR_SECAO,
    NR_VOTAVEL,
    QT_VOTOS,
    NR_PARTIDO,
    DS_CARGO,
    DS_CARGO_PERGUNTA,
    DS_TIPO_URNA,
    CD_TIPO_VOTAVEL,
    NM_MUNICIPIO,
    CD_TIPO_ELEICAO,
    QT_COMPARECIMENTO,
    QT_APTOS,
    NR_URNA_EFETIVADA,
    DT_ABERTURA,
    DT_ENCERRAMENTO,
    QT_ELEITORES_BIOMETRIA_NH,
    NM_URNA_CANDIDATO,
    NR_JUNTA_APURADORA,
    NR_LOCAL_VOTACAO,
    NR_URNA_ESPERADA,
    DT_CARGA_URNA_ESPERADA,
    SQ_COLIGACAO,
    NR_CANDIDATO,
    SG_UE,

    CD_SIT_TOT_TURNO,
    CD_CARGO_PERGUNTA,
    CD_GENERO,
    CD_COR_RACA,
    NR_IDADE_DATA_POSSE,
    CD_GRAU_INSTRUCAO,
    DS_SITUACAO_CANDIDATO_URNA,
    DS_SITUACAO_CANDIDATO_PLEITO,
    DS_SITUACAO_CANDIDATURA,
    DS_DETALHE_SITUACAO_CAND,
    ST_CANDIDATO_INSERIDO_URNA,
    DS_SITUACAO,
    CD_SITUACAO_LEGENDA,
    DS_SIT_TOT_TURNO,
  } = data;

  const CODIGO = getNumber(CD_MUNICIPIO || SG_UE || 0);
  const CODIGO_MUNICIPIO = CODIGO ? `${CODIGO}` : "00000";
  const URNA_TIPO = getSanitizedString(DS_TIPO_URNA || "apurada");
  const UF = (data.SG_UF || data["SG_ UF"] || "").trim();
  const CARGO = getCargoFromData({
    CD_CARGO_PERGUNTA,
    DS_CARGO_PERGUNTA,
    DS_CARGO,
  });

  const NUMERO = NR_VOTAVEL || NR_CANDIDATO;
  const PARTIDO = getNumeroPartido({ NR_PARTIDO, NUMERO });
  const CANDIDATO = `${CARGO}-${NUMERO}`;
  const MUNICIPIO = NM_MUNICIPIO || "TRANSITO";

  let SCOPE = null;

  if (federal === false || CARGO?.match(/prefeito|vereador/gim)) {
    SCOPE = CODIGO_MUNICIPIO;
  }

  if (UF !== uf) {
  }

  if (DS_ELEICAO && DS_ELEICAO.match(/suplement/gim)) {
    const result = {
      ANO: ANO_ELEICAO,
      CODIGO_MUNICIPIO,
      PARTIDO,
      TURNO: `${NR_TURNO}`,
      CARGO,
      UF,
      SCOPE,
      COLIGACAO: getColigacao(SQ_COLIGACAO, PARTIDO),
      IS_SUPLEMENTAR: true,
    };

    return result;
  }

  if (CD_SITUACAO_LEGENDA && DS_SITUACAO) {
    const situacao = DS_SITUACAO.match(/indeferido|irregular/gim) ? 1 : 0;

    const result = {
      ANO: ANO_ELEICAO,
      CODIGO_MUNICIPIO,
      PARTIDO,
      TURNO: `${NR_TURNO}`,
      CARGO,
      UF,
      SCOPE,
      COLIGACAO: getColigacao(SQ_COLIGACAO, PARTIDO),
      SITUACAO: situacao,
      IS_COLIG_INFO: true,
    };

    return result;
  }

  if (SQ_COLIGACAO) {
    const error = {
      ID: null,
      IS_COLIG: true,
    };

    if (CD_TIPO_ELEICAO !== "2") {
      if (ANO_ELEICAO !== "2006") {
        return error;
      }
    }

    if (
      ST_CANDIDATO_INSERIDO_URNA &&
      ST_CANDIDATO_INSERIDO_URNA.match(/^n[aã]o$/gim)
    ) {
      return error;
    }

    const RESULTADO = getSitTotTurno(DS_SIT_TOT_TURNO, CARGO);

    let ID = "";
    let UF_ALT = UF;

    if (CARGO.match(/deputado|senador|presidente|governador/gim)) {
      if (UF_ALT === "BR") {
        UF_ALT = uf;
      }
      ID = `${UF_ALT}-${ANO_ELEICAO}-${NR_TURNO}-${CARGO}-${NR_CANDIDATO}`;
    } else if (CARGO.match(/vereador|prefeito/gim)) {
      ID = `${UF_ALT}-${ANO_ELEICAO}-${NR_TURNO}-${CODIGO_MUNICIPIO}-${CARGO}-${NR_CANDIDATO}`;
    } else {
      return {
        ID: null,
        IS_COLIG: true,
      };
    }

    const situacao = {
      urna: getFieldStringData(DS_SITUACAO_CANDIDATO_URNA),
      pleito: getFieldStringData(DS_SITUACAO_CANDIDATO_PLEITO),
      atual:
        getFieldStringData(DS_DETALHE_SITUACAO_CAND) ||
        getFieldStringData(DS_SITUACAO_CANDIDATURA),
      totalizacao: getFieldStringData(DS_SIT_TOT_TURNO),
    };

    let shouldReplace = true;

    if (
      situacao.urna.match(/falecido/gim) ||
      situacao.pleito.match(/falecido/gim) ||
      situacao.atual.match(/falecido/gim)
    ) {
      shouldReplace = false;
    }

    let SITUACAO = null;

    if (ANO_ELEICAO * 1 < 2005) {
      SITUACAO = getSituationSimplified({
        atual: situacao.atual,
        totalizacao: situacao.totalizacao,
        proporcional: !!CARGO.match(/deputado|vereador/gim),
      });
    } else {
      SITUACAO = getSituationStale({
        proporcional: !!CARGO.match(/deputado|vereador/gim),
        pleito: situacao.pleito || situacao.urna,
        atual: situacao.atual,
      });
    }

    const result = {
      ID,
      ANO: ANO_ELEICAO,
      CODIGO_MUNICIPIO,
      CARGO,
      PARTIDO,
      TURNO: `${NR_TURNO}`,
      UF: UF_ALT,
      NUMERO: NR_CANDIDATO,
      CANDIDATO,
      COLIGACAO: getColigacao(SQ_COLIGACAO, PARTIDO),
      SITUACAO,
      GENERO: getNumber(CD_GENERO),
      ETNIA: getNumber(CD_COR_RACA),
      IDADE: getNumber(NR_IDADE_DATA_POSSE),
      NOME: getFieldData(NM_URNA_CANDIDATO),
      RESULTADO,
      GRAU: getNumber(CD_GRAU_INSTRUCAO),
      IS_COLIG: true,
      SHOULD_REPLACE: shouldReplace,
      URNA: situacao.urna,
      PLEITO: situacao.pleito,
      ATUAL: situacao.atual,
      TOTALIZACAO: situacao.totalizacao,
    };

    if (!RESULTADO) {
      throw "#27348";
    }

    return result;
  }

  if (NR_URNA_ESPERADA) {
    const ANO_ALT =
      ANO_ELEICAO ||
      DT_CARGA_URNA_ESPERADA.replace(/.*\/([0-9]{4}).*/gim, "$1");
    const ID = `${UF}-${ANO_ALT}-${NR_TURNO}-${CODIGO}-${NR_ZONA}-${NR_SECAO}`;

    const result = {
      ID,
      ANO: ANO_ALT,
      UF,
      CODIGO_MUNICIPIO,
      MUNICIPIO,
      ZONA: `${NR_ZONA}`,
      SECAO: `${NR_SECAO}`,
      NR_TURNO,
      IS_CESC: true,
    };

    return result;
  }

  try {
    NR_VOTAVEL.slice(0, 2);
  } catch (e) {
    throw "#76876";
  }

  const COUNT = parseInt(QT_VOTOS, 10);
  const NAME = `${UF}-${ANO_ELEICAO}-${NR_TURNO}-${CODIGO_MUNICIPIO}-${NR_ZONA}-${NR_SECAO}`;

  const result = {
    ID: NAME,
    ANO: ANO_ELEICAO,
    VOTAVEL_TIPO: getFieldData(CD_TIPO_VOTAVEL),
    MUNICIPIO,
    COMPARECIMENTO: getFieldData(QT_COMPARECIMENTO),
    APTOS: getNumber(QT_APTOS),
    URNA: getFieldData(NR_URNA_EFETIVADA),
    ABERTURA: getFieldData(DT_ABERTURA),
    ENCERRAMENTO: getFieldData(DT_ENCERRAMENTO),
    NUMERO: getFieldData(NUMERO),
    ZONA: `${NR_ZONA}`,
    SECAO: `${NR_SECAO}`,
    TURNO: `${NR_TURNO}`,
    CODIGO_MUNICIPIO,
    URNA_TIPO,
    UF,
    NAME,
    CARGO: getFieldData(CARGO),
    SCOPE,
    CANDIDATO: getFieldData(CANDIDATO),
    PARTIDO: getFieldData(PARTIDO),
    COUNT,
    BIOMETRIA: getNumber(QT_ELEITORES_BIOMETRIA_NH),
    JUNTA_APURADORA: getNumber(NR_JUNTA_APURADORA),
    LOCAL_VOTACAO: getFieldData(NR_LOCAL_VOTACAO),
  };

  return result;
};
