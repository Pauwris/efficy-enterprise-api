import CrmEnv from './crm-env.mjs';
import RemoteAPI from './remote-api.mjs';
import WsObject from './ws-objects/ws-object.mjs';
import ConsultObject from './remote-objects/consult.mjs';
import EditObject from './remote-objects/edit.mjs';
import SearchObject from './remote-objects/search.mjs';
import {DeleteEntity, CollectionObject} from './remote-objects/api.mjs';

import DataSetObject from './remote-objects/dataset/dataset-object.mjs';
import QueryObject from './remote-objects/dataset/query.mjs';
import QuerySQLObject from './remote-objects/dataset/query-sql.mjs';
import ConsultManyEx from './remote-objects/dataset/consult-many-ex.mjs';
import RecentList from './remote-objects/dataset/recent-list.mjs';
import FavoriteList from './remote-objects/dataset/favorite-list.mjs';
import UserList from './remote-objects/dataset/user-list.mjs';
import ContactsList from './remote-objects/dataset/contacts-list.mjs';

import ListObject from './remote-objects/list/list-object.mjs';
import SystemSettings from './remote-objects/list/system-settings.mjs';

import StringObject from './remote-objects/base-type/string-object.mjs';
import SettingObject from './remote-objects/base-type/setting-object.mjs';

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
	 * Opens a consult context for the Entity.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {string} entity - The entity name, e.g. "Comp"
	 * @param {number} key - The key of the record. Use key = 0 to create a new record.
	 * @returns {ConsultObject}
	 * @example
	 * const comp = crm.openConsultContext("comp", 2);
	 * const dsComp = comp.getMasterDataSet();
	 * const dsCompAddress = comp.getCategoryDataSet("COMP$ADDRESS");
	 * const linkedContacts = comp.getDetailDataSet("cont");
	 * await crm.executeBatch();
	 * const companyNames = [comp.data.master.NAME, comp.data.category["COMP$ADDRESS"].NAME];
	 * comp.closeContext();
	 * await crm.executeBatch();
	 */
	openConsultContext(entity, key) {
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
		return new EditObject(this, entity, key);
	}

	/**
	 * Create and return an EditObject based on an existing editHandle
	 * @param {number} editHandle
	 */
	getEditObject(editHandle) {
		return new EditObject(this, "", 0, editHandle);
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
		return new ContactsList(this, null, phoneNumber);
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
	 * @readonly
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
		}
	}
}

export default CrmRpc;