var fs = require('fs');
var path = require('path');

function parse(content, open, close) {
	'use strict';
	var print = false;
	var result = '';
	var start = 0;

	// Start parsing the template
	if (content.slice(0, 2) !== open) {
		result = 'print(\'';
		print = true;
	}

	// Parse the template char by char
	for (var i = 0, n = content.length; i < n; i++) {
		if (content.slice(i, i + 2) === open) {
			if (start !== i) {
				if (print) {
					if (start !== 0) {
						result += ',\'';
					}
				} else {
					result += 'print(\'';
				}
				result += content.slice(start, i) + '\'';
				print = true;
			}
			i += 2;
			var index = content.indexOf(close, i);
			if (index === -1) {
				console.log('\nsimpleT: unexpected end of template "' + source + '"\n');
				return;
			}
			switch (content[i]) {

				// Print statement
				case '=':
					i++;
					if (print) {
						result += ',';
					} else {
						result += 'print(';
					}
					result += content.slice(i, index).trim();
					i += index - i;
					print = true;
					break;

				// Include statement
				case '#':
					i++;
					if (print) {
						result += ');';
					}
					result += 'include(' + content.slice(i, index).trim() + ');';
					i += index - i;
					print = false;
					break;

				// Code statement
				default:
					if (print) {
						result += ');';
					}
					result += content.slice(i, index).trim() + ';';
					i += index - i;
					print = false;
			}
			start = i + 2;
		} else if (content[i] === '\'' || content[i] === '\\') {
			if (print) {
				if (start !== 0) {
					result += ',\'';
				}
			} else {
				result += 'print(\'';
			}
			result += content.slice(start, i);
			print = true;
			result += '\\' + content[i] + '\'';
			start = i + 1;
		} else if (content[i] === '\n' || content[i] === '\r' || content[i] === '\u2028' || content[i] === '\u2029') {
			if (print) {
				if (start !== 0) {
					result += ',\'';
				}
			} else {
				result += 'print(\'';
			}
			result += content.slice(start, i);
			print = true;
			result += '\\n\'';
			start = i + 1;
		}
	}

	// End parsing
	if (start !== content.length) {
		if (print) {
			if (start !== 0) {
				result += ',\'';
			}
		} else {
			result += 'print(\'';
		}
		result += content.slice(start) + '\')';
	} else {
		if (print) {
			result += ')';
		}
	}

	return result;
}

var simplet = module.exports = function (config) {
	'use strict';

	// Ignore new keyword
	if (!(this instanceof simplet)) {
		return new simplet(config);
	}

	// Set up the engine configuration
	config = config || {};

	if (config.cache) {
		this.cache = {};
	}

	this.close = config.close || '%>';
	this.open = config.open || '<%';
	this.string = config.string || false;
	this.raw = config.raw || false;
};

// Render templates from strings or files
simplet.prototype.render = function (source, imports, id) {
	'use strict';
	var content;
	var executable;
	var parameters = [];
	var result;
	var values = [];

	// If the source is cached use the cache
	if (this.cache && this.cache[source]) {
		content = this.cache[source];
	} else {
		
		// Get the source content
		if (this.string) {
			content = source;
			source = id;
		} else {
			try {
				content = fs.readFileSync(source, 'utf8');
			} catch (error) {
				console.log('\nsimpleT: can not read source "' + source + '"\n' + error.message + '\n');
				return;
			}
		}

		result = parse(content, this.open, this.close);

		// Cache the result
		if (this.cache) {
			this.cache[source] = result;
		}
	}

	// Populate the parameters and the values for the executable frunction
	for (var i in imports) {
		parameters.push(i);
		values.push(imports[i]);
	}
	executable = 'var resultContent=\'\',include=function(file,imports){resultContent+=this.render(\'' + (source ? path.dirname(source) : path.dirname(module.parent.filename)) + '\'+\'/\'+file,imports)}.bind(this),print=function(){for(var i=0,n=arguments.length;i<n;i++){resultContent+=arguments[i]}};' + result + ';return resultContent';
	if (this.raw) {
		return executable;
	}
	return new Function(parameters.join(), executable).apply(this, values);
};