var mysql = require('mysql');


//create connection and initialize active record
var ActiveRecord = function(config) {

	config.multipleStatements = true; //allow multiple statements
	this.connection = mysql.createConnection(config);
	this.queryParts = null;

//	this.connection.connect(); --there is an implicit connect per query
	this.resetQuery();

	return this;
}

//disconnect from database
ActiveRecord.prototype.end = function() {
	connection.end();
	//console.log("Ended connection to database");
}

ActiveRecord.prototype.buildQuery = function(type) {

	if (this.table == null) {
			return {error : "Must provide at minimum a query table"};
	}


	if (type == 'select') {
		return this.buildSelect();
	}
}

ActiveRecord.prototype.resetQuery = function () {
	this.table = null; //imp
	this.fields = '*'; //imp
	this.whereClause = null; //imp
	this.joinTable = null; //imp
	this.joinType = 'INNER'; //imp
	this.joinCondition = null; //imp
	this.orderBy = null; //imp
	this.groupBy = null; //imp
	this.having = null; //imp
	this.limit = null; //imp
	this.offset = null; //imp

	//for inserts
	this.inserts = null;

	//for updates
	this.updates = null;

}

ActiveRecord.prototype.setLimit = function(limit, offset) {

	if (typeof(offset) === 'undefined') {
			this.offset = 0;
	} else {
		this.offset = offset;
	}

	this.limit = limit;
}

//set the group by
ActiveRecord.prototype.setGroupBy = function(groups) {
	var group =null;
	var table = null;

	if (this.table == null) {
		throw new Error ("You must first specify a table");
		return false;
	}

	for (var i = 0;  i< groups.length; i++) {
		group = groups[i];
		table = typeof(group.table) === "undefined" ?
						this.table : group.table;

		if (i == 0) {
			this.groupBy = this.connection.escapeId(table + "." + group.field);
		} else {
			this.groupBy += ', ' +this.connection.escapeId(table + "." + group.field);
		}

	}

	//got this far, must be good
	return true;

}

//set the order by
ActiveRecord.prototype.setOrderBy = function(orders) {
	var order =null;
	var table = null;

	if (this.table == null) {
		throw new Error ("You must first specify a table");
		return false;
	}

	for (var i = 0;  i< orders.length; i++) {
		order = orders[i];
		table = typeof(order.table) === "undefined" ?
						this.table : order.table;
		ascdesc = typeof(order.ascdesc) === "undefined" ?
						'ASC' : order.ascdesc;
		if (i == 0) {
			this.orderBy = this.connection.escapeId(table) + "." +
											this.connection.escapeId(order.field) + " " + ascdesc;
		} else {
			this.orderBy += ', ' + this.connection.escapeId(table) + "." +
										this.connection.escapeId(order.field) + " " + ascdesc;
		}

	}

	//got this far, must be good
	return true;

}
/**
 * ActiveRecord.setWhere
 * Set where clause based on array of conditions.
 *
 * Conditions should be in format of {key, condition(optional), value, table(optional)}
 * Valid conditions are =, >, <, >=, <=, <>, IN, NOT IN
 *
 */
ActiveRecord.prototype.setWhere = function(conditions, and) {
	var operator = null;
	var condition = null;
	var table = null;
	var value = null;

	if (this.table == null) {
		throw new Error ("You must first specify a table");
		return false;
	}
	if (typeof(and) === "undefined") { and = true; } //default to anding

	for (var i =0; i < conditions.length; i++) {
		condition = conditions[i];
		operator = typeof(condition.operator) === "undefined" ?
								'=' : condition.operator;
		table = typeof(condition.table) === "undefined" ?
						this.table : condition.table;
		value = typeof(condition.value) === "number" ?
						condition.value : this.connection.escape(condition.value);
		if (i == 0) {
			this.whereClause = this.connection.escapeId(table + "." + condition.key) +
			 					" " + operator + " " + value;
		} else {
			if (and)
				this.whereClause += " AND ";
			else
				this.whereClause += " OR ";

			this.whereClause += this.connection.escapeId(table + "." + condition.key) +
											" " + operator + " " + value;
		}
	}
}

ActiveRecord.prototype.getWhereClause = function() {
	return this.whereClause;
}
//TODO: Add where or/and functions

/**
* ActiveRecord.setJoin
* Set where clause based on array of kv pairs.
* KV pairs probably in format of table1 field, table2 field
* No worries we'll add the approriate table names
* For debugging surround with try catch.
* Conditions should be in format of {leftTableField : rightTableField}
*/
ActiveRecord.prototype.setJoin = function(table, conditions, type) {
	var cond = null;

	if (table == null) {
		throw new Error ("You must specify a join table");
		return false;
	}

	if (this.table == null) {
		throw new Error("Please specify a left table first");
		return false;
	}

	this.joinTable = table;
	if (typeof(type) !== "undefined") {
		this.joinType = type;
	}

	for (var i =0; i < conditions.length; i++) {
		cond= conditions[i];

		if (i == 0) {
			this.joinCondition = this.connection.escapeId(this.table + "." + cond.key) +
						" = " + this.connection.escapeId(table + "." + cond.value);
		} else {
			this.joinCondition += " AND ";
			this.joinCondition += this.connection.escapeId(this.table + "."  + cond.key) +
			 " = " + this.connection.escapeId(table + "." +cond.value);
		}
	}

	//we got here assume success
	return true;

	//TODO: Make it so users of api can't send invalid join types.
	//VALID TYPES: INNER, OUTER, LEFT, UNION

}

