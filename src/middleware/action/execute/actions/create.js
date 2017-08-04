'use strict';

const createCommand = ({ args: { data: dataArg } }) => ({
  commandType: 'create',
  args: {
    newData: dataArg,
  },
});

// 'create' action uses a single 'create' command
const createAction = [
  { input: createCommand },
];

module.exports = {
  create: createAction,
};
