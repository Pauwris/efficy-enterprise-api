export default SettingObject;
/**
 * Class returned by getSetting operation
 * @extends StringObject
 * @param {string} name - The name of the module (JSON object) that owns the setting.
 * @param {string} module - The name of the setting.
 * @param {boolean} [asString=true] - If true, the settings of type TDateTime will be returned as a string formatted with the ShortDateTime format. If false, it will be returned as a float value.
 */
declare class SettingObject extends StringObject {
    constructor(remoteAPI: any, module: any, name: any, asString?: boolean);
    module: any;
    name: any;
    asString: boolean;
    operationName: string;
    /** @protected */
    protected asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": {
            "@name": string;
            module: any;
            name: any;
            asstring: boolean;
        }[];
    };
}
import StringObject from "./string-object.mjs";
//# sourceMappingURL=setting-object.d.mts.map