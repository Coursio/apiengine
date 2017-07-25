'use strict';

const { hrtime } = process;

const { throwError } = require('../../error');

const { PerfLogItem } = require('./log_item');
const { CATEGORIES, DEFAULT_CATEGORY } = require('./constants');

// This class calculates time intervals, in order to do performance monitoring
// Concepts:
//   - a `label` is a measurements name
//   - a `category` is the namespace of a label. Default is "default"
//   - a label can have several measurements, called `item`
//     Each call to PerfLog.start() will create a new item, which is assigned
//     a unique `itemId`
//   - each item can be stopped and restarted by calling `start` and `stop`
// API:
//   - `const perfLog = new PerfLog();` is done once per phase
//   - `const perf = perfLog.start();` is done once per item
//   - alternating `perf.stop()` and `perf.start()` will freeze|unfreeze an item
//   - `perf.stop()` will return current time, in milliseconds
//   - `perf.getMeasures()` will return an array of measures:
//       - [category="default"] {string}
//       - label {string}
//       - duration {number} - sum of all items durations, in milliseconds
//       - items {number[]} - each item duration, in milliseconds
//       - count {number} - number of items
//       - average {number} - average item duration, in milliseconds
//   - `perf.getMeasuresMessage({ measures })` will return as a string,
//     ready to be printed on console
class PerfLog {
  constructor () {
    this.measures = {};
    this.counter = 0;
  }

  // Start a new measurement item
  start (label, category = DEFAULT_CATEGORY) {
    // We use an incrementing counter as unique ID for items
    this.counter += 1;
    const itemId = this.counter;
    const options = { itemId, label, category };

    validateOptions(options);

    this.startItem(options);

    return new PerfLogItem({ perfLog: this, options });
  }

  startItem (options) {
    return this.recordItem(Object.assign({}, options, { end: false }));
  }

  stopItem (options) {
    return this.recordItem(Object.assign({}, options, { end: true }));
  }

  recordItem ({ end, itemId, label, category }) {
    const measure = this.getMeasure({ itemId, label, category });

    // `hrtime()` is more precise that `Date.now()`
    const [secs, nanoSecs] = hrtime();

    // `end()` substracts the current time with the previous time
    if (end) {
      const [lastSecs, lastNanoSecs] = measure.pending;
      const duration = (secs - lastSecs) * 10 ** 9 + (nanoSecs - lastNanoSecs);
      // We sum up the calculated duration with the previous items
      measure.duration = measure.duration
        ? measure.duration + duration
        : duration;
    // `start()` marks the current time
    } else {
      measure.pending = [secs, nanoSecs];
    }

    return measure.duration / 10 ** 6;
  }

  getMeasure ({ itemId, label, category }) {
    // Sort measurements by category, label and itemId
    const key = `${category} ${label}`;

    if (!this.measures[key]) {
      this.measures[key] = {};
    }

    if (!this.measures[key][itemId]) {
      this.measures[key][itemId] = {};
    }

    const measure = this.measures[key][itemId];
    return measure;
  }

  // Returns structured measurements
  getMeasures () {
    // When an exception was thrown, only returns measurements with
    // category `exception`
    const hasException = Object.keys(this.measures).some(categoryLabel =>
      categoryLabel.startsWith('exception')
    );

    return Object.entries(this.measures)
      .map(([categoryLabel, labelMeasures]) => {
        const [category, label] = categoryLabel.split(' ');
        // Use milliseconds, but with nanoseconds precision
        const items = Object.values(labelMeasures)
          .filter(({ duration }) => duration !== undefined)
          .map(({ duration }) => duration / 10 ** 6);
        return [category, label, items];
      })
      .filter(([category]) => !(hasException && category !== 'exception'))
      .filter(([,, items]) => items.length > 0)
      .map(([category, label, items]) => {
        const duration = items.reduce((sum, item) => sum + item, 0);
        const count = items.length;
        const average = duration / count;

        const measure = { category, label, duration, items, count, average };
        return measure;
      });
  }
}

const validateOptions = function ({ label, category }) {
  if (typeof label !== 'string') {
    const message = 'Performance label must be a string';
    throwError(message, { reason: 'UTILITY_ERROR' });
  }

  if (typeof category !== 'string') {
    const message = 'Performance category must be a string';
    throwError(message, { reason: 'UTILITY_ERROR' });
  }

  if (!CATEGORIES.includes(category)) {
    const message = `Unknown performance category: '${category}'`;
    throwError(message, { reason: 'UTILITY_ERROR' });
  }
};

module.exports = {
  PerfLog,
};
