export default AttachmentObject;
/**
 * Class representing a remotely fetched Attachment
 */
declare class AttachmentObject {
    constructor(key: any);
    key: any;
    setStream(stream: any): void;
    /**
     * get the base64 encoded attachment stream
     * @type {string}
     */
    get base64Stream(): string;
    get func(): {
        "@name": string;
        key: any;
    };
    #private;
}
//# sourceMappingURL=type.d.mts.map