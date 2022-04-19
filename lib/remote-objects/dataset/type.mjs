/**
 * Class representing a remotely fetched DataSet
 */
class DataSet {
	name;
	type;
	tableView;

	#items;
	#item;

	constructor(type, name, filter, includeBlobContent) {
		if (!["main", "master", "detail", "category"].includes(type)) throw new TypeError("DataSet.constructor::invalid type");
		if (["detail", "category"].includes(type) && !name) throw new TypeError("DataSet.constructor::name must be specified");
		this.type = type;
		this.name = name;

		// Expect an SQL Expression string like: "K_FILE=123 and VERSION=0"
		this.filter = filter && typeof filter == "string" ? filter : undefined;
		this.includeBlobContent = typeof includeBlobContent === "boolean" ? includeBlobContent : false;
	}

	/**
	 * The to array converted dataset
	 * @type {array}
	 */
	get items() {
		return this.#items;
	}

	/**
	 * When exists, the first item of the items array, else null
	 * @type {array}
	 */
	get item() {
		return this.#item;
	}

	setItems(value) {
		if (!value) return;
		if (!Array.isArray(value)) throw new TypeError("DataSet.items::value is not an Array");

		this.#items = value;
		if (this.#items.length > 0) {
			this.#item = this.#items[0];
		}
	}

	get func() {
		const func = {};

		func["@name"] = this.type;
		if (this.name) func[this.type] = this.name;
		if (this.filter) func["filter"] = this.filter;
		if (this.tableView > 0) func["tableview"] = this.tableView;
		if (this.includeBlobContent) func["includeblobcontent"] = true;

		return func;
	};
}

export default DataSet;