import { lookup } from '../shared/lookup.mjs';
import * as utils from '../shared/state.mjs';
import { load } from '../shared/load.mjs';

let getState, setState, getData;


const stateConverters = {
  area: utils.defaultConverter,
  pod: utils.defaultConverter,
  smooth: v => !!v
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
    
    if (updatedList.has('smooth')) { triggerSmoothEvent(); }
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
    data.url = info.lineChartsUrl;
    data.area = await load(data.url);
    trigger('areadatachange');
    setPodData();
  };

  const setPodData = function() {
    data.pod = Array.from(new Set(
      data.area.filter(d => d.pod === state.pod)
        .map(d => d.hsagrp)
    ));
    // const index = data.area.findIndex(d => d.pod === state.pod);
    // data.pod = data.area[index].data;
    // data.podLabel = data.area[index].podLabel;
    trigger('poddatachange');
  };

  const triggerSmoothEvent = function() {
    trigger('smoothchange');
  };
}


export { getState, setState, getData, createAppState };
