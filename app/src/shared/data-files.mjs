import { constants } from './constants.mjs';

const { dataFilePrefix, dataFileSuffix } = constants;

function getDataFileUrl(dataFile) {
  return `${dataFilePrefix}${dataFile}${dataFileSuffix}`;
}

export { getDataFileUrl };
