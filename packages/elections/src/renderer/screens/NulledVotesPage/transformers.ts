import {
  forEachList,
  objectToTable,
  createTableCellObject,
} from '@gavetaio/core';
import { chartObjectToData } from 'renderer/helpers/data';

export const filteredNulledSummary = ({ byYear }) => {
  const list = byYear;

  const header = ['Ano / Turno', 'Eleitores', 'Votos', 'Excluídos'];
  const result = [];
  const groups = {};

  const chart: any = {
    federal: {},
    municipal: {},
  };

  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];

    const { turno, id, comparecimento, votos, recursados, isFederal } = item;

    const chartName = isFederal ? 'federal' : 'municipal';

    const key = `${id}-${turno}`;

    if (!chart[chartName][id]) {
      chart[chartName][id] = {
        count: 0,
        total: 0,
      };
    }

    chart[chartName][id].count += recursados;

    const cell = createTableCellObject({
      id: key,
      comparecimento,
      votos,
      removidos: {
        value: recursados,
        connected: true,
      },
    });

    result.push(objectToTable(cell));
  }

  return {
    table: {
      header,
      firstRow: 12,
      title: 'Dados',
      data: result,
      footer: ['count', 'sum', null, 'sum'],
    },

    chart: chartObjectToData(chart),
  };
};
