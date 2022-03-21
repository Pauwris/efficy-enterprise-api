/**
 * Find and return first (deep) nested object when all properties of the provided searchObject are equal
 * Inspired by https://pretagteam.com/question/finding-an-object-deep-in-a-nested-json-object
 * @param {object|Array} object
 * @param {object} searchObject
 * @returns {object}
 */
function findDeep(object, searchObject) {
	if (typeof searchObject !== 'object') throw new TypeError('findDeep::searchObject is not an object')

	if (Array.isArray(object)) {
		for (const obj of object) {
			const result = findDeep(obj, searchObject);
			if (result) return result;
		}
	} else if (typeof object === "object") {
		let matched = true;
		Object.keys(searchObject).filter(key => {
			if (!object.hasOwnProperty(key) || object[key] !== searchObject[key]) {
				matched = false
			}
		})
		if (matched) return object;

		for (const k of Object.keys(object)) {
			if (typeof object[k] === "object") {
				const o = findDeep(object[k], searchObject);
				if (o !== null && typeof o !== 'undefined')
				return o;
			}
		}

		return null;
	}
}

export default findDeep;