import { createChartObject, applyFilter } from '@gavetaio/core';

export const filteredExposedByBoxExposed = ({
  boxes,
  navigate,
  filters,
}: any) => {
  const header = [
    'Ano',
    'Cargos',
    'UF/Turno',
    'Cidade',
    'Zona/Seção',
    'Comparecimento',
    'Votos Expostos',
  ];
  const result: any = [];
  const chart: any = {
    federal: {},
    municipal: {},
  };

  const groupBy = filters?.groups?.length ? 'ano' : filters.groups[0];

  boxes.forEach((box) => {
    const {
      id,
      ano,
      uf,
      turno,
      municipio,
      extra,
      zona,
      secao,
      comparecimento,
      count,
      isFederal,
    } = box;

    if (!applyFilter({ filters, ano, uf, cargos: extra })) {
      return;
    }

    const extraList = extra.map((item) => {
      const split = item.split('-');
      let initial = split[0].slice(0, 1);
      if (split[0].match(/federal/)) {
        initial = 'f';
      }
      if (split[0].match(/estadual/)) {
        initial = 'e';
      }
      return `${split[0]}-${split[1]}`;
    });

    const row = [
      {
        value: ano * 1,
        label: ano,
        onClick: (event) => {
          navigate(id, { event });
        },
      },
      { list: extraList },
      `${uf}/${turno}`,
      municipio,
      `${zona}/${secao}`,
      comparecimento,
      count,
    ];

    const chartType = isFederal ? 'federal' : 'municipal';

    const group = groupBy === 'uf' ? uf : ano;

    if (!chart[chartType][group]) {
      chart[chartType][group] = {
        count: 0,
        total: 0,
      };
    }

    chart[chartType][group].count += count;

    result.push({
      data: row,
    });
  });

  const chartObj = createChartObject({
    x: 'Ano Eleitoral',
    y: 'Votos com sigilo quebrado',
    data: chart,
  });

  return {
    table: {
      title: 'Dados',
      header,
      data: result,
      sortDefault: 7,
      footer: ['count', '', '', '', '', 'sum', 'sum'],
    },
    chart: chartObj,
  };
};
