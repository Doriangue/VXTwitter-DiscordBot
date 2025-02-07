const { Client, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { hasTwitterLink, getVxTwitterLink } = require('./functions/regex')
const { checkLinkIfVideo } = require('./functions/checkUrl')
const deleteMessage = require('./interactions/buttons/deleteMessage')
require('dotenv').config()

const bot = new Client({ intents: 3276799 })

bot.on('ready', async () => {
  console.log(bot.user)
})

bot.on('messageCreate', async message => {
  if (!hasTwitterLink(message.content) || message.author.bot) return
  const isVideo =  await checkLinkIfVideo(message.content)
  if (!isVideo) return

  const rep = getVxTwitterLink(message.content)
  const deleteButton = new ActionRowBuilder()
    .addComponents([
      new ButtonBuilder()
        .setCustomId(JSON.stringify({
          id: 'deleteMessage',
          userId: message.author.id
        }))
        .setLabel('Delete')
        .setStyle(4)
        .setDisabled(false)
    ])

  message.reply({
    content: `> <@!${message.author.id}>\n${rep}`,
    components: [deleteButton]
  })
    .then(m => message.delete())
    .catch(console.error)
})

bot.on('interactionCreate', async interaction => {
  if (interaction.isButton())
    interaction
      .deferUpdate()
      .then(() => {
        const json = JSON.parse(interaction.customId)
        if (json.id.normalize() === 'deleteMessage'.normalize()) deleteMessage(interaction, json).catch(console.error)
      })
      .catch(console.error)
})

bot.login(process.env.TOKEN)
