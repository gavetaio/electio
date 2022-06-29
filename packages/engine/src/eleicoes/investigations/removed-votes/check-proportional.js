const unique = require("array-unique");
const {
  forEachList,
  deepClone,
  objectToOrderedArray,
  getDeviationInfo,
} = require("../../helpers");
const { getCandidatosSortedList } = require("./removed-votes");
const { arrayFilterUnique } = require("@gavetaio/core");

const limitedRound = (number) => {
  const trimmed = number.toFixed(1);
  const integer = Math.floor(trimmed);
  const diff = trimmed - integer;
  if (diff && diff > 0.5) {
    return integer + 1;
  }
  return integer;
};

export const transformPartidoResult = (partidos, root) => {
  const result = {};

  const dados = [];
  forEachList(root, (partido, { total }) => {
    dados.push(total);
  });
  const { mean, deviation } = getDeviationInfo(dados);
  const limit = mean + deviation / 2;

  forEachList(partidos, (partido, eleitos) => {
    const diff = root[partido] ? root[partido].eleitos || 0 : 0;
    result[partido] = {
      eleitos,
    };
    const extra = eleitos - diff;
    result[partido].extra = extra;
    result[partido].major = root[partido].total > limit;
  });
  return result;
};

export const runLostCandidates = ({
  candidatos,
  cargo,
  root,
  perdidos,
  type = "elegiveis",
}) => {
  const candidatosList = getCandidatosSortedList(candidatos, cargo).filter(
    (candidato) => candidato.resultado > 3
  );

  if (!candidatosList?.length) {
    return null;
  }

  const elegible = getPossibleElegibleChanges({
    root: deepClone(root),
    perdidos,
    candidatos: candidatosList,
  });

  if (elegible?.length) {
    return {
      type,
      broken: true,
      elegible,
    };
  }

  return null;
};

export const runLostVotes = ({
  candidatos,
  cargo,
  root,
  results,
  perdidos,
  partidos,
  type = "perdidos",
}) => {
  const result = {
    type,
    broken: false,
  };

  const candidatosList = getCandidatosSortedList(candidatos, cargo);

  let experiment = getOptimalProportionalChange({
    root: deepClone(root),
    original: deepClone(results),
    perdidos,
    partidos: deepClone(partidos[cargo]),
    candidatos: candidatosList,
  });

  if (experiment?.broken) {
    return {
      ...result,
      ...experiment,
    };
  }

  experiment = getOptimalProportionalChange({
    root: deepClone(root),
    original: deepClone(results),
    perdidos: perdidos * 10,
    partidos: deepClone(partidos[cargo]),
    candidatos: candidatosList,
  });

  if (experiment?.broken) {
    return {
      ...experiment,
      ...result,
    };
  }

  return result;
};

export const getProportionalRemovidos = ({
  root,
  partidos,
  cargo,
  results,
  removidos,
  type,
}) => {
  const removidosResult = getElectedCandidates({
    ...root,
    legendasObject: getLegendasWithRemovidos(partidos[cargo]),
  });

  if (!removidosResult) {
    return null;
  }

  const participacaoPartidaria = comparePartidos(results, removidosResult);
  const candidatosEleitos = compareEleitos(results, removidosResult);

  if (!participacaoPartidaria) {
    return null;
  }

  const partidosAlt = transformPartidoResult(
    removidosResult.partidos,
    partidos[cargo]
  );

  const object = {
    type,
    broken: true,
    votes: removidos,
    partidos: partidosAlt,
    candidatos: removidosResult.eleitos,
    changed: {
      partidos: participacaoPartidaria,
      candidatos: candidatosEleitos,
    },
  };

  return object;
};

const getElegibleCandidates = ({ candidatos, root, perdidos }) => {
  const results = [];
  candidatos.forEach((candidato) => {
    const result = recursiveRound(1, perdidos, null, (mid) => {
      return testUnelected({
        candidato,
        perdidos: mid,
        root,
      });
    });

    if (!result?.result) {
      return;
    }

    results.push({
      ...result.candidato,
      extra: result.perdidos,
    });
  });

  return results;
};

