import { select } from 'd3-selection';
import { initLookup } from './shared/lookup.mjs';
import { initVariants } from './shared/variants.mjs';
import { initPods } from './shared/pods.mjs';
import { initPyramid } from './pyramid/index.mjs';
import { initLineCharts } from './line-charts/index.mjs';
import { initHistograms } from './histograms/index.mjs';


async function main() {
  // Asynchronously load the json files from root of data/ into memory
  await Promise.all([initLookup(), initVariants(), initPods()]);
  // Initialise our charts in order
  initPyramid(select('#pyramid'));
  initLineCharts(select('#line-charts'));
  initHistograms(select('#histograms'));
}

// Actually set things going!
main();