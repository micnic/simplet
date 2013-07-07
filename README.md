# simpleT 0.1.2

simpleT is a simple template engine for Node.JS and web browsers that has some special features:

- Simple structure with minimum configuration
- Embedded JavaScript support
- Client-side support
- High performance
- Customizable code delimiters
- Global values injection
- Dynamic caching
- Includes
- Result without redundant whitespace

#### Works in Node.JS 0.10+
#### Any feedback is welcome!

#### More simple modules:
- [simpleR](http://micnic.github.com/simpleR/)
- [simpleS](http://micnic.github.com/simpleS/)

#### [Documentation](https://github.com/micnic/simpleT/wiki/Documentation)

## Instalation

	npm install simplet

## Usage

```javascript
var simplet = require('simplet');

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