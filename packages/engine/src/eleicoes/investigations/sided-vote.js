import { forEachList } from "../helpers";

const { LoggerSingleton } = require("../../log");

const { log } = LoggerSingleton.getInstance();

const pushMapped = ({ box, result, callback }) => {
  const { mapped } = result;
  const extra = {
    cargos: mapped,
  };
  let votes = 0;

  mapped.forEach((voto) => {
    votes += voto.votos;
  });

  if (!votes) {
    return;
  }

  callback({
    id: box.id,
    path: `problemas`,
    push: { type: "MAPPED_VOTES", count: votes, extra },
  });

  callback({
    turno: box.turno,
    scope: box.scope,
    path: `problemas`,
    push: {
      id: box.id,
      type: "MAPPED_VOTES",
      count: votes,
      extra,
    },
  });
};

const pushSided = ({ box, result, callback }) => {
  callback({
    id: box.id,
    turno: box.turno,
    scope: box.scope,
    path: "absolutos.expostos",
    add: result.votos,
  });

  if (result.list?.length) {
    for (let i = 0; i < result.list.length; i += 1) {
      const { cargo, expostos } = result.list[i];

      callback({
        id: box.id,
        turno: box.turno,
        scope: box.scope,
        path: `cargos.${cargo}.expostos`,
        add: expostos,
        scoped: true,
      });
    }
  }

  callback({
    id: box.id,
    path: `problemas`,
    push: {
      type: "EXPOSED_VOTES",
      count: result.votos,
      extra: result.extra,
    },
  });

  callback({
    turno: box.turno,
    scope: box.scope,
    path: `problemas`,
    push: {
      id: box.id,
      type: "EXPOSED_VOTES",
      count: result.votos,
      extra: result.extra,
    },
  });

  if (result.cargos > 1) {
    log(`EXPOSED_VOTES ${result.cargos}x → ${box.id}`, {
      emoji: "🧨",
    });
  }
};

const boxInvestigation = ({ box, resultados, callback, candidatos }) => {
  const { cargos, validos } = box;
  const result = {
    votos: 0,
    cargos: 0,
    extra: [],
    list: [],
    mapped: [],
  };
  const mapping = {};

  const size = box.absolutos.tamanho;
  const multipliers = resultados[`turno_${box.turno}`].multipliers;

  if (!cargos || !validos?.length) {
    return;
  }

  if (!multipliers) {
    //
  }

  for (let k = 0; k < validos.length; k += 1) {
    const voto = validos[k];
    const cargo = voto.nome.replace(/([a-z_]+)-(.*)/gim, "$1");
    const multiplier = multipliers[cargo];

    if (!mapping[cargo]) {
      mapping[cargo] = [];
    }
    mapping[cargo].push(voto);

    if (voto.votos / multiplier !== size) {
      continue;
    }

    mapping[cargo] = null;
    result.extra.push(voto);
    result.votos += voto.votos;
    result.cargos += 1;
    result.list.push({ cargo, expostos: voto.votos });
  }

  forEachList(mapping, (cargo, votos) => {
    if (!votos) {
      return;
    }

    if (votos.length === 1 && votos[0].votos > 20) {
      const keys = Object.keys(candidatos[cargo]);

      if (!(keys?.length > 2)) {
        return;
      }
      result.mapped.push(...votos);
    }
  });

  if (!result.votos) {
    return;
  }

  pushSided({ box, result, callback });

  if (result.mapped?.length) {
    pushMapped({ box, result, callback });
  }
};

export const investigateSidedVotes = ({
  boxes,
  resultados,
  callback,
  getParentData,
}) => {
  forEachList(boxes, (id, box) => {
    const candidatos = getParentData({
      turno: box.turno,
      scope: box.scope,
      path: "candidatos",
    });
    boxInvestigation({ box, resultados, candidatos, callback });
  });
};
