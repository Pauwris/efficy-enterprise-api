export default RemoteObject;
/**
 * Low level class representing an RPC operation
 */
declare class RemoteObject {
    constructor(remoteAPI: any);
    /** @protected */
    protected requestObject: {};
    /** @protected */
    protected responseObject: {};
    /** @protected */
    protected id: string;
    /** @protected */
    protected get api(): any;
    /** @protected */
    protected afterExecute(): void;
    #private;
}
//# sourceMappingURL=remote-object.d.mts.map