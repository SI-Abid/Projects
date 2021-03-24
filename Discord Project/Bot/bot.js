const ytdl = require('ytdl-core');
const compiler = require('./apicall')
const Discord = require('discord.js');
const auth = require('./auth.json');
// const cheerio = require('cheerio');
const request = require('request');
const bot = new Discord.Client();
const token = auth.token;
const PREFIX = ';';
const version = '1.0.1'
const queue = new Map();

bot.once('ready', () => {
	bot.user.setActivity('with NodeJS');
	console.log('Connected as ' + bot.user.tag);
	console.log('Bot is online!');

	// bot.guilds.cache.forEach((guild) => {
	// 	console.log(guild.name);
	// 	guild.channels.cache.forEach((channel) => {
	// 		console.log('  -', channel.name, channel.type, channel.id);
	// 	});
	// });
	// console.log(runner);
});

bot.once('reconnecting', () => {
	console.log('Reconnecting!');
});

bot.once('disconnect', () => {
	console.log('Disconnect!');
});

bot.on('message', msg => {
	if (msg.author === bot.user) {
		return
	}
	if (msg.content[0] === PREFIX) {
		// console.log(msg.member.voice.channel);
		const meseg = msg.content.slice(PREFIX.length);
		const args = meseg.split(' ');
		console.log(args);
		switch (args[0]) {
			case 'ping':
				msg.channel.send('Pong!');
				break;
			case 'echo':
				msg.channel.send(msg.content.slice(5));
				msg.react("🤖");
				break;
				/*
-----------------------------NEED TO BE UPDATED----------------------------------
			case 'clear':		
				if(!args[1]) return msg.reply('Invalid arguments');
				msg.channel.bulkDelete(args[1]);
			break;
			case 'avatar':
				const person = msg.mentions.users.first();
				if(person){
					const avatar = new Discord.MessageEmbed()
					.addField('Player Name',person.username)
					.setImage(person.displayAvatarURL());
					msg.channel.send(avatar);
				}else{
					msg.reply("You have to mention the username");
				}	
			break;
			*/
			// case 'play':
			// 	let n = (parseInt(args[2]) || 5);
			// 	const arg = args[1];
			// 	while (n > 0) {
			// 		setTimeout(() => {
			// 			msg.channel.send(arg);
			// 			console.log(arg);
			// 		}, 5000);
			// 		n--;
			// 	}
			// 	break;

			case 'run':
				const argv = meseg.slice(4).split("```");
				// console.log(argv);
				const lang = argv[0].replace('\n', '').replace(' ', '');
				// console.log(lang);
				const code = argv[1];
				const input = argv[3];

				compiler.run(lang, code, input, function (retr) {
					msg.channel.send('```' + retr.output + '```');
				});
				// console.log(g);
				break;
				// case 'join':
				// 	const connection = await msg.member.voice.channel.join();
				/*
-----------------------------NEED TO BE UPDATED----------------------------------
			// case 'gimme':
			// 	msg.channel.send("Look "+args[1]+"!");
			// 	img(msg);
			case 'info':
				const user = msg.mentions.users.first() || msg.author;
				const embed = new Discord.MessageEmbed()
				.setTitle('User Information')
				.setColor(0xaa00ff)
				.setThumbnail(user.displayAvatarURL())
				.setTimestamp()
				.addField('Player Name', user.username)
				.addField('Current server',msg.guild.name)
				.addField('Version', version);
				msg.channel.send(embed);
			break;
			*/
				// default:
				// 	msg.channel.send('Invalid arguments');
				// break;
		}
	}
});
/*
function img(msg){
    let args = msg.content.slice(PREFIX.length).split(" ");
    var search  = args[1];
    // console.log(args, search);
    var options = {
        url: "https://results.dogpile.com/serp?qc=images&q=" + search,
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };
 
    request(options, function(error, response, responseBody) {
        if (error) {
			console.log("Error");
            return;
        }
 
 
        $ = cheerio.load(responseBody);
 
 
        var links = $(".image a.link");
 
        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
       
        // console.log(urls);
		// console.log(links);
        if (!urls.length) {
			console.log('urls=NULL');
            return;
        }
 
        // Send result
		let imagelink = urls[Math.floor(Math.random() * urls.length)];
        // console.log(imagelink);
		// return imagelink;
		msg.channel.send(imagelink);
    });
}
//voice channel*/

bot.on('message', async message => {

	if (message.author.bot) return;
	if (!message.content.startsWith(PREFIX)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${PREFIX}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${PREFIX}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${PREFIX}stop`)) {
		stop(message, serverQueue);
		return;
	} else {
		message.channel.send("You need to enter a valid command!");
	}

});

async function execute(message, serverQueue) {
	const args = message.content.split(" ");

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel)
		return message.channel.send("You need to be in a voice channel to play music!");

	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send("I need the permissions to join and speak in your voice channel!");
	}
	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

function skip(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);
	if (!serverQueue)
		return message.channel.send("There is no song that I could skip!");
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel)
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);

	if (!serverQueue)
		return message.channel.send("There is no song that I could stop!");

	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on("finish", () => {
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on("error", error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

bot.login(token);