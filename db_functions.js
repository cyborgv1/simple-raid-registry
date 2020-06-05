const config = require("./config.json");
const db = require("./db.js");
const Discord = require('discord.js');
var mysql = require('mysql');
const bot = require("./bot.js");

function add_event(sname, lname, eventdatetime, reqs, positions="4dps-2t-2h", callback){
		if (! sname || ! lname || ! eventdatetime || ! reqs) {
			short_msg1 = "To add an event, please use this format:\n";
			short_msg2 = "compactname, Long Name of Event Up to 40 characters, Event Date and time in YYYY-MM-DD-24-30 format\n";
			short_msg3 = "minimum equipment-augments (eg, 236-228), positions requested is optional, defaults to 4dps-2t-2h";
			short_msg4 = "Please no commas in event names!";
			short_msg5 = "example: !create,vetopsdf,Veteran Mode Operations Dread Fortress,2020-03-15-18-30,242-228,4dps-2t-2h";
			long_msg = short_msg1 + short_msg2 + short_msg3 + short_msg4;
			return callback(long_msg);

		};
		var sname = sname.trim();
		var lname = lname.trim();
		var eventdatetime = eventdatetime.trim();
		var reqs = reqs.trim();
		var positions = positions.trim();
		
	db.getConnection(function(err, connection) {
		if (err) {
			return callback("Database is broken");
		}
		let sql_query = `INSERT INTO eventlist (sname,lname,eventdatetime,reqs,positions) VALUES('${sname}','${lname}','${eventdatetime}','${reqs}','${positions}')`;
		// else statement does two things, adds a row to the eventlist table and creates a new table
		// eventlist_schema and add_event_query are used to insert the new event into event list

		db.query(sql_query, function (err, result, fields) {
			if (err) {
				return callback("Event has already been created!");
			} else {
				// create_event_table sets up the scheme for the specific event including data types
				var create_event_schema = `CREATE TABLE ${sname} (username CHAR(32), prefposition CHAR(4), signupdatetime DATETIME, PRIMARY KEY (username))`;
			// actually creates the table using create_event_schema
				db.query(create_event_schema, function (err, result) {
					if (err) {
						return callback("Something weird has happened, event not created, check your entry and try again");
					} else {
						return callback("Event has been created!");
					}
				});
			}	
		});
		connection.release();
	});
};

function list_all_events(callback){
// takes no parameters, just selects all from eventlist
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		var sqlString = `SELECT sname, lname, DATE_FORMAT(eventdatetime, '%M %D %Y - %h:%i%p'), reqs, positions FROM eventlist ORDER BY eventdatetime`;
		var options = {sql:sqlString, nestTables: false};
		var results = [];
		db.query(options, function (err, rows) {
			connection.release();
			for (var i = 0; i < rows.length; i++) {
				results.push(Object.values(rows[i])+ "\n\n");
			};
			if (err) {
				return callback("No scheduled events!");
			} else {
				return callback(results);
			};
		});
	});
};

function join_event(sname, username, prefposition, callback){
	if (! sname || ! prefposition) {
		var short_err_msg1 ="To join an event, please use this format: \n";
		var short_err_msg2 = "Use the abbreviated name from !events followed by preferred position(dps, t, h)\n";
		var short_err_msg3 = "!join,abbreviatedname,dps\n";
		return callback(err_msg);
	};	
	
	var sname = sname.trim();
	var prefposition = prefposition.trim();
	var username = username.trim();

	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		let sql_query = `INSERT INTO ${sname} (username, prefposition, signupdatetime) VALUES('${username}','${prefposition}',NOW())`;
		db.query(sql_query, function (err, result, fields) {
			connection.release();
			if (err) {
				return callback("You've already signed up for this event, or you have chosen the wrong event");
			} else {
				return callback("You've successfully signed up for this event!");
			}
		});
	});
};

