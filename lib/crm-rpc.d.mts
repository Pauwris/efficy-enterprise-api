export default CrmRpc;
/**
 * Class to create Remote Objects
 * @extends RemoteAPI
*/
declare class CrmRpc extends RemoteAPI {
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
     * @readonly
     * @type {WsObject}
     */
    readonly get ws(): WsObject;
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
import RemoteAPI from "./remote-api.mjs";
import ConsultObject from "./remote-objects/consult.mjs";
import EditObject from "./remote-objects/edit.mjs";
import EditRelationObject from "./remote-objects/edit-relation.mjs";
import DataSetObject from "./remote-objects/dataset/dataset-object.mjs";
import ListObject from "./remote-objects/list/list-object.mjs";
import StringObject from "./remote-objects/base-type/string-object.mjs";
import WsObject from "./ws-objects/ws-object.mjs";
//# sourceMappingURL=crm-rpc.d.mts.map