import StringObject from './string-object.mjs';

/**
 * Class returned by getSetting operation
 * @extends StringObject
 * @param {string} name - The name of the module (JSON object) that owns the setting.
 * @param {string} module - The name of the setting.
 * @param {boolean} [asString=true] - If true, the settings of type TDateTime will be returned as a string formatted with the ShortDateTime format. If false, it will be returned as a float value.
 */
class SettingObject extends StringObject {
	module;
	name;
	asString;

	constructor(remoteAPI, module, name, asString = true) {
		super(remoteAPI);
		this.operationName = "getsetting";
		this.module = module;
		this.name = name;
		this.asString = typeof asString === "boolean" ? asString : asString = true;
		this.api.registerObject(this);
	}

	/** @protected */
	asJsonRpc() {
		const api =  {
			"@name": this.operationName,
			"module": this.module,
			"name": this.name,
			"asstring": this.asString
		};

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default SettingObject;