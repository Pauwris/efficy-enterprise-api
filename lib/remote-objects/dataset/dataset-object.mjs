import RemoteObject from '../remote-object.mjs';
import DataSet from './type.mjs';

/**
 * Represents a remotely fetched Efficy DataSet transformed as an array of row items
 * @extends RemoteObject
 */
class DataSetObject extends RemoteObject {
	#items;
	#item;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	dataSetName;

	/** @protected */
	afterExecute() {
		super.afterExecute();

		const dso = new DataSet("main");
		dso.setItems(this.api.findDataSetArray(this.responseObject, this.dataSetName));
		this.#items = dso.items;
		this.#item = dso.item;
	}

	/**
	 * The to array converted dataset
	 * @type {array}
	 */
	get items() {
		return this.#items;
	}

	/**
	 * When exists, the first item of the items array, else null
	 * @type {array}
	 */
	get item() {
		return this.#item;
	}
}

export default DataSetObject;