const testUnelected = ({ candidato, root, perdidos }) => {
  let result = false;
  let partial = null;
  const _root = deepClone(root);
  _root.coligs = pumpUpCandidateVotes(_root.coligs, {
    candidato: candidato.nome,
    votos: perdidos,
  });

  const tested = getElectedCandidates(_root);

  if (!tested) {
    return { result };
  }

  const isElected = compareElectedCandidate(candidato, tested);

  if (isElected) {
    partial = { candidato, tested };
    result = true;
  }

  return { result, ...partial, perdidos };
};

const compareElectedCandidate = (candidato, result) => {
  let elected = false;
  forEachList(result.eleitos, (id, data) => {
    if (data.nome === candidato.nome) {
      elected = true;
    }
  });
  return elected;
};

export const getPossibleElegibleChanges = ({ root, perdidos, candidatos }) => {
  const candidates = getElegibleCandidates({ root, perdidos, candidatos });

  return candidates;
};

const recursiveRound = (start, end, latest, callback) => {
  if (start > end) {
    return latest;
  }

  const diff = Math.abs(end - start);
  const mid = Math.floor((start + end) / 2);
  const test = callback(mid);

  if (diff === 0) {
    return test.result ? test : latest;
  }

  if (test.result) {
    return recursiveRound(start, mid - 1, test, callback);
  }

  return recursiveRound(mid + 1, end, latest, callback);
};

const pumpUpCandidateVotes = (coligs, { candidato, votos }) => {
  const cloned = deepClone(coligs || {});
  forEachList(cloned, (id, cargos) => {
    forEachList(cargos, (name, data) => {
      if (!data.candidatos) {
        return;
      }
      if (data.candidatos[candidato]) {
        data.votes += votos;
        data.candidatos[candidato] += votos;
      }
    });
  });
  return cloned;
};

const tetsAllCandidates = ({
  root,
  original,
  testable,
  perdidos,
  partido,
  candidatos = false,
}) => {
  let result = false;
  const partidos = {};
  const eleitos = {};
  const reg = new RegExp(`-${partido}`, "mig");

  if (partido) {
    partidos[partido] = {
      votos: perdidos,
      eleitos: 0,
    };
  }

  for (let i = 0; i < testable.length; i += 1) {
    const candidato = testable[i];
    if (!candidato) {
      continue;
    }

    if (partido && !candidato.nome.match(reg)) {
      continue;
    }

    const _root = deepClone(root);

    _root.coligs = pumpUpCandidateVotes(_root.coligs, {
      candidato: candidato.nome,
      votos: perdidos,
    });

    const tested = getElectedCandidates(_root);

    if (!tested) {
      continue;
    }

    const changed =
      candidatos === true
        ? compareElectedCandidate(candidato, tested)
        : comparePartidos(original, tested);

    if (!changed) {
      continue;
    }

    result = true;

    if (candidatos) {
      if (!eleitos[candidato.nome]) {
        eleitos[candidato.nome] = {
          votos: perdidos,
        };
      } else if (eleitos[candidato.nome].votos < perdidos) {
        eleitos[candidato.nome].votos = perdidos;
      }
    }

    if (!tested?.partidos) {
      continue;
    }

    if (
      partido &&
      tested?.partidos[partido] &&
      tested.partidos[partido] > partidos[partido].eleitos
    ) {
      partidos[partido].eleitos = tested.partidos[partido];
      continue;
    }

    forEachList(tested.partidos, (partidoNumero, value) => {
      if (!partidos[partidoNumero]) {
        partidos[partidoNumero] = {
          votos: perdidos,
          eleitos: value,
        };
        return;
      }
      if (partidos[partidoNumero].eleitos < value) {
        partidos[partidoNumero].eleitos = value;
      }
    });
  }

  return { result, partidos, perdidos, eleitos };
};

export const getOptimalProportionalChange = ({
  root,
  original,
  perdidos,
  candidatos,
  partidos,
}) => {
  const minimal = perdidos * 10;

  const result = {
    partidos: {},
    minimal,
    broken: false,
    tested: perdidos,
  };

  forEachList(partidos, (partido) => {
    const experiment = recursiveRound(1, minimal, null, (mid) => {
      return tetsAllCandidates({
        testable: candidatos,
        perdidos: mid,
        original,
        root,
        partido,
        candidatos: false,
      });
    });
    if (!experiment?.result) {
      return;
    }

    if (result.minimal > experiment.perdidos) {
      result.minimal = experiment.perdidos;
    }

    result.partidos[partido] = experiment.partidos[partido];
  });

  if (perdidos > result.minimal) {
    result.broken = true;
  }

  return result;
};

