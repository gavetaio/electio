import find from 'lodash/find';

export const getBoxById = (id, boxes) => {
  return find(boxes, { id });
};

export const average = (arr: any) => {
  return arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
};

export const pushUnique = (array, item) => {
  if (array.indexOf(item) === -1) {
    array.push(item);
  }
};

export const getBoxProblemas = (box) => {
  const problemas = [];
  if (box.absolutos.perdidos) {
    problemas.push(['Votos Perdidos', box.absolutos.perdidos]);
  }
  return problemas;
};

export const getBoxProblemasTable = (box) => {
  const table = {
    danger: true,
    header: ['Problema', ''],
    data: null,
  };
  const problemas = getBoxProblemas(box);

  if (problemas?.length) {
    table.data = problemas;
  }

  return table;
};

export const getElectionProblemasDataRow = (election) => {
  const problemas = [];
  if (election.problemas) {
    election.problemas.forEach((problema) => {
      let label = problema.type;
      let impact = `${problema.count} votos`;
      if (problema.type === 'EXPOSED_VOTES') {
        label = 'SIGILO QUEBRADO';
      }
      if (problema.type === 'NULL_BOX') {
        label = 'URNAS ANULADAS';
        impact = `${problema.count} votos perdidos`;
      }
      const splitted = problema.id.split('-');
      const city = election.cidades[splitted[3]];
      problemas.push([problema.id, city.nome, label, impact]);
    });
  }
  return problemas;
};

export const getElectionsProblemasTable = (election) => {
  const table = {
    danger: true,
    header: ['Urna', 'Cidade', 'Problema', 'Impacto'],
    data: null,
  };
  const problemas = getElectionProblemasDataRow(election);

  if (problemas?.length) {
    table.data = problemas;
  }

  return table;
};

export const chartObjectToData = (chart) => {
  const keys = Object.keys(chart);
  const lines = [];
  if (keys?.length) {
    keys.forEach((key) => {
      const line = { label: key, points: [] };
      const keys = Object.keys(chart[key]);
      keys.forEach((k) => {
        const { count, total } = chart[key][k];
        let value = count;
        if (total) {
          value = count / total;
        }
        line.points.push([k, value]);
      });
      if (line?.points?.length) {
        lines.push(line);
      }
    });
  }

  return { data: lines };
};
