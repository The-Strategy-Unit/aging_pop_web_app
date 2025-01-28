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
import { initSelectMenus, initYearSlider } from '../shared/controls.mjs';
import { getDataFileUrl } from '../shared/data-files.mjs';

// Function that takes precision to do rounding
// don't confuse with Math.round
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

// Function to add commas to numbers
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Function to run when area data changes
// This just updates what is downloaded via the download link
function areaDataChange(evt) {
  const container = select(evt.target);
  const dataContainer = container.select('.data-container');
  const area = getState('area');
  const name = getData('name').toLowerCase().replace(/\s/g, '-');
  
  dataContainer.select('.download-link')
    .attr('href', getDataFileUrl(getData('file')))
    .attr('download', `pyramid-${area}-${name}${constants.dataFileSuffix}`);
}

// Function to run when area data changes
// This updates the displayed assumptions
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

// Function to run when year data changes
// This updates the table and dependency ratios
function yearDataChange(evt) {
  const container = select(evt.target);
  const titlesContainer = container.select('.titles-container');
  const dataContainer = container.select('.data-container');
  const table = dataContainer.select('table');
  const dependencyRatios = dataContainer.select('.dependency-ratios');

  const name = getData('name');
  const variant = getData('year').variant;
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
  titlesContainer.select('h4').text(pText);
  
  const tableData = getTableData();

  const tbody = table.select('tbody').text('');

  tbody
    .selectAll('tr')
    .data(tableData.bins.slice())
    .enter()
    .append('tr')
    .each(function(d) {
      select(this).append('th')
        .text(d.name);

      select(this).selectAll('td')
        .data([numberWithCommas(Math.round(d.count)), `${round(d.pct, 1).toFixed(1)}%`])
        .enter()
        .append('td')
        .text(d => d);
    });

  table
    .selectAll('tfoot td')
    .data([numberWithCommas(Math.round(tableData.total)), '100.0%'])
    .text(d => d);

  dependencyRatios
    .selectAll('p span:not(.help)')
    .data([tableData.bins[0].count, tableData.bins[2].count])
    .text(d => round((d/tableData.bins[1].count) * 100, 1).toFixed(1));
}


// Function that actually creates the pyramid
function initPyramid(container) {
  createAppState(container); // Create sub-application state
  container.html(template); // Add our html defined in html/pyramid.html

  const controlsContainer = container.select('.controls-container');
  const sliderContainer = container.select('.slider-container');
  const graphicContainer = container.select('.graphic-container');

  const initialSelectValues = initSelectMenus(controlsContainer, setState);

  // Hard coded years. urgh
  const initialYearSliderValue = initYearSlider(sliderContainer, setState);
  const yearSlider = sliderContainer.select('input[type="range"]');

  controlsContainer.select('input[type=checkbox]')
    .on('change', function(evt) {
      const value = evt.target.checked ? yearSlider.node().value : null;
      setState({ 'refYear': value });
    });

  graphicContainer.select('.play-button')
    .on('click', function(evt) {
      setState( { 'animating': true });
      if (!evt.pointerType) {
        // If user uses keyboard, move focus to the newly-revealed pause button
        graphicContainer.select('.pause-button').node().focus();
      }
    });

  graphicContainer.select('.pause-button')
    .on('click', function(evt) {
      setState( { 'animating': false });
      if (!evt.pointerType) {
        // If user uses keyboard, move focus to the newly revealed play button
        graphicContainer.select('.play-button').node().focus();
      }
    });

  const updateGraphic = createGraphic(container);
  const updateMiniGraphic = createMiniGraphic(container);

  const createSliderAnimation = function() {
    const first = parseInt(yearSlider.attr('min')); // earliest year
    const last = parseInt(yearSlider.attr('max')); // latest year
    const n = (last - first) + 1; // total number of years
    const startValue = parseInt(yearSlider.node().value); // year slider was on when play pressed
    const startPosition = startValue - first; // offset of start value from start of slider

    // This function will get called at screen refresh rate
    // until animation state is changed to false
    return function(dt) {
      if (!getState('animating')) { return true; }
      const count = Math.floor(dt / constants.animationDuration); // count number of steps taken
      const position = (startPosition + count) % n; // work out where slider needs to be
      const year = first + position; // work out what year that corresponds to
      yearSlider.node().value = year; // update slider
      setState({ year }); //update year in state
      // This last step will ultimately cause .on('yeardatachange') event to fire on container
    };
  };

  // Add event handlers for our custom events defined in state.mjs
  // If we have more than one handler for a given event we need to .suffix them
  // so d3 keeps both, rather than replacing the first handler with the second
  container
    .on('areadatachange', areaDataChange)
    .on('variantdatachange', variantDataChange)
    .on('yeardatachange.controls', yearDataChange) // update table
    .on('yeardatachange.graphic', updateGraphic) // update graphic, too
    .on('refyeardatachange.graphic', updateGraphic) // update steps
    .on('refyeardatachange.mini-graphic', updateMiniGraphic) // update minigraphic, too
    .on('animatingchange', function() {
      const animating = getState('animating');
      container.classed('animating', animating);
      if (animating) {
        startAnimation(createSliderAnimation());
        yearSlider.attr('disabled', 'disabled');
      }
      else {
        // Disable slider while animating so user can't move it
        // and mess up the animation calculations
        yearSlider.attr('disabled', null);
      }
    });

  // Set how we want the sub-application to look on load
  const initialState = combineObjects(
    initialSelectValues,
    { year: initialYearSliderValue, refYear: null, animating: false }
  );
  setState(initialState);
}


export { initPyramid };
