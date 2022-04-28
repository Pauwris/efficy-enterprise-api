export default DataSetObject;
/**
 * Represents a remotely fetched Efficy DataSet transformed as an array of row items
 * @extends RemoteObject
 */
declare class DataSetObject extends RemoteObject {
    /** @protected */
    protected dataSetName: any;
    /**
     * The to array converted dataset
     * @type {array}
     */
    get items(): any[];
    /**
     * When exists, the first item of the items array, else null
     * @type {array}
     */
    get item(): any[];
    #private;
}
import RemoteObject from "../remote-object.mjs";
//# sourceMappingURL=dataset-object.d.mts.map