import { applyFilter } from '@gavetaio/core';
import { chartObjectToData } from 'renderer/helpers/data';

export const filteredNullBoxes = ({ boxes, filters }) => {
  const header = [
    'Cidade',
    'Ano',
    'UF',
    'Turno',
    'Zona',
    'Seção',
    'Comparecimento',
    'Votos Perdidos',
    'Status',
  ];

  const result: any = [];
  const groupBy = filters?.groups?.length ? filters.groups[0] : 'ano';

  const chart: any = {
    federal: {},
    municipal: {},
  };

  boxes.forEach((box) => {
    const {
      ano,
      uf,
      turno,
      municipio,
      zona,
      secao,
      comparecimento,
      count,
      status,
      isFederal,
    } = box;

    if (ano === '1994') {
      return;
    }

    const chartType = isFederal ? 'federal' : 'municipal';
    const group = groupBy === 'uf' ? uf : ano;

    if (!applyFilter({ filters, ano, uf })) {
      return;
    }

    if (!chart[chartType][group]) {
      chart[chartType][group] = {
        count: 0,
      };
    }

    chart[chartType][group].count += count;

    const row = [
      municipio,
      ano,
      uf,
      { value: turno },
      { value: zona },
      { value: secao },
      { value: comparecimento, label: comparecimento || '-' },
      { value: count },
      status,
      '-',
    ];

    result.push({
      data: row,
    });
  });

  return {
    table: {
      header,
      data: result,
      sortDefault: 1,
      footer: ['count', '', '', '', '', '', 'average', 'sum', ''],
    },
    chart: {
      title: 'Gráfico',
      labelX: 'ano eleitoral',
      labelY: 'número de votos anulados',
      ...chartObjectToData(chart),
    },
  };
};
