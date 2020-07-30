/*
 * Copyright (C) Zoomdata, Inc. 2012-2019. All rights reserved.
 */

const Table = require('cli-table');

module.exports = function(csv) {
    const lines = csv.split('\n');
    const [head, ...rest] = lines;

    const splitHead = head.split(',');
    const table = new Table({
        head: splitHead,
    });

    rest
        .filter(line => line !== '')
        .map(line => line.split(','))
        .forEach(line => table.push(line));

    return table.toString();
};
