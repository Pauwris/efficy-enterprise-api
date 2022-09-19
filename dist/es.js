/**
 * Class to define the parameters of the Efficy Enterprise server
 */
class CrmEnv {
	#name = "CrmEnv";
	#isNode = (typeof process !== "undefined" && process?.versions?.node ? true : false);
	#isEfficy = false;

	/**
	 * Create a Crm Environment. Set null when executed from browser
	 * @param {Object} [env] - The definition object of the targeted CRM environment
	 * @param {string} [env.url=""] - The URL of Efficy Enterprise, e.g. https://mycompany.efficy.cloud/. Set null when executed from browser
	 * @param {string} [env.customer=""] - The optional customer profile name
	 * @param {boolean} [env.logOff=false] - if true, logoff the session after the next executeBatch();
	 * @param {string} [env.apiKey=""] - The API Key, if user and password are not used
	 * @param {string} [env.user=""] - The user credential
	 * @param {string} [env.pwd=""] - The password credential
	 * @param {array} [env.cookies=[]] - Optional cookie setting
	 * @example
	 * new CrmEnv({
	 *    "url": "https://mycompany.efficy.cloud/",
	 *    "apiKey": "86E353284C0C4A848F7ADEA13589C8B6"
	 * });
	 * @tutorial CRM Environment
	 */
	constructor(env) {
		if (typeof env === "object") {
			this.setEnv(env);
		} else {
			this.#isEfficy = true;
			this.setEnv({
				url: window.location.origin
			});
		}

		this.#validate();
	}

	/**
	 * Update the Crm Environment set by the constructor
	 * @param {Object} env - The definition object of the targeted CRM environment
	 * @param {string} [env.url=""] - The URL of Efficy Enterprise, e.g. https://mycompany.efficy.cloud/. Leave empty when executed from browser
	 * @param {string} [env.customer=""] - The optional customer profile name
	 * @param {boolean} [env.logOff=false] - if true, logoff the session after the next executeBatch();
	 * @param {string} [env.apiKey=""] - The API Key, if user and password are not used
	 * @param {string} [env.user=""] - The user credential
	 * @param {string} [env.pwd=""] - The password credential
	 * @param {array} [env.cookies=[]] - Optional cookie setting
	 */
	setEnv(env) {
		this.url = env.url || ""; // e.g. "https://customer.efficy.com";
		this.customer = env.customer || "";
		this.logOff = typeof env.logOff === "boolean" ? env.logOff : false;

		// Sensitive properties
		this.apiKey = env.apiKey || "";
		this.user = env.user || "";
		this.pwd = env.pwd || "";
		this.cookies = env.cookies || [];

		// Replace last "/" with "";
		this.url = this.url.replace(/\/$/,"");

		this.#validate();
	}

	#validate() {
		if (!this.#isEfficy && !this.user && !this.apiKey) throw new TypeError(`${this.#name}.validate::apiKey or user are not specified`);
	}

	/**
	 * Returns true if this code runs in node.js
	 * @type {boolean}
	 */
	get isNode() {
		return this.#isNode;
	}

	/**
	 * Returns true if this code runs on the browser
	 * @type {boolean}
	 */
	get isEfficy() {
		return this.#isEfficy;
	}

	/**
	 * Returns the request header "cookie", e.g. 'EfficySession=3B826396-22AE9698'
	 * @type {string}
	 */
	get cookieHeader() {
		if (Array.isArray(this.cookies)) {
			const header = this.cookies
				.filter(cookie => new Date() < new Date(cookie.expires))
				.map(cookie => [cookie.name, cookie.value].join("=")).join("; ");

			return header;
		}
		return "";
	}

	/**
	 * Returns the session ID, e.g. '3B826396-22AE9698'
	 * @type {string}
	 */
	get sessionId() {
		return Array.isArray(this.cookies) && this.cookies.length > 0 ? this.cookies[0].value: "";
	}

	/**
	 * Returns the first part of the session ID, e.g. '3B826396'
	 * @type {string}
	 */
	get shortSessionId() {
		return this.sessionId.split("-")[0];
	}
}

var nodeFetch = {};

/*
The MIT License (MIT)

Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var defaultParseOptions = {
	decodeValues: true,
	map: false,
	silent: false,
};

function isNonEmptyString(str) {
	return typeof str === "string" && !!str.trim();
}

function parseString(setCookieValue, options) {
	var parts = setCookieValue.split(";").filter(isNonEmptyString);
	var nameValue = parts.shift().split("=");
	var name = nameValue.shift();
	var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part

	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	try {
		value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
	} catch (e) {
		console.error(
			"set-cookie-parser encountered an error while decoding a cookie with value '" +
			value +
			"'. Set options.decodeValues to false to disable this feature.",
			e
		);
	}

	var cookie = {
		name: name, // grab everything before the first =
		value: value,
	};

	parts.forEach(function (part) {
		var sides = part.split("=");
		var key = sides.shift().trimLeft().toLowerCase();
		var value = sides.join("=");
		if (key === "expires") {
			cookie.expires = new Date(value);
		} else if (key === "max-age") {
			cookie.maxAge = parseInt(value, 10);
		} else if (key === "secure") {
			cookie.secure = true;
		} else if (key === "httponly") {
			cookie.httpOnly = true;
		} else if (key === "samesite") {
			cookie.sameSite = value;
		} else {
			cookie[key] = value;
		}
	});

	return cookie;
}

function parse(input, options) {
	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	if (!input) {
		if (!options.map) {
			return [];
		} else {
			return {};
		}
	}

	if (input.headers && input.headers["set-cookie"]) {
		// fast-path for node.js (which automatically normalizes header names to lower-case
		input = input.headers["set-cookie"];
	} else if (input.headers) {
		// slow-path for other environments - see #25
		var sch =
			input.headers[
			Object.keys(input.headers).find(function (key) {
				return key.toLowerCase() === "set-cookie";
			})
			];
		// warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
		if (!sch && input.headers.cookie && !options.silent) {
			console.warn(
				"Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
			);
		}
		input = sch;
	}
	if (!Array.isArray(input)) {
		input = [input];
	}

	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	if (!options.map) {
		return input.filter(isNonEmptyString).map(function (str) {
			return parseString(str, options);
		});
	} else {
		var cookies = {};
		return input.filter(isNonEmptyString).reduce(function (cookies, str) {
			var cookie = parseString(str, options);
			cookies[cookie.name] = cookie;
			return cookies;
		}, cookies);
	}
}

/**
 * Find and return first (deep) nested object when all properties of the provided searchObject are equal
 * Inspired by https://pretagteam.com/question/finding-an-object-deep-in-a-nested-json-object
 * @param {object|Array} object
 * @param {object} searchObject
 * @returns {object}
 */
function findDeep(object, searchObject) {
	if (typeof searchObject !== 'object') throw new TypeError('findDeep::searchObject is not an object')

	if (Array.isArray(object)) {
		for (const obj of object) {
			const result = findDeep(obj, searchObject);
			if (result) return result;
		}
	} else if (typeof object === "object") {
		let matched = true;
		Object.keys(searchObject).filter(key => {
			if (!object.hasOwnProperty(key) || object[key] !== searchObject[key]) {
				matched = false;
			}
		});
		if (matched) return object;

		for (const k of Object.keys(object)) {
			if (typeof object[k] === "object") {
				const o = findDeep(object[k], searchObject);
				if (o !== null && typeof o !== 'undefined')
				return o;
			}
		}

		return null;
	}
}

/**
 * Class with low-level JSON RPC functions
 * @see {@link https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser}
 * @property {CrmEnv} crmEnv
 * @property {array} remoteObjects
 * @property {number} requestCounter
 * @property {number} threadId
 * @property {object} lastResponseObject
 * @property {function} logFunction
 * @property {function} errorFunction
 */
class RemoteAPI {
	#name = "RemoteAPI";
	crmEnv;
	remoteObjects;
	requestCounter = 0;
	threadId = 1;
	lastResponseObject;
	logFunction;
	errorFunction;

	/**
	 * Construct a RemoteAPI object
	 * @param {CrmEnv} [crmEnv=undefined] - When empty, uses the Efficy context of the browser
	 * @param {function} [logFunction=undefined] - Your (custom) log function to call for requests and responses, e.g. console.log
	 * @param {number} [threadId=undefined] - Unique thread ID for logging purposes
	 */
	constructor(crmEnv = new CrmEnv(), logFunction, threadId) {
		if (crmEnv && typeof crmEnv !== "object") throw new TypeError(`${this.#name}.constructor::crmEnv is not an Object`);
		if (logFunction && typeof logFunction !== "function") throw new TypeError(`${this.#name}.constructor::logFunction is not a function`);
		if (threadId) this.threadId = threadId;

		this.crmEnv = crmEnv;
		this.remoteObjects = [];
		this.logFunction = logFunction;

		this.#setFetchOptions();
	}

