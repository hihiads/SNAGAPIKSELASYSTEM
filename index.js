// Discord bot using discord.js v13.0.0
const { Client, Intents, MessageEmbed } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_PRESENCES
  ]
});

let invites = new Map();

// Set bot status
client.once('ready', async () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  client.user.setPresence({ activities: [{ name: 'SD Bot', type: 'WATCHING' }], status: 'dnd' });

  // Fetch invites
  client.guilds.cache.forEach(async guild => {
    const guildInvites = await guild.invites.fetch();
    invites.set(guild.id, guildInvites);
  });
});

// Verify system
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel.name !== 'verify') return;
  if (message.content.toLowerCase() === '.verify') {
    const role = message.guild.roles.cache.get('1391021795473231943');
    if (!role) return message.reply('Role not found.');

    try {
      await message.member.roles.add(role);
      
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed to verify you.');
    }
  }
});



// Welcome system
client.on('guildMemberAdd', async member => {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === '👋・joins-leaves');
  if (welcomeChannel) welcomeChannel.send(`Welcome ${member} to the server!`);

  // Invite tracking
  const newInvites = await member.guild.invites.fetch();
  const oldInvites = invites.get(member.guild.id);
  const invite = newInvites.find(i => i.uses > oldInvites.get(i.code)?.uses);
  if (invite) {
    const logChannel = member.guild.channels.cache.find(ch => ch.name === '👥・invites');
    if (logChannel) {
      logChannel.send(`${member.user.tag} entered the server with invite code: ${invite.code}, who made: ${invite.inviter.tag}.`);
    }
  }
  invites.set(member.guild.id, newInvites);
});

// Mod logs
client.on('guildBanAdd', async ban => {
  const logChannel = ban.guild.channels.cache.find(ch => ch.name === '📛・moderation-logs');
  if (logChannel) {
    logChannel.send(`User ${ban.user.tag} is banned.`);
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
    const logChannel = newMember.guild.channels.cache.find(ch => ch.name === '📛・moderation-logs');
    if (logChannel) {
      logChannel.send(`${newMember.user.tag} got a timeout from: ${newMember.communicationDisabledUntil}`);
    }
  }
});

// Utility logs (e.g. role updates)
client.on('guildMemberUpdate', (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
  const logChannel = newMember.guild.channels.cache.find(ch => ch.name === '🔎・utility-logs');
  if (!logChannel) return;

  addedRoles.forEach(role => logChannel.send(`${newMember.user.tag} got a role: ${role.name}`));
  removedRoles.forEach(role => logChannel.send(`${newMember.user.tag} lost a role: ${role.name}`));
});

// Log anti-abuse actions
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const lowerMsg = message.content.toLowerCase();
  const badWords = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'faggot', 'jebem', 'kurac', 'pička', 'mater ti', 'idiot'];

  const abuseLogChannel = message.guild.channels.cache.find(ch => ch.name === '📛・moderation-logs');

  // Anti-invite
  const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/)/gi;
  if (inviteRegex.test(lowerMsg)) {
    try {
  await message.delete();
} catch (err) {
  console.warn(`Failed to delete message: ${err}`);
}
    if (abuseLogChannel) {
      abuseLogChannel.send(`🛑 **Anti-Invite** | ${message.author.tag} tried to post an invite link in <#${message.channel.id}>.`);
    }
    return message.channel.send(`${message.author}, posting invite links is not allowed!`).then(m => {
      setTimeout(() => m.delete().catch(() => {}), 5000);
    });
  }

  // Anti-swear
  for (const word of badWords) {
    if (lowerMsg.includes(word)) {
      await message.delete();
      if (abuseLogChannel) {
        abuseLogChannel.send(`⚠️ **Anti-Swear** | ${message.author.tag} used a blocked word in <#${message.channel.id}>.`);
      }
      return message.channel.send(`${message.author}, please avoid using inappropriate language.`).then(m => {
        setTimeout(() => m.delete().catch(() => {}), 5000);
      });
    }
  }
});
const express = require("express");
const app = express()

app.listen(300, () => {
  console.log("Project is running!");
})

app.get("/", (req, res) => {
  res.send("Hello world!");
})



client.login(process.env.token);
