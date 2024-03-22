const width = 600;
const height = 500;


function createGraphic(container) {
  const graphicContainer = container.select('.graphic-container');

  const svg = graphicContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const gAgeStructure = svg.append('g')
    .attr('class', 'age-structure');
  
  gAgeStructure.append('text')
    .text('Age structure');

  const bigYear = gAgeStructure.append('text')
    .attr('class', 'big-year'); 


  return function updateGraphic(evt) {
    const detail = evt.detail;
    bigYear.text(detail.year);
  };
}


export { createGraphic };