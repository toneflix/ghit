#!/usr/bin/env node
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let __h3ravel_shared = require("@h3ravel/shared");
__h3ravel_shared = __toESM(__h3ravel_shared);
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
let node_url = require("node:url");
node_url = __toESM(node_url);
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_readline_promises = require("node:readline/promises");
node_readline_promises = __toESM(node_readline_promises);
let better_sqlite3 = require("better-sqlite3");
better_sqlite3 = __toESM(better_sqlite3);
let os = require("os");
os = __toESM(os);
let fs = require("fs");
fs = __toESM(fs);
let path = require("path");
path = __toESM(path);
let __octokit_rest = require("@octokit/rest");
__octokit_rest = __toESM(__octokit_rest);
let __h3ravel_musket = require("@h3ravel/musket");
__h3ravel_musket = __toESM(__h3ravel_musket);
let node_module = require("node:module");
node_module = __toESM(node_module);
let fast_diff = require("fast-diff");
fast_diff = __toESM(fast_diff);
let __antfu_install_pkg = require("@antfu/install-pkg");
__antfu_install_pkg = __toESM(__antfu_install_pkg);
let cli_table3 = require("cli-table3");
cli_table3 = __toESM(cli_table3);
let module$1 = require("module");
module$1 = __toESM(module$1);
let dns_promises = require("dns/promises");
dns_promises = __toESM(dns_promises);
let __octokit_oauth_methods = require("@octokit/oauth-methods");
__octokit_oauth_methods = __toESM(__octokit_oauth_methods);
let open = require("open");
open = __toESM(open);
require("dotenv/config");
let axios = require("axios");
axios = __toESM(axios);

//#region src/utils/global.ts
String.prototype.toKebabCase = function() {
	return this.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
};
String.prototype.toCamelCase = function() {
	return this.replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());
};
String.prototype.toPascalCase = function() {
	return this.replace(/(^\w|[-_ ]+\w)/g, (match) => match.replace(/[-_ ]+/, "").toUpperCase());
};
String.prototype.toSnakeCase = function() {
	return this.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
};
String.prototype.toTitleCase = function() {
	return this.toLowerCase().replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};

//#endregion
//#region src/db.ts
let db;
const dbPath = path.default.join((0, os.homedir)(), ".grithub");
(0, fs.mkdirSync)(dbPath, { recursive: true });
const useDbPath = () => [dbPath];
/**
* Hook to get or set the database instance.
* 
* @returns 
*/
const useDb = () => {
	return [() => db, (newDb) => {
		db = newDb;
		const [{ journal_mode }] = db.pragma("journal_mode");
		if (journal_mode !== "wal") db.pragma("journal_mode = WAL");
	}];
};
const [getDatabase, setDatabase] = useDb();
setDatabase(new better_sqlite3.default(path.default.join(dbPath, "app.db")));
/**
* Initialize the database
* 
* @param table 
* @returns 
*/
function init() {
	return getDatabase().exec(`
        CREATE TABLE IF NOT EXISTS json_store (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )
    `);
}
/**
* Save a value to the database
* 
* @param key 
* @param value 
* @returns 
*/
function write(key, value) {
	const db$1 = getDatabase();
	if (typeof value === "boolean") value = value ? "1" : "0";
	if (value instanceof Object) value = JSON.stringify(value);
	return db$1.prepare(`INSERT INTO json_store (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `).run(key, value).lastInsertRowid;
}
/**
* Remove a value from the database
* 
* @param key 
* @param table 
* @returns 
*/
function remove(key) {
	return getDatabase().prepare("DELETE FROM json_store WHERE key = ?").run(key).lastInsertRowid;
}
/**
* Read a value from the database
* 
* @param key 
* @returns 
*/
function read(key) {
	const db$1 = getDatabase();
	try {
		const row = db$1.prepare("SELECT * FROM json_store WHERE key = ?").get(key);
		if (row) try {
			return JSON.parse(row.value);
		} catch {
			return row.value;
		}
	} catch {}
	return null;
}

//#endregion
//#region src/hooks.ts
let commandInstance;
/**
* Hook to get or set the current Command instance.
*/
function useCommand() {
	return [() => {
		if (!commandInstance) throw new Error("Commander instance has not been initialized");
		return commandInstance;
	}, (newCommand) => {
		commandInstance = newCommand;
	}];
}
/**
* Hook to get or set the application configuration.
* 
* @returns 
*/
function useConfig() {
	return [() => {
		return read("config") || {
			debug: false,
			apiBaseURL: "https://api.github.com",
			timeoutDuration: 3e3,
			skipLongCommandGeneration: true
		};
	}, (config$1) => {
		write("config", config$1);
		return read("config");
	}];
}
const shortcutUsed = /* @__PURE__ */ new Set();
/**
* Hook to make command shortcuts unique across the application.
* 
* @returns 
*/
function useShortcuts() {
	return [() => Array.from(shortcutUsed).filter((s) => !!s), (shortcut) => {
		if (!shortcut) {
			shortcutUsed.clear();
			return false;
		}
		if (shortcutUsed.has(shortcut)) return false;
		shortcutUsed.add(shortcut);
		return true;
	}];
}
/**
* Hook to get an authenticated Octokit instance.
* 
* @returns 
*/
const useOctokit = () => {
	const token = read("token");
	if (!token) throw new Error("No authentication token found. Please log in first.");
	return new __octokit_rest.Octokit({ auth: token });
};

