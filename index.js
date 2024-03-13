const { Constants, MessageEmbed } = require("discord.js");
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const errorLogStream = fs.createWriteStream('error.log', { flags: 'a' });

process.on('uncaughtException', (err, origin) => {
  errorLogStream.write(`Uncaught Exception:\n${err}\nException Origin: ${origin}\n\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  errorLogStream.write(`Unhandled Rejection:\nReason: ${reason}\nPromise: ${promise}\n\n`);
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', async () => {
  try {
    const commands = client.commands.map(command => ({
      name: command.name,
      description: command.description,
      options: command.options,
    }));

    console.log(`Registered ${commands.length} slash commands`);
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
  
  console.log(`Bot is online as ${client.user.tag}`);
  errorLogStream.write(`Bot is online as ${client.user.tag}\n`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName.toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) {
    await interaction.reply('Command not found. It will be unregistered.');
    client.commands.delete(commandName);
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    errorLogStream.write(`Error: ${error.message}\n`);

    const embed = new MessageEmbed()
      .setColor('E74C3C')
      .setTitle('An Error Has Occurred')
      .setDescription('You are not logged in');

    await interaction.reply({ embeds: [embed] });
  }
});

console.log('Bot is Running!');

client.login(process.env.TOKEN);