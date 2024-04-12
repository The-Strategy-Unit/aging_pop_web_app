import pako from 'pako';
import { constants } from './constants.mjs';
import { getDataFileUrl } from './data-files.mjs';

const isProd = constants.isProd;

const options = {
  headers: {
    'Content-Type': 'application/json',
    'Content-Encoding': isProd ? 'gzip' : 'json'
  }
};

const td = new TextDecoder();


// Load a data file asynchronously and when it's loaded
// return the data as a JavaScript object
async function load(dataFile) {
  const url = getDataFileUrl(dataFile);
  let data;

  try {
    const response = await fetch(url, options);
    // If we're in production and using zip files
    // we have to unzip them
    if (isProd) {
      const raw = await response.arrayBuffer();
      const inflated = pako.inflate(raw);
      data = JSON.parse(td.decode(inflated));
    }
    // For development it's a bit simpler
    else {
      data = await response.json();
    }
    
    return data;
  }
  catch(e) {
    console.error(e);
    return [];
  }
}





export { load };
