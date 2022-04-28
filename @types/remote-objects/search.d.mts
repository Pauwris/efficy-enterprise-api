export default SearchObject;
/**
 * Class returned by search operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
declare class SearchObject extends DataSetObject {
    constructor(remoteAPI: any, entity: any, method: any, value: any, own: any, contains: any, opened: any);
    /** @private */
    private entity;
    /** @private */
    private method;
    /** @private */
    private value;
    /** @private */
    private own;
    /** @private */
    private contains;
    /** @private */
    private opened;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            tableview: number;
        }[];
    };
}
import DataSetObject from "./dataset/dataset-object.mjs";
//# sourceMappingURL=search.d.mts.map