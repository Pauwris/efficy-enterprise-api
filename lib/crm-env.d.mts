export default CrmEnv;
/**
 * Class to define the parameters of the Efficy Enterprise server
 */
declare class CrmEnv {
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
    constructor(env?: {
        url?: string;
        customer?: string;
        logOff?: boolean;
        apiKey?: string;
        user?: string;
        pwd?: string;
        cookies?: any[];
    });
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
    setEnv(env: {
        url?: string;
        customer?: string;
        logOff?: boolean;
        apiKey?: string;
        user?: string;
        pwd?: string;
        cookies?: any[];
    }): void;
    url: any;
    customer: string;
    logOff: boolean;
    apiKey: string;
    user: string;
    pwd: string;
    cookies: any[];
    /**
     * Returns true if this code runs in node.js
     * @readonly
     * @type {boolean}
     */
    readonly get isNode(): boolean;
    /**
     * Returns true if this code runs on the browser
     * @readonly
     * @type {boolean}
     */
    readonly get isEfficy(): boolean;
    /**
     * Returns the request header "cookie", e.g. 'EfficySession=3B826396-22AE9698'
     * @readonly
     * @type {string}
     */
    readonly get cookieHeader(): string;
    /**
     * Returns the session ID, e.g. '3B826396-22AE9698'
     * @readonly
     * @type {string}
     */
    readonly get sessionId(): string;
    /**
     * Returns the first part of the session ID, e.g. '3B826396'
     * @readonly
     * @type {string}
     */
    readonly get shortSessionId(): string;
    #private;
}
//# sourceMappingURL=crm-env.d.mts.map