const v1 = require('./v1');
const handlerDefault = require('./default');

module.exports = {
  ...v1,
  handlerDefault
};