	#setFetchOptions() {
		try {
			if (this.crmEnv.apiKey) {
				this.#fetchOptions.headers["X-Efficy-ApiKey"] = this.crmEnv.apiKey;
			} else if (this.crmEnv.user && this.crmEnv.pwd) {
				this.#fetchOptions.headers["X-Efficy-User"] = this.crmEnv.user;
				this.#fetchOptions.headers["X-Efficy-Pwd"] = this.crmEnv.pwd;
			}

			if (this.crmEnv.logOff) {
				this.#fetchOptions.headers["X-Efficy-Logoff"] = true;
			}
		} catch(ex) {
			this.throwError(`${this.#name}.readEnv::${ex.message}`);
		}
	}

	#fetchOptions = {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
	}

	/**
	 * Execute all assembled and queued RPC operations
	 */
	async executeBatch() {
		const requestObject = [];
		const responseObject = [];

		try {
			requestObject.push(...this.remoteObjects.map(item => item.asJsonRpc()));
		} catch(ex) {
			this.throwError(`${this.#name}.executeBatch::asJsonRpc\n${ex.message}`);
		}

		// Nothing to execute, ignore silently
		if (!requestObject.length) return;

		try {
			const response = await this.post(requestObject);
			if (Array.isArray(response)) {
				// Do nothing, all good!
			} else if (typeof response === "object" && this.getRpcException(response)) {
				const ex = this.getRpcException(response);
				this.throwError(`${ex["#error"].errorcode} - ${ex["#error"].errorstring}`);
			} else if (!response) {
				throw new TypeError(`${this.#name}.executeBatch::empty response`);
			} else {
				throw new TypeError(`${this.#name}.executeBatch::responseObject is not an Array`);
			}
			responseObject.push(...response);
			this.lastResponseObject = responseObject;
		} catch(ex) {
			this.throwError(`${this.#name}.executeBatch::${ex.message}`);
		}

		// Add response info to operations and remove executed operations (handled or not)
		const items = this.remoteObjects;
		var index = items.length;
		while (index--) {
			const operation = items[index];
			const respOper = responseObject.find(respOper => respOper["#id"] === operation.id);
			if (!respOper)
			this.throwError(`${this.#name}.executeBatch::cannot find response for queued operation [${index}/${items.length}]`);
			Object.assign(operation.responseObject, respOper);
			operation.afterExecute();
			items.splice(index, 1);
		}

		// Error handling
		const ex = this.getRpcException(responseObject);
		if (ex) this.throwError(`${ex["#error"].errorcode} - ${ex["#error"].errorstring}`);
	}

	throwError(message) {
		if (typeof this.errorFunction === "function") {
			this.errorFunction(message);
		} else {
			throw Error(message);
		}
	}

	/**
	 * Logoff the remote session, not possible when crmEnv.isEfficy === true
	 */
	logoff() {
		if (this.crmEnv.isEfficy) {
			this.throwError(`${this.#name}.logoff::method disable for this environment`);
		}
		this.crmEnv.logOff = true;
		this.#setFetchOptions();
	}

	/** @private */
	registerObject(object) {
		this.remoteObjects.push(object);
	}

	/** @private */
	async post(requestObject) {
		var response, responseBody, responseObject;

		try {
			const request = Object.assign(this.#fetchOptions, {body: JSON.stringify(requestObject)});
			const requestUrl = `${this.crmEnv.url}/crm/json${this.crmEnv.customer ? "?customer=" + encodeURIComponent(this.crmEnv.customer) : ""}`;

			const rql = new RequestLog(this.requestCounter++, this.logFunction, this.threadId);
			rql.setRequest(requestUrl, request.method, requestObject);
			if (this.crmEnv.cookieHeader) {
				request.headers["Cookie"] = this.crmEnv.cookieHeader;
				rql.sessionId = this.crmEnv.shortSessionId;
			}


			rql.log();
			response = await fetch(requestUrl, request);
			try {
				responseBody = await response.text();
				responseObject = JSON.parse(responseBody || "[]");
			} catch(ex) {
				this.throwError(`invalid JSON response from resource '${requestUrl}'`);
			}

			rql.setResponse(response, responseObject);
			rql.exception = this.getRpcException(responseObject);

			// @ts-ignore
			if (typeof response.headers.raw === "function") {
				const cookies = parse(response.headers.raw()['set-cookie'], null);
				if (cookies.length > 0) {
					this.crmEnv.cookies = cookies;
					this.sessionId = this.crmEnv.shortSessionId;
				}
			}

			rql.log();

			if (rql.exception?.error === true) {
				const ex = rql.exception;
				this.throwError(`/json: ${ex?.code || ex?.errorcode} - ${ex?.message || ex?.errorstring} - ${ex?.detail}`);
			}

			return responseObject;
		} catch(ex) {
			this.throwError(`${this.#name}.post::${ex.message}`);
		}
	}


	/** @private */
	findDataSetArray(resp, dataSetName = "dataset") {
		if (typeof resp !== "object") return;

		const result = findDeep(resp, {"#class": dataSetName});
		if (!result || !Array.isArray(result["#data"])) return;

		return result["#data"];
	}
	findListArray(resp, listName = "stringlist") {
		return this.findDataSetArray(resp, listName);
	}
	/** @private */
	findAttachment(resp, key) {
		if (typeof resp !== "object") return;
		return findDeep(resp, {"@name": "attachment", "key": key});
	}
	/** @private */
	findFunc(resp, name) {
		if (typeof resp !== "object" || !Array.isArray(resp["@func"])) return;
		return resp["@func"].find(item => item["@name"] === name);
	}
	/** @private */
	findFunc2(resp, name, name2, value2) {
		if (typeof resp !== "object" || !Array.isArray(resp["@func"])) return;
		return resp["@func"].find(item => item["@name"] === name && item[name2] === value2);
	}
	/** @private */
	findFuncArray(resp, name) {
		var result = this.findDataSetArray(this.findFunc(resp, name));
		return Array.isArray(result) ? result : null;
	}
	/** @private */
	findFuncArray2(resp, name, name2, value2) {
		var result = this.findDataSetArray(this.findFunc2(resp, name, name2, value2));
		return Array.isArray(result) ? result : null;
	}
	/** @private */
	findFuncCategoryArray(resp, category) {
		var result = this.findDataSetArray(this.findFunc2(resp, "category", "category", category));
		return Array.isArray(result) ? result : null;
	}
	/** @private */
	findFuncDetailArray(resp, detail) {
		var result = this.findDataSetArray(this.findFunc2(resp, "detail", "detail", detail));
		return Array.isArray(result) ? result : null;
	}
	/** @private */
	getRpcException(responseObject) {
		if (Array.isArray(responseObject)) {
			return responseObject.find(operation => operation["@name"] === "exception");
		} else if (typeof responseObject === "object" && typeof responseObject["#error"] === "object") {
			const errorObject = responseObject["#error"];
			errorObject.error = true;
			return errorObject;
		} else if (typeof responseObject === "object" && responseObject["error"] === true) {
			return {
				"#error": {
					error: true,
					errorcode: responseObject.code,
					errorstring: responseObject.message
				}
			}
		}
	}
}
class RequestLog {
	d_request = new Date();
	d_response;
	elapsed_ms;
	sessionId;
	requestId;

	method = "";
	statusCode = 0;
	statusText = "";
	requestUrl = "";
	exception;

	// Not exposed when doing JSON.stringify(this)
	#requestObject;
	#responseObject;
	#logFunc;

	constructor(id, logFunction, threadId) {
		this.requestId = id;
		this.#logFunc = logFunction;
		this.threadId = threadId;
	}

	get requestObject() {
		return this.#requestObject;
	}
	get responseObject() {
		return this.#responseObject;
	}
	countFuncItems(rpcObject) {
		return Array.isArray(rpcObject) && rpcObject.length > 0 && Array.isArray(rpcObject[0]["@func"]) ? rpcObject[0]["@func"].length : 0;
	}

	setRequest(url, method, requestObject) {
		this.requestUrl = url;
		this.method = method;
		this.#requestObject = requestObject;
	}
	setResponse(resp, responseObject) {
		this.d_response = new Date();
		this.statusCode = parseInt(resp.status, 10);
		this.statusText = resp.statusText;
		this.elapsed_ms = this.d_response.getTime() - this.d_request.getTime();
		this.#responseObject = this.#cloneAndClean(responseObject);
	}

	log() {
		const prefix = `${this.threadId},${this.method}-${[this.requestId]}`;

		if (typeof this.#logFunc === "function") {
			if (this.statusCode > 0) {
				this.#logFunc(`<${prefix},${this.statusCode} ${this.statusText} (${this.elapsed_ms} ms)${this.sessionId ? `,${this.sessionId}`: ","}${this.exception ? ",EXCEPTION_RPC": ""}`, this);
			} else {
				this.#logFunc(`>${prefix},FUNCS-${this.countFuncItems(this.#requestObject)}`, this);
			}
		}

	}

	#cloneAndClean(object) {
		const data = JSON.parse(JSON.stringify(object));

		// Remove long data strings -> TODO, clean multiple hits
		const result = findDeep(data, {"encodingkind": "MIME64"});
		if (result && typeof result["@data"] === "string" && result["@data"].length > 100) {
			result["@data"] = "**CLEANED**";
		}

		return data;
	}
}
/*
 * Platform agnostic solution for the definition of fetch. Lib node-fetch is excluded by rollup ignore plugin
 */