//#endregion
//#region src/helpers.ts
const __filename$1 = (0, node_url.fileURLToPath)(require("url").pathToFileURL(__filename).href);
const __dirname$1 = node_path.default.dirname(__filename$1);
/**
* Wrap a promise to return a tuple of error and result
* 
* @param promise 
* @returns 
*/
const promiseWrapper = (promise) => promise.then((data) => [null, data]).catch((error) => [typeof error === "string" ? error : error.message, null]);
/**
* Execute a schema
* 
* @param schema 
* @param options 
* @returns 
*/
async function executeSchema(root, schema, args) {
	const octokit = useOctokit();
	const { data, message } = await Reflect.apply(octokit[root][schema.api], octokit[root], [args]);
	if (!data || Array.isArray(data) && data.length < 1 || data instanceof Object && Object.keys(data).length < 1) return {
		data: null,
		message: message ?? "Request was successful but returned no data.",
		status: false
	};
	return {
		data,
		message: message ?? "Request Completed",
		status: true
	};
}
/**
* Wait for a specified number of milliseconds
* 
* @param ms 
* @param callback 
* @returns 
*/
const wait = (ms, callback) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (callback) resolve(callback());
			resolve();
		}, ms);
	});
};
/**
* Logger helper
* 
* @param str 
* @param config 
* @returns 
*/
const logger = (str, config$1 = ["green", "italic"], log) => {
	return __h3ravel_shared.Logger.log(str, config$1, log ?? false);
};
const viewIssue = (issue) => {
	__h3ravel_shared.Logger.log([
		["Title:", ["white", "bold"]],
		[issue.title, ["blue"]],
		["\nType:", ["white", "bold"]],
		[typeof issue.type === "string" ? issue.type : issue.type?.name ?? "N/A", ["blue"]],
		["\nNumber:", ["white", "bold"]],
		[String(issue.number), ["blue"]],
		["\nState:", ["white", "bold"]],
		[issue.state, ["blue"]],
		["\nLabels:", ["white", "bold"]],
		[issue.labels.map((l) => l.name ?? l).join(", "), ["blue"]],
		["\nAssignees:", ["white", "bold"]],
		[issue.assignees?.map((a) => a.login ?? a).join(", ") || "N/A", ["blue"]],
		["\nCreated at:", ["white", "bold"]],
		[new Date(issue.created_at).toLocaleString(), ["blue"]],
		["\nUpdated at:", ["white", "bold"]],
		[new Date(issue.updated_at).toLocaleString(), ["blue"]]
	], " ");
};
/**
* Find the nearest package.json file
* 
* @param startDir 
* @returns 
*/
const findCLIPackageJson = (startDir = __dirname$1) => {
	let dir = startDir;
	while (true) {
		const pkgPath = node_path.default.join(dir, "package.json");
		if ((0, node_fs.existsSync)(pkgPath)) return pkgPath;
		const parent = node_path.default.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
};
/**
* Wait for the user to press Enter
* 
* @param onEnter 
*/
const waitForEnter = async (onEnter) => {
	const rl = node_readline_promises.default.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	await rl.question("");
	onEnter();
	rl.close();
};

//#endregion
//#region src/github/apis.ts
const APIs = {
	issues: [
		{
			api: "create",
			alias: void 0,
			endpoint: "/repos/{owner}/{repo}/issues",
			description: "Create an issue",
			params: [
				{
					parameter: "title",
					required: true,
					type: "String",
					description: "The title of the issue",
					paramType: "body",
					flag: true
				},
				{
					parameter: "body",
					required: false,
					type: "String",
					description: "The contents of the issue",
					paramType: "body",
					flag: true
				},
				{
					parameter: "owner",
					required: false,
					type: "String",
					description: "The account owner of the repository",
					paramType: "path",
					arg: true
				},
				{
					parameter: "repo",
					required: false,
					type: "String",
					description: "The name of the repository",
					paramType: "path",
					arg: true
				}
			]
		},
		{
			api: "listForRepo",
			alias: "list",
			endpoint: "/repos/{owner}/{repo}/issues",
			description: "List repository issues",
			params: [
				{
					parameter: "owner",
					required: false,
					type: "String",
					description: "The account owner of the repository",
					paramType: "path"
				},
				{
					parameter: "repo",
					required: false,
					type: "String",
					description: "The name of the repository",
					paramType: "path"
				},
				{
					parameter: "state",
					required: false,
					type: "String",
					description: "Indicates the state of the issues to return. [open, closed]",
					paramType: "query"
				}
			]
		},
		{
			api: "get",
			alias: "get",
			endpoint: "/repos/{owner}/{repo}/issues/{issue_number}",
			description: "Get a single issue",
			params: [
				{
					parameter: "issue_number",
					required: true,
					type: "Number",
					description: "The number of the issue to get",
					paramType: "path"
				},
				{
					parameter: "owner",
					required: false,
					type: "String",
					description: "The account owner of the repository",
					paramType: "path"
				},
				{
					parameter: "repo",
					required: false,
					type: "String",
					description: "The name of the repository",
					paramType: "path"
				}
			]
		}
	],
	orgs: [{
		api: "listForAuthenticatedUser",
		alias: "list",
		endpoint: "/user/orgs",
		description: "List organizations for the authenticated user",
		params: [{
			parameter: "page",
			required: false,
			type: "Number",
			description: "Page number of the results to fetch",
			paramType: "query"
		}, {
			parameter: "per_page",
			required: false,
			type: "Number",
			description: "Results per page (max 100)",
			paramType: "query"
		}]
	}]
};
var apis_default = APIs;

//#endregion
//#region src/utils/argument.ts
/**
* We would build a command signature string from an array of arguments.
* Musket command signature for arguments follow this format:
* 
* - Optional arguments: {argumentName?}
* - Required arguments: {argumentName}
* - Optional argument with a default value: {argumentName=defaultValue}
* - Arguments with description: {argumentName : description}
* - Arguments Expecting multiple values: {argumentName*}
* 
* - Boolean flags are represented as: {--flag-name}
* - Flags expecting values are represented as: {--flag-name=}
* - Flags with description: {--flag-name : description}
* - Flags expecting multiple values: {--flag-name=*}
* - Flags with choices: {--flag-name : : choice1,choice2,choice3}
* - Or {--flag-name : description : choice1,choice2,choice3}
* 
* For shortcuts: {--F|flag-name}
* We will extract the first letter before the pipe as the shortcut, but we also 
* need to ensure it is not already used by another option, in which case we check 
* if the string is a multiword (camel, dash, underscore separated) then we try to use the first letter of the second word.
* 
* XParam properties used:
* - parameter: The name of the argument or flag.
* - required: A boolean indicating if the argument is required.
* - type: The type of the argument (String, Number, Boolean, Array, Object).
* - description: An optional description for the argument.
* - default: An optional default value for the argument.
* - options: An optional array of choices for the argument.
* 
* We will make required arguments with defaults arguments.
* Everything else would be flags.
* 
* 
* @param args 
*/
const buildSignature = (param, cmd) => {
	const [_, setShortcut] = useShortcuts();
	let signature = "";
	if ((!param.required || param.default !== void 0 || param.type === "Boolean" || param.options || param.flag === true) && param.paramType !== "path" && param.arg !== true) {
		signature += "{--";
		if (setShortcut(cmd + ":" + param.parameter.charAt(0).toLowerCase())) signature += `${param.parameter.charAt(0).toLowerCase()}|`;
		else {
			const words = param.parameter.split(/[_-\s]/);
			if (words.length > 1) {
				if (setShortcut(cmd + ":" + words[1].charAt(0).toLowerCase())) signature += `${words[1].charAt(0).toLowerCase()}|`;
			}
		}
		signature += `${param.parameter}`;
		if (param.type !== "Boolean") signature += param.default ? `=${param.default}` : "?";
		if (param.description) signature += ` : ${param.description}`;
		if (param.options) {
			const optionsStr = param.options.join(",");
			signature += ` : ${optionsStr}`;
		}
		signature += "}";
	} else {
		signature += `{${param.parameter}`;
		if (param.default) signature += `=${param.default}`;
		if (param.description) signature += ` : ${param.description}`;
		signature += "}";
	}
	return signature;
};

//#endregion
//#region src/utils/renderer.ts
/**
* We will recursively map through the result data and log each key value pair
* as we apply coloring based on the value type.
* We also need to handle root or nested objects and arrays while considering
* indentation for better readability.
* 
* @param data 
*/
const dataRenderer = (data) => {
	const render = (obj, indent = 0) => {
		const indentation = " ".repeat(indent);
		for (const key in obj) {
			const value = obj[key];
			if (typeof value === "object" && value !== null) {
				console.log(`${indentation}${stringFormatter(key)}:`);
				render(value, indent + 2);
			} else {
				let coloredValue;
				switch (typeof value) {
					case "string":
						coloredValue = __h3ravel_shared.Logger.log(value, "green", false);
						break;
					case "number":
						coloredValue = __h3ravel_shared.Logger.log(String(value), "yellow", false);
						break;
					case "boolean":
						coloredValue = __h3ravel_shared.Logger.log(String(value), "blue", false);
						break;
					case "object":
						if (value === null) coloredValue = __h3ravel_shared.Logger.log("null", "gray", false);
						else coloredValue = __h3ravel_shared.Logger.log(JSON.stringify(value), "cyan", false);
						break;
					default: coloredValue = value;
				}
				console.log(`${indentation}${stringFormatter(key)}: ${coloredValue}`);
			}
		}
	};
	render(data);
};
/**
* We will format a string by replacing underscores and hyphens with spaces,
* capitalizing the first letter of every word,
* converting camelCase to spaced words,
* and trimming any leading or trailing spaces.
* If a sentence is only two letters long we will make it uppercase.
* 
* @param str 
* @returns 
*/
const stringFormatter = (str) => {
	return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").trim().replace(/^(\w{2})$/, (_, p1) => p1.toUpperCase());
};
/**
* Render the difference between two text strings, highlighting additions and deletions.
* 
* @param oldText 
* @param newText 
* @returns 
*/
const diffText = (oldText, newText) => {
	return (0, fast_diff.default)(newText, oldText).map((part) => {
		const [type, text] = part;
		if (type === 0) return text;
		else if (type === -1) return logger(text, ["red", "strikethrough"], !1);
		else return logger(text, ["green", "underline"], !1);
	}).join("");
};

//#endregion
//#region src/Commands/Commands.ts
var Commands_default = () => {
	const require$1 = (0, node_module.createRequire)(require("url").pathToFileURL(__filename).href);
	const commands = [];
	let GeneratedAPIs = apis_default;
	if (!process.argv.includes("generate:apis") && (0, node_fs.existsSync)(node_path.default.join(process.cwd(), ".grithub/apis.generated.js"))) ({APIs: GeneratedAPIs} = require$1(node_path.default.join(process.cwd(), ".grithub/apis.generated.js")));
	/**
	* We should map through the APIs and reduce all apis to a single key value pair
	* where key is the API key and the schema array entry api propety separated by a 
	* semicolon and the value is schema array entry.
	*/
	const entries = Object.entries(GeneratedAPIs).reduce((acc, [key, schemas]) => {
		schemas.forEach((schema) => {
			const commandKey = key === schema.api ? key : `${key}:${(schema.alias ?? schema.api).toKebabCase()}`;
			acc[commandKey] = schema;
		});
		return acc;
	}, {});
	for (const [key, schema] of Object.entries(entries)) {
		const args = schema.params.map((param) => buildSignature(param, key)).join("\n");
		const command = class extends __h3ravel_musket.Command {
			signature = `${key} \n${args}`;
			description = schema.description || "No description available.";
			handle = async () => {
				const root = key.split(":").shift();
				const $args = {
					...this.arguments() ?? {},
					...this.options() ?? {}
				};
				const [_, setCommand] = useCommand();
				setCommand(this);
				if (!root) return void this.error("Unknown command entry.").newLine();
				for (const param of schema.params) if (param.required && !this.argument(param.parameter)) return void this.newLine().error(`Missing required argument: ${param.parameter}`).newLine();
				const repo = read("default_repo");
				const token = read("token");
				const repository = ([$args.owner, $args.repo].filter(Boolean).join("/") || repo.full_name).split("/") ?? ["", ""];
				const requiresRepo = schema.params.some((param) => ["repo", "user"].includes(param.parameter));
				if (requiresRepo && (!repository[0] || !repository[1])) return void this.error("ERROR: No repository set. Please set a default repository using the [set-repo] command or provide one using the --repo option.").newLine();
				if (!token) return void this.error("ERROR: You're not signed in, please run the [login] command before you begin").newLine();
				this.newLine();
				const spinner = this.spinner("Loading...\n").start();
				if (requiresRepo) {
					$args["owner"] = repository[0];
					$args["repo"] = repository[1];
				}
				const [err, result] = await promiseWrapper(executeSchema(root, schema, $args));
				if (err || !result) return void spinner.fail((err || "An error occurred") + "\n");
				spinner.succeed(result.message);
				this.newLine();
				dataRenderer(result.data);
				this.newLine();
			};
		};
		commands.push(command);
	}
	return commands;
};

//#endregion
//#region src/utils/config.ts
const configChoices = (config$1) => {
	return [
		{
			name: "Debug Mode",
			value: "debug",
			description: `Enable or disable debug mode (${config$1.debug ? "Enabled" : "Disabled"})`
		},
		{
			name: "API Base URL",
			value: "apiBaseURL",
			description: `Set the base URL for the API (${config$1.apiBaseURL})`
		},
		{
			name: "Timeout Duration",
			value: "timeoutDuration",
			description: `Set the timeout duration for API requests (${config$1.timeoutDuration} ms)`
		},
		{
			name: "Skip Long Command Generation",
			value: "skipLongCommandGeneration",
			description: `Enable or disable skipping of long command generation when calling ${logger("generate:apis", ["grey", "italic"])} (${config$1.skipLongCommandGeneration ? "Enabled" : "Disabled"})`
		},
		{
			name: "Ngrok Auth Token",
			value: "ngrokAuthToken",
			description: `Set the Ngrok Auth Token - will default to environment variable if not set (${config$1.ngrokAuthToken ? "************" : "Not Set"})`
		},
		{
			name: "Reset Configuration",
			value: "reset",
			description: "Reset all configurations to default values"
		}
	];
};
const saveConfig = async (choice) => {
	const [getConfig, setConfig] = useConfig();
	const [command] = useCommand();
	let config$1 = getConfig();
	if (choice === "debug") {
		const debug = await command().confirm(`${config$1.debug ? "Dis" : "En"}able debug mode?`, config$1.debug === true);
		config$1.debug = config$1.debug !== debug;
	} else if (choice === "apiBaseURL") config$1.apiBaseURL = await command().ask("Enter API Base URL", config$1.apiBaseURL);
	else if (choice === "ngrokAuthToken") config$1.ngrokAuthToken = await command().ask("Enter Ngrok Auth Token", config$1.ngrokAuthToken || "");
	else if (choice === "timeoutDuration") {
		const timeoutDuration = await command().ask("Enter Timeout Duration (in ms)", config$1.timeoutDuration.toString());
		config$1.timeoutDuration = parseInt(timeoutDuration);
	} else if (choice === "skipLongCommandGeneration") config$1.skipLongCommandGeneration = await command().confirm(`${config$1.skipLongCommandGeneration ? "Dis" : "En"}able skipping of long command generation?`, config$1.skipLongCommandGeneration === true);
	else if (choice === "reset") config$1 = {
		debug: false,
		apiBaseURL: "https://api.github.com",
		timeoutDuration: 3e3,
		skipLongCommandGeneration: true
	};
	setConfig(config$1);
};

//#endregion
//#region src/Commands/ConfigCommand.ts
var ConfigCommand = class extends __h3ravel_musket.Command {
	signature = "config";
	description = "Configure Grithub";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const [getConfig, setConfig] = useConfig();
		let config$1 = getConfig();
		if (!config$1) {
			config$1 = {
				debug: false,
				apiBaseURL: "https://api.github.com",
				timeoutDuration: 3e3,
				skipLongCommandGeneration: true
			};
			setConfig(config$1);
		}
		await saveConfig(await this.choice("Select configuration to set", configChoices(config$1)));
		this.info("Configuration updated successfully!").newLine();
	}
};

