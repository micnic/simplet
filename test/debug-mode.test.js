'use strict';

var tap = require('tap');

var simplet = require('simplet');

var engine = simplet({
	debug: true
});

tap.test('result check', function (test) {

	engine.template('t1', '<% print(\'simplet\') %>');
	test.ok(engine.container['t1.ejs'].compiled === 'var _l_=0;try{print(\'simplet\')}catch(e){e.line=_l_;throw e}');

	test.end();
});