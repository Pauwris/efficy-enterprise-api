export default ContactsList;
/**
 * Class returned by searchContactsByEmail, searchContactsByPhone operations
 * @extends DataSetObject
 * @param {Array<string>} [recipients=[]] - The list of email addresses
 * @param {string} [phoneNumber=""] - The phone number, doesn't have to be stripped from formatting
 */
declare class ContactsList extends DataSetObject {
    constructor(remoteAPI: any, recipients?: any[], phoneNumber?: string);
    recipients: any[];
    phoneNumber: string;
    asJsonRpc(): {
        "#id": string;
        "@name": string;
        "@func": ({
            "@name": string;
            recipients: string;
            phonenumber?: undefined;
        } | {
            "@name": string;
            phonenumber: string;
            recipients?: undefined;
        })[];
    };
}
import DataSetObject from "./dataset-object.mjs";
//# sourceMappingURL=contacts-list.d.mts.map