const isNode = (typeof process !== "undefined" && process?.versions?.node ? true : false);
if (isNode) {
	// @ts-ignore
	globalThis.fetch = nodeFetch;
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

// Variables that are primitive are accessed by value
const isPrimitive = (val) => {
	return val !== Object(val);
};

const ParseGentle = {
	fieldsObj(inputObj) {
		const outputObj = {};
		if (!inputObj || typeof inputObj !== "object" || Array.isArray(inputObj)) return outputObj;
		Object.keys(inputObj).forEach(key => {
			if (isPrimitive(inputObj[key])) {
				outputObj[key] = inputObj[key];
			}
		});
		return outputObj;
	},
	toFloatKey(key) {
		return parseFloat(key) || 0;
	},
	numberProperties(object, numberProperties) {
		numberProperties.forEach(name => {
			if (object[name] && isNaN(parseFloat(object[name])) === false) {
				object[name] = parseFloat(object[name]);
			}
		});

		return object;
	}
};

const ParseHard = {
	isFieldValue(value) {
		if (isPrimitive(value) === false) throw new TypeError(`ParseHard.isFieldValue::argument 'value' is not a primitive value`);
	}
};

/**
 * Low level class representing an RPC operation
 */
class RemoteObject {
	#remoteAPI;

	/** @protected */
	requestObject;

	/** @protected */
	responseObject;

	/** @protected */
	id;

	constructor(remoteAPI) {
		this.#remoteAPI = remoteAPI;
		this.id = uuidv4();
		this.requestObject = {};
		this.responseObject = {};
	}

	/** @protected */
	get api() {
		return this.#remoteAPI;
	}

	/** @protected */
	afterExecute() {
		this.responseObject = ParseGentle.numberProperties(this.responseObject, ["edithandle", "key"]);
	}
}

/**
 * Class representing a remotely fetched DataSet
 */
class DataSet {
	name;
	type;
	tableView;

	#items;
	#item;

	constructor(type, name, filter, includeBlobContent) {
		if (!["main", "master", "detail", "category"].includes(type)) throw new TypeError("DataSet.constructor::invalid type");
		if (["detail", "category"].includes(type) && !name) throw new TypeError("DataSet.constructor::name must be specified");
		this.type = type;
		this.name = name;

		// Expect an SQL Expression string like: "K_FILE=123 and VERSION=0"
		this.filter = filter && typeof filter == "string" ? filter : undefined;
		this.includeBlobContent = typeof includeBlobContent === "boolean" ? includeBlobContent : false;
	}

	/**
	 * The to array converted dataset
	 * @type {array}
	 */
	get items() {
		return this.#items;
	}

	/**
	 * When exists, the first item of the items array, else null
	 * @type {array}
	 */
	get item() {
		return this.#item;
	}

	setItems(value) {
		if (!value) return;
		if (!Array.isArray(value)) throw new TypeError("DataSet.items::value is not an Array");

		this.#items = value;
		if (this.#items.length > 0) {
			this.#item = this.#items[0];
		}
	}

	get func() {
		const func = {};

		func["@name"] = this.type;
		if (this.name) func[this.type] = this.name;
		if (this.filter) func["filter"] = this.filter;
		if (this.tableView > 0) func["tableview"] = this.tableView;
		if (this.includeBlobContent) func["includeblobcontent"] = true;

		return func;
	};
}

/**
 * Represents a remotely fetched Efficy DataSet transformed as an array of row items
 * @extends RemoteObject
 */
class DataSetObject extends RemoteObject {
	#items;
	#item;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	dataSetName;

	/** @protected */
	afterExecute() {
		super.afterExecute();

		const dso = new DataSet("main");
		dso.setItems(this.api.findDataSetArray(this.responseObject, this.dataSetName));
		this.#items = dso.items;
		this.#item = dso.item;
	}

	/**
	 * The to array converted dataset
	 * @type {array}
	 */
	get items() {
		return this.#items;
	}

	/**
	 * When exists, the first item of the items array, else null
	 * @type {array}
	 */
	get item() {
		return this.#item;
	}
}

/**
 * Groups a list of DataSet operations that are shared between ConsultObject and EditObject
 * @extends {RemoteObject}
 */
class DataSetList extends RemoteObject {
	#master;
	#master1;
	#tableView;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.resetState();
	}

	/**
	 * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
	 * @returns {DataSetObject}
	 */
	getMasterDataSet(masterView = 0) {
		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		//return this.#master = new DataSet("master");

		if (masterView > 0) {
			this.#master1 = new DataSet("master");
			this.#master1.tableView = 1;
			return this.#master1;
		} else {
			this.#master = new DataSet("master");
			return this.#master;
		}
	}

	/**
	 * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
	 * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
	 * @returns {DataSetObject}
	 */
	getCategoryDataSet(categoryName) {
		if (typeof categoryName !== "string") throw new TypeError("DataSetList.getCategoryDataSet::categoryName is not a string");

		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		return this.#tableView["category"][categoryName] = new DataSet("category", categoryName);
	}

	/**
	 * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @returns {DataSetObject}
	 */
	getDetailDataSet(detail, filter, includeBlobContent) {
		if (typeof detail !== "string") throw new TypeError("DataSetList.getDetailDataSet::detail is not a string");
		if (filter && typeof filter !== "string") throw new TypeError("DataSetList.getDetailDataSet::filter is not a string");
		if (includeBlobContent != null && typeof includeBlobContent !== "boolean") throw new TypeError("DataSetList.getDetailDataSet::includeBlobContent is not a boolean");

		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		return this.#tableView["detail"][detail] = new DataSet("detail", detail, filter, includeBlobContent);
	}

	resetState() {
		this.#master = null;
		this.#master1 = null;
		this.#tableView = {
			category: {},
			detail: {}
		};
	}

	get funcs() {
		const array = [];

		this.#master && array.push(this.#master.func);
		this.#master1 && array.push(this.#master1.func);

		Object.keys(this.#tableView).forEach(tvName => {
			const tableView = this.#tableView[tvName];
			Object.keys(tableView).forEach(fnName => {
				const dso = tableView[fnName];
				array.push(dso.func);
			});
		});

		return array;
	}

	afterExecute() {
		this.#master && this.#setDsoItems(this.#master);
		this.#master1 && this.#setDsoItems(this.#master1);

		Object.keys(this.#tableView).forEach(listName => {
			const tableView = this.#tableView[listName];
			Object.keys(tableView).forEach(funcName => {
				this.#setDsoItems(tableView[funcName]);
			});
		});
	}

	setResponseObject(value) {
		this.responseObject = value;
	}

	/**
	 * Add the remotely fetched master, categories and detail data as properties of data
	 */
	setData(target) {
		target.data = {};
		target.data.master = this.#master?.item;
		target.data.master1 = this.#master1?.item;

		Object.keys(this.#tableView).forEach(listName => {
			const tableView = this.#tableView[listName];
			target.data[listName] = {};
			Object.keys(tableView).forEach(funcName => {
				target.data[listName][funcName] = listName === "category" ? tableView[funcName].item : tableView[funcName].items;
			});
		});
	}

	#setDsoItems(dso) {
		var array;

		if (dso instanceof DataSet === false) throw new TypeError("DataSetList.setDsoItems::dso is not an DataSet type");
		if (dso.tableView > 0) {
			array = this.api.findFuncArray2(this.responseObject, dso.type, "tableview", dso.tableView);
		} else {
			array = this.api.findFuncArray2(this.responseObject, dso.type, dso.type, dso.name);
		}

		dso.setItems(array);
	}
}

/**
 * Class representing a remotely fetched Attachment
 */
class AttachmentObject {
	key;
	#stream;

	constructor(key) {
		this.key = key;
	}

	setStream(stream) {
		this.#stream = stream;
	}

	/**
	 * get the base64 encoded attachment stream
	 * @type {string}
	 */
	get base64Stream() {
		return this.#stream;
	}

	get func() {
		const func = {};
		func["@name"] = "attachment";
		func["key"] = this.key;
		return func;
	};
}

class AttachmentList extends RemoteObject {
	#attachments;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.resetState();
	}

	/**
	 * Request attachment from FILES table
	 * @param {number} k_file
	 * @param {number} [version=0]
	 * @returns {Attachment}
	 */
	getAttachment(k_file, version = 0) {
		if (typeof k_file !== "number") throw new TypeError("AttachmentList.getAttachment::k_file is not a number");
		if (typeof version !== "number") throw new TypeError("AttachmentList.getAttachment::version is not a number");

		const key = `${k_file}_${version}`;
		const attachment = new AttachmentObject(key);
		this.#attachments.push(attachment);
		return attachment;
	}

	resetState() {
		this.#attachments = [];
	}

	get funcs() {
		return this.#attachments.map(item => item.func);
	}

	setResponseObject(value) {
		this.responseObject = value;
	}

	afterExecute() {
		this.#attachments.forEach(attachment => {
			const result = this.api.findAttachment(this.responseObject, attachment.key);
			result && attachment.setStream(result["#result"]);
		});
	}
}

