// Helper function for small multiples (line charts nad histograms)
function createSmallMultiplesFramework(container, createChart) {
  return function updateSmallMultiples(data, keyFunction) {
    const charts = container.selectAll('div.chart-wrapper')
      .data(data, keyFunction);

    charts.exit()
      .each(function() {
        this.removeChart();
      });

    charts.enter()
      .append('div')
      .attr('class', 'chart-wrapper')
      .each(function() {
        createChart(this);
      });

    charts
      .each(function() {
        this.updateChart();
      });
  };
}


export { createSmallMultiplesFramework };
