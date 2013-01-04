var simplet = require('../index'),
	str = ' <% if (foo) { %><p><%= foo %></p><% } %>',
    times = 50000;

console.log('rendering ' + times + ' times');
var engine = simplet({cache:true,string:true});
var start = new Date;

while (times--) {
	engine.render(str, {foo: 'bar'}, 'test');
}

console.log('took ' + (new Date - start) + 'ms');