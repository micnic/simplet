var simplet = require('simplet');

var engine = simplet({
	globals: {
		pi: 3.14,
		po: function (x) {
			return print('123');
		}
	}
});

console.log(engine.render('test.html.ejs', {
	test: 2
}));