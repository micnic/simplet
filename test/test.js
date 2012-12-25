var simplet = require('../index');

//var engine = simplet();

//console.log(simplet('test.html.ejs'));



//console.log(engine.parse('<%test%><%test2%>'));
console.log(simplet().render(__dirname + '/test.html.ejs', {user:{name:'micnic'}}));

/*simplet('test.html.ejs', {
    user: 'me',
    password: 'password'
}).pipe(process.stdout);*/