import { load } from './load.mjs';

const dataPath = '/data';
const codesUrl = `${dataPath}/codes.json`;

const lookup = new Map();


async function initLookup() {
  const data = await load(codesUrl);

  data.forEach(function(d) {
    const { code, name } = d;
    const obj = { code, name };
    obj.entity = d.entity || 'local authority';
    obj.pyramidUrl = `${dataPath}/pyramid/${code}.csv`;
    obj.lineChartsUrl = `${dataPath}/line-charts/${code}.csv`;
    obj.histogramsUrl = `${dataPath}/histograms/${code}.json`;
    lookup.set(code, obj);
  });
}


export { lookup, initLookup };