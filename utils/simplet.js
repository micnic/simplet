// Parses the content and returns executable result
function parse(content, open, close) {
	'use strict';

	var openLength = open.length;
	var closeLength = close.length;

	var include = false;
	var print = false;
	var result = '';

	var index = 0;
	var currentChar;
	var currentSec;

	var beforeCode = true;
	var afterCode = false;
	var whitespace = '';
	var buffer = '';

	// Parse char by char
	while (currentChar = content.charAt(index)) {

		// Found code delimiter
		if (content.substr(index, openLength) === open) {
			index += openLength;
			currentChar = content.charAt(index);

			// Found print statement
			if (currentChar === '=') {

				// If after print statement then concatenate
				if (print) {
					result += ',';
				} else {
					result += 'print(';
					print = true;
				}

				index++;

			// Found include statement
			} else if (currentChar === '#') {

				// Close previous print statement
				if (print) {
					result += ');';
					print = false;
				}

				result += 'include(';
				include = true;
				index++;

			// Found plain code and close previous print statement
			} else if (print) {
				result += ');';
				print = false;
			}

			// Get the chars of the code
			while ((currentChar = content.charAt(index)) && content.substr(index, closeLength) !== close) {
				result += currentChar;
				index++;
			}

			// Check for unexpected end of line
			if (!currentChar) {
				throw 'Unexpected end of template';
			} else if (!print) {

				// Close include statement if found
				if (include) {
					result += ')';
					include = false;
				}

				result += ';';
			}

			index += closeLength;
			afterCode = true;

		// Found other chars
		} else if (currentChar) {

			// While no code found
			while ((currentChar = content.charAt(index)) && (currentSec = content.substr(index, openLength)) !== open) {

				// Escape for "'" and "\"
				if (currentChar === '\'' || currentChar === '\\') {

					// Break whitespace ignoring
					if (afterCode || beforeCode) {
						afterCode = false;
						beforeCode = false;
						buffer += whitespace;
						whitespace = '';
					}

					buffer += '\\' + currentChar;

				// Escape for end of line
				} else if (currentChar === '\n' || currentSec === '\r\n' || currentChar === '\r' || currentChar === '\u2028' || currentChar === '\u2029') {

					// Add whitespace if not after code
					if (!afterCode) {
						buffer += whitespace;
					}

					afterCode = false;
					beforeCode = true;
					whitespace = '\\n';

					// If Windows end of line
					if (currentSec === '\r\n') {
						index++;
					}

				// Get all other chars
				} else {

					// Ignore whitespace on the lines with code
					if ((afterCode || beforeCode) && (currentChar === ' ' || currentChar === '\t')) {
						whitespace += currentChar;
					} else {

						// Break whitespace ignoring
						if (afterCode || beforeCode) {
							afterCode = false;
							beforeCode = false;
							buffer += whitespace;
							whitespace = '';
						}

						buffer += currentChar;
					}
				}

				index ++;
			}

			// Concatenate the buffer if it exists
			if (buffer) {
				if (print) {
					result += ',\'';
				} else {
					result += 'print(\'';
					print = true;
				}
				result += buffer + '\'';
				buffer = '';
			}
		}
	}

	// Close the lase print statement
	if (!content.charAt(index) && print) {
		result += ')';
	}

	return result;
}

var simplet = function (config) {
	'use strict';

	// Ignore new keyword
	if (!(this instanceof simplet)) {
		return new simplet(config);
	}

	// Set up the engine configuration
	config = config || {};

	Object.defineProperties(this, {
		cache: {
			value: {}
		},
		close: {
			value: config.close || '%>'
		},
		open: {
			value: config.open || '<%'
		},
		raw: {
			value: config.raw || false
		},
		string: {
			value: config.string || false
		}
	});
};

// Removes sources from cache or clears the cache completely
simplet.prototype.clearCache = function (source) {
	'use strict';
	if (source) {
		delete this.cache[source];
	} else {
		this.cache = {};
	}
};

// Compiles the raw content and requrns the result
simplet.prototype.compile = function (content, imports) {
	'use strict';
	var parameters = [];
	var values = [];

	// Populate the parameters and the values for the executable frunction
	for (var i in imports) {
		parameters.push(i);
		values.push(imports[i]);
	}

	return new Function(parameters.join(), content).apply(this, values);
};

// Cache the source for further usage
simplet.prototype.precache = function (source, id) {
	'use strict';
	var content;
	if (this.string) {
		content = source;
		source = id;
	} else {
		try {
			content = document.getElementById(source).innerHTML;
		} catch (error) {
			console.log('\nsimpleT: can not read source "' + source + '"\n' + error.message + '\n');
			return;
		}
	}

	try {
		this.cache[source] = parse(content, this.open, this.close);
		return this.cache[source];
	} catch (error) {
		console.log('\nsimpleT: Unexpected end of template in source "' + source + '"\n');
		return;
	}
};

// Render templates from strings or HTMLElements
simplet.prototype.render = function (source, imports, id) {
	'use strict';
	var executable;
	var result;

	// If the source is cached use the cache
	if ((!this.string && this.cache[source]) || (this.string && this.cache[id])) {
		result = this.cache[source];
	} else {
		result = this.precache(source, id);
	}

	executable = 'var resultContent=\'\',include=function(file,imports,id){resultContent+=this.render(file,imports,id)}.bind(this),print=function(){for(var i=0,n=arguments.length;i<n;i++){resultContent+=arguments[i]}};' + result + ';return resultContent';
	if (this.raw) {
		return executable;
	}
	return this.compile(executable, imports);
};