//#endregion
//#region src/github/apis-generator.ts
var ApisGenerator = class ApisGenerator {
	spec;
	config;
	openapi;
	skipApis = new Set([
		"issues:list",
		"issues:update",
		"issues:seed",
		"issues:delete"
	]);
	skipParams = new Set(["s"]);
	PARAM_LOCATIONS = new Set([
		"path",
		"query",
		"header"
	]);
	constructor(openapi, schema = "api.github.com.deref") {
		const [getConfig] = useConfig();
		this.openapi = openapi;
		this.spec = this.openapi.schemas[schema];
		this.config = getConfig();
		if (!this.spec || !this.spec.paths) throw new Error(`Could not find ${schema} schema`);
	}
	static async installOctokitOpenapi() {
		const spinner = useCommand()[0]().spinner("Installing @octokit/openapi...").start();
		const __dirname$2 = (0, node_path.dirname)((0, node_url.fileURLToPath)(require("url").pathToFileURL(__filename).href));
		await (0, __antfu_install_pkg.installPackage)("@octokit/openapi", {
			cwd: node_path.default.normalize(node_path.default.join(__dirname$2, "../..")),
			silent: true
		});
		spinner.succeed("@octokit/openapi installed successfully.");
		return (await import("@octokit/openapi")).default;
	}
	skipParam(name) {
		return this.skipParams.has(name) || name.length > 20 || name.length <= 2;
	}
	skipApi(api$1, namespace) {
		const cmd = (namespace ? namespace + ":" : "") + api$1.toCamelCase();
		return this.skipApis.has(cmd) || this.skipApis.has(api$1.toCamelCase()) || cmd.length > (this.config.skipLongCommandGeneration ? 23 : Infinity);
	}
	normalizeType(schema) {
		const typeMap = {
			integer: "Number",
			number: "Number",
			string: "String",
			boolean: "Boolean",
			array: "Array",
			object: "Object",
			enum: "String",
			oneOf: "String",
			anyOf: "String",
			allOf: "String"
		};
		let type = typeMap[schema?.type] || "any";
		if (Array.isArray(schema?.type)) type = schema.type.map((t) => typeMap[t] || "any").join("|");
		if (type !== "any") return type;
		if (!schema) type = "any";
		if (Array.isArray(schema.type)) return schema.type.join("|");
		if (schema.type) type = schema.type;
		if (schema.enum) type = "enum";
		if (schema.oneOf) type = "oneOf";
		if (schema.anyOf) type = "anyOf";
		if (schema.allOf) type = "allOf";
		return typeMap[type] || "any";
	}
	gatherParams(op) {
		const collected = [];
		for (const p of op.parameters ?? []) {
			const loc = this.PARAM_LOCATIONS.has(p.in) ? p.in : "query";
			if (this.skipParam(p.name)) continue;
			collected.push({
				parameter: p.name,
				required: !!p.required,
				type: this.normalizeType(p.schema).toPascalCase(),
				description: p.description,
				paramType: loc
			});
		}
		const jsonBody = op.requestBody?.content?.["application/json"];
		const bodySchema = jsonBody?.schema;
		const bodyProps = bodySchema?.properties ?? {};
		const requiredProps = bodySchema?.required ?? [];
		for (const [name, schema] of Object.entries(bodyProps)) {
			if (this.skipParam(name)) continue;
			collected.push({
				parameter: name,
				required: requiredProps.includes(name) || !!jsonBody?.required,
				type: this.normalizeType(schema).toPascalCase(),
				description: schema.description,
				paramType: "body"
			});
		}
		return collected;
	}
	buildTree() {
		const tree = {};
		for (const [route, ops] of Object.entries(this.spec.paths)) for (const [_method, def] of Object.entries(ops ?? {})) {
			const op = def;
			const opId = op?.operationId;
			if (!opId) continue;
			const [namespace, name] = opId.split("/");
			if (!namespace || !name || this.skipApi(name, namespace)) continue;
			const params = this.gatherParams(op);
			if (!tree[namespace.toCamelCase()]) tree[namespace.toCamelCase()] = [];
			tree[namespace.toCamelCase()].push({
				api: name.toCamelCase(),
				endpoint: route,
				description: op.summary ?? op.description ?? void 0,
				alias: op["x-github"]?.alias ?? op["x-octokit"]?.alias ?? void 0,
				params
			});
		}
		return tree;
	}
	static async run() {
		const [cmd] = useCommand();
		const command = cmd();
		let octokitOpenapi;
		const spinner = command.spinner("Checking if @octokit/openapi Installed...").start();
		try {
			({default: octokitOpenapi} = await import("@octokit/openapi"));
			spinner.succeed("@octokit/openapi is already installed.");
		} catch {
			spinner.fail("@octokit/openapi is not installed.");
			octokitOpenapi = await ApisGenerator.installOctokitOpenapi();
		}
		spinner.start("Generating Extended APIs...");
		const tree = new ApisGenerator(octokitOpenapi, "api.github.com.deref").buildTree();
		const target = node_path.default.join(process.cwd(), ".grithub/apis.generated.js");
		const contents = `// Auto-generated from @octokit/openapi. Do not edit directly.

export const APIs = ${JSON.stringify(tree, null, 2).replace(/"([A-Za-z_][\w$]*)":/g, "$1:").replace(/:\s*"((?:[^"\\]|\\.)*)"/g, (_, p1) => `: '${p1.replace(/\\"/g, "\"").replace(/'/g, "\\'")}'`)}\n\nexport default APIs\n`;
		(0, node_fs.mkdirSync)(node_path.default.dirname(target), { recursive: true });
		(0, node_fs.writeFileSync)(target, contents, "utf8");
		spinner.succeed("Generated Extended APIs to: " + target);
	}
};

