// Check for Node.JS environment
if (typeof module !== 'undefined') {
	var fs = require('fs');
}

// Parses the content and returns executable result
function parse(content, open, close) {
	'use strict';

	var buffer = '',
		code = false,
		current = content.charAt(0),
		expression = false,
		index = 0,
		previous = '',
		result = '',
		stop = '',
		whitespace = '';

	// Parse char by char
	while (current) {

		// Found code delimiter
		if (content.substr(index, open.length) === open) {
			index += open.length;
			code = true;
			current = content.charAt(index);

			// Concatenate the buffer if it exists
			if (buffer) {
				result += 'print("' + buffer + '");';
				buffer = '';
			}

			// Check for include and print statements
			if (current === '=') {
				result += 'print(';

				// Print the whitespace
				if (whitespace) {
					result += '"' + whitespace + '",';
				}

				code = false;
				expression = true;
				index++;
				current = content.charAt(index);
			} else if (current === '#') {

				// Print the whitespace
				if (whitespace) {
					result += 'print("' + whitespace + '");';
				}

				expression = true;
				index++;
				current = content.charAt(index);
				result += 'include(';
			}

			// Get the chars of the code
			while (current && content.substr(index, close.length) !== close) {

				// Ignore the close tags in embedded embedded javascript code
				if ((current === '\'' || current === '"') && previous !== '\\') {
					index++;
					result += current;
					stop = current;
					current = content.charAt(index);

					// Get the chars of the strings in the 
					while (current && current !== stop && previous !== '\\') {
						index++;
						previous = current;
						result += current;
						current = content.charAt(index);
					}
				}

				index++;
				previous = current;
				result += current;
				current = content.charAt(index);
			}

			// Check for unexpected end of line
			if (!current) {
				throw 'Unexpected end of template';
			}

			// Close open expression if found
			if (expression) {
				result += ');';
				expression = false;
			} else {
				result += '\n';
			}

			index += close.length;
			whitespace = '';

		// Found other chars
		} else {

			// Ignore whitespace on the lines with code
			if (current === ' ' || current === '\t') {
				whitespace += current;

			// Escape for end of line
			} else if (current === '\n' || current === '\r' || current === '\u2028' || current === '\u2029') {

				// Add whitespace if not after code
				if (code) {
					whitespace = '';
				} else {
					buffer += whitespace + '\\n';
				}

				// If Windows end of line
				if (current === '\r' && content.charAt(index + 1) === '\n') {
					index++;
				}

			// Get all other chars
			} else {

				buffer += whitespace;
				whitespace = '';
				code = false;

				// Escape for quote and backslash
				if (current === '"' || current === '\\') {
					buffer += '\\';
				}

				buffer += current;
			}

			index++;
		}

		// Get next character
		current = content.charAt(index);
	}

	// Concatenate the buffer if it exists
	if (buffer) {
		result += 'print("' + buffer + '");';
		buffer = '';
	}

	return result;
}

// SimpleT prototype constructor
var simplet = function (config) {
	'use strict';

	// Call a new instance if it is not
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
		extension: {
			value: config.extension || ''
		},
		folder: {
			value: config.folder || ''
		},
		globals: {
			value: config.globals || {}
		},
		open: {
			value: config.open || '<%'
		}
	});

	// Add the leading dot for extension
	if (this.extension && this.extension.charAt(0) !== '.') {
		this.extension = '.' + this.extension;
	}

	// Add the ending slash for folder path
	if (this.folder && this.folder.charAt(this.folder.length - 1) !== '/') {
		this.folder += '/';
	}
};

// Removes sources from cache or clears the cache completely
simplet.prototype.clear = function (source) {
	'use strict';

	// Delete specific cache if defined
	if (source) {

		// Remove the leading slash from the source
		if (this.folder && source.charAt(0) === '/') {
			source = source.substr(1);
		}

		// Generate the absolute path to the source and remove it
		source = this.folder + source + this.extension;
		delete this.cache[source];
	} else {
		this.cache = {};
	}
};

// Cache the file content for future uses
simplet.prototype.precache = function (source) {
	'use strict';

	var content,
		that = this;

	// Remove the leading slash from the source
	if (this.folder && source.charAt(0) === '/') {
		source = source.substr(1);
	}

	// Generate the absolute path to the source
	source = this.folder + source + this.extension;

	// Read and parse the content
	if (!this.cache[source]) {
		this.cache[source] = parse(fs.readFileSync(source, 'utf8'), this.open, this.close);

		// Create a file watcher
		fs.watch(source, {
			persistent: false
		}, function (event) {
			if (event === 'rename') {
				this.close();
				delete that.cache[source];
				return;
			}

			content = '';
			fs.ReadStream(source, {
				encoding: 'utf8'
			}).on('readable', function () {
				content += this.read();
			}).on('end', function () {
				that.cache[source] = parse(content, this.open, this.close);
			});
		});
	}

	return this.cache[source];
};

// Render templates from strings or files
simplet.prototype.render = function (source, imports) {
	'use strict';

	var i,
		parameters = [],
		result = '',
		that = this,
		values = [];

	// Prepare the source
	try {
		if (typeof module === 'undefined') {
			source = parse(source, this.open, this.close);
		} else {
			source = this.precache(source);
		}
	} catch (error) {
		console.log('simpleT: can not parse source "' + source + '"');
		console.log(error.message + '\n');
		return;
	}

	// Includes content from other sources
	function include(source, imports) {

		// Check for Node.JS environment
		if (typeof module !== 'undefined') {
			source = module.parent.filename.substr(0, module.parent.filename.lastIndexOf('/') + 1) + source;
		}

		result += that.render(source, imports);
	}

	// Adds values to the result
	function print() {

		var index,
			length,
			string = '';

		// Stringify non-string parameters
		for (index = 0, length = arguments.length; index < length; index++) {
			if (typeof arguments[index] === 'string') {
				string += arguments[index];
			} else {
				string += JSON.stringify(arguments[index]);
			}
		}

		result += string;
	}

	imports = imports || {};

	// Add global values from the template engine
	for (i in this.globals) {
		if (!imports[i]) {
			imports[i] = this.globals[i];
		}
	}

	// Do not overwrite include and print functions
	imports.include = include;
	imports.print = print;

	// Populate the parameters and the values for the executable function
	for (i in imports) {
		parameters.push(i);
		values.push(imports[i]);
	}

	// The interpreted function
	new Function(parameters.join(), source).apply(null, values);
	return result;
};

// Check for Node.JS environment
if (typeof module !== 'undefined') {

	// Export a new simplet instance
	module.exports = function (config) {
		'use strict';
		return new simplet(config);
	};

	// Public the content for client side template engine
	module.exports.client = fs.readFileSync(__filename);
}