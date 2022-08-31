import RemoteAPI from '../remote-api.mjs';
import RemoteObject from './remote-object.mjs';
import DataSetList from './dataset/list.mjs';
import {ParseGentle, ParseHard} from './utils/parsing.mjs';
import DataSetObject from './dataset/dataset-object.mjs';

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
			})
		}

		if (typeof this.#master1Data === "object" && Object.keys(this.#master1Data).length > 0) {
			requestObject["@func"].push({
				"@name": "update",
				"tableview": 1,
				"@data": this.#master1Data
			})
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

export default EditRelationObject;