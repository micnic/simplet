# simpleT 0.0.1

simpleS is a simple template engine for node.js that has some special features:

- Simple structure with minimum configuration
- Embedded JavaScript support
- High performance
- Global values injection
- Caching
- Includes

Tested with node.js 0.8+

*THIS DESCRIPTION IS NOT COMPLETE, MORE CONTENT WILL BE ADDED*

## Instalation

	npm install simplet

## Usage

```javascript
var simplet = require('simplet');
var stringEngine = simplet({
    cache: false,
    close: '}}',
    open: '{{',
    string: true
});

stringEngine.render('Hello {{=name}}', {
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
```

## Syntax
* code isolation `<% code %>`
* data printing `<%= data %>` or `<% print(data) %>`
* includes `<%# template %>` or `<% include(template) %>`