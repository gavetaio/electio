import { deepClone } from './general';

export const transformGraphLegacy = (chart) => {
  if (!chart?.data) {
    return null;
  }

  const cloned = deepClone(chart);

  if (cloned?.labels?.length) {
    const lines = [];
    cloned.data.forEach((item) => {
      const line = [];
      cloned.labels.forEach((label, index) => {
        line.push([label, item.data[index]]);
      });
      lines.push(line);
    });

    cloned.data = lines;
  }

  return cloned;
};

export const getDataObject = (list, initial) => {
  const getInitial = (item) => {
    if (initial?.length) {
      return initial.indexOf(item) !== -1;
    }
    if (!initial) {
      return false;
    }
    return true;
  };

  return list.map((item) => {
    return {
      value: item,
      label: item,
      selected: getInitial(item),
    };
  });
};
