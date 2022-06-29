const { forEachList } = require("../../helpers");

export const wouldPassFifty = ({ votos, validos, change }) => {
  const total = validos + change;
  const local = votos + change;
  return local / total > 0.5;
};

export const wouldPassMajor = ({ votos, eleito, change }) => {
  const local = votos + change;
  return local > eleito;
};

export const getCandidatosSortedList = (
  candidatos,
  cargo,
  available = true
) => {
  const listObject = candidatos[cargo];
  const listArray = [];

  forEachList(listObject, (nome, { votos, resultado, situacao }) => {
    if (available && situacao === 0) {
      listArray.push({ nome, votos, resultado, situacao });
      return;
    }
    listArray.push({ nome, votos, resultado, situacao });
  });

  listArray.sort((a, b) => b.votos - a.votos);
  return listArray;
};

export const checkMajorityExplosionByVotes = ({
  candidatos,
  deletados,
  validos,
  nulledBefore,
}) => {
  if (!deletados || !candidatos.length) {
    return null;
  }

  const result = { minimal: 0, broken: false, candidatos: [] };
  const winner = candidatos[0];

  if (deletados > validos) {
    result.revokable = true;
  }

  if (winner.resultado === 1 && candidatos.length === 1) {
    if (!nulledBefore) {
      result.final = true;
      result.broken = false;
      return result;
    }

    result.final = true;

    result.revokable = true;
    result.broken = true;

    return result;
  }

  if (candidatos.length === 1) {
    return result;
  }

  const runnerUpIndex = candidatos.findIndex(
    (data) => data.resultado !== 1 && data.resultado !== 6
  );
  const runnerUp = candidatos[runnerUpIndex];
  const previousRunner = candidatos[runnerUpIndex - 1];

  result.minimal = Math.abs(
    (previousRunner?.votos || 0) - (runnerUp?.votos || 0)
  );

  result.candidatos = [];
  candidatos.forEach((candidato) => {
    if (candidato.resultado === 1 || candidato.resultado === 6) {
      return;
    }
    const diff = (previousRunner?.votos || 0) - (candidato?.votos || 0);
    if (diff > deletados) {
      return;
    }
    result.candidatos.push({ ...candidato, diff });
  });

  if (winner.resultado !== 1 && winner.resultado !== 6) {
    if (nulledBefore) {
      result.final = true;
      result.nulled = true;
      result.broken = true;
      return result;
    }
  }

  if (winner.resultado === 6) {
    result.final = false;
    result.brokenPeriod = wouldPassFifty({
      validos,
      votos: winner?.votos || 0,
      change: deletados,
    });
    result.broken = wouldPassMajor({
      eleito: previousRunner?.votos || 0,
      votos: runnerUp?.votos || 0,
      change: deletados,
    });

    return result;
  }

  if (previousRunner?.resultado === 1 && runnerUp?.resultado !== 1) {
    result.final = true;

    result.broken = wouldPassMajor({
      eleito: previousRunner.votos,
      votos: runnerUp.votos,
      change: deletados,
    });

    if (result.broken) {
      result.scale = (deletados / result.min).toFixed(2) * 1;
    }

    return result;
  }

  return null;
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
