const Discord = require("discord.js");
const Database = require("@replit/database");
const db = new Database();

module.exports = {
  name: 'logout',
  description: 'Logout Of Your Fortnite Account',
  async execute(interaction) {
    try {
      const token = await db.get(`${interaction.user.id}`);

      if (!token || token.length < 32) {
        const embedddd = new Discord.MessageEmbed()
          .setColor('E74C3C')
          .setTitle('❌ Error Found')
          .setDescription('You are not logged in')

        interaction.reply({ embeds: [embedddd] });
      } else {
        
        await db.delete(`${interaction.user.id}`);
        await db.delete(`${interaction.user.id}id`);
        await db.delete(`${interaction.user.id}dp`);
        await db.delete(`${interaction.user.id}pic`);

        const logout = new Discord.MessageEmbed()
          .setColor('2ECC71')
          .setTitle('✅ Successfully logged out')
          .setDescription('You are now signed out');

        interaction.reply({
          embeds: [logout],
        });
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      interaction.reply({
        content: 'Failed to logout. Please try again.',
        ephemeral: true,
      });
    }
  },
};
