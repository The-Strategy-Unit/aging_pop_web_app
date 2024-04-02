import { json } from 'd3-fetch';


async function load(url) {
  try {
    const data = await json(url);
    return data;
  }
  catch(e) {
    console.error(e);
    return [];
  }
}


export { load };
