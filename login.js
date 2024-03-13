const axios = require("axios");
const Discord = require("discord.js");
const Database = require("@replit/database");
const db = new Database();

module.exports = {
  name: 'login',
  description: 'Log Into Your Fortnite Account',
  options: [{
    name: 'authcode',
    type: 3,
    description: 'Your copied code to sign in with.',
    required: false,
  }],
  async execute(interaction) {
    try {
      const authcode = interaction.options.getString('authcode');

      const authResponse = await axios({
        method: 'post',
        url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
        },
        data: `grant_type=authorization_code&code=${authcode}`
      });

      const accId = authResponse.data.account_id;
      await db.set(`${interaction.user.id}dp`, authResponse.data.displayName);
      await db.set(`${interaction.user.id}id`, accId);
      await db.set(`${interaction.user.id}`, authResponse.data.access_token);

    
      const profileResponse = await axios({
        method: 'post',
        url: `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accId}/client/QueryProfile?profileId=athena&rvn=-1`,
        headers: {
          'Authorization': `Bearer ${authResponse.data.access_token}`
        },
        data: {}
      });

      
      const dp = await db.get(`${interaction.user.id}dp`);
      const loadout = profileResponse.data.profileChanges[0].profile.stats.attributes.loadouts[0];
      const loadoutInfo = getLoadoutInfo(profileResponse, loadout);

    
      const profilePic = await getProfilePicture(loadoutInfo.loadout2[0]);

      const loginEmbed = new Discord.MessageEmbed()
        .setColor('2ECC71')
        .setThumbnail(profilePic)
        .setDescription('**✅Successfully Logged In!**');

      interaction.reply({
        embeds: [loginEmbed],
        ephemeral: true
      });
    } catch (error) {
      if (error.response) {
        const loginErrorEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Log into your Fortnite account')
          .setURL('https://www.epicgames.com/id/api/redirect?clientId=3446cd72694c4a4485d81b77adbb2141&responseType=code&redirectUrl=eos.3446cd72694c4a4485d81b77adbb2141://epic/auth')
          .addFields({
            name: '**Steps**',
            value: '1. Visit the link above to get your auth code.\
                \n2. Copy the 32 digit code that looks like `aabbccddeeff11223344556677889900`, and do the  `/login` command again but paste your auth code before sending.'
          });

        interaction.reply({
          embeds: [loginErrorEmbed],
          ephemeral: true
        });
      }
    }
  }
};

async function getProfilePicture(loadoutId) {
  try {
    const response = await axios({
      method: 'get',
      url: `https://fortnite-api.com/images/cosmetics/br/${loadoutId}/icon.png`,
      headers: {},
      data: {}
    });
    return response.data.icons.icon;
  } catch (error) {
    return `https://fortnite-api.com/images/cosmetics/br/${loadoutId}/icon.png`;
  }
}

function getLoadoutInfo(response, loadout) {
  let loadout2;
  try {
    const loadout1 = JSON.stringify(response.data.profileChanges[0].profile.items[loadout].attributes.locker_slots_data.slots.Character.items[0]).split(":");
    loadout2 = loadout1[1].split('"');
  } catch (err) {
    loadout2 = ["cid_001_athena_commando_f_default"];
  }
  return { loadout2 };
}
