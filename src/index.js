const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config/config.json");
const configSecrets = require("./config/secrets.json");

client.once("ready", () => {
  console.debug("ready");
  client.user.setPresence({
    activity: config.activity,
  });
});

/* LOGGING */

if (config.logging && config.logchannelname) {
  client.on("messageDelete", (message) => {
    if (message.author.bot) return;

    const messageAuthor = message.author;
    const server = message.guild;

    console.log("Deleted Message!");
    console.log("Message: " + message.content);
    console.log("From: " + message.author.username);

    if (!server.channels.cache.find((e) => e.name === config.logchannelname)) {
      // Erstelle den Channel, wenn er noch nicht existiert
      server.channels.create(config.logchannelname);
    }

    const logchannel = server.channels.cache.find(
      (e) => e.name === config.logchannelname
    );

    const embed = new Discord.MessageEmbed();
    embed
      .setTitle("Gelöschte Nachricht")

      .addField("User", messageAuthor.toString())
      .addField("Channel", message.channel.toString())
      .addField("Nachricht", message.content)
      .addField("Geschrieben Um", message.createdAt)
      .addField("Bearbeitungen", message.edits)
      .setColor("#00aaaa")
      .setTitle("Gelöschte Nachricht")
      .setTimestamp();
    logchannel.send(embed);
    console.log("Done");
  });
}

client.login(configSecrets.token);
