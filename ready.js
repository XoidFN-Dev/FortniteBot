module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    const serverCount = client.guilds.cache.size;

    client.user.setActivity(`${serverCount} servers!`, { type: 'WATCHING' });
  }
};
