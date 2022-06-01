export default DataSet;
/**
 * Class representing a remotely fetched DataSet
 */
declare class DataSet {
    constructor(type: any, name: any, filter: any, includeBlobContent: any);
    name: any;
    type: any;
    tableView: any;
    filter: string;
    includeBlobContent: boolean;
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
    setItems(value: any): void;
    get func(): {
        "@name": any;
        filter: string;
        tableview: any;
        includeblobcontent: boolean;
    };
    #private;
}
//# sourceMappingURL=type.d.mts.map