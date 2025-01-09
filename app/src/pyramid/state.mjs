import { load } from '../shared/load.mjs';
import { lookup } from '../shared/lookup.mjs';
import { variants, assumptions } from '../shared/variants.mjs';
import * as utils from '../shared/state.mjs';

// These functions are exported and can be used
// by other modules to read and set the pyramid
// sub-aplications state and to read computed
// data derived from the current state
let getState, setState, getData;

// This object tells createAppState what data to
// expect and tells the internal updateState function
// how to to convert incoming data for storage
const stateConverters = {
  area: utils.defaultConverter,
  variant: utils.defaultConverter,
  year: v => v === null ? NaN : parseInt(v),
  refYear: v => v === null ? null : parseInt(v),
  animating: v => !!v
};


function createAppState(container) {
  // state will start as an object with the corresponding null
  // values for each property
  const state = utils.createStateObject(stateConverters);
  const data = {}; // an empty object to which computed data will be added
  const trigger = utils.createTrigger(container); // a quick way to trigger custom events
  // updateState will be a function that expects an object updates, the state
  // object and returns a set containing a list of all modified state properties 
  const updateState = utils.createStateUpdater(state, stateConverters);

  setState = function(values) {
    const updatedList = updateState(values);
    if (!updatedList.size) { return; } // nothing has actually changed
    
    // We look at which properties have changed
    // Changes from setAreaData cascade on down
    // to setVariantData and then on to setYeardData
    // so we use if/else/else rather than if/if/if
    // to avoid duplicated function calls
    if (updatedList.has('area')) { setAreaData(); }
    else if (updatedList.has('variant')) { setVariantData(); }
    else if (updatedList.has('year')) { setYearData(); }

    if (updatedList.has('refYear')) { setRefYearData(); } // reference year has changed
    if (updatedList.has('animating')) { triggerAnimatingEvent(); } // started/stopped animating
  };

  // This function just returns the current valued of a state property
  getState = function(prop) {
    return state[prop];
  };

  // This function just returns the current valued of a state property
  // There is no setData, that is computed internally
  getData = function(prop) {
    return data[prop];
  };

  // The requested area data has changed
  // so we have to load new data. This is
  // done asynchronously to avoid blocking
  // the browser when fetching from the server
  // hence the async and await key words
  const setAreaData = async function() {
    // Get the info we need, using state.area
    // as the key to the lookup table
    const info = lookup.get(state.area);
    data.name = info.name; // Add the (printable) area name to the data object
    data.file = info.pyramidFile; // Add the file location to the data object
    data.area = await load(data.file); // actually load the area data
    
    // Find the maximum value (m or f) in the area data
    // and add it to our area object
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

    // trigger an areadatachange event on the container selection
    // This is how we can let other modules know the area data has changed
    trigger('areadatachange');
    // Now we move on to the variant data which also requires updating
    setVariantData();
  };
  
  const setVariantData = function() {
    // We need both the user-selected projection variant and the 'v0',
    // true data for our pyramid 
    const vOptions = ['v0', state.variant];
    // Create a new array that only contains the area data with
    // the appropriate variant types
    data.variant = data.area.filter(d => vOptions.includes(d.variant));

    const code = variants[state.variant].short; // Look up the variant code (from variants.json)
    const vName = variants[state.variant].name; // Look up the variant name (from variants.json)
    const vNameText = `${vName} variant`;
    const parts = code.match(/(B|L|M)\d/g); // Split code into alpha-numeric parts
    // Create an array of assumptions based on the code and the alpha-numeric parts,
    // using the data from the assumptions.json file
    data.assumptions = [vNameText].concat(parts.map(d => assumptions[d]));

    // trigger a variantdatachange event on the container selection
    // This is how we can let other modules know the variant data has changed
    trigger('variantdatachange');
    // Now we move on to the variant data which also requires updating
    setYearData();
    // If a refYear is shown we also need to update that
    if (state.refYear !== null) { setRefYearData(); }
    // Stop any running animation when we change variant (or area) data
    setState({ animating: false });
  };
  
  const setYearData = function() {
    // Find the data representing the chosen year
    // (given the selected area and variant)
    data.year = data.variant.find(d => d.year === state.year);
    // trigger a yeardatachange event on the container selection
    // This is how we can let other modules know the area data has changed
    trigger('yeardatachange');
  };

  const setRefYearData = function() {
    const refYear = state.refYear;

    // If there is no reference year (i.e. Lock age structure is off)
    // we just set the data.refYear value to null
    if (refYear === null) {
      data.refYear = null;
    }
    else {
      // Create an object containing empty arrays
      data.refYear = { m: [], f:[] };

      // Find the data for the right refYear
      data.variant.find(d => d.year === refYear).data
        .forEach(function(d) { // loop over each age object for the refYear
          for(const key of ['m', 'f']) { // loop over gender
            const arr = data.refYear[key];
            // add data for the bottom of the age step
            arr.push({ age: d.age, total: d[key] });
            // add data for the top of the age step
            arr.push({ age: d.age + 1, total: d[key] });
          }
        });
    }
    // trigger a refyeardatachange event on the container selection
    // This is how we can let other modules know the refYear data has changed
    trigger('refyeardatachange');
  };

  // There's no computed data assosciated with animating.
  // So we just need to trigger an event when the state
  // property changes to inform other modules of the change
  const triggerAnimatingEvent = function() {
    trigger('animatingchange');
  };
}


export { getState, setState, getData, createAppState };