/**
 * Class to define the parameters of the Efficy Enterprise server
 */
export class CrmEnv {
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
     * @type {boolean}
     */
    get isNode(): boolean;
    /**
     * Returns true if this code runs on the browser
     * @type {boolean}
     */
    get isEfficy(): boolean;
    /**
     * Returns the request header "cookie", e.g. 'EfficySession=3B826396-22AE9698'
     * @type {string}
     */
    get cookieHeader(): string;
    /**
     * Returns the session ID, e.g. '3B826396-22AE9698'
     * @type {string}
     */
    get sessionId(): string;
    /**
     * Returns the first part of the session ID, e.g. '3B826396'
     * @type {string}
     */
    get shortSessionId(): string;
    #private;
}
/**
 * Class to create Remote Objects
 * @extends RemoteAPI
*/
export class CrmRpc extends RemoteAPI {
    /**
     * Retrieves the alias (name) of the currently connected database
     * @returns {PropertyObject}
     */
    get currentDatabaseAlias(): PropertyObject;
    /**
     * Retrieves the current database timezone
     * @returns {PropertyObject}
     */
    get currentDatabaseTimezone(): PropertyObject;
    /**
     * Retrieves the current license name
     * @returns {PropertyObject}
     */
    get currentLicenseName(): PropertyObject;
    /**
     * Retrieves the current user full name
     * @returns {PropertyObject}
     */
    get currentUserFullName(): PropertyObject;
    /**
     * Retrieves the group memberships of the current user as semicolon separated string list, e.g. "1;28;292;936"
     * @returns {PropertyObject}
     */
    get currentUserGroups(): PropertyObject;
    /**
     * Retrieves the current user key, e.g. "4"
     * @returns {PropertyObject}
     */
    get currentUserId(): PropertyObject;
    /**
     * Retrieves the current user code, e.g. "CRM01"
     * @returns {PropertyObject}
     */
    get currentUserCode(): PropertyObject;
    /**
     * Retrieves the current user timezone
     * @returns {PropertyObject}
     */
    get currentUserTimezone(): PropertyObject;
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
    openConsultObject(entity: string, key: number): ConsultObject;
    /**
     * Create and return an ConsultObject based on an existing consultHandle
     * @param {number} consultHandle
     * @param {string} entity - Weird, but the RPC interface requires the entity of the consultHandle!
     */
    getConsultObject(consultHandle: number, entity: string): ConsultObject;
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
    openEditObject(entity: string, key?: number): EditObject;
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
    openEditRelationObject(entity: string, detail: string, key: number, detailKey: number, relationId?: number): EditRelationObject;
    /**
     * Create and return an EditObject based on an existing editHandle
     * @param {number} editHandle
     */
    getEditObject(editHandle: number): EditObject;
    /**
     * Create and return an EditObject based on an existing editHandle
     * @param {number} editHandle
     */
    getEditRelationObject(editHandle: number): EditRelationObject;
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
    search(entity: string, method: string, value: string, own?: boolean, contains?: boolean, opened?: boolean): DataSetObject;
    /**
     * Returns all the Contacts having one of the e-mail provided in their e-mail fields (or in the Cont_Comp relation).
     * @param {Array<string>} recipients - The list of email addresses
     * @returns {DataSetObject}
     * @example
     * const contactsByEmail = crm.searchContactsByEmail(["john.doe@efficy.com", "john.doe@outlook.com"]);
     */
    searchContactsByEmail(recipients: Array<string>): DataSetObject;
    /**
     * Returns all the first Contacts having a match with the provided (formatted) phone number
     * @param {string} phoneNumber - The phone number, doesn't have to be stripped from formatting
     * @returns {DataSetObject}
     * @example
     * const contactsByPhone = crm.searchContactsByPhone("+32 474 00 00 00");
     */
    searchContactsByPhone(phoneNumber: string): DataSetObject;
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
    executeDatabaseQuery(idQuery: number, queryParameters?: any[], loadBlobs?: boolean, recordCount?: number): DataSetObject;
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
    executeSystemQuery(master: number, detail: number, queryParameters: any[], loadBlobs?: boolean, recordCount?: number): DataSetObject;
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
    executeSqlQuery(sqlQueryText: string, queryParameters: any[], loadBlobs?: boolean, recordCount?: number): DataSetObject;
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
    consultManyEx(entity: string, whereFields: any[], whereValues: any[], orderByExpression: string): DataSetObject;
    /**
     * Consult your recent records, optionally extended by additional fields.
     * @param {string} entity - The entity name, e.g. "Comp"
     * @param {array} [extraFields=[]] - A list of extra fields to consult for each recent entity record, e.g. ["POSTCODE", "CITY"]
     * @returns {DataSetObject}
     * @example
     * const compRecents = crm.consultRecent("Comp");
     * const compRecentsEx = crm.consultRecent("Comp", ["CITY", "COUNTRY"]);
     */
    consultRecent(entity: string, extraFields?: any[]): DataSetObject;
    /**
     * Consult your favorite records.
     * @param {string} entity - The entity name, e.g. "Comp"
     * @returns {DataSetObject}
     * @example
     * const compFavorites = crm.consultFavorites("Comp");
     */
    consultFavorites(entity: string): DataSetObject;
    /**
     * Request the accessible categories - for the current user - of the given entity
     * @param {string} entity - The entity name, e.g. "Comp"
     * @returns {DataSetObject}
     * @example
     * const compCategories = crm.getCategoryCollection("comp");
     */
    getCategoryCollection(entity: string): DataSetObject;
    /**
     * Requests a list of users, groups and resources
     * @returns {DataSetObject}
     * @example
     * const userList = crm.getUserList();
     */
    getUserList(): DataSetObject;
    /**
     * Request a list of system settings. Use the Map object to retrieve settings
     * @returns {ListObject}
     * @example
     * const settings = crm.getSystemSettings();
     * await crm.executeBatch();
     * settings.map.get("ShortDateFormat"); // e.g. "dd/mm/yyyy"
     * settings.map.forEach(console.log); // prints each setting on console
     */
    getSystemSettings(): ListObject;
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
    getSetting(module: string, name: string, asString?: boolean): StringObject;
    /**
     * Deletes records
     * @param {string} entity - The entity name, e.g. "Comp"
     * @param {number|number[]} keys - List of keys
     */
    deleteEntity(entity: string, keys: number | number[]): void;
    /**
     * Provides access to the methods of a constructed WsObject
     * Methods are isolated from RemoteObjects because they contain implicit executeBatch() operations
     * @type {WsObject}
     */
    get ws(): WsObject;
    /**
     * Efficy Enterprise constants
     * @readonly
     * @enum {object}
     */
    readonly constants: {
        account_kind: {
            user: number;
            group: number;
            resource: number;
            team: number;
        };
        file_type: {
            embedded: number;
            linked: number;
            remote: number;
            large: number;
        };
        access_code: {
            search: number;
            read: number;
            write: number;
            delete: number;
            showcontent: number;
            addcontent: number;
            modifycontent: number;
            deletecontent: number;
            secure: number;
            fullcontrol: number;
            securecontent: number;
            nocontent: number;
        };
    };
}
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
    logFunction: Function;
    requestCounter: number;
    threadId: number;
    lastResponseObject: any;
    /**
     * Execute all assembled and queued RPC operations
     */
    executeBatch(): Promise<void>;
    /**
     * Logoff the remote session, not possible when crmEnv.isEfficy === true
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
/**
 * Class returned by API property operation such as currentdatabasealias, currentuserfullname
 * @extends StringObject
 * @param {string} name - The name of the API property
 */
