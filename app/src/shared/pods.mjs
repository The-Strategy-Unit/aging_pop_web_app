// Module for loading pod data
import { load } from './load.mjs';

let pods;


async function initPods() {
  [pods] = await Promise.all([load('pods')]);
}


export { pods, initPods };