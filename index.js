var fs = require('fs');
var path = require('path');

// Parses the content and returns executable result
function parse(content, open, close) {
	'use strict';
	
	var openLength = open.length;
	var closeLength = close.length
	
	var include = false;
	var print = false;
	var result = '';

	var index = 0;
	var currentChar;
	var currentSec;

	var beforeCode = true;
	var afterCode = false;
	var buffer = '';
	var temp = '';

	while (currentChar = content.charAt(index)) {
		if (content.substr(index, openLength) === open) {
			index += openLength;
			currentChar = content.charAt(index);
			if (currentChar === '=') {
				if (print) {
					result += ',';
				} else {
					result += 'print(';
					print = true;
				}
				index++;
			} else if (currentChar === '#') {
				if (print) {
					result += ');';
					print = false;
				}
				result += 'include(';
				include = true;
				index++;
			} else if (print) {
				result += ');';
				print = false;
			}
			while ((currentChar = content.charAt(index)) && content.substr(index, closeLength) !== close) {
				result += currentChar;
				index++;
			}
			if (!currentChar) {
				throw 0;
			} else if (!print) {
				if (include) {
					result += ')';
					include = false;
				}
			}
			index += closeLength;
			afterCode = true;
		} else if (currentChar) {
			while ((currentChar = content.charAt(index)) && (currentSec = content.substr(index, openLength)) !== open) {
				if (currentChar === '\'' || currentChar === '\\') {
					if (afterCode || beforeCode) {
						afterCode = false;
						beforeCode = false;
						temp += buffer;
						buffer = '';
					}
					temp += '\\' + currentChar;
				} else if (currentChar === '\n' || currentSec === '\r\n' || currentChar === '\r' || currentChar === '\u2028' || currentChar === '\u2029') {
					if (!afterCode) {
						temp += buffer;
					}
					afterCode = false;
					beforeCode = true;
					buffer = '\\n';
				} else {
					if ((afterCode || beforeCode) && (currentChar === ' ' || currentChar === '\t')) {
						buffer += currentChar;
					} else {
						if (afterCode || beforeCode) {
							afterCode = false;
							beforeCode = false;
							temp += buffer;
							buffer = '';
						}
						temp += currentChar;
					}
				}
				index++;
			}
			if (temp) {
				if (print) {
					result += ',\'';
				} else {
					result += 'print(\'';
					print = true;
				}
				result += temp + '\'';
				temp = '';
			}
		}
		if (!content.charAt(index) && print) {
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
			content = fs.readFileSync(source, 'utf8');
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

// Render templates from strings or files
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
	
	executable = 'var resultContent=\'\',include=function(file,imports,id){resultContent+=this.render(\'' + (source ? path.dirname(source) : path.dirname(module.parent.filename)) + '\'+\'/\'+file,imports,id)}.bind(this),print=function(){for(var i=0,n=arguments.length;i<n;i++){resultContent+=arguments[i]}};' + result + ';return resultContent';
	if (this.raw) {
		return executable;
	}
	return this.compile(executable, imports);
};