// Module for loading variant and assumption data
import { load } from './load.mjs';

let variants, assumptions;


async function initVariants() {
  [variants, assumptions] = await Promise.all([load('variants'), load('assumptions')]);
}


export { variants, assumptions, initVariants };