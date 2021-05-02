const v1 = require('./v1');

const routerHealth = require('./health');

module.exports = {
  ...v1,
  routerHealth
};
