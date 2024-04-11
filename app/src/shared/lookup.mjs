import { load } from './load.mjs';

const lookup = new Map();


async function initLookup() {
  const data = await load('codes');

  data.map(function(d) {
    const { code, name } = d;
    const obj = { code, name };
    obj.entity = d.entity || 'local authority';
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