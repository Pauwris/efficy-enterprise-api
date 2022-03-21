import RemoteObject from '../remote-object.mjs';

/**
 * Class uses by operations that return a list
 * @extends RemoteObject
 * @property {Map} map - The Map object holds key-value pairs and remembers the original order of the keys, {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */
class ListObject extends RemoteObject {
	map; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	afterExecute() {
		super.afterExecute();
		this.items = this.api.findListArray(this.responseObject);

		// https://stackoverflow.com/questions/26264956/convert-object-array-to-hash-map-indexed-by-an-attribute-value-of-the-object
		this.map = new Map(this.items.map(item => [item.split("=")[0], item.split("=")[1]]));
	}
}

export default ListObject;