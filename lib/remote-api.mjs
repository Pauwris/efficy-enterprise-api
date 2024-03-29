import nodeFetch from 'node-fetch';

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
			this.throwError(`${this.#name}.readEnv::${ex.message}`)
		}
	}

	#fetchOptions = {
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		credentials: 'include' // Always send user credentials (cookies, basic http auth, etc..), even for cross-origin calls.
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
		var index = items.length
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
	 * Logoff the remote session
	 */
	logoff() {
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
				this.throwError(`invalid JSON response from resource '${requestUrl}'`)
			}

			rql.setResponse(response, responseObject);
			rql.exception = this.getRpcException(responseObject);

			// @ts-ignore
			if (typeof response.headers.raw === "function") {
				// @ts-ignore
				const cookies = setCookie(response.headers.raw()['set-cookie'], null);
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
		if (!result || typeof result["#data"] !== "object" || result["#data"] === null) return;

		if (Array.isArray(result["#data"])) {
			return result["#data"]; // Efficy Enterprise
		} else if (Array.isArray(result["#data"]["data"])) {
			return result["#data"]["data"]; // Efficy U (with earlier bug)
		}
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

/*
 * Platform agnostic solution for the definition of fetch. Lib node-fetch is excluded by rollup ignore plugin
 */
const isNode = (typeof process !== "undefined" && process?.versions?.node ? true : false);
if (isNode) {
	// @ts-ignore
	globalThis.fetch = nodeFetch;
}

export default RemoteAPI;