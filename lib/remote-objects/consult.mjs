import RemoteAPI from '../remote-api.mjs';
import RemoteObject from './remote-object.mjs';
import DataSetList from './dataset/list.mjs';
import {ParseGentle} from './utils/parsing.mjs';
import DataSetObject from './dataset/dataset-object.mjs';

/**
 * Class returned by openConsultObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the consulted record
 * @property {number} key - The key of the consulted record
 * @property {number} consulthandle - The handle of the consult operation
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
class ConsultObject extends RemoteObject {
	entity;
	key;
	consulthandle;
	data;

	/** @protected */
	closecontext;

	#otherFuncs;
	#dataSetList;
	#isDirty;

	/**
	 * Opens an consult context for the record identified by entity and key.
	 * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
	 * @param {RemoteAPI} remoteAPI
	 * @param {string} entity - The entity name of the consulted record, e.g. "Comp"
	 * @param {number} key - The key of the consulted record
	 * @param {number} [consultHandle] - Possibility to pass an existing consultHandle
	 */
	constructor(remoteAPI, entity, key, consultHandle) {
		super(remoteAPI);
		this.entity = entity;
		this.key = ParseGentle.toFloatKey(key);
		this.consulthandle = consultHandle;
		this.#dataSetList = new DataSetList(remoteAPI);

		this.#resetState();
		this.#setDirty();
	}

	#resetState() {
		this.closecontext = null;
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
	 * Retrieves a master [DatasetObject]{@link Dataset.html} from the consult context.
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
	 * Closes the context and frees the memory on the web server.
	 */
	closeContext() {
		this.closecontext = true;
		this.#setDirty();
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "consult",
			"@func": []
		};

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "consulthandle", "closecontext"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		requestObject["@func"].push(...this.#dataSetList.funcs);
		requestObject["@func"].push(...this.#otherFuncs);

		return requestObject;
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();

		// lowercase properties are required for the case sensitive JSON RPC
		["entity", "key", "consulthandle", "closecontext"].forEach(property => {
			this[property] = this.responseObject[property];
		});

		this.#dataSetList.setResponseObject(this.responseObject);
		this.#dataSetList.afterExecute();
		this.#dataSetList.setData(this);

		this.#resetState();
	}
}

export default ConsultObject;