//#endregion
//#region src/Commands/GenerateApisCommand.ts
var GenerateApisCommand = class extends __h3ravel_musket.Command {
	signature = "generate:apis";
	description = "Generate extended API definitions from the GitHub OpenAPI spec";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		ApisGenerator.run();
	}
};

//#endregion
//#region src/Commands/InfoCommand.ts
var InfoCommand = class extends __h3ravel_musket.Command {
	signature = "info";
	description = "Display application runtime information.";
	async handle() {
		let pkg = {
			version: "unknown",
			dependencies: {}
		};
		const user = read("user");
		const pkgPath = findCLIPackageJson();
		const require$1 = (0, module$1.createRequire)(require("url").pathToFileURL(__filename).href);
		const [_, setCommand] = useCommand();
		const [dbPath$1] = useDbPath();
		setCommand(this);
		init();
		const spinner = this.spinner("Gathering application information...\n").start();
		if (pkgPath) try {
			pkg = require$1(pkgPath);
		} catch {}
		wait(500, () => {
			spinner.succeed("Application Information Loaded.\n");
			const out = new cli_table3.default();
			out.push({ "App Version": pkg.version }, { "Platform": `${os.default.platform()} ${os.default.arch()} (${os.default.release()})` }, { "CPUs": os.default.cpus().length }, { "Host": `${os.default.userInfo().username}@${os.default.hostname()}` }, { "Memory": `${(os.default.freemem() / 1024 ** 3).toFixed(2)} GB / ${(os.default.totalmem() / 1024 ** 3).toFixed(2)} GB` }, { "Database Path": path.default.join(dbPath$1, "app.db") }, { "Github User": user ? `${user.login} (ID: ${user.id})` : "Not logged in" }, { "Default Repo": read("default_repo")?.full_name || "Not set" });
			console.log(out.toString());
			__h3ravel_shared.Logger.log("\nDependencies:", "yellow");
			__h3ravel_shared.Logger.log(Object.keys(pkg.dependencies).map((dep) => `${dep}`).join(", "), "green");
			this.newLine();
		});
	}
};

//#endregion
//#region src/Commands/InitCommand.ts
var InitCommand = class extends __h3ravel_musket.Command {
	signature = "init";
	description = "Initialize the application.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		init();
		this.info("Application initialized successfully.").newLine();
	}
};

