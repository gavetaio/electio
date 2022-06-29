const { forEachList, getDeviationInfo } = require("../helpers");

const DIVERSION_BASE = 6;

const getPrevBox = (id, boxes) => {
  const prevId = id.replace(
    /^([^-]+)(-)([^-]+)(-)([^-]+)(-)(.*)/gim,
    "$1$2$3-1-$7"
  );
  if (boxes[prevId]) {
    return boxes[prevId];
  }
  return null;
};

const getBoxesDiff = (box1, box2) => {
  const max = Math.max(box1.absolutos.tamanho, box2.absolutos.tamanho);
  const min = Math.min(box1.absolutos.tamanho, box2.absolutos.tamanho);
  return max / min;
};

const getPresenceArray = ({ currentBoxes, boxes }) => {
  const presence = [];

  currentBoxes.forEach(({ id }) => {
    const currentBox = boxes[id];
    const prevBox = getPrevBox(id, boxes);

    if (!prevBox) {
      return;
    }

    presence.push(getBoxesDiff(currentBox, prevBox));
  });

  return presence.sort((a, b) => a - b);
};

const getComparedBoxes = (boxA, boxB) => {
  const result = {};
  if (boxA.absolutos.tamanho > boxB.absolutos.tamanho) {
    result.smallest = boxB;
    result.largest = boxA;
    return result;
  }

  result.smallest = boxA;
  result.largest = boxB;
  return result;
};

const getDeviationFromMeanOrderedArray = ({
  math,
  currentBoxes,
  boxes,
  callback,
}) => {
  const result = [];
  const differences = [];

  currentBoxes.forEach(({ id }) => {
    const currentBox = boxes[id];
    const prevBox = getPrevBox(id, boxes);

    if (!prevBox) {
      return;
    }

    const difference = getBoxesDiff(currentBox, prevBox);
    differences.push(difference);

    const deviationFromMean = Math.abs(difference - math.mean) / math.deviation;

    result.push(deviationFromMean);

    callback({ currentBox, prevBox, deviationFromMean });
  });

  return result.sort((a, b) => a - b);
};

const getErrorThreshold = ({ deviationFromMeanArray }) => {
  let threshold = 0;
  let largest = 0;
  for (let i = 1; i < deviationFromMeanArray.length; i += 1) {
    const current = deviationFromMeanArray[i];
    const prev = deviationFromMeanArray[i - 1] || 0;
    const diff = Math.abs(current - prev);

    if (largest) {
      if (current > DIVERSION_BASE && diff > largest * 40) {
        threshold = current;
        break;
      }
    }

    if (diff > largest) {
      largest = diff;
    }
  }

  return threshold;
};

const getZoneDistanceFromMeanArray = ({ currentBoxes, boxes }) => {
  const result = [];
  currentBoxes.forEach(({ id }) => {
    const currentBox = boxes[id];
    result.push({
      id,
      distance: currentBox.deviationsFromMean,
    });
  });
};

const getErroredBoxes = ({
  threshold,
  currentBoxes,
  boxes,
  math,
  deviationFromMeanArray,
  presence,
}) => {
  const result = [];

  currentBoxes.forEach(({ id }) => {
    const currentBox = boxes[id];
    const prevBox = getPrevBox(id, boxes);

    if (!prevBox) {
      return;
    }

    const { smallest } = getComparedBoxes(currentBox, prevBox);

    const difference = Math.abs(
      prevBox.absolutos.tamanho - currentBox.absolutos.tamanho
    );

    const percentage = smallest.absolutos.aptos
      ? Math.round(
          (100 * smallest.absolutos.tamanho) / smallest.absolutos.aptos
        )
      : 0;

    const deviationFromMean = smallest.presenceDeviationFromMean;

    if (deviationFromMean < threshold) {
      return;
    }

    if (percentage > 55) {
      return;
    }

    if (difference < 50) {
      return;
    }

    const extra = {
      difference,
      percentage,
      threshold,
      deviationFromMean,
      aptos: smallest.absolutos.aptos || 0,
      turno_1: prevBox.absolutos.tamanho,
      turno_2: currentBox.absolutos.tamanho,
      math,
      deviationFromMeanArray,
      presence,
    };

    result.push({ box: smallest, count: difference, extra });
  });

  return result;
};

