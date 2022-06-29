const { forEachList, getDeviationInfo } = require("../helpers");

const ERROR_MULTIPLIER = 5 / 2;
const DEVIATION_THRESHOLD = 9 / 2;

const getVotedCargoFromValidos = (cargo, validos) => {
  const reg = new RegExp(`^${cargo}-(.*)`, "mig");
  let result = 0;
  validos.forEach((voto) => {
    if (voto.nome.match(reg)) {
      result += 1;
    }
  });
  return result;
};

const getVotesArray = ({ zonaBoxes, boxes }) => {
  const result = [];
  zonaBoxes.forEach(({ id }) => {
    const box = boxes[id];
    const boxData = {};

    if (box.transition) {
      return;
    }

    if (!box.validos?.length) {
      return;
    }

    forEachList(box.cargos, (cargo, data) => {
      boxData[`${cargo}`] = getVotedCargoFromValidos(cargo, box.validos);
    });

    result.push(boxData);
  });
  return result;
};

const getCargosOrderedArray = (votingBunch) => {
  const result = {};
  votingBunch.forEach((votes) => {
    forEachList(votes, (cargo, data) => {
      if (!result[`${cargo}`]) {
        result[`${cargo}`] = [];
      }
      result[`${cargo}`].push(data);
    });
  });

  forEachList(result, (cargo, data) => {
    result[`${cargo}`] = data.sort((a, b) => a - b);
  });

  return result;
};

const getDeviationFromMeanOrderedArray = ({ votesMath, zonaBoxes, boxes }) => {
  const result = {};
  zonaBoxes.forEach(({ id }) => {
    const box = boxes[id];
    const current = {};

    forEachList(box.cargos, (cargo) => {
      if (!result[cargo]) {
        result[cargo] = [];
      }
      const votos = getVotedCargoFromValidos(cargo, box.validos);
      const dispersion =
        Math.abs(votos - votesMath[cargo].mean) / votesMath[cargo].deviation;

      current[cargo] = dispersion;
      result[cargo].push(dispersion);
    });

    box.voteDeviation = current;
  });

  forEachList(result, (cargo, data) => {
    result[`${cargo}`] = data.sort((a, b) => a - b);
  });

  return result;
};

const getVotesDispersionMath = (votesOrdered) => {
  const result = {};
  forEachList(votesOrdered, (cargo, data) => {
    result[`${cargo}`] = getDeviationInfo(data);
  });
  return result;
};

const getErrorThreshold = ({ deviationFromMeanArray, math }) => {
  let threshold = 0;

  for (let i = 1; i < deviationFromMeanArray.length; i += 1) {
    const current = deviationFromMeanArray[i];
    const prev = deviationFromMeanArray[i - 1];
    const error = current - prev;

    if (error >= math.error * ERROR_MULTIPLIER) {
      threshold = current;
      break;
    }
  }

  return threshold;
};

const getErroredBoxes = ({
  threshold,
  zonaBoxes,
  boxes,
  votesMath,
  cargosDeviationFromMean,
  votesOrdered,
}) => {
  const erroredBoxes = [];

  zonaBoxes.forEach(({ id }) => {
    const box = boxes[id];
    const result = {};
    const errored = [];

    forEachList(box.cargos, (cargo) => {
      if (!result[cargo]) {
        result[cargo] = [];
      }
      if (
        box.voteDeviation[cargo] >= threshold[cargo] &&
        box.voteDeviation[cargo] > DEVIATION_THRESHOLD
      ) {
        errored.push(cargo);
      }
    });

    if (!errored.length) {
      return;
    }

    const extra = {};
    let count = 0;

    errored.forEach((cargo) => {
      extra[cargo] = {
        fromMean: cargosDeviationFromMean[cargo],
        votesOrdered: votesOrdered[cargo],
        threshold: threshold[cargo],
        limit:
          threshold[cargo] * votesMath[cargo].deviation + votesMath[cargo].mean,
        deviation: box.voteDeviation[cargo],
        math: votesMath[cargo],
      };
      count += box.cargos[cargo].total;
    });

    erroredBoxes.push({ box, count, extra });
  });

  return erroredBoxes;
};

export const investigateVoteDeviation = ({ resultados, boxes, callback }) => {
  const turno = resultados.turno_1;

  if (!turno.validos) {
    return;
  }

  const result = [];

  forEachList(turno.zonas, (zonaNumber, zona) => {
    if (zonaNumber != "3") {
      return;
    }
    const zonaBoxes = zona.boxes;
    const votesRaw = getVotesArray({ zonaBoxes, boxes });
    const votesOrdered = getCargosOrderedArray(votesRaw);
    const votesMath = getVotesDispersionMath(votesOrdered);
    const cargosDeviationFromMean = getDeviationFromMeanOrderedArray({
      votesMath,
      zonaBoxes,
      boxes,
      callback,
    });

    const threshold = {};
    forEachList(cargosDeviationFromMean, (cargo, data) => {
      const errorThreshold = getErrorThreshold({
        deviationFromMeanArray: data,
        math: votesMath[cargo],
      });

      threshold[cargo] = errorThreshold;
    });

    const errored = getErroredBoxes({
      threshold,
      zonaBoxes,
      boxes,
      votesMath,
      cargosDeviationFromMean,
      votesOrdered,
    });

    result.push({
      zonaNumber,
      errored,
    });
  });

  if (result.length) {
    result.forEach(({ zonaNumber, zonaPresence, errored }) => {
      errored.forEach(({ box, count, extra }) => {
        callback({
          id: box.id,
          path: `problemas`,
          push: {
            type: "VOTE_DISPERSION",
            count,
            extra,
          },
        });

        callback({
          turno: box.turno,
          scope: box.scope,
          path: `problemas`,
          push: {
            id: box.id,
            type: "VOTE_DISPERSION",
            count,
            extra,
          },
        });
      });
    });
  }
  return result;
};
