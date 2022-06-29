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

export const createChartObject = ({ x, y, data }) => {
  const dataObj = Array.isArray(data) ? { data } : chartObjectToData(data);
  return {
    ...dataObj,
    labelX: x,
    labelY: y,
  };
};
