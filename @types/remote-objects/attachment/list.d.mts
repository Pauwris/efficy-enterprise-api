export default AttachmentList;
declare class AttachmentList extends RemoteObject {
    /**
     * Request attachment from FILES table
     * @param {number} k_file
     * @param {number} [version=0]
     * @returns {Attachment}
     */
    getAttachment(k_file: number, version?: number): Attachment;
    resetState(): void;
    get funcs(): any;
    setResponseObject(value: any): void;
    #private;
}
import RemoteObject from "../remote-object.mjs";
import Attachment from "./type.mjs";
//# sourceMappingURL=list.d.mts.map