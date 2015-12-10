'use strict';

var tap = require('tap');

var simplet = require('simplet');

var engine = simplet({
	open: '{{',
	close: '}}'
});

tap.test('syntax check', function (test) {

	engine.template('t1', '{{ print(\'simplet\') }}');
	test.ok(engine.container['t1.ejs'].compiled === 'print(\'simplet\')');

	engine.template('t2', '{{ print(\'simplet\')');
	test.ok(engine.container['t2.ejs'].compiled === 'print(\'simplet\')');

	engine.template('t3', 'a{{ print(\'simplet\') }}');
	test.ok(engine.container['t3.ejs'].compiled === 'print(\'a\');print(\'simplet\')');

	engine.template('t4', 'a{{ print(\'simplet\') }}b');
	test.ok(engine.container['t4.ejs'].compiled === 'print(\'a\');print(\'simplet\')\nprint(\'b\');');

	engine.template('t5', '{{- \'simplet\' }}');
	test.ok(engine.container['t5.ejs'].compiled === 'print(\'simplet\');');

	engine.template('t6', '{{- \'simplet\'');
	test.ok(engine.container['t6.ejs'].compiled === 'print(\'simplet\');');

	engine.template('t7', 'a{{- \'simplet\' }}');
	test.ok(engine.container['t7.ejs'].compiled === 'print(\'a\');print(\'simplet\');');

	engine.template('t8', 'a{{- \'simplet\' }}b');
	test.ok(engine.container['t8.ejs'].compiled === 'print(\'a\');print(\'simplet\');print(\'b\');');

	engine.template('t9', '{{= \'simplet\' }}');
	test.ok(engine.container['t9.ejs'].compiled === 'printx(\'simplet\');');

	engine.template('t10', '{{= \'simplet\'');
	test.ok(engine.container['t10.ejs'].compiled === 'printx(\'simplet\');');

	engine.template('t11', 'a{{= \'simplet\' }}');
	test.ok(engine.container['t11.ejs'].compiled === 'print(\'a\');printx(\'simplet\');');

	engine.template('t12', 'a{{= \'simplet\' }}b');
	test.ok(engine.container['t12.ejs'].compiled === 'print(\'a\');printx(\'simplet\');print(\'b\');');

	engine.template('t13', '{{@ \'simplet\' }}');
	test.ok(engine.container['t13.ejs'].compiled === 'include(\'simplet\');');

	engine.template('t14', '{{@ \'simplet\'');
	test.ok(engine.container['t14.ejs'].compiled === 'include(\'simplet\');');

	engine.template('t15', 'a{{@ \'simplet\' }}');
	test.ok(engine.container['t15.ejs'].compiled === 'print(\'a\');include(\'simplet\');');

	engine.template('t16', 'a{{@ \'simplet\' }}b');
	test.ok(engine.container['t16.ejs'].compiled === 'print(\'a\');include(\'simplet\');print(\'b\');');

	engine.template('t17', '{{# print(\'simplet\') }}');
	test.ok(engine.container['t17.ejs'].compiled === '');

	engine.template('t18', '{{# print(\'simplet\')');
	test.ok(engine.container['t18.ejs'].compiled === '');

	engine.template('t19', 'a{{# print(\'simplet\') }}');
	test.ok(engine.container['t19.ejs'].compiled === 'print(\'a\');');

	engine.template('t20', 'a{{# print(\'simplet\') }}b');
	test.ok(engine.container['t20.ejs'].compiled === 'print(\'a\');print(\'b\');');

	test.end();
});