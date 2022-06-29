const formatter = new Intl.RelativeTimeFormat('pt-BR', {
  numeric: 'auto',
});

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
];

function formatTimeAgo(date: Date) {
  // @ts-ignore
  let duration = (date - new Date()) / 1000;

  for (let i = 0; i <= DIVISIONS.length; i += 1) {
    const division = DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      // @ts-ignore
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return null;
}

const roundTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const transformFileList = ({ jsons }) => {
  const loaded = {
    files: [],
    years: [],
    sum: 0,
  };

  const years = [];
  jsons.map((item: any) => {
    loaded.sum += item.size;
    const time = formatTimeAgo(new Date(item.time));
    const year = item.name.replace(/(.*)([0-9]{4})(.*)/gim, '$2');

    if (years.indexOf(year) === -1) {
      loaded.years.push({ label: year, value: year });
      years.push(year);
    }

    // const id = item.name.replace(/\.json/, '').trim();
    // let type = null;

    const isLoaded = false;
    const size: number = roundTwo(item.size / 1000 / 1000);
    loaded.files.push({
      type: isLoaded ? null : 'disabled',
      data: [
        item.name,
        {
          value: size,
          label: `${Math.round(size * 1024)}`,
        },
        {
          label: time,
          value: Math.round(item.time),
        },
      ],
    });
  });
  return loaded;
};
