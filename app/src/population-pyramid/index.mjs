import { select } from 'd3-selection';
import { load } from '../shared/load.mjs'; 
import { lookup } from '../shared/lookup.mjs';
import { variants, assumptions } from '../shared/variants.mjs';
import template from './html/pyramid.html'; 

const isSet = (d, k) => d[k] !== undefined; 

const state = { area: '', variant: '', year: '' };
const data = { area: [], variant: [], year: [] };
 

const getAssumptions = function(code) {
  const parts = code.match(/(B|L|M)\d/g);
  return [code].concat(parts.map(d => assumptions[d]));
};



function initPyramid(container) {
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  // const graphicContainer = container.select('.graphic-container');
  const dataContainer = container.select('.data-container');

  const updateAssumptionDataDisplay = function() {
    dataContainer.select('dl')
      .selectAll('span dd')
      .data(data.assumptions)
      .each(function(d) {
        const sel = select(this);
        if (typeof d === 'string') { sel.text(d); }
        else {
          sel.text('');
          sel.selectAll('span')
            .data(d)
            .enter()
            .append('span')
            .text(d => d);
        }
      });
  };

  const setAreaData = async function() {
    const url = lookup.get(state.area).pyramidUrl;
    data.area = await load(url);
    setVariantData();
  };
  
  const setVariantData = function() {
    const variantValues = ['0', state.variant.slice(1)];
    data.variant = data.area.filter(d => variantValues.includes(d.Variante));
    data.assumptions = getAssumptions(variants[state.variant].short);
    updateAssumptionDataDisplay();
    setYearData();
  };
  
  const setYearData = function() {
    data.year = data.variant.filter(function(d) {
      return d.Simulationsjahr === state.year;
    });
    console.log({state, data});
  };
  
  const setState = function(values) {
    const newArea = isSet(values, 'area') && values.area !== state.area;
    const newVariant = isSet(values, 'variant') && values.variant !== state.variant;
    const newYear = isSet(values, 'year') && values.year !== state.year;
  
    if (newArea) { state.area = values.area; }
    if (newVariant) { state.variant = values.variant; }
    if (newYear) { state.year = values.year; }
    
    if (newArea) { setAreaData(); }
    else if (newVariant) { setVariantData(); }
    else if (newYear) { setYearData(); }
  };


  const areaSelect = controlsContainer.select('.area-select')
    .on('change', evt => setState({ 'area': evt.target.value }));

  areaSelect.selectAll('option')  
    .data(Array.from(lookup.values()))
    .enter()
    .append('option')
    .attr('value', d => d.code)
    .text(d => d.name);

  const variantSelect = controlsContainer.select('.variant-select')
    .on('change', evt => setState({ 'variant': evt.target.value }));

  variantSelect.selectAll('option')  
    .data(Array.from(Object.entries(variants)))
    .enter()
    .append('option')
    .attr('value', d => d[0])
    .text(d => d[1].name);

  const initialState = {
    area: areaSelect.node().value,
    variant: variantSelect.node().value,
    year: '2022'
  };

  setState(initialState);
}


export { initPyramid };
