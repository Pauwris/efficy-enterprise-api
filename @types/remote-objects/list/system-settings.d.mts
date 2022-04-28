export default SystemSettings;
/**
 * Class returned by getSystemSettings operations.
 * @extends ListObject
 */
declare class SystemSettings extends ListObject {
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
        }[];
    };
}
import ListObject from "./list-object.mjs";
//# sourceMappingURL=system-settings.d.mts.map