/**
 * Class to define the parameters of the Efficy Enterprise server
 */
class CrmEnv {
	#name = "CrmEnv";
	#isNode = (typeof process !== "undefined" && process?.versions?.node ? true : false);

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
			this.setEnv({
				url: window.location.origin
			});
		}
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
	}

	/**
	 * Returns true if this code runs in node.js
	 * @type {boolean}
	 */
	get isNode() {
		return this.#isNode;
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

export default CrmEnv