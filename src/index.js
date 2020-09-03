const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

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

const getPrefix = (input = "") => {
  return config.prefixes.find((_prefix) => {
    if (input.toLowerCase().trim().startsWith(_prefix.toLowerCase().trim())) {
      console.log("Yess");
      return _prefix;
    } else {
      return false;
    }
  });
};

if (config.logging && config.logchannelname) {
  client.on("messageDelete", async (message) => {
    if (message.partial) {
      try {
        await message.author.fetch(true);
      } catch (e) {
        console.log(e);
        return message.channel.send(
          config.errorTagging + "HILFE, ich habe einen Fehler!"
        );
      }
    }
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

client.on("message", async (message) => {
  if (message.partial) {
    try {
      await message.author.fetch(true);
    } catch (e) {
      console.log(e);
      return message.channel.send(
        config.errorTagging + "HILFE, ich habe einen Fehler!"
      );
    }
  }

  if (
    message.content.trim().split(/ +/).join(" ").toLowerCase() ===
      "Ich habe die Regeln gelesen".toLowerCase() &&
    message.channel.name == "regeln"
  ) {
    message.delete();
    message.member.roles.add(
      message.guild.roles.cache.find((e) => e.name === "SCHÜLER"),
      "Hat die Regeln gelesen"
    );
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
      await user.fetch();
    } catch {
      reaction.message.channel.send(
        config.errorTagging + "Ein Fehler ist aufgetreten, sorry"
      );
    }

    if (reaction.message.channel.name == "regeln") {
      reaction.message.guild
        .member(user.id)
        .roles.add(
          reaction.message.guild.roles.cache.find((e) => e.name === "SCHÜLER")
        );
      console.log(reaction.remove());
    }
  }
});

client.on("message", async (message) => {
  if (message.partial) {
    try {
      await message.author.fetch(true);
    } catch (e) {
      console.log(e);
      return message.channel.send(
        config.errorTagging + "HILFE, ich habe einen Fehler!"
      );
    }
  }

  if (getPrefix(message.content)) {
    const args = message.content
      .slice(getPrefix(message.content))
      .trim()
      .split(/ +/);
    const allArgsWithCommand = args.join(" ");
    const command = args.shift().toLowerCase();
    const allArgs = args.join(" ");

    const messageAuthor = message.author;
    const messageMember = message.member;
    const memberRoles = messageMember.roles.cache.map((e) => e.name);
    const server = message.guild;
    var embed = new Discord.MessageEmbed();

    if (command.includes("nickname")) {
      message.member
        .setNickname(allArgs)
        .then((e) =>
          message.reply("My dear child, dein Nickname ist jetzt: " + e.nickname)
        );

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
      if (memberRoles.find((e) => e === "SCHÜLER") === undefined) {
        messageMember.roles
          .add(
            message.guild.roles.cache.find((e) => e.name === "SCHÜLER"),
            "Weil er will"
          )
          .then(
            () => {
              message.reply("Du bist jetzt Schüler, my dear child! :flame:");
              embed
                .setTitle("Es ist jetzt jemand Schüler")

                .addField("User", messageAuthor.toString())
                .addField("Channel", message.channel.toString())

                .setColor("#00aaaa")
                .setTimestamp();
              getLogChannel(server).send(embed);
            },
            (e) => {
              message.reply(config.errorTagging + "Es gab da einen Fehler...");
              console.log(e);
            }
          )
          .catch((e) => {
            message.reply(
              config.errorTagging + "Es gab da einen anderen Fehler..."
            );
            console.log(e);
          });
      } else {
        message.reply(
          "Du bist doch schon Schüler oder? :thinking: Ich sag immer, Schlagsahne muss geschlagen werden"
        );
      }
    } else if (allArgsWithCommand.toLowerCase().includes("hilfe")) {
      const msg = `**Hilfe**
Willy Wonka Bot Hilfe

Prefix: \`willy!\`

Befehle:
- \`willy! ich bin schüler\` - Gibt dir dir Rolle Schüler
- \`willy! Hilfe\` - Gibt dir diesen Screen


> "Ich möchte das ihr Miss Beauregarde aufs Boot rollt und sie anschließend so schnell es geht in den Saftraum bringt, okay?!"
> "In den Saftraum? Und was machen sie da mit ihr?"
> "Sie wird dann ausgedrückt, wie ein kleiner blauer Pickel`;

      message.channel.send(msg);
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
