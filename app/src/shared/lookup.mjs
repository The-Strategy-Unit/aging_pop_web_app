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
    .sort(function(a, b) {
      if (a.entity !== b.entity) {
        return a.entity === 'nation' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    })
    .forEach(function(d) {
      lookup.set(d.code, d);
    });
}


export { lookup, initLookup };