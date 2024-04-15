import { select } from 'd3-selection';
import 'd3-transition';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { ticks as d3Ticks } from 'd3-array';
import { interpolateViridis } from 'd3-scale-chromatic';
import { getData } from './state.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { createSmallMultiplesFramework } from '../shared/small-multiples.mjs';
import { addGroup, addGroups } from '../shared/svg.mjs';
import { constants } from '../shared/constants.mjs';

const duration = constants.animationDuration;


function getXDomain(data) {
  const arr = data.data;
  const min = 0;
  const max = arr[arr.length - 1].x1;
  return [min, max];
}

const colorScale = scaleSequential(d => interpolateViridis(1 - d))
  .domain([0, 80]);


function createGraphic(container) {
  const graphicContainer = container.select('.graphic-container');
  const getCssVariable = createGetCssVariable(graphicContainer);

  const width = getCssVariable('width');
  const height = getCssVariable('height');

  const margins = {
    top: getCssVariable('margin-top'),
    right: getCssVariable('margin-right'),
    bottom: getCssVariable('margin-bottom'),
    left: getCssVariable('margin-left'),
  };

  const tickHeight = getCssVariable('tick-height');

  const xRange = [0, width - (margins.left + margins.right)];
  const yDomain = [0, 1];
  const yRange = [height - (margins.bottom + margins.top), 0];

  const yScale = scaleLinear()
    .domain(yDomain)
    .range(yRange);

  const getXScale = function(data) {
    const xDomain = getXDomain(data);

    return scaleLinear()
      .domain(xDomain)
      .range(xRange)
      .nice();
  };

  const getXTickLabels = function(xScale) {
    const xDomain = xScale.domain();
    return d3Ticks(xDomain[0], xDomain[1], 5);
  };

  const createChart = function(el) {
    const container = select(el);
    const data = container.datum();

    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'chart');

    const [gAxes, gData, gNoAdjust, gTopText] = addGroups(svg, ['axes', 'data', 'no-adjust', 'top-text']);

    gTopText.append('text')
      .attr('class', 'main-title')
      .attr('dominant-baseline', 'hanging')
      .text(data.label);

    gTopText.append('text')
      .attr('class', 'sub')
      .attr('dominant-baseline', 'hanging')
      .text('Per cent change');

    const [gXAxis] = addGroups(gAxes, ['axis x-axis']);

    let xScale = getXScale(data);
    const xDomain = xScale.domain();

    const createXTick = function(d) {
      const sel = select(this);
  
      sel.append('line')
        .attr('y2', tickHeight);
      
      sel.append('text')
        .attr('dominant-baseline', 'hanging')
        .text(d);
    };

    const xTickLabels = getXTickLabels(xScale);

    gXAxis.append('line')
      .attr('class', 'axis-line')
      .attr('x1', xScale(xDomain[0]))
      .attr('x2', xScale(xDomain[1]));

    addGroup(gXAxis, 'ticks')
      .selectAll('g.tick')
      .data(xTickLabels)
      .enter()
      .append('g')
      .attr('text-anchor', 'middle')
      .attr('class', 'tick')
      .style('transform', d => `translateX(${xScale(d)}px)`)
      .each(createXTick);

    gData.selectAll('rect')
      .data(data.data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x0))
      .attr('width', d => xScale(d.x1) - xScale(d.x0))
      .attr('y', yScale(1))
      .attr('height', yScale(0) - yScale(1))
      .style('fill', d => colorScale(d.freq));

    gNoAdjust.append('circle')
      .attr('cx', xScale(data.end_p_nohsa))
      .attr('cy', yScale(0.5))
      .attr('r', 5)
      .attr('fill', 'red')
      .on('mouseover', function() { select(this).classed('hovered', true); })
      .on('mouseout', function() { select(this).classed('hovered', false); });

    const toolWidth = 55;
    const toolHeight = toolWidth / 2;
    const xTool = xScale(data.end_p_nohsa) - (toolWidth + 5);
    const yTool = yScale(0.5) + 5;

    const tooltip = gNoAdjust.append('g')
      .attr('class', 'tooltip')
      .style('transform', `translateX(${xTool}px) translateY(${yTool}px)`);

    tooltip.append('rect')
      .attr('width', toolWidth)
      .attr('height', toolHeight);

    tooltip.append('text')
      .attr('x', toolWidth / 2)
      .attr('y', toolHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(`${data.end_p_nohsa.toFixed(2)}%`);


    const updateChart = function() {
      const oldXScale = xScale;
      const data = container.datum();
      xScale = getXScale(data);
      const xTickLabels = getXTickLabels(xScale);

      const xTicks = gXAxis.select('.ticks')
        .selectAll('g.tick')
        .data(xTickLabels, d => d);

      xTicks.exit()
        .transition()
        .duration(duration)
        .style('transform', d => `translateX(${xScale(d)}px)`)
        .style('opacity', 0)
        .remove();

      const xTicksEnter = xTicks.enter()
        .append('g')
        .attr('text-anchor', 'middle')
        .attr('class', 'tick')
        .style('transform', d => `translateX(${oldXScale(d)}px)`)
        .style('opacity', 0)
        .each(createXTick);

      xTicks.merge(xTicksEnter)
        .transition()
        .duration(duration)
        .style('transform', d => `translateX(${xScale(d)}px)`)
        .style('opacity', 1);

      const rect = gData.selectAll('rect')
        .data(data.data);

      rect.exit()
        .transition()
        .duration(duration)
        .attr('x', d => xScale(d.x0))
        .attr('width', d => xScale(d.x1) - xScale(d.x0))
        .style('opacity', 0)
        .remove();

      const rectEnter = rect.enter()
        .append('rect')
        .attr('x', d => oldXScale(d.x0))
        .attr('width', d => oldXScale(d.x1) - oldXScale(d.x0))
        .attr('y', yScale(1))
        .attr('height', yScale(0) - yScale(1))
        .style('fill', d => colorScale(d.freq))
        .style('opacity', 0);

      rect.merge(rectEnter)
        .transition()
        .duration(duration)
        .attr('x', d => xScale(d.x0))
        .attr('width', d => xScale(d.x1) - xScale(d.x0))
        .style('fill', d => colorScale(d.freq))
        .style('opacity', 1);

      gNoAdjust.select('circle')
        .transition()
        .duration(duration)
        .attr('cx', xScale(data.end_p_nohsa));

      const xTool = xScale(data.end_p_nohsa) - (toolWidth + 5);

      gNoAdjust.select('g.tooltip')
        .transition()
        .duration(duration)
        .style('transform', `translateX(${xTool}px) translateY(${yTool}px)`);

      gNoAdjust.select('g.tooltip text') 
        .text(`${data.end_p_nohsa.toFixed(2)}%`);
    };

    const removeChart = function() {
      container.remove();
    };

    el.updateChart = updateChart;
    el.removeChart = removeChart;
  };

  const updateSmallMultiples = createSmallMultiplesFramework(graphicContainer, createChart);


  return function updateGraphic() {
    const data = getData('variant');
    const keyFunction = d => `${d.pod}-${d.label}`;
    updateSmallMultiples(data, keyFunction);
  };
}


export { createGraphic };
