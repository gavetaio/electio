const { forEachList } = require("../helpers");
const { LoggerSingleton } = require("../../log");

const { log } = LoggerSingleton.getInstance();

export const investigateTransitionBoxes = ({ resultados, boxes, callback }) => {
  let total = 0;

  forEachList(boxes, (id, data) => {
    const { transition } = data;
    if (!transition) {
      return;
    }
    total += 1;
  });

  if (total) {
    log(`TRANSITION BOXES ${total}`);
  }
};
