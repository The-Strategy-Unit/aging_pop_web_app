import { load } from './load.mjs';

const dataPath = '/data';
const codesUrl = `${dataPath}/codes.json`;

const lookup = new Map();


async function initLookup() {
  const data = await load(codesUrl);

  data.map(function(d) {
    const { code, name } = d;
    const obj = { code, name };
    obj.entity = d.entity || 'local authority';
    obj.pyramidUrl = `${dataPath}/pyramid/${code}.csv`;
    obj.lineChartsUrl = `${dataPath}/line-charts/${code}.csv`;
    obj.histogramsUrl = `${dataPath}/histograms/${code}.json`;
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