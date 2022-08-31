import RemoteObject from './remote-object.mjs';
import DataSetObject from './dataset/dataset-object.mjs';

/**
 * Class returned by methods such as getCategoryCollection
 * @extends DataSetObject
 */
export class CollectionObject extends DataSetObject {
	constructor(remoteAPI, entity, detail) {
		super(remoteAPI);
		this.dataSetName = "collection";
		this.entity = entity;
		this.detail = detail;
	}

	asJsonRpc() {
		const api = {
			"@name": "getcategorycollection"
		}

		if (this.entity) api.entity = this.entity;
		if (this.detail) api.detail = this.detail;

		const requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

/**
 * Class returned by methods such as deleteEntity
 * @extends RemoteObject
 */
 export class DeleteEntity extends RemoteObject {
	constructor(remoteAPI, entity, keys) {
		super(remoteAPI);
		this.entity = entity;
		this.keys = Array.isArray(keys) ? keys : [keys];
		this.api.registerObject(this);
	}

	asJsonRpc() {
		const api = {
			"@name": "delete",
			"entity": this.entity,
			"keys":this.keys.join(";")
		}

		const requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}
