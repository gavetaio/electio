import find from 'lodash/find';
import { pushUnique } from '../general';

export const getBoxById = (id, boxes) => {
  return find(boxes, { id });
};

const getExtra = (reg, problemas) => {
  let cargoList = [];
  const item = problemas.find((info) => {
    return info?.type ? !!info.type.match(reg) : !!info.match(reg);
  });

  if (!item) {
    return null;
  }

  if (Array.isArray(item.extra) && item.extra?.length) {
    item.extra.forEach(({ nome }) => {
      pushUnique(cargoList, nome);
    });
  } else {
    cargoList = item.extra;
  }

  return cargoList;
};

export const transformBoxesTable = (boxes, problema) => {
  const result = [];
  const reg = new RegExp(problema, 'mig');

  const name = problema.match(/exposed/gim) ? 'expostos' : 'perdidos';

  for (let i = 0; i < boxes.length; i += 1) {
    const {
      uf,
      id,
      municipio,
      absolutos,
      problemas,
      cargos,
      status,
      other = null,
    } = boxes[i];
    const splitId = id.split('-');
    let extra = null;

    if (problemas?.length) {
      extra = getExtra(reg, problemas);
    }

    const isFederal = !cargos?.prefeito && !cargos?.vereador;

    const row = {
      id,
      ano: splitId[1],
      uf,
      turno: splitId[2],
      municipio,
      extra,
      zona: splitId[4],
      secao: splitId[5],
      comparecimento: absolutos.tamanho,
      count: absolutos[`${name}`] || extra?.count || 0,
      isFederal,
      status,
      other,
    };

    result.push(row);
  }

  return result;
};
