var simplet = require('../index'),
    times = 50000;

var engine = simplet();
engine.precache('bench.ejs');

console.log('rendering ' + times + ' times');

var start = process.hrtime();

while (times--) {
	engine.render('bench.ejs', {foo: 'bar'});
}

var end = process.hrtime(start);

console.log('took ' + (end[0] + end[1] / 1e9) + 's');