//#endregion
//#region src/github/issues-seeder.ts
/**
* GitHub Issues Creator
* 
* This script reads markdown issue files from the issues directory
* and creates them as GitHub issues using the GitHub API.
*/
var IssuesSeeder = class {
	command;
	constructor() {
		const [command] = useCommand();
		this.command = command();
	}
	/**
	* Set filename in issue content
	* 
	* @param content 
	* @param fileName 
	*/
	setFilePath(content, filePath) {
		if (!filePath) return content;
		if (content.includes("<!-- grithub#filepath:")) content = content.replace(/<!--\s*grithub#filepath:\s*.+?\s*-->/i, `<!-- grithub#filepath: ${filePath} -->`);
		else content = `<!-- grithub#filepath: ${filePath} -->\n\n` + content;
		return content;
	}
	/**
	* Get filename from issue content
	* 
	* @param content 
	* @returns 
	*/
	getFilePath(content) {
		const match = content.match(/<!--\s*grithub#filepath:\s*(.+?)\s*-->/i);
		if (match) return match[1].trim();
	}
	/**
	* Parse frontmatter from markdown file
	* 
	* @param content 
	* @returns 
	*/
	parseFrontmatter(content) {
		const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		if (!match) return {
			metadata: {},
			body: content
		};
		const [, frontmatter, body] = match;
		const metadata = {};
		const lines = frontmatter.split("\n");
		let currentKey = null;
		for (const line of lines) {
			const keyValueMatch = line.match(/^(\w+):\s*['"]?(.*?)['"]?$/);
			if (keyValueMatch) {
				const [, key, value] = keyValueMatch;
				currentKey = key;
				metadata[key] = value;
			} else if (currentKey && line.trim()) metadata[currentKey] += "\n" + line.trim();
		}
		return {
			metadata,
			body: body.trim()
		};
	}
	/**
	* Create a GitHub issue
	* 
	* @param entry 
	* @param owner 
	* @param repo 
	* @returns 
	*/
	async updateIssue(entry, issue, owner, repo) {
		try {
			const { data } = await useOctokit().issues.update({
				repo,
				owner,
				issue_number: issue.number,
				body: this.setFilePath(entry.body, entry.filePath),
				title: entry.title,
				labels: entry.labels || [],
				assignees: entry.assignees || []
			});
			return data;
		} catch (error) {
			throw this.requestError(error, owner, repo);
		}
	}
	/**
	* Create a GitHub issue
	* 
	* @param entry 
	* @param owner 
	* @param repo 
	* @returns 
	*/
	async createIssue(entry, owner, repo) {
		try {
			const { data } = await useOctokit().issues.create({
				repo,
				owner,
				type: entry.type,
				body: this.setFilePath(entry.body, entry.filePath),
				title: entry.title,
				labels: entry.labels || [],
				assignees: entry.assignees || []
			});
			return data;
		} catch (error) {
			throw this.requestError(error, owner, repo);
		}
	}
	/**
	* Read all issue files from a directory
	*/
	getIssueFiles(dir) {
		const files = [];
		const spinner = this.command.spinner("Reading issue files...").start();
		const traverse = (currentDir) => {
			const entries = fs.default.readdirSync(currentDir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = path.default.join(currentDir, entry.name);
				if (entry.isDirectory()) traverse(fullPath);
				else if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
			}
		};
		traverse(dir);
		const sortedFiles = files.sort();
		spinner.succeed(`Found ${sortedFiles.length} issue files`);
		if (sortedFiles.length === 0) {
			spinner.info("No issue files found. Exiting.");
			process.exit(0);
		}
		return sortedFiles;
	}
	/**
	* Process a single issue file
	* 
	* @param filePath 
	* @returns 
	*/
	processIssueFile(filePath) {
		const directory = (0, path.join)(process.cwd(), this.command.argument("directory", "issues"));
		const content = fs.default.readFileSync(filePath, "utf-8");
		const { metadata, body } = this.parseFrontmatter(content);
		const relativePath = path.default.relative(directory, filePath);
		const fileName = path.default.basename(filePath, ".md");
		let labels = [];
		if (metadata.labels) labels = metadata.labels.split(",").map((l) => l.trim()).filter((l) => l);
		let assignees = [];
		if (metadata.assignees && metadata.assignees.trim()) assignees = metadata.assignees.split(",").map((a) => a.trim()).filter((a) => a);
		return {
			filePath: relativePath,
			title: metadata.title || metadata.name || fileName,
			type: metadata.type,
			body,
			labels,
			assignees,
			fileName
		};
	}
	/**
	* Validate GitHub token and repository access
	* 
	* @param owner 
	* @param repo 
	* @returns 
	*/
	async validateAccess(owner, repo) {
		const spinner = this.command.spinner("Checking GitHub access...").start();
		try {
			return await useOctokit().repos.get({
				owner,
				repo
			});
		} catch (error) {
			spinner.stop();
			let message = "";
			if (error.status === 404) message = `ERROR: ${error.message}\n\nThis usually means:
  1. No internet connection
  2. DNS server issues
  3. Firewall/proxy blocking DNS

Troubleshooting:
  - Check your internet connection
  - Try opening https://github.com in your browser
  - If behind a corporate firewall, check proxy settings
  - Try using a different DNS (e.g., 8.8.8.8)

Original error: ${error.message}`;
			else message = `ERROR: GitHub access validation failed: ${error.message}`;
			throw new Error(message);
		} finally {
			spinner.succeed("GitHub access validated successfully.");
		}
	}
	/**
	* Check network connectivity to GitHub
	*/
	async checkConnectivity() {
		const spinner = this.command.spinner("Checking network connectivity...").start();
		try {
			const addresses = await dns_promises.default.resolve("api.github.com");
			spinner.succeed(`DNS resolution successful: ${__h3ravel_shared.Logger.log(addresses[0], "blue", !1)}`);
			return addresses;
		} catch (error) {
			spinner.stop();
			throw new Error(`ERROR: Cannot resolve api.github.com

This usually means:
  1. No internet connection
  2. DNS server issues
  3. Firewall/proxy blocking DNS

Troubleshooting:
  - Check your internet connection
  - Try opening https://github.com in your browser
  - If behind a corporate firewall, check proxy settings
  - Try using a different DNS (e.g., 8.8.8.8)

Original error: ${error.message}`);
		}
	}
	/**
	* Fetch all open issues from the repository
	* 
	* @param owner 
	* @param repo 
	* @param state 
	* @returns 
	*/
	async fetchExistingIssues(owner, repo, state) {
		const issues = [];
		let page = 1;
		let hasMore = true;
		const spinner = this.command.spinner("Fetching existing open issues...").start();
		while (hasMore) try {
			const { data } = await useOctokit().issues.listForRepo({
				owner,
				repo,
				state: state || "open",
				per_page: 100,
				page
			});
			issues.push(...data.filter((issue) => !issue.pull_request));
			spinner.stop();
			hasMore = issues.length % 100 === 0 && data.length === 100;
			if (hasMore) page++;
			else hasMore = false;
		} catch (error) {
			hasMore = false;
			spinner.stop();
			this.command.warn(`ERROR: Failed to fetch existing issues: ${error.message}`);
			this.command.warn("INFO: Proceeding without duplicate check...");
		}
		spinner.succeed(`Found ${issues.length} existing issues.`);
		return issues;
	}
	/**
	* Handle GitHub API request errors
	* 
	* @param error 
	* @param owner 
	* @param repo 
	* @returns 
	*/
	requestError(error, owner, repo) {
		let errorMsg = error.message || "GitHub API error";
		if (error.status === 401) {
			errorMsg += "\n\nThis is an authentication error. Check that:";
			errorMsg += `\n  1. You are logged in (make sure to run the ${__h3ravel_shared.Logger.log("login", ["grey", "italic"], !1)}`;
			errorMsg += "command first)";
			errorMsg += "\n  2. The app token has \"repo\" scope";
			errorMsg += "\n  3. The app token hasn't expired";
		} else if (error.status === 404) {
			errorMsg += "\n\nRepository not found. Check that:";
			if (owner) errorMsg += `\n  1. ${__h3ravel_shared.Logger.log(owner, ["blue", "bold"], !1)} is a valid gitHub username or organization`;
			if (repo) errorMsg += `\n  2. ${__h3ravel_shared.Logger.log(repo, ["blue", "bold"], !1)} is the correct repository name`;
			errorMsg += "\n  3. You have access to this repository";
		} else if (error.status === 422) {
			errorMsg += "\n\nValidation failed. This usually means:";
			errorMsg += "\n  1. Issue data format is invalid";
			errorMsg += "\n  2. Labels don't exist in the repository";
			errorMsg += "\n  3. Assignees don't have access to the repository";
		}
		return new Error(errorMsg);
	}
};

//#endregion
//#region src/github/actions.ts
/**
* Delete an issue from a repository.
* 
* Github API does not support deleting issues via REST API.
* As a workaround, we will use the GraphQL API to delete the issue
* 
* @param owner 
* @param repo 
* @param issue_number 
*/
const deleteIssue = async (owner, repo, issue_number, node_id) => {
	const octokit = useOctokit();
	let issueId = node_id;
	if (!issueId) ({repository: {issue: {id: issueId}}} = await octokit.graphql(`
            query ($owner: String!, $repo: String!, $issue_number: Int!) {
                repository(owner: $owner, name: $repo) {
                    issue(number: $issue_number) {
                        id
                    }
                }
            }
        `, {
		owner,
		repo,
		issue_number
	}));
	await octokit.graphql(`
        mutation ($issueId: ID!) {
            deleteIssue(input: {issueId: $issueId}) {
                clientMutationId
            }
        }
    `, { issueId });
};

//#endregion
//#region src/Commands/IssuesCommand.ts
var IssuesCommand = class extends __h3ravel_musket.Command {
	signature = `issues
        { repo? : The full name of the repository (e.g., username/repo)}
    `;
	description = "Manage issues in the default repository.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const repo = read("default_repo");
		const repository = this.argument("repo", repo.full_name).split("/") ?? ["", ""];
		const spinner = this.spinner("Fetching issues...").start();
		try {
			let page = 1;
			const issues = [];
			do {
				const newIssues = await this.loadIssues(repository, page);
				issues.push(...newIssues);
				spinner.succeed(`${issues.length} issues fetched successfully.`);
				const choice = await this.choice("Select Issue", issues.map((issue) => ({
					name: `#${issue.number}: ${issue.state === "open" ? "🟢" : "🔴"} ${issue.title}`,
					value: String(issue.number)
				})).concat(issues.length === 20 ? [{
					name: "Load more issues",
					value: ">>"
				}] : []), 0);
				if (choice === ">>") page++;
				else {
					const issue = issues.find((issue$1) => String(issue$1.number) === choice);
					this.info(`#${issue.number}: ${issue.title}`).newLine();
					const action = await this.choice("Choose Action", [
						{
							name: "View Details",
							value: "view"
						},
						!issue.closed_at ? {
							name: "Close Issue",
							value: "close"
						} : null,
						issue.closed_at ? {
							name: "Reopen Issue",
							value: "reopen"
						} : null,
						{
							name: "Edit Issue",
							value: "edit"
						},
						{
							name: logger("Delete Issue", ["red", "italic"]),
							value: "delete"
						},
						{
							name: "Exit",
							value: "exit"
						}
					].filter((e) => !!e), 0);
					if (action === "view") {
						viewIssue(issue);
						this.newLine();
					} else if (action === "close") if (issue.state === "closed") this.warn("Issue is already closed.").newLine();
					else {
						spinner.start(`Closing issue #${issue.number}...`);
						await useOctokit().issues.update({
							owner: repository[0],
							repo: repository[1],
							issue_number: issue.number,
							state: "closed"
						});
						spinner.succeed(`Issue #${issue.number} closed successfully.`);
					}
					else if (action === "reopen") if (issue.state === "open") this.warn("Issue is already open.").newLine();
					else {
						spinner.start(`Reopening issue #${issue.number}...`);
						await useOctokit().issues.update({
							owner: repository[0],
							repo: repository[1],
							issue_number: issue.number,
							state: "open"
						});
						spinner.succeed(`Issue #${issue.number} reopened successfully.`);
					}
					else if (action === "edit") {
						const whatToEdit = await this.choice("What do you want to edit?", [{
							name: "Title",
							value: "title"
						}, {
							name: "Body",
							value: "body"
						}], 0);
						if (whatToEdit === "exit") return;
						const updates = {};
						if (whatToEdit === "title") updates.title = await this.ask("Enter new title:", issue.title);
						else if (whatToEdit === "body") updates.body = await this.editor("Edit issue body:", ".md", issue.body ?? "");
						if (Object.keys(updates).length > 0) {
							const seeder = new IssuesSeeder();
							spinner.start(`Updating issue #${issue.number}...`);
							await seeder.updateIssue(Object.assign({
								labels: issue.labels,
								assignees: issue.assignees
							}, updates), issue, ...repository);
							spinner.succeed(`Issue #${issue.number} updated successfully.`);
						} else this.info("No changes made to the issue.").newLine();
					} else if (action === "delete") {
						spinner.start(`Deleting issue #${issue.number}...`);
						await deleteIssue(repository[0], repository[1], issue.number, issue.node_id);
						spinner.succeed(`Issue #${issue.number} deleted successfully.`);
					} else if (action === "exit") return;
					return;
				}
			} while (issues.length === 20);
		} catch (error) {
			spinner.stop();
			this.error(error.message);
			return;
		}
	}
	async loadIssues(repository, page = 1) {
		let issues = [];
		({data: issues} = await useOctokit().issues.listForRepo({
			page,
			repo: repository[1],
			owner: repository[0],
			per_page: 20,
			state: "all"
		}));
		return issues.filter((issue) => !issue.pull_request);
	}
};

//#endregion
//#region src/Commands/IssuesDeleteCommand.ts
var IssuesDeleteCommand = class extends __h3ravel_musket.Command {
	signature = `issues:delete
        { repo? : The full name of the repository (e.g., username/repo)}
        {--dry-run : Simulate the deletion without actually deleting issues.}
    `;
	description = "Delete issues from the specified repository.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const repo = read("default_repo");
		const repository = this.argument("repo", repo.full_name).split("/") ?? ["", ""];
		const spinner = this.spinner("Fetching issues...").start();
		const isDryRun = this.option("dryRun", false);
		try {
			const issues = await this.loadIssues(repository);
			spinner.succeed(`${issues.length} issues fetched successfully.`);
			const choices = await this.checkbox(`Select Issue${isDryRun ? " (Dry Run)" : ""}`, issues.map((issue) => ({
				name: `#${issue.number}: ${issue.state === "open" ? "🟢" : "🔴"} ${issue.title}`,
				value: String(issue.number)
			})), true, void 0, 20);
			if (!await this.confirm(`Are you sure you want to delete the selected ${choices.length} issue(s)? ${isDryRun ? "(Dry Run - No changes will be made)" : "This action cannot be undone"}.`)) {
				this.info("Operation cancelled.");
				return;
			}
			for (const issue of issues.filter((issue$1) => choices.includes(String(issue$1.number)))) {
				spinner.start(`Deleting issue #${issue.number}...`);
				if (!isDryRun) {
					await deleteIssue(repository[0], repository[1], issue.number, issue.node_id);
					spinner.succeed(`Issue #${issue.number} deleted successfully.`);
				} else spinner.info(`Dry run: Issue #${issue.number} would be deleted.`);
			}
			this.success(`${choices.length} issue(s) deleted successfully.`);
		} catch (error) {
			spinner.stop();
			this.error(error.message);
			return;
		}
	}
	async loadIssues(repository) {
		let issues = [];
		({data: issues} = await useOctokit().issues.listForRepo({
			repo: repository[1],
			owner: repository[0],
			per_page: 20,
			state: "all"
		}));
		return issues.filter((issue) => !issue.pull_request);
	}
};

//#endregion
//#region src/Commands/IssuesSeedCommand.ts
var IssuesSeedCommand = class extends __h3ravel_musket.Command {
	signature = `issues:seed
        {directory=issues : The directory containing issue files to seed from.}
        {--r|repo? : The repository to seed issues into. If not provided, the default repository will be used.}
        {--dry-run : Simulate the deletion without actually deleting issues.}
    `;
	description = "Seed the database with issues from a preset directory.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const directory = (0, node_path.join)(process.cwd(), this.argument("directory", "issues"));
		const isDryRun = this.option("dryRun", false);
		const repo = read("default_repo");
		if (!repo) return void this.error(`ERROR: No default repository set. Please set a default repository using the ${logger("set-repo", ["grey", "italic"])} command.`);
		const seeder = new IssuesSeeder();
		try {
			const usernameRepo = this.option("repo", repo.full_name).split("/") ?? ["", ""];
			await seeder.checkConnectivity();
			await seeder.validateAccess(...usernameRepo);
			if (!(0, node_fs.existsSync)(directory)) {
				this.error(`ERROR: Issues directory not found: ${logger(directory, ["grey", "italic"])}`);
				return;
			}
			const issueFiles = seeder.getIssueFiles(directory);
			const existingIssues = await seeder.fetchExistingIssues(...usernameRepo, "all");
			const existingIssuePaths = new Set(existingIssues.map((i) => seeder.getFilePath(i.body ?? "")));
			const issues = issueFiles.map(seeder.processIssueFile.bind(seeder)).filter(Boolean);
			const toCreate = [];
			const toSkip = [];
			issues.forEach((issue) => {
				if (existingIssuePaths.has(issue.filePath)) {
					const existingIssue = existingIssues.find((ei) => ei.title.toLowerCase() === issue.title.toLowerCase());
					toSkip.push({
						issue,
						existingIssue
					});
				} else toCreate.push(issue);
			});
			if (toSkip.length > 0) {
				this.newLine().info("INFO: Issues to SKIP (already exist):");
				toSkip.forEach(({ issue, existingIssue }) => {
					logger(`  >  ${issue.title}`, "white", !0);
					logger(`     Existing: #${existingIssue.number} (${existingIssue.state})`, "white", !0);
				});
			}
			if (toCreate.length > 0) {
				this.newLine().info("INFO: Issues to CREATE:").newLine();
				toCreate.forEach((issue, index) => {
					logger(`${index + 1}. ${issue.title}`, "white", !0);
				});
				this.newLine();
			} else {
				this.newLine().success("INFO: No new issues to create. All issues already exist").newLine();
				__h3ravel_shared.Logger.log([["☑ Total files:", "white"], [issues.length.toString(), "blue"]], " ");
				__h3ravel_shared.Logger.log([["> Skipped:", "white"], [toSkip.length.toString(), "blue"]], " ");
				__h3ravel_shared.Logger.log([["± To create:", "white"], [toCreate.length.toString(), "blue"]], " ");
				this.newLine();
				return;
			}
			__h3ravel_shared.Logger.log([
				["⚠️ ", "white"],
				[" CONFIRM ", "bgYellow"],
				["This will create", "yellow"],
				[toCreate.length.toString(), "blue"],
				["new issues on GitHub.", "yellow"]
			], " ");
			if (toSkip.length > 0) this.info(`(Skipping ${toSkip.length} existing issues)`);
			if (await this.confirm(`Do you want to proceed?${isDryRun ? " (Dry Run - No changes will be made)" : ""}`)) {
				this.newLine();
				let created = 0;
				let failed = 0;
				const spinner = this.spinner("Creating issues...").start();
				for (const issue of toCreate) try {
					spinner.start(`Creating: ${issue.title}...`);
					if (!isDryRun) {
						const result = await seeder.createIssue(issue, ...usernameRepo);
						spinner.succeed(`Created #${result.number}: ${result.title}`);
						this.info(`URL: ${result.html_url}\n`);
					} else spinner.info(`Dry run: Issue ${logger(issue.title, ["cyan", "italic"])} would be created.`);
					created++;
					await wait(1e3);
				} catch (error) {
					this.error(`ERROR: Failed to create Issue: ${logger(issue.title, ["cyan", "italic"])}`);
					this.error(`ERROR: ${error.message}\n`);
					failed++;
				}
				spinner.succeed(`All ${toCreate.length} issues processed.`);
				__h3ravel_shared.Logger.log([
					["=========================", "white"],
					[`✔ Created: ${created}`, "white"],
					[`x Failed: ${failed}`, "white"],
					[`> Skipped: ${toSkip.length}`, "white"],
					[`☑ Total: ${issues.length}`, "white"],
					["========================", "white"]
				], "\n");
				this.newLine();
			}
		} catch (error) {
			this.error(error.message);
			return;
		}
	}
};

//#endregion
//#region src/Commands/IssuesUpdateCommand.ts
var IssuesUpdateCommand = class extends __h3ravel_musket.Command {
	signature = `issues:update
        {directory=issues : The directory containing issue files to seed from.}
        {--r|repo? : The repository to seed issues into. If not provided, the default repository will be used.}
        {--dry-run : Simulate the deletion without actually deleting issues.}
    `;
	description = "Seed the database with updated issues from a preset directory.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const directory = (0, node_path.join)(process.cwd(), this.argument("directory", "issues"));
		const isDryRun = this.option("dryRun", false);
		const repo = read("default_repo");
		if (!repo) return void this.error(`ERROR: No default repository set. Please set a default repository using the ${logger("set-repo", ["grey", "italic"])} command.`);
		const seeder = new IssuesSeeder();
		try {
			const usernameRepo = this.option("repo", repo.full_name).split("/") ?? ["", ""];
			await seeder.checkConnectivity();
			await seeder.validateAccess(...usernameRepo);
			if (!(0, node_fs.existsSync)(directory)) {
				this.error(`ERROR: Issues directory not found: ${logger(directory, ["grey", "italic"])}`);
				return;
			}
			const issueFiles = seeder.getIssueFiles(directory);
			const existingIssues = await seeder.fetchExistingIssues(...usernameRepo, "all");
			const existingIssuePaths = new Set(existingIssues.map((i) => seeder.getFilePath(i.body ?? "")));
			const issues = issueFiles.map(seeder.processIssueFile.bind(seeder)).filter(Boolean);
			const toSkip = [];
			const toUpdate = [];
			issues.forEach((issue) => {
				if (existingIssuePaths.has(issue.filePath)) {
					const existingIssue = existingIssues.find((ei) => seeder.getFilePath(ei.body ?? "") === issue.filePath);
					toUpdate.push({
						issue,
						existingIssue
					});
				} else toSkip.push(issue);
			});
			if (toSkip.length > 0) {
				this.newLine().info("INFO: Issues to SKIP (not created):");
				toSkip.forEach((issue, index) => {
					logger(`${index + 1}. ${issue.title}`, "white", !0);
					logger(`   File: ${issue.filePath} (${issue.type})`, "white", !0);
				});
			}
			if (toUpdate.length > 0) {
				this.newLine().info("INFO: Issues to UPDATE:").newLine();
				toUpdate.forEach(({ issue, existingIssue }) => {
					logger(`  >  ${diffText(issue.title, existingIssue.title)}`, "white", !0);
					logger(`     Existing: #${existingIssue.number} (${existingIssue.state})`, "white", !0);
				});
				this.newLine();
			} else {
				this.newLine().success("INFO: No issues to update. All issues are up to date").newLine();
				__h3ravel_shared.Logger.log([["☑ Total files:", "white"], [issues.length.toString(), "blue"]], " ");
				__h3ravel_shared.Logger.log([["> Skipped:", "white"], [toSkip.length.toString(), "blue"]], " ");
				__h3ravel_shared.Logger.log([["± To update:", "white"], [toUpdate.length.toString(), "blue"]], " ");
				this.newLine();
				return;
			}
			__h3ravel_shared.Logger.log([
				["⚠️ ", "white"],
				[" CONFIRM ", "bgYellow"],
				["This will update", "yellow"],
				[toUpdate.length.toString(), "blue"],
				["existing issues on GitHub.", "yellow"]
			], " ");
			if (toSkip.length > 0) this.info(`(Skipping ${toSkip.length} existing issues)`);
			if (await this.confirm(`Do you want to proceed?${isDryRun ? " (Dry Run - No changes will be made)" : ""}`)) {
				this.newLine();
				let updated = 0;
				let failed = 0;
				const spinner = this.spinner("Updating issues...").start();
				for (const { issue, existingIssue } of toUpdate) try {
					spinner.start(`Updating: ${issue.title}...`);
					if (!isDryRun) {
						const result = await seeder.updateIssue(issue, existingIssue, ...usernameRepo);
						spinner.succeed(`Updated #${result.number}: ${result.title}`);
						this.info(`URL: ${result.html_url}\n`);
					} else spinner.info(`Dry run: Issue ${logger(issue.title, ["cyan", "italic"])} would be updated.`);
					updated++;
					await wait(1e3);
				} catch (error) {
					this.error(`ERROR: Failed to update Issue: ${logger(issue.title, ["cyan", "italic"])}`);
					this.error(`ERROR: ${error.message}\n`);
					failed++;
				}
				spinner.succeed(`All ${toUpdate.length} issues processed.`);
				__h3ravel_shared.Logger.log([
					["=========================", "white"],
					[`✔ Updated: ${updated}`, "white"],
					[`x Failed: ${failed}`, "white"],
					[`> Skipped: ${toSkip.length}`, "white"],
					[`☑ Total: ${issues.length}`, "white"],
					["========================", "white"]
				], "\n");
				this.newLine();
			}
		} catch (error) {
			this.error(error.message);
			return;
		}
	}
};

