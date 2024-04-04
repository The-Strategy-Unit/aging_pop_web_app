import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { ticks as d3Ticks } from 'd3-array';
import { format } from 'd3-format';
import 'd3-transition';
import { getState, getData } from './state.mjs';
import { constants } from '../shared/constants.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { addGroup, addGroups } from '../shared/svg.mjs';

const regularFormatter = format(',');
const bigFormatter = d => d ? `${regularFormatter(d/1000)}k` : '0';


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
    xMidWidth: getCssVariable('x-mid-width')
  };
  
  const halfWidth = (width - (margins.left + margins.xMidWidth + margins.right)) / 2;
  const tickHeight = getCssVariable('tick-height');

  const svg = graphicContainer.select('.main-graphic svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const topLevelGroups = [
    'age-structure', 'axes', 'data', 'grids', 'ref-year', 'yob-labels'
  ];

  const [
    gAgeStructure,
    gAxes,
    gData,
    gGrids,
    gRefYear,
    gYobLabels
  ] = addGroups(svg, topLevelGroups);

  gAgeStructure
    .append('text')
    .attr('dominant-baseline', 'hanging')
    .text('Age structure');


  const bigYear = gAgeStructure
    .append('text')
    .attr('dominant-baseline', 'hanging')
    .attr('class', 'big-year');


  const xAxes = addGroup(gAxes, 'x-axes');


  const createXAxis = function(side, label) {
    const gAxis = addGroup(xAxes, `axis, x-axis, ${side}`)
      .attr('text-anchor', 'middle');

    addGroup(gAxis, 'ticks');

    const gGrid = addGroup(gGrids, `grid ${side}`);
  
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

    addGroup(gAxes, 'axis, y-axis')
      .style('transform', `translateX(${xTranslate}px)`)
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(tickLabels)
      .enter()
      .append('text')
      .attr('dominant-baseline', 'middle')
      .text(d => `${d}${d === 100 ? '+' : ''}`)
      .attr('x', 0)
      .attr('y', d => yScale(d));
  };

  const mAxis = createXAxis('left', 'Men');
  const fAxis = createXAxis('right', 'Women');
  createYAxis();

  let chosenYob = null;
  let previousYear = null;

  return function updateGraphic() {
    const year = getState('year');
    bigYear.text(year);
    const duration = getState('animating') ? constants.tickTime : 0;
    mAxis.update(getData('max'));
    fAxis.update(getData('max'));

    const reset = duration && previousYear > year; 

    if (reset) {
      gData.text('');
      gYobLabels.text('');
    }

    const barHeight = Math.abs(yScale(1) - yScale(0));

    const barGroups = gData
      .selectAll('g.bar-group')
      .data(getData('year').data, d => d.yob);
    
    barGroups.exit()
      .each(function(d) {
        gYobLabels.select(`.${d.yobClass}`).remove();
      })
      .transition()
      .duration(duration)
      .style('transform', d => `translateY(${yScale(d.under + 1)}px)`)
      .each(function() {
        const sel = select(this);

        sel.selectAll('g.males rect')
          .transition()
          .duration(duration)
          .attr('x', mAxis.scale(0))
          .attr('width', 0);

        sel.selectAll('g.females rect')
          .transition()
          .duration(duration)
          .attr('width', 0);
      })
      .remove();
      

    const barGroupsEnter = barGroups.enter()
      .append('g')
      .attr('class', 'bar-group')
      .each(function(d) {
        const sel = select(this)
          .classed('chosen', d => d.yob === chosenYob);

        sel.selectAll('g.gender')
          .data(['males', 'females'])
          .enter()
          .append('g')
          .attr('class', d => `gender ${d} ${d === 'males' ? 'left' : 'right'}`)
          .each(function(d) {
            const sel = select(this);
            const scale = (d === 'males' ? mAxis : fAxis).scale;

            sel.append('rect')
              .datum(d)
              .attr('height', barHeight)
              .attr('width', 0)
              .attr('x', scale(0));

            sel.append('rect')
              .datum('min')
              .attr('class', 'min')
              .attr('height', barHeight)
              .attr('width', 0)
              .attr('x', scale(0));
          });

        const yobLabels = gYobLabels
          .append('g')
          .datum(d)
          .attr('class', d.yobClass)
          .classed('chosen', d => d.yob === chosenYob);

        yobLabels.append('g')
          .attr('class', 'left')
          .append('text')
          .attr('class', 'large-yob-label')
          .attr('x', mAxis.scale(0) - 5)
          .attr('dy', '-0.15em')
          .attr('text-anchor', 'end')
          .text(`Year of birth ${d.yob}`);

        yobLabels.append('g')
          .attr('class', 'right')
          .append('text')
          .attr('class', 'large-yob-label')
          .attr('x', fAxis.scale(0) + 5)
          .attr('dy', '-0.15em')
          .attr('text-anchor', 'start');

        if (d.yob % 5 === 4) {
          yobLabels.select('g.left')
            .append('text')
            .datum(d.yob)
            .attr('class', 'small-yob-label')
            .attr('x', mAxis.scale(0) - 5)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('dy', '0.4em')
            .text(d => d);
        }

        const setAsChosen = function() {
          svg.selectAll('.chosen').classed('chosen', false);
          sel.classed('chosen', true);
          yobLabels.classed('chosen', true);
        };

        const unsetAsChosen = function() {
          sel.classed('chosen', false);
          yobLabels.classed('chosen', false);
        };

        sel
          .on('mouseover', function() {
            if (chosenYob) { return; }
            setAsChosen();
          })
          .on('mouseout', function() {
            if (chosenYob) { return; }
            unsetAsChosen();
          })
          .on('click', function() {
            if (chosenYob !== d.yob) {
              chosenYob = d.yob;
              setAsChosen();
            }
            else {
              chosenYob = null;
            }
          });
      });
         
    barGroups.merge(barGroupsEnter)
      .each(function(d) {
        const sel = select(this);
        const values = { males: d.m, females: d.f, min: Math.min(d.m, d.f) };
        const mScale = mAxis.scale;
        const fScale = fAxis.scale;
        const translateY = `translateY(${yScale(d.under)}px)`;

        sel.style('transform', translateY);

        gYobLabels.select(`.labels-${d.yob}`)
          .style('transform', translateY)
          .select('.right text')
          .text(`${format(',')(Math.round(d.m + d.f))} people`);
      
        sel.selectAll('g.males rect')
          .transition()
          .duration(duration)
          .attr('x', d => mScale(values[d]))
          .attr('width', d =>  mScale(0) - mScale(values[d]));

        sel.selectAll('g.females rect')
          .transition()
          .duration(duration)
          .attr('x', fScale(0))
          .attr('width', d =>  fScale(values[d]) - fScale(0));
      });

    gYobLabels.selectAll('[class^="labels-"]')
      .sort(function(a, b) {
        return b.yob - a.yob;
      });

    const refYear = getState('refYear');

    if (refYear) {
      const refYearData = getData('refYear');

      const data = [
        { side: 'left', xScale: mAxis.scale, data: refYearData.m },
        { side: 'right', xScale: fAxis.scale, data: refYearData.f }
      ];

      const lineGroups = gRefYear.selectAll('g')
        .data(data);

      const lineGroupsEnter = lineGroups.enter()
        .append('g')
        .attr('class', d => d.side)
        .each(function() { select(this).append('polyline'); });

      lineGroups.merge(lineGroupsEnter)
        .each(function({xScale, data}) {
          const pointsString = data.map(function({total, under}) {
            return [xScale(total), yScale(under)].join(',');
          }).join(' ');

          select(this)
            .select('polyline')
            .attr('points', pointsString);
        });
    }
    else {
      gRefYear.selectAll('g')
        .data([])
        .exit()
        .remove();
    }

    previousYear = year;
  };
}


export { createGraphic };