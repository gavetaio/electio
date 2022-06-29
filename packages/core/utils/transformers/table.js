import { forEachList, getPercentageString } from '../general';

export const getTableCell = ({
  label = null,
  value = 0,
  extra = null,
  connected = false,
} = {}) => {
  return {
    label: label || value || '—',
    value,
    extra,
    connected,
  };
};

export const getInfoCell = (label, votes, total, type = null) => {
  return {
    type,
    data: [
      label,
      {
        value: votes,
        extra: getPercentageString(votes, total),
      },
    ],
  };
};

export const createTableCellObject = (obj) => {
  const cell = {};
  forEachList(obj, (key, value) => {
    if (typeof value === 'object') {
      cell[key] = getTableCell(value);
      return;
    }
    cell[key] = getTableCell({ value });
  });
  return cell;
};

export const objectToTable = (obj) => {
  const keys = Object.keys(obj);
  const result = [];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    result.push(obj[key]);
  }
  return result;
};
