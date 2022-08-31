export default PropertyObject;
/**
 * Class returned by API property operation such as currentdatabasealias, currentuserfullname
 * @extends StringObject
 * @param {string} name - The name of the API property
 */
declare class PropertyObject extends StringObject {
    constructor(remoteAPI: any, name: any);
    name: any;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": any;
        }[];
    };
}
import StringObject from "./string-object.mjs";
//# sourceMappingURL=property-object.d.mts.map