/**
* ActiveRecord.setHaving
* Set where clause based on array of kv pairs.
* KV pairs probably in format of table1 field, table2 field
* No worries we'll add the approriate table names
* For debugging surround with try catch.
* Conditions should be in format of {leftTableField : rightTableField}
*/
ActiveRecord.prototype.setHaving = function(conditions) {
	var operator = null;
	var condition = null;
	var table = null;
	var value = null;

	if (this.table == null) {
		throw new Error ("You must first specify a table");
		return false;
	}
	if (typeof(and) === "undefined") { and = true; } //default to anding

	for (var i =0; i < conditions.length; i++) {
		condition = conditions[i];
		operator = typeof(condition.operator) === "undefined" ?
								'=' : condition.operator;
		table = typeof(condition.table) === "undefined" ?
						this.table : condition.table;
		value = typeof(condition.value) === "number" ?
						condition.value : this.connection.escape(condition.value);
		if (i == 0) {
			this.having = this.connection.escapeId(table + "." + condition.key) +
								" " + operator + " " + value;
		} else {
			if (and)
				this.having += " AND ";
			else
				this.having += " OR ";

			this.having += this.connection.escapeId(table + "." + condition.key) +
											" " + condition.condition + " " + value;
		}
	}
}


//for debugging purposes
ActiveRecord.prototype.getJoinConditions = function() {
	var join = this.joinType + " JOIN " + this.joinTable + " ON " +
							this.joinCondition;
	return join;
}


ActiveRecord.prototype.setTable = function(table) {
	this.table = table;
}

ActiveRecord.prototype.getTable = function() {
	return this.table;
}

//select fields
//NOTE: Possible sql injection vector in agg variable since we can't escape.
ActiveRecord.prototype.setFields = function(fields) {
	var field = null;
	var table = null;
	var as = null;
	var fv = null;

	if (this.table == null) {
		throw new Error ("You must first specify a table");
		return false;
	}


	for (var i = 0; i < fields.length; i++) {
		field = fields[i];
	//	console.log(field);
		table = typeof(field.table) === "undefined" ?
						this.table : field.table;
		as = typeof(field.as) === "undefined" ? '' : ' AS ' +
				this.connection.escapeId(field.as);

	//TODO: add checks for field.agg being on of the approved aggregate functions...
		fv = typeof(field.field) === "undefined" ? field.agg :
							this.connection.escapeId(table + "." + field.field);

		if (i == 0) {
			this.fields = fv + as;
		} else {
			this.fields += ', ' + fv + as;
		}
	}

}

ActiveRecord.prototype.getFields = function() {
	return this.fields;
}

/**
 * Private helper: Build a valid SQL Statement for selecting data
 */
ActiveRecord.prototype.buildSelect = function() {
	//table has already been verified, let's start building the query
	var q = "SELECT " + this.fields + " FROM " +
					this.connection.escapeId(this.table);
	if (this.joinTable != null && this.joinCondition != null) {
			q += " " + this.joinType + " JOIN " +
				 this.connection.escapeId(this.joinTable) + " ON " + this.joinCondition;
	}

	if (this.whereClause != null) {
		q += " WHERE " + this.whereClause;
	}

	if (this.groupBy != null) {
		q += " GROUP BY " + this.groupBy;
		if (this.having != null) {
			q += " HAVING " + this.having;
		}
	}

	if (this.orderBy != null) {
		q += " ORDER BY " + this.orderBy;
	}

	if (this.limit != null) {
		q += " LIMIT " + this.limit;
		if (this.offset != null) {
			q += " OFFSET " + this.offset;
		}
	}
	q += ';';
	return q;
}

ActiveRecord.prototype.get = function(table, cb) {
	if (table == null) {
		if (this.table == null) {
			return {error : "Must provide at minimum a query table"};
		}
	} else {
		this.table = table;
	}

	var q = this.buildQuery("select");

	var res = null;
	this.connection.query(q,function(err, rows, tableFields) {
		if (err) {
			res = {error: err, queryExecuted: q}; //return error messages to the user
		} else {

			var fields = [];
			tableFields.forEach(function(field) {
				fields.push({name: field.name, table: field.table, db: field.db});
			});

			res = {	rows: rows,
							fields: fields,
							numResults : rows.length,
							queryExecuted: q
						};
		}

		cb(res);
	});

	this.resetQuery();

}

