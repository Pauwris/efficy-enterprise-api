export default ConsultManyEx;
/**
 * Class returned by consultManyEx operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 * @param {array} whereFields - A list of field names to match (used as WHERE criteria), e.g. ["NAME", "OPENED"]
 * @param {array} whereValues - A list of values to match, e.g. ["Efficy", "1"]
 * @param {string} orderByFields - SQL sort expression, e.g. "K_COMPANY desc"
 */
declare class ConsultManyEx extends DataSetObject {
    constructor(remoteAPI: any, entity: any, whereFields: any, whereValues: any, orderByExpression: any);
    entity: any;
    whereFields: any;
    whereValues: any;
    orderByExpression: any;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            entity: any;
            findfield: any;
            keys: any;
            orderbyfield: any;
            separator: string;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=consult-many-ex.d.mts.map