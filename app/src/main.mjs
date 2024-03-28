import { select } from 'd3-selection';
import { initLookup } from './shared/lookup.mjs';
import { initVariants } from './shared/variants.mjs';
import { initPyramid } from './pyramid/index.mjs';
import { initLineCharts } from './line-charts/index.mjs';


async function main() {
  await Promise.all([initLookup(), initVariants()]);
  initPyramid(select('#pyramid'));
  initLineCharts(select('#line-charts'));
}


main();