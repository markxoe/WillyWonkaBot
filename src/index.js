const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config/config.json");
var token = "";
try {
  token = require("./config/secrets.json").token;
} catch (e) {
  token = process.env.BOT_TOKEN;
}

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
    getLogChannel(server).send(embed);
    console.log("Done");
  });
}

client.on("message", (message) => {
  if (message.content.startsWith(config.prefix)) {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const allArgsWithCommand = args.join(" ");
    const command = args.shift().toLowerCase();
    const allArgs = args.join(" ");

    const messageAuthor = message.author;
    const server = message.guild;
    var embed = new Discord.MessageEmbed();

    if (command.includes("nickname")) {
      message.member
        .setNickname(allArgs)
        .then((e) => message.reply("Dein Nickname ist jetzt: " + e.nickname));

      embed
        .setTitle("Geänderter NickName")

        .addField("User", messageAuthor.toString())
        .addField("Channel", message.channel.toString())
        .addField("Neuer Nickname", allArgs)
        .setColor("#00aaaa")
        .setTimestamp();

      getLogChannel(server).send(embed);
      console.log(
        "Neuer Nickname (" + allArgs + ") für " + messageAuthor.username
      );
    } else if (allArgsWithCommand.toLowerCase().includes("ich bin schüler")) {
      if (
        message.member.roles.cache.find((e) => e.name === "SCHÜLER") ===
        undefined
      ) {
        message.member.roles
          .add(
            message.guild.roles.cache.find((e) => e.name === "SCHÜLER"),
            "Weil er will"
          )
          .then(
            () => {
              message.reply("Du bist jetzt Schüler!");
              embed
                .setTitle("Es ist jetzt jemand Schüler")

                .addField("User", messageAuthor.toString())
                .addField("Channel", message.channel.toString())

                .setColor("#00aaaa")
                .setTimestamp();
              getLogChannel(server).send(embed);
            },
            (e) => {
              message.reply("Es gab da einen Fehler...");
              console.log(e);
            }
          )
          .catch((e) => {
            message.reply("Es gab da einen anderen Fehler...");
            console.log(e);
          });
      } else {
        message.reply("Du bist doch schon Schüler oder? :thinking:");
      }
    }
  }
});

const getLogChannel = (server) => {
  if (!server.channels.cache.find((e) => e.name === config.logchannelname)) {
    // Erstelle den Channel, wenn er noch nicht existiert
    server.channels.create(config.logchannelname);
  }

  const logchannel = server.channels.cache.find(
    (e) => e.name === config.logchannelname
  );
  return logchannel;
};

client.login(token);
