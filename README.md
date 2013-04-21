# simpleT 0.1.1

simpleT is a simple template engine for Node.JS that has some special features:

- Simple structure with minimum configuration
- Embedded JavaScript support
- Client-side support
- High performance
- Customizable code delimiters
- Global values injection
- Dynamic caching
- Includes
- Automatic HTML characters escape
- Result without redundant whitespace

#### Works in Node.JS 0.10+
#### Any feedback is welcome!

#### More simple modules:
- [simpleR](http://micnic.github.com/simpleR/)
- [simpleS](http://micnic.github.com/simpleS/)

### [Documentation](https://github.com/micnic/simpleT/wiki/Documentation "simpleT Documentation")

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