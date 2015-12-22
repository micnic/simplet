```javascript
var simplet = require('simplet');
```

## New simpleT Instance
`simplet([directory, options, callback])`

directory: string

options: object

callback: function(engine: object)

simpleT uses a configuration object to set up the template engine. The configuration is applied on all templates rendered using this instance of simpleT. All templates are cached, to remove a template from the cache '.clear()' method should be used. In the server-side version of simpleT two additional arguments can be added, these are `directory` and `callback`, by providing these arguments simpleT will, internally, read, cache the files, and compile the templates for further use, the `callback` function will be triggered when all files are ready for usage. In `options` argument custom syntax for tags can be specified by modifying the `open` and `close` properties, which by default are `<%` and `%>`, another option is `extension`, it adds a suffix to the file names stored in the cache, this is useful, mainly in the server-side version (where only files with the defined extension are cached) and allow to not specify the extension while requiring templates. Each instance of simpleT has a context of values which is applied to all rendered templates, these values are defined in the `globals` options, functions have access to the internal functions like `this.include()`, `this.print()` and `this.printx()`. There is also a debug mode, in which templates more informations in case there are some errors, this mode is enabled by the option `debug`. Debug mode should be used only in the development process, because the templates compiled in debug mode are slower in compilation and execution.

```javascript
var engine = simplet({
    close: '}}',		// The close tag of the templates, default is '%>'
    debug: true,		// Enable debug mode, default is false
    extension: 'ejs',	// The name of the extension which will be added to the names of the templates
    globals: {			// Define global values and functions for rendered templates
        pi: 3.14,
        increment: function (x) {
            this.print(x + 1);
        }
    },
    open: '{{',			// The open tag of the templates, default is '<%'
});
```

## Template Syntax

The syntax below will be defined only for default open and close tags.

### Code Tag

To isolate the code from the rest of the content of the template the open and the close tags are used.

```
<% if (true) { %>		||		if (true) {
<h1>Hello World</h1>	|| =>	print('<h1>Hello World</h1>');
<% } %>					||		}
```

### Print Tag

To print some data it is necessary to use the open tag followed by an `-` or `=` symbol. The `print()` function is used to print the characters as they are, while the `printx()` function will print the characters and will escape XML characters like `"`, `&`, `'`, `<` and `>`. If an undefined argument is provided then an empty string will be prited.

```
// Simple print
<h1><%- 'Hello World' %></h1>			||
										||
// or									|| => print('<h1>');print('Hello World');print('</h1>');
										||
<h1><% print('Hello World') %></h1>		||

// Print with XML escape
<h1><%= 'Hello World' %></h1>			||
										||
// or									|| => print('<h1>');printx('Hello World');print('</h1>');
										||
<h1><% printx('Hello World') %></h1>	||
```

### Include Tag

To insert another template inside the current template it is necessary to use the open tag followed by an `@` symbol. The path to the included template has to be defined relative to the path of the current template. The included template will have access to the imported values of the current template.

```
<%@ '/path/to/template.ejs' %>			||
										||
// or									|| => include('path/to/template.ejs');
										||
<% include('/path/to/template.ejs') %>	||
```

### Comment Tag

To quickly remove any code block from the compilation result the comment tag is used, open tag followed by an `#` symbol.

```
<h1><%# print('This will not be compiled') %>Hello World</h1>	|| => print('<h1>Hello World</h1>');
```

## Template Creation

`.template(location, content)`

location: string

content: string

The `.template()` method is used to compile and cache the templates internally. The location should be provided in a posix format to allow relative localization of templates.

```js
engine.template('hello.ejs', '<%- hello, world %>');
```

## Template Rendering
`.render(source[, imports])`

source: string

imports: object

The `.render()` method is used to render the cached templates. It is possible to define some special values inside the template by adding these as attributes to the imports object.

```js
// hello.ejs
// <%- hello, world %>

engine.render('hello.ejs', {
    hello: 'Hello',
    world: 'World'
});

// Will output:
// HelloWorld
```

## Template Removal

`.clear(location)`

location: string

To remove a template from the internal cache, just provide its location to the `.clear()` method.

## Client-Side version

For the browser there is a [simplified version](https://github.com/micnic/simpleT/releases) of simpleT which needs only `options` parameter to create a new instance: `simplet([options])`. This version does not precompile any template and does not need any directory of callback defined, it has the same features as the server-side version and is configured in the same way.