declare class PropertyObject extends StringObject {
    constructor(remoteAPI: any, name: any);
    name: any;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": any;
        }[];
    };
}
/**
 * Class returned by openConsultObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the consulted record
 * @property {number} key - The key of the consulted record
 * @property {number} consulthandle - The handle of the consult operation
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
declare class ConsultObject extends RemoteObject {
    /**
     * Opens an consult context for the record identified by entity and key.
     * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
     * @param {RemoteAPI} remoteAPI
     * @param {string} entity - The entity name of the consulted record, e.g. "Comp"
     * @param {number} key - The key of the consulted record
     * @param {number} [consultHandle] - Possibility to pass an existing consultHandle
     */
    constructor(remoteAPI: RemoteAPI, entity: string, key: number, consultHandle?: number);
    entity: string;
    key: number;
    consulthandle: number;
    data: any;
    /** @protected */
    protected closecontext: any;
    /**
     * Retrieves a master [DatasetObject]{@link Dataset.html} from the consult context.
     * @returns {DataSetObject}
     */
    getMasterDataSet(): DataSetObject;
    /**
     * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
     * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
     * @returns {DataSetObject}
     */
    getCategoryDataSet(categoryName: string): DataSetObject;
    /**
     * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
     * @returns {DataSetObject}
     */
    getDetailDataSet(detail: string, filter?: string, includeBlobContent?: boolean): DataSetObject;
    /**
     * Closes the context and frees the memory on the web server.
     */
    closeContext(): void;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": any[];
    };
    #private;
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
declare class EditObject extends RemoteObject {
    /**
     * Opens an edit context for the record identified by entity and key.
     * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
     * @param {RemoteAPI} remoteAPI
     * @param {number} editHandle - Possibility to pass an existing editHandle
     * @param {string} entity - The entity name, e.g. "Comp"
     * @param {number} [key=0] - The key of the record. Use key = 0 to create a new record
     */
    constructor(remoteAPI: RemoteAPI, editHandle: number, entity: string, key?: number);
    entity: string;
    key: number;
    edithandle: number;
    data: any;
    /** @protected */
    protected commit: any;
    /** @protected */
    protected closecontext: any;
    /** @protected */
    protected inserted: boolean;
    /**
     * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
     * @returns {DataSetObject}
     */
    getMasterDataSet(): DataSetObject;
    /**
     * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
     * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
     * @returns {DataSetObject}
     */
    getCategoryDataSet(categoryName: string): DataSetObject;
    /**
     * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
     * @returns {DataSetObject}
     */
    getDetailDataSet(detail: string, filter?: string, includeBlobContent?: boolean): DataSetObject;
    /**
     * Request attachment from FILES table
     * @param {number} k_file
     * @param {number} [version=0]
     * @returns {AttachmentObject}
     */
    getAttachment(k_file: number, version?: number): AttachmentObject;
    /**
     * Updates the field values of a master data set
     * @param {string} name
     * @param {string|number} value
     */
    updateField(name: string, value: string | number): void;
    /**
     * Updates the field values of a master data set.
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateFields(fieldsObj: object): void;
    /**
     * Updates the value of a field of any type in a category data set
     * @param {string} categoryName
     * @param {string} name
     * @param {string|number} value
     */
    updateCategoryField(categoryName: string, name: string, value: string | number): void;
    /**
     * Updates the value of a field of any type in a category data set
     * @param {string} categoryName
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateCategoryFields(categoryName: string, fieldsObj: object): void;
    /**
     * Inserts a detail relation
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number} detailKey - The key of the detail
     * @param {boolean} [linkMainCompany=false]
     * @param {boolean} [retrieveName=false]
     */
    insertDetail(detail: string, detailKey: number, linkMainCompany?: boolean, retrieveName?: boolean): void;
    /**
     * Updates field values of a detail relation. When the detail relation doesn't exist, an exception is thrown.
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number|string} detailKey - The key of the detail. If detailKey is 0, the current detail record is used
     * @param {object} fieldsObj, e.g. {"OPENED": "0"}
     */
    updateDetail(detail: string, detailKey: number | string, fieldsObj: object): void;
    /**
     * Deletes a detail relation
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number|string} detailKey - The key of the detail
     */
    deleteDetail(detail: string, detailKey: number | string): void;
    /**
     * Clears all relations for the specified detail
     * @param {string} detail - The detail name, e.g. "Comp"
     */
    clearDetail(detail: string): void;
    /**
     * Activates a category. If the user does not have the appropriate rights on the category, an exception is thrown.
     * @param {string} categoryName
     */
    activateCategory(categoryName: string): void;
    /**
     * Requests that a unique reference number be generated when committing.
     * @param {number} id - SYS_REFERENCES.K_REFERENCE
     */
    setReference(id: number): void;
    /**
     * Sets the user relations.
     * @param {array} users - The array of user IDs (keys).
     * @param {boolean} [clear=false] - If true, clears the current user selection.
     */
    setUsers(users: any[], clear?: boolean): void;
    /**
     * Sets the security for a user or group.
     * @param {number} account - The user or group for which security is added.
     * @param {number} securityValue - A sum of one or more of the following values: 1 (search), 2 (read), 4 (write), 8 (delete) and 256 (secure). Useful combinations are 7 (read/write), 15 (read/write/delete) and 271 (full control = read/write/delete/secure).
     */
    setUserSecurity(account: number, securityValue: number): void;
    /**
     * Inserts an file
     * @param {number} attachedFileType - 1 = embedded, 2 = linked, 4 = remote, 5 = large
     * @param {string} path - The path of the file that will be saved in the FILES.PATH field.
     */
    insertAttachment(attachedFileType: number, path: string): void;
    /**
     * Updates an embedded file
     * @param {number} key - Leave null or 0 to set the stream of the just inserted Attachment
     * @param {string} base64String
     */
    updateAttachment(key: number, base64String: string): void;
    /**
     * Copies data from an existing record in the database. The same entity as the current is assumed.
     * The table views within the index range minIndex to maxIndex are copied. By default, all table views are copied.
     * To copy a single detail, obtain the table view index using IndexFromDetail and use this value as MinIndex and MaxIndex.
     * @param {number} key - The key of the source record.
     * @param {number} [minTableView=0] - The index of first table view to be copied.
     * @param {number} [maxTableView=999] - The index of last table view to be copied.
     */
    copyFromExisting(key: number, minTableView?: number, maxTableView?: number): void;
    /**
     * Commits the changes to the database.
     */
    commitChanges(): void;
    /**
     * Closes the context and frees the memory on the web server.
     */
    closeContext(): void;
    /**
     * Commits the changes, releases the record and executes closeContext
     */
    closingCommit(): void;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": any[];
    };
    #private;
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
declare class EditRelationObject extends RemoteObject {
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
    constructor(remoteAPI: RemoteAPI, editHandle: number, entity: string, detail: string, key: number, detailKey: number, relationId?: number);
    entity: string;
    detail: string;
    key: number;
    detailkey: any;
    edithandle: number;
    data: any;
    /** @protected */
    protected commit: any;
    /** @protected */
    protected closecontext: any;
    /** @protected */
    protected inserted: boolean;
    relationId: number;
    /**
     * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
     * @param {number} [tableView=0]
     * @returns {DataSetObject}
     */
    getMasterDataSet(tableView?: number): DataSetObject;
    /**
     * Updates the field values of a master data set
     * @param {string} name
     * @param {string|number} value
     */
    updateField(name: string, value: string | number): void;
    /**
     * Updates the field values of a master data set.
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateFields(fieldsObj: object): void;
    /**
     * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
     * @param {string} name
     * @param {string|number} value
     */
    updateReciprocityField(name: string, value: string | number): void;
    /**
     * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateReciprocityFields(fieldsObj: object): void;
    /**
     * Commits the changes to the database.
     */
    commitChanges(): void;
    /**
     * Closes the context and frees the memory on the web server.
     */
    closeContext(): void;
    /**
     * Commits the changes, releases the record and executes closeContext
     */
    closingCommit(): void;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": any[];
    };
    #private;
}
/**
 * Represents a remotely fetched Efficy DataSet transformed as an array of row items
 * @extends RemoteObject
 */