//insert function
ActiveRecord.prototype.insert = function(table, records, cb) {
	if (table == null) {
		if (this.table == null) {
			if (typeof(cb) === 'function') {
				cb({error : "Must provide at minimum a query table"});
				return;
			} else {
				return false;
			}

		}
	} else {
		this.table = table;
	}

	var q = "";
	var f = null;
	var rec = null;
	var val = null;
	var res = null;

	if (records.length == 0) {
		if (typeof(cb) === 'function') {
			cb({success: false, error : 'No records provided in query'});
			return false;
		} else {
			return false;
		}
	}
	//builds insert queries...
	for (var i = 0; i < records.length; i++) {
		q += "INSERT INTO " + this.connection.escapeId(this.table) + " SET ";
		rec = records[i];

		if (Object.keys(rec).length === 0) {
			if (typeof(cb) === 'function') {
				cb({success : false, error: 'No fields supplied for record'});
				return false;
			} else {
				return false;
			}
		}

		var x = 0;
		for (var field in rec) {
			val = typeof(rec[field]) === 'number' ? rec[field] :
						this.connection.escape(rec[field]);

			if (x == 0) {
				q += this.connection.escapeId(field) + " = " + val
			} else {
				q += ", " + this.connection.escapeId(field) + " = " + val
			}

			if (x == Object.keys(rec).length-1) {
				q += ';';
			}
			x++;
		}
	}

	//query ready time to execute...
	this.connection.query(q,function(err, results) {
		if (err) {
			if (typeof(cb) === 'function') {
				res = {error: err, queryExecuted: q};//return error messages to the user
				cb(res);
			} else {
				return false;
			}
		} else {
			if (typeof(cb) === 'function') {
				res = {	success : true,
								affectedRows : results.changedRows,
								queryExecuted: q
							};
				cb(res);
			} else {
				return true;
			}
		}
	});

	this.resetQuery();
}

//update function
ActiveRecord.prototype.update = function(table, records, cb) {
	if (table == null) {
		if (this.table == null) {
			if (typeof(cb) === 'function') {
				cb({error : "Must provide at minimum a query table"});
				return false;
			} else {
				return false;
			}

		}
	} else {
		this.table = table;
	}

	var q = "";
	var f = null;
	var rec = null;
	var val = null;
	var res = null;

	if (records.length == 0) {
		if (typeof(cb) === 'function') {
			cb({success: false, error : 'No records provided in query'});
			return false;
		} else {
			return false;
		}

	}
	//builds insert queries...
	for (var i = 0; i < records.length; i++) {
		q += "UPDATE " + this.connection.escapeId(this.table) + " SET ";
		rec = records[i];

		if (Object.keys(rec).length === 0) {
			if (typeof(cb) === 'function') {
				cb({success : false, error: 'No fields supplied for record'});
				return false;
			} else {
				return false;
			}
		}

		var x = 0;
		for (var field in rec) {
			val = typeof(rec[field]) === 'number' ? rec[field] :
						this.connection.escape(rec[field]);

			if (x == 0) {
				q += this.connection.escapeId(field) + " = " + val
			} else {
				q += ", " + this.connection.escapeId(field) + " = " + val
			}

			if (x == Object.keys(rec).length-1) {
				if (this.whereClause != null) {
					q += " WHERE " + this.whereClause;
				}
				q += ';';
			}
			x++;
		}
	}

	//query ready time to execute...
	this.connection.query(q,function(err, results) {
		if (err) {
			if (typeof(cb) === 'function') {
				res = {error: err, queryExecuted: q};//return error messages to the user
				cb(res);
			} else {
				return false;
			}
		} else {
			if (typeof(cb) === 'function') {
				res = {	success : true,
								affectedRows : results.changedRows,
								queryExecuted: q
							};
				cb(res);
			} else {
				return true;
			}
		}
	});

	this.resetQuery();
}

//delete function
ActiveRecord.prototype.delete = function(table, cb) {
	if (table == null) {
		if (this.table == null) {
			if (typeof(cb) === 'function') {
				cb({error : "Must provide at minimum a query table"});
				return false;
			} else {
				return false;
			}
		}
	} else {
		this.table = table;
	}

	var q = "DELETE FROM " + this.connection.escapeId(this.table);

	if (this.whereClause != null) {
		q += " WHERE " + this.whereClause;
	}

	q += ";";
	//query ready time to execute...
	this.connection.query(q,function(err, results) {
		if (err) {
			if (typeof(cb) === 'function') {
				res = {error: err, queryExecuted: q};//return error messages to the user
				cb(res);
			} else {
				return false;
			}
		} else {
			if (typeof(cb) === 'function') {
				res = {	success : true,
								affectedRows : results.affectedRows,
								queryExecuted: q
							};
				cb(res);
			} else {
				return true;
			}
		}
	});

	this.resetQuery();
}


module.exports = ActiveRecord;
