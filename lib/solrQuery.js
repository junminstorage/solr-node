var querystring = require('querystring');

/**
 * Expose `SolrQuery`
 */
module.exports = exports = SolrQuery;

/*
 * @constructor
 *
 * @return {SolrQuery}
 */

function SolrQuery(){
	this.parameters = {'wt':'json'};
}

SolrQuery.prototype.add = function(pname, pval){
	this.parameters[pname] = pval;
	return this;
}

/*
 * create query string from hash map of parameter and value
 */
SolrQuery.prototype.toQueryString = function(){
	var that = this;
	return Object.keys(this.parameters).map(function(key){
		var val = that.parameters[key];
		if(typeof val === 'string')
			return key + '=' + val
		else if( Object.prototype.toString.call( val ) === '[object Array]' ) {
			return querystring.stringify({key : val})			
		}else
			return null
	}).join('&');
}

/******************
 * 
 * Admin queries
 * 
 ******************/

SolrQuery.prototype.action = function(val){
	this.add('action', val)
	return this;
}

SolrQuery.prototype.core = function(val){
	this.add('core', val)
	return this;
}

SolrQuery.prototype.indexInfo = function(val){
	this.add('indexInfo', val)
	return this;
}

/*****************************
 * 
 * Common query parameters
 * 
 ****************************/

/**
 *  Selects the query parser to be used to process the query.
 *  
 */
SolrQuery.prototype.defType = function(type){
	this.add('defType', val);
	return this;
}


/**
 *
 * @return {SolrQuery}
 * @api public
 */

SolrQuery.prototype.dismax = function(){
   this.defType('dismax');
   return this;
}

/*
 *
 * @return {SolrQuery}
 * @api public
 */

SolrQuery.prototype.edismax = function(){
   this.defType('edismax');
   return this;
}


/**
 * search results in either ascending (asc) or descending (desc) order. 
 * The parameter can be used with either numerical or alphabetical content. 
 * The directions can be entered in either all lowercase or all uppercase letters (i.e., both asc or ASC).
 *
 * @param {Object} options -
 * @return {SolrQuery}
 * 
 */

SolrQuery.prototype.sort = function(options){
   this.add('sort', querystring.stringify(options, ',' , '%20'));
   return this;
}

/**
 * debug parameter can be specified multiple times and supports the following arguments:
 * @return {SolrQuery}
 */
SolrQuery.prototype.debug = function(list){
	if(this.parameters.debug)
		this.parameters.debug.push(list)
	else 
		this.add('debug', list);	
	return this;
}

/**
 * @return {SolrQuery}
 */

SolrQuery.prototype.debugQuery = function(){
	this.add('debugQuery', 'true');
	return this;
}

/**
 * @param {Number} an offset into a query's result set and instructs Solr to begin displaying results from this offset.
 * @return {SolrQuery}
 */
SolrQuery.prototype.start = function(val){
	  this.add('start', val);
	  return this;
}

/**
 * maximum number of documents from the complete result set that Solr should return to the client at one time.
 * 
 * @param {Number} 
 * @return {SolrQuery}
 */
SolrQuery.prototype.rows = function(val){
	  this.add('rows', val);
	  return this;
}

/**
 * limits the information included in a query response to a specified list of fields.
 * 
 * @return {SolrQuery}
 */
SolrQuery.prototype.fl = function(list){
	  this.add('fl', list.join(','));
	  return this;
}


/***********************************
 * Standard query parser parameters
 **********************************/

/**
 * @param {String}  defines a query using standard query syntax
 */
SolrQuery.prototype.q = function(val){
	  this.add('q', val);
	  return this;
}

SolrQuery.prototype.qop = function(val){
	  this.add('q.op', val);
	  return this;
}

SolrQuery.prototype.qt = function(val){
	  this.add('qt', val);
	  return this;
}


/***********************************
 * DisMax query parser parameters
 **********************************/
/**
 * Query Fields: specifies the fields in the index on which to perform the query. If absent, defaults to df.
 *
 * @param {Object} options hash
 *
 * @return {SolrQuery}
 */

SolrQuery.prototype.qf = function(options){
   this.add('qf', querystring.stringify(options, '%20' , '^'));
   return this;
}

/**
 * Minimum "Should" Match: specifies a minimum number of clauses that must match in a query
 *
 * @param {String|Number} minimum - number or percent,  If q.op is effectively AND'ed, then mm=100%; if q.op is OR'ed, then mm=1
 *
 * @return {SolrQuery}
 *
 */

SolrQuery.prototype.mm = function(val){
   this.add('mm', val);
   return this;
}

/**
 * Phrase Fields: boosts the score of documents in cases where all of the terms in the q parameter appear in close proximity.
 * 
 * @param {Object} options -
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.pf = function(options){
	this.add('pf', querystring.stringify(options, '%20' , '^'));
	return this;
}

/**
 * Set the phrase slop
 *
 * @param {Number} slop - Phrase Slop: specifies the number of positions two terms can be apart in order to match the specified phrase.
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.ps = function(slop){
	this.add('ps', val);
	return this;
};

/**
 * Set the query slop allowed in a query.
 *
 * @param {Number} slop - Amount of query slop allowed by the query filter. This value should be used to affect boosting of query strings.
 *
 * @return {SQLQuery}
 */
SolrQuery.prototype.qs = function(slop){
	this.add('qs', val);
	return this;
};

/**
 * The tie parameter specifies a float value (which should be something much less than 1) to use as tiebreaker in DisMax queries.
 *
 * @param {Float} tiebreaker - 
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.tie = function(tiebreaker){
	this.add('tie', val);
	return this;
}

/** 
 * @param {Object} options -  specifies an additional, optional, query clause that will be added to the user's main query to influence the score. For example, if you wanted to add a relevancy boost for recent documents:
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.bq = function(options){
	this.add('bq', querystring.stringify(options, '%20' , '^'));
	return this;
  
}


/**
 * bf parameter specifies functions (with optional boosts) that will be used to construct FunctionQueries which will be added to the user's main query as optional clauses that will influence the score.
 * @param {String} (Boost Functions) Parameter - e.g.: `recip(rord(myfield),1,2,3)^1.5`
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.bf = function(functions){
	this.add('bf', val);
	return this;
}

/***********************************
 * Extended DisMax query parser parameters, provides additional params to DisMax query
 **********************************/

/**
 * A multivalued list of strings parsed as queries with scores multiplied by the score from the main query for all matching documents. 
 * This parameter is shorthand for wrapping the query produced by eDisMax using the BoostQParserPlugin
 *
 * @return {SQLQuery}
 */

SolrQuery.prototype.boost = function(functions){
   var self = this;
   var parameter = 'boost=' + encodeURIComponent(functions);
   this.parameters.push(parameter);
   return self;
}

