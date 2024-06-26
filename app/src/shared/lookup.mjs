import { load } from './load.mjs';

const lookup = new Map();


// Create a lookup from area code to
// name and associated data files
async function initLookup() {
  const data = await load('codes');

  data.map(function(d) {
    const { code, name } = d;
    const obj = { code, name };
    obj.pyramidFile = `pyramid/${code}`;
    obj.lineChartsFile = `line-charts/${code}`;
    obj.histogramsFile = `histograms/${code}`;
    return obj;
  })
    .forEach(function(d) {
      lookup.set(d.code, d);
    });
}


export { lookup, initLookup };