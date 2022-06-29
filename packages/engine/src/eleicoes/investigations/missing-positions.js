const { forEachList } = require("../helpers");
const { LoggerSingleton } = require("../../log");

const { log } = LoggerSingleton.getInstance();

const getYearFromId = (id) => {
  return id.replace(/^([^-]+)(-)([^-]+)(-)([^-]+)(-)(.*)/gim, "$3") * 1;
};

const investigateBox = ({
  accumulator,
  box,
  resultados,
  callback,
  getParentData,
}) => {
  const { cargos, turno, codigo, scope } = box;

  const turnoData = resultados[`turno_${turno}`];

  const parentCargos = getParentData({
    turno,
    scope,
    path: "cargos",
  });

  const { multipliers } = turnoData;
  const year = getYearFromId(box.id);
  const diff = {};
  const size = box.absolutos.tamanho;

  if (!turnoData.cidades) {
  }

  const citySize = turnoData.cidades[codigo]?.comparecimento || 0;

  const extra = [];
  let error = 0;

  if (!parentCargos) {
    throw "#65564";
  }

  let missingCargos = 0;

  forEachList(parentCargos, (cargo) => {
    if (cargos[cargo]) {
      extra.push({ cargo, votos: cargos[cargo].total });
      return;
    }

    if (!multipliers[cargo]) {
      throw "#87657";
    }

    let perdidos = size * multipliers[cargo];

    error += perdidos;
    missingCargos += 1;

    diff[cargo] = perdidos;

    extra.push({
      cargo,
      votos: 0,
      perdidos,
    });
  });

  if (!error) {
    return;
  }

  if (year >= 2010 && missingCargos) {
    callback({
      id: box.id,
      path: "transition",
      value: true,
    });
    return;
  }

  callback({
    id: box.id,
    turno,
    scope: box.scope,
    path: "absolutos.perdidos",
    add: error,
  });

  callback({
    id: box.id,
    path: `problemas`,
    push: {
      type: "MISSING_POSITION",
      count: error,
      extra,
    },
  });

  callback({
    turno,
    scope: box.scope,
    path: `problemas`,
    push: {
      id: box.id,
      type: "MISSING_POSITION",
      count: error,
      extra,
    },
  });

  log(`MISSING ${missingCargos} - ${box.id}`, {
    emoji: "🧨",
  });
};

export const investigateMissingPositions = ({
  boxes,
  resultados,
  callback,
  getParentData,
  accumulator,
}) => {
  forEachList(boxes, (id, data) => {
    try {
      investigateBox({
        box: data,
        resultados,
        callback,
        getParentData,
        accumulator,
      });
    } catch (e) {
      throw "#8927";
    }
  });
};
