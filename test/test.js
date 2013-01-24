var simplet = require('../index');

var engine = simplet({
	globals: {
		pi: 3.14,
		po: function (x) {
			return print('123');
		}
	}
});

console.log(engine.render({content:'<%=po(1)%>'}));