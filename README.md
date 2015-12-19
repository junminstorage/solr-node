# solr-node

[![NPM](https://nodei.co/npm/solr-node.png?downloads=true&stars=true)](https://nodei.co/npm/solrnode/)

solr-node is a pure Javascript client interface that makes it easy for Node.js applications to talk to Solr. It ports SolrJ and command-line java tools including SimplePostTool and SolrCLI from Apache Solr project into Node.js,  It also supports Solr Cloud APIs. 

solr-node has been tested to work with Apache Solr version 5.0 and after.

##Install

```
npm install SolrNode
```

##Features

- update including add, delete, update, commit.  
- query including search(select) using Lucene standard query and DisMax query
- POST files including xml, json, html, PDF, cvs to Solr
- POST directory of files to Solr 
- Crawl web and post htmls to Solr
- Solr Cloud cluster state, collection and configuration queries via ZooKeeper
- Solr cloud cluster, collection and configuration monitoring via ZooKeeper watcher
- Solr cloud system information including JVM and server information

##Test

```
npm test
```
Some of tests are run against a solr cloud, which you can simply start by "./bin/solr -e cloud -noprompt". 
Some zookeeper tests are isolated by a zookeeper mock-up client. 