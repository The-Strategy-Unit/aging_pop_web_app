import { lookup } from '../shared/lookup.mjs';
import * as utils from '../shared/state.mjs';
import { load } from '../shared/load.mjs';

let getState, setState, getData;


const stateConverters = {
  area: utils.defaultConverter,
  pod: utils.defaultConverter,
  variant: utils.defaultConverter,
  horizon: v => v === null ? NaN : parseInt(v),
  noAdjust: v => !!v
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
    else if (updatedList.has('pod')) { setPodData(); }
    else if (updatedList.has('horizon')) { setHorizonData(); }
    else if (updatedList.has('variant')) { setVariantData(); }

    if (updatedList.has('noAdjust')) { triggerNoAdjustEvent(); }
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
    data.url = info.histogramsUrl;
    data.area = await load(data.url);
    trigger('areadatachange');
    setPodData();
  };

  const setPodData = function() {
    data.pod = data.area.filter(d => d.pod === state.pod);
    trigger('poddatachange');
    setHorizonData();
  };

  const setHorizonData = function() {
    data.horizon = data.pod.filter(d => d.end_year === state.horizon);
    trigger('horizondatachange');
    setVariantData();
  };

  const setVariantData = function() {
    data.variant = data.horizon.filter(d => `v${d.proj_id}` === state.variant);
    trigger('variantdatachange');
  };

  const triggerNoAdjustEvent = function() {
    trigger('noadjustchange');
  };
}


export { getState, setState, getData, createAppState };
