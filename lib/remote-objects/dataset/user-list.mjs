import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by getUserList operation
 * @extends DataSetObject
  */
class UserList extends DataSetObject {
	constructor(remoteAPI) {
		super(remoteAPI);
	}

	asJsonRpc() {
		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [{"@name": "userlist"}]
		};

		return requestObject;
	}
}

export default UserList;