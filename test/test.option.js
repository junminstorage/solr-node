/**
 * this allows to set up any options for client, such as proxy, authorization and etc.
 */

var httpProxy = require('http-proxy-agent');
var proxy = process.env.http_proxy || 'http://bproxy.cfe.bloomberg.com:80';
var agent = new httpProxy(proxy);

exports.agent = agent;