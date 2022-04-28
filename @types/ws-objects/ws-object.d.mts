export default WsObject;
/**
 * Class with methods that contain executeBatch commands
 * @extends RemoteObject
*/
declare class WsObject extends RemoteObject {
    /**
     *
     * @param {EditObject} editObject
     * @param {string} filter - Server-side SQL filter expression, added as filter property of [TDataSet](https://help.efficy.io/extras/serverjs.html#TDataSet)
     * @param {boolean} includeBlobContent - On true, returns all blob streams (e.g. attachment, thumb)
     * @returns {Promise<Array>}
     * @example
     * await crm.ws.getFiles(document, `COMMENT like '%.docx'`, false);
     */
    getFiles(editObject: EditObject, filter: string, includeBlobContent: boolean): Promise<any[]>;
    /**
     * Instantly delete files, optionally SQL expression filtered
     * @param {EditObject} editObject
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @example
     * await crm.ws.deleteFiles(document);
     * await crm.ws.deleteFiles(document, `COMMENT like '%template%'`);
     */
    deleteFiles(editObject: EditObject, filter?: string): Promise<void>;
    /**
     * Instantly cleanup files, but keep top X, optionally SQL expression filtered
     * @param {EditObject} editObject
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @param {number} [keepTopX=7] - Keep only the top X files, sorted highest/latest K_SORT first
     * @example
     * await crm.ws.cleanupFiles(document, "", 7);
     * await crm.ws.cleanupFiles(document, `COMMENT like '%template%'`, 0);
     */
    cleanupFiles(editObject: EditObject, filter?: string, keepTopX?: number): Promise<void>;
}
import RemoteObject from "../remote-objects/remote-object.mjs";
import EditObject from "../remote-objects/edit.mjs";
//# sourceMappingURL=ws-object.d.mts.map