/*
 * Copyright (C) Zoomdata, Inc. 2012-2019. All rights reserved.
 */

const program = require('commander');

const parser = program
    .version('1.0.0')
    .option('-s, --server <value>', 'Zoomdata Server', 'http://lgx01000833-u18.fios-router.home:8080/composer')
    .option('-u, --username <value>', 'consumer', 'admin')
    .option('-p, --password <value>', 'Password', 'Logi2020!')
    .option('--supassword <value>', 'SuPassword', 'Logi2020!')
    .option('--port <value>', 'Port to run the server on', 3000)
    .parse(process.argv);
    
/* -- original ----
    const parser = program
    .version('1.0.0')
    .option('-s, --server <value>', 'Zoomdata Server', 'https://192.168.1.229:8080/zoomdata')
    .option('-u, --username <value>', 'Username', 'admin')
    .option('-p, --password <value>', 'Password', 'LgxZ00m!!')
    .option('--port <value>', 'Port to run the server on', 3000)
    .parse(process.argv);
--- */

module.exports = parser;
