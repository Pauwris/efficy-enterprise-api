export default ConsultObject;
/**
 * Class returned by openConsultObject
 * @extends RemoteObject
 * @property {string} entity - The entity name of the consulted record
 * @property {number} key - The key of the consulted record
 * @property {number} consulthandle - The handle of the consult operation
 * @property {object} data - The master, categories and detail objects available as properties of data
 */
declare class ConsultObject extends RemoteObject {
    /**
     * Opens an consult context for the record identified by entity and key.
     * A context remains memory-resident (on the web server) until it is closed. Always match with a closeContext() call to avoid memory consumption.
     * @param {RemoteAPI} remoteAPI
     * @param {string} entity - The entity name of the consulted record, e.g. "Comp"
     * @param {number} key - The key of the consulted record
     * @param {number} [consultHandle] - Possibility to pass an existing consultHandle
     */
    constructor(remoteAPI: RemoteAPI, entity: string, key: number, consultHandle?: number);
    entity: string;
    key: number;
    consulthandle: number;
    data: any;
    /** @protected */
    protected closecontext: any;
    /**
     * Retrieves a master [DatasetObject]{@link Dataset.html} from the consult context.
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
     * Closes the context and frees the memory on the web server.
     */
    closeContext(): void;
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
//# sourceMappingURL=consult.d.mts.map