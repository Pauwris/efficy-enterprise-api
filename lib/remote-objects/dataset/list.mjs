import RemoteObject from '../remote-object.mjs'
import DataSetObject from './dataset-object.mjs'
import DataSet from './type.mjs'

/**
 * Groups a list of DataSet operations that are shared between ConsultObject and EditObject
 * @extends {RemoteObject}
 */
class DataSetList extends RemoteObject {
	#master;
	#master1;
	#tableView;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.resetState();
	}

	/**
	 * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
	 * @returns {DataSetObject}
	 */
	getMasterDataSet(masterView = 0) {
		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		//return this.#master = new DataSet("master");

		if (masterView > 0) {
			this.#master1 = new DataSet("master", undefined, undefined, undefined);
			this.#master1.tableView = 1;
			return this.#master1;
		} else {
			this.#master = new DataSet("master", undefined, undefined, undefined);
			return this.#master;
		}
	}

	/**
	 * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
	 * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
	 * @returns {DataSetObject}
	 */
	getCategoryDataSet(categoryName) {
		if (typeof categoryName !== "string") throw new TypeError("DataSetList.getCategoryDataSet::categoryName is not a string");

		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		return this.#tableView["category"][categoryName] = new DataSet("category", categoryName);
	}

	/**
	 * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
	 * @param {string} detail - The detail name, e.g. "Comp"
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
	 * @returns {DataSetObject}
	 */
	getDetailDataSet(detail, filter, includeBlobContent) {
		if (typeof detail !== "string") throw new TypeError("DataSetList.getDetailDataSet::detail is not a string");
		if (filter && typeof filter !== "string") throw new TypeError("DataSetList.getDetailDataSet::filter is not a string");
		if (includeBlobContent != null && typeof includeBlobContent !== "boolean") throw new TypeError("DataSetList.getDetailDataSet::includeBlobContent is not a boolean");

		// @ts-ignore: for simplicity, we only document DataSetObject and not the type
		return this.#tableView["detail"][detail] = new DataSet("detail", detail, filter, includeBlobContent);
	}

	resetState() {
		this.#master = null;
		this.#master1 = null;
		this.#tableView = {
			category: {},
			detail: {}
		}
	}

	get funcs() {
		const array = [];

		this.#master && array.push(this.#master.func);
		this.#master1 && array.push(this.#master1.func);

		Object.keys(this.#tableView).forEach(tvName => {
			const tableView = this.#tableView[tvName];
			Object.keys(tableView).forEach(fnName => {
				const dso = tableView[fnName];
				array.push(dso.func);
			})
		})

		return array;
	}

	afterExecute() {
		this.#master && this.#setDsoItems(this.#master);
		this.#master1 && this.#setDsoItems(this.#master1);

		Object.keys(this.#tableView).forEach(listName => {
			const tableView = this.#tableView[listName];
			Object.keys(tableView).forEach(funcName => {
				this.#setDsoItems(tableView[funcName]);
			})
		})
	}

	setResponseObject(value) {
		this.responseObject = value;
	}

	/**
	 * Add the remotely fetched master, categories and detail data as properties of data
	 */
	setData(target) {
		target.data = {};
		target.data.master = this.#master?.item;
		target.data.master1 = this.#master1?.item;

		Object.keys(this.#tableView).forEach(listName => {
			const tableView = this.#tableView[listName];
			target.data[listName] = {};
			Object.keys(tableView).forEach(funcName => {
				target.data[listName][funcName] = listName === "category" ? tableView[funcName].item : tableView[funcName].items;
			})
		})
	}

	#setDsoItems(dso) {
		var array;

		if (dso instanceof DataSet === false) throw new TypeError("DataSetList.setDsoItems::dso is not an DataSet type");
		if (dso.tableView > 0) {
			array = this.api.findFuncArray2(this.responseObject, dso.type, "tableview", dso.tableView);
		} else {
			array = this.api.findFuncArray2(this.responseObject, dso.type, dso.type, dso.name);
		}

		dso.setItems(array);
	}
}

export default DataSetList;