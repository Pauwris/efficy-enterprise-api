import StringObject from './string-object.mjs';

/**
 * Class returned by API property operation such as currentdatabasealias, currentuserfullname
 * @extends StringObject
 * @param {string} name - The name of the API property
 */
class PropertyObject extends StringObject {
	name;

	constructor(remoteAPI, name) {
		super(remoteAPI);
		this.operationName = name;
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api = {
			"@name": this.operationName
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default PropertyObject;