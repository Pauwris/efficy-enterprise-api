import ListObject from './list-object.mjs';

/**
 * Class returned by getSystemSettings operations.
 * @extends ListObject
 */
class SystemSettings extends ListObject {
	constructor(remoteAPI) {
		super(remoteAPI);
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api = {
			"@name": "systemsettings"
		}

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default SystemSettings;