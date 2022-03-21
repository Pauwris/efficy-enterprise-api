import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class QueryObject extends DataSetObject {
	constructor(remoteAPI, key, master, detail, queryParams = [], loadBlobs = false, recordCount = 0) {
		super(remoteAPI);
		this.key = key;
		this.master = master;
		this.detail = detail;
		this.queryParams = queryParams;
		this.loadBlobs = typeof loadBlobs === "boolean" ? loadBlobs : false;
		this.recordCount = recordCount;
	}

	asJsonRpc() {
		const api = {
			"@name": "query",
			"loadBlobs": this.loadBlobs,
			"recordCount": this.recordCount
		}

		if (typeof this.key === "number") api.key = this.key;
		if (typeof this.master === "number") api.master = this.master;
		if (typeof this.detail === "number") api.detail = this.detail;

		if (Array.isArray(this.queryParams)) {
			api.queryparams = this.queryParams.join("|");
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default QueryObject;