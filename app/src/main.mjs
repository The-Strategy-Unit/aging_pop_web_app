import { select } from 'd3-selection';
import { initLookup } from './shared/lookup.mjs';
import { initVariants } from './shared/variants.mjs';
import { initPyramid } from './population-pyramid/index.mjs';


async function main() {
  await Promise.all([initLookup(), initVariants()]);
  initPyramid(select('#pyramid'));
}


main();