import { json, csv } from 'd3-fetch';

const last = arr => arr[arr.length - 1];


async function load(url) {
  try {
    const extension = last(url.split('.'));
    const loader = extension === 'csv' ? csv : json;
    const data = await loader(url);
    return data;
  }
  catch(e) {
    console.error(e);
    return [];
  }
}


export { load };
