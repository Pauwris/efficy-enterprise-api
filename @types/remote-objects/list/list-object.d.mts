export default ListObject;
/**
 * Class uses by operations that return a list
 * @extends RemoteObject
 * @property {Map} map - The Map object holds key-value pairs and remembers the original order of the keys, {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */
declare class ListObject extends RemoteObject {
    map: any;
    items: any;
}
import RemoteObject from "../remote-object.mjs";
//# sourceMappingURL=list-object.d.mts.map