/**
 * Constructed class Returned by RemoteObjects.openEditObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the edited record
 * @property {number} key - The key of the edited record
 * @property {number} edithandle - The handle of the edit operation
 * @property {boolean} inserted - True when record is newly inserted in the DB
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
class EditObject extends RemoteObject {
	entity;
	key;
	edithandle;
	data;

	/** @protected */
	commit;
	/** @protected */
	closecontext;
	/** @protected */
	inserted;

	#masterData;
	#categories;
	#details;
	#otherFuncs;
	#dataSetList;
	#attachmentList;

	#isDirty;

	/**
	 * Opens an edit context for the record identified by entity and key.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {RemoteAPI} remoteAPI
	 * @param {number} editHandle - Possibility to pass an existing editHandle
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {number} [key=0] - The key of the record. Use key = 0 to create a new record
	 */
	constructor(remoteAPI, editHandle, entity, key) {
		super(remoteAPI);
		this.entity = entity;
		this.key = ParseGentle.toFloatKey(key);
		this.#dataSetList = new DataSetList(remoteAPI);
		this.#attachmentList = new AttachmentList(remoteAPI);

		this.inserted = (this.key === 0);
		this.edithandle = editHandle > 0 ? editHandle : null;

		this.#resetState();
		this.#setDirty();
	}

	#resetState() {
		this.commit = null;
		this.closecontext = null;
		this.inserted = false;
		this.#masterData = {};
		this.#categories = {};
		this.#details = {};
		this.#otherFuncs = [];

		this.#dataSetList.resetState();
		this.#attachmentList.resetState();
		this.#isDirty = false;
	}
	#setDirty() {
		if (this.#isDirty) return;
		this.api.registerObject(this);
		this.#isDirty = true;
	}

	/**
	 * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
	 * @returns {DataSetObject}
	 */
	getMasterDataSet() {
		this.#setDirty();
		return this.#dataSetList.getMasterDataSet();
	}

	/**
	 * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
	 * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
	 * @returns {DataSetObject}
	 */
	getCategoryDataSet(categoryName) {
		this.#setDirty();
		return this.#dataSetList.getCategoryDataSet(categoryName);
	}

	/**
	 * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @returns {DataSetObject}
	 */
	getDetailDataSet(detail, filter = "", includeBlobContent = false) {
		this.#setDirty();
		return this.#dataSetList.getDetailDataSet(detail, filter, includeBlobContent);
	}

	/**
	 * Request attachment from FILES table
	 * @param {number} k_file
	 * @param {number} [version=0]
	 * @returns {AttachmentObject}
	 */
	getAttachment(k_file, version) {
		this.#setDirty();
		return this.#attachmentList.getAttachment(k_file, version);
	}

	/**
	 * Updates the field values of a master data set
	 * @param {string} name
	 * @param {string|number} value
	 */
	updateField(name, value) {
		ParseHard.isFieldValue(value);
		this.#masterData[name] = value;
		this.#setDirty();
	}
	/**
	 * Updates the field values of a master data set.
	 * @param {object} fieldsObj - e.g. {"OPENED": "0"}
	 */
	updateFields(fieldsObj) {
		Object.assign(this.#masterData, ParseGentle.fieldsObj(fieldsObj));
		this.#setDirty();
	}

	/**
	 * Updates the value of a field of any type in a category data set
	 * @param {string} categoryName
	 * @param {string} name
	 * @param {string|number} value
	 */
	updateCategoryField(categoryName, name, value) {
		if (typeof categoryName !== "string") throw new TypeError("EditObject.updateCategoryField::categoryName is not a string");
		ParseHard.isFieldValue(value);

		this.#categories[categoryName] = this.#categories[categoryName] || {};
		this.#categories[categoryName][name] = value;
		this.#setDirty();
	}

	/**
	 * Updates the value of a field of any type in a category data set
	 * @param {string} categoryName
	 * @param {object} fieldsObj - e.g. {"OPENED": "0"}
	 */
	updateCategoryFields(categoryName, fieldsObj) {
		if (typeof categoryName !== "string") throw new TypeError("EditObject.updateCategoryFields::categoryName is not a string");

		this.#categories[categoryName] = this.#categories[categoryName] || {};
		Object.assign(this.#categories[categoryName], ParseGentle.fieldsObj(fieldsObj));
		this.#setDirty();
	}

	/**
	 * Inserts a detail relation
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {number} detailKey - The key of the detail
	 * @param {boolean} [linkMainCompany=false]
	 * @param {boolean} [retrieveName=false]
	 */
	insertDetail(detail, detailKey, linkMainCompany = false, retrieveName = false) {
		if (typeof detail !== "string") throw new TypeError("EditObject.insertDetail::detail is not a string");

		const obj = {
			"@name": "insertDetail",
			"detail": detail,
			"detailkey": detailKey
		};
		if (typeof linkMainCompany === "boolean" && linkMainCompany) obj.maincomp = linkMainCompany;
		if (typeof retrieveName === "boolean" && retrieveName) obj.retrieveName = retrieveName;

		this.#otherFuncs.push(obj);
		this.#setDirty();
	}

	/**
	 * Updates field values of a detail relation. When the detail relation doesn't exist, an exception is thrown.
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {number|string} detailKey - The key of the detail. If detailKey is 0, the current detail record is used
	 * @param {object} fieldsObj, e.g. {"OPENED": "0"}
	 */
	updateDetail(detail, detailKey, fieldsObj) {
		if (typeof detail !== "string") throw new TypeError("EditObject.updateDetail::detail is not a string");

		this.#otherFuncs.push({
			"@name": "updateDetail",
			"detail": detail,
			"detailkey": detailKey,
			"@data": ParseGentle.fieldsObj(fieldsObj)
		});
		this.#setDirty();
	}

	/**
	 * Deletes a detail relation
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {number|string} detailKey - The key of the detail
	 */
	deleteDetail(detail, detailKey) {
		if (typeof detail !== "string") throw new TypeError("EditObject.deleteDetail::detail is not a string");

		this.#otherFuncs.push({
			"@name": "deleteDetail",
			"detail": detail,
			"detailkey": detailKey
		});
		this.#setDirty();
	}

	/**
	 * Clears all relations for the specified detail
	 * @param {string} detail - The detail name, e.g. "Comp"
	 */
	clearDetail(detail) {
		if (typeof detail !== "string") throw new TypeError("EditObject.clearDetail::detail is not a string");

		this.#otherFuncs.push({
			"@name": "clearDetail",
			"detail": detail
		});
		this.#setDirty();
	}

	/**
	 * Activates a category. If the user does not have the appropriate rights on the category, an exception is thrown.
	 * @param {string} categoryName
	 */
	activateCategory(categoryName) {
		if (typeof categoryName !== "string") throw new TypeError("EditObject.activateCategory::categoryName is not a string");

		this.#otherFuncs.push({
			"@name": "activateCategory",
			"category": categoryName
		});
		this.#setDirty();
	}

	/**
	 * Requests that a unique reference number be generated when committing.
	 * @param {number} id - SYS_REFERENCES.K_REFERENCE
	 */
	setReference(id) {
		if (typeof id !== "number") throw new TypeError("EditObject.setReference::id is not a number");

		this.#otherFuncs.push({
			"@name": "reference",
			"id": ParseGentle.toFloatKey(id)
		});
		this.#setDirty();
	}

	/**
	 * Sets the user relations.
	 * @param {array} users - The array of user IDs (keys).
	 * @param {boolean} [clear=false] - If true, clears the current user selection.
	 */
	setUsers(users, clear = false) {
		if (!Array.isArray(users)) throw new TypeError("EditObject.setUsers::users is not an Array");

		const obj = {
			"@name": "setusers",
			"users": users
		};
		if (typeof clear === "boolean") obj.clear = clear;

		this.#otherFuncs.push(obj);
		this.#setDirty();
	}

	/**
	 * Sets the security for a user or group.
	 * @param {number} account - The user or group for which security is added.
	 * @param {number} securityValue - A sum of one or more of the following values: 1 (search), 2 (read), 4 (write), 8 (delete) and 256 (secure). Useful combinations are 7 (read/write), 15 (read/write/delete) and 271 (full control = read/write/delete/secure).
	 */
	setUserSecurity(account, securityValue) {
		if (typeof account !== "number") throw new TypeError("EditObject.setUserSecurity::account is not a number");
		if (typeof securityValue !== "number") throw new TypeError("EditObject.setUserSecurity::securityValue is not a number");

		this.#otherFuncs.push({
			"@name": "setusersecurity",
			"user": account,
			"security": securityValue
		});
		this.#setDirty();
	}

	/**
	 * Inserts an file
	 * @param {number} attachedFileType - 1 = embedded, 2 = linked, 4 = remote, 5 = large
	 * @param {string} path - The path of the file that will be saved in the FILES.PATH field.
	 */
	insertAttachment(attachedFileType, path) {
		if (typeof attachedFileType !== "number") throw new TypeError("EditObject.insertAttachment::attachedFileType is not a number");
		if (typeof path !== "string") throw new TypeError("EditObject.insertAttachment::path is not a string");

		this.#otherFuncs.push({
			"@name": "insertAttachment",
			"type": attachedFileType,
			"path": path
		});
		this.#setDirty();
	}

	/**
	 * Updates an embedded file
	 * @param {number} key - Leave null or 0 to set the stream of the just inserted Attachment
	 * @param {string} base64String
	 */
	updateAttachment(key = 0, base64String) {
		if (typeof key !== "number") throw new TypeError("EditObject.updateAttachment::key is not a number");
		if (typeof base64String !== "string") throw new TypeError("EditObject.updateAttachment::base64String is not a string");

		this.#otherFuncs.push({
			"@name": "updateAttachment",
			"key": key,
			"encodingkind": "MIME64",
			"@data": base64String
		});
		this.#setDirty();
	}

	/**
	 * Copies data from an existing record in the database. The same entity as the current is assumed.
	 * The table views within the index range minIndex to maxIndex are copied. By default, all table views are copied.
	 * To copy a single detail, obtain the table view index using IndexFromDetail and use this value as MinIndex and MaxIndex.
	 * @param {number} key - The key of the source record.
	 * @param {number} [minTableView=0] - The index of first table view to be copied.
	 * @param {number} [maxTableView=999] - The index of last table view to be copied.
	 */
	copyFromExisting(key, minTableView = 0, maxTableView = 999) {
		if (typeof key !== "number") throw new TypeError("EditObject.copyFromExisting::key is not a number");
		if (typeof minTableView !== "number") throw new TypeError("EditObject.copyFromExisting::minTableView is not a number");
		if (typeof maxTableView !== "number") throw new TypeError("EditObject.copyFromExisting::maxTableView is not a number");

		this.#otherFuncs.push({
			"@name": "copyFromExisting",
			"key": key,
			"mintableview": minTableView,
			"maxtableview": maxTableView
		});
		this.#setDirty();
	}

	/**
	 * Commits the changes to the database.
	 */
	commitChanges() {
		this.commit = true;
		this.#setDirty();
	}

	/**
	 * Closes the context and frees the memory on the web server.
	 */
	closeContext() {
		this.closecontext = true;
		this.#setDirty();
	}

	/**
	 * Commits the changes, releases the record and executes closeContext
	 */
	closingCommit() {
		this.commit = true;
		this.closecontext = true;
		this.#setDirty();
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "edit",
			"@func": []
		};

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "edithandle", "commit", "closecontext"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		if (typeof this.#details === "object" && Object.keys(this.#details).length > 0) {
			Object.keys(this.#details).forEach(detail => {
				requestObject["@func"].push({
					"@name": "detail",
					"detail": detail
				});
			});
		}

		requestObject["@func"].push(...this.#otherFuncs);

		// Placed after #otherFuncs, because they could have the activateCategory
		if (typeof this.#categories === "object" && Object.keys(this.#categories).length > 0) {
			Object.keys(this.#categories).forEach(categoryName => {
				requestObject["@func"].push({
					"@name": "update",
					"category": categoryName,
					"@data": this.#categories[categoryName]
				});
			});
		}

		requestObject["@func"].push(...this.#dataSetList.funcs);
		requestObject["@func"].push(...this.#attachmentList.funcs);

		if (typeof this.#masterData === "object" && Object.keys(this.#masterData).length > 0) {
			requestObject["@func"].push({
				"@name": "update",
				"@data": this.#masterData
			});
		}

		return requestObject;
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "edithandle", "commit", "closecontext"].forEach(property => {
			this[property] = this.responseObject[property];
		});

		this.#dataSetList.setResponseObject(this.responseObject);
		this.#dataSetList.afterExecute();
		this.#dataSetList.setData(this);

		this.#attachmentList.setResponseObject(this.responseObject);
		this.#attachmentList.afterExecute();

		this.#resetState();
	}
}

