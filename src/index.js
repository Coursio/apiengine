'use strict';


require('./debugging');

const { start } = require('./server');


start();


module.exports = {
  start,
};