var simplet = require('../index'),
	str = ' <% if (foo) { %><p><%= foo %></p><% } %>',
    times = 50000;

console.log('rendering ' + times + ' times');
var engine = simplet();
var start = new Date;

while (times--) {
	engine.render({
		id: 'test',
		content: str
	}, {foo: 'bar'});
}

console.log('took ' + (new Date - start) + 'ms');