# mysql-active-record

[![NPM Version][npm-image]][npm-url]
[![NPM = Version][node-version-image]][node-version-url]



## Introduction


This is an abstraction framework that leverages the [node-mysql] module for node.js. It was inspired by CodeIgniter's [ActiveRecord] class for building SQL queries - former PHP developers will likely recognize this.

Completely written in JavaScript, does not require compiling, and is 100% MIT licensed.

Here is an example on how to use it:

[node-mysql]:https://github.com/felixge/node-mysql/

[ActiveRecord]:https://ellislab.com/codeigniter/user-guide/database/active_record.html#select

### Installation

```sh
$ npm install mysql-active-record
```

### Usage

```js

var MysqlActiveRecord = require('mysql-active-record');

var config = {
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'database_name'
}

//confirm connection
var activeRecord = new MysqlActiveRecord(config);

//will produce SELECT * FROM table1;
activeRecord.get('table1', function(results) {
  if (!results.error) {
    if (results.numResults > 0) {
        console.log(results.rows); // actual records
        console.log(results.fields); //fields returned
        console.log(results.numResults); //number of results
        console.log(results.queryExecuted); //sql statement executed
    } else {
        console.log(results.queryExecuted);
    }
  } else {
        console.log(results.error); //any errors returned
        console.log(results.queryExecuted);
  }

});

```
Note:

* config options are the same as the ones passed into the node-mysql module
* connection is implicitly created when a query is run and ended immediately after.

## CRUD Operations


### SELECT Statements

  * FROM
  * WHERE
  * ORDER BY
  * GROUP BY
  * HAVING
  * JOIN
  * LIMIT


### INSERT Statements

### UPDATE Statements

### DELETE Statements

## Todo

* Update this documentation
* More testing + adding unit tests
* Implement create functionality for database tables
* Implement alter functionality for database tables


## Thanks

Huge thanks goes out to [Felix Geisendörfer] ([felixge]) for doing all of the heavy lifting of getting the node-mysql connector together.

[Felix Geisendörfer]: http://felixge.de/
[felixge]: https://github.com/felixge/node-mysql/graphs/contributors

## Contributors

Fork this module on github and send a pull requests if you've got some great updates.

For any questions / issues with this module please open an issue.



[npm-image]: http://img.shields.io/badge/npm-v1.0.0-green.svg
[npm-url]: https://npmjs.org/package/mysql
[node-version-image]: https://img.shields.io/badge/node.js-%3E%3D_0.6-brightgreen.svg?style=flat
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/felixge/node-mysql.svg?style=flat

[downloads-image]: https://img.shields.io/npm/dm/mysql.svg?style=flat
[downloads-url]: https://npmjs.org/package/mysql
