import { constants } from './constants.mjs';

const { dataFilePrefix, dataFileSuffix } = constants;

// This function just means we can write shorter
// references to files rather than the full file path
function getDataFileUrl(dataFile) {
  return `${dataFilePrefix}${dataFile}${dataFileSuffix}`;
}

export { getDataFileUrl };
