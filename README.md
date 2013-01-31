# simpleT 0.1.0

simpleT is a simple template engine for node.js that has some special features:

- Simple structure with minimum configuration
- Embedded JavaScript support
- Client-side support
- High performance
- Customizable code delimiters
- Global values injection
- Caching
- Includes
- Automatic HTML characters escape
- Result without redundant whitespace

Tested with node.js 0.8+

*THIS DESCRIPTION IS NOT COMPLETE, MORE CONTENT WILL BE ADDED*

### [Documentation](https://github.com/micnic/simpleT/wiki/Documentation "simpleS Documentation")

#### More simple modules
[simpleS](http://micnic.github.com/simpleS/)

## Instalation

	npm install simplet

## Usage

```javascript
var simplet = require('simplet');
var stringEngine = simplet({
    close: '}}',
    open: '{{'
});

stringEngine.render({
	id: 'test',
	content: 'Hello {{=name}}'
}, {
    name: 'me'
});
```

or

```javascript
/* ***template.ejs***

Hello <% print(name) %>

*/

var fileEngine = simplet();

fileEngine.render('template.ejs', {
    name: 'me'
});

/* ***output***

Hello me

*/
```

## Syntax
* code isolation `<% code %>`
* data printing `<%= data %>` or `<% print(data) %>`
* includes `<%# template %>` or `<% include(template) %>`