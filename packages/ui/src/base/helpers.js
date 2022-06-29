function end(element, type, { tolerance = 0, propertyName } = {}) {
  return new Promise((resolve) => {
    if (!element) {
      resolve(false);
      return;
    }
    let eventName = null;
    const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
    let run = 0;
    function end(event) {
      const target = event.srcElement || event.target;
      if (target === element) {
        if (run >= tolerance) {
          if (propertyName && propertyName !== event.propertyName) {
            return;
          }
          element.removeEventListener(eventName, end);
          resolve(event);
        }
        run += 1;
      }
    }
    if (element.style[`Webkit${capitalized}`] !== undefined) {
      eventName = `webkit${capitalized}End`;
    }
    if (element.style.OTransition !== undefined) {
      eventName = `o${type}End`;
    }
    if (element.style[type] !== undefined) {
      eventName = `${type}end`;
    }
    if (element.clearEvent) {
      element.clearEvent();
    }
    element.clearEvent = function () {
      element.removeEventListener(eventName, end);
    };
    element.addEventListener(eventName, end);
  });
}

export function onTransitionEnd(element, options = {}) {
  return new Promise((resolve) => {
    end(element, "transition", options).then(resolve);
  });
}
