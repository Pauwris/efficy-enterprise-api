export class DeleteEntity extends RemoteObject {
    constructor(remoteAPI: any, entity: any, keys: any);
    entity: any;
    keys: any[];
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            entity: any;
            keys: string;
        }[];
    };
}
/**
 * Class returned by methods such as getCategoryCollection
 * @extends DataSetObject
 * @property {array} items - The to array-converted DataSet. Only available after executeBatch()
 * @property {string} item - When exists, the first item of the items array, else null. Only available after executeBatch()
 */
export class CollectionObject extends DataSetObject {
    constructor(remoteAPI: any, entity: any, detail: any);
    dataSetName: string;
    entity: any;
    detail: any;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
        }[];
    };
}
import RemoteObject from "./remote-object.mjs";
import DataSetObject from "./dataset/dataset-object.mjs";
//# sourceMappingURL=api.d.mts.map