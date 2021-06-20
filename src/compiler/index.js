const { Plugin } = require(`powercord/entities`)
const { post } = require(`powercord/http`)

class Compiler extends Plugin {
	async startPlugin() {
		this.compilers = {
			lua: `lua-5.4.0`,
			ruby: `ruby-3.0.0`,
			js: `nodejs-14.0.0`,
			dlang: `dmd-2.076.0`,
			golang: `go-1.14.2`
		}

		this.buildCommands()	
	}

	pluginWillUnload() {
		powercord.api.commands.unregisterCommand(`Compile`)
	}

	async buildCommands() {
		powercord.api.commands.registerCommand({
            command: `Compile`,
            description: `Run code`,
            usage: ``,
            executor: async (args) => {
				try {
					const input = args.join(" ")
					let language = input.match(/\`\`\`(.*)\n/)
					let code = input.match(/\`\`\`.*\n(.*)\n\`\`\`/m)

					if (language == null) {
						throw new Error(`Error parsing the input for the compiler.`)
					}

					if (code == null) {
						throw new Error(`Error parsing the input for the code.`)
					}

					language = language[1]
					code = code[1]

					const compiler = this.compilers[language]

					if (compiler != null) {
						const request = post(`https://wandbox.org/api/compile.json`)

						request.set(`Content-Type`, `application/json`)
						request.send({
							code: code,
							compiler: compiler,
							save: true
						})

						const response = await request.execute()

						// return {
						// 	send: false,
						// 	result: `\`\`\`json\n${JSON.stringify(response.body, null, `\t`)}\`\`\``
						// }

						return {
							send: false,
							result: {
								type: `rich`,
								color: `0xFFFF00`,
								title: `Compiled and executed by ${compiler}`,
								fields: Object.entries(response.body).map(([key, value]) => new Object({ name: key, value: value }))
							}
						}
					} else {
						throw new Error(`Unknown compiler code "${language}"\nThe available compilers are "${Object.keys(this.compilers).join(`", "`)}"`)
					}
				} catch (err) {
					// return {
					// 	send: false,
					// 	result: `OOPSIE! err.message`,
					// }

					return {
						send: false,
						result: {
							type: `rich`,
							color: `0xFF0000`,
							title: `OOPSIE! We had an ERROR **D:**`,
							description: err.message
						}
					}
				}
            }
        })
	}
}

module.exports = Compiler