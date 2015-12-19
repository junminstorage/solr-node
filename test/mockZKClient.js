/*
 * a zookeeper client mock-up 
 * so we can inject it to zkStateReader in unit tests
 * 
 * it extends from EventEmitter to trigger different events
 */
var events            = require('events');
var util              = require('util');

module.exports = exports = MockZKClient;

function MockZKClient(connectionString, options) {
    if (!(this instanceof MockZKClient)) {
        return new MockZKClient(connectionString, options);
    }

    this.state = "disconnected";
    this.counter = 0;
    events.EventEmitter.call(this); 
}

util.inherits(MockZKClient, events.EventEmitter);

MockZKClient.prototype.connect = function(){
	var that = this;
	setTimeout(function(){
		that.emit('connected');
		that.state = "connected";
	}, 300)
	
}

MockZKClient.prototype.close = function(){
	var that = this;
	setTimeout(function(){
		that.emit('disconnected');
		that.state = "disconnected";
	}, 300)
	
}

/**
 * mock exists() method to behave differently based on the different path values
 */
MockZKClient.prototype.exists = function (path, watcher, callback) {
	if(path == '/not-exists'){
		callback(null, null);
	}else if(path == '/cause-error'){
		callback(new Error(), null);
	}else if(path == '/emit-event'){
		if(this.counter == 0){
			this.counter++;
			watcher('new event');
		}
		else
			callback(null, {version: 23, counter: this.counter})
		
	}else
		callback(null, true)
		
}


