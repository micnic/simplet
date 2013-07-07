```javascript
var simplet = require('simplet');
```

## New simpleT Instance
`simplet(config)`

config: object

simpleT uses a configuration object to set up the template engine. The configuration is applied on all templates rendered using this instance of simpleT. All templates are cached, to remove a template from the cache '.clear()' method should be used. Example:
```javascript
var engine = simplet({
    close: '}}',		// The close tag of the templates, default is '%>'
    extension: 'ejs',	// The name of the extension which will be added to the names of the templates
    folder: 'views',	// The name of the folder, in which the templates are placed
    globals: {			// Define global values and functions for rendered templates
        pi: 3.14,
        increment: function (x) {
            this.print(x + 1);
        }
    },
    open: '{{',			// The open tag of the templates, default is '<%'
});
```

## Template Rendering
`.render(source[, imports])`

source: object or string

imports: object

The `.render()` method is used to render the provided templates, on the server-side the source is the path to the file, on the client-side - string. It is possible to define some special values inside the template by adding these as attributes to the imports object. Example:
```javascript
/* hello.ejs
{{= hello, world}}
*/

result = engine.render('hello.ejs', {
    hello: 'Hello',
    world: 'World'
});

// Will output:
// HelloWorld
```
## Cache Management
The next 2 methods are available only for Node.JS environment.
`.precache(source)`

source: string

Adds to the cache the parsed content of the template for future uses. This method is good to use before the templates are rendered, anyway it is called while rendering if the template was not cached. Example:
```javascript
engine.precache('hello.ejs');
```

`.clear([source])`

source: string

If `source` parameter is defined then the specified source will be removed from the cache else all the sources will be removed from the cache. Example:
```javascript
engine.clear('hello.ejs');
```
## Template Syntax
The syntax below will be defined only for default open and close tags.
### Code Isolation
To isolate the code from the rest of the content of the template the open and the close tags are used, example:

	<% if (true) { %>
	<h1>Hello World</h1>
	<% } %>

### Data Printing
To print some data it is necessary to use the open tag followed by an `=` symbol, the data and the close tag or using the `print()` function inside the code isolation, this function will escape automatically the HTML characters, example:

	<%= 'HelloWorld'.toLowerCase() %>

or

	<% print('HelloWorld'.toLowerCase()) %>

### Includes
To insert another template inside the current template it is necessary to use the open tag followed by an `#` symbol, the path to the template and the close tag or using the `include()` function inside the code isolation, example:

	<%# 'header.ejs' %>

or

	<% include('header.ejs') %>
## Client-Side
On the client-side simpleT can be used from `simplet.client` as a Buffer. The only difference from the server-side version is that instead of files strings are used, and these are not cached. Example:

	<script src="/path/to/simplet.js"></script>
	<script id="include" type="text/simplet">
		<%= add + 1 %><br>
	</script>
	<script id="template" type="text/simplet">
		1<br>
		<%# 'include', {add: 1} %>
		<% print(3) %>
	</script>
	<script>
		window.onload = function () {
			var engine = simplet({});
			document.getElementById('result').innerHTML = engine.render('template', {});
		}
		// 'result' is the id of an HTML element in which will be added the  result content of the template
	</script>