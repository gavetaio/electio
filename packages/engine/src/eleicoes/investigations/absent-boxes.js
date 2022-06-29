const { forEachList, getOtherBox } = require("@gavetaio/core");

export const investigateAbsentBoxes = ({ resultados, boxes, callback }) => {
  forEachList(boxes, (id, data) => {
    const { turno, scope, codigo, absolutos, municipio } = data;
    const { tamanho, aptos } = absolutos;

    if (!aptos) {
      return;
    }

    const presence = ((100 * tamanho) / aptos).toFixed(2);

    if (presence < 30) {
      const other = getOtherBox(data, boxes);

      const extra = {
        codigo,
        aptos,
        tamanho,
        municipio,
      };

      if (other) {
        extra.other = {
          tamanho: other.absolutos.tamanho,
        };
      }

      callback({
        turno,
        scope,
        path: `boxes.faltantes`,
        push: {
          id,
          count: presence,
          extra,
        },
      });
    }
  });
};
