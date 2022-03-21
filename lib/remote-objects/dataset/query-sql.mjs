import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
class QuerySQLObject extends DataSetObject {
	constructor(remoteAPI, sql, queryParams = [], loadBlobs = false, recordCount = 0) {
		super(remoteAPI);
		this.sql = sql;
		this.queryParams = queryParams;
		this.loadBlobs = typeof loadBlobs === "boolean" ? loadBlobs : false;
		this.recordCount = recordCount;
	}

	asJsonRpc() {
		const api = {
			"@name": "executesqlquery",
			"sql": this.sql,
			"loadBlobs": this.loadBlobs,
			"recordCount": this.recordCount
		}

		if (Array.isArray(this.queryParams)) {
			api.queryparams = this.queryParams.join("\n");
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default QuerySQLObject;