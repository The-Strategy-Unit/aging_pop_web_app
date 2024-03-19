import { load } from './load.mjs';

const dataPath = '/data';
const variantsUrl = `${dataPath}/variants.json`;
const assumptionsUrl = `${dataPath}/assumptions.json`;
let variants, assumptions;


async function initVariants() {
  [variants, assumptions] = await Promise.all([load(variantsUrl), load(assumptionsUrl)]);
}


export { variants, assumptions, initVariants };