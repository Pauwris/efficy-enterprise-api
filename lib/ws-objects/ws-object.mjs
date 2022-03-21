import RemoteObject from '../remote-objects/remote-object.mjs';
import EditObject from "../remote-objects/edit.mjs";


/**
 * Class with methods that contain executeBatch commands
 * @namespace WsObject
 * @extends RemoteObject
*/
class WsObject extends RemoteObject {
	constructor(remoteAPI) {
		super(remoteAPI);
	}

	/**
	 *
	 * @param {EditObject} editObject
	 * @param {string} filter - Server-side SQL filter expression, added as filter property of [TDataSet](https://help.efficy.io/extras/serverjs.html#TDataSet)
	 * @param {boolean} includeBlobContent - On true, returns all blob streams (e.g. attachment, thumb)
	 * @returns {Promise<Array>}
	 * @example
	 * await crm.ws.getFiles(document, `COMMENT like '%.docx'`, false);
	 */
	 async getFiles(editObject, filter, includeBlobContent) {
		await this.api.executeBatch();
		const dsFiles = editObject.getDetailDataSet("file", filter, includeBlobContent);
		await this.api.executeBatch();

		if (!Array.isArray(dsFiles.items) || dsFiles.items.length === 0) return [];

		// Sort like in UI, highest/latest K_SORT first
		const fnSort = (a, b) => b.K_SORT - a.K_SORT;
		const sortedFiles = dsFiles.items.sort(fnSort);

		return sortedFiles;
	}

	/**
	 * Instantly delete files, optionally SQL expression filtered
	 * @param {EditObject} editObject
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @example
	 * await crm.ws.deleteFiles(document);
	 * await crm.ws.deleteFiles(document, `COMMENT like '%template%'`);
	 */
	async deleteFiles(editObject, filter) {
		const files = await this.getFiles(editObject, filter, false);
		files.forEach(file => {
			editObject.deleteDetail("file", file.K_FILE + "_" + file.VERSION);
		})
		await this.api.executeBatch();
	}

	/**
	 * Instantly cleanup files, but keep top X, optionally SQL expression filtered
	 * @param {EditObject} editObject
	 * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
	 * @param {number} [keepTopX=7] - Keep only the top X files, sorted highest/latest K_SORT first
	 * @example
	 * await crm.ws.cleanupFiles(document, "", 7);
	 * await crm.ws.cleanupFiles(document, `COMMENT like '%template%'`, 0);
	 */
	async cleanupFiles(editObject, filter, keepTopX = 7) {
		const files = await this.getFiles(editObject, filter, false);

		files.filter((file, index) => index >= keepTopX).forEach(file => {
			editObject.deleteDetail("file", file.K_FILE + "_" + file.VERSION);
		})
		await this.api.executeBatch();
	}
}

export default WsObject;