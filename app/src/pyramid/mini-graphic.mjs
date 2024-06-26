import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { getState, getData } from './state.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { addGroup, addGroups } from '../shared/svg.mjs';

// This function creates the mini pyramid seen in the top left-hand
// corner of the pyramid when "Lock age structure" is turned on.
function createMiniGraphic(container) {
  const graphicContainer = container.select('.graphic-container');
  const miniContainer = graphicContainer.select('.mini-graphic');

  const getCssVariable = createGetCssVariable(miniContainer);

  const width = getCssVariable('width');
  const height = getCssVariable('height');

  const margins = {
    top: getCssVariable('margin-top'),
    right: getCssVariable('margin-right'),
    bottom: getCssVariable('margin-bottom'),
    left: getCssVariable('margin-left'),
    xMidWidth: getCssVariable('x-mid-width')
  };

  const svg = miniContainer.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const yScale = scaleLinear()
    .domain([0, 101])
    .range([height - margins.bottom, margins.top]);

  const halfWidth = (width - (margins.left + margins.xMidWidth + margins.right)) / 2;

  
  return function updateMiniGraphic() {
    const refYear = getState('refYear');
    miniContainer.classed('have-data', refYear !== null);
    svg.text('');
    if (refYear === null) { return; }

    const refYearData = getData('refYear');
    const domain = [0, getData('max')];

    const data = [
      { side: 'left', range: [halfWidth, 0], data: refYearData.m },
      { side: 'right', range: [0, halfWidth], data: refYearData.f }
    ];

    const [gData, gRefYear] = addGroups(svg, ['data', 'ref-year']);

    gData.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', d => d.side)
      .each(function(d) {
        const xScale = scaleLinear()
          .domain(domain)
          .range(d.range)
          .nice();

        const points = d.data.map(function({ total, age }) {
          return [xScale(total), yScale(age)].join(',');
        }).join(' ');

        select(this)
          .append('polyline')
          .attr('points', points);
      });

    gRefYear.append('text')
      .attr('text-anchor', 'middle')
      .text(refYear);

    if (getData('year').variant !== 'v0') {
      addGroup(svg, 'assumptions')
        .append('text')
        .attr('text-anchor', 'middle')
        .text(getData('assumptions')[0]);
    }
  };
}


export { createMiniGraphic };
