export default FavoriteList;
/**
 * Class returned by consultFavorites operations
 * @extends DataSetObject
 * @param {string} entity - The entity name, e.g. "Comp"
 */
declare class FavoriteList extends DataSetObject {
    constructor(remoteAPI: any, entity: any);
    entity: any;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            entity: any;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=favorite-list.d.mts.map