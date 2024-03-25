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

  const gYearLabels = svg.append('g')
    .attr('class', 'left');

  const gGrids = svg.append('g')
    .attr('class', 'grids');

  const createXAxis = function(side, label) {
    const gAxis = xAxes.append('g')
      .attr('class', `axis, x-axis, ${side}`)
      .attr('text-anchor', 'middle');

    const gGrid = gGrids.append('g')
      .attr('class', `grid ${side}`);
  
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

      const yRange = yScale.range();

      gGrid.text('')
        .selectAll('line.grid-line')
        .data(ticks)
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', d => scale(d))
        .attr('y1', yRange[0])
        .attr('x2', d => scale(d))
        .attr('y2', yRange[1]);
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

    const barGroups = gData
      .selectAll('g.bar-group')
      .data(detail.data.data, d => d.yob);

    barGroups.exit().remove();

    const barGroupsEnter = barGroups.enter()
      .append('g')
      .attr('class', 'bar-group')
      .each(function() {
        select(this)
          .selectAll('g.gender')
          .data(['males', 'females'])
          .enter()
          .append('g')
          .attr('class', d => `gender ${d} ${d === 'males' ? 'left' : 'right'}`)
          .each(function(d) {
            const sel = select(this);

            sel.append('rect')
              .datum(d)
              .attr('height', barHeight);

            sel.append('rect')
              .datum('min')
              .attr('class', 'min')
              .attr('height', barHeight);
          });
      });
         
    barGroups.merge(barGroupsEnter)
      .each(function(d) {
        const sel = select(this);
        const values = { males: d.m, females: d.f, min: Math.min(d.m, d.f) };
        const mScale = mAxis.scale;
        const fScale = fAxis.scale;
        
        sel.selectAll('rect').attr('y', yScale(d.under));
      
        sel.selectAll('g.males rect')
          .attr('x', d => mScale(values[d]))
          .attr('width', d =>  mScale(0) - mScale(values[d]));

        sel.selectAll('g.females rect')
          .attr('x', fScale(0))
          .attr('width', d =>  fScale(values[d]) - fScale(0));
      });

    const yearLabels = gYearLabels
      .selectAll('text.yob-label')
      .data(detail.data.data.filter(d => d.yob % 5 === 4), d => d.yob);

    yearLabels.exit().remove();

    const yearLabelsEnter = yearLabels
      .enter()  
      .append('text')
      .attr('class', 'yob-label')
      .attr('x', mAxis.scale(0) - 5)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('dy', '0.4em')
      .text(d => d.yob);

    yearLabels.merge(yearLabelsEnter)
      .attr('y', d => yScale(d.under));
  };
}


export { createGraphic };