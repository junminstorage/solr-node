var http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy-agent'),
    fs = require('fs'),
    request = require('request'),
    path = require('path');

module.exports = exports = SolrClient;

/**
 * @todo - promisify the http request
 * @todo - better way to parse the baseUrl
 */

/*
 * baseUrl format: protocol://hostname:port/context, protocol is optional, port and context are required
 * core: optional, if not specified, then all subsequential call needs to provide it
 * 
 */
function SolrClient(options){
	if(!options)
		return;
	
	this.baseUrl = options.baseUrl || 'http://localhost:8983/solr';

	this.core = options.core || '';
	this.agent = options.agent;
	this.autoCommit = options.commit || false;
	this.authorization = options.authorization;
	
	this.host = getHost(this.baseUrl);
	this.port = getPort(this.baseUrl);
	this.context = getContext(this.baseUrl);
	this.protocol = getProtocol(this.baseUrl);
	
	console.log(this.host+ '-' + this.port + '-' + this.protocol + '-' + this.context);
}

// Default paths of all request handlers
SolrClient.UPDATE_HANDLER = 'update';
SolrClient.EXTRACT_HANDLER = 'update/extract';
SolrClient.SELECT_HANDLER = 'select';
SolrClient.ADMIN_CORE_HANDLER = 'admin/cores';
SolrClient.ADMIN_INFO_HANDLER = 'admin/info/system';

SolrClient.REAL_TIME_GET_HANDLER = 'get';
SolrClient.SPELL_HANDLER = 'spell';

//map file extension to mime type
SolrClient.mimeMap = {
"xml" : "application/xml",
"csv" : "text/csv",
"json" : "application/json",
"pdf" : "application/pdf",
"rtf" : "text/rtf",
"html" : "text/html",
"htm" : "text/html",
"doc" : "application/msword",
"docx" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
"ppt" : "application/vnd.ms-powerpoint",
"pptx" : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
"xls" : "application/vnd.ms-excel",
"xlsx" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
"odt" : "application/vnd.oasis.opendocument.text",
"ott" : "application/vnd.oasis.opendocument.text",
"odp": "application/vnd.oasis.opendocument.presentation",
"otp": "application/vnd.oasis.opendocument.presentation",
"ods": "application/vnd.oasis.opendocument.spreadsheet",
"ots": "application/vnd.oasis.opendocument.spreadsheet",
"txt": "text/plain",
"log": "text/plain"
}

SolrClient.handlerMap = {'application/xml':SolrClient.UPDATE_HANDLER, 'text/csv':SolrClient.UPDATE_HANDLER, 'application/json':SolrClient.UPDATE_HANDLER};

/*
 * context path is after the last '/', usually 'solr'
 */
function getContext(baseUrl){
	var start = baseUrl.lastIndexOf('/');
	return baseUrl.substr(start+1);
}

/*
 * protocol is either https or http and default to http
 */
function getProtocol(baseUrl){
	   return baseUrl.indexOf('https')>-1 ? https : http;
}

/*
 * host is between protocol and :
 */
function getHost(baseUrl){
	var start = baseUrl.indexOf('//');
	start = start>=0?start+2:0
	var end = baseUrl.lastIndexOf(':');
	return baseUrl.substr(start, end - start);
}

/*
 * port is between : and last / in the baseUrl
 */
function getPort(baseUrl){
	var start = baseUrl.lastIndexOf(':')+1;
	var end = baseUrl.lastIndexOf('/');
	return baseUrl.substr(start, end - start);
}


/*
 * Admin Core API section
 * 
 * @param {SolrQuery} query - SolrQuery object 
 */

SolrClient.prototype.adminStatus = function(query, callback){
	return this.adminAction('STATUS', query, callback);
}

SolrClient.prototype.adminCreate = function(query, callback){
	return this.adminAction('CREATE', query, callback);
}

SolrClient.prototype.adminReload = function(query, callback){
	return this.adminAction('RELOAD', query, callback);
}

SolrClient.prototype.adminAction = function(action, query, callback){
	var path = [this.context, SolrClient.ADMIN_CORE_HANDLER].join('/');
	var query = ['action='+action, query?query.toQueryString():'wt=json'].join('&');
	return this.jsonGet(path, query, callback);
}

/**
 * Admin system info including JVM stats
 */
SolrClient.prototype.adminSysInfo = function(action, callback){
	var path = [this.context, SolrClient.ADMIN_INFO_HANDLER].join('/');
	var query = ['wt=json'].join('&');
	return this.jsonGet(path, query, callback);
}


/**
 * Search documents
 *
 * @param {SolrQuery} query
 * @param {Function} callback(err,obj) - a callback
 */

SolrClient.prototype.search = function(query,callback){
	var path = [this.context, this.core, SolrClient.SELECT_HANDLER].join('/');
	var query = [query?query.toQueryString():'wt=json'].join('&');
	return this.jsonGet(path, query, callback);
}

/*
 * Index update/extract API section
 */

/**
 * Add a list of docs
 *
 * @param {Array} doc - a list of json documents to be added
 * @param {Object} [options] -
 * @param {Function} callback(err,obj) - 
 *
 */

SolrClient.prototype.add = function(docs,options,callback){
   if(typeof(options) === 'function'){
      callback = options;
      options = {};
   }
   var path = [this.context, this.core, SolrClient.UPDATE_HANDLER].join('/');
   return this.jsonPost(path, docs, callback);
}

