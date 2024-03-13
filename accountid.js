const axios = require("axios");
const Discord = require("discord.js");
const Database = require("@replit/database");
const db = new Database();

module.exports = {
  name: 'accountid-lookup',
  description: 'Finds A Fortnite Player\'s Account ID',
  options: [{
    name: 'username',
    type: 3,
    description: 'The username of the Fortnite player',
    required: true,
  }],
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');

      const username_encoded = encodeURIComponent(username);
      const url = `https://fortniteapi.io/v2/lookup/advanced?username=${username_encoded}`;
      const headers = {
        'accept': 'application/json',
        'Authorization': '5829ed5f-3cec8f8b-92ab7a70-ed909de2',
      };
    
      const response = await axios.get(url, { headers });

      if (response.status === 200) {
        const data = response.data.matches[0];
        const accountId = data.accountId;
        let platformName = data.matches[0].platform.toLowerCase();
        
        switch (platformName) {
          case 'xbl':
            platformName = 'xbox';
            break;
          case 'ps':
            platformName = 'playstation';
            break;
          case 'epic':
            platformName = 'epic';
            break;
          default:
            platformName = 'Unrecognized'; 
        }
        
        const platform = platformName.charAt(0).toUpperCase() + platformName.slice(1);

        let imageUrl;

        switch (platformName) {
          case 'xbox':
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/2048px-Xbox_one_logo.svg.png';
            break;
          case 'playstation':
            imageUrl = 'https://www.logo.wine/a/logo/PlayStation/PlayStation-Icon-Logo.wine.svg';
            break;
          case 'epic':
            imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Epic_Games_logo.svg/882px-Epic_Games_logo.svg.png';
            break;
          default:
            imageUrl = 'https://static-00.iconduck.com/assets.00/question-mark-inverse-major-icon-2048x2048-2b54517l.png';
        }

        const embed = new Discord.MessageEmbed()
          .setTitle(`✅️ Successfully found ${username}'s account ID`)
          .setDescription(`Platform: ${platform}\nAccount ID: ${accountId}`)
          .setImage(imageUrl);
        interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply("❌ Failed to retrieve account ID. The username your trying to search may be private.");
      }
    } catch (error) {
      console.error(error);
      interaction.reply("❌ Failed to retrieve account ID. The username your trying to search may be private.");
    }
  }
};
