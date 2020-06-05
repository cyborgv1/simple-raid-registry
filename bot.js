const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
//const db = require("./db.js");
const db_functions = require("./db_functions.js");


client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
});

client.on("message", (message) => {
	if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/,/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case "help" :
            message.author.send("Available commands");
            message.author.send("!events, list all events");
            message.author.send("!list, list single event");
            message.author.send("!join, joins an event");
            message.author.send("!leave, leaves an event");
            message.author.send("!create, creates an event");
            message.author.send("!delete, deletes an event");
            message.author.send("!reset, deletes all the registered from an event");
            break;
            
        case "events" :
			db_functions.list_all_events(function(results){
				message.author.send(`${results}`);
			});
			break;

        case "list" :
			db_functions.list_event(args[0], function(results){
				message.author.send(`${results}`);
			});
            break;

        case "join" :
			var user_name = message.member.user.username;
			db_functions.join_event(args[0], user_name, args[1], function(results){
				message.author.send(`${results}`);
			});
			break;

        case "leave" :
			var user_name = message.member.user.username;
			db_functions.leave_event(args[0], user_name, function(results){
				message.author.send(`${results}`);
			});
            break;

        case "add" :
            message.channel.send("funtion to add other user admin only!");
            break;

        case "kick" :
            message.channel.send("funtion to kick user admin only!");
            break;

        case "create" :
			db_functions.add_event(args[0], args[1], args[2], args[3], args[4], function(success){
				message.author.send(`${success}`);
			});
            break;

        case "delete" :
            db_functions.delete_event(args[0], function(success){
				message.author.send(`${success}`);
			});
            break;

        case "reset" :
            db_functions.reset_event(args[0], function(success){
				message.author.send(`${success}`);
			});
            break;
    }
});

client.login(config.token);
