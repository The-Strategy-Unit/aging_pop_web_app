const zipExtension = '.gz';
// Check html element to see whether this is the production app
// If so we'll use the zip extension above. Otherwise the data will be
// unzipped
const isProd = document.documentElement.dataset.environment === 'prod';

const constants = {
  isProd,
  dataFilePrefix: '/data/',
  dataFileSuffix: `.json${isProd ? zipExtension : ''}`,
  tickTime: 1000,
};

export { constants };
