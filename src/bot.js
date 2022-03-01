require("dotenv").config();
const { Client, Intents } = require('discord.js');
const ytdl = require("ytdl-core");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { joinVoiceChannel } = require('@discordjs/voice');

const queue = new Map()

const PREFIX = "+"

client.on('ready', () => {
    console.log("Logged in")
})

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    const COMMANDS = message.content.split(" ")
    let AUDIO = COMMANDS.slice(1)
    AUDIO = AUDIO.join(" ") 
    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${PREFIX}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        // skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${PREFIX}stop`)) {
        // stop(message, serverQueue);
        return;
    } else {
        message.channel.send('You need to enter a valid command!')
    }
})

const execute = async (message, serverQueue) => {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    console.log(voiceChannel)
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
       };

       queue.set(message.guild.id, queueContruct);

       queueContruct.songs.push(song);
       
    try {
        const connection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        queueContruct.connection = connection;

        play(message.guild, queueContruct.songs[0]);
    } 
    catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
    }
}

client.login(process.env.BOT_TOKEN);