//#endregion
//#region src/config.ts
const config = {
	CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	CLIENT_TYPE: "oauth-app",
	SCOPES: [
		"repo",
		"read:user",
		"user:email"
	]
};

//#endregion
//#region src/Github.ts
/**
* Sign in user
* 
* @returns
*/
async function signIn() {
	const [cmd] = useCommand();
	const command = cmd();
	let spinner = command.spinner("Requesting device code...").start();
	const { data: { device_code, user_code, verification_uri, interval } } = await (0, __octokit_oauth_methods.createDeviceCode)({
		clientType: config.CLIENT_TYPE,
		clientId: config.CLIENT_ID,
		scopes: config.SCOPES
	});
	spinner.succeed("Device code created");
	__h3ravel_shared.Logger.log([["Your authentication code is", "white"], [`\n\t ${user_code} \n`, ["white", "bgBlue"]]], " ");
	__h3ravel_shared.Logger.log([["Please open the following URL in your browser to authenticate:", "white"], [verification_uri, ["cyan", "underline"]]], " ");
	__h3ravel_shared.Logger.log([
		["Press Enter to open your browser, or ", "white"],
		["Ctrl+C", ["grey", "italic"]],
		[" to cancel", "white"]
	], " ");
	await waitForEnter(async () => {
		try {
			if ((0, os.type)() === "Windows_NT") await (0, open.default)(verification_uri, {
				wait: true,
				app: { name: open.apps.browser }
			});
			else await (0, open.default)(verification_uri, { wait: true });
		} catch (error) {
			command.error("Error opening browser:" + error.message);
			command.info("Please manually open the following URL in your browser:");
			command.info(verification_uri);
			await wait(3e3);
		}
	});
	const currentInterval = interval;
	let remainingAttempts = 150;
	spinner = command.spinner("Waiting for authorization...").start();
	while (true) {
		remainingAttempts -= 1;
		if (remainingAttempts < 0) throw new Error("User took too long to respond");
		try {
			const { authentication } = await (0, __octokit_oauth_methods.exchangeDeviceCode)({
				clientType: "oauth-app",
				clientId: config.CLIENT_ID,
				code: device_code,
				scopes: config.SCOPES
			});
			const { data: user } = await new __octokit_rest.Octokit({ auth: authentication.token }).request("/user");
			if (typeof spinner !== "undefined") spinner.succeed("Authorization successful");
			return {
				authentication,
				user
			};
		} catch (error) {
			if (error.status === 400) {
				const errorCode = error.response.data.error;
				if (["authorization_pending", "slow_down"].includes(errorCode)) await wait(currentInterval * 3e3);
				else if ([
					"expired_token",
					"incorrect_device_code",
					"access_denied"
				].includes(errorCode)) throw new Error(errorCode);
				else throw new Error(`An unexpected error occurred: ${error.message}`);
			} else throw new Error(`An unexpected error occurred: ${error.message}`);
		}
	}
}
/**
* Store login details
*
* @param payload
*/
function storeLoginDetails({ authentication: payload, user }) {
	write("user", user);
	write("token", payload.token);
	write("scopes", payload.scopes);
	write("clientId", payload.clientId);
	write("clientType", payload.clientType);
}
/**
* Clear authentication details
*/
function clearAuth() {
	remove("token");
	remove("scopes");
	remove("clientId");
	remove("clientType");
}

