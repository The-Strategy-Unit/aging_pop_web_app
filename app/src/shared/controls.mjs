// Most of the code here is concerned with the cutom area dropdown
// But the final, exported function - initSelectMenus - also
// initiates the regular select menus.
// initYearSlider initialises the year slider for the pyramid.
import { select } from 'd3-selection';
import { ticks as d3Ticks } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { lookup } from './lookup.mjs';
import { variants } from '../shared/variants.mjs';
import { constants } from './constants.mjs';


function createBestMatch(rawValues) {
  const values = rawValues.map(v => v.toLowerCase()); 
  let index = 0;

  const exactMatch = str => values.findIndex(d => d === str);
  const startsWith = str => values.findIndex(d => d.startsWith(str));
  const includes = str => values.findIndex(d => d.includes(str));
  const fallback = () => index;

  return function(rawStr) {
    const str = rawStr.toLowerCase();
    const tests = [exactMatch, startsWith, includes, fallback].reverse();
    let newIndex = -1;
   
    while (newIndex === -1) {
      const test = tests.pop();
      newIndex = test(str);
    }

    index = newIndex;
    
    return index;
  };
}


let areaCounter = 0;

function initAreaSelect(container, setState) {
  const suffix = `instance${areaCounter++}`;
  const ulId = `pyramid-select-${suffix}`;

  const input = container.select('input')
    .attr('aria-controls', ulId);

  const ul = container.select('ul')
    .attr('id', ulId);

  const options = Array.from(lookup.values());

  const open = function() {
    container.classed('open', true);
    input.attr('aria-expanded', true);
  }; 

  const close = function() {
    if (liNodes.includes(document.activeElement)) { input.node().focus(); }
    container.classed('open', false);
    input.attr('aria-expanded', false);
    updateBestMatch();
  };

  const isOpen = () => container.classed('open');

  const li = ul.selectAll('li')
    .data(options)
    .enter()
    .append('li')
    .attr('data-index', (_, i) => i)
    .attr('tabIndex', -1)
    .text(d => d.name)
    .on('mouseover focus', function() {
      const index = parseInt(this.dataset.index);
      updateBestMatch(index);
    })
    .on('mousedown', function() {
      input.node().focus();
      changeCallback();
    });

  const liNodes = li.nodes();

  container.on('focusout', function({relatedTarget}) {
    const stayOpen = relatedTarget === input.node || liNodes.includes(relatedTarget);
    if (!stayOpen) {
      close();
      changeCallback();
    }
  });

  select(window).on(`keydown.${suffix}`, function(evt) {
    const key = evt.key;
    const target = evt.target;
    const index = liNodes.indexOf(target);
    
    if (target !== input.node() && index === -1) { return; }

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }

    if (target === input.node()) {
      if (key === 'ArrowUp') {
        if (isOpen()) { close(); }
      }
      else if (key === 'ArrowDown') {
        if (!isOpen()) { open(); }
        else { li.filter('.best-match').node().focus(); }
      }
      return;
    }
    
    if (key === 'Enter') {
      changeCallback();
    }
    else if (key === 'ArrowUp') {
      index === 0 ? input.node().focus() : liNodes[index-1].focus();
    }
    else if (key === 'ArrowDown') {
      if (index < liNodes.length - 1) {
        liNodes[index+1].focus();
      }
    }
  });

  const bestMatch = createBestMatch(options.map(d => d.name));

  const updateBestMatch = function(index) {
    if (index === undefined) { index = bestMatch(input.property('value')); }
    const oldBestMatch = select('.best-match');
    const chosen = select(liNodes[index]); 
    const isNewMatch = oldBestMatch.node() !== chosen.node();

    if (isNewMatch) {
      li.classed('best-match', (_, i) => i === index);
    }
    
    return { chosen, isNewMatch, index };
  };

  const chooseBestMatch = function() {
    const liNode = li.filter('.best-match').node() || li.node();
    const data = options[liNode.dataset.index];
    const code = data.code;
    input.property('value', data.name);
    input.attr('data-code', code);
  }; 

  updateBestMatch(0);
  chooseBestMatch();

  const changeCallback = function() {
    chooseBestMatch();
    close();
    setState({ 'area': input.attr('data-code') });
  };

  input
    .on('focus', open)
    .on('blur', function({relatedTarget}) {
      if (!liNodes.includes(relatedTarget)) { close(); }
    })
    .on('click', open)
    .on('input', function() {
      open();
      const { chosen, isNewMatch } = updateBestMatch();
      if (isNewMatch) {
        ul.node().scrollTop = chosen.node().offsetTop;
      }
    });
  
  return input.attr('data-code');
}


function initPodSelect(dropdown, setState) {
  const pods = ['aae', 'apc', 'opc'];
  const callback = evt => setState({ 'pod': evt.target.value });
  dropdown.on('change', callback);

  dropdown.selectAll('option')  
    .data(pods)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  return dropdown.node().value;
}


function initHorizonSelect(dropdown, setState) {
  const horizons = [2025, 2030, 2035, 2040];
  const callback = evt => setState({ 'horizon': evt.target.value });
  dropdown.on('change', callback);

  dropdown.selectAll('option')  
    .data(horizons)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  return dropdown.node().value;
}


function initVariantSelect(dropdown, setState) {
  const callback = evt => setState({ 'variant': evt.target.value });
  const variantSelect = dropdown.on('change', callback);
  
  variantSelect.selectAll('option')  
    .data(Array.from(Object.entries(variants)))
    .enter()
    .append('option')
    .attr('value', d => d[0])
    .text(d => d[1].name);

  return dropdown.node().value;
}


function initSelectMenus(container, setState) {
  const initialValues = {};

  const areaSelect = container.select('.area-select');
  if (!areaSelect.empty()) {
    initialValues.area = initAreaSelect(areaSelect, setState);
  }

  const podSelect = container.select('.pod-select');
  if (!podSelect.empty()) {
    initialValues.pod = initPodSelect(podSelect, setState);
  }

  const horizonSelect = container.select('.horizon-select');
  if (!horizonSelect.empty()) {
    initialValues.horizon = initHorizonSelect(horizonSelect, setState);
  }

  const variantSelect = container.select('.variant-select');
  if (!variantSelect.empty()) {
    initialValues.variant = initVariantSelect(variantSelect, setState);
  }

  return initialValues;
}


function initYearSlider(container, setState) {
  const min = constants.minYear;
  const max = constants.maxYear;
  const initialValue = constants.initialYear;
  const ticks = d3Ticks(min, max, Math.floor((max-min))/5); 

  container.select('input[type="range"]')
    .attr('min', min)
    .attr('max', max)
    .attr('step', 1)
    .attr('value', initialValue)
    .on('input', evt => setState({ 'year': evt.target.value }));

  container.select('datalist')
    .selectAll('option')
    .data(ticks)
    .enter()
    .append('option')
    .attr('value', d => d.value);

  const yScale = scaleLinear()
    .domain([min, max])
    .range([100, 0]);

  container.select('.slider-labels')
    .selectAll('span.label')
    .data(ticks)
    .enter()
    .append('span')
    .attr('class', 'label')
    .style('transform', d => `translateY(calc(${yScale(d)}cqh - 0.05em))`)
    .text(d => d);

  return initialValue;
}


export { initSelectMenus, initYearSlider };