export const compareEleitos = (resultA, resultB) => {
  let changed = 0;
  if (!resultB.eleitos?.length) {
    return 0;
  }
  resultB.eleitos.forEach(({ nome }) => {
    if (!resultA.eleitos.find((B) => B.nome === nome)) {
      changed += 1;
    }
  });

  return changed;
};

export const compareParticipacao = (resultA, resultB) => {
  let changed = 0;
  forEachList(resultA.participacao, (id, data) => {
    if (data !== resultB.participacao[id]) {
      changed += Math.abs(resultB.participacao[id] - data);
    }
  });
  return changed;
};

export const comparePartidos = (resultA, resultB) => {
  let changed = 0;
  if (!resultB.partidos) {
    return 0;
  }
  const partidos = [];

  forEachList(resultA.partidos, (id, data) => {
    if (partidos.indexOf(id) === -1) {
      partidos.push(id);
    }
  });

  forEachList(resultB.partidos, (id, data) => {
    if (partidos.indexOf(id) === -1) {
      partidos.push(id);
    }
  });

  partidos.forEach((partido) => {
    const participacaoB = resultB.partidos[partido] || 0;
    const participacaoA = resultA.partidos[partido] || 0;
    const abs = Math.abs(participacaoA - participacaoB);
    if (abs && abs > 0) {
      changed += abs;
    }
  });
  return changed;
};

export const getLegendasFromPartidos = (partidos) => {
  const legendas = {};
  let sum = 0;

  forEachList(partidos, (id, data) => {
    if (data?.legenda) {
      sum += data.legenda;
      legendas[id] = data.legenda;
    }
  });

  return {
    legendas,
    sum,
  };
};

export const getLegendasWithRemovidos = (partidos) => {
  const cloned = deepClone(partidos);
  let changed = 0;

  forEachList(cloned, (id, data) => {
    if (!data.legenda) {
      data.legenda = 0;
    }
    if (data.removidos) {
      changed += data.removidos;
      data.legenda += data.removidos;
      data.validos += data.removidos;
    }
  });

  cloned.total += changed;

  return getLegendasFromPartidos(cloned);
};

const clearColigacoesLimits = ({ coligacoes, limit }) => {
  let coligacoesFiltered = deepClone(coligacoes);
  let coligacoesRejected = deepClone(coligacoes);
  coligacoesFiltered = coligacoesFiltered.map((coligacao) => {
    const candidatos = coligacao.candidatos.filter((candidato) => {
      if (candidato.votos >= limit) {
        return true;
      }
      return false;
    });
    coligacao.candidatos = candidatos;
    return coligacao;
  });
  coligacoesRejected = coligacoesRejected.map((coligacao) => {
    const candidatos = coligacao.candidatos.filter((candidato) => {
      if (candidato.votos < limit) {
        return true;
      }
      return false;
    });
    coligacao.candidatos = candidatos;
    return coligacao;
  });

  return {
    coligacoesFiltered,
    coligacoesRejected,
  };
};

export const transformColigacoes = ({ coligs, legendasObject, cargo }) => {
  const coligacoes = [];
  const { legendas, sum } = legendasObject;
  let sumTotal = sum;
  let sumLegenda = 0;
  let sumNominais = 0;
  const vereadores = [];
  const allPartidos = [];

  forEachList(coligs, (id, data) => {
    if (data && data[cargo] && data[cargo].candidatos) {
      const { votes, candidatos } = data[cargo];
      const sorted = objectToOrderedArray(candidatos, ["nome", "votos"]);
      const _partidos = sorted.map(({ nome, votos }) => {
        sumNominais += votos;
        return nome.split("-")[1].slice(0, 2);
      });
      const uniquePartidos = arrayFilterUnique(_partidos);
      let sumVotes = votes;
      uniquePartidos.forEach((partido) => {
        if (legendas[partido]) {
          sumVotes += legendas[partido];
          sumLegenda += legendas[partido];
        }
      });
      allPartidos.push(...uniquePartidos);
      vereadores.push(...sorted);
      sumTotal += votes;
      coligacoes.push({ votes: sumVotes, candidatos: sorted, id });
    }
  });

  return {
    coligacoes,
    sumTotal,
    sumLegenda,
    sumNominais,
  };
};

