'use strict';

var tap = require('tap');

var simplet = require('simplet');

var engine = simplet({
	debug: true
});

tap.test('result check', function (test) {

	engine.template('t1', '<% print(\'simplet\') %>');
	test.ok(engine.container['t1.ejs'].compiled === 'var _l_=1;try{print(\'simplet\')}catch(e){throw{line:_l_,message:e.message,name:e.name}}');

	test.end();
});