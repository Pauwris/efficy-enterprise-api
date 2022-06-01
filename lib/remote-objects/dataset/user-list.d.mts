export default UserList;
/**
 * Class returned by getUserList operation
 * @extends DataSetObject
  */
declare class UserList extends DataSetObject {
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
        }[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=user-list.d.mts.map