import { select } from 'd3-selection';
import { ticks as d3Ticks } from 'd3-array';
import { format } from 'd3-format';
import { getData } from './state.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { scaleLinear } from 'd3-scale';

const formatter = format(',');


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

  const createChart = function(container) {    
    const svg = container.append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'chart');

    const gTopText = svg.append('g')
      .attr('class', 'top-text')
      .attr('dominant-baseline', 'hanging');

    gTopText.append('text')
      .attr('class', 'main-title')
      .text(container.datum());

    gTopText.append('text')
      .attr('class', 'rate-text')
      .text('Rate per 1,000 person-years');

    gTopText.append('text')
      .attr('class', 'legend-text')
      .selectAll('tspan')
      .data(['Women', '|', 'Men'])
      .enter()
      .append('tspan')
      .text(d => d);
    

    const gAxes = svg.append('g')
      .attr('class', 'axes');

    const gXAxis = gAxes.append('g')
      .attr('class', 'axis x-axis');

    const gYAxis = gAxes.append('g')
      .attr('class', 'axis y-axis');

    const xScale = scaleLinear()
      .domain([0, 100])
      .range([0, width - (margins.left + margins.right)]);

    const xTickLabels = d3Ticks(0, 100, 5);

    gXAxis.append('line')
      .attr('class', 'axis-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', xScale(100))
      .attr('y2', 0);

    gXAxis.append('g')
      .attr('class', 'ticks')
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

    const yTickLabels = d3Ticks(0, 1000, 5);

    const yScale = scaleLinear()
      .domain([0, yTickLabels[yTickLabels.length - 1]])
      .range([height - (margins.bottom + margins.top), 0]);

    gYAxis.append('g')
      .attr('class', 'ticks')
      .selectAll('g.tick')
      .data(yTickLabels)
      .enter()
      .append('g')
      .attr('text-anchor', 'end')
      .attr('class', 'tick')
      .style('transform', d => `translateY(${yScale(d)}px)`)
      .each(function(d, i) {
        const sel = select(this);

        if (i !== 0) {
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
      });
  };
  

  const removeChart = function(container) {
    container.remove();
  };

  return function updateGraphic() {
    const charts = graphicContainer.selectAll('div.chart-wrapper')
      .data(getData('pod'), d => d);

    charts.exit()
      .each(function() {
        removeChart(select(this));
      });

    charts.enter()
      .append('div')
      .attr('class', d => `chart-wrapper ${d}`)
      .each(function() {
        createChart(select(this));
      });
  };
}


export { createGraphic };