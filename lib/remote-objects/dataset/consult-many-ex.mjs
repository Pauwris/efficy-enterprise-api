import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by consultManyEx operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} whereFields - A list of field names to match (used as WHERE criteria), e.g. ["NAME", "OPENED"]
 * @param {array} whereValues - A list of values to match, e.g. ["Efficy", "1"]
 * @param {string} orderByFields - SQL sort expression, e.g. "K_COMPANY desc"
 */
class ConsultManyEx extends DataSetObject {
	constructor(remoteAPI, entity, whereFields, whereValues, orderByExpression) {
		super(remoteAPI);
		this.entity = entity;
		this.whereFields = whereFields;
		this.whereValues = whereValues;
		this.orderByExpression = orderByExpression;
	}

	asJsonRpc() {
		const api = {
			"@name": "consultmanyex",
			"entity": this.entity,
			"findfield": this.whereFields.join(";"),
			"keys": this.whereValues.join(";"),
			"orderbyfield": this.orderByExpression,
			"separator": ";"
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default ConsultManyEx;