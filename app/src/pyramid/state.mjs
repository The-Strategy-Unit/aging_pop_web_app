import { load } from '../shared/load.mjs';
import { lookup } from '../shared/lookup.mjs';
import { variants, assumptions } from '../shared/variants.mjs';
import * as utils from '../shared/state.mjs';

let getState, setState, getData;


const stateConverters = {
  area: utils.defaultConverter,
  variant: utils.defaultConverter,
  year: v => v === null ? NaN : parseInt(v),
  refYear: v => v === null ? null : parseInt(v),
  animating: v => !!v
};


function createAppState(container) {
  const state = utils.createStateObject(stateConverters);
  const data = {};
  const trigger = utils.createTrigger(container);
  const updateState = utils.createStateUpdater(state, stateConverters);

  setState = function(values) {
    const updatedList = updateState(values);
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
    data.file = info.pyramidFile;
    data.area = await load(data.file);
    
    data.max = data.area
      .map(function(d) {
        const { year, data } = d;
        return data.reduce(function(max, d) {
          d.yob = year - d.age;
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
    data.variant = data.area.filter(d => vOptions.includes(d.variant));

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
            arr.push({ age: d.age, total: d[key] });
            arr.push({ age: d.age + 1, total: d[key] });
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