/**
 * Class with methods that contain executeBatch commands
 * @extends RemoteObject
*/
class WsObject extends RemoteObject {
	constructor(remoteAPI) {
		super(remoteAPI);
	}

	/**
	 *
	 * @param {EditObject} editObject
	 * @param {string} filter - Server-side SQL filter expression, added as filter property of [TDataSet](https://help.efficy.io/extras/serverjs.html#TDataSet)
	 * @param {boolean} includeBlobContent - On true, returns all blob streams (e.g. attachment, thumb)
	 * @returns {Promise<Array>}
	 * @example
	 * await crm.ws.getFiles(document, `COMMENT like '%.docx'`, false);
	 */
	 async getFiles(editObject, filter, includeBlobContent) {
		await this.api.executeBatch();
		const dsFiles = editObject.getDetailDataSet("file", filter, includeBlobContent);
		await this.api.executeBatch();

		if (!Array.isArray(dsFiles.items) || dsFiles.items.length === 0) return [];

		// Sort like in UI, highest/latest K_SORT first
		const fnSort = (a, b) => b.K_SORT - a.K_SORT;
		const sortedFiles = dsFiles.items.sort(fnSort);

		return sortedFiles;
	}

	/**
	 * Instantly delete files, optionally SQL expression filtered
	 * @param {EditObject} editObject
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @example
	 * await crm.ws.deleteFiles(document);
	 * await crm.ws.deleteFiles(document, `COMMENT like '%template%'`);
	 */
	async deleteFiles(editObject, filter) {
		const files = await this.getFiles(editObject, filter, false);
		files.forEach(file => {
			editObject.deleteDetail("file", file.K_FILE + "_" + file.VERSION);
		});
		await this.api.executeBatch();
	}

	/**
	 * Instantly cleanup files, but keep top X, optionally SQL expression filtered
	 * @param {EditObject} editObject
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {number} [keepTopX=7] - Keep only the top X files, sorted highest/latest K_SORT first
	 * @example
	 * await crm.ws.cleanupFiles(document, "", 7);
	 * await crm.ws.cleanupFiles(document, `COMMENT like '%template%'`, 0);
	 */
	async cleanupFiles(editObject, filter, keepTopX = 7) {
		const files = await this.getFiles(editObject, filter, false);

		files.filter((file, index) => index >= keepTopX).forEach(file => {
			editObject.deleteDetail("file", file.K_FILE + "_" + file.VERSION);
		});
		await this.api.executeBatch();
	}
}

/**
 * Class returned by openConsultObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the consulted record
 * @property {number} key - The key of the consulted record
 * @property {number} consulthandle - The handle of the consult operation
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
class ConsultObject extends RemoteObject {
	entity;
	key;
	consulthandle;
	data;

	/** @protected */
	closecontext;

	#otherFuncs;
	#dataSetList;
	#isDirty;

	/**
	 * Opens an consult context for the record identified by entity and key.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {RemoteAPI} remoteAPI
	 * @param {string} entity - The entity name of the consulted record, e.g. "Comp"
	 * @param {number} key - The key of the consulted record
	 * @param {number} [consultHandle] - Possibility to pass an existing consultHandle
	 */
	constructor(remoteAPI, entity, key, consultHandle) {
		super(remoteAPI);
		this.entity = entity;
		this.key = ParseGentle.toFloatKey(key);
		this.consulthandle = consultHandle;
		this.#dataSetList = new DataSetList(remoteAPI);

		this.#resetState();
		this.#setDirty();
	}

	#resetState() {
		this.closecontext = null;
		this.#otherFuncs = [];

		this.#dataSetList.resetState();
		this.#isDirty = false;
	}
	#setDirty() {
		if (this.#isDirty) return;
		this.api.registerObject(this);
		this.#isDirty = true;
	}

	/**
	 * Retrieves a master [DatasetObject]{@link Dataset.html} from the consult context.
	 * @returns {DataSetObject}
	 */
	getMasterDataSet() {
		this.#setDirty();
		return this.#dataSetList.getMasterDataSet();
	}

	/**
	 * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
	 * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
	 * @returns {DataSetObject}
	 */
	getCategoryDataSet(categoryName) {
		this.#setDirty();
		return this.#dataSetList.getCategoryDataSet(categoryName);
	}

	/**
	 * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @returns {DataSetObject}
	 */
	getDetailDataSet(detail, filter = "", includeBlobContent = false) {
		this.#setDirty();
		return this.#dataSetList.getDetailDataSet(detail, filter, includeBlobContent);
	}

	/**
	 * Closes the context and frees the memory on the web server.
	 */
	closeContext() {
		this.closecontext = true;
		this.#setDirty();
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "consult",
			"@func": []
		};

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "consulthandle", "closecontext"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		requestObject["@func"].push(...this.#dataSetList.funcs);
		requestObject["@func"].push(...this.#otherFuncs);

		return requestObject;
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "consulthandle", "closecontext"].forEach(property => {
			this[property] = this.responseObject[property];
		});

		this.#dataSetList.setResponseObject(this.responseObject);
		this.#dataSetList.afterExecute();
		this.#dataSetList.setData(this);

		this.#resetState();
	}
}

/**
 * Constructed class Returned by RemoteObjects.openEditRelationObject
 * @extends RemoteObject
 * @property {string} entity - The entity name
 * @property {number} key - The key of the entity record
 * @property {string} detail - The detail name
 * @property {number} detailkey - The key of the detail record
 * @property {number} edithandle - The handle of the edit operation
 * @property {boolean} inserted - True when record is newly inserted in the DB
 * @property {object} data
 */
class EditRelationObject extends RemoteObject {
	entity;
	detail;
	key;
	detailkey;
	edithandle;
	data;