//#endregion
//#region src/Commands/LoginCommand.ts
var LoginCommand = class extends __h3ravel_musket.Command {
	signature = "login";
	description = "Log in to Grithub";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		let token = read("token"), user;
		if (token) {
			this.info("INFO: You're already logged in").newLine();
			return;
		} else {
			const [_$1, response] = await promiseWrapper(signIn());
			if (response) {
				storeLoginDetails(response);
				token = read("token");
				user = read("user");
			}
		}
		if (token && user) {
			const repos = await useOctokit().rest.repos.listForAuthenticatedUser();
			const repoName = await this.choice("Select default repository", repos.data.map((r) => ({
				name: r.full_name,
				value: r.full_name
			})), 0);
			const repo = repos.data.find((r) => r.full_name === repoName);
			if (repo) write("default_repo", {
				id: repo.id,
				name: repo.name,
				full_name: repo.full_name,
				private: repo.private
			});
			else write("default_repo", {});
			this.info(`INFO: You have been logged in as ${__h3ravel_shared.Logger.log(user.name, "blue", !1)}!`).newLine();
		}
		process.exit(0);
	}
};

//#endregion
//#region src/Commands/LogoutCommand.ts
var LogoutCommand = class extends __h3ravel_musket.Command {
	signature = "logout";
	description = "Log out of Grithub CLI";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const spinner = this.spinner("Logging out...").start();
		try {
			await wait(1e3, () => clearAuth());
			spinner.succeed("Logged out successfully");
		} catch (error) {
			spinner.fail("Logout failed");
			this.error("An error occurred during logout: " + error.message);
		}
		this.newLine();
	}
};

