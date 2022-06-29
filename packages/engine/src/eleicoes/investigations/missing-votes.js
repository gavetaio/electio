const { forEachList } = require("../helpers");

const getMaxVotes = ({ box, multipliers, transitionPeriod }) => {
  const result = { cargo: null, votos: 0 };

  const cargos = Object.keys(box.cargos);
  forEachList(box.cargos, (cargo, data) => {
    if (cargos.length !== 1 && transitionPeriod && cargo === "presidente") {
      return;
    }

    const multiplier = multipliers[cargo];

    const total = data.total / multiplier;
    if (total > result.votos) {
      result.cargo = data;
      result.votos = total;
    }
  });
  return result;
};

const investigate = ({ box, multipliers, isTransitionBox, maxVotes }) => {
  const { cargos } = box;
  const extra = [];
  const results = [];
  let error = 0;

  forEachList(cargos, (cargo, data) => {
    if (isTransitionBox === true && cargo === "presidente") {
      return;
    }

    const { total } = data;
    const multiplier = multipliers[cargo];
    const comparison = total / multiplier;

    if (comparison === maxVotes.votos) {
      extra.push({ cargo, votos: total });
      return;
    }

    const perdidos = (maxVotes.votos - comparison) * multiplier;
    error += perdidos;
    extra.push({ cargo, votos: total, perdidos });

    results.push({ cargo, perdidos });
  });

  return {
    error,
    extra,
    results,
  };
};

const getYearFromId = (id) => {
  return id.replace(/^([^-]+)(-)([^-]+)(-)([^-]+)(-)(.*)/gim, "$3") * 1;
};

const checkTransitionBox = ({ transitionPeriod, maxVotes, cargos }) => {
  if (!transitionPeriod) {
    return false;
  }

  if (!cargos?.presidente) {
    return false;
  }

  if (cargos.deputado_federal && cargos.presidente.aptos) {
    if (cargos.presidente.aptos !== cargos.deputado_federal.aptos) {
      return true;
    }
  }

  if (cargos.governador && cargos.presidente.aptos) {
    if (cargos.presidente.aptos !== cargos.governador.aptos) {
      return true;
    }
  }

  if (cargos.presidente.total > maxVotes.votos) {
    return true;
  }

  return false;
};

export const investigateBox = ({ box, resultados, callback }) => {
  const { id, turno, scope, cargos, codigo } = box;
  const turnoData = resultados[`turno_${turno}`];
  const { multipliers } = turnoData;
  const year = getYearFromId(box.id);

  const transitionPeriod = !!(year >= 2010);

  const maxVotes = getMaxVotes({ box, multipliers, transitionPeriod });

  const isTransitionBox = checkTransitionBox({
    transitionPeriod,
    maxVotes,
    cargos,
  });

  const { error, extra, results } = investigate({
    box,
    multipliers,
    isTransitionBox,
    maxVotes,
  });

  if (isTransitionBox === true) {
    callback({
      id,
      path: "transition",
      value: true,
    });

    callback({
      turno,
      scope,
      path: `boxes.transition`,
      add: 1,
      scoped: true,
    });
    return;
  }

  if (!error) {
    return;
  }

  if (results.length) {
    for (let i = 0; i < results.length; i += 1) {
      const { cargo, perdidos } = results[i];
      callback({
        id: box.id,
        turno: box.turno,
        scope: box.scope,
        path: `cargos.${cargo}.perdidos`,
        add: perdidos,
      });
    }
  }

  callback({
    id,
    turno,
    scope: box.scope,
    path: "absolutos.perdidos",
    add: error,
  });

  callback({
    turno,
    scope,
    path: `problemas`,
    push: {
      id,
      type: "COUNT_DIFFERENCE",
      count: error,
      extra,
    },
  });

  callback({
    id,
    path: `problemas`,
    push: {
      type: "COUNT_DIFFERENCE",
      count: error,
      extra,
    },
  });
};

export const investigateMissingVotes = ({ boxes, resultados, callback }) => {
  forEachList(boxes, (id, data) => {
    investigateBox({ box: data, resultados, callback });
  });
};
