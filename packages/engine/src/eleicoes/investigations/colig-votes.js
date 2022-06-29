import {
  isRecursado,
  isRemovido,
  isUrnado,
} from "@gavetaio/core/utils/engine/situations";

const { forEachList } = require("../helpers");
const { LoggerSingleton } = require("../../log");
const { log } = LoggerSingleton.getInstance();

const sumProp = (root, name, value) => {
  if (root[name]) {
    root[name] += value;
    return;
  }
  root[name] = value;
};

const setProp = (root, name, value) => {
  root[name] = value;
};

const pushProp = (root, name, value) => {
  if (root[name]) {
    root[name].push(value);
    return;
  }
  root[name] = [value];
};

const pullFromNominais = ({
  turno,
  codigo,
  cargo,
  partido,
  votos,
  callback,
}) => {
  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.nominais`,
    add: votos * -1,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.nominais`,
    add: votos * -1,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.validos`,
    add: votos * -1,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `absolutos.validos`,
    add: votos * -1,
  });

  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.validos`,
    add: votos * -1,
    scoped: true,
  });
};

const clearLegendas = ({
  callback,
  turno,
  scope,
  cargo,
  partido,
  votes,
  id,
  candidatos,
}) => {
  let sum = votes;

  const candidatosObject =
    candidatos && candidatos[cargo] && candidatos[cargo][partido]
      ? candidatos[cargo][partido]
      : null;

  forEachList(candidatosObject, (candidato, data) => {
    sum += data.votos;
  });

  callback({
    turno,
    scope,
    path: `partidos.${cargo}.${partido}.`,
    data: [
      { path: "validos", value: 0 },
      { path: "legenda", value: 0 },
      { path: "legendados", value: votes },
      { path: "removidos", add: votes },
      { path: "recursados", add: votes },
      { path: "invalidados", add: votes },
    ],
    scoped: true,
  });

  callback({
    turno,
    scope,
    path: `cargos.${cargo}.`,
    data: [
      { path: "validos", add: votes * -1 },
      { path: "legenda", add: votes * -1 },
      { path: "legendados", add: votes },
      { path: "removidos", add: votes },
      { path: "recursados", add: votes },
      { path: "invalidados", add: votes },
      { path: "nulos", add: votes },
    ],
    scoped: true,
  });

  callback({
    turno,
    scope,
    path: `absolutos.`,
    data: [
      { path: "validos", add: votes * -1 },
      { path: "invalidados", add: votes },
      { path: "removidos", add: votes },
      { path: "recursados", add: votes },
      { path: "invalidados", add: votes },
    ],
  });

  callback({
    turno,
    scope,
    path: `problemas`,
    push: {
      id: scope ? `${id}-${scope}` : id,
      type: "TRIMMED_VOTES",
      count: sum,
    },
  });
};

const clearUnwantedLegendas = ({
  coligsInfo,
  partidos,
  callback,
  scope = null,
  candidatos,
  id,
  turno,
}) => {
  forEachList(partidos, (cargo, data) => {
    forEachList(data, (partido, info) => {
      if (!info) {
      }

      const { legenda = 0, nominais = 0 } = info;

      if (!legenda) {
        return;
      }

      const shouldWipe =
        coligsInfo &&
        coligsInfo[cargo] &&
        coligsInfo[cargo][partido] &&
        coligsInfo[cargo][partido] === 1;

      if (!shouldWipe) {
        return;
      }

      if (nominais > 0) {
        return;
      }

      clearLegendas({
        id,
        callback,
        turno,
        partido,
        scope,
        cargo,
        info,
        votes: legenda,
        candidatos,
      });
    });
  });
};

const pushToAnulados = ({
  turno,
  codigo,
  cargo,
  partido,
  votos,
  identifier,
  callback,
}) => {
  callback({
    turno,
    scope: codigo,
    path: `coligs.${identifier}.${cargo}.anulados`,
    add: votos,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.anulados`,
    add: votos,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.anulados`,
    add: votos,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `absolutos.anulados`,
    add: votos,
  });
};

