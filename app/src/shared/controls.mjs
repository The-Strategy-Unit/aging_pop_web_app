import { lookup } from './lookup.mjs';
import { variants } from '../shared/variants.mjs';


function initAreaSelect(dropdown, setState) {
  const callback = evt => setState({ 'area': evt.target.value });
  dropdown.on('change', callback);

  dropdown.selectAll('option')  
    .data(Array.from(lookup.values()))
    .enter()
    .append('option')
    .attr('value', d => d.code)
    .text(d => d.name);

  return dropdown.node().value;
}


function initPodSelect(dropdown, setState) {
  const pods = ['aae', 'apc', 'opc'];
  const callback = evt => setState({ 'pod': evt.target.value });
  dropdown.on('change', callback);

  dropdown.selectAll('option')  
    .data(pods)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  return dropdown.node().value;
}


function initHorizonSelect(dropdown, setState) {
  const horizons = [2025, 2030, 2035, 2040];
  const callback = evt => setState({ 'horizon': evt.target.value });
  dropdown.on('change', callback);

  dropdown.selectAll('option')  
    .data(horizons)
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(d => d);

  return dropdown.node().value;
}


function initVariantSelect(dropdown, setState) {
  const callback = evt => setState({ 'variant': evt.target.value });
  const variantSelect = dropdown.on('change', callback);
  
  variantSelect.selectAll('option')  
    .data(Array.from(Object.entries(variants)))
    .enter()
    .append('option')
    .attr('value', d => d[0])
    .text(d => d[1].name);

  return dropdown.node().value;
}


function initSelectMenus(container, setState) {
  const initialValues = {};

  const areaSelect = container.select('.area-select');
  if (!areaSelect.empty()) {
    initialValues.area = initAreaSelect(areaSelect, setState);
  }

  const podSelect = container.select('.pod-select');
  if (!podSelect.empty()) {
    initialValues.pod = initPodSelect(podSelect, setState);
  }

  const horizonSelect = container.select('.horizon-select');
  if (!horizonSelect.empty()) {
    initialValues.horizon = initHorizonSelect(horizonSelect, setState);
  }

  const variantSelect = container.select('.variant-select');
  if (!variantSelect.empty()) {
    initialValues.variant = initVariantSelect(variantSelect, setState);
  }

  return initialValues;
}


export { initSelectMenus };
