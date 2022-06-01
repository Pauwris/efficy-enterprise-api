export default EditRelationObject;
/**
 * Constructed class Returned by RemoteObjects.openEditRelationObject
 * @extends RemoteObject
 * @property {string} entity - The entity name
 * @property {number} key - The key of the entity record
 * @property {string} detail - The detail name
 * @property {number} detailkey - The key of the detail record
 * @property {number} edithandle - The handle of the edit operation
 * @property {boolean} inserted - True when record is newly inserted in the DB
 * @property {object} data
 */
declare class EditRelationObject extends RemoteObject {
    /**
     * Opens an edit context for a relation. If the relation does not yet exist, it is created.
     * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
     * @param {RemoteAPI} remoteAPI
     * @param {number} editHandle - Possibility to pass an existing editHandle
     * @param {string} entity - The entity name, e.g. "Comp"
     * @param {string} detail - The detail name, e.g. "Cont"
     * @param {number} key - The key of the entity
     * @param {number} detailKey - The key of the detail
     * @param {number} [relationId] - The key of the relation if multi-relation is available
     */
    constructor(remoteAPI: RemoteAPI, editHandle: number, entity: string, detail: string, key: number, detailKey: number, relationId?: number);
    entity: string;
    detail: string;
    key: number;
    detailkey: any;
    edithandle: number;
    data: any;
    /** @protected */
    protected commit: any;
    /** @protected */
    protected closecontext: any;
    /** @protected */
    protected inserted: boolean;
    relationId: number;
    /**
     * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
     * @param {number} [tableView=0]
     * @returns {DataSetObject}
     */
    getMasterDataSet(tableView?: number): DataSetObject;
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
     * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
     * @param {string} name
     * @param {string|number} value
     */
    updateReciprocityField(name: string, value: string | number): void;
    /**
     * Updates the field values of a reciprocity table view, e.g. CONT_CONT.RELATION of the 2nd record
     * @param {object} fieldsObj - e.g. {"OPENED": "0"}
     */
    updateReciprocityFields(fieldsObj: object): void;
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
import RemoteAPI from "../remote-api.mjs";
//# sourceMappingURL=edit-relation.d.mts.map