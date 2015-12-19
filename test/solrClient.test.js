var mocha = require('mocha'),	
	assert = require('chai').assert,
	expect = require('chai').expect,
	figc = require('figc'),
	option = require('./test.option'),
	solrQuery = require('../lib/solrQuery'),
	solrClient = require('../lib/solrClient');

var config = figc(__dirname + '/' + 'test.config.json');

describe('solrClient test', function () {
   
	describe('adminStatus method tests', function () {
        it('adminStatus should return data', function (done) {
        	
        	var client = new solrClient({baseUrl : config.solrBaseUrl, agent: option.agent});        	
        	client.adminStatus(null, function(err, response){
        		expect(err).to.equal(null);
        		console.log(JSON.stringify(response));
        		done();
        	});
        	       	
        });    
        
    })
    
    
     describe('index update method tests', function () {
    	this.timeout(3000);
        it('add one json doc then delete it after should succeed', function (done) {
        	
        	var client = new solrClient({baseUrl : config.solrBaseUrl, core:config.core, agent: option.agent});        	
        	client.add([{id:124, title:'tile test', description:'description test'}], function(err, response){
        		expect(err).to.equal(null);     		
        		expect(response).to.not.equal(null);
        		console.log(JSON.stringify(response));
        		expect(response.responseHeader).to.not.equal(null);
        		expect(response.responseHeader.status).to.equal(0);
        			
        		client.delete(124, function(err, response){        			
        			expect(err).to.equal(null);        			
        			expect(response).to.not.equal(null);
        			console.log(JSON.stringify(response));
            		expect(response.responseHeader).to.not.equal(null);
            		expect(response.responseHeader.status).to.equal(0);  			
        			done();
        		})
        		
        		
        	});       	       	       	
        });            
    })
    
    
    describe('search method tests', function () {
    	
        it('search should return data', function (done) {
        	
        	var client = new solrClient({baseUrl : config.solrBaseUrl, core:config.core, agent: option.agent});  
        	var query = new solrQuery();
        	client.search(query.q('*:*'), function(err, response){
        		expect(err).to.equal(null);
        		console.log(JSON.stringify(response));
        		expect(response.responseHeader).to.not.equal(null);
        		expect(response.responseHeader.status).to.equal(0); 
        		expect(response.response).to.not.equal(null); 
        		expect(response.response.numFound).to.not.equal(null); 
        		done();
        	});
        	       	
        });    
        
    })
    
     describe('search by id method tests', function () {
    	//this.timeout(3000);
    	var client = new solrClient({baseUrl : config.solrBaseUrl, core:config.core, agent: option.agent});    
    	 
    	before(function(done){
    		    	
        	client.add([{id:127, title:'tile test', description:'description test'}], function(err, response){
        		expect(err).to.equal(null);     		
        		expect(response).to.not.equal(null);
        		console.log(JSON.stringify(response));
        		expect(response.responseHeader).to.not.equal(null);
        		expect(response.responseHeader.status).to.equal(0);
        	
        		client.commit(null, function(err, data){
        			console.log(JSON.stringify(data));
        			done();
        		});
        		
        	});
    	}) 
    	 
    	after(function(done){
    		
    		client.delete(127, function(err, response){        			
    			expect(err).to.equal(null);        			
    			expect(response).to.not.equal(null);
    			console.log(JSON.stringify(response));
        		expect(response.responseHeader).to.not.equal(null);
        		expect(response.responseHeader.status).to.equal(0);  			
    			done();
    		})
    	})
    	 
        it('search by id should return one document', function (done) {
        	
        	var client = new solrClient({baseUrl : config.solrBaseUrl, core:config.core, agent: option.agent});  
        	var query = new solrQuery();
        	client.search(query.q('id:127'), function(err, response){
        		expect(err).to.equal(null);
        		console.log(JSON.stringify(response));
        		expect(response.responseHeader).to.not.equal(null);
        		expect(response.responseHeader.status).to.equal(0); 
        		expect(response.response).to.not.equal(null); 
        		expect(response.response.numFound).to.equal(1); 
        		done();
        	});
        	       	
        });    
        
    })
    
});