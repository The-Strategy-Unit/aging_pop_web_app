import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { ticks as d3Ticks } from 'd3-array';
import { format } from 'd3-format';
import 'd3-transition'; // This is needed to make animations work
import { getState, getData } from './state.mjs';
import { constants } from '../shared/constants.mjs';
import { createGetCssVariable } from '../shared/css.mjs';
import { addGroup, addGroups } from '../shared/svg.mjs';

// Create a couple of number formatters forregular and large numbers
const regularFormatter = format(',');
const bigFormatter = d => d ? `${regularFormatter(d/1000)}k` : '0';


function createGraphic(container) {
  const graphicContainer = container.select('.graphic-container');
  // This function is used to bring CSS variables into JavaScript
  const getCssVariable = createGetCssVariable(graphicContainer);

  // Get the defined dimensions for the SVG
  const width = getCssVariable('width');
  const height = getCssVariable('height');

  // Get the defined margins used in the SVG
  const margins = {
    top: getCssVariable('margin-top'),
    right: getCssVariable('margin-right'),
    bottom: getCssVariable('margin-bottom'),
    left: getCssVariable('margin-left'),
    xMidWidth: getCssVariable('x-mid-width') // AKA the y-axis gap 
  };
  
  // Width of one side of the pyramid
  const halfWidth = (width - (margins.left + margins.xMidWidth + margins.right)) / 2;
  const tickHeight = getCssVariable('tick-height');

  const svg = graphicContainer.select('.main-graphic svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`); // Define SVG's internal coordinate system

  // Classes to be given to top-level group elements
  // yob => year of birth
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
  ] = addGroups(svg, topLevelGroups); // Actually create these top-level groups

  // Add the age structure text boxes
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
    // side of left runs axis from centre to left
    // side of right runs axis from centre to right
    const gAxis = addGroup(xAxes, `axis, x-axis, ${side}`)
      .attr('text-anchor', 'middle');

    addGroup(gAxis, 'ticks');

    const gGrid = addGroup(gGrids, `grid ${side}`);
  
    gAxis.append('text')
      .attr('class', 'axis-title')
      .attr('dominant-baseline', 'auto')
      .append('tspan')
      .attr('dx', `${halfWidth /2}px`)
      .attr('dy', '-0.25em')
      .text(label);

    // These get initialised/changed by the update function below
    let oldMax;
    let scale;

    // Define an update function to be called whenever
    // the range of the axis needs to change
    const update = function(max) {
      if (max === oldMax) { return; } // nothing has actually changed
      oldMax = max; // store the oldMax for next time this function is called

      const domain = [0, max];
      const range = side === 'left' ? [halfWidth, 0] : [0, halfWidth];

      scale = scaleLinear()
        .domain(domain)
        .range(range)
        .nice();

      const ticks = scale.ticks(5);
      const axisMax = ticks[ticks.length - 1]; // may be > max due to niceification
      // Pick the right formatter, given the max value of the axis
      const formatter = axisMax > 10000 ? bigFormatter : regularFormatter;

      // Add tick lines and labels as groups
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

    // We return an object containing the update function
    // and a getter for returning the current (x)scale
    const out = { update };
    Object.defineProperty(out, 'scale', { get: () => scale });
    return out;
  };

  const yScale = scaleLinear()
    .domain([0, 101]) // 0 to 100 plus 1 for the height of the 100 bar
    .range([height - margins.bottom, margins.top]);

  const createYAxis = function() {
    const tickLabels = d3Ticks(0, 100, 20); // 20(ish) ticks from 0 to 100
    // Calculate how many px to translate y-axis to get it into the middle
    const xTranslate = margins.left + halfWidth + (margins.xMidWidth / 2);

    addGroup(gAxes, 'axis, y-axis')
      .style('transform', `translateX(${xTranslate}px)`)
      .attr('text-anchor', 'middle') // center text horizontally
      .selectAll('text')
      .data(tickLabels)
      .enter()
      .append('text')
      .attr('dominant-baseline', 'auto') // i.e. vertically aligned to bottom of the text
      .text(d => `${d}${d === 100 ? '+' : ''}`) // add + sign for 100
      .attr('x', 0)
      .attr('y', d => yScale(d))
      .attr('dy', '0.1em'); // a little baseline offset. Makes things look neater as our
    // numbers have no descenders
  };

  const mAxis = createXAxis('left', 'Men');
  const fAxis = createXAxis('right', 'Women');
  createYAxis();

  let chosenYob = null;
  let previousYear = null;

  // Return function to call when we want to update graphic
  return function updateGraphic() {
    const year = getState('year');
    bigYear.text(year);
    // To animate or not to animate
    const duration = getState('animating') ? constants.tickTime : 0;
    mAxis.update(getData('max'));
    fAxis.update(getData('max'));

    // If we're going from last year to first year
    // animation looks weird so instead we clear things
    // and start over again
    const reset = duration && previousYear > year; 
    if (reset) {
      gData.text('');
      gYobLabels.text('');
    }

    // A bar should be 1 year of height
    // but px scale actually runs in opposite direction
    // to axis scale so we take the absolute value to
    // avoid negative height
    const barHeight = Math.abs(yScale(1) - yScale(0));

    // For each year we create a bar group
    // To animate the right bar from one year to the next
    // we key on the year of birth
    const barGroups = gData
      .selectAll('g.bar-group')
      .data(getData('year').data, d => d.yob);
    
    // Remove bars that have gone off the screen
    // When not animating things get removed immediately
    // so we don't need to worry about where the bars translate
    // to before removing them. When animating we always animate
    // upwards except when looping from the end of the year scale
    // to the top. In that special case all bars are cleared
    // instantly so there is no .exit() to worry about
    barGroups.exit()
      .each(function(d) {
        // Remove corresponding year of birth labels
        gYobLabels.select(`.${d.yobClass}`).remove();
      })
      .transition() // animate
      .duration(duration)
      .style('transform', d => `translateY(${yScale(d.age + 2)}px)`) // translate off top
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
        // We think of rectangle going up from yScale(age) to
        // yScale(age+1) but SVG requires us to define the top
        // of the rectangle and the height. So we have to add
        // 1 to account for this
        const translateY = `translateY(${yScale(d.age+1)}px)`;

        const sel = select(this)
          .classed('chosen', d => d.yob === chosenYob)
          .style('transform', translateY);

        sel.selectAll('g.gender')
          .data(['males', 'females'])
          .enter()
          .append('g')
          .attr('class', d => `gender ${d} ${d === 'males' ? 'left' : 'right'}`)
          .each(function(d) {
            const sel = select(this);
            const scale = (d === 'males' ? mAxis : fAxis).scale;

            // Bar showing actual value
            sel.append('rect')
              .datum(d)
              .attr('height', barHeight)
              .attr('width', 0)
              .attr('x', scale(0));

            // Overlying bar showing min of m and f for current yob
            sel.append('rect')
              .datum('min')
              .attr('class', 'min')
              .attr('height', barHeight)
              .attr('width', 0)
              .attr('x', scale(0));
          });

        // year of birth labels have to be in a separate group
        // to show above all the bars but we deal with them here,
        // alongside their associated bars
        const yobLabels = gYobLabels
          .append('g')
          .datum(d)
          .attr('class', d.yobClass)
          .classed('chosen', d => d.yob === chosenYob)
          .style('transform', translateY);

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

        // Add a little label if a year ends in 4 or 9
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

        // Function for highlighting a given year
        const setAsChosen = function() {
          svg.selectAll('.chosen').classed('chosen', false);
          sel.classed('chosen', true);
          yobLabels.classed('chosen', true);
        };

        // Function for remocing highlighting from a given year
        const unsetAsChosen = function() {
          sel.classed('chosen', false);
          yobLabels.classed('chosen', false);
        };

        sel
          .on('mouseover', function() {
            // Ignore mouseover if user has clicked on a year
            if (chosenYob) { return; }
            setAsChosen();
          })
          .on('mouseout', function() {
            // Ignore mouseout if user has clicked on a year
            if (chosenYob) { return; }
            unsetAsChosen();
          })
          .on('click', function() {
            // User has clicked to make the current hovered
            // year sticky
            if (chosenYob !== d.yob) {
              chosenYob = d.yob;
              setAsChosen();
            }
            // User has clicked to unstick the hovered year
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
        const translateY = `translateY(${yScale(d.age+1)}px)`;

        sel.transition()
          .duration(duration)
          .style('transform', translateY);

        const yobLabels = gYobLabels.select(`.labels-${d.yob}`);

        yobLabels.transition()
          .duration(duration)
          .style('transform', translateY);

        yobLabels.select('.right text')
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

    // Resort labels so they go in a sensible order
    gYobLabels.selectAll('[class^="labels-"]')
      .sort(function(a, b) {
        return b.yob - a.yob;
      });

    const refYear = getState('refYear');

    // Add the reference-year steps
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
          const pointsString = data.map(function({total, age}) {
            return [xScale(total), yScale(age)].join(',');
          }).join(' ');

          select(this)
            .select('polyline')
            .attr('points', pointsString);
        });
    }
    else {
      // Remove reference-year steps
      gRefYear.selectAll('g')
        .data([])
        .exit()
        .remove();
    }

    // Set previousYear to current year so we know when this function
    // is next called whether we've moved to an earlier or later year
    previousYear = year;
  };
}


export { createGraphic };