//#endregion
//#region src/Commands/SetRepoCommand.ts
var SetRepoCommand = class extends __h3ravel_musket.Command {
	signature = `set-repo 
        { name? : The full name of the repository (e.g., username/repo)}
        {--O|org : Set repository from an organization}
    `;
	description = "Set the default repository.";
	async handle() {
		const [_, setCommand] = useCommand();
		setCommand(this);
		const token = read("token");
		let repo = void 0;
		if (!token) return void this.error("ERROR: You must be logged in to set a default repository.");
		if (this.argument("name")) ({data: repo} = await useOctokit().rest.repos.get({
			owner: this.argument("name").split("/")[0],
			repo: this.argument("name").split("/")[1]
		}));
		else if (this.option("org")) {
			const spinner = this.spinner("Fetching your organizations...").start();
			const orgs = await useOctokit().rest.orgs.listForAuthenticatedUser();
			spinner.succeed(`${orgs.data.length} organizations fetched successfully.`);
			const orgName = await this.choice("Select organization", orgs.data.map((o) => ({
				name: o.login,
				value: o.login
			})), 0);
			const orgReposSpinner = this.spinner(`Fetching repositories for organization ${orgName}...`).start();
			const repos = await useOctokit().rest.repos.listForOrg({ org: orgName });
			orgReposSpinner.succeed(`${repos.data.length} repositories fetched successfully.`);
			const repoName = await this.choice(`Select default repository (${read("default_repo")?.full_name ?? "none"})`, repos.data.map((r) => ({
				name: r.full_name,
				value: r.full_name
			})), 0);
			repo = repos.data.find((r) => r.full_name === repoName);
		} else {
			const spinner = this.spinner("Fetching your repositories...").start();
			const repos = await useOctokit().rest.repos.listForAuthenticatedUser();
			spinner.succeed(`${repos.data.length} repositories fetched successfully.`);
			const repoName = await this.choice(`Select default repository (${read("default_repo")?.full_name ?? "none"})`, repos.data.map((r) => ({
				name: r.full_name,
				value: r.full_name
			})), 0);
			repo = repos.data.find((r) => r.full_name === repoName);
		}
		if (repo) {
			write("default_repo", {
				id: repo.id,
				name: repo.name,
				full_name: repo.full_name,
				private: repo.private
			});
			this.info(`INFO: ${__h3ravel_shared.Logger.log(repo.full_name, "blue", !1)} has been set as the default repository.`).newLine();
		} else {
			write("default_repo", read("default_repo") ?? {});
			this.warn("INFO: No repository selected. Default repository has been cleared.").newLine();
		}
	}
};

//#endregion
//#region src/axios.ts
const api = axios.default.create({
	baseURL: "https://api.github.com",
	headers: { "Content-Type": "application/json" }
});
/**
* Initialize Axios with configuration from the application settings.
*/
const initAxios = () => {
	const [getConfig] = useConfig();
	const config$1 = getConfig();
	api.defaults.baseURL = config$1.apiBaseURL || "https://api.github.com";
	api.defaults.timeout = config$1.timeoutDuration || 3e3;
};
/**
* Log the full request details if we are not in production
* @param config 
* @returns 
*/
const logInterceptor = (config$1) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) {
		if (conf.debug || v >= 2) {
			console.log("Request URL:", config$1.url);
			console.log("Request Method:", config$1.method);
		}
		if (conf.debug || v == 3) {
			console.log("Request Headers:", config$1.headers);
			console.log("Request Data:", config$1.data);
		}
		console.log("Error Response URL:", axios.default.getUri(config$1));
	}
	return config$1;
};
/**
* Log only the relevant parts of the response if we are in not in production
* 
* @param response 
* @returns 
*/
const logResponseInterceptor = (response) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) {
		const { data, status, statusText, headers } = response;
		if (conf.debug || v >= 2) {
			console.log("Response Data:", data);
			console.log("Response Status:", status);
		}
		if (conf.debug || v === 3) {
			console.log("Response Status Text:", statusText);
			console.log("Response Headers:", headers);
		}
		console.log("Error Response URL:", axios.default.getUri(response.config));
	}
	return response;
};
const logResponseErrorInterceptor = (error) => {
	const [getConfig] = useConfig();
	const [command] = useCommand();
	const conf = getConfig();
	const v = command().getVerbosity();
	if (conf.debug || v > 1) if (error.response) {
		const { data, status, headers } = error.response;
		if (conf.debug || v >= 2) {
			console.log("Error Response Data:", data);
			console.log("Error Response Status:", status);
		}
		if (conf.debug || v === 3) console.log("Error Response Headers:", headers);
		console.log("Error Response URL:", axios.default.getUri(error.config));
	} else console.log("Error Message:", error.message);
	return Promise.reject(error);
};
api.interceptors.request.use(logInterceptor, (error) => Promise.reject(error));
api.interceptors.response.use(logResponseInterceptor, logResponseErrorInterceptor);

//#endregion
//#region src/logo.ts
var logo_default = `
▄▖      ▗     ▌   ▄▖▖ ▄▖
▙▌▀▌▌▌▛▘▜▘▀▌▛▘▙▘  ▌ ▌ ▐ 
▌ █▌▙▌▄▌▐▖█▌▙▖▛▖  ▙▖▙▖▟▖
    ▄▌                                                                                        
`;

//#endregion
//#region src/cli.ts
var Application = class {};
initAxios();
__h3ravel_musket.Kernel.init(new Application(), {
	logo: logo_default,
	exceptionHandler(exception) {
		const [getConfig] = useConfig();
		const config$1 = getConfig();
		console.error(config$1.debug ? exception : exception.message);
	},
	baseCommands: [
		InfoCommand,
		InitCommand,
		LoginCommand,
		LogoutCommand,
		ConfigCommand,
		IssuesCommand,
		SetRepoCommand,
		IssuesSeedCommand,
		IssuesUpdateCommand,
		IssuesDeleteCommand,
		GenerateApisCommand,
		...Commands_default()
	]
});

//#endregion