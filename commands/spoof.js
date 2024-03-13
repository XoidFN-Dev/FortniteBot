const { SlashCommandBuilder, MessageEmbed } = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const Database = require("@replit/database");
const db = new Database()

module.exports = {
  name: 'spoof',
  description: 'Spoof Your Skin',
  options: [{
    name: 'skin',
    type: 3,
    description: 'The name of the skin to spoof into.',
    required: true,
  }],

  async execute(interaction) {
    await interaction.deferReply();
    let token = await db.get(`${interaction.user.id}`);
    let accid = await db.get(`${interaction.user.id}id`);
    
    const headers = {
      Authorization: `Bearer ${token}`
    };
    let isFirstTime = true;
    
    try {
      const skin = interaction.options.getString('skin');
      
       const response4 = await axios.get(`https://fortnite-api.com/v2/cosmetics/br/search?name=${skin}`);
        const skinName = response4.data.data.name;
        const skinImage = response4.data.data.images.icon;
        const skinId = response4.data.data.id;

        const response1 = await axios.get(`https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/user/${accid}`, { headers: headers });
        const partyid = response1.data.current[0].id;

      
        const member = response1.data.current[0].members.find(member => member.account_id === accid);
        if (!member) {
            console.error('Member not found.');
            return;
        }

        
        const currentRevision = member.revision;

        let targetRevision = currentRevision;
        if (!isFirstTime) {
            targetRevision += 1; 
        }

      
        const updateObject = {
            "Default:AthenaCosmeticLoadout_j": `{
                "AthenaCosmeticLoadout": {
                    "characterPrimaryAssetId": "AthenaCharacter:${skinId}",
                    "characterEKey": "",
                    "backpackDef": "",
                    "backpackEKey": "",
                    "pickaxeDef": "",
                    "pickaxeEKey": "",
                    "contrailDef": "",
                    "contrailEKey": "",
                    "scratchpad": [],
                    "cosmeticStats": [
                        {"statName": "HabaneroProgression", "statValue": 16},
                        {"statName": "TotalVictoryCrowns", "statValue": 8},
                        {"statName": "TotalRoyalRoyales", "statValue": 1},
                        {"statName": "HasCrown", "statValue": 0}
                    ]
                }
            }`
        };

        const response2 = await axios.patch(`https://party-service-prod.ol.epicgames.com/party/api/v1/Fortnite/parties/${partyid}/members/${accid}/meta`, {
            "delete": [],
            "revision": targetRevision,
            "update": updateObject
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response2.status === 204) {
            console.log('Success');
            const embed = new MessageEmbed()
            .setTitle("✅ Skin Spoofed Successfully!")
            .setDescription(`
         Skin spoofed to ${skinName}!\n\n**Note!** The skin will NOT show up for you. Only for other party members!`)
            .setThumbnail(skinImage)
            .setColor('#00FF00');
            await interaction.followUp({ embeds: [embed] });
        }
      } catch (error) {
        console.error('Error occurred:', error);
        await interaction.followUp({ content: '❌ You are not logged in, not online, or the skin name was misspelled', ephemeral: true });
      }      
 }
}
