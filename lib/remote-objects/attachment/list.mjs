import RemoteObject from '../remote-object.mjs'
import Attachment from './type.mjs'

class AttachmentList extends RemoteObject {
	#attachments;

	constructor(remoteAPI) {
		super(remoteAPI);
		this.resetState();
	}

	/**
	 * Request attachment from FILES table
	 * @param {number} k_file
	 * @param {number} [version=0]
	 * @returns {Attachment}
	 */
	getAttachment(k_file, version = 0) {
		if (typeof k_file !== "number") throw new TypeError("AttachmentList.getAttachment::k_file is not a number");
		if (typeof version !== "number") throw new TypeError("AttachmentList.getAttachment::version is not a number");

		const key = `${k_file}_${version}`;
		const attachment = new Attachment(key);
		this.#attachments.push(attachment);
		return attachment;
	}

	resetState() {
		this.#attachments = [];
	}

	get funcs() {
		return this.#attachments.map(item => item.func);
	}

	setResponseObject(value) {
		this.responseObject = value;
	}

	afterExecute() {
		this.#attachments.forEach(attachment => {
			const result = this.api.findAttachment(this.responseObject, attachment.key);
			result && attachment.setStream(result["#result"]);
		})
	}
}

export default AttachmentList;