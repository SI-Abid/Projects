const Discord = require('discord.js');
const auth = require('./auth.json');
const cheerio = require('cheerio');
const request = require('request');
const bot = new Discord.Client();
const token = auth.token;
const PREFIX = ';';
const version = '1.0.1'
bot.on('ready', () =>{
	bot.user.setActivity('with NodeJS');
	console.log('Connected as '+ bot.user.tag);
	console.log('Bot is online!');
	
	bot.guilds.cache.forEach((guild) => {
		console.log(guild.name);
		guild.channels.cache.forEach((channel) => {
			console.log('  -', channel.name, channel.type, channel.id);
		});
	});
});

bot.on('message', msg=>{
	if(msg.author === bot.user){
		return
	}
	if(msg.content[0]===PREFIX) {
	const args = msg.content.slice(PREFIX.length).split(' ');
	console.log(args);
		switch(args[0])
		{
			case 'ping':
				msg.channel.send('Pong!');
			break;
			case 'echo':
				msg.channel.send(msg.content);
				msg.react("🤖");
			break;
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
			case 'play':
				let n=10;
				const arg = args[1];
				while(n>0){
					setTimeout(()=>{
						msg.channel.send(arg);
						console.log(arg);
					}, 5000);
				}
			break;
			case 'gimme':
				msg.channel.send("Look "+args[1]+"!");
				img(msg);
			break;
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
			default:
				msg.channel.send('Invalid arguments');
			break;
		}
	}
});

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
//voice channel
/* bot.on('message', async message => {
	// Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return;

    if (message.content === ';join') {
		// Only try to join the sender's voice channel if they are in one themselves
		if (message.member.voice.channel) {
			const connection = await message.member.voice.channel.join();
		} else {
			message.reply('You need to join a voice channel first!');
		}
	}
}); */

bot.login(token);