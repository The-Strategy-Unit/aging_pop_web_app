// Useful functions used in subapplication state.mjs files

const defaultConverter = v => v === null ? '' : v;


function createStateObject(stateConverters) {
  return Object.entries(stateConverters)
    .reduce(function(obj, [key, converter]) {
      obj[key] = converter(null);
      return obj;
    }, {});
}


function createStateUpdater(state, stateConverters) {
  return function(values) {
    const updatedList = new Set();

    Object.keys(state).forEach(function(key) {
      if (!Object.hasOwn(values, key)) { return; }
      const rawVal = values[key];
      const val = stateConverters[key](rawVal);
      if (val !== state[key]) {
        state[key] = val;
        updatedList.add(key);
      }
    });

    return updatedList;
  };
}


function createTrigger(container) {
  const el = container.node();

  return function(evtType, detail) {
    const customEvent = new CustomEvent(evtType, { detail });
    el.dispatchEvent(customEvent);
  };
}


export { defaultConverter, createStateObject, createStateUpdater, createTrigger };