	/** @protected */
	commit;
	/** @protected */
	closecontext;
	/** @protected */
	inserted;

	#masterData;
	#master1Data;
	#otherFuncs;
	#dataSetList;

	#isDirty;

	/**
	 * Opens an edit context for a relation. If the relation does not yet exist, it is created.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {RemoteAPI} remoteAPI
	 * @param {number} editHandle - Possibility to pass an existing editHandle
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {string} detail - The detail name, e.g. "Cont"
	 * @param {number} key - The key of the entity
	 * @param {number} detailKey - The key of the detail
	 * @param {number} [relationId] - The key of the relation if multi-relation is available
	 */
	constructor(remoteAPI, editHandle, entity, detail, key, detailKey, relationId) {
		super(remoteAPI);
		this.entity = entity;
		this.detail = detail;
		this.key = ParseGentle.toFloatKey(key);
		this.detailkey = ParseGentle.toFloatKey(detailKey);
		this.relationId = ParseGentle.toFloatKey(relationId);
		this.#dataSetList = new DataSetList(remoteAPI);

		this.inserted = (this.key === 0);
		this.edithandle = editHandle > 0 ? editHandle : null;

		if (this.relationId != null) {
			this.detailkey = [this.detailkey, this.relationId].join("_");
		}

		this.#resetState();
		this.#setDirty();
	}

	#resetState() {
		this.commit = null;
		this.closecontext = null;
		this.inserted = null;
		this.#masterData = {};
		this.#master1Data = {};
		this.#otherFuncs = [];

		this.#dataSetList.resetState();
		this.#isDirty = false;
	}
	#setDirty() {
		if (this.#isDirty) return;
		this.api.registerObject(this);
		this.#isDirty = true;
	}

	/**
	 * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
	 * @param {number} [tableView=0]
	 * @returns {DataSetObject}
	 */
	getMasterDataSet(tableView = 0) {
		this.#setDirty();
		return this.#dataSetList.getMasterDataSet(tableView);
	}

	/**
	 * Updates the field values of a master data set
	 * @param {string} name
	 * @param {string|number} value
	 */
	updateField(name, value) {
		ParseHard.isFieldValue(value);
		this.#masterData[name] = value;
		this.#setDirty();
	}
	/**
	 * Updates the field values of a master data set.
	 * @param {object} fieldsObj - e.g. {"OPENED": "0"}
	 */
	updateFields(fieldsObj) {
		Object.assign(this.#masterData, ParseGentle.fieldsObj(fieldsObj));
		this.#setDirty();
	}

	/**
	 * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
	 * @param {string} name
	 * @param {string|number} value
	 */
	updateReciprocityField(name, value) {
		ParseHard.isFieldValue(value);
		this.#master1Data[name] = value;
		this.#setDirty();
	}
	/**
	 * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
	 * @param {object} fieldsObj - e.g. {"OPENED": "0"}
	 */
	updateReciprocityFields(fieldsObj) {
		Object.assign(this.#master1Data, ParseGentle.fieldsObj(fieldsObj));
		this.#setDirty();
	}

	/**
	 * Commits the changes to the database.
	 */
	commitChanges() {
		this.commit = true;
		this.#setDirty();
	}

	/**
	 * Closes the context and frees the memory on the web server.
	 */
	closeContext() {
		this.closecontext = true;
		this.#setDirty();
	}

	/**
	 * Commits the changes, releases the record and executes closeContext
	 */
	closingCommit() {
		this.commit = true;
		this.closecontext = true;
		this.#setDirty();
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "edit",
			"@func": []
		};

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "detail", "key", "detailkey", "edithandle", "commit", "closecontext"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		requestObject["@func"].push(...this.#otherFuncs);
		requestObject["@func"].push(...this.#dataSetList.funcs);

		if (typeof this.#masterData === "object" && Object.keys(this.#masterData).length > 0) {
			requestObject["@func"].push({
				"@name": "update",
				"tableview": 0,
				"@data": this.#masterData
			});
		}

		if (typeof this.#master1Data === "object" && Object.keys(this.#master1Data).length > 0) {
			requestObject["@func"].push({
				"@name": "update",
				"tableview": 1,
				"@data": this.#master1Data
			});
		}

		return requestObject;
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "detail", "key", "detailkey", "edithandle", "commit", "closecontext"].forEach(property => {
			this[property] = this.responseObject[property];
		});

		this.#dataSetList.setResponseObject(this.responseObject);
		this.#dataSetList.afterExecute();
		this.#dataSetList.setData(this);

		this.#resetState();
	}
}

/**
 * Class returned by search operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class SearchObject extends DataSetObject {
	/** @private */
	entity;
	/** @private */
	method;
	/** @private */
	value;
	/** @private */
	own;
	/** @private */
	contains;
	/** @private */
	opened;

	constructor(remoteAPI, entity, method, value, own, contains, opened) {
		super(remoteAPI);
		this.entity = entity;
		this.method = method;
		this.value = value;
		this.own = own;
		this.contains = contains;
		this.opened = opened;
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "search",
			"@func": [
				{"@name": "master", "tableview":0}
			]
		};

		["entity", "method", "value", "method", "contains", "own"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		return requestObject;
	}
}

/**
 * Class returned by methods such as getCategoryCollection
 * @extends DataSetObject
 */
class CollectionObject extends DataSetObject {
	constructor(remoteAPI, entity, detail) {
		super(remoteAPI);
		this.dataSetName = "collection";
		this.entity = entity;
		this.detail = detail;
	}

