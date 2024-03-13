module.exports = {
	name: "error",
	once: true,
	execute(error, client) {
console.log(JSON.stringify(error));
  }
}