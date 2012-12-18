```javascript
var simplet = require('simplet');
```

## New simpleT Instance
`simplet(config)`

config: object

simpleT uses a configuration object which is used to set up the template engine. The configuration is applied on all templates rendered using this instance of simpleT. Example:
```javascript
var engine = simplet({
    cache: false, // Cache the generated code, default is true
    close: '}}', // The close tag of the templates, default is '%>'
    open: '{{', // The open tag of the templates, default is '<%'
    string: true, // Specifies if the provided source is a string or the path of a file, default is false (file path)
    raw: true // Specifies that the engine will return the executable content of the template, not the result, default is false
});
```

## Template rendering
`.render(source[, imports, id])`

source: string

imports: object

id: string

The `.render()` method is used to render the provided templates, these templates can be as strings or filepaths, provided in the source `parameter`, simpleT will know how to use the depending on the string attribute in the config object of the engine. It is possible to define some special values inside the template by adding these ass attributes to the imports object. The last parameter is used as identification for caching the template only if the first parameter is used as the whole template string. Example:
```javascript
engine.render('{{="Hello World"}}', {
    hello: 'hello',
    world: 'world'
}, 'HelloWorld');
```
## Template syntax
The syntax below will be defined only for default open and close tags.
### Code isolation
To isolate the code from the rest of the content of the template the open and the close tags are used, example:

	<% if (true) { %>
	<h1>Hello World</h1>
	<% } %>

### Data Printing
To print some data it is necessary to use the open tag followed by an `=` symbol, the data and the close tag or using the `print()` function inside the code isolation, example:

	<%= 'HelloWorld'.toLowerCase() %>

or

	<% print('HelloWorld'.toLowerCase()) %>

### Includes
To insert another template inside the current template it is necessary to use the open tag followed by an `#` symbol, the path to the template and the close tag or using the `include()` function inside the code isolation, example:

	<%# 'header.ejs' %>

or

	<% include('header.ejs') %>