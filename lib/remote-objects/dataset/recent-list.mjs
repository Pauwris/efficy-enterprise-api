import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by consultRecent operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} [extraFields=[]] - A list of extra fields to consult for each recent entity record, e.g. ["POSTCODE", "CITY"]
 */
class RecentList extends DataSetObject {
	constructor(remoteAPI, entity, extraFields = []) {
		super(remoteAPI);
		if (extraFields && !Array.isArray(extraFields)) throw TypeError("RecentListEx.constructor::extraFields is not an array");
		this.entity = entity;
		this.extraFields = extraFields;
	}

	asJsonRpc() {
		const api = {
			"@name": "recentlistex",
			"entity": this.entity,
			"extrafields": this.extraFields.join(","),
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default RecentList;