var mocha = require('mocha'),	
	assert = require('chai').assert,
	expect = require('chai').expect,
	figc = require('figc'),
	rewire = require('rewire'), //dependency injector
	MockZKClient = require('./mockZKClient'),//the zkClient mock-up
	ZKStateReader = rewire('../lib/zkStateReader');

var config = figc(__dirname + '/' + 'test.config.json');

describe('zkStateReader test', function () {
    describe('exists method tests', function () {   	
   	
        it('non-exist path should not exist', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/not-exists', function(err, data){
        		reader.close();
        		expect(data).to.equal(false);
        		done();
        	})
        	       	
        });
        
        it('/configs path should exist', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/configs', function(err, data){
        		reader.close();
        		expect(data).to.equal(true);
        		done();
        	})
        	       	
        });
        
    })
    
    
    describe('exists method tests using mock-up', function () {   	
   	
    	var putBack;
    	before(function(){
    		putBack = ZKStateReader.__set__({
    			'zookeeper' : {
    				'createClient' : function(){
    					return new MockZKClient();
    				}
    			}
    		});
    	});
    	
    	after(function(){
    		putBack();
    	});
    	
        it('not-exists path should not exist', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/not-exists', function(err, data){
        		reader.close();
        		expect(err).to.equal(null);
        		expect(data).to.equal(false);
        		done();
        	})
        	       	
        });
        
        it('cause-error path should cause error', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/cause-error', function(err, data){
        		reader.close();
        		expect(err).to.not.equal(null);
        		expect(data).to.equal(null);
        		done();
        	})
        	       	
        });

        it('emit-event path should emit-event', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/emit-event', function(err, data){
        		reader.close();
        		expect(err).to.equal(null);
        		expect(data).to.equal(true);
        		done();
        	})
        	       	
        });

        it('/configs path should exist', function (done) {
            
        	var reader = new ZKStateReader(config.zkHost);        	
        	reader.exists('/configs', function(err, data){
        		reader.close();
        		expect(err).to.equal(null);
        		expect(data).to.equal(true);
        		done();
        	})
        	       	
        });
        
    })
    
});
