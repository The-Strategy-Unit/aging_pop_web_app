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


async function load(dataFile) {
  const url = getDataFileUrl(dataFile);
  let data;

  try {
    const response = await fetch(url, options);
    if (isProd) {
      const raw = await response.arrayBuffer();
      const inflated = pako.inflate(raw);
      data = JSON.parse(td.decode(inflated));
    }
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
