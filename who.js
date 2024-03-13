const axios = require("axios")
const Discord = require("discord.js")
const Database = require("@replit/database")
const db = new Database()
const moment = require("moment")
module.exports = {
  name: 'who',
  description: 'Shows Who Your Logged In As',
  async execute(interaction) {
    try {
      let token = await db.get(`${interaction.user.id}`)
      let accid = await db.get(`${interaction.user.id}id`)
      let dp = await db.get(`${interaction.user.id}dp`)
      let pic = await db.get(`${interaction.user.id}pic`)
      axios({
        method: 'get',
        url: 'https://account-public-service-prod.ol.epicgames.com/account/api/public/account/' + accid,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {}
      }).then(function(response) {
        const id = response.data.id;
        const displayname = response.data.displayName;
        const fname = response.data.name;
        const email = response.data.email;
        const lastlogin = response.data.lastLogin;
        const dischanges = response.data.numberOfDisplayNameChanges;
        const country = response.data.country;
        const lname = response.data.lastName;
        const pnumber = response.data.phoneNumber;
        const ldisplaychange = response.data.lastDisplayNameChange;
        const canupdaten = response.data.canUpdateDisplayName;
        const canupdatenext = response.data.canUpdateDisplayNameNext;
        const tfa = response.data.tfaEnabled;
        const ever = response.data.emailVerified;
        const embed = new Discord.MessageEmbed()
          .setColor('3498DB')
          .setTitle(`Account Information`)
        .addField("👤 You are logged in as", `${displayname}`)

        interaction.reply({
          embeds: [embed],
          ephemeral: false
        })
      }).catch(function(error) {
        if (error.response) {
          if (token >= "32") {
            const embeddd = new Discord.MessageEmbed()
              .setColor('E74C3C')
              .setTitle(`❌ An Error Has Occurred`)
              .setDescription(`You are not logged in.`)
            interaction.reply({
              embeds: [embeddd]
            })
          } else {
            const embedddd = new Discord.MessageEmbed()
              .setColor('E74C3C')
              .setTitle('❌ An Error Has Occurred')
              .setDescription(`You are not logged in.`)
            interaction.reply({
              embeds: [embedddd]
            })
          }
        }
      })
    } catch (err) {}
  }
}