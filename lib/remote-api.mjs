import CrmEnv from "./crm-env.mjs";
import setCookie from './remote-objects/utils/set-cookie.mjs';
import findDeep from './remote-objects/utils/findDeep.mjs'

/**
 * Class with low-level JSON RPC functions
 * @see {@link https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser}
 * @property {CrmEnv} crmEnv
 * @property {array} remoteObjects
 * @property {number} requestCounter
 * @property {number} threadId
 * @property {object} lastResponseObject
 * @property {function} log
 */
class RemoteAPI {
	#name = "RemoteAPI";
	crmEnv;
	remoteObjects;
	logFunction;
	requestCounter = 0;
	threadId = 1;
	lastResponseObject;

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
			throw Error(`${this.#name}.readEnv::${ex.message}`)
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
			throw Error(`${this.#name}.executeBatch::asJsonRpc\n${ex.message}`);
		}

		// Nothing to execute, ignore silently
		if (!requestObject.length) return;

		try {
			const response = await this.post(requestObject);
			if (!Array.isArray(response)) throw new TypeError(`${this.#name}.executeBatch::responseObject is not an Array`);
			responseObject.push(...response);
			this.lastResponseObject = responseObject;
		} catch(ex) {
			throw Error(`${this.#name}.executeBatch::${ex.message}`);
		}

		// Add response info to operations and remove executed operations (handled or not)
		const items = this.remoteObjects;
		var index = items.length
		while (index--) {
			const operation = items[index];
			const respOper = responseObject.find(respOper => respOper["#id"] === operation.id);
			if (!respOper)
			throw Error(`${this.#name}.executeBatch::cannot find response for queued operation [${index}/${items.length}]`);
			Object.assign(operation.responseObject, respOper);
			operation.afterExecute();
			items.splice(index, 1);
		}

		// Error handling
		const ex = this.getRpcException(responseObject);
		if (ex) throw Error(`${ex["#error"].errorcode} - ${ex["#error"].errorstring}`);
	}

	/**
	 * Logoff the remote session, not possible when crmEnv.isEfficy === true
	 */
	logoff() {
		if (this.crmEnv.isEfficy) {
			throw Error(`${this.#name}.logoff::method disable for this environment`);
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

		// switch between native browser and node.js
		if (typeof fetch !== "function") {
			var nodeLib = await import('node-fetch');
			if (nodeLib) {
				// @ts-ignore
				global.fetch = nodeLib.default;
			}
		}

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
				throw Error(`invalid JSON response from resource '${requestUrl}'`)
			}

			rql.setResponse(response, responseObject);
			rql.exception = this.getRpcException(responseObject);

			if (!this.crmEnv.isEfficy) {
				// @ts-ignore
				const cookies = setCookie(response.headers.raw()['set-cookie']);
				if (cookies.length > 0) {
					this.crmEnv.cookies = cookies;
					this.sessionId = this.crmEnv.shortSessionId;
				}
			}

			rql.log();

			if (responseObject.error === true) {
				throw Error(`/json: ${responseObject.code} - ${responseObject.message}`);
			}

			return responseObject;
		} catch(ex) {
			throw Error(`${this.#name}.post::${ex.message}`);
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
		return responseObject.find(operation => operation["@name"] === "exception");
	}
};

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
		this.elapsed_ms = this.d_response.getTime() - this.d_request.getTime()
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
};

export default RemoteAPI;