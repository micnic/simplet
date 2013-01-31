```javascript
var simplet = require('simplet');
```

## New simpleT Instance
`simplet(config)`

config: object

simpleT uses a configuration object to set up the template engine. The configuration is applied on all templates rendered using this instance of simpleT. All templates are cached, to modify some content of the cache `.clearCache()` and `.precache()` methods should be used. Example:
```javascript
var engine = simplet({
    close: '}}', // The close tag of the templates, default is '%>'
    globals: { // Define global values and functions for rendered templates
        pi: 3.14,
        increment: function (x) {
            return x+1;
        }
    },
    open: '{{', // The open tag of the templates, default is '<%'
    raw: true // Specifies that the engine will return the executable content of the template, not the result, default is false
});
```

## Template Rendering
`.render(source[, imports])`

source: object or string

imports: object

The `.render()` method is used to render the provided templates, these templates can be as strings or files, provided in the `source` parameter, simpleT will know how to use this parameter depending on its type, if it is a string, then it will be treated as the path to the file, if the type of the parameter is an object then simpleT will get the `id` attribute for caching and the `content` attribute for the template. It is possible to define some special values inside the template by adding these as attributes to the imports object. Example:
```javascript
var result = engine.render({
    id: 'hello',
    content: '{{= hello, world}}'
}, {
    hello: 'Hello',
    world: 'World'
});

/* or as file path

result = engine.render('hello.ejs', {
    hello: 'Hello',
    world: 'World'
});
*/

// Will output:
// HelloWorld
```

`.compile(content[, imports])`

content: string

imports: object

Get the content, execute it and returns the result of the execution. Should be used with the content rendered by an engine with `config.raw = true`. Example:
```javascript
engine.compile(result);
```
## Cache Management
`.clearCache([id])`

id: string

If `id` parameter is defined then the specified source will be removed from the cache. If `id` is not defined then all the sources will be removed from the cache. Example:
```javascript
engine.clearCache('hello');
```

`.precache(source)`

source: object or string

The `.precache()` method is used to refresh the content of the source in the cache or to prepare a template for further usage. The `source` parameter is the same from the `.render()` method. Example:
```javascript
engine.precache({
    id: 'hello',
    content: '{{="Good Bye World"}}'
});

/* or as file path

engine.precache('hello.ejs');
*/
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
On the client-side simpleT can be used from `utils/simplet.js` file inside the module folder, the content of this file is available using `simplet.client` as a Buffer. The only difference from the server-side version is that instead of files HTML elements are used and their id should be provided. Example:

	<script src="../utils/simplet.js"></script>
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