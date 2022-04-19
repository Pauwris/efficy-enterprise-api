import RemoteAPI from '../remote-api.mjs';
import RemoteObject from './remote-object.mjs';
import DataSetList from './dataset/list.mjs';
import AttachmentList from './attachment/list.mjs';
import AttachmentObject from './attachment/type.mjs'
import {ParseGentle, ParseHard} from './utils/parsing.mjs';
import DataSetObject from './dataset/dataset-object.mjs';

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
		this.key = ParseGentle.toFloatKey(key)
		this.#dataSetList = new DataSetList(remoteAPI);
		this.#attachmentList = new AttachmentList(remoteAPI);

		this.inserted = (this.key === 0);
		this.edithandle = editHandle;

		this.#resetState();
		this.#setDirty();
	}

	#resetState() {
		this.commit = null;
		this.closecontext = null;
		this.inserted = null;
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
		}
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
		}
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
				})
			})
		}

		requestObject["@func"].push(...this.#otherFuncs);

		// Placed after #otherFuncs, because they could have the activateCategory
		if (typeof this.#categories === "object" && Object.keys(this.#categories).length > 0) {
			Object.keys(this.#categories).forEach(categoryName => {
				requestObject["@func"].push({
					"@name": "update",
					"category": categoryName,
					"@data": this.#categories[categoryName]
				})
			})
		}

		requestObject["@func"].push(...this.#dataSetList.funcs);
		requestObject["@func"].push(...this.#attachmentList.funcs);

		if (typeof this.#masterData === "object" && Object.keys(this.#masterData).length > 0) {
			requestObject["@func"].push({
				"@name": "update",
				"@data": this.#masterData
			})
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

export default EditObject;