	asJsonRpc() {
		const api = {
			"@name": "getcategorycollection"
		};

		if (this.entity) api.entity = this.entity;
		if (this.detail) api.detail = this.detail;

		const requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by methods such as deleteEntity
 * @extends RemoteObject
 */
 class DeleteEntity extends RemoteObject {
	constructor(remoteAPI, entity, keys) {
		super(remoteAPI);
		this.entity = entity;
		this.keys = Array.isArray(keys) ? keys : [keys];
		this.api.registerObject(this);
	}

	asJsonRpc() {
		const api = {
			"@name": "delete",
			"entity": this.entity,
			"keys":this.keys.join(";")
		};

		const requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class QueryObject extends DataSetObject {
	constructor(remoteAPI, key, master, detail, queryParams = [], loadBlobs = false, recordCount = 0) {
		super(remoteAPI);
		this.key = key;
		this.master = master;
		this.detail = detail;
		this.queryParams = queryParams;
		this.loadBlobs = typeof loadBlobs === "boolean" ? loadBlobs : false;
		this.recordCount = recordCount;
	}

	asJsonRpc() {
		const api = {
			"@name": "query",
			"loadBlobs": this.loadBlobs,
			"recordCount": this.recordCount
		};

		if (typeof this.key === "number") api.key = this.key;
		if (typeof this.master === "number") api.master = this.master;
		if (typeof this.detail === "number") api.detail = this.detail;

		if (Array.isArray(this.queryParams)) {
			api.queryparams = this.queryParams.join("|");
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class QuerySQLObject extends DataSetObject {
	constructor(remoteAPI, sql, queryParams = [], loadBlobs = false, recordCount = 0) {
		super(remoteAPI);
		this.sql = sql;
		this.queryParams = queryParams;
		this.loadBlobs = typeof loadBlobs === "boolean" ? loadBlobs : false;
		this.recordCount = recordCount;
	}

	asJsonRpc() {
		const api = {
			"@name": "executesqlquery",
			"sql": this.sql,
			"loadBlobs": this.loadBlobs,
			"recordCount": this.recordCount
		};

		if (Array.isArray(this.queryParams)) {
			api.queryparams = this.queryParams.join("\n");
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by consultManyEx operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} whereFields - A list of field names to match (used as WHERE criteria), e.g. ["NAME", "OPENED"]
 * @param {array} whereValues - A list of values to match, e.g. ["Efficy", "1"]
 * @param {string} orderByFields - SQL sort expression, e.g. "K_COMPANY desc"
 */
class ConsultManyEx extends DataSetObject {
	constructor(remoteAPI, entity, whereFields, whereValues, orderByExpression) {
		super(remoteAPI);
		this.entity = entity;
		this.whereFields = whereFields;
		this.whereValues = whereValues;
		this.orderByExpression = orderByExpression;
	}

	asJsonRpc() {
		const api = {
			"@name": "consultmanyex",
			"entity": this.entity,
			"findfield": this.whereFields.join(";"),
			"keys": this.whereValues.join(";"),
			"orderbyfield": this.orderByExpression,
			"separator": ";"
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by consultRecent operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} [extraFields=[]] - A list of extra fields to consult for each recent entity record, e.g. ["POSTCODE", "CITY"]
 */
class RecentList extends DataSetObject {
	constructor(remoteAPI, entity, extraFields = []) {
		super(remoteAPI);
		if (extraFields && !Array.isArray(extraFields)) throw TypeError("RecentListEx.constructor::extraFields is not an array");
		this.entity = entity;
		this.extraFields = extraFields;
	}

	asJsonRpc() {
		const api = {
			"@name": "recentlistex",
			"entity": this.entity,
			"extrafields": this.extraFields.join(","),
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by consultFavorites operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 */
class FavoriteList extends DataSetObject {
	constructor(remoteAPI, entity) {
		super(remoteAPI);
		this.entity = entity;
	}

	asJsonRpc() {
		const api = {
			"@name": "favoritelist",
			"entity": this.entity
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by getUserList operation
 * @extends DataSetObject
  */
class UserList extends DataSetObject {
	constructor(remoteAPI) {
		super(remoteAPI);
	}

	asJsonRpc() {
		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [{"@name": "userlist"}]
		};

		return requestObject;
	}
}

/**
 * Class returned by searchContactsByEmail, searchContactsByPhone operations
 * @extends DataSetObject
 * @param {Array<string>} [recipients=[]] - The list of email addresses
 * @param {string} [phoneNumber=""] - The phone number, doesn't have to be stripped from formatting
 */
class ContactsList extends DataSetObject {
	constructor(remoteAPI, recipients = [], phoneNumber = "") {
		super(remoteAPI);
		this.recipients = recipients;
		this.phoneNumber = phoneNumber;
	}

	asJsonRpc() {
		var api;

		if (Array.isArray(this.recipients) && this.recipients.length > 0) {
			api = {
				"@name": "contactidsfromemailaddresses",
				"recipients": this.recipients.join(";")
			};
		} else if (this.phoneNumber) {
			api = {
				"@name": "searchcontactsbyphone",
				"phonenumber": this.phoneNumber
			};
		}

		if (!api) throw Error("ContactsList.asJsonRpc::unable to define the operation @name");

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class uses by operations that return a list
 * @extends RemoteObject
 * @property {Map} map - The Map object holds key-value pairs and remembers the original order of the keys, {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */
class ListObject extends RemoteObject {
	map; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();
		this.items = this.api.findListArray(this.responseObject);

		// https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-object
		this.map = new Map(this.items.map(item => [item.split("=")[0], item.split("=")[1]]));
	}
}

/**
 * Class returned by getSystemSettings operations.
 * @extends ListObject
 */
class SystemSettings extends ListObject {
	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api = {
			"@name": "systemsettings"
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class uses by operations that return a string result
 * @extends RemoteObject
 * @property {string} result
 */
class StringObject extends RemoteObject {
	result;
	/** @protected */
	operationName;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();
		this.result = this.api.findFunc(this.responseObject, this.operationName)?.["#result"];
	}
}

/**
 * Class returned by getSetting operation
 * @extends StringObject
 * @param {string} name - The name of the module (JSON object) that owns the setting.
 * @param {string} module - The name of the setting.
 * @param {boolean} [asString=true] - If true, the settings of type TDateTime will be returned as a string formatted with the ShortDateTime format. If false, it will be returned as a float value.
 */
class SettingObject extends StringObject {
	module;
	name;
	asString;

	constructor(remoteAPI, module, name, asString = true) {
		super(remoteAPI);
		this.operationName = "getsetting";
		this.module = module;
		this.name = name;
		this.asString = typeof asString === "boolean" ? asString : asString = true;
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api =  {
			"@name": this.operationName,
			"module": this.module,
			"name": this.name,
			"asstring": this.asString
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by API property operation such as currentdatabasealias, currentuserfullname
 * @extends StringObject
 * @param {string} name - The name of the API property
 */
class PropertyObject extends StringObject {
	name;

	constructor(remoteAPI, name) {
		super(remoteAPI);
		this.operationName = name;
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api = {
			"@name": this.operationName
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class to create Remote Objects
 * @extends RemoteAPI
*/
class CrmRpc extends RemoteAPI {

	/**
	 * Construct a CrmRpc object
	 * @param {CrmEnv} [crmEnv=undefined] - When empty, uses the Efficy context of the browser
	 * @param {function} [logFunction=undefined] - Your (custom) log function to call for requests and responses, e.g. console.log
	 * @param {number} [threadId=undefined] - Unique thread ID for logging purposes
	 * @example
	 * function logger(msg, reqLog) {
	 *   console.log(msg);
	 * }
	 * const crm = new CrmRpc(crmEnv, logger);
	 */
	constructor(crmEnv, logFunction, threadId) {
		super(crmEnv, logFunction, threadId);
	}

	/**
	 * Execute all assembled and queued RPC operations
	 */
	async executeBatch() {
		return super.executeBatch();
	}
	/**
	 * Logoff the remote session, not possible when crmEnv.isEfficy === true
	 */
	logoff() {
		return super.logoff();
	}

	/**
	 * Retrieves the alias (name) of the currently connected database
	 * @returns {PropertyObject}
	 */
	get currentDatabaseAlias() {
		return new PropertyObject(this, "currentdatabasealias");
	}

	/**
	 * Retrieves the current database timezone
	 * @returns {PropertyObject}
	 */
	get currentDatabaseTimezone() {
		return new PropertyObject(this, "currentdatabasetimezone");
	}

	/**
	 * Retrieves the current license name
	 * @returns {PropertyObject}
	 */
	get currentLicenseName() {
		return new PropertyObject(this, "currentlicensename");
	}

	/**
	 * Retrieves the current user full name
	 * @returns {PropertyObject}
	 */
	get currentUserFullName() {
		return new PropertyObject(this, "currentuserfullname");
	}

	/**
	 * Retrieves the group memberships of the current user as semicolon separated string list, e.g. "1;28;292;936"
	 * @returns {PropertyObject}
	 */
	get currentUserGroups() {
		return new PropertyObject(this, "currentusergroups");
	}

	/**
	 * Retrieves the current user key, e.g. "4"
	 * @returns {PropertyObject}
	 */
	get currentUserId() {
		return new PropertyObject(this, "currentuserid");
	}

	/**
	 * Retrieves the current user code, e.g. "CRM01"
	 * @returns {PropertyObject}
	 */
	get currentUserCode() {
		return new PropertyObject(this, "currentusername");
	}

	/**
	 * Retrieves the current user timezone
	 * @returns {PropertyObject}
	 */
	get currentUserTimezone() {
		return new PropertyObject(this, "currentusertimezone");
	}

	/**
	 * Opens a consult context for the record identified by entity and key.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {number} key - The key of the record. Use key = 0 to create a new record.
	 * @returns {ConsultObject}
	 * @example
	 * const comp = crm.openConsultObject("comp", 2);
	 * const dsComp = comp.getMasterDataSet();
	 * const dsCompAddress = comp.getCategoryDataSet("COMP$ADDRESS");
	 * const linkedContacts = comp.getDetailDataSet("cont");
	 * await crm.executeBatch();
	 * const companyNames = [comp.data.master.NAME, comp.data.category["COMP$ADDRESS"].NAME];
	 * comp.closeContext();
	 * await crm.executeBatch();
	 */
	openConsultObject(entity, key) {
		return new ConsultObject(this, entity, key);
	}

	/**
	 * Create and return an ConsultObject based on an existing consultHandle
	 * @param {number} consultHandle
	 * @param {string} entity - Weird, but the RPC interface requires the entity of the consultHandle!
	 */
	getConsultObject(consultHandle, entity) {
		return new ConsultObject(this, entity, 0, consultHandle);
	}

	/**
	 * Opens an edit context for the record identified by entity and key.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {number} [key=0] - The key of the record. Use key = 0 to create a new record.
	 * @returns {EditObject}
	 * @example
	 * const docu = crm.openEditObject("docu", 0);
	 * docu.updateField("NAME", "Jan");
	 * docu.insertDetail("Comp", 2);
	 * docu.insertDetail("Cont", 44395, true, true);
	 * docu.commitChanges();
	 * docu.activateCategory("DOCU$INVOICING");
	 * docu.updateCategoryFields("DOCU$INVOICING", {
	 *   "D_INVOICE":"2021-01-08T00:00:00",
	 *   "COMMUNICATION": "Hello World!"
	 * });
	 * docu.updateCategoryField("DOCU$INVOICING", "PRE_PAID", 123.456)
	 * docu.clearDetail("Comp");
	 * docu.insertDetail("Comp", 4);
	 * docu.insertDetail("Cont", 50512, false);
	 * docu.insertDetail("Prod", 4);
	 * docu.updateDetail("Prod", 0, {
	 *   QUANTITY: 5
	 * });
	 * docu.setUsers([169, 170], true);
	 * docu.setUserSecurity(99999002, 271);
	 * docu.setReference(99999001);
	 * docu.commitChanges();
	 * docu.closeContext();
	 * await crm.executeBatch();
	 */
	openEditObject(entity, key = 0) {
		return new EditObject(this, 0, entity, key);
	}

	/**
	 * Opens an edit context for a relation. If the relation does not yet exist, it is created.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {string} detail - The detail name, e.g. "Cont"
	 * @param {number} key - The key of the entity
	 * @param {number} detailKey - The key of the detail
	 * @param {number} [relationId] - The key of the relation if multi-relation is available
	 * @returns {EditRelationObject}
	 * @example
	 * const contCont = crm.openEditRelationObject("cont", "cont", 5, 6);
	 * contCont.updateField("RELATION", 1);
	 * contCont.updateReciprocityField("RELATION", 2);
	 * contCont.commitChanges();
	 * const dsContCont = contCont.getMasterDataSet();
	 * const dsContCont1 = contCont.getMasterDataSet(1);
	 * await crm.executeBatch();
	 * console.log(dsContCont.item["R_RELATION"]);
	 * console.log(dsContCont1.item["R_RELATION"]);
	 * contCont.closingCommit();
	 * await crm.executeBatch();
	 */
	openEditRelationObject(entity, detail, key, detailKey, relationId) {
		return new EditRelationObject(this, 0, entity, detail, key, detailKey, relationId);
	}

	/**
	 * Create and return an EditObject based on an existing editHandle
	 * @param {number} editHandle
	 */
	getEditObject(editHandle) {
		return new EditObject(this, editHandle, "", 0);
	}

	/**
	 * Create and return an EditObject based on an existing editHandle
	 * @param {number} editHandle
	 */
	getEditRelationObject(editHandle) {
		return new EditRelationObject(this, editHandle, "", "", 0, 0);
	}

	/**
	 * Performs a search on the database and returns the data set with search results.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {string} method - The field to be searched. Special values SEARCHFAST, SEARCHFULL, SEARCHTEXT, SEARCHFILENAME, SEARCHFILE correspond to the search options in the web application user interface
	 * @param {string} value - 	The value to search
	 * @param {boolean} [own=false] - If true, search own records only.
	 * @param {boolean} [contains=true] - If true, allow matches on part of field
	 * @param {boolean} [opened=true] - If true, search for opened or active records only
	 * @returns {DataSetObject}
	 * @example
	 * const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
	 */
	search(entity, method, value, own = false, contains = true, opened = true) {
		return new SearchObject(this, entity, method, value, own, contains, opened);
	}

	/**
	 * Returns all the Contacts having one of the e-mail provided in their e-mail fields (or in the Cont_Comp relation).
	 * @param {Array<string>} recipients - The list of email addresses
	 * @returns {DataSetObject}
	 * @example
	 * const contactsByEmail = crm.searchContactsByEmail(["john.doe@efficy.com", "john.doe@outlook.com"]);
	 */
	searchContactsByEmail(recipients) {
		if (!Array.isArray(recipients) || recipients.length < 1) throw TypeError("recipients is not a array with at least one item");
		return new ContactsList(this, recipients);
	}

	/**
	 * Returns all the first Contacts having a match with the provided (formatted) phone number
	 * @param {string} phoneNumber - The phone number, doesn't have to be stripped from formatting
	 * @returns {DataSetObject}
	 * @example
	 * const contactsByPhone = crm.searchContactsByPhone("+32 474 00 00 00");
	 */
	searchContactsByPhone(phoneNumber) {
		return new ContactsList(this, undefined, phoneNumber);
	}

	/**
	 * Executes a database query stored in QUERIES
	 * @param {number} idQuery
	 * @param {array} [queryParameters] - The query parameters delivered via a JS Array
	 * @param {boolean} [loadBlobs=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @param {number} [recordCount=0] - If 0, return all records
	 * @returns {DataSetObject}
	 * @example
	 * const tags = crm.executeDatabaseQuery(99990034); // Query "Standard: Top company tags"
	 */
	executeDatabaseQuery(idQuery, queryParameters, loadBlobs = false, recordCount = 0) {
		return new QueryObject(this, idQuery, null, null, queryParameters, loadBlobs, recordCount);
	}

	/**
	 * Executes a system database query stored in SYS_QUERIES
	 * @param {number} master
	 * @param {number} detail
	 * @param {array} queryParameters - The query parameters delivered via a JS Array
	 * @param {boolean} [loadBlobs=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @param {number} [recordCount=0] - If 0, return all records
	 * @returns {DataSetObject}
	 * @example
	 * const contDupls = crm.executeSystemQuery(4, 1, [11000,2]); // System query "Own Duplicate List"
	 */
	executeSystemQuery(master, detail, queryParameters, loadBlobs = false, recordCount = 0) {
		// @ts-ignore
		return new QueryObject(this, null, master, detail, queryParameters, loadBlobs, recordCount);
	}

	/**
	 * Runs a native (SQL) database query, only if the user has SQL Exec the permissions!
	 * @param {string} sqlQueryText - The SQL query text
	 * @param {array} queryParameters - The query parameters delivered via a JS Array
	 * @param {boolean} [loadBlobs=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @param {number} [recordCount] - Limit the returned records
	 * @returns {DataSetObject}
	 * @example
	 * const appos = crm.executeSqlQuery("Select * from ACTIONS where PLANNED=:p1 and DONE=:p2", ["1", "0"], true, 2);
	 */
	executeSqlQuery(sqlQueryText, queryParameters, loadBlobs = false, recordCount = 0) {
		// @ts-ignore
		return new QuerySQLObject(this, sqlQueryText, queryParameters, loadBlobs, recordCount);
	}

	/**
	 * Selects records that exactly match certain field values
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {array} whereFields - A list of field names to match (used as WHERE criteria), e.g. ["NAME", "OPENED"]
	 * @param {array} whereValues - A list of values to match, e.g. ["Efficy", "1"]
	 * @param {string} orderByExpression - SQL sort expression, e.g. "K_COMPANY desc"
	 * @returns {DataSetObject}
	 * @example
	 * const morningMeetings = crm.consultManyEx("Acti", ["PLANNED", "D_BEGIN"], ["1", "2022-03-14 09:00:00"], "D_BEGIN");
	 */
	consultManyEx(entity, whereFields, whereValues, orderByExpression) {
		return new ConsultManyEx(this, entity, whereFields, whereValues, orderByExpression);
	}

	/**
	 * Consult your recent records, optionally extended by additional fields.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {array} [extraFields=[]] - A list of extra fields to consult for each recent entity record, e.g. ["POSTCODE", "CITY"]
	 * @returns {DataSetObject}
	 * @example
	 * const compRecents = crm.consultRecent("Comp");
	 * const compRecentsEx = crm.consultRecent("Comp", ["CITY", "COUNTRY"]);
	 */
	consultRecent(entity, extraFields = []) {
		return new RecentList(this, entity, extraFields);
	}

	/**
	 * Consult your favorite records.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @returns {DataSetObject}
	 * @example
	 * const compFavorites = crm.consultFavorites("Comp");
	 */
	consultFavorites(entity) {
		return new FavoriteList(this, entity);
	}

	/**
	 * Request the accessible categories - for the current user - of the given entity
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @returns {DataSetObject}
	 * @example
	 * const compCategories = crm.getCategoryCollection("comp");
	 */
	getCategoryCollection(entity) {
		const detail = "";
		return new CollectionObject(this, entity, detail);
	}

	/**
	 * Requests a list of users, groups and resources
	 * @returns {DataSetObject}
	 * @example
	 * const userList = crm.getUserList();
	 */
	getUserList() {
		return new UserList(this);
	}

	/**
	 * Request a list of system settings. Use the Map object to retrieve settings
	 * @returns {ListObject}
	 * @example
	 * const settings = crm.getSystemSettings();
	 * await crm.executeBatch();
	 * settings.map.get("ShortDateFormat"); // e.g. "dd/mm/yyyy"
	 * settings.map.forEach(console.log); // prints each setting on console
	 */
	getSystemSettings() {
		return new SystemSettings(this);
	}

	/**
	 * Requests the current value of a given Efficy setting.
	 * @param {string} module - The name of the setting.
	 * @param {string} name - The name of the module (JSON object) that owns the setting.
	 * @param {boolean} [asString=true] - If true, the settings of type TDateTime will be returned as a string formatted with the ShortDateTime format. If false, it will be returned as a float value.
	 * @returns {StringObject}
	 * @example
	 * const workingPeriodFrom = crm.getSetting("user", "WorkingPeriodFrom");
	 * const workingPeriodFromFloat = crm.getSetting("user", "WorkingPeriodFrom", false);
	 * await crm.executeBatch();
	 * workingPeriodFrom.result; // e.g. "30/12/1899 08:00"
	 * workingPeriodFromFloat.result; // e.g. "0.333333333333333
	 */
	getSetting(module, name, asString = true) {
		return new SettingObject(this, module, name, asString);
	}



	/**
	 * Deletes records
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {number|number[]} keys - List of keys
	 */
	deleteEntity(entity, keys) {
		if (!keys || (Array.isArray(keys) && keys.length === 0)) return;
		new DeleteEntity(this, entity, keys);
	}

	/**
	 * Provides access to the methods of a constructed WsObject
	 * Methods are isolated from RemoteObjects because they contain implicit executeBatch() operations
	 * @type {WsObject}
	 */
	get ws() {
		return new WsObject(this);
	}

	/**
	 * Efficy Enterprise constants
	 * @readonly
	 * @enum {object}
	 */
	constants = {
		account_kind: {
			user: 0,
			group: 1,
			resource: 2,
			team: 3
		},
		file_type: {
			embedded: 1,
			linked: 2,
			remote: 4,
			large: 5
		},
		access_code: {
			search: 1,
			read: 2,
			write: 4,
			delete: 8,
			showcontent: 16,
			addcontent: 32,
			modifycontent: 64,
			deletecontent: 128,
			secure: 256,
			fullcontrol: 271,
			securecontent: 512,
			nocontent: 2048
		}
	}
}

export { CrmEnv, CrmRpc };
