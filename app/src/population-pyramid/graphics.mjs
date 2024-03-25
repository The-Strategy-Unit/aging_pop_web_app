import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { ticks as d3Ticks } from 'd3-array';
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

  const xAxes = gAxes.append('g')
    .attr('class', 'x-axes');

  const gData = svg.append('g')
    .attr('class', 'data');

  const gMData = gData.append('g')
    .attr('class', 'left');

  const gFData = gData.append('g')
    .attr('class', 'right');

  const createXAxis = function(side, label) {
    const gAxis = xAxes.append('g')
      .attr('class', `axis, x-axis, ${side}`)
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

  const yScale = scaleLinear()
    .domain([0, 100])
    .range([height - margins.bottom, margins.top]);

  const createYAxis = function() {
    const tickLabels = d3Ticks(0, 100, 20);
    const xTranslate = margins.left + halfWidth + (margins.xMidWidth / 2);

    gAxes.append('g')
      .attr('class', 'axis, y-axis')
      .style('transform', `translateX(${xTranslate}px)`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .selectAll('text')
      .data(tickLabels)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', 0)
      .attr('y', d => yScale(d));
  };

  const mAxis = createXAxis('left', 'Men');
  const fAxis = createXAxis('right', 'Women');
  createYAxis();

  return function updateGraphic(evt) {
    const detail = evt.detail;
    bigYear.text(detail.year);
    mAxis.update(detail.max);
    fAxis.update(detail.max);

    const barHeight = Math.abs(yScale(1) - yScale(0));

    const mBars = gMData
      .selectAll('g.bars')
      .data(detail.data.data, d => d.yob);

    mBars.exit().remove();

    const mBarsEnter = mBars
      .enter()
      .append('g')
      .attr('class', 'bars')
      .each(function() {
        const sel = select(this);

        sel.append('rect')
          .attr('class', 'males')
          .attr('height', barHeight);

        sel.append('rect')
          .attr('class', 'min')
          .attr('height', barHeight);
      });
      
    mBars.merge(mBarsEnter)
      .each(function(d) {
        const sel = select(this);
        const scale = mAxis.scale;
        const min = Math.min(d.m, d.f);
        const x0 = scale(0);
      
        sel.selectAll('rect').attr('y', yScale(d.under));
      
        sel.select('rect.males')
          .attr('x', scale(d.m))
          .attr('width', x0 - scale(d.m));

        sel.select('rect.min')
          .attr('x', scale(min))
          .attr('width', x0 - scale(min));
      });

    const fBars = gFData
      .selectAll('g.bars')
      .data(detail.data.data, d => d.yob);

    fBars.exit().remove();

    const fBarsEnter = fBars
      .enter()
      .append('g')
      .attr('class', 'bars')
      .each(function() {
        const sel = select(this);
        const scale = fAxis.scale;

        sel.append('rect')
          .attr('class', 'females')
          .attr('x', scale(0))
          .attr('height', barHeight);

        sel.append('rect')
          .attr('class', 'min')
          .attr('x', scale(0))
          .attr('height', barHeight);
      });
      
    fBars.merge(fBarsEnter)
      .each(function(d) {
        const sel = select(this);
        const scale = fAxis.scale;
        const min = Math.min(d.m, d.f);
        const x0 = scale(0);
        sel.selectAll('rect').attr('y', yScale(d.under));
        sel.select('rect.females').attr('width', scale(d.f) - x0);
        sel.select('rect.min').attr('width', scale(min) - x0);
      });
  };
}


export { createGraphic };