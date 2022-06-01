export default QuerySQLObject;
/**
 * Class returned by Query operations
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
declare class QuerySQLObject extends DataSetObject {
    constructor(remoteAPI: any, sql: any, queryParams?: any[], loadBlobs?: boolean, recordCount?: number);
    sql: any;
    queryParams: any[];
    loadBlobs: boolean;
    recordCount: number;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            sql: any;
            loadBlobs: boolean;
            recordCount: number;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=query-sql.d.mts.map