declare class DataSetObject extends RemoteObject {
    /** @protected */
    protected dataSetName: any;
    /**
     * The to array converted dataset
     * @type {array}
     */
    get items(): any[];
    /**
     * When exists, the first item of the items array, else null
     * @type {array}
     */
    get item(): any[];
    #private;
}
/**
 * Class uses by operations that return a list
 * @extends RemoteObject
 * @property {Map} map - The Map object holds key-value pairs and remembers the original order of the keys, {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */
declare class ListObject extends RemoteObject {
    map: any;
    items: any;
}
/**
 * Class uses by operations that return a string result
 * @extends RemoteObject
 * @property {string} result
 */
declare class StringObject extends RemoteObject {
    result: any;
    /** @protected */
    protected operationName: any;
}
/**
 * Class with methods that contain executeBatch commands
 * @extends RemoteObject
*/
declare class WsObject extends RemoteObject {
    /**
     *
     * @param {EditObject} editObject
     * @param {string} filter - Server-side SQL filter expression, added as filter property of [TDataSet](https://help.efficy.io/extras/serverjs.html#TDataSet)
     * @param {boolean} includeBlobContent - On true, returns all blob streams (e.g. attachment, thumb)
     * @returns {Promise<Array>}
     * @example
     * await crm.ws.getFiles(document, `COMMENT like '%.docx'`, false);
     */
    getFiles(editObject: EditObject, filter: string, includeBlobContent: boolean): Promise<any[]>;
    /**
     * Instantly delete files, optionally SQL expression filtered
     * @param {EditObject} editObject
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @example
     * await crm.ws.deleteFiles(document);
     * await crm.ws.deleteFiles(document, `COMMENT like '%template%'`);
     */
    deleteFiles(editObject: EditObject, filter?: string): Promise<void>;
    /**
     * Instantly cleanup files, but keep top X, optionally SQL expression filtered
     * @param {EditObject} editObject
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @param {number} [keepTopX=7] - Keep only the top X files, sorted highest/latest K_SORT first
     * @example
     * await crm.ws.cleanupFiles(document, "", 7);
     * await crm.ws.cleanupFiles(document, `COMMENT like '%template%'`, 0);
     */
    cleanupFiles(editObject: EditObject, filter?: string, keepTopX?: number): Promise<void>;
}
/**
 * Low level class representing an RPC operation
 */
declare class RemoteObject {
    constructor(remoteAPI: any);
    /** @protected */
    protected requestObject: {};
    /** @protected */
    protected responseObject: {};
    /** @protected */
    protected id: string;
    /** @protected */
    protected get api(): any;
    /** @protected */
    protected afterExecute(): void;
    #private;
}
/**
 * Class representing a remotely fetched Attachment
 */
declare class AttachmentObject {
    constructor(key: any);
    key: any;
    setStream(stream: any): void;
    /**
     * get the base64 encoded attachment stream
     * @type {string}
     */
    get base64Stream(): string;
    get func(): {
        "@name": string;
        key: any;
    };
    #private;
}
export {};
//# sourceMappingURL=es.d.ts.map