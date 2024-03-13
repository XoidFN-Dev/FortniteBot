module.exports = {
	name: "warn",
	once: true,
	execute(error, client) {
console.log(JSON.stringify(error));
  }
}