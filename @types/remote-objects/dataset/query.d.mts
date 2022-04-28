export default QueryObject;
/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
declare class QueryObject extends DataSetObject {
    constructor(remoteAPI: any, key: any, master: any, detail: any, queryParams?: any[], loadBlobs?: boolean, recordCount?: number);
    key: any;
    master: any;
    detail: any;
    queryParams: any[];
    loadBlobs: boolean;
    recordCount: number;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            loadBlobs: boolean;
            recordCount: number;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=query.d.mts.map