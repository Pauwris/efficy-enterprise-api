export default EditObject;
/**
 * Constructed class Returned by RemoteObjects.openEditObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the edited record
 * @property {number} key - The key of the edited record
 * @property {number} edithandle - The handle of the edit operation
 * @property {boolean} inserted - True when record is newly inserted in the DB
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
declare class EditObject extends RemoteObject {
    /**
     * Opens an edit context for the record identified by entity and key.
     * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
     * @param {RemoteAPI} remoteAPI
     * @param {number} editHandle - Possibility to pass an existing editHandle
     * @param {string} entity - The entity name, e.g. "Comp"
     * @param {number} [key=0] - The key of the record. Use key = 0 to create a new record
     */
    constructor(remoteAPI: RemoteAPI, editHandle: number, entity: string, key?: number);
    entity: string;
    key: number;
    edithandle: number;
    data: any;
    /** @protected */
    protected commit: any;
    /** @protected */
    protected closecontext: any;
    /** @protected */
    protected inserted: boolean;
    /**
     * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
     * @returns {DataSetObject}
     */
    getMasterDataSet(): DataSetObject;
    /**
     * Retrieves the [DataSet]{@link Dataset.html} for category categoryName. Can be null when the category is not available to the current user.
     * @param {string} categoryName - name of the category, e.g. "DOCU$INVOICING"
     * @returns {DataSetObject}
     */
    getCategoryDataSet(categoryName: string): DataSetObject;
    /**
     * Retrieves a relation [DataSet]{@link Dataset.html} for the specified detail in the edit context.
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {string} [filter=""] - SQL filter expression, e.g. "COMMENT like '%template%'"
     * @param {boolean} [includeBlobContent=false] - If true, blob fields (e.g. memo, stream) are returned
     * @returns {DataSetObject}
     */
    getDetailDataSet(detail: string, filter?: string, includeBlobContent?: boolean): DataSetObject;
    /**
     * Request attachment from FILES table
     * @param {number} k_file
     * @param {number} [version=0]
     * @returns {AttachmentObject}
     */
    getAttachment(k_file: number, version?: number): AttachmentObject;
    /**
     * Updates the field values of a master data set
     * @param {string} name
     * @param {string|number} value
     */
    updateField(name: string, value: string | number): void;
    /**
     * Updates the field values of a master data set.
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateFields(fieldsObj: object): void;
    /**
     * Updates the value of a field of any type in a category data set
     * @param {string} categoryName
     * @param {string} name
     * @param {string|number} value
     */
    updateCategoryField(categoryName: string, name: string, value: string | number): void;
    /**
     * Updates the value of a field of any type in a category data set
     * @param {string} categoryName
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateCategoryFields(categoryName: string, fieldsObj: object): void;
    /**
     * Inserts a detail relation
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number} detailKey - The key of the detail
     * @param {boolean} [linkMainCompany=false]
     * @param {boolean} [retrieveName=false]
     */
    insertDetail(detail: string, detailKey: number, linkMainCompany?: boolean, retrieveName?: boolean): void;
    /**
     * Updates field values of a detail relation. When the detail relation doesn't exist, an exception is thrown.
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number|string} detailKey - The key of the detail. If detailKey is 0, the current detail record is used
     * @param {object} fieldsObj, e.g. {"OPENED": "0"}
     */
    updateDetail(detail: string, detailKey: number | string, fieldsObj: object): void;
    /**
     * Deletes a detail relation
     * @param {string} detail - The detail name, e.g. "Comp"
     * @param {number|string} detailKey - The key of the detail
     */
    deleteDetail(detail: string, detailKey: number | string): void;
    /**
     * Clears all relations for the specified detail
     * @param {string} detail - The detail name, e.g. "Comp"
     */
    clearDetail(detail: string): void;
    /**
     * Activates a category. If the user does not have the appropriate rights on the category, an exception is thrown.
     * @param {string} categoryName
     */
    activateCategory(categoryName: string): void;
    /**
     * Requests that a unique reference number be generated when committing.
     * @param {number} id - SYS_REFERENCES.K_REFERENCE
     */
    setReference(id: number): void;
    /**
     * Sets the user relations.
     * @param {array} users - The array of user IDs (keys).
     * @param {boolean} [clear=false] - If true, clears the current user selection.
     */
    setUsers(users: any[], clear?: boolean): void;
    /**
     * Sets the security for a user or group.
     * @param {number} account - The user or group for which security is added.
     * @param {number} securityValue - A sum of one or more of the following values: 1 (search), 2 (read), 4 (write), 8 (delete) and 256 (secure). Useful combinations are 7 (read/write), 15 (read/write/delete) and 271 (full control = read/write/delete/secure).
     */
    setUserSecurity(account: number, securityValue: number): void;
    /**
     * Inserts an file
     * @param {number} attachedFileType - 1 = embedded, 2 = linked, 4 = remote, 5 = large
     * @param {string} path - The path of the file that will be saved in the FILES.PATH field.
     */
    insertAttachment(attachedFileType: number, path: string): void;
    /**
     * Updates an embedded file
     * @param {number} key - Leave null or 0 to set the stream of the just inserted Attachment
     * @param {string} base64String
     */
    updateAttachment(key: number, base64String: string): void;
    /**
     * Copies data from an existing record in the database. The same entity as the current is assumed.
     * The table views within the index range minIndex to maxIndex are copied. By default, all table views are copied.
     * To copy a single detail, obtain the table view index using IndexFromDetail and use this value as MinIndex and MaxIndex.
     * @param {number} key - The key of the source record.
     * @param {number} [minTableView=0] - The index of first table view to be copied.
     * @param {number} [maxTableView=999] - The index of last table view to be copied.
     */
    copyFromExisting(key: number, minTableView?: number, maxTableView?: number): void;
    /**
     * Commits the changes to the database.
     */
    commitChanges(): void;
    /**
     * Closes the context and frees the memory on the web server.
     */
    closeContext(): void;
    /**
     * Commits the changes, releases the record and executes closeContext
     */
    closingCommit(): void;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": any[];
    };
    #private;
}
import RemoteObject from "./remote-object.mjs";
import DataSetObject from "./dataset/dataset-object.mjs";
import AttachmentObject from "./attachment/type.mjs";
import RemoteAPI from "../remote-api.mjs";
//# sourceMappingURL=edit.d.mts.map