/*
The MIT License (MIT)

Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
{
  "name": "set-cookie-parser",
  "version": "2.4.8",
  "description": "Parses set-cookie headers into objects",
  "homepage": "https://github.com/nfriedly/set-cookie-parser",
  "repository": "nfriedly/set-cookie-parser",
  "author": {
    "name": "Nathan Friedly",
    "email": "",
    "url": "http://nfriedly.com/"
}
*/

"use strict";

var defaultParseOptions = {
	decodeValues: true,
	map: false,
	silent: false,
};

function isNonEmptyString(str) {
	return typeof str === "string" && !!str.trim();
}

function parseString(setCookieValue, options) {
	var parts = setCookieValue.split(";").filter(isNonEmptyString);
	var nameValue = parts.shift().split("=");
	var name = nameValue.shift();
	var value = nameValue.join("="); // everything after the first =, joined by a "=" if there was more than one part

	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	try {
		value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
	} catch (e) {
		console.error(
			"set-cookie-parser encountered an error while decoding a cookie with value '" +
			value +
			"'. Set options.decodeValues to false to disable this feature.",
			e
		);
	}

	var cookie = {
		name: name, // grab everything before the first =
		value: value,
	};

	parts.forEach(function (part) {
		var sides = part.split("=");
		var key = sides.shift().trimLeft().toLowerCase();
		var value = sides.join("=");
		if (key === "expires") {
			cookie.expires = new Date(value);
		} else if (key === "max-age") {
			cookie.maxAge = parseInt(value, 10);
		} else if (key === "secure") {
			cookie.secure = true;
		} else if (key === "httponly") {
			cookie.httpOnly = true;
		} else if (key === "samesite") {
			cookie.sameSite = value;
		} else {
			cookie[key] = value;
		}
	});

	return cookie;
}

function parse(input, options) {
	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	if (!input) {
		if (!options.map) {
			return [];
		} else {
			return {};
		}
	}

	if (input.headers && input.headers["set-cookie"]) {
		// fast-path for node.js (which automatically normalizes header names to lower-case
		input = input.headers["set-cookie"];
	} else if (input.headers) {
		// slow-path for other environments - see #25
		var sch =
			input.headers[
			Object.keys(input.headers).find(function (key) {
				return key.toLowerCase() === "set-cookie";
			})
			];
		// warn if called on a request-like object with a cookie header rather than a set-cookie header - see #34, 36
		if (!sch && input.headers.cookie && !options.silent) {
			console.warn(
				"Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
			);
		}
		input = sch;
	}
	if (!Array.isArray(input)) {
		input = [input];
	}

	options = options
		? Object.assign({}, defaultParseOptions, options)
		: defaultParseOptions;

	if (!options.map) {
		return input.filter(isNonEmptyString).map(function (str) {
			return parseString(str, options);
		});
	} else {
		var cookies = {};
		return input.filter(isNonEmptyString).reduce(function (cookies, str) {
			var cookie = parseString(str, options);
			cookies[cookie.name] = cookie;
			return cookies;
		}, cookies);
	}
}

export default parse;
