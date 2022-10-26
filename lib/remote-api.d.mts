export default RemoteAPI;
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
declare class RemoteAPI {
    /**
     * Construct a RemoteAPI object
     * @param {CrmEnv} [crmEnv=undefined] - When empty, uses the Efficy context of the browser
     * @param {function} [logFunction=undefined] - Your (custom) log function to call for requests and responses, e.g. console.log
     * @param {number} [threadId=undefined] - Unique thread ID for logging purposes
     */
    constructor(crmEnv?: CrmEnv, logFunction?: Function, threadId?: number);
    crmEnv: CrmEnv;
    remoteObjects: any[];
    requestCounter: number;
    threadId: number;
    lastResponseObject: any;
    logFunction: Function;
    errorFunction: any;
    /**
     * Execute all assembled and queued RPC operations
     */
    executeBatch(): Promise<void>;
    throwError(message: any): void;
    /**
     * Logoff the remote session
     */
    logoff(): void;
    /** @private */
    private registerObject;
    /** @private */
    private post;
    sessionId: string;
    /** @private */
    private findDataSetArray;
    findListArray(resp: any, listName?: string): any[];
    /** @private */
    private findAttachment;
    /** @private */
    private findFunc;
    /** @private */
    private findFunc2;
    /** @private */
    private findFuncArray;
    /** @private */
    private findFuncArray2;
    /** @private */
    private findFuncCategoryArray;
    /** @private */
    private findFuncDetailArray;
    /** @private */
    private getRpcException;
    #private;
}
import CrmEnv from "./crm-env.mjs";
//# sourceMappingURL=remote-api.d.mts.map