export const investigateSizeDeviation = ({ resultados, boxes, callback }) => {
  if (!resultados.turno_2) {
    return null;
  }

  const currentTurno = resultados.turno_2;
  if (!currentTurno?.zonas) {
    return null;
  }

  const prevTurno = resultados.turno_1;
  if (!prevTurno?.zonas) {
    return null;
  }

  if (currentTurno.absolutos.tamanho < 50 && prevTurno.absolutos.tamanho < 50) {
    return null;
  }

  const result = [];

  forEachList(currentTurno.zonas, (zonaNumber, currentZona) => {
    const currentBoxes = currentZona.boxes;

    const presence = getPresenceArray({ currentBoxes, boxes });

    const zonaPresence = {};

    zonaPresence.data = presence;
    zonaPresence.deviations = [];

    if (!presence?.length > 10) {
      return;
    }

    const math = getDeviationInfo(presence);

    zonaPresence.calculations = math;

    const deviationFromMeanArray = getDeviationFromMeanOrderedArray({
      math,
      currentBoxes,
      boxes,
      callback: ({ currentBox, prevBox, deviationFromMean }) => {
        currentBox.presenceDeviationFromMean = deviationFromMean;
        prevBox.presenceDeviationFromMean = deviationFromMean;
      },
    });

    zonaPresence.deviationsFromMean = deviationFromMeanArray;

    const errorThreshold = getErrorThreshold({
      deviationFromMeanArray,
      math,
    });

    zonaPresence.errorThreshold = errorThreshold;

    if (!errorThreshold) {
      return;
    }

    const errored = getErroredBoxes({
      threshold: errorThreshold,
      currentBoxes,
      boxes,
      math,
      deviationFromMeanArray,
      presence,
    });

    if (!errored.length) {
      return;
    }

    const zonaDistancesFromMean = getZoneDistanceFromMeanArray({
      currentBoxes,
      boxes,
    });

    zonaPresence.distancesFromMean = zonaDistancesFromMean;

    result.push({
      zonaNumber,
      zonaPresence,
      errored,
    });
  });

  if (result.length) {
    result.forEach(({ zonaNumber, zonaPresence, errored }) => {
      errored.forEach(({ box, count, extra }) => {
        const { cargos, turno } = box;
        const turnoData = resultados[`turno_${turno}`];

        let multiplier = 0;
        forEachList(turnoData.multipliers, (cargo, number) => {
          multiplier += number;
        });

        const eleitores = extra.difference
          ? Math.floor(extra.difference * 0.95)
          : 0;
        const perdidos = eleitores * multiplier;

        extra.distances = zonaPresence.distancesFromMean;

        callback({
          turno: "1",
          scope: box.scope,
          path: `zonas.${zonaNumber}.presence`,
          value: zonaPresence,
        });

        callback({
          turno: "1",
          scope: box.scope,
          path: `zonas.${zonaNumber}.presence`,
          value: zonaPresence,
        });

        if (perdidos) {
          forEachList(cargos, (id, data) => {
            callback({
              id: box.id,
              turno: box.turno,
              scope: box.scope,
              path: `cargos.${id}.perdidos`,
              add: eleitores * turnoData.multipliers[id],
            });
          });
        }

        callback({
          id: box.id,
          turno: box.turno,
          scope: box.scope,
          path: "absolutos.perdidos",
          add: perdidos,
        });

        callback({
          id: box.id,
          path: `problemas`,
          push: {
            type: "SIZE_DIFFERENCE",
            count: perdidos,
            extra,
          },
        });

        callback({
          turno: box.turno,
          scope: box.scope,
          path: `problemas`,
          push: {
            id: box.id,
            type: "SIZE_DIFFERENCE",
            count: perdidos,
            extra,
          },
        });
      });
    });
  }

  return result;
};
