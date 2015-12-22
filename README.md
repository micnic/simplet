<img src="https://raw.github.com/micnic/simpleT/master/logo.png"/>

# 0.2.1

simpleT is a simple template engine for Node.JS and web browsers that has some special features:

- Simple structure with minimum configuration
- Embedded JavaScript support
- [Client-side support](https://github.com/micnic/simpleT/releases)
- High performance
- Customizable code delimiters
- Global values injection
- Dynamic caching
- Includes
- Result without redundant whitespace

#### Works in Node.JS 0.10+
#### Any feedback is welcome!

#### More simple modules:
- [recache](https://www.npmjs.com/package/recache)
- [simpleR](https://www.npmjs.com/package/simpler)
- [simpleS](https://www.npmjs.com/package/simples)

### [Changelog](https://github.com/micnic/simpleT/wiki/Changelog)
#### [Documentation](https://github.com/micnic/simpleT/wiki/Documentation)

## Instalation

    npm install simplet

## Usage

```javascript
var simplet = require('simplet');

var engine = simplet();

// Create the template
engine.template('template.ejs', 'Hello, <% print(name) %>');

// Render the template
engine.render('template.ejs', {
    name: 'simpleT'
});

//=> Hello, simpleT

// Remove the template
engine.clear('template.ejs');
```

## Syntax
* code tag `<% code %>`
* print tag `<%- data %>` or `<% print(data) %>`
* print tag with XML escape `<%= data %>` or `<% printx(data) %>`
* include tag `<%@ template %>` or `<% include(template) %>`
* comment tag `<%# code %>`