var SolrClient = require('./solrClient');
var SolrQuery = require('./solrQuery');
//var zookeeper = require('node-zookeeper-client');

module.exports = exports = SolrCloudClient;

//subclass from SolrClient
SolrCloudClient.prototype = new SolrClient();
SolrCloudClient.prototype.constructor = SolrClient; 

function SolrCloudClient(options){
	SolrClient.call(this, options);
}

SolrCloudClient.ADMIN_COLLECTION_HANDLER = 'admin/collections';
SolrCloudClient.ZOOKEEPER_HANDLER = 'zookeeper';

/**
 * Zookeeper APIs
 */
SolrCloudClient.prototype.clusterState = function(action, callback){
	var path = [this.context, SolrCloudClient.ZOOKEEPER_HANDLER].join('/');
	var query = ['wt=json', 'detail=true', 'path=%2Fclusterstate.json', 'view=graph'].join('&');
	return this.jsonGet(path, query, callback);
}

SolrCloudClient.prototype.collections = function(action, callback){
	var path = [this.context, SolrCloudClient.ZOOKEEPER_HANDLER].join('/');
	var query = ['wt=json', 'detail=true', 'path=%2Fcollections'].join('&');
	return this.jsonGet(path, query, callback);
}

/**
 * Collection APIs
 */
SolrCloudClient.prototype.collectionsList = function(action, callback){
	var path = [this.context, SolrCloudClient.ADMIN_COLLECTION_HANDLER].join('/');
	var query = ['wt=json', 'action=list'].join('&');
	return this.jsonGet(path, query, callback);
}


