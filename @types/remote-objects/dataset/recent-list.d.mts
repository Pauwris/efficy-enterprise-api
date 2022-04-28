export default RecentList;
/**
 * Class returned by consultRecent operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} [extraFields=[]] - A list of extra fields to consult for each recent entity record, e.g. ["POSTCODE", "CITY"]
 */
declare class RecentList extends DataSetObject {
    constructor(remoteAPI: any, entity: any, extraFields?: any[]);
    entity: any;
    extraFields: any[];
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            entity: any;
            extrafields: string;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=recent-list.d.mts.map