function leave_event(sname, username, callback) {
	if (! sname) {
		var short_err_msg1 = "To leave an event, please use this format: \n";
		var short_err_msg2 = "Use the abbreviated name from !events of the event you wish to leave\n";
		var short_err_msg3 = "!join,abbreviatedname\n";
		let err_msg = short_err_msg1 + short_err_msg2 + short_err_msg3;
		return callback(err_msg);
	};
	
	var sname = sname.trim();
	var username = username.trim();
	
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		let sql_query = `DELETE FROM ${sname} WHERE username = '${username}'`;
		db.query(sql_query, function (err, result, fields) {
			connection.release();
			if (err) {
				return callback("You are not registered for this event or have the wrong event");
			} else {
				return callback("You've successfully left this event!");
			}
		});
	});
};

function delete_event(sname, callback) {
	if (! sname) {
		var short_err_msg1 = "To delete an event, please use this format: \n";
		var short_err_msg2 = "Use the abbreviated name from !events. \n";
		var short_err_msg3 = "!delete,abbreviatedname \n";
		var err_msg = short_err_msg1 + short_err_msg2 + short_err_msg3;
		return callback(err_msg);
	};
	
	var sname = sname.trim();
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		let sql_query = `DELETE FROM eventlist WHERE sname='${sname}'`;
		db.query(sql_query, function (err) {
			if (err) {
				return callback("event was not deleted, may not exist");
			} else {
				let sql_query = `DROP TABLE ${sname}`;
				db.query(sql_query, function (err) {
					if(err) {
						return callback("something weird happened, event may not be deleted");
					} else {
						return callback("Event was succefully removed");
					}						
				});
			}
			connection.release();
		});
	});
};

function reset_event(sname, callback) {
	if (! sname) {
		var short_err_msg1 = "To reset an event, please use this format: \n";
		var short_err_msg2 = "Use the abbreviated name from !events. \n";
		var short_err_msg3 = "!reset,abbreviatedname \n";
		var err_msg = short_err_msg1 + short_err_msg2 + short_err_msg3;
		return callback(err_msg);
	}

	var sname = sname.trim();
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		let sql_query = `DELETE FROM ${sname}`;
		db.query(sql_query, function (err) {
			if (err) {
				return callback("Event was not reset, may not exist.");
			} else {
				return callback("Event was successfully reset!");
			connection.release();
			};
		});
	});
};		

function list_event(sname, callback) {
	if (! sname) {
		var short_err_msg1 = "To list an event, please use this format: \n";
		var short_err_msg2 = "Use the abbreviated name from !events. \n";
		var short_err_msg3 = "!list,abbreviatedname \n";
		var err_msg = short_err_msg1 + short_err_msg2 + short_err_msg3;
		return callback(err_msg);
	}

	var sname = sname.trim();
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		var sqlString = `SELECT username, prefposition FROM ${sname} ORDER BY signupdatetime`;
		var sqlString2 = `SELECT lname FROM eventlist WHERE sname = '${sname}'`;
		//var options = {sql:sqlString, nestTables: false};
		var results = [];
		long_name = db.query(sqlString2, function (err, rows, fields) {
			if(err) {
				return callback("Event may not exist or you've found a gremlin");
			};
			
			console.log("trying to make call to eventlist");
			console.log(rows);
			console.log(Object.values(rows));
			var long_result = [];
		
		});
			
		db.query(sqlString, function (err, rows, fields) {
			connection.release();
			if(err) {
				return callback("The event may not exist, or something weird happened");
			} else if (!rows.length) {
				return callback("No one has signed up yet!");
			} else if (!rows[0].username) {
				return callback("No one has signed up yet!");
			}
			
			for (var i = 0; i < rows.length; i++) {
				results.push(Object.values(rows[i])+ "\n\n");
			};
			if (err) {
				return callback("Event is not scheduled yet!");
			} else {
				return callback(results);
			};
		});
	});
};
	
/*
function check_table_exists(sname, callback) {
	db.getConnection(function(err, connection) {
		if (err) return callback("Database seems to be broken!");
		let sql_query = `SELECT * FROM ${sname}`;
		console.log("checking for table");
		console.log(sql_query);
		db.query(sql_query, function (err, rows) {
			if (err) {
				console.log("check_table_exists false statement");
				return callback("false");
			};
		console.log("check_table_exists true statement");
		return callback("true");
		});
	});
};
*/	
		
module.exports = {add_event, list_all_events, join_event, reset_event, delete_event, list_event, leave_event};