const pushToNulos = ({ turno, codigo, cargo, partido, votos, callback }) => {
  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.nulos`,
    add: votos,
    scoped: true,
  });
  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.invalidados`,
    add: votos,
    scoped: true,
  });
  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.invalidados`,
    add: votos,
    scoped: true,
  });
  callback({
    turno,
    scope: codigo,
    path: `absolutos.invalidados`,
    add: votos,
  });
};

const pushToLegendas = ({ turno, codigo, cargo, partido, votos, callback }) => {
  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.legenda`,
    add: votos,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `partidos.${cargo}.${partido}.nominais`,
    add: votos * -1,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.legenda`,
    add: votos,
    scoped: true,
  });

  callback({
    turno,
    scope: codigo,
    path: `cargos.${cargo}.nominais`,
    add: votos * -1,
    scoped: true,
  });
};

const getCargoExtras = ({ cargo, candidatoId, coligacoes }) => {
  if (!cargo.match(/^(senador|prefeito|presidente|governador)$/)) {
    return null;
  }

  const extras = {};
  if (cargo === "senador") {
    const suplente1Id = candidatoId.replace(/senador/gim, "senador_1_suplente");
    if (coligacoes[suplente1Id]) {
      extras.suplente_1 = coligacoes[suplente1Id].nome;
    }
    const suplente2Id = candidatoId.replace(/senador/gim, "senador_2_suplente");
    if (coligacoes[suplente2Id]) {
      extras.suplente_2 = coligacoes[suplente2Id].nome;
    }
  } else {
    const viceId = candidatoId.replace(
      /(prefeito|presidente|governador)/gim,
      "vice_$1"
    );
    if (coligacoes[viceId]) {
      extras[`vice_${cargo}`] = coligacoes[viceId].nome;
    }
  }

  return extras;
};

const updateData = ({
  coligacoes,
  candidatoId,
  turno,
  callback,
  codigo = null,
  cargo,
  id,
  partido,
  votos,
  root,
  turnoData,
  ano,
}) => {
  let identifier = null;
  let status = 0;
  let elected = false;

  if (!coligacoes || !coligacoes[candidatoId]) {
    if (cargo.match(/presidente/gim)) {
      return;
    }
  }

  if (coligacoes && Object.keys(coligacoes).length !== 0) {
    const candidatoInfo = coligacoes[candidatoId] || {
      situacao: 4,
      coligacao: null,
      genero: 0,
      idade: 0,
      nome: null,
      etnia: 0,
      grau: 0,
      resultado: 9,
      urna: "INDEFERIDO",
      pleito: "INDEFERIDO",
      atual: "INDEFERIDO",
    };

    const {
      coligacao,
      genero,
      idade,
      nome,
      etnia,
      grau,
      situacao,
      resultado,
      urna,
      pleito,
      atual,
      totalizacao,
    } = candidatoInfo;
    identifier = coligacao;
    status = situacao;

    if (situacao !== 0) {
      if (situacao > 4) {
        throw "#6238";
      }

      if (!root.partidos[cargo][partido]) {
        root.partidos[cargo][partido] = {
          total: 0,
        };
      }

      if (isRemovido(situacao)) {
        sumProp(root.absolutos, "removidos", votos);
        sumProp(root.cargos[cargo], "removidos", votos);
        sumProp(root.partidos[cargo][partido], "removidos", votos);
        if (turnoData) {
          sumProp(turnoData.absolutos, "removidos", votos);
        }

        if (isRecursado({ urna, pleito, atual })) {
          sumProp(root.absolutos, "recursados", votos);
          sumProp(root.cargos[cargo], "recursados", votos);
          sumProp(root.partidos[cargo][partido], "recursados", votos);
          if (turnoData) {
            sumProp(turnoData.absolutos, "recursados", votos);
          }
        }

        if (isUrnado({ pleito })) {
          sumProp(root.absolutos, "urnados", votos);
          sumProp(root.cargos[cargo], "urnados", votos);
          sumProp(root.partidos[cargo][partido], "urnados", votos);
          if (turnoData) {
            sumProp(turnoData.absolutos, "urnados", votos);
          }
        }
      }
    }

    if (resultado === 1 || resultado === 2 || resultado === 3) {
      elected = true;
    }

    const update = {
      votos,
      genero,
      idade,
      etnia,
      grau,
      nome,
      resultado,
      situacao,
      raw: {
        urna,
        pleito,
        atual,
        totalizacao,
      },
    };

    const extras = getCargoExtras({ cargo, candidatoId, coligacoes });

    if (extras) {
      update.extras = extras;
    }

    root.candidatos[cargo][id] = update;
  } else {
    root.candidatos[cargo][id].situacao = -1;

    callback({
      turno,
      scope: codigo,
      path: `absolutos.desaparecidos`,
      add: 1,
    });

    if (turnoData) {
      sumProp(turnoData.absolutos, "desaparecidos", 1);
    }

    return;
  }

  if (status !== 0) {
    if (status === 2 || status === 3 || status === 4) {
      pullFromNominais({
        ano,
        status,
        turno,
        codigo,
        cargo,
        partido,
        votos,
        identifier,
        root,
        callback,
      });
    }

    if (status === 1) {
      pushToLegendas({ turno, codigo, cargo, partido, votos, callback });
    }

    if (status === 2) {
      pushToNulos({ turno, codigo, cargo, partido, votos, callback });
    }

    if (status === 3 || status === 4) {
      pushToAnulados({
        turno,
        codigo,
        cargo,
        partido,
        votos,
        identifier,
        callback,
      });
    }

    return;
  }

  if (!root.coligs) {
    root.coligs = {};
  }

  if (!root.coligs[identifier]) {
    root.coligs[identifier] = {};
  }

  if (!root.coligs[identifier][cargo]) {
    root.coligs[identifier][cargo] = {
      votes: 0,
      candidatos: {},
      eleitos: 0,
    };
  }

  if (!root.coligs[identifier][cargo].candidatos) {
    root.coligs[identifier][cargo].candidatos = {};
  }

  if (!root.coligs[identifier][cargo].votes) {
    root.coligs[identifier][cargo].votes = 0;
  }

  if (!root.coligs[identifier][cargo].eleitos) {
    root.coligs[identifier][cargo].eleitos = 0;
  }

  const colig = root.coligs[identifier][cargo];

  root.coligs[identifier][cargo].votes += votos;

  colig.candidatos[id] = votos;

  if (elected) {
    root.cargos[cargo].vagas = root.cargos[cargo].vagas + 1 || 1;

    root.partidos[cargo][partido].eleitos =
      root.partidos[cargo][partido].eleitos + 1 || 1;

    colig.eleitos = colig.eleitos + 1 || 1;
  }
};

const setMunicipalInfo = ({
  cidades,
  coligacoes,
  uf,
  ano,
  callback,
  turnoData,
  turno,
}) => {
  forEachList(cidades, (codigo, cidade) => {
    log([`INVESTIGATING CITY`, cidade.nome], { emoji: "🏭" });
    const { candidatos, partidos, coligsInfo } = cidade;

    if (!candidatos || !partidos) {
      return;
    }

    upsertCandidatos({ coligacoes, candidatos, codigo, data: cidade });
    forEachList(candidatos, (cargo, list) => {
      forEachList(list, (id, info) => {
        const { votos } = info;
        const splitted = id.split("-");
        const partido = splitted[1].replace(/([0-9]{2}).*/gim, "$1");
        const numero = splitted[1];
        const candidatoId = `${uf}-${ano}-${turno}-${codigo}-${cargo}-${numero}`;

        updateData({
          ano,
          coligacoes,
          candidatoId,
          turno,
          callback,
          codigo,
          cargo,
          id,
          partido,
          votos,
          turnoData,
          root: turnoData.cidades[codigo],
        });
      });
    });

    clearUnwantedLegendas({
      id: `${uf}-${ano}-${turno}`,
      turno,
      coligsInfo,
      partidos,
      coligacoes,
      callback,
      scope: codigo,
      root: cidade,
      candidatos,
    });
  });
};

const upsertCandidatos = ({ coligacoes, candidatos, codigo = null, data }) => {
  const codReg = new RegExp(`-${codigo}-`, "mig");
  forEachList(coligacoes, (id, info) => {
    if (id.match(/suplente|vice/gim)) {
      return;
    }

    if (codigo && !id.match(codReg)) {
      return;
    }

    let split = id.split("-");
    let cargo = split[3];
    let candidato = `${split[3]}-${split[4]}`;
    let partido = split[4].replace(/([0-9]{2}).*/gim, "$1");

    if (codigo) {
      cargo = split[4];
      candidato = `${split[4]}-${split[5]}`;
      partido = split[5].replace(/([0-9]{2}).*/gim, "$1");
    }

    if (!candidatos) {
      throw "#877655";
    }

    if (candidatos?.[cargo]?.[candidato]) {
      return;
    }

    if (!candidatos?.[cargo]) {
      candidatos[cargo] = {};
    }

    if (!candidatos[cargo][candidato]) {
      if (!data.cargos) {
        data.cargos = {};
      }

      if (!data.cargos[cargo]) {
        data.cargos[cargo] = {};
      }

      if (data.cargos[cargo].candidatos) {
        data.cargos[cargo].candidatos += 1;
      }

      if (!data.partidos) {
        data.partidos = {};
      }

      if (!data.partidos[cargo]) {
        data.partidos[cargo] = {};
      }

      if (!data.partidos[cargo][partido]) {
        data.partidos[cargo][partido] = { nominais: 0, validos: 0 };
      }

      candidatos[cargo][candidato] = {
        votos: 0,
      };
    }
  });
};

const setGeneralElectionInfo = ({
  candidatos,
  turnoData,
  coligacoes,
  coligsInfo,
  callback,
  ano,
  uf,
  turno,
}) => {
  upsertCandidatos({ coligacoes, candidatos, data: turnoData });
  forEachList(candidatos, (cargo, list) => {
    forEachList(list, (id, info) => {
      const { votos } = info;
      const splitted = id.split("-");
      const partido = splitted[1].replace(/([0-9]{2}).*/gim, "$1");
      const numero = splitted[1];
      const candidatoId = `${uf}-${ano}-${turno}-${cargo}-${numero}`;

      updateData({
        ano,
        coligacoes,
        candidatoId,
        turno,
        callback,
        cargo,
        id,
        partido,
        votos,
        turnoData: null,
        root: turnoData,
      });
    });
  });

  clearUnwantedLegendas({
    id: `${uf}-${ano}-${turno}`,
    turno,
    coligsInfo,
    coligacoes,
    partidos: turnoData.partidos,
    callback,
    scope: null,
    root: turnoData,
    candidatos,
  });
};

export const investigateColigVotes = ({
  resultados,
  callback,
  accumulator,
}) => {
  const turnos = [resultados.turno_1, resultados.turno_2];

  turnos.forEach((turnoData, index) => {
    const { coligacoes, cidades, multipliers, candidatos, coligsInfo } =
      turnoData;
    const { uf, ano } = accumulator.headers;

    const coligacoesData =
      coligacoes && Object.keys(coligacoes).length ? coligacoes : null;

    if (!multipliers) {
      return;
    }

    if (!coligacoes) {
      return;
    }

    if (multipliers.prefeito) {
      setMunicipalInfo({
        cidades,
        coligacoes: coligacoesData,
        uf,
        ano,
        callback,
        turnoData,
        turno: index + 1,
      });
      return;
    }

    setGeneralElectionInfo({
      candidatos,
      coligacoes: coligacoesData,
      callback,
      ano,
      uf,
      turnoData,
      turno: index + 1,
      coligsInfo,
    });
  });
};
