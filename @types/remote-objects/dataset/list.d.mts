export default DataSetList;
/**
 * Groups a list of DataSet operations that are shared between ConsultObject and EditObject
 * @extends {RemoteObject}
 */
declare class DataSetList extends RemoteObject {
    /**
     * Retrieves a master [DataSet]{@link Dataset.html} from the edit context.
     * @returns {DataSetObject}
     */
    getMasterDataSet(masterView?: number): DataSetObject;
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
    resetState(): void;
    get funcs(): any[];
    setResponseObject(value: any): void;
    /**
     * Add the remotely fetched master, categories and detail data as properties of data
     */
    setData(target: any): void;
    #private;
}
import RemoteObject from "../remote-object.mjs";
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=list.d.mts.map