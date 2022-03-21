import RemoteObject from '../remote-object.mjs';

/**
 * Class uses by operations that return a string result
 * @extends RemoteObject
 * @property {string} result
 */
class StringObject extends RemoteObject {
	result;
	/** @protected */
	operationName;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();
		this.result = this.api.findFunc(this.responseObject, this.operationName)?.["#result"];
	}
}

export default StringObject;