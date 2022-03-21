import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by consultFavorites operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 */
class FavoriteList extends DataSetObject {
	constructor(remoteAPI, entity) {
		super(remoteAPI);
		this.entity = entity;
	}

	asJsonRpc() {
		const api = {
			"@name": "favoritelist",
			"entity": this.entity
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default FavoriteList;