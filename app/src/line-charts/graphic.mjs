import { select } from 'd3-selection';
import 'd3-transition';
import { ticks as d3Ticks, max as d3Max } from 'd3-array';
import { format } from 'd3-format';
import { line as d3Line } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { getState, getData } from './state.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { constants } from '../shared/constants.mjs';
import { createSmallMultiplesFramework } from '../shared/small-multiples.mjs';
import { addGroup, addGroups } from '../shared/svg.mjs';


const formatter = format(',');
const xDomain = [0, 100];
const duration = constants.tickTime;


const generateLineData = function(data, gender) {
  const initial = gender === 'male' ? 'm' : 'f';
  const suffix = getState('smooth') ? 's' : '';
  const key = `${initial}${suffix}`;
  return data.data.map(d => ({ x: d.age, y: 1000 * d[key] }));
};


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
  const yRange = [height - (margins.bottom + margins.top), 0];

  const xScale = scaleLinear()
    .domain(xDomain)
    .range(xRange);

  const getYScale = function(yMax) {
    return scaleLinear()
      .domain([0, yMax])
      .range(yRange)
      .nice();
  };
 
  const getYMax = function(data) {
    return 1000 * d3Max(data.data, d => Math.max(d.f, d.m, d.fs, d.ms));
  };

  const createYTick = function(d) {
    const sel = select(this);

    if (d !== 0) {
      sel.append('line')
        .attr('x1', xScale(xScale.domain()[0]))
        .attr('x2', xScale(xScale.domain()[1]))
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke-dasharray', '4 4');
    }
    
    sel.append('text')
      .attr('dominant-baseline', 'middle')
      .attr('dx', '-0.5em')
      .text(formatter(d));
  };
  

  const createChart = function(el) {
    const container = select(el);
    const data = container.datum();
    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'chart');

    const [gAxes, gData, gTopText] = addGroups(svg, ['axes', 'data', 'top-text']);
      
    gTopText.append('text')
      .attr('dominant-baseline', 'hanging')
      .attr('class', 'main-title')
      .text(data.label);

    gTopText.append('text')
      .attr('class', 'sub')
      .attr('dominant-baseline', 'hanging')
      .text('Rate per 1,000 person-years');

    gTopText.append('text')
      .attr('class', 'legend-text')
      .selectAll('tspan')
      .data(['Women', '|', 'Men'])
      .enter()
      .append('tspan')
      .attr('dominant-baseline', 'hanging')
      .text(d => d);

    const [gXAxis, gYAxis] = addGroups(gAxes, ['axis x-axis', 'axis y-axis']);

    const xTickLabels = d3Ticks(xDomain[0], xDomain[1], 5);

    gXAxis.append('line')
      .attr('class', 'axis-line')
      .attr('x1', xScale(xDomain[0]))
      .attr('y1', 0)
      .attr('x2', xScale(xDomain[1]))
      .attr('y2', 0);

    addGroup(gXAxis, 'ticks')
      .selectAll('g.tick')
      .data(xTickLabels)
      .enter()
      .append('g')
      .attr('text-anchor', 'middle')
      .attr('class', 'tick')
      .style('transform', d => `translateX(${xScale(d)}px)`)
      .each(function(d) {
        const sel = select(this);
        sel.append('line').attr('x1',0).attr('x2',0).attr('y1', 0).attr('y2', tickHeight);
        sel.append('text').attr('dominant-baseline', 'hanging').text(d);
      });

    gXAxis.append('text')
      .attr('class', 'axis-title')
      .attr('dominant-baseline', 'auto')
      .attr('dy', '-0.5em')
      .append('tspan')
      .attr('dx', xScale(50))
      .text('Age');
    
    const fData = generateLineData(data, 'female');
    const mData = generateLineData(data, 'male');

    const yMax = getYMax(data);
    let yScale = getYScale(yMax);
    const yTickLabels = yScale.ticks(5);

    addGroup(gYAxis, 'ticks')
      .selectAll('g.tick')
      .data(yTickLabels, d => d)
      .enter()
      .append('g')
      .attr('text-anchor', 'end')
      .attr('class', 'tick')
      .style('transform', d => `translateY(${yScale(d)}px)`)
      .style('opacity', 1)
      .each(createYTick);

    const line = d3Line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    gData.selectAll('path')
      .data([fData, mData])
      .enter()
      .append('path')
      .attr('class', (_, i) => i === 0 ? 'females': 'males')
      .attr('d', line);


    const updateChart = function() {
      const oldYScale = yScale;
      const data = container.datum();
      const yMax = getYMax(data);
      yScale = getYScale(yMax);
      const yTickLabels = yScale.ticks(5);
      
      const yTicks = gYAxis.select('.ticks')
        .selectAll('g.tick')
        .data(yTickLabels, d => d);

      yTicks.exit()
        .transition()
        .duration(duration)
        .style('transform', d => `translateY(${yScale(d)}px)`)
        .style('opacity', 0)
        .remove();

      const yTicksEnter = yTicks.enter()
        .append('g')
        .attr('text-anchor', 'end')
        .attr('class', 'tick')
        .style('transform', d => `translateY(${oldYScale(d)}px)`)
        .style('opacity', 0)
        .each(createYTick);

      yTicks.merge(yTicksEnter)
        .transition()
        .duration(duration)
        .style('transform', d => `translateY(${yScale(d)}px)`)
        .style('opacity', 1);

      const fData = generateLineData(data, 'female');
      const mData = generateLineData(data, 'male');

      line.y(d => yScale(d.y));

      gData.selectAll('path')
        .data([fData, mData])
        .transition()
        .duration(duration)
        .attr('d', line);
    };


    const removeChart = function() {
      container.remove();
    };


    el.updateChart = updateChart;
    el.removeChart = removeChart;
  };


  const updateSmallMultiples = createSmallMultiplesFramework(graphicContainer, createChart);


  return function updateGraphic() {
    const data = getData('pod');
    const keyFunction = d => `${d.pod}-${d.group}`;
    updateSmallMultiples(data, keyFunction);
  };
}


export { createGraphic };