const getQuocientePartidario = ({
  quocienteEleitoral,
  coligacoesFiltered,
  steps,
}) => {
  let filled = 0;
  const QPA = {};

  coligacoesFiltered.forEach((coligacao) => {
    const { votes, id, candidatos } = coligacao;
    if (!votes) {
      return;
    }
    steps.push([
      `QP - ${id}`,
      "Votos Válidos Coligação|Partido / Quociente Eleitoral",
      `${votes} / ${quocienteEleitoral}`,
      votes / quocienteEleitoral,
    ]);

    const qpa = Math.floor(votes / quocienteEleitoral);

    steps.push([
      `QP - ${id}`,
      "Arredondamento desconsiderando a fração",
      votes / quocienteEleitoral,
      qpa,
    ]);

    if (qpa > 0) {
      if (candidatos.length < qpa) {
        QPA[id] = coligacao.candidatos.length;
        filled += coligacao.candidatos.length;
        steps.push([
          `QP - ${id}`,
          "Confirmação de candidatos disponíveis",
          `${coligacao.candidatos.length} candidatos`,
          coligacao.candidatos.length,
        ]);
      } else {
        QPA[id] = qpa;
        filled += qpa;
        steps.push([
          `QP - ${id}`,
          "Confirmação de candidatos disponíveis",
          `${candidatos.length} candidatos`,
          qpa,
        ]);
      }
    }
  });
  steps.push([`QP`, "Total", `Vagas prenchidas com QP`, filled]);
  return { filled, quocientePartidario: QPA };
};

const distributeOther = ({
  rest,
  coligacoesFiltered,
  coligacoesRejected,
  quocientePartidario,
  mediaResto,
  steps,
}) => {
  let available = rest;
  let fromFiltered = true;
  while (available) {
    let largest = 0;
    let party = 0;
    let largestVotes = 0;
    let running = 0;
    const coligacoes =
      fromFiltered === true ? coligacoesFiltered : coligacoesRejected;

    for (let i = 0; i < coligacoes.length; i += 1) {
      const { id, candidatos, votes } = coligacoes[i];
      const sizeQuociente = quocientePartidario[id] || 0;
      const sizeMedia = mediaResto[id] || 0;
      const size = sizeQuociente + sizeMedia;

      const div = votes / (size + 1);

      steps.push([
        `Média - ${id}`,
        "Votos Válidos / (Vagas Adqiridas + 1)",
        `${votes} / ${size} + 1`,
        votes / (size + 1),
      ]);

      if (div < largest) {
        continue;
      }

      if (div === largest && votes <= largestVotes) {
        continue;
      }

      if (candidatos.length <= size) {
        if (running === coligacoes.length - 1) {
          if (fromFiltered === true) {
            fromFiltered = false;
            break;
          }
          return false;
        }
        continue;
      }

      largest = div;
      party = id;
      largestVotes = votes;
      running = 0;
    }

    if (party) {
      mediaResto[party] = mediaResto[party] + 1 || 1;
      available -= 1;
    }

    steps.push([
      `Média Parcial`,
      `Adicionado em ${party}`,
      `Medias atuais do partido`,
      mediaResto[party],
    ]);
  }
  return true;
};

const getCandidateParty = (nome) => {
  if (!nome?.match(/-/)) {
    return null;
  }
  return nome.split("-")[1].substring(0, 2);
};

