import { load } from '../shared/load.mjs';
import { lookup } from '../shared/lookup.mjs';
import { variants, assumptions } from '../shared/variants.mjs';

let getState, setState, getData;

const defaultConverter = v => v === null ? '' : v;

const stateConverters = {
  area: defaultConverter,
  variant: defaultConverter,
  year: v => v === null ? NaN : parseInt(v),
  refYear: v => v === null ? null : parseInt(v),
  animating: v => !!v
};


function createAppState(container) {
  const state = Object.entries(stateConverters)
    .reduce(function(obj, [key, converter]) {
      obj[key] = converter(null);
      return obj;
    }, {});

  const data = {};

  const trigger = function(evtType, detail) {
    const customEvent = new CustomEvent(evtType, { detail });
    container.node().dispatchEvent(customEvent);
  };

  setState = function(values) {
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

    if (!updatedList.size) { return; }
    
    if (updatedList.has('area')) { setAreaData(); }
    else if (updatedList.has('variant')) { setVariantData(); }
    else if (updatedList.has('year')) { setYearData(); }

    if (updatedList.has('refYear')) { setRefYearData(); }
    if (updatedList.has('animating')) { triggerAnimatingEvent(); }
  };

  getState = function(prop) {
    return state[prop];
  };

  getData = function(prop) {
    return data[prop];
  };

  const setAreaData = async function() {
    const info = lookup.get(state.area);
    data.name = info.name;
    data.url = info.pyramidUrl;
    data.area = await load(data.url);
    
    data.max = data.area
      .map(function(d) {
        const { year, data } = d;
        return data.reduce(function(max, d) {
          d.yob = year - (d.under - 1);
          d.yobClass = `labels-${d.yob}`;
          return Math.max(max, d.m, d.f);
        }, 0);
      })
      .reduce((max, d) => Math.max(max, d), 0);

    trigger('areadatachange');
    setVariantData();
  };
  
  const setVariantData = function() {
    const vOptions = ['v0', state.variant];
    data.variant = data.area.filter(d => vOptions.includes(`v${d.variant}`));

    const code = variants[state.variant].short;
    const parts = code.match(/(B|L|M)\d/g);
    data.assumptions = [code].concat(parts.map(d => assumptions[d]));

    trigger('variantdatachange');
    setYearData();
    if (state.refYear !== null) { setRefYearData(); }
  };
  
  const setYearData = function() {
    data.year = data.variant.find(d => d.year === state.year);
    trigger('yeardatachange');
  };

  const setRefYearData = function() {
    const refYear = state.refYear;

    if (refYear === null) {
      data.refYear = null;
    }
    else {
      data.refYear = { m: [], f:[] };

      data.variant.find(d => d.year === refYear).data
        .forEach(function(d) {
          for(const key of ['m', 'f']) {
            const arr = data.refYear[key];
            arr.push({ under: d.under - 1, total: d[key] });
            arr.push({ under: d.under, total: d[key] });
          }
        });
    }

    trigger('refyeardatachange');
  };

  const triggerAnimatingEvent = function() {
    trigger('animatingchange');
  };
}


export { getState, setState, getData, createAppState };