'use strict';

var tap = require('tap');

var simplet = require('simplet');

var engine = simplet({
	globals: {
		string: 'simplet'
	}
});

tap.test('render check', function (test) {

	engine.template('t1', '<% print(\'simplet\') %>');
	test.ok(engine.render('t1') === 'simplet');

	engine.template('t2', '<% print(\'"&\\\'<>\') %>');
	test.ok(engine.render('t2') === '"&\'<>');

	engine.template('t3', '<% printx(\'"&\\\'<>\') %>');
	test.ok(engine.render('t3') === '&quot;&amp;&apos;&lt;&gt;');

	engine.template('t4', '<% include(\'t3\') %>');
	test.ok(engine.render('t4') === '&quot;&amp;&apos;&lt;&gt;');

	test.end();
});

tap.test('render with imports check', function (test) {

	var imports = {};

	imports.salutation = 'hello';

	engine.template('t5', '<% print(salutation + \' \' + string) %>');
	test.ok(engine.render('t5', imports) === 'hello simplet');

	test.end();
});