const applyDistribuicao = ({ quocientePartidario, mediaResto, coligacoes }) => {
  const elected = [];
  const partidos = {};

  const getCandidate = ({ coligacao, elected }) => {
    return coligacao.candidatos.find((candidate) => {
      return !elected.find((cand) => cand.nome === candidate.nome);
    });
  };
  const populate = (object, type) => {
    forEachList(object, (id, data) => {
      const coligacao = coligacoes.find((colig) => colig.id === id);

      if (!coligacao) {
        return;
      }
      for (let i = 0; i < data; i += 1) {
        const candidate = getCandidate({ coligacao, elected });

        if (!candidate) {
          throw "#4424";
        }

        const partido = getCandidateParty(candidate.nome);

        partidos[partido] = partidos[partido] + 1 || 1;
        elected.push({
          ...candidate,
          type,
        });
      }
    });
  };

  populate(quocientePartidario, "qp");
  populate(mediaResto, "media");

  return {
    eleitos: elected.sort((a, b) => b.votos - a.votos),
    partidos,
  };
};

const orderCandidateAge = ({ coligacoes, cargo, candidatos }) => {
  const result = deepClone(coligacoes);
  const ages = {};
  forEachList(candidatos[cargo], (id, info) => {
    ages[id] = info.idade;
  });
  result.forEach(({ candidatos: list }, index) => {
    list.forEach((item) => {
      item.idade = ages[item.nome];
    });

    list
      .sort((a, b) => {
        if (a.idade > b.idade) {
          return -1;
        }
        if (a.idade < b.idade) {
          return 1;
        }
        return 0;
      })
      .sort((a, b) => {
        if (a.votos > b.votos) {
          return -1;
        }
        if (a.votos < b.votos) {
          return 1;
        }
        return 0;
      });

    result[index].candidatos = list;
  });
  return result;
};

const checkOriginal = () => {};

export const getElectedCandidates = ({
  vagas,
  cargo,
  coligs,
  legendasObject,
  generalSpread,
  locale = null,
  candidatos = null,
}) => {
  let { coligacoes, sumTotal } = transformColigacoes({
    coligs,
    legendasObject,
    cargo,
  });

  if (candidatos?.[cargo]) {
    coligacoes = orderCandidateAge({ coligacoes, cargo, candidatos });
  }

  const steps = [];

  steps.push([
    "Quociente Eleitoral",
    "Votos Válidos / Vagas",
    `${sumTotal} / ${vagas}`,
    sumTotal / vagas,
  ]);

  const quocienteEleitoral = limitedRound(sumTotal / vagas);
  steps.push([
    "Quociente Eleitoral",
    "Valor arredondado 107",
    sumTotal / vagas,
    quocienteEleitoral,
  ]);

  const limit = generalSpread === true ? quocienteEleitoral * 0.1 : 0;

  steps.push([
    "Limite",
    "10% do Quociente Eleitoral",
    `${quocienteEleitoral} * 0.10`,
    limit,
  ]);

  const { coligacoesFiltered, coligacoesRejected } = clearColigacoesLimits({
    coligacoes,
    limit,
  });

  const { filled, quocientePartidario } = getQuocientePartidario({
    coligacoes,
    quocienteEleitoral,
    coligacoesFiltered,
    steps,
  });

  const mediaResto = {};

  const distributionSuccess = distributeOther({
    rest: Math.abs(vagas - filled),
    quocientePartidario,
    mediaResto,
    coligacoesFiltered,
    coligacoesRejected,
    generalSpread,
    steps,
  });

  if (!distributionSuccess) {
    return null;
  }

  const result = applyDistribuicao({
    quocientePartidario,
    mediaResto,
    coligacoes,
  });

  if (candidatos && candidatos[cargo]) {
    const original = [];
    forEachList(candidatos[cargo], (id, info) => {
      let type = null;
      if (info?.resultado === 2) {
        type = "qp";
      }
      if (info?.resultado === 3) {
        type = "media";
      }
      if (!type) {
        return;
      }
      original.push({
        nome: id,
        votos: info.votos,
        type,
      });
    });

    if (original?.length) {
      const eleitos = result.eleitos;
      const missing = [];
      original.forEach((eleito) => {
        const find = eleitos.find((cand) => {
          if (cand.nome === eleito.nome) {
            return true;
          }
        });
        if (!find) {
          missing.push(eleito);
        }
      });
      if (missing?.length) {
      }
    }
  }

  return {
    validos: sumTotal,
    qe: quocienteEleitoral,
    qp: quocientePartidario,
    mr: mediaResto,
    steps,
    ...result,
  };
};
