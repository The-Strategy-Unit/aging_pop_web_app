import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';

const regularFormatter = format(',');
const bigFormatter = d => d ? `${regularFormatter(d/1000)}k` : '0';

function _getCSSVariable(name, func = parseFloat) {
  const str = getComputedStyle(this).getPropertyValue(`--${name}`);
  return func ? func(str) : str;
}


function createGraphic(container) {
  const graphicContainer = container.select('.graphic-container');
  const getCSSVariable = _getCSSVariable.bind(graphicContainer.node());

  const width = getCSSVariable('width');
  const height = getCSSVariable('height');

  const margins = {
    top: getCSSVariable('margin-top'),
    right: getCSSVariable('margin-right'),
    bottom: getCSSVariable('margin-bottom'),
    left: getCSSVariable('margin-left'),
    xMidWidth: getCSSVariable('x-mid-width')
  };
  
  const halfWidth = (width - (margins.left + margins.xMidWidth + margins.right)) / 2;
  const tickHeight = getCSSVariable('tick-height');
  const svg = graphicContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const gAgeStructure = svg.append('g')
    .attr('class', 'age-structure')
    .attr('dominant-baseline', 'hanging');
  
  gAgeStructure.append('text')
    .text('Age structure');

  const bigYear = gAgeStructure.append('text')
    .attr('class', 'big-year');

  const gAxes = svg.append('g')
    .attr('class', 'axes');

  const createXAxis = function(side, label) {
    let xTranslate = margins.left;
    if (side !== 'left') { xTranslate += (halfWidth + margins.xMidWidth); }
  
    const gAxis = gAxes.append('g')
      .attr('class', 'axis, x-axis')
      .style('transform', `translateX(${xTranslate}px)`)
      .attr('text-anchor', 'middle');
  
    gAxis.append('g')
      .attr('class', 'ticks');
  
    gAxis.append('text')
      .attr('class', 'axis-title')
      .attr('dominant-baseline', 'auto')
      .append('tspan')
      .attr('dx', `${halfWidth /2}px`)
      .text(label);

    let oldMax;
    let scale;

    const update = function(max) {
      if (max === oldMax) { return; }
      oldMax = max;

      const domain = [0, max];
      const range = side === 'left' ? [halfWidth, 0] : [0, halfWidth];

      scale = scaleLinear()
        .domain(domain)
        .range(range)
        .nice();

      const ticks = scale.ticks(5);
      const axisMax = ticks[ticks.length - 1];
      const formatter = axisMax > 10000 ? bigFormatter : regularFormatter;

      gAxis.select('.ticks')
        .text('')
        .selectAll('g')
        .data(ticks)
        .enter()
        .append('g')
        .style('transform', d => `translateX(${scale(d)}px)`)
        .each(function(d) {
          const sel = select(this);
          sel.append('line').attr('x1',0).attr('x2',0).attr('y1', 0).attr('y2', tickHeight);
          sel.append('text').attr('dominant-baseline', 'hanging').text(formatter(d));
        });
    };

    const out = { update };
    Object.defineProperty(out, 'scale', { get: () => scale });

    return out;
  };

  const mAxis = createXAxis('left', 'Men');
  const fAxis = createXAxis('right', 'Women');


  return function updateGraphic(evt) {
    const detail = evt.detail;
    bigYear.text(detail.year);
    mAxis.update(detail.max);
    fAxis.update(detail.max);
  };
}


export { createGraphic };