// Variables that are primitive are accessed by value
const isPrimitive = (val) => {
	return val !== Object(val);
}

const ParseGentle = {
	fieldsObj(inputObj) {
		const outputObj = {};
		if (!inputObj || typeof inputObj !== "object" || Array.isArray(inputObj)) return outputObj;
		Object.keys(inputObj).forEach(key => {
			if (isPrimitive(inputObj[key])) {
				outputObj[key] = inputObj[key];
			}
		})
		return outputObj;
	},
	toFloatKey(key) {
		return parseFloat(key) || 0;
	},
	numberProperties(object, numberProperties) {
		numberProperties.forEach(name => {
			if (object[name] && isNaN(parseFloat(object[name])) === false) {
				object[name] = parseFloat(object[name]);
			}
		})

		return object;
	}
}

const ParseHard = {
	isFieldValue(value) {
		if (isPrimitive(value) === false) throw new TypeError(`ParseHard.isFieldValue::argument 'value' is not a primitive value`);
	}
}

export {isPrimitive, ParseGentle, ParseHard}