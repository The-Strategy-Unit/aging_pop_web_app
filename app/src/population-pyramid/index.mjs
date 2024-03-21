import { select } from 'd3-selection';
import { load } from '../shared/load.mjs'; 
import { lookup } from '../shared/lookup.mjs';
import { variants, assumptions } from '../shared/variants.mjs';
import template from './html/pyramid.html'; 
import { getTableData } from './table.mjs';

const getAssumptions = function(code) {
  const parts = code.match(/(B|L|M)\d/g);
  return [code].concat(parts.map(d => assumptions[d]));
};


function createAppState(container) {
  const state = { area: '', name: '', variant: '', year: '' };
  const data = { area: [], variant: [], year: [] };

  const isSet = (d, k) => d[k] !== undefined;

  const trigger = function(evtType, detail) {
    const customEvent = new CustomEvent(evtType, { detail });
    container.node().dispatchEvent(customEvent);
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

  const setAreaData = async function() {
    const info = lookup.get(state.area);
    const url = info.pyramidUrl;
    data.area = await load(url);
    state.name = info.name;

    const detail = {
      area: state.area,
      name: state.name,
      data: data.area
    };

    trigger('areadatachange', detail);
    setVariantData();
  };
  
  const setVariantData = function() {
    const vOptions = [0, parseInt(state.variant.slice(1))];
    data.variant = data.area.filter(d => vOptions.includes(d.variant));
    
    const detail = {
      area: state.area,
      name: state.name,
      variant: state.variant,
      data: data.variant,
      assumptions: getAssumptions(variants[state.variant].short)
    };

    trigger('variantdatachange', detail);
    setYearData();
  };
  
  const setYearData = function() {
    const year = parseInt(state.year);
    data.year = data.variant.find(d => d.year === year);

    const detail = {
      area: state.area,
      name: state.name,
      variant: state.variant,
      year: state.year,
      data: data.year
    };

    trigger('yeardatachange', detail);
  };

  return setState;
}


function areaDataChange(evt) {
  console.log(evt);
}


function variantDataChange(evt) {
  const container = select(evt.target);
  const dataContainer = container.select('.data-container');
  const assumptions = evt.detail.assumptions;

  dataContainer.select('dl')
    .selectAll('span dd')
    .data(assumptions)
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
}


function yearDataChange(evt) {
  const container = select(evt.target);
  const titlesContainer = container.select('.titles-container');
  const dataContainer = container.select('.data-container');
  const table = dataContainer.select('table');
  const dependencyRatios = dataContainer.select('.dependency-ratios');

  const { name, data } = evt.detail;
  const variant = data.variant;

  let hText, pText;
  if (variant === 0) {
    hText = `Population in ${name}`;
    pText = '';
  }
  else {
    hText = `2018 Based Population Projection for ${name}`;
    const vName = variants[`v${variant}`].name;
    pText = `Variant ${variant}: ${vName}`;
  }
  titlesContainer.select('h2').text(hText);
  titlesContainer.select('p').text(pText);

  const tableData = getTableData(data);

  const tbody = table.select('tbody').text('');

  tbody
    .selectAll('tr')
    .data(tableData.bins.slice().reverse())
    .enter()
    .append('tr')
    .each(function(d) {
      select(this).append('th')
        .text(d.name);

      select(this).selectAll('td')
        .data([(d.count/1000).toFixed(1), `${Math.round(d.pct)}%`])
        .enter()
        .append('td')
        .text(d => d);
    });

  table
    .selectAll('tfoot td')
    .data([(tableData.total/1000).toFixed(1), '100%'])
    .text(d => d);

  dependencyRatios
    .selectAll('p span')
    .data([tableData.bins[0].count, tableData.bins[2].count])
    .text(d => Math.round((d/tableData.bins[1].count) * 100));
}


function initPyramid(container) {
  const setState = createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  // const graphicContainer = container.select('.graphic-container');

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

  container
    .on('areadatachange', areaDataChange)
    .on('variantdatachange', variantDataChange)
    .on('yeardatachange', yearDataChange);

  const initialState = {
    area: areaSelect.node().value,
    variant: variantSelect.node().value,
    year: '2022'
  };

  setState(initialState);
}


export { initPyramid };
