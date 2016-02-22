var jml = {
	functions: [],
	components: [],
	
	reset() {
		jml.functions = [];
		jml.components = [];
	},
	
	goto(hash) {
		window.location.hash = hash || '';
	},
	
	render(o) {
		if (o === undefined) {
			return '[undefined]';
		} else if (o instanceof String || typeof o === "string") {
			return o;
		} else if (o instanceof Number || typeof o === 'number') {
			return o.toString();
		} else if (o instanceof Array){
			return jml.renderArray(o);
		} else if (o.getBody instanceof Function) {
			return jml.renderComponent(o);
		} else {
			return jml.renderObject(o);
		}
	},

	rerender(c, body) {
		var changes = 0;
		jml.renderComponent(c, body);
		if (c.dirty) {
			var element = document.getElementById(c.id);
			if (element) {
				changes++;
				element.outerHTML = c.html;
			} else {
				var pos = jml.components.indexOf(c);
				if (pos > -1) {
					jml.components.splice(pos, 1);
				}
			}
		}
		return changes;
	},
	
	logPerformance(action, name) {
		var start = performance.now();
		try {
			return action();
		} finally {
			var end = performance.now();
			console.log("performance: " + name + " took " + (end - start) + "ms.");
		}
	},

	renderArray(a) {
		var html = '';
		a.forEach(o => html += jml.render(o));
		return html;
	},

	renderComponent(c, body) {
		if (c.jmlid === undefined) {
			c.jmlid = jml.components.push(c) - 1;
			if (c.id === undefined) c.id = c.jmlid;
		}
		if (body === undefined) { 
			body = c.getBody();
		}
		if (body instanceof Promise) {
			body.then(
				newBody => jml.rerender(c, newBody), 
				error => jml.rerender(c, error)
			);
			body = c.getLoadingBody();
		}
		var html = '<component id="' + c.id  + '">';
		html += jml.render(body);
		html += '</component>';
		c.dirty = (c.html === undefined) ? false : c.html != html;
		c.html = html;
		if (c.watch) {
			jml.addWatcher(c.watch, c);
		}
		return html;
	},
	
	//todo: is watchers a useful thing?
	addWatcher(obj, c) {
		if (!obj.watchers) obj.watchers = [];
		if (!obj.watchers.find(w => w === c)) {
			obj.watchers.push(c);
		}
		if (!obj.notifyWatchers) {
			obj.notifyWatchers = function(data) {
				for (var w in obj.watchers) {
					var notifyComponent = obj.watchers[w];
					if (!document.getElementById(notifyComponent.id)){
						delete obj.watchers[w];
					} else {
						jml.rerender(notifyComponent);
					}
				}
			}
		}
	},
	
	renderObject(o) {
		var html = '';
		for (var p in o) {
			if (jml.isAttribute(p)) {
				continue; //attribute should already be applied
			}
			var classProp, name, pos;
			if ((pos = p.indexOf('$')) > 0) {
				name = p.substring(0, pos);
				classProp = p.substring(pos + 1).split('$');
			} else {
				name = p;
				classProp = [];
			}
			var children = jml.hasChildren(o[p]);
			html += jml.renderElementOpen(name, o[p], classProp, !children);
			if (children) {
				html += jml.render(o[p]);
				html += '</' + name + '>';
			}
		}
		return html;
	},

	renderElementOpen(name, o, classProp, close) {
		return '<' + name + 
			jml.renderProps(o, classProp) + (
			close ? ' />' : '>');
	},

	renderProps(o, classProp) {
		var props = '';
		if (o instanceof Array) {
			o.forEach(p => props += jml.renderPropsFromObject(p, classProp));
		} else {
			props = jml.renderPropsFromObject(o, classProp);
		}
		if (jml.usableClassProp(classProp)) {
			props = " class='" + classProp.join(' ') + "'" + props;
		}
		return props;
	},

	renderPropsFromObject(o, classProp) {
		var props = '';
		for (var p in o) {
			if (jml.isAttribute(p)) {
				props += ' ';
				var val = o[p];
				p = p.substring(1);
				if (val instanceof Array && val[0] instanceof Function) {
					var f = jml.addFunction(val[0]);
					var nameHelp = val[0].name ? '/*' + val[0].name + '*/' : '';
					val.shift();
					props += p + '="jml.functions[' + f + nameHelp + '](' + val.join(',') + ')"';
				}
				if (val instanceof Function) {
					var f = jml.addFunction(val);
					var nameHelp = val.name ? '/*' + val.name + '*/' : '';
					props += p + '="jml.functions[' + f + nameHelp + ']()"';
				} else if (p == 'class') {
					if (val instanceof Array) {
						[].push.apply(classProp, val);
					} else if (val.indexOf(' ') > -1) {
						[].push.apply(classProp, val.split(' '));
					} else if (val) {
						classProp.push(val);
					}
				} else {
					props += p + '="' + (val ? val : '') + '"';
				}
			}
		}
		return props;
	},
	
	usableClassProp(classProp) {
		if (classProp.length == 0) return false;
		for (var i = 0; i < classProp.length; i++) {
			if (!classProp[i] || (classProp.indexOf(classProp[i], i + 1) > -1)) {         
				classProp.splice(i, 1);
				i--;
			}
		}
		return classProp.length > 0;
	},

	addFunction(f) {
		var i = jml.functions.indexOf(f);
		if (i > -1) return i;
		return jml.functions.push(f) - 1;
	},

	isAttribute(o) {
		return o.indexOf('_')===0;
	},
	
	hasChildren(o) {
		if (o instanceof Array || 
			(typeof o === "string" || o instanceof String) ||
			(o instanceof Number || typeof o === 'number')) return true;
		for (var k in o) {
			if (!jml.isAttribute(k))
				return true;
		}
		return false;
	},
	
}

var prop = {
	classIf(condition, className, falseName) {
		if (condition) {
			return {_class: className};
		} else if (falseName) {
			return {_class: falseName};
		} else {
			return {};
		}
	},
	onClick(func, ...args) {
		if (args.length > 0) {
			var params = [func];
			args.forEach(a => params.push("'" + a + "'"));
			return {_onclick: params};			
		} else {
			return {_onclick: func};
		}
	}
}

