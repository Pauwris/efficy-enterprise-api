import DataSetObject from './dataset/dataset-object.mjs';

/**
 * Class returned by search operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class SearchObject extends DataSetObject {
	/** @private */
	entity;
	/** @private */
	method;
	/** @private */
	value;
	/** @private */
	own;
	/** @private */
	contains;
	/** @private */
	opened;

	constructor(remoteAPI, entity, method, value, own, contains, opened) {
		super(remoteAPI);
		this.entity = entity;
		this.method = method;
		this.value = value;
		this.own = own;
		this.contains = contains;
		this.opened = opened;
	}

	/** @protected */
	asJsonRpc() {
		const requestObject = {
			"#id": this.id,
			"@name": "search",
			"@func": [
				{"@name": "master", "tableview":0}
			]
		};

		["entity", "method", "value", "method", "contains", "own"].forEach(property => {
			if (this[property] != null) requestObject[property] = this[property];
		});

		return requestObject;
	}
}

export default SearchObject