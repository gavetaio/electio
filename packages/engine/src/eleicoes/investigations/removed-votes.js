const { forEachList } = require("../helpers");
const {
  checkMajorityExplosionByVotes,
  getCandidatosSortedList,
} = require("./removed-votes/removed-votes");
const {
  getLegendasFromPartidos,
  getElectedCandidates,
  getProportionalRemovidos,
  runLostVotes,
  runLostCandidates,
} = require("./removed-votes/check-proportional");

const pushBrokenState = ({ id, turno, list, cargo, scope, callback }) => {
  list.forEach((item) => {
    if (scope) {
      item.scope = scope;
    }

    if (item?.type.match(/percentual/gim)) {
      const type = item.type.replace(/^(elegiveis-)?(.*)$/gim, "$2");

      if (item.type.match(/elegiveis/gim)) {
        callback({
          turno,
          path: `breakable.${cargo}.${type}.candidatos`,
          value: item.elegible,
          scope,
        });
      } else {
        callback({
          turno,
          path: `breakable.${cargo}.${type}`,
          merge: item,
          scope,
        });
      }
      return;
    }

    callback({
      turno,
      path: `broken.${cargo}`,
      push: item,
      scope,
    });

    callback({
      turno,
      path: `cargos.${cargo}.broken`,
      add: 1,
      scope,
    });

    callback({
      turno,
      path: `absolutos.broken`,
      add: 1,
      scope,
    });

    if (item.voided) {
      callback({
        turno,
        scope,
        path: `problemas`,
        push: {
          id: scope ? `${id}-${scope}` : id,
          type: "VOIDED_ELECTION",
          count: item?.votes || 0,
          extra: {
            scope,
          },
        },
      });
    }

    if (item.revokable) {
      callback({
        turno,
        scope,
        path: `problemas`,
        push: {
          id: scope ? `${id}-${scope}` : id,
          type: "REVOKABLE_ELECTION",
          count: item?.votes || 0,
          extra: {
            scope,
          },
        },
      });
    }
  });
};

const checkBrokenCargoProportional = ({
  data,
  cargo,
  coligs,
  partidos,
  candidatos,
  scope,
  id = null,
  ano = null,
}) => {
  const {
    removidos = 0,
    perdidos = 0,
    vagas = 0,
    recursados = 0,
    urnados = 0,
    total = 0,
  } = data;

  const list = {
    recursados,
  };

  const lost = {
    perdidos,
  };

  const legendasObject = getLegendasFromPartidos(partidos[cargo]);

  const root = {
    vagas,
    cargo,
    coligs,
    legendasObject,
    generalSpread: ano && ano * 1 > 2016 ? true : false,
  };

  const locale = scope && id ? `${id}-${scope}` : id;

  const original = getElectedCandidates({ ...root, candidatos, locale });

  const result = [];

  forEachList(list, (key, value) => {
    if (!value) {
      return;
    }

    const transformed = getProportionalRemovidos({
      root,
      partidos,
      cargo,
      results: original,
      removidos: value,
      type: key,
    });

    if (transformed?.broken) {
      result.push(transformed);
    }
  });

  forEachList(lost, (key, value) => {
    if (!value) {
      return;
    }

    const experiment = runLostVotes({
      candidatos,
      cargo,
      root,
      results: original,
      perdidos: value,
      partidos,
      type: key,
    });

    if (experiment) {
      result.push(experiment);
    }

    const experimentCandidates = runLostCandidates({
      candidatos,
      cargo,
      root,
      perdidos: value,
      type: `elegiveis-${key}`,
    });

    if (experimentCandidates) {
      result.push(experimentCandidates);
    }
  });

  return result;
};

const checkBrokenCargoMajoritarian = ({ data, candidatos, cargo }) => {
  const {
    validos = 0,
    perdidos = 0,
    removidos = 0,
    recursados = 0,
    total = 0,
  } = data;

  if (!removidos && !perdidos && !recursados) {
    return null;
  }

  const candidatosList = getCandidatosSortedList(candidatos, cargo, false);

  const candidatosFiltered = candidatosList.filter(
    ({ situacao }) => situacao === 0
  );

  let nulledBefore = false;

  if (candidatosList?.length && candidatosFiltered?.length) {
    if (candidatosList[0].votos !== candidatosFiltered[0].votos) {
      nulledBefore = true;
    }
  }

  const list = [
    { type: "perdidos", votes: perdidos },
    { type: "recursados", votes: recursados },
    { type: "removidos", votes: removidos },
    { type: "percentual_1", votes: Math.floor(total * 0.01) },
    { type: "percentual_5", votes: Math.floor(total * 0.05) },
  ];

  const broken = [];

  list.forEach(({ type, votes }) => {
    const voided = (votes * 100) / validos > 50;
    const isBroken = checkMajorityExplosionByVotes({
      deletados: votes,
      candidatos: candidatosFiltered,
      validos,
      nulledBefore,
    });

    if (isBroken?.broken) {
      const result = {
        ...isBroken,
        type,
        voided,
        votes,
      };

      broken.push(result);
    }
  });

  return broken;
};

const checkCidades = ({ turnoData, callback, turno, id }) => {
  const { cidades } = turnoData;
  const [uf, ano] = id.split("-");

  forEachList(cidades, (codigo, cidade) => {
    const { cargos, candidatos, coligs, partidos } = cidade;
    forEachList(cargos, (cargo, data) => {
      if (cargo.match(/^(prefeito)$/gim)) {
        const result = checkBrokenCargoMajoritarian({
          data,
          candidatos,
          cargo,
        });

        if (!result?.length) {
          return;
        }

        pushBrokenState({
          id,
          turno,
          codigo,
          list: result,
          cargo,
          scope: codigo,
          callback,
        });

        return;
      }

      if (cargo.match(/^(vereador)$/) && turno === "1") {
        const result = checkBrokenCargoProportional({
          id,
          coligs,
          data,
          cargo,
          partidos,
          scope: codigo,
          candidatos,
          callback,
          ano,
        });

        if (!result?.length) {
          return;
        }

        pushBrokenState({
          id,
          turno,
          list: result,
          cargo,
          scope: codigo,
          callback,
        });
      }
    });
  });
};

const checkEstados = ({ turnoData, callback, turno, id }) => {
  const { cargos, candidatos, coligs, partidos } = turnoData;
  const [uf, ano] = id.split("-");

  forEachList(cargos, (cargo, data) => {
    if (cargo.match(/senador|presidente|governador/gim)) {
      const result = checkBrokenCargoMajoritarian({
        data,
        candidatos,
        cargo,
      });

      if (!result?.length) {
        return;
      }

      pushBrokenState({
        id,
        turno,
        list: result,
        cargo,
        scope: null,
        callback,
      });
    }

    if (cargo.match(/deputado/gim)) {
      const result = checkBrokenCargoProportional({
        id,
        coligs,
        data,
        cargo,
        partidos,
        candidatos,
        callback,
        scope: null,
        ano,
      });

      if (!result?.length) {
        return;
      }

      pushBrokenState({
        id,
        turno,
        list: result,
        cargo,
        scope: null,
        callback,
      });
    }
  });
};

export const investigateRemovedVotes = ({
  accumulator,
  resultados,
  callback,
}) => {
  const { federal, uf, ano } = accumulator.headers;

  const header = `${uf}-${ano}`;

  forEachList(resultados, (turno, turnoData) => {
    const turnoNumber = turno.match(/1/gim) ? "1" : "2";
    const id = `${header}-${turnoNumber}`;

    if (federal) {
      checkEstados({ turnoData, callback, turno: turnoNumber, id });
      return;
    }

    checkCidades({ turnoData, callback, turno: turnoNumber, id });
  });
};
