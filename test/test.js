var simplet = require('../index');

//var engine = simplet();

//console.log(simplet('test.html.ejs'));



//console.log(engine.parse('<%test%><%test2%>'));
string = '<% for (var i = 1; i <= n; i++) { %>\n	<% if (i % 15 == 0) { %>\n	FizzBuzz\n	<% } else { %>\n		<% if (i % 3 == 0) { %>\n		Fizz\n		<% } else { %>\n			<% if (i % 5 == 0) { %>\n			Buzz\n			<% } else { %>\n			<%= i %>			<% } %>		<% } %>	<% } %><% } %>';
engine = simplet();
console.log('"' + engine.render({ content:string}, {n: 10}) + '"');

/*simplet('test.html.ejs', {
    user: 'me',
    password: 'password'
}).pipe(process.stdout);*/