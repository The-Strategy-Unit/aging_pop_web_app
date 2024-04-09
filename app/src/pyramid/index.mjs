import { select } from 'd3-selection';
import { variants } from '../shared/variants.mjs';
import { constants } from '../shared/constants.mjs';
import { combineObjects } from '../shared/objects.mjs';
import { setState, getState, getData, createAppState } from './state.mjs';
import template from '../../html/pyramid.html';
import { createGraphic } from './graphics.mjs';
import { getTableData } from './table.mjs';
import { startAnimation } from './animate.mjs';
import { createMiniGraphic } from './mini-graphic.mjs';
import { initSelectMenus } from '../shared/controls.mjs';
import { getDataFileUrl } from '../shared/data-files.mjs';


function areaDataChange(evt) {
  const container = select(evt.target);
  const dataContainer = container.select('.data-container');
  const area = getState('area');
  const name = getData('name').toLowerCase().replace(/\s/g, '-');
  
  dataContainer.select('.download-link')
    .attr('href', getDataFileUrl(getData('file')))
    .attr('download', `pyramid-${area}-${name}${constants.dataFileSuffix}`);
}


function variantDataChange(evt) {
  const container = select(evt.target);
  const dataContainer = container.select('.data-container');
  const assumptions = getData('assumptions');

  dataContainer.select('dl')
    .selectAll('div dd')
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

  const name = getData('name');
  const variant = `v${getData('year').variant}`;
  container.classed('v0', variant === 'v0');

  let hText, pText;
  if (variant === 'v0') {
    hText = `Population in ${name}`;
    pText = '';
  }
  else {
    hText = `2018 Based Population Projection for ${name}`;
    const vName = variants[variant].name;
    pText = `Variant ${variant.slice(1)}: ${vName}`;
  }
  titlesContainer.select('h3').text(hText);
  titlesContainer.select('p').text(pText);
  
  const tableData = getTableData();

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
    .selectAll('p span:not(.help)')
    .data([tableData.bins[0].count, tableData.bins[2].count])
    .text(d => Math.round((d/tableData.bins[1].count) * 100));
}


function initPyramid(container) {
  createAppState(container);
  container.html(template);

  const controlsContainer = container.select('.controls-container');
  const sliderContainer = container.select('.slider-container');
  const graphicContainer = container.select('.graphic-container');

  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  const yearSlider = sliderContainer.select('input[type="range"]')
    .attr('min', 2010)
    .attr('max', 2050)
    .attr('step', 1)
    .attr('value', 2022)
    .on('input', evt => setState({ 'year': evt.target.value }));

  controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) {
      const value = evt.target.checked ? yearSlider.node().value : null;
      setState({ 'refYear': value });
    });

  graphicContainer.select('.play-button')
    .on('click', function(evt) {
      setState( { 'animating': true });
      if (!evt.pointerType) {
        graphicContainer.select('.pause-button').node().focus();
      }
    });

  graphicContainer.select('.pause-button')
    .on('click', function(evt) {
      setState( { 'animating': false });
      if (!evt.pointerType) {
        graphicContainer.select('.play-button').node().focus();
      }
    });

  const updateGraphic = createGraphic(container);
  const updateMiniGraphic = createMiniGraphic(container);

  const createSliderAnimation = function() {
    const first = parseInt(yearSlider.attr('min'));
    const last = parseInt(yearSlider.attr('max'));
    const n = (last - first) + 1;
    const startValue = parseInt(yearSlider.node().value);
    const startPosition = startValue - first;

    return function(dt) {
      if (!getState('animating')) { return true; }
      const count = Math.floor(dt / constants.tickTime);
      const position = (startPosition + count) % n;
      const year = first + position;
      yearSlider.node().value = year;
      setState({ year });
    };
  };

  container
    .on('areadatachange', areaDataChange)
    .on('variantdatachange', variantDataChange)
    .on('yeardatachange.controls', yearDataChange)
    .on('yeardatachange.graphic', updateGraphic)
    .on('refyeardatachange.graphic', updateGraphic)
    .on('refyeardatachange.mini-graphic', updateMiniGraphic)
    .on('animatingchange', function() {
      const animating = getState('animating');
      container.classed('animating', animating);
      if (animating) {
        startAnimation(createSliderAnimation());
        yearSlider.attr('disabled', 'disabled');
      }
      else {
        yearSlider.attr('disabled', null);
      }
    });

  const initialState = combineObjects(
    initialSelectValues,
    { year: yearSlider.node().value, refYear: null, animating: false }
  );

  setState(initialState);
}


export { initPyramid };