/**
 * Delete a doc or list of documents by id
 *
 * @param {Array} ids - list of the document ids
 * @param {Object} [options] -
 * @param {Function} callback(err,obj) - 
 */

SolrClient.prototype.delete = function(ids,options,callback){
   if(typeof(options) === 'function'){
      callback = options;
      options = {};
   }
   var path = [this.context, this.core, SolrClient.UPDATE_HANDLER].join('/');
   ids = Array.isArray(ids) ? ids : [ids];
   var data = {
      'delete' : ids
   };
   return this.jsonPost(path, data, callback);
}


SolrClient.prototype.commit = function (options, callback){
	var path = [this.context, this.core, SolrClient.UPDATE_HANDLER].join('/');
	var data = { commit : options || {} };
	return this.jsonPost(path, data, callback);
}


SolrClient.prototype.jsonPost = function(path, data, callback){
   console.log(path + '-' + JSON.stringify(data));
   callback = callback || function(){};
   
   var headers = {
      'content-type' : 'application/json; charset=utf-8',
      'content-length':  Buffer.byteLength(JSON.stringify(data)),
      'accept' : 'application/json; charset=utf-8'
   };
   
   if(this.authorization){
      headers['authorization'] = this.authorization;
   }
   var options = {
      host : this.host,
      port : this.port,
      method : 'POST',
      headers : headers,
      path : path
   };
   
   if(this.agent !== undefined){
      options.agent = this.agent;
   }

   var cb =  function(res){
	   var body = '';
	   res.setEncoding('utf-8');
	   res.on('data', function(d){ body +=d;});
	   res.on('end', function(){
		   var parsed = JSON.parse(body);
		   if(res.statusCode == 200)
			   callback(null, parsed);    
		   else
			   callback(new Error('statusCode:' + res.statusCode + ' with response:' + body), null);
	   });
	   
   };
   
   var request = this.protocol.request(options, cb);
   
   request.on('error',function (err){
       callback(err,null);
   });

   request.write(JSON.stringify(data));
   request.end();

   return request;
};


SolrClient.prototype.jsonGet = function(path, query, callback){
	  console.log(path + '?' + query);
	  callback = callback || function(){};
	
	   var headers = {
	      'accept' : 'application/json; charset=utf-8'
	   };
	   
	   if(this.authorization){
	      headers['authorization'] = this.authorization;
	   }
	   var options = {
	      host : this.host,
	      port : this.port,
	      method : 'GET',
	      headers : headers,
	      path : path + '?' + query
	   };
	   
	   if(this.agent !== undefined){
	      options.agent = this.agent;
	   }

	   var cb =  function(res){
		   var body = '';
		   res.setEncoding('utf-8');
		   res.on('data', function(d){ body +=d;});
		   res.on('end', function(){
			   var parsed = JSON.parse(body);
			   if(res.statusCode == 200)
				   callback(null, parsed);    
			   else
				   callback(new Error('statusCode:' + res.statusCode + ' with response' + body), null);
		   });
		   
	   };
	   
	   var request = this.protocol.get(options, cb);
	   
	   request.on('error',function (err){
	       callback(err,null);
	   });

	   return request;
};


/**
 * streaming file to solr update or extrac handler
 */
SolrClient.prototype.postFile = function(fileName, cb){
	
	var contentType = SolrClient.mimeMap[guessFileType(fileName)];

	var handler = SolrClient.handlerMap[contentType]?handlerMap[contentType]:SolrClient.EXTRACT_HANDLER;

	var stats = fs.statSync(fileName);
	var fileSizeInBytes = stats["size"];

	console.log('file length: ' +fileSizeInBytes);

	var options = {
			  url: this.baseUrl + '/' + this.core + handler, 
			  agent: this.agent,
			  headers: {
				  'Content-Type': contentType,
		          'Content-Length': fileSizeInBytes
			  }
	};

	console.trace(options);

	fs.createReadStream(fileName).pipe(request.post(options, function(err, response, body){
		console.log(response);		
		if(cb) 
			cb(err, response, body);
	}));
}

/**
 *
 * @param {String} dir - full path or relative path to a directory containing files or sub-directory to scan and post file to Solr indexer
 * @param {Function} done - a callback function
 * @api public
 */
SolrClient.prototype.postDir = function(dir, done) {
	 console.log("post directory: " + dir);
	  var results = [];
	  var posted = 0; 
	  fs.readdir(dir, function(err, list) {
	    if (err) { console.log(err); return done(err)};
	    var pending = list.length;
	    
	    if (!pending) return done(null, posted, results);
	    list.forEach(function(file) {
	      file = path.resolve(dir, file);
	      
	      fs.stat(file, function(err, stat) {
	        if (stat && stat.isDirectory()) {
	          this.postDir(file, function(err, posted, res) {
	            results = results.concat(res);
	            posted++;
	            if (!--pending) done(null, posted, results);
	          });
	        } else {
	          this.postFile(file);
	          results.push(file);
	          posted++;
	          if (!--pending) done(null, posted, results);
	        }
	      });
	    });
	  });
}

/**
 * return file type or suffix based on fileName
 * 
 * @param fileName
 * @returns type
 * 
 * @api private
 */
function guessFileType(fileName) {
	return fileName.substr(fileName.lastIndexOf('.')+1);
}
