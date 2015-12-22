var simplet = function (options) {

	'use strict';

	// SimpleT prototype constructor
	var simplet = function (options) {

		var close = '%>',
			debug = false,
			extension = 'ejs',
			globals = {},
			open = '<%';

		// Set default options arguments
		if (!options || typeof options !== 'object') {
			options = {};
		}

		// Get a valid opening template separator
		if (options.open && typeof options.open === 'string') {
			open = options.open;
		}

		// Get a valid closing template separator
		if (options.close && typeof options.close === 'string') {
			close = options.close;
		}

		// Get a valid extension
		if (options.extension && typeof options.extension === 'string') {
			extension = options.extension;
		}

		// Get debug option value
		if (options.debug === true) {
			debug = true;
		}

		// Copy global values
		if (options.globals && typeof options.globals === 'object') {
			Object.keys(options.globals).forEach(function (key) {
				globals[key] = options.globals[key];
			});
		}

		// Set options for the engine
		Object.defineProperties(this, {
			close: {
				value: close
			},
			container: {
				value: {}
			},
			debug: {
				value: debug
			},
			extension: {
				value: extension
			},
			globals: {
				value: globals
			},
			open: {
				value: open
			}
		});
	};

	// The list of XML characters that must be escaped
	simplet.escapeXMLChars = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&apos;',
		'<': '&lt;',
		'>': '&gt;'
	};

	// Regular expression to match escaped XML characters
	simplet.escapeXMLRe = /[&<>'"]/g;

	// Escapes XML characters from the provided string
	simplet.escapeXML = function (string) {
		return string.replace(simplet.escapeXMLRe, function (chr) {
			return simplet.escapeXMLChars[chr];
		});
	};

	// Catch error and prepare an expanded result if in debug mode
	simplet.catchError = function (template, debug, error) {

		var end = 0,
			original = template.original,
			result = 'Template Error\n',
			start = 0;

		// Prepare final result structure
		if (debug) {

			result += template.location + ':' + (error.line + 1) + '\n\n';

			// Check for runtime errors to prepare expanded result
			if (!(error instanceof SyntaxError)) {

				// Prepare the start and the end position of the template fragment
				start = Math.max(0, Math.min(error.line - 2, original.length - 5));
				end = Math.min(start + 5, original.length);

				// Get the template fragment and mark the error line
				result += original.slice(start, end).map(function (line, index) {

					var current = start + index,
						count = String(current + 1);

					// Check for the length of the line index to align it
					if (count.length < String(end).length) {
						count = ' ' + count;
					}

					// Add the indicator of the error line
					if (current === error.line) {
						count = '> ' + count;
					} else {
						count = '  ' + count;
					}

					return count +  ' | ' + line.slice(0, 80 - count.length);
				}).join('\n') + '\n\n';
			}

			// Check if there is a stack defined for this error to add it
			if (error.stack) {
				result += error.stack;
			} else {
				result += error.name + ': ' + error.message;
			}
		} else {
			result += 'enable debug mode for expanded result';
		}

		return result;
	};

	// Normalize location path to be used in the internal cache
	simplet.normalizePath = function (location, extension) {

		var isAbsolute = (location[0] === '/'),
			index = 0,
			parts = location.split('/'),
			part = parts[0],
			length = parts.length,
			result = [],
			trailingSlash = (location && (location[location.length - 1] === '/'));

		// Loop through location parts
		while (index < length) {

			// Skip empty or dir parts
			if (part && part !== '.') {
				if (part === '..') {
					if (result.length && result[result.length - 1] !== '..') {
						result.pop();
					} else if (!isAbsolute) {
						result.push('..');
					}
				} else {
					result.push(part);
				}
			}

			// Get the index of the next part
			index++;

			// Get the next part
			part = parts[index];
		}

		// Join the parts to form the normalized location
		location = result.join('/');

		// Check for absolute location or empty location
		if (!location && !isAbsolute) {
			location = '.';
		}

		// Add the trailing slash if needed
		if (location && trailingSlash) {
			location += '/';
		}

		// Add the root slash for absolute location
		if (isAbsolute) {
			location = '/' + location;
		}

		// Add extension to the location string
		if (location.substr(- extension.length - 1) !== '.' + extension) {
			location += '.' + extension;
		}

		return location;
	};

	// Remove the template from the provided location
	simplet.prototype.clear = function (location) {
		if (location && typeof location === 'string') {
			delete this.container[location];
		}
	};

	// Render templates from files
	simplet.prototype.render = function (source, imports) {

		var args = [],
			context = {},
			extension = this.extension,
			globals = this.globals,
			key = null,
			result = '',
			template = null,
			that = this,
			values = [];

		// Includes content from other sources
		context.include = function (location) {

			// Check for relative location
			if (location[0] !== '/') {
				location = source.substr(0, source.lastIndexOf('/') + 1) + location;
			}

			// Normalize location and add extension
			location = simplet.normalizePath(location, extension);

			// Render the template from the provided location
			result += that.render(location, imports);
		};

		// Adds values to the result
		context.print = function () {

			var index = 0,
				length = arguments.length;

			// Loop through all arguments
			while (index < length) {

				// Stingify non-string arguments and concatenate all arguments
				if (typeof arguments[index] === 'string') {
					result += arguments[index];
				} else if (arguments[index] === undefined) {
					result += '';
				} else {
					result += JSON.stringify(arguments[index]);
				}

				// Get the index of the next argument
				index++;
			}
		};

		// Adds values to the result but escapes XML characters
		context.printx = function () {

			var index = 0,
				length = arguments.length;

			// Loop through all arguments
			while (index < length) {

				// Stingify non-string arguments and concatenate all arguments
				if (typeof arguments[index] === 'string') {
					result += simplet.escapeXML(arguments[index]);
				} else if (arguments[index] === undefined) {
					result += '';
				} else {
					result += simplet.escapeXML(JSON.stringify(arguments[index]));
				}

				// Get the index of the next argument
				index++;
			}
		};

		// Set imports default object
		if (!imports || typeof imports !== 'object') {
			imports = {};
		}

		// Add the global values to the context
		for (key in globals) {
			if (!imports[key] && !context[key]) {
				if (typeof globals[key] === 'function') {
					context[key] = globals[key].bind(context);
				} else {
					context[key] = globals[key];
				}
			}
		}

		// Add the imported values to the context
		for (key in imports) {
			if (!context[key]) {
				if (typeof imports[key] === 'function') {
					context[key] = imports[key].bind(context);
				} else {
					context[key] = imports[key];
				}
			}
		}

		// Prepare the arguments and their values
		for (key in context) {
			args.push(key);
			values.push(context[key]);
		}

		// Get the template object
		template = this.container[simplet.normalizePath(source, extension)];

		// Execute the template body
		if (template) {
			try {
				Function(args, template.compiled).apply(context, values);
			} catch (error) {
				result = simplet.catchError(template, this.debug, error);
			}
		} else if (this.debug) {
			result = 'Template "' + source + '" was not found';
		} else {
			result = 'Template not found';
		}

		return result;
	};

	// Create a new template
	simplet.prototype.template = function (location, content) {

		var buffer = '',
			close = this.close,
			csize = close.length,
			current = content[0],
			index = 0,
			line = 0,
			open = this.open,
			osize = open.length,
			result = '',
			skip = false,
			statement = false;

		// Add the line index at the beginning for error handling in debug mode
		if (this.debug) {
			result += 'var _l_=0;try{';
		}

		// Parse char by char
		while (current) {

			// Found code delimiter
			if (content.substr(index, osize) === open) {

				// Skip open delimiter and get the next character
				index += osize;
				current = content[index];

				// Concatenate the buffer if it exists
				if (buffer) {
					result += 'print(\'' + buffer + '\');';
					buffer = '';
				}

				// Add the line index before the code block
				if (this.debug && line > 0) {
					result += '_l_=' + line + ';';
				}

				// Check for include and print statements
				if (current === '-' || current === '=' || current === '@') {

					// Prepare the print expression
					if (current === '-') {
						result += 'print(';
					} else if (current === '=') {
						result += 'printx(';
					} else if (current === '@') {
						result += 'include(';
					}

					// Set statement flag and get next character
					statement = true;
					index++;
					current = content[index];
				} else if (current === '#') {
					skip = true;
					index++;
					current = content[index];
				}

				// Get the characterss of the code
				while (current && content.substr(index, csize) !== close) {

					// Check for end of line
					if (['\n', '\r', '\u2028', '\u2029'].indexOf(current) >= 0) {

						// Increment line index in debug mode
						if (this.debug) {
							line++;
						}

						// Check for DOS end of line
						if (current === '\r' && content[index + 1] === '\n') {
							index++;
						}

						// Use only Unix end of line
						if (!skip) {
							buffer += '\n';
						}
					} else if (!skip) {
						buffer += current;
					}

					// Get the next character
					index++;
					current = content[index];
				}

				// Remove redundant whitespace
				result += buffer.trim();

				// Close current statement
				if (statement) {
					result += ');';
					statement = false;
				} else if (skip) {
					skip = false;
				} else {
					result += '\n';
				}

				// Skip the close delimiter and remove whitespace
				index += csize;
				buffer = '';
			} else {

				// Get all non-code characters
				if (['\n', '\r', '\u2028', '\u2029'].indexOf(current) >= 0) {

					// Increment line index in debug mode
					if (this.debug) {
						line++;
					}

					// Use only Unix end of line
					buffer += '\\n';

					// Check for DOS end of line
					if (current === '\r' && content[index + 1] === '\n') {
						index++;
					}
				} else {

					// Escape for quote and backslash
					if (current === '\'' || current === '\\') {
						buffer += '\\';
					}

					// Add current character to the buffer
					buffer += current;
				}

				// Get next index
				index++;
			}

			// Get next character
			current = content[index];
		}

		// Concatenate the buffer if it exists
		if (buffer) {
			result += 'print(\'' + buffer + '\');';
			buffer = '';
		}

		// Remove redundant whitespace
		result = result.trim();

		// Add the ending for the error handling in debug mode
		if (this.debug) {
			result += '}catch(e){e.line=_l_;throw e}';
		}

		// Normalize location
		location = simplet.normalizePath(location, this.extension);

		// Save the original and the compiled content of the template
		this.container[location] = {
			compiled: result,
			location: location,
			original: content.split(/\r\n|\n|\r|\u2028|\u2029/)
		};
	};

	return new simplet(options);
};