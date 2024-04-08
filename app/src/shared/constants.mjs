const zipExtension = '.gz';
const isProd = document.documentElement.dataset.environment === 'prod';

const constants = {
  isProd,
  dataFilePrefix: '/data/',
  dataFileSuffix: `.json${isProd ? zipExtension : ''}`,
  tickTime: 1000,
};

export { constants };
