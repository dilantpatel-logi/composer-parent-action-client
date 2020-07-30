/*
 * Copyright (C) Zoomdata, Inc. 2012-2019. All rights reserved.
 */

const fetch = require('node-fetch');
const express = require('express');
const lodash = require('lodash');
const bodyParser = require('body-parser');
const options = require('./optionsParser');
const createOutputTable = require('./outputTable');
var AccessToken = '';
const clientAccess = require('./client.json');
const { escapeRegExp } = require('lodash');


// Bootstrap
verifyOptionsPassed();
const app = express();

app.use(bodyParser.json());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


/*********************************************************
 * 
 * Front-end stuff for iFrame and iFrameless embedding Composer dashboard
 * 
 */

app.get('/', function(req, res) {
	
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if(AccessToken.length==0) {
		OAuthRequest(req, res, function(err, result){
			if(err){
				res.status(err ? err.status : 500);
				res.send(err.ErrorMessage);
			} else {
				console.log(result);
				//console.log(ComposerUrl);
				AccessToken = result.AccessCode;
				res.render('index.html', {"AccessCode": result.AccessCode});
			}
		});
	}
	else {
		res.render('index.html', {"AccessCode": AccessToken});
    }
});

app.get('/iframeless', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	if(AccessToken.length==0) {
		OAuthRequest(req, res, function(err, result){
			if(err){
				res.status(err ? err.status : 500);
				res.send(err.ErrorMessage);
			} else {
				console.log(result);
				//console.log(ComposerUrl);
				AccessToken = result.AccessCode;
				res.render('iframeless.html', {"AccessCode": result.AccessCode});
			}
		});
	}
	else {
		res.render('iframeless.html', {"AccessCode": AccessToken});
    }
});

app.listen(options.port, () => {
    console.log(`Action server started on port ${options.port}`);
    console.log(`Zoom server expected on port ${options.server}`);
});

OAuthRequest = function(req, res, callback) {
	var PostUrl = `${options.server}/api/oauth/token?username=${options.username}`;
	return fetch(PostUrl, {
		method: 'post',
		body: JSON.stringify(clientAccess),
		headers: {
			'Content-Type': 'application/vnd.zoomdata.v2+json',
			'Authorization': `Basic ${encodeSupervisorPass()}`
		},
	}).then(resp => resp.text()).then(resp => {
		console.log(resp);
		callback(null, {AccessCode : JSON.parse(resp).tokenValue, status : 200});
	})
	.catch(err => {
		console.error(err);
		callback({ErrorMessage: err, status : 500});
	});
};

function encodeSupervisorPass() {
    const {supassword} = options;
    return Buffer.from(`supervisor:${supassword}`).toString('base64');
}


/* ---------------------------------------------------------------------- 
 * 
 * Server side code for Action response with Composer 
 * 
 * */
app.post('/invoke', (req, res) => {
    
    console.log(req);
    console.log(res);
    
    const {actionLabel, callbackEndpoint, callbackRequest} = req.body;
    console.log(`Received action invocation for action ${actionLabel}`);

    fireCallbackRequest(callbackEndpoint, callbackRequest).then(() => {
        return res.sendStatus(204);
    })
    .catch(() => {
        return res.sendStatus(502);
    });
});

function fireCallbackRequest(endpoint, request) {
    const joinedUrl = `${options.server}${joinAbsoluteUrlPath(endpoint)}`;
    console.log(`Sending request '${JSON.stringify(request, null, 2)}' to ${joinedUrl}`);

    /*Error being thrown when dimensions are included - remove */
    Object.keys(request.startVisMessage).forEach(function(key){
        if(key=='dimensions'){
          delete request.startVisMessage[key];
        }
    });
    if(request.startVisMessage.filters.length>0 
      && typeof request.startVisMessage.filters[0].path !== 'undefined'
      && typeof request.startVisMessage.filters[0].value !== 'undefined') {
        var fltr = request.startVisMessage.filters[0];
        actionLabel = fltr.path.name + '-';
        actionLabel += fltr.value[0];
    }


    return fetch(joinedUrl, {
        method: 'post',
        body: JSON.stringify(request),
        headers: {
            'Authorization': `Basic ${encodeUserPass()}`,
            'Content-Type': 'application/json',
        },
    }).then(res => res.text())
        .then(res => {
            console.log('Received data:');
            console.log(createOutputTable(res));
        })
        .catch(err => console.error(err));
}



function encodeUserPass() {
    const {username, password} = options;
    return Buffer.from(`${username}:${password}`).toString('base64');
}

function verifyOptionsPassed() {
    const {username, password, server} = options;

    if ([username, password, server].some(lodash.isUndefined)) {
        console.error('Username, password, and server are required options!');
        process.exit(1);
    }
}

function joinAbsoluteUrlPath(...args) {
    return '/' + args.map(pathPart => pathPart.replace(/(^\/|\/$)/g, '')).join('/');
}
