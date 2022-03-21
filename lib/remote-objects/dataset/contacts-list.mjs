import DataSetObject from './dataset-object.mjs';

/**
 * Class returned by searchContactsByEmail, searchContactsByPhone operations
 * @extends DataSetObject
 * @param {Array<string>} [recipients=[]] - The list of email addresses
 * @param {string} [phoneNumber=""] - The phone number, doesn't have to be stripped from formatting
 */
class ContactsList extends DataSetObject {
	constructor(remoteAPI, recipients = [], phoneNumber = "") {
		super(remoteAPI);
		this.recipients = recipients;
		this.phoneNumber = phoneNumber;
	}

	asJsonRpc() {
		var api;

		if (Array.isArray(this.recipients) && this.recipients.length > 0) {
			api = {
				"@name": "contactidsfromemailaddresses",
				"recipients": this.recipients.join(";")
			}
		} else if (this.phoneNumber) {
			api = {
				"@name": "searchcontactsbyphone",
				"phonenumber": this.phoneNumber
			}
		}

		if (!api) throw Error("ContactsList.asJsonRpc::unable to define the operation @name");

		const requestObject = this.requestObject = {
			"#id": this.id,
			"@name": "api",
			"@func": [api]
		};

		return requestObject;
	}
}

export default ContactsList;