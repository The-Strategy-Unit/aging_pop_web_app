import { initLookup, lookup } from './shared/lookup.mjs'; 

async function main() {
  await initLookup();
  console.log(lookup);
}


main();