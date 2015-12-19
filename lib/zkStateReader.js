var zookeeper = require('node-zookeeper-client');

module.exports = exports = ZKStateReader;

var COLLECTIONS_ZKNODE = "/collections";
var LIVE_NODES_ZKNODE = "/live_nodes";
var ALIASES = "/aliases.json";
var CLUSTER_STATE = "clusterstate.json";
var CLUSTER_PROPS = "/clusterprops.json";

var CONFIGS_ZKNODE = "/configs";
var CONFIGNAME_PROP="configName";

/**
 * 
 * 
 * 
 * @param {string} - Comma separated host:port pairs, each represents a ZooKeeper server. You can optionally 
 * 					 append a chroot path, then the client would be rooted at the given path. 
 * @param {Object} - options e.g. 
 *					 {
      					sessionTimeout: 30000,
      					spinDelay : 1000,
      					retries : 0
   					 }
 */
function ZKStateReader(zkServerAddress, options){
	this.zkClient = zookeeper.createClient(zkServerAddress, options);
	this.zkClient.connect();
}

ZKStateReader.prototype.close = function(){
	this.zkClient.close();
}

ZKStateReader.prototype.configExist = function(configName, cb){
	var path = [CONFIGS_ZKNODE, configName].join('/');
	this.exists(path, cb);
}

/**
 * check if path exists in zk, also place a watcher function
 */
ZKStateReader.prototype.exists = function(path, cb){
	var that = this;
	this.zkClient.on('connected', function(){
		console.log('connected to zk');
		exists(that.zkClient, path);
	})
	
	var exists = function(client, path) {
		client.exists(
		        path,
		        function (event) {
		            console.log('Got event: %s.', event);
		            exists(that.zkClient, path);
		        },
		        function (error, stat) {
		            if (error) {
		                console.log(
		                    'Failed to check existence of node: %s due to: %s.',
		                    path, error
		                );
		                cb(error, null);
		                return;
		            }

		            if (stat) {
		                console.log(
		                    'Node: %s exists and its version is: %j',
		                    path, stat.version
		                );
		                cb(null, true);
		            } else {
		                console.log('Node %s does not exist.', path);
		                cb(null, false);
		            }
		        }
		    );
	}
}

/**
 * If the watcher callback is provided and the operation is successfully,
 *  a watcher will be placed the given node. The watcher will be triggered when 
 *  an operation successfully deletes the given node or creates/deletes the child under it.
 */
ZKStateReader.prototype.refreshLiveNodes = function(cb){	
	this.getChildrenFor(LIVE_NODES_ZKNODE, cb)
}

ZKStateReader.prototype.refreshCollectionList = function(cb){	
	this.getChildrenFor(COLLECTIONS_ZKNODE, cb)
}

/**
 * this will place a watcher on a given node, also place a watcher function
 */
ZKStateReader.prototype.getChildrenFor = function(path, cb){
	var that = this;
	
	this.zkClient.on('connected', function(){
		console.info('connected to zk');
		getChildren(that.zkClient, path);
	})
	
	var getChildren = function(client, path){
		client.getChildren(path, 
				function (event) {
					console.log('Got event: %s', event);
					getChildren(client, path);
				},
						
				function (error, children, stats) {
				if (error) {
					console.error(error.stack);
					cb(error, null);
					return;
				}
				console.log('Children are: %j.', children);
				cb(error, children);
			});
	}
}

/**
 * get collection config
 */

ZKStateReader.prototype.collectionConfig = function(collection, cb){
	var path = [COLLECTIONS_ZKNODE, collection].join('/');
	this.getDataFor(path, cb);
}

/**
 * get collection status, also place a watcher function
 */

ZKStateReader.prototype.collectionState = function(collection, cb){
	var path = [COLLECTIONS_ZKNODE, collection, 'state.json'].join('/');
	this.getDataFor(path, cb);
}

ZKStateReader.prototype.collectionClusterState = function(collection, cb){
	var path = [COLLECTIONS_ZKNODE, collection, CLUSTER_STATE].join('/');
	this.getDataFor(path, cb);
}

ZKStateReader.prototype.getDataFor = function(path, cb){
	console.info('check zk path: ' + path);
	
	var that = this;
	this.zkClient.on('connected', function(){
		console.info('connected to zk');
		getData(that.zkClient, path)
	})

	var getData = function (client, path) {
		client.getData(
				path,
				function (event) {
					console.log('Got event: %s', event);
					getData(client, path);
				},
				function (error, data, stat) {
					if (error) {
						console.error('Error occurred when getting data: %s.', error);
						cb(error, null);
						return;
					}

					console.trace(
							'Node: %s has data: %s, version: %d',
							path, data ? data.toString() : undefined,
							stat.version
					);
					cb(null, data.toString());
					                                                                                                                                                                                                                            }
		);	
	}	
}




        