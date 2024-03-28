import { lookup } from './lookup.mjs';


function initAreaSelect(container, callback) {
  const areaSelect = container.select('.area-select')
    .on('change', callback);

  areaSelect.selectAll('option')  
    .data(Array.from(lookup.values()))
    .enter()
    .append('option')
    .attr('value', d => d.code)
    .text(d => d.name);

  return areaSelect;
}


export { initAreaSelect };
