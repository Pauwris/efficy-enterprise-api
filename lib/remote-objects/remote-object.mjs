import uuidv4 from './utils/uuidv4.mjs';
import {ParseGentle} from './utils/parsing.mjs';

/**
 * Low level class representing an RPC operation
 */
class RemoteObject {
	#remoteAPI;

	/** @protected */
	requestObject;

	/** @protected */
	responseObject;

	/** @protected */
	id;

	constructor(remoteAPI) {
		this.#remoteAPI = remoteAPI;
		this.id = uuidv4();
		this.requestObject = {};
		this.responseObject = {};
	}

	/** @protected */
	get api() {
		return this.#remoteAPI;
	}

	/** @protected */
	afterExecute() {
		this.responseObject = ParseGentle.numberProperties(this.responseObject, ["edithandle", "key"]);
	}
}

export default RemoteObject;