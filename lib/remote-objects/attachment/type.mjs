/**
 * Class representing a remotely fetched Attachment
 */
class AttachmentObject {
	key;
	#stream;

	constructor(key) {
		this.key = key;
	}

	setStream(stream) {
		this.#stream = stream;
	}

	/**
	 * get the base64 encoded attachment stream
	 * @type {string}
	 */
	get base64Stream() {
		return this.#stream;
	}

	get func() {
		const func = {};
		func["@name"] = "attachment";
		func["key"] = this.key;
		return func;
	};
}

export default AttachmentObject;