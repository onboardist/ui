'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var LeaderLine = _interopDefault(require('leader-line'));
var isDom = _interopDefault(require('is-dom'));
var Popper = _interopDefault(require('popper.js'));
var waitForTheElement = require('wait-for-the-element');

function noop() {}

function assign(tar, src) {
	for (var k in src) { tar[k] = src[k]; }
	return tar;
}

function assignTrue(tar, src) {
	for (var k in src) { tar[k] = 1; }
	return tar;
}

function callAfter(fn, i) {
	if (i === 0) { fn(); }
	return function () {
		if (!--i) { fn(); }
	};
}

function addLoc(element, file, line, column, char) {
	element.__svelte_meta = {
		loc: { file: file, line: line, column: column, char: char }
	};
}

function run(fn) {
	fn();
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function reinsertChildren(parent, target) {
	while (parent.firstChild) { target.appendChild(parent.firstChild); }
}

function destroyEach(iterations, detach) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) { iterations[i].d(detach); }
	}
}

function createFragment() {
	return document.createDocumentFragment();
}

function createElement(name) {
	return document.createElement(name);
}

function createSvgElement(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler, options) {
	node.addEventListener(event, handler, options);
}

function removeListener(node, event, handler, options) {
	node.removeEventListener(event, handler, options);
}

function setAttribute(node, attribute, value) {
	if (value == null) { node.removeAttribute(attribute); }
	else { node.setAttribute(attribute, value); }
}

function setXlinkAttribute(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

function setData(text, data) {
	text.data = '' + data;
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function toggleClass(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = noop;

	this._fragment.d(detach !== false);
	this._fragment = null;
	this._state = {};
}

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function _differsImmutable(a, b) {
	return a != a ? b == b : a !== b;
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) { return; }

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			try {
				handler.__calling = true;
				handler.call(this, data);
			} finally {
				handler.__calling = false;
			}
		}
	}
}

function flush(component) {
	component._lock = true;
	callAll(component._beforecreate);
	callAll(component._oncreate);
	callAll(component._aftercreate);
	component._lock = false;
}

function get() {
	return this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._slots = blankObject();
	component._bind = options._bind;
	component._staged = {};

	component.options = options;
	component.root = options.root || component;
	component.store = options.store || component.root.store;

	if (!options.root) {
		component._beforecreate = [];
		component._oncreate = [];
		component._aftercreate = [];
	}
}

function on(eventName, handler) {
	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) { handlers.splice(index, 1); }
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) { return; }
	flush(this.root);
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	newState = assign(this._staged, newState);
	this._staged = {};

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
	}
	if (!dirty) { return; }

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) { this._bind(changed, this._state); }

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function _stage(newState) {
	assign(this._staged, newState);
}

function setDev(newState) {
	if (typeof newState !== 'object') {
		throw new Error(
			this._debugName + '.set was called without an object of data key-values to update.'
		);
	}

	this._checkReadOnly(newState);
	set.call(this, newState);
}

function callAll(fns) {
	while (fns && fns.length) { fns.shift()(); }
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

var protoDev = {
	destroy: destroyDev,
	get: get,
	fire: fire,
	on: on,
	set: setDev,
	_recompute: noop,
	_set: _set,
	_stage: _stage,
	_mount: _mount,
	_differs: _differs
};

/* src/components/coachmark/ActionButton.svelte generated by Svelte v2.16.1 */

function data() {
  return {
    // type: 'close',
    icon: 'X',
    // coachmark: null,
    // flow: null,
  }
}
function oncreate() {
  this.refs.el.focus();
}
var file = "src/components/coachmark/ActionButton.svelte";

function add_css() {
	var style = createElement("style");
	style.id = 'svelte-5ep7m8-style';
	style.textContent = ".action-btn.svelte-5ep7m8{background:none;z-index:1002;border-radius:50%;border:3px solid #fff;height:56px;width:56px;position:fixed;top:0;right:0;color:#fff;margin:5vmin;font-size:36px;line-height:58px;text-align:center;cursor:pointer;box-shadow:0 2px 2px 0 rgba(255, 255, 255, 0.12), 0 1px 5px 0 rgba(255, 255, 255, 0.12), 0 3px 1px -2px rgba(255, 255, 255, 0.2);font-family:sans-serif}.next-button.svelte-5ep7m8 use.svelte-5ep7m8{fill:#fff}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uQnV0dG9uLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQWN0aW9uQnV0dG9uLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8YnV0dG9uIHJlZjplbCBjbGFzcz1cImFjdGlvbi1idG5cIiBvbjpjbGljayB0YWJpbmRleD1cIjBcIiBhcmlhLWxhYmVsPXt0eXBlID09PSAnbmV4dCcgPyAnTmV4dCcgOiAnQ2xvc2UnfT5cbiAgeyNpZiB0eXBlID09PSAnbmV4dCd9XG4gICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3M9XCJuZXh0LWJ1dHRvblwiPlxuICAgICAgPGcgdHJhbnNmb3JtPVwic2NhbGUoMC4wNjUpLCB0cmFuc2xhdGUoMTQwLCAxNzApXCI+XG4gICAgICAgIDx1c2UgeGxpbms6aHJlZj1cIiNyaWdodC1hcnJvd1wiPjwvdXNlPlxuICAgICAgPC9nPlxuICAgIDwvc3ZnPlxuICB7OmVsc2V9XG4gICAge2ljb259XG4gIHsvaWZ9XG48L2J1dHRvbj5cblxuPHN0eWxlPi5vbmJvYXJkaXN0LWJ1dHRvbiB7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm9yZGVyOiAxcHggc29saWQgI2NjY2NjYztcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGNvbG9yOiAjY2NjY2NjO1xuICBmb250LXNpemU6IDAuOGVtO1xuICBwYWRkaW5nOiAwLjVlbSAxZW07XG4gIG1hcmdpbjogMC41ZW07XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5vbmJvYXJkaXN0LWJ1dHRvbjpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gIGJvcmRlci1jb2xvcjogI2ZmZjtcbiAgY29sb3I6IHdoaXRlO1xuICBib3gtc2hhZG93OiBpbnNldCAwcHggMHB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XG59XG4uYWN0aW9uLWJ0biB7XG4gIGJhY2tncm91bmQ6IG5vbmU7XG4gIHotaW5kZXg6IDEwMDI7XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgYm9yZGVyOiAzcHggc29saWQgI2ZmZjtcbiAgaGVpZ2h0OiA1NnB4O1xuICB3aWR0aDogNTZweDtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBjb2xvcjogI2ZmZjtcbiAgbWFyZ2luOiA1dm1pbjtcbiAgZm9udC1zaXplOiAzNnB4O1xuICBsaW5lLWhlaWdodDogNThweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGJveC1zaGFkb3c6IDAgMnB4IDJweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMiksIDAgMXB4IDVweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMiksIDAgM3B4IDFweCAtMnB4IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcbiAgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG59XG4ubmV4dC1idXR0b24gdXNlIHtcbiAgZmlsbDogI2ZmZjtcbn1cbjwvc3R5bGU+XG5cbjxzY3JpcHQ+XG5leHBvcnQgZGVmYXVsdCB7XG4gIGRhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIHR5cGU6ICdjbG9zZScsXG4gICAgICBpY29uOiAnWCcsXG4gICAgICAvLyBjb2FjaG1hcms6IG51bGwsXG4gICAgICAvLyBmbG93OiBudWxsLFxuICAgIH1cbiAgfSxcbiAgb25jcmVhdGUoKSB7XG4gICAgdGhpcy5yZWZzLmVsLmZvY3VzKCk7XG4gIH0sXG4gIC8vIG1ldGhvZHM6IHtcbiAgLy8gICBoYW5kbGVDbGljaygpIHtcbiAgLy8gICAgIGNvbnN0IGNvYWNobWFyayA9IHRoaXMuZ2V0KCkuY29hY2htYXJrO1xuICAvLyAgICAgaWYgKCFjb2FjaG1hcmspIHtcbiAgLy8gICAgICAgY29uc29sZS5lcnJvcignTm8gY29hY2htYXJrIHNwZWNpZmllZCBmb3IgYWN0aW9uIGJ1dHRvbicpO1xuICAvLyAgICAgICByZXR1cm47XG4gIC8vICAgICB9XG5cbiAgLy8gICAgIGxldCBmbG93ID0gY2FjaGUoJ2Zsb3cnKTtcbiAgLy8gICAgIGlmIChjb2FjaG1hcmsuZmxvdykgZmxvdyA9IGNhY2hlLnNldCgnZmxvdycsIGNvYWNobWFyay5mbG93KTtcblxuICAvLyAgICAgaWYgKGZsb3cpIHtcbiAgLy8gICAgICAgY29uc3QgbmV4dCA9IGZsb3cuZ2V0TmV4dChjb2FjaG1hcmsubmFtZSk7XG4gIC8vICAgICAgIGlmIChuZXh0KSB7XG4gIC8vICAgICAgICAgdGhpcy50eXBlID0gJ25leHQnO1xuICAvLyAgICAgICAgIHJldHVybiB0aGlzLmZpcmUoJ25leHQnLCB7IG5leHQgfSk7XG4gIC8vICAgICAgIH0gZWxzZSBjYWNoZS5yZW1vdmUoJ2Zsb3cnKTtcbiAgLy8gICAgIH1cblxuICAvLyAgICAgdGhpcy5jbGVhcigpO1xuICAvLyAgIH0sXG4gIC8vICAgY2xlYXIoKSB7XG4gIC8vICAgICB0aGlzLmZpcmUoJ2NsZWFyJyk7XG4gIC8vICAgfSxcbiAgLy8gfVxufVxuPC9zY3JpcHQ+XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBOEJBLFdBQVcsY0FBQyxDQUFDLEFBQ1gsVUFBVSxDQUFFLElBQUksQ0FDaEIsT0FBTyxDQUFFLElBQUksQ0FDYixhQUFhLENBQUUsR0FBRyxDQUNsQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQ3RCLE1BQU0sQ0FBRSxJQUFJLENBQ1osS0FBSyxDQUFFLElBQUksQ0FDWCxRQUFRLENBQUUsS0FBSyxDQUNmLEdBQUcsQ0FBRSxDQUFDLENBQ04sS0FBSyxDQUFFLENBQUMsQ0FDUixLQUFLLENBQUUsSUFBSSxDQUNYLE1BQU0sQ0FBRSxLQUFLLENBQ2IsU0FBUyxDQUFFLElBQUksQ0FDZixXQUFXLENBQUUsSUFBSSxDQUNqQixVQUFVLENBQUUsTUFBTSxDQUNsQixNQUFNLENBQUUsT0FBTyxDQUNmLFVBQVUsQ0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ2pJLFdBQVcsQ0FBRSxVQUFVLEFBQ3pCLENBQUMsQUFDRCwwQkFBWSxDQUFDLEdBQUcsY0FBQyxDQUFDLEFBQ2hCLElBQUksQ0FBRSxJQUFJLEFBQ1osQ0FBQyJ9 */";
	append(document.head, style);
}

function create_main_fragment(component, ctx) {
	var button, button_aria_label_value, current;

	function select_block_type(ctx) {
		if (ctx.type === 'next') { return create_if_block; }
		return create_else_block;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(component, ctx);

	function click_handler(event) {
		component.fire("click", event);
	}

	return {
		c: function create() {
			button = createElement("button");
			if_block.c();
			addListener(button, "click", click_handler);
			button.className = "action-btn svelte-5ep7m8";
			button.tabIndex = "0";
			setAttribute(button, "aria-label", button_aria_label_value = ctx.type === 'next' ? 'Next' : 'Close');
			addLoc(button, file, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert(target, button, anchor);
			if_block.m(button, null);
			component.refs.el = button;
			current = true;
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(component, ctx);
				if_block.c();
				if_block.m(button, null);
			}

			if ((changed.type) && button_aria_label_value !== (button_aria_label_value = ctx.type === 'next' ? 'Next' : 'Close')) {
				setAttribute(button, "aria-label", button_aria_label_value);
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(button);
			}

			if_block.d();
			removeListener(button, "click", click_handler);
			if (component.refs.el === button) { component.refs.el = null; }
		}
	};
}

// (8:2) {:else}
function create_else_block(component, ctx) {
	var text;

	return {
		c: function create() {
			text = createText(ctx.icon);
		},

		m: function mount(target, anchor) {
			insert(target, text, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.icon) {
				setData(text, ctx.icon);
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

// (2:2) {#if type === 'next'}
function create_if_block(component, ctx) {
	var svg, g, use;

	return {
		c: function create() {
			svg = createSvgElement("svg");
			g = createSvgElement("g");
			use = createSvgElement("use");
			setXlinkAttribute(use, "xlink:href", "#right-arrow");
			setAttribute(use, "class", "svelte-5ep7m8");
			addLoc(use, file, 4, 8, 258);
			setAttribute(g, "transform", "scale(0.065), translate(140, 170)");
			addLoc(g, file, 3, 6, 200);
			setAttribute(svg, "xmlns", "http://www.w3.org/2000/svg");
			setAttribute(svg, "class", "next-button svelte-5ep7m8");
			addLoc(svg, file, 2, 4, 133);
		},

		m: function mount(target, anchor) {
			insert(target, svg, anchor);
			append(svg, g);
			append(g, use);
		},

		p: noop,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(svg);
			}
		}
	};
}

function ActionButton(options) {
	var this$1 = this;

	this._debugName = '<ActionButton>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data(), options.data);
	if (!('type' in this._state)) { console.warn("<ActionButton> was created without expected data property 'type'"); }
	if (!('icon' in this._state)) { console.warn("<ActionButton> was created without expected data property 'icon'"); }
	this._intro = !!options.intro;

	if (!document.getElementById("svelte-5ep7m8-style")) { add_css(); }

	this._fragment = create_main_fragment(this, this._state);

	this.root._oncreate.push(function () {
		oncreate.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(ActionButton.prototype, protoDev);

ActionButton.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var performanceNow = createCommonjsModule(function (module) {
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(commonjsGlobal);


});

var root = typeof window === 'undefined' ? commonjsGlobal : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix];

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix];
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix];
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60;

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = performanceNow()
        , next = Math.max(0, frameDuration - (_now - last));
      last = next + _now;
      setTimeout(function() {
        var cp = queue.slice(0);
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0;
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last);
            } catch(e) {
              setTimeout(function() { throw e }, 0);
            }
          }
        }
      }, Math.round(next));
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    });
    return id
  };

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true;
      }
    }
  };
}

var raf_1 = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
};
var cancel = function() {
  caf.apply(root, arguments);
};
var polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf;
  object.cancelAnimationFrame = caf;
};
raf_1.cancel = cancel;
raf_1.polyfill = polyfill;

/* src/components/coachmark/Arrow.svelte generated by Svelte v2.16.1 */



var COLOR = '#fff';

function data$1() {
	return {
  line: null,
  from: null,
  to: null,
};
}

var methods = {
  redraw: function redraw() {
    var this$1 = this;

    if (this.line) { this.line.remove(); }
    
    raf_1(function () {
      this$1.leaderLine(this$1.get().from, this$1.get().to);
    });
  },
  leaderLine: function leaderLine(from, to) {
    // console.log(from, to, this)
    if (!from || !to) { return; }
    if (this.line) {
      try {
        // NOTE: this fails if we try to remove in the middle of it rendering
        this.line.remove();
      } catch (e) {
        // ...
      }
    }

    var anchorOpts = {};

    this.line = new LeaderLine(
      LeaderLine.areaAnchor(from, anchorOpts),
      LeaderLine.areaAnchor(to, anchorOpts),
      {
        color: COLOR,
        endPlugColor: COLOR,
        startPlugColor: COLOR,
        // endPlugSize: 0.5,
      }
    );

    this.line.path = 'fluid';
    this.line.position();

    // Put filter on lines after they've been drawn
    var lines = document.querySelectorAll('.leader-line-line-path');
    Array.prototype.forEach.call(lines, function (line) {
      // TODO: I've disabled the chalk roughness for now, until I can find a way to make the text rough as well
      line.setAttribute('filter', 'url(#coachmark-chalk)');
    });
  }
};

function ondestroy() {
  if (this.line) { this.line.remove(); }
}
function onstate(ref) {
  var current = ref.current;

  this.redraw();
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-1fgyaiq-style';
	style.textContent = ".leader-line{z-index:1002}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJyb3cuc3ZlbHRlIiwic291cmNlcyI6WyJBcnJvdy5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHN2ZWx0ZTp3aW5kb3cgb246cmVzaXplPVwicmVkcmF3KClcIiBvbjpzY3JvbGw9XCJyZWRyYXcoKVwiIG9uOm9yaWVudGF0aW9uY2hhbmdlPVwicG9zaXRpb24oKVwiPjwvc3ZlbHRlOndpbmRvdz5cblxuPHNjcmlwdD5cbmltcG9ydCBMZWFkZXJMaW5lIGZyb20gJ2xlYWRlci1saW5lJztcbmltcG9ydCByYWYgZnJvbSAncmFmJztcblxuY29uc3QgQ09MT1IgPSAnI2ZmZic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGF0YTogKCkgPT4gKHtcbiAgICBsaW5lOiBudWxsLFxuICAgIGZyb206IG51bGwsXG4gICAgdG86IG51bGwsXG4gIH0pLFxuICBvbnN0YXRlKHsgY3VycmVudCB9KSB7XG4gICAgdGhpcy5yZWRyYXcoKTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHJlZHJhdygpIHtcbiAgICAgIGlmICh0aGlzLmxpbmUpIHRoaXMubGluZS5yZW1vdmUoKTtcbiAgICAgIFxuICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgdGhpcy5sZWFkZXJMaW5lKHRoaXMuZ2V0KCkuZnJvbSwgdGhpcy5nZXQoKS50byk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxlYWRlckxpbmUoZnJvbSwgdG8pIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGZyb20sIHRvLCB0aGlzKVxuICAgICAgaWYgKCFmcm9tIHx8ICF0bykgcmV0dXJuO1xuICAgICAgaWYgKHRoaXMubGluZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIE5PVEU6IHRoaXMgZmFpbHMgaWYgd2UgdHJ5IHRvIHJlbW92ZSBpbiB0aGUgbWlkZGxlIG9mIGl0IHJlbmRlcmluZ1xuICAgICAgICAgIHRoaXMubGluZS5yZW1vdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIC4uLlxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFuY2hvck9wdHMgPSB7fTtcbiAgXG4gICAgICB0aGlzLmxpbmUgPSBuZXcgTGVhZGVyTGluZShcbiAgICAgICAgTGVhZGVyTGluZS5hcmVhQW5jaG9yKGZyb20sIGFuY2hvck9wdHMpLFxuICAgICAgICBMZWFkZXJMaW5lLmFyZWFBbmNob3IodG8sIGFuY2hvck9wdHMpLFxuICAgICAgICB7XG4gICAgICAgICAgY29sb3I6IENPTE9SLFxuICAgICAgICAgIGVuZFBsdWdDb2xvcjogQ09MT1IsXG4gICAgICAgICAgc3RhcnRQbHVnQ29sb3I6IENPTE9SLFxuICAgICAgICAgIC8vIGVuZFBsdWdTaXplOiAwLjUsXG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICB0aGlzLmxpbmUucGF0aCA9ICdmbHVpZCc7XG4gICAgICB0aGlzLmxpbmUucG9zaXRpb24oKTtcblxuICAgICAgLy8gUHV0IGZpbHRlciBvbiBsaW5lcyBhZnRlciB0aGV5J3ZlIGJlZW4gZHJhd25cbiAgICAgIGNvbnN0IGxpbmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxlYWRlci1saW5lLWxpbmUtcGF0aCcpO1xuICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChsaW5lcywgbGluZSA9PiB7XG4gICAgICAgIC8vIFRPRE86IEkndmUgZGlzYWJsZWQgdGhlIGNoYWxrIHJvdWdobmVzcyBmb3Igbm93LCB1bnRpbCBJIGNhbiBmaW5kIGEgd2F5IHRvIG1ha2UgdGhlIHRleHQgcm91Z2ggYXMgd2VsbFxuICAgICAgICBsaW5lLnNldEF0dHJpYnV0ZSgnZmlsdGVyJywgJ3VybCgjY29hY2htYXJrLWNoYWxrKScpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBvbmRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMubGluZSkgdGhpcy5saW5lLnJlbW92ZSgpO1xuICB9LFxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+Lm9uYm9hcmRpc3QtYnV0dG9uIHtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBib3JkZXI6IDFweCBzb2xpZCAjMDU3MWYzO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgY29sb3I6ICMwNTcxZjM7XG4gIGZvbnQtc2l6ZTogMC44ZW07XG4gIHBhZGRpbmc6IDAuNWVtIDFlbTtcbiAgbWFyZ2luOiAwLjVlbTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLm9uYm9hcmRpc3QtYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzYyQThGQztcbiAgYm9yZGVyLWNvbG9yOiAjNjJBOEZDO1xuICBjb2xvcjogd2hpdGU7XG4gIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggNXB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbn1cbjpnbG9iYWwoLmxlYWRlci1saW5lKSB7XG4gIHotaW5kZXg6IDEwMDI7XG59XG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFxRlEsWUFBWSxBQUFFLENBQUMsQUFDckIsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDIn0= */";
	append(document.head, style);
}

function create_main_fragment$1(component, ctx) {

	function onwindowresize(event) {
		component.redraw();	}
	window.addEventListener("resize", onwindowresize);

	function onwindowscroll(event) {
		component.redraw();	}
	window.addEventListener("scroll", onwindowscroll);

	function onwindoworientationchange(event) {
		component.position();	}
	window.addEventListener("orientationchange", onwindoworientationchange);

	return {
		c: noop,

		m: noop,

		p: noop,

		i: noop,

		o: run,

		d: function destroy$$1(detach) {
			window.removeEventListener("resize", onwindowresize);

			window.removeEventListener("scroll", onwindowscroll);

			window.removeEventListener("orientationchange", onwindoworientationchange);
		}
	};
}

function Arrow(options) {
	var this$1 = this;

	this._debugName = '<Arrow>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this._state = assign(data$1(), options.data);
	this._intro = !!options.intro;

	this._handlers.state = [onstate];

	this._handlers.destroy = [ondestroy];

	if (!document.getElementById("svelte-1fgyaiq-style")) { add_css$1(); }

	onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(function () {
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Arrow.prototype, protoDev);
assign(Arrow.prototype, methods);

Arrow.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/NineSlice.svelte generated by Svelte v2.16.1 */



function data$2() {
	return {
  shown: false,
};
}

var methods$1 = {
  redraw: function redraw() {
    var ref = this.get();
    var element = ref.target;
    if (!element || !isDom(element)) {
      this.set({ shown: false });
      return;
    }

    // TODO: refactor use to elementRect() function which is in Text.svelte
    var rect = element.getBoundingClientRect();

    // Overlay
    var top = rect.top;
    var left = rect.left;
    var width = rect.width;
    var height = rect.height;
    var right = left + width;
    var bottom = top + height;

    this.refs.top.style.height = top + 'px';
    this.refs.left.style.top = top + 'px';
    this.refs.right.style.top = this.refs.left.style.top;
    this.refs.left.style.height = height + 'px';
    this.refs.right.style.height = this.refs.left.style.height;
    this.refs.left.style.width = left + 'px';
    this.refs.right.style.left = right + 'px';
    this.refs.bottom.style.top = bottom + 'px';

    // Glow
    var borderRadius = window.getComputedStyle(element).getPropertyValue('border-radius');
    var glow = this.refs.glow;
    glow.style.top = (top) + 'px';
    glow.style.left = (left) + 'px';
    glow.style.width = (width) + 'px';
    glow.style.height = (height) + 'px';
    glow.style['border-radius'] = borderRadius;
    glow.style['box-shadow'] = '0 0 ' + 20 + 'px ' + 10 + 'px #fff'; //  TODO: this style should probably be dynamic
  },
  methods: {
    show: function show() {
      this.set({ shown: true });
    },
    hide: function hide() {
      this.set({ shown: false });
    },
  },
};

function onstate$1(ref) {
  var this$1 = this;
  var changed = ref.changed;
  var current = ref.current;
  var previous = ref.previous;

  raf_1(function () {
    this$1.redraw();
  });
}
var file$2 = "src/components/NineSlice.svelte";

function add_css$2() {
	var style = createElement("style");
	style.id = 'svelte-101ppji-style';
	style.textContent = ".onboardist-button.svelte-101ppji{border-radius:8px;border:1px solid #0571f3;background-color:white;color:#0571f3;font-size:0.8em;padding:0.5em 1em;margin:0.5em;text-transform:uppercase;outline:none;cursor:pointer}.onboardist-button.svelte-101ppji:hover{background-color:#62A8FC;border-color:#62A8FC;color:white;box-shadow:inset 0px 0px 5px rgba(0, 0, 0, 0.2)}.overlay.svelte-101ppji{display:none}.overlay.shown.svelte-101ppji{display:block}.top.svelte-101ppji,.left.svelte-101ppji,.right.svelte-101ppji,.bottom.svelte-101ppji{position:fixed;background:#000;opacity:0.66;margin:0;padding:0;z-index:1000}.top.svelte-101ppji{top:0;left:0;right:0;width:100%}.left.svelte-101ppji{left:0}.right.svelte-101ppji{right:0}.bottom.svelte-101ppji{bottom:0;left:0;right:0;width:100%}.glow.svelte-101ppji{position:fixed;z-index:1000}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmluZVNsaWNlLnN2ZWx0ZSIsInNvdXJjZXMiOlsiTmluZVNsaWNlLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c3ZlbHRlOndpbmRvdyBvbjpyZXNpemU9XCJyZWRyYXcoKVwiIG9uOnNjcm9sbD1cInJlZHJhdygpXCIgb246b3JpZW50YXRpb25jaGFuZ2U9XCJyZWRyYXcoKVwiPjwvc3ZlbHRlOndpbmRvdz5cbjxkaXYgcmVmOnRvcCBjbGFzcz1cInRvcCB7IHNob3duID8gJ3Nob3duJyA6ICcnIH1cIj48L2Rpdj5cbjxkaXYgcmVmOnJpZ2h0IGNsYXNzPVwicmlnaHQgeyBzaG93biA/ICdzaG93bicgOiAnJyB9XCI+PC9kaXY+XG48ZGl2IHJlZjpib3R0b20gY2xhc3M9XCJib3R0b20geyBzaG93biA/ICdzaG93bicgOiAnJyB9XCI+PC9kaXY+XG48ZGl2IHJlZjpsZWZ0IGNsYXNzPVwibGVmdCB7IHNob3duID8gJ3Nob3duJyA6ICcnIH1cIj48L2Rpdj5cbjxkaXYgcmVmOmdsb3cgY2xhc3M9XCJnbG93IHsgc2hvd24gPyAnc2hvd24nIDogJycgfVwiPjwvZGl2PlxuXG48c2NyaXB0PlxuaW1wb3J0IGlzRG9tIGZyb20gJ2lzLWRvbSc7XG5pbXBvcnQgcmFmIGZyb20gJ3JhZic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGF0YTogKCkgPT4gKHtcbiAgICBzaG93bjogZmFsc2UsXG4gIH0pLFxuICBvbnN0YXRlKHsgY2hhbmdlZCwgY3VycmVudCwgcHJldmlvdXMgfSkge1xuICAgIHJhZigoKSA9PiB7XG4gICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH0pO1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgcmVkcmF3KCkge1xuICAgICAgY29uc3QgeyB0YXJnZXQ6IGVsZW1lbnQgfSA9IHRoaXMuZ2V0KCk7XG4gICAgICBpZiAoIWVsZW1lbnQgfHwgIWlzRG9tKGVsZW1lbnQpKSB7XG4gICAgICAgIHRoaXMuc2V0KHsgc2hvd246IGZhbHNlIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHVzZSB0byBlbGVtZW50UmVjdCgpIGZ1bmN0aW9uIHdoaWNoIGlzIGluIFRleHQuc3ZlbHRlXG4gICAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgLy8gT3ZlcmxheVxuICAgICAgY29uc3QgdG9wID0gcmVjdC50b3A7XG4gICAgICBjb25zdCBsZWZ0ID0gcmVjdC5sZWZ0O1xuICAgICAgY29uc3Qgd2lkdGggPSByZWN0LndpZHRoO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gcmVjdC5oZWlnaHQ7XG4gICAgICBjb25zdCByaWdodCA9IGxlZnQgKyB3aWR0aDtcbiAgICAgIGNvbnN0IGJvdHRvbSA9IHRvcCArIGhlaWdodDtcblxuICAgICAgdGhpcy5yZWZzLnRvcC5zdHlsZS5oZWlnaHQgPSB0b3AgKyAncHgnO1xuICAgICAgdGhpcy5yZWZzLmxlZnQuc3R5bGUudG9wID0gdG9wICsgJ3B4JztcbiAgICAgIHRoaXMucmVmcy5yaWdodC5zdHlsZS50b3AgPSB0aGlzLnJlZnMubGVmdC5zdHlsZS50b3A7XG4gICAgICB0aGlzLnJlZnMubGVmdC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgICAgdGhpcy5yZWZzLnJpZ2h0LnN0eWxlLmhlaWdodCA9IHRoaXMucmVmcy5sZWZ0LnN0eWxlLmhlaWdodDtcbiAgICAgIHRoaXMucmVmcy5sZWZ0LnN0eWxlLndpZHRoID0gbGVmdCArICdweCc7XG4gICAgICB0aGlzLnJlZnMucmlnaHQuc3R5bGUubGVmdCA9IHJpZ2h0ICsgJ3B4JztcbiAgICAgIHRoaXMucmVmcy5ib3R0b20uc3R5bGUudG9wID0gYm90dG9tICsgJ3B4JztcblxuICAgICAgLy8gR2xvd1xuICAgICAgY29uc3QgYm9yZGVyUmFkaXVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZSgnYm9yZGVyLXJhZGl1cycpO1xuICAgICAgY29uc3QgZ2xvdyA9IHRoaXMucmVmcy5nbG93O1xuICAgICAgZ2xvdy5zdHlsZS50b3AgPSAodG9wKSArICdweCc7XG4gICAgICBnbG93LnN0eWxlLmxlZnQgPSAobGVmdCkgKyAncHgnO1xuICAgICAgZ2xvdy5zdHlsZS53aWR0aCA9ICh3aWR0aCkgKyAncHgnO1xuICAgICAgZ2xvdy5zdHlsZS5oZWlnaHQgPSAoaGVpZ2h0KSArICdweCc7XG4gICAgICBnbG93LnN0eWxlWydib3JkZXItcmFkaXVzJ10gPSBib3JkZXJSYWRpdXM7XG4gICAgICBnbG93LnN0eWxlWydib3gtc2hhZG93J10gPSAnMCAwICcgKyAyMCArICdweCAnICsgMTAgKyAncHggI2ZmZic7IC8vICBUT0RPOiB0aGlzIHN0eWxlIHNob3VsZCBwcm9iYWJseSBiZSBkeW5hbWljXG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBzaG93KCkge1xuICAgICAgICB0aGlzLnNldCh7IHNob3duOiB0cnVlIH0pO1xuICAgICAgfSxcbiAgICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuc2V0KHsgc2hvd246IGZhbHNlIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+Lm9uYm9hcmRpc3QtYnV0dG9uIHtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBib3JkZXI6IDFweCBzb2xpZCAjMDU3MWYzO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgY29sb3I6ICMwNTcxZjM7XG4gIGZvbnQtc2l6ZTogMC44ZW07XG4gIHBhZGRpbmc6IDAuNWVtIDFlbTtcbiAgbWFyZ2luOiAwLjVlbTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLm9uYm9hcmRpc3QtYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzYyQThGQztcbiAgYm9yZGVyLWNvbG9yOiAjNjJBOEZDO1xuICBjb2xvcjogd2hpdGU7XG4gIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggNXB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbn1cbi5vdmVybGF5IHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5vdmVybGF5LnNob3duIHtcbiAgZGlzcGxheTogYmxvY2s7XG59XG4udG9wLFxuLmxlZnQsXG4ucmlnaHQsXG4uYm90dG9tIHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICBiYWNrZ3JvdW5kOiAjMDAwO1xuICBvcGFjaXR5OiAwLjY2O1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG4gIHotaW5kZXg6IDEwMDA7XG59XG4udG9wIHtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICByaWdodDogMDtcbiAgd2lkdGg6IDEwMCU7XG59XG4ubGVmdCB7XG4gIGxlZnQ6IDA7XG59XG4ucmlnaHQge1xuICByaWdodDogMDtcbn1cbi5ib3R0b20ge1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICB3aWR0aDogMTAwJTtcbn1cbi5nbG93IHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiAxMDAwO1xufVxuPC9zdHlsZT5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFzRU8sa0JBQWtCLGVBQUMsQ0FBQyxBQUN6QixhQUFhLENBQUUsR0FBRyxDQUNsQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ3pCLGdCQUFnQixDQUFFLEtBQUssQ0FDdkIsS0FBSyxDQUFFLE9BQU8sQ0FDZCxTQUFTLENBQUUsS0FBSyxDQUNoQixPQUFPLENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FDbEIsTUFBTSxDQUFFLEtBQUssQ0FDYixjQUFjLENBQUUsU0FBUyxDQUN6QixPQUFPLENBQUUsSUFBSSxDQUNiLE1BQU0sQ0FBRSxPQUFPLEFBQ2pCLENBQUMsQUFDRCxpQ0FBa0IsTUFBTSxBQUFDLENBQUMsQUFDeEIsZ0JBQWdCLENBQUUsT0FBTyxDQUN6QixZQUFZLENBQUUsT0FBTyxDQUNyQixLQUFLLENBQUUsS0FBSyxDQUNaLFVBQVUsQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQUFDbEQsQ0FBQyxBQUNELFFBQVEsZUFBQyxDQUFDLEFBQ1IsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0QsUUFBUSxNQUFNLGVBQUMsQ0FBQyxBQUNkLE9BQU8sQ0FBRSxLQUFLLEFBQ2hCLENBQUMsQUFDRCxtQkFBSSxDQUNKLG9CQUFLLENBQ0wscUJBQU0sQ0FDTixPQUFPLGVBQUMsQ0FBQyxBQUNQLFFBQVEsQ0FBRSxLQUFLLENBQ2YsVUFBVSxDQUFFLElBQUksQ0FDaEIsT0FBTyxDQUFFLElBQUksQ0FDYixNQUFNLENBQUUsQ0FBQyxDQUNULE9BQU8sQ0FBRSxDQUFDLENBQ1YsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDLEFBQ0QsSUFBSSxlQUFDLENBQUMsQUFDSixHQUFHLENBQUUsQ0FBQyxDQUNOLElBQUksQ0FBRSxDQUFDLENBQ1AsS0FBSyxDQUFFLENBQUMsQ0FDUixLQUFLLENBQUUsSUFBSSxBQUNiLENBQUMsQUFDRCxLQUFLLGVBQUMsQ0FBQyxBQUNMLElBQUksQ0FBRSxDQUFDLEFBQ1QsQ0FBQyxBQUNELE1BQU0sZUFBQyxDQUFDLEFBQ04sS0FBSyxDQUFFLENBQUMsQUFDVixDQUFDLEFBQ0QsT0FBTyxlQUFDLENBQUMsQUFDUCxNQUFNLENBQUUsQ0FBQyxDQUNULElBQUksQ0FBRSxDQUFDLENBQ1AsS0FBSyxDQUFFLENBQUMsQ0FDUixLQUFLLENBQUUsSUFBSSxBQUNiLENBQUMsQUFDRCxLQUFLLGVBQUMsQ0FBQyxBQUNMLFFBQVEsQ0FBRSxLQUFLLENBQ2YsT0FBTyxDQUFFLElBQUksQUFDZixDQUFDIn0= */";
	append(document.head, style);
}

function create_main_fragment$2(component, ctx) {
	var div0, div0_class_value, text0, div1, div1_class_value, text1, div2, div2_class_value, text2, div3, div3_class_value, text3, div4, div4_class_value, current;

	function onwindowresize(event) {
		component.redraw();	}
	window.addEventListener("resize", onwindowresize);

	function onwindowscroll(event) {
		component.redraw();	}
	window.addEventListener("scroll", onwindowscroll);

	function onwindoworientationchange(event) {
		component.redraw();	}
	window.addEventListener("orientationchange", onwindoworientationchange);

	return {
		c: function create() {
			div0 = createElement("div");
			text0 = createText("\n");
			div1 = createElement("div");
			text1 = createText("\n");
			div2 = createElement("div");
			text2 = createText("\n");
			div3 = createElement("div");
			text3 = createText("\n");
			div4 = createElement("div");
			div0.className = div0_class_value = "top " + (ctx.shown ? 'shown' : '') + " svelte-101ppji";
			addLoc(div0, file$2, 1, 0, 106);
			div1.className = div1_class_value = "right " + (ctx.shown ? 'shown' : '') + " svelte-101ppji";
			addLoc(div1, file$2, 2, 0, 163);
			div2.className = div2_class_value = "bottom " + (ctx.shown ? 'shown' : '') + " svelte-101ppji";
			addLoc(div2, file$2, 3, 0, 224);
			div3.className = div3_class_value = "left " + (ctx.shown ? 'shown' : '') + " svelte-101ppji";
			addLoc(div3, file$2, 4, 0, 287);
			div4.className = div4_class_value = "glow " + (ctx.shown ? 'shown' : '') + " svelte-101ppji";
			addLoc(div4, file$2, 5, 0, 346);
		},

		m: function mount(target, anchor) {
			insert(target, div0, anchor);
			component.refs.top = div0;
			insert(target, text0, anchor);
			insert(target, div1, anchor);
			component.refs.right = div1;
			insert(target, text1, anchor);
			insert(target, div2, anchor);
			component.refs.bottom = div2;
			insert(target, text2, anchor);
			insert(target, div3, anchor);
			component.refs.left = div3;
			insert(target, text3, anchor);
			insert(target, div4, anchor);
			component.refs.glow = div4;
			current = true;
		},

		p: function update(changed, ctx) {
			if ((changed.shown) && div0_class_value !== (div0_class_value = "top " + (ctx.shown ? 'shown' : '') + " svelte-101ppji")) {
				div0.className = div0_class_value;
			}

			if ((changed.shown) && div1_class_value !== (div1_class_value = "right " + (ctx.shown ? 'shown' : '') + " svelte-101ppji")) {
				div1.className = div1_class_value;
			}

			if ((changed.shown) && div2_class_value !== (div2_class_value = "bottom " + (ctx.shown ? 'shown' : '') + " svelte-101ppji")) {
				div2.className = div2_class_value;
			}

			if ((changed.shown) && div3_class_value !== (div3_class_value = "left " + (ctx.shown ? 'shown' : '') + " svelte-101ppji")) {
				div3.className = div3_class_value;
			}

			if ((changed.shown) && div4_class_value !== (div4_class_value = "glow " + (ctx.shown ? 'shown' : '') + " svelte-101ppji")) {
				div4.className = div4_class_value;
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			window.removeEventListener("resize", onwindowresize);

			window.removeEventListener("scroll", onwindowscroll);

			window.removeEventListener("orientationchange", onwindoworientationchange);

			if (detach) {
				detachNode(div0);
			}

			if (component.refs.top === div0) { component.refs.top = null; }
			if (detach) {
				detachNode(text0);
				detachNode(div1);
			}

			if (component.refs.right === div1) { component.refs.right = null; }
			if (detach) {
				detachNode(text1);
				detachNode(div2);
			}

			if (component.refs.bottom === div2) { component.refs.bottom = null; }
			if (detach) {
				detachNode(text2);
				detachNode(div3);
			}

			if (component.refs.left === div3) { component.refs.left = null; }
			if (detach) {
				detachNode(text3);
				detachNode(div4);
			}

			if (component.refs.glow === div4) { component.refs.glow = null; }
		}
	};
}

function NineSlice(options) {
	var this$1 = this;

	this._debugName = '<NineSlice>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$2(), options.data);
	if (!('shown' in this._state)) { console.warn("<NineSlice> was created without expected data property 'shown'"); }
	this._intro = !!options.intro;

	this._handlers.state = [onstate$1];

	if (!document.getElementById("svelte-101ppji-style")) { add_css$2(); }

	onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$2(this, this._state);

	this.root._oncreate.push(function () {
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(NineSlice.prototype, protoDev);
assign(NineSlice.prototype, methods$1);

NineSlice.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/coachmark/Text.svelte generated by Svelte v2.16.1 */



function data$3() {
	return {
  id: null,
  text: '',
  target: null,
  textSize: 11,
};
}

var methods$2 = {
  position: function position() {
    var box = chooseRenderBox(this.get().target);

    this.refs.container.style.top = box.top + 'px';
    this.refs.container.style.left = box.left + 'px';
    this.refs.container.style.width = box.width + 'px';
    this.refs.container.style.height = box.height + 'px';

    var vmin = Math.min(document.body.offsetHeight, document.body.offsetWidth);
    // Quadratic function to fit vmin size to actual vmin so it looks nice
    var textSize = Math.max(6, -0.0000163847 * Math.pow( vmin, 2 ) + 0.0102378 * vmin + 7.47434);
    this.set({ textSize: textSize });
  }
};

function onstate$2(ref) {
  var this$1 = this;
  var changed = ref.changed;
  var current = ref.current;

  if (changed.target && isDom(current.target)) {
    raf_1(function () {
      this$1.position();
    });
  }
}
function chooseRenderBox(elm) {
  var ref = splitScreen();
  var box1 = ref[0];
  var box2 = ref[1];

  // See if the element is in box1 or box2;
  var elmMiddle = middleOfNode(elm);
  var flooredElmMiddle = { x: Math.floor(elmMiddle[0]), y: Math.floor(elmMiddle[1]) };

  if (rectContains(flooredElmMiddle, box1)) { return box2; }
  else { return box1; }
}

function splitScreen() {
  // const pixelRatio = window.devicePixelRatio || 1;
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  var box1;
  var box2;

  // Split vertically
  if (w > h) {
    var boxWidth = Math.floor(w / 2);
    box1 = {
      top: 0,
      left: 0,
      height: h,
      width: boxWidth,
    };
    box2 = {
      top: 0,
      left: boxWidth,
      height: h,
      width: w - boxWidth,
    };
  } else {
    var boxHeight = Math.floor(h / 2);
    box1 = {
      top: 0,
      left: 0,
      height: boxHeight,
      width: w,
    };
    box2 = {
      top: boxHeight,
      left: 0,
      height: h - boxHeight,
      width: w,
    };
  }

  return [box1, box2];
}

function elementRect(node, offsetParent) {
  if (offsetParent === true) { offsetParent = node.offsetParent; }

  var rect = node.getBoundingClientRect();
  var prect = offsetParent ?
    offsetParent.getBoundingClientRect() :
    { left: 0, top: 0 };

  return {
    left: rect.left - prect.left,
    top: rect.top - prect.top,
    width: rect.width,
    height: rect.height,
  };
}

function middleOfNode(node) {
  var rect = node;
  if (node instanceof Node) {
    rect = elementRect(node, false);
  }

  return [rect.left + (rect.width / 2), rect.top + (rect.height / 2)];
}

function rectContains(ref, ref$1) {
  var x = ref.x;
  var y = ref.y;
  var left = ref$1.left;
  var top = ref$1.top;
  var width = ref$1.width;
  var height = ref$1.height;

  return left <= x && x <= left + width &&
         top <= y && y <= top + height;
}

var file$3 = "src/components/coachmark/Text.svelte";

function add_css$3() {
	var style = createElement("style");
	style.id = 'svelte-rx5ich-style';
	style.textContent = ".text-container.svelte-rx5ich{position:fixed;display:flex;box-sizing:border-box;justify-content:center;align-items:center;padding:5vmin;z-index:1001}.text.svelte-rx5ich{font-family:'Short Stack', cursive;color:#fefefe;text-shadow:2px 2px #333;word-break:break-word;hyphens:auto}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dC5zdmVsdGUiLCJzb3VyY2VzIjpbIlRleHQuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzdmVsdGU6d2luZG93IG9uOnJlc2l6ZT1cInBvc2l0aW9uKClcIiBvbjpzY3JvbGw9XCJwb3NpdGlvbigpXCIgb246b3JpZW50YXRpb25jaGFuZ2U9XCJwb3NpdGlvbigpXCI+PC9zdmVsdGU6d2luZG93PlxuPGRpdiByZWY6Y29udGFpbmVyIGNsYXNzPVwidGV4dC1jb250YWluZXJcIiBpZD17aWR9PlxuICA8ZGl2IHJlZjp0ZXh0IGNsYXNzPVwidGV4dFwiIHN0eWxlPVwiZm9udC1zaXplOiB7dGV4dFNpemV9dm1pbjsgbGluZS1oZWlnaHQ6IHt0ZXh0U2l6ZX12bWluO1wiPnsgdGV4dCB9PC9kaXY+XG48L2Rpdj5cblxuPHN0eWxlPi5vbmJvYXJkaXN0LWJ1dHRvbiB7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm9yZGVyOiAxcHggc29saWQgIzA1NzFmMztcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGNvbG9yOiAjMDU3MWYzO1xuICBmb250LXNpemU6IDAuOGVtO1xuICBwYWRkaW5nOiAwLjVlbSAxZW07XG4gIG1hcmdpbjogMC41ZW07XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5vbmJvYXJkaXN0LWJ1dHRvbjpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6ICM2MkE4RkM7XG4gIGJvcmRlci1jb2xvcjogIzYyQThGQztcbiAgY29sb3I6IHdoaXRlO1xuICBib3gtc2hhZG93OiBpbnNldCAwcHggMHB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XG59XG4udGV4dC1jb250YWluZXIge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiA1dm1pbjtcbiAgei1pbmRleDogMTAwMTtcbn1cbi50ZXh0IHtcbiAgLyogZm9udC1zaXplOiAxMXZtaW47ICovXG4gIGZvbnQtZmFtaWx5OiAnU2hvcnQgU3RhY2snLCBjdXJzaXZlO1xuICAvKiBsaW5lLWhlaWdodDogMTF2bWluOyAvLyAxMXZtaW4gbG9va3MgYmV0dGVyIHNvbWV0aW1lcyAqL1xuICBjb2xvcjogI2ZlZmVmZTtcbiAgdGV4dC1zaGFkb3c6IDJweCAycHggIzMzMztcbiAgLyogei1pbmRleDogMjsgKi9cbiAgd29yZC1icmVhazogYnJlYWstd29yZDtcbiAgaHlwaGVuczogYXV0bztcbn1cbjwvc3R5bGU+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgaXNEb20gZnJvbSAnaXMtZG9tJztcbmltcG9ydCByYWYgZnJvbSAncmFmJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkYXRhOiAoKSA9PiAoe1xuICAgIGlkOiBudWxsLFxuICAgIHRleHQ6ICcnLFxuICAgIHRhcmdldDogbnVsbCxcbiAgICB0ZXh0U2l6ZTogMTEsXG4gIH0pLFxuICBvbnN0YXRlKHsgY2hhbmdlZCwgY3VycmVudCB9KSB7XG4gICAgaWYgKGNoYW5nZWQudGFyZ2V0ICYmIGlzRG9tKGN1cnJlbnQudGFyZ2V0KSkge1xuICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbigpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBtZXRob2RzOiB7XG4gICAgcG9zaXRpb24oKSB7XG4gICAgICBjb25zdCBib3ggPSBjaG9vc2VSZW5kZXJCb3godGhpcy5nZXQoKS50YXJnZXQpO1xuXG4gICAgICB0aGlzLnJlZnMuY29udGFpbmVyLnN0eWxlLnRvcCA9IGJveC50b3AgKyAncHgnO1xuICAgICAgdGhpcy5yZWZzLmNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gYm94LmxlZnQgKyAncHgnO1xuICAgICAgdGhpcy5yZWZzLmNvbnRhaW5lci5zdHlsZS53aWR0aCA9IGJveC53aWR0aCArICdweCc7XG4gICAgICB0aGlzLnJlZnMuY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGJveC5oZWlnaHQgKyAncHgnO1xuXG4gICAgICBjb25zdCB2bWluID0gTWF0aC5taW4oZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQsIGRvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGgpO1xuICAgICAgLy8gUXVhZHJhdGljIGZ1bmN0aW9uIHRvIGZpdCB2bWluIHNpemUgdG8gYWN0dWFsIHZtaW4gc28gaXQgbG9va3MgbmljZVxuICAgICAgY29uc3QgdGV4dFNpemUgPSBNYXRoLm1heCg2LCAtMC4wMDAwMTYzODQ3ICogdm1pbioqMiArIDAuMDEwMjM3OCAqIHZtaW4gKyA3LjQ3NDM0KTtcbiAgICAgIHRoaXMuc2V0KHsgdGV4dFNpemUgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNob29zZVJlbmRlckJveChlbG0pIHtcbiAgY29uc3QgW2JveDEsIGJveDJdID0gc3BsaXRTY3JlZW4oKTtcblxuICAvLyBTZWUgaWYgdGhlIGVsZW1lbnQgaXMgaW4gYm94MSBvciBib3gyO1xuICBjb25zdCBlbG1NaWRkbGUgPSBtaWRkbGVPZk5vZGUoZWxtKTtcbiAgY29uc3QgZmxvb3JlZEVsbU1pZGRsZSA9IHsgeDogTWF0aC5mbG9vcihlbG1NaWRkbGVbMF0pLCB5OiBNYXRoLmZsb29yKGVsbU1pZGRsZVsxXSkgfTtcblxuICBpZiAocmVjdENvbnRhaW5zKGZsb29yZWRFbG1NaWRkbGUsIGJveDEpKSByZXR1cm4gYm94MjtcbiAgZWxzZSByZXR1cm4gYm94MTtcbn1cblxuZnVuY3Rpb24gc3BsaXRTY3JlZW4oKSB7XG4gIC8vIGNvbnN0IHBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICBjb25zdCB3ID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKTtcbiAgY29uc3QgaCA9IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKTtcblxuICBsZXQgYm94MTtcbiAgbGV0IGJveDI7XG5cbiAgLy8gU3BsaXQgdmVydGljYWxseVxuICBpZiAodyA+IGgpIHtcbiAgICBjb25zdCBib3hXaWR0aCA9IE1hdGguZmxvb3IodyAvIDIpO1xuICAgIGJveDEgPSB7XG4gICAgICB0b3A6IDAsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgaGVpZ2h0OiBoLFxuICAgICAgd2lkdGg6IGJveFdpZHRoLFxuICAgIH07XG4gICAgYm94MiA9IHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IGJveFdpZHRoLFxuICAgICAgaGVpZ2h0OiBoLFxuICAgICAgd2lkdGg6IHcgLSBib3hXaWR0aCxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGJveEhlaWdodCA9IE1hdGguZmxvb3IoaCAvIDIpO1xuICAgIGJveDEgPSB7XG4gICAgICB0b3A6IDAsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgaGVpZ2h0OiBib3hIZWlnaHQsXG4gICAgICB3aWR0aDogdyxcbiAgICB9O1xuICAgIGJveDIgPSB7XG4gICAgICB0b3A6IGJveEhlaWdodCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICBoZWlnaHQ6IGggLSBib3hIZWlnaHQsXG4gICAgICB3aWR0aDogdyxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIFtib3gxLCBib3gyXTtcbn1cblxuZnVuY3Rpb24gZWxlbWVudFJlY3Qobm9kZSwgb2Zmc2V0UGFyZW50KSB7XG4gIGlmIChvZmZzZXRQYXJlbnQgPT09IHRydWUpIG9mZnNldFBhcmVudCA9IG5vZGUub2Zmc2V0UGFyZW50O1xuXG4gIGNvbnN0IHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBwcmVjdCA9IG9mZnNldFBhcmVudCA/XG4gICAgb2Zmc2V0UGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIDpcbiAgICB7IGxlZnQ6IDAsIHRvcDogMCB9O1xuXG4gIHJldHVybiB7XG4gICAgbGVmdDogcmVjdC5sZWZ0IC0gcHJlY3QubGVmdCxcbiAgICB0b3A6IHJlY3QudG9wIC0gcHJlY3QudG9wLFxuICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1pZGRsZU9mTm9kZShub2RlKSB7XG4gIGxldCByZWN0ID0gbm9kZTtcbiAgaWYgKG5vZGUgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgcmVjdCA9IGVsZW1lbnRSZWN0KG5vZGUsIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiBbcmVjdC5sZWZ0ICsgKHJlY3Qud2lkdGggLyAyKSwgcmVjdC50b3AgKyAocmVjdC5oZWlnaHQgLyAyKV07XG59XG5cbmZ1bmN0aW9uIHJlY3RDb250YWlucyh7IHgsIHkgfSwgeyBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQgfSkge1xuICByZXR1cm4gbGVmdCA8PSB4ICYmIHggPD0gbGVmdCArIHdpZHRoICYmXG4gICAgICAgICB0b3AgPD0geSAmJiB5IDw9IHRvcCArIGhlaWdodDtcbn1cbjwvc2NyaXB0PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVCQSxlQUFlLGNBQUMsQ0FBQyxBQUNmLFFBQVEsQ0FBRSxLQUFLLENBQ2YsT0FBTyxDQUFFLElBQUksQ0FDYixVQUFVLENBQUUsVUFBVSxDQUN0QixlQUFlLENBQUUsTUFBTSxDQUN2QixXQUFXLENBQUUsTUFBTSxDQUNuQixPQUFPLENBQUUsS0FBSyxDQUNkLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyxBQUNELEtBQUssY0FBQyxDQUFDLEFBRUwsV0FBVyxDQUFFLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FFbkMsS0FBSyxDQUFFLE9BQU8sQ0FDZCxXQUFXLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBRXpCLFVBQVUsQ0FBRSxVQUFVLENBQ3RCLE9BQU8sQ0FBRSxJQUFJLEFBQ2YsQ0FBQyJ9 */";
	append(document.head, style);
}

function create_main_fragment$3(component, ctx) {
	var div1, div0, text, current;

	function onwindowresize(event) {
		component.position();	}
	window.addEventListener("resize", onwindowresize);

	function onwindowscroll(event) {
		component.position();	}
	window.addEventListener("scroll", onwindowscroll);

	function onwindoworientationchange(event) {
		component.position();	}
	window.addEventListener("orientationchange", onwindoworientationchange);

	return {
		c: function create() {
			div1 = createElement("div");
			div0 = createElement("div");
			text = createText(ctx.text);
			div0.className = "text svelte-rx5ich";
			setStyle(div0, "font-size", "" + ctx.textSize + "vmin");
			setStyle(div0, "line-height", "" + ctx.textSize + "vmin");
			addLoc(div0, file$3, 2, 2, 165);
			div1.className = "text-container svelte-rx5ich";
			div1.id = ctx.id;
			addLoc(div1, file$3, 1, 0, 112);
		},

		m: function mount(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, text);
			component.refs.text = div0;
			component.refs.container = div1;
			current = true;
		},

		p: function update(changed, ctx) {
			if (changed.text) {
				setData(text, ctx.text);
			}

			if (changed.textSize) {
				setStyle(div0, "font-size", "" + ctx.textSize + "vmin");
				setStyle(div0, "line-height", "" + ctx.textSize + "vmin");
			}

			if (changed.id) {
				div1.id = ctx.id;
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			window.removeEventListener("resize", onwindowresize);

			window.removeEventListener("scroll", onwindowscroll);

			window.removeEventListener("orientationchange", onwindoworientationchange);

			if (detach) {
				detachNode(div1);
			}

			if (component.refs.text === div0) { component.refs.text = null; }
			if (component.refs.container === div1) { component.refs.container = null; }
		}
	};
}

function Text(options) {
	var this$1 = this;

	this._debugName = '<Text>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$3(), options.data);
	if (!('id' in this._state)) { console.warn("<Text> was created without expected data property 'id'"); }
	if (!('textSize' in this._state)) { console.warn("<Text> was created without expected data property 'textSize'"); }
	if (!('text' in this._state)) { console.warn("<Text> was created without expected data property 'text'"); }
	this._intro = !!options.intro;

	this._handlers.state = [onstate$2];

	if (!document.getElementById("svelte-rx5ich-style")) { add_css$3(); }

	onstate$2.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(function () {
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Text.prototype, protoDev);
assign(Text.prototype, methods$2);

Text.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var injected = false;

function injectSVG(svg) {
  if (injected) { return; }

  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  s.setAttribute('width', 0);
  s.setAttribute('height', 0);
  s.innerHTML = svg;
  document.body.insertBefore(s, document.body.firstChild);

  injected = true;

  return s;
}

var svg = "  <defs>\n    <filter id=\"coachmark-chalk\" x=\"0\" y=\"0\" height=\"5000px\" width=\"5000px\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\">\n      <feTurbulence baseFrequency=\"0.133\" seed=\"500\" result=\"result1\" numOctaves=\"1\" type=\"turbulence\"/>\n      <feOffset result=\"result2\" dx=\"0\" dy=\"0\"/>\n      <feDisplacementMap scale=\"5\" yChannelSelector=\"G\" in2=\"result1\" xChannelSelector=\"R\" in=\"SourceGraphic\"/>\n      <feGaussianBlur stdDeviation=\"0.5\"/>\n    </filter>\n    <filter id=\"coachmark-chalk-rough\" filterUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" height=\"5000px\" width=\"5000px\">\n      <feTurbulence baseFrequency=\"0.2\" numOctaves=\"3\" type=\"fractalNoise\" />\n      <feDisplacementMap  scale=\"8\"  xChannelSelector=\"R\" in=\"SourceGraphic\" />\n    </filter>\n    <marker id=\"arrow\" class=\"coachmark-line\" markerWidth=\"500\" markerHeight=\"800\" refX=\"9.5\" refY=\"4.5\" orient=\"auto\" overflow=\"visible\" markerUnits=\"userSpaceOnUse\">\n      <!--<path d=\"M0,0 L0,6 L9,3 z\" stroke=\"#fff\" fill=\"#fff\" />-->\n      <!--<polyline points=\"-2,-2 0,0 -2,2\" stroke=\"#fff\" fill=\"none\" vector-effect=\"non-scaling-stroke\" />-->\n\n      <!-- <polyline points=\"1 1, 9 5, 1 7\" fill=\"none\" /> -->\n      <polyline points=\"1 1.5, 10 4.5, 2 7\" fill=\"none\" stroke-linecap=\"round\" />\n    </marker>\n\n    <marker id=\"arrowhead0\" viewBox=\"0 0 60 60\" refX=\"50\" refY=\"30\" markerUnits=\"strokeWidth\" markerWidth=\"8\" markerHeight=\"10\" orient=\"auto\" overflow=\"visible\">\n      <path d=\"M 0 0 L 60 30 L 0 60\" fill=\"none\" class=\"coachmark-marker\" />\n    </marker>\n\n    <!-- NOTE: arrowhead is not being used -->\n    <!-- <marker id=\"arrowhead\" viewBox=\"0 0 10 10\" refX=\"3\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\">\n      <path d=\"M 0 0 L 10 5 L 0 10 z\" />\n    </marker> -->\n\n    <filter id=\"coachmark-drop-shadow\" x=\"0\" y=\"0\" height=\"5000px\" width=\"5000px\">\n       <feOffset result=\"offOut\" in=\"SourceAlpha\" dx=\"0\" dy=\"5\" />\n       <feGaussianBlur result=\"blurOut\" in=\"offOut\" stdDeviation=\"3\" />\n       <feBlend in=\"SourceGraphic\" in2=\"blurOut\" mode=\"normal\" />\n    </filter>\n\n    <filter id=\"test-filter\">\n      <feMorphology operator=\"dilate\" radius=\"4\" in=\"SourceAlpha\" result=\"BEVEL_10\" />\n      <feConvolveMatrix order=\"3,3\" kernelMatrix=\n   \"1 0 0\n   0 1 0\n   0 0 1\" in=\"BEVEL_10\" result=\"BEVEL_20\" />\n      <feOffset dx=\"10\" dy=\"10\" in=\"BEVEL_20\" result=\"BEVEL_30\"/>\n      <feComposite operator=\"out\" in=\"BEVEL_20\" in2=\"BEVEL_10\" result=\"BEVEL_30\"/>\n      <feFlood flood-color=\"#fff\" result=\"COLOR-red\" />\n      <feComposite in=\"COLOR-red\" in2=\"BEVEL_30\" operator=\"in\" result=\"BEVEL_40\" />\n\n      <feMerge result=\"BEVEL_50\">\n         <feMergeNode in=\"BEVEL_40\" />\n         <feMergeNode in=\"SourceGraphic\" />\n      </feMerge>\n    </filter>\n\n    <path id=\"right-arrow\" d=\"M 345.23509 500.5 L 594.16634 251.00371 L 344.26968 1.468574 L 205.81581 1.525764 L 397.12537 194.51019 L 0.49999607 194.58168 L 0.62293607 305.57099 L 399.73581 305.59147 L 206.36939 500.5 L 345.23509 500.5 z \"/>\n\n    <filter id=\"multi-stroke\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\" filterUnits=\"objectBoundingBox\" primitiveUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\">\n      <feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.03\" numOctaves=\"1\" seed=\"8\" stitchTiles=\"noStitch\" x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\" result=\"turbulence3\"/>\n      <feDisplacementMap in=\"SourceGraphic\" in2=\"turbulence3\" scale=\"015\" xChannelSelector=\"A\" yChannelSelector=\"A\" result=\"displacementMap\"/>\n      <feDisplacementMap in=\"SourceGraphic\" in2=\"turbulence3\" scale=\"-15\" xChannelSelector=\"A\" yChannelSelector=\"A\" x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\" result=\"displacementMap1\"/>\n      <feMerge x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\" result=\"merge\">\n            <feMergeNode in=\"displacementMap\"/>\n        <feMergeNode in=\"displacementMap1\"/>\n        <feMergeNode in=\"SourceGraphic\"/>\n        </feMerge>\n    </filter>\n  </defs>\n";

// Singleton registry
var _listeners = {};

function on$1(event, fn) {
  _listeners[event] = _listeners[event] || [];
  var subs = _listeners[event];
  subs.push(fn);

  return function () {
    var index = subs.indexOf(fn);
    if (index !== -1) { subs.splice(index, 1); }

    if (subs.length === 0) { delete _listeners[event]; }
  };
}

function fire$1(event) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  if (event in _listeners) {
    for (var i = 0, list = _listeners[event]; i < list.length; i += 1) {
      var fn = list[i];

      fn.apply(void 0, args);
    }
  }
}

function reset() {
  for (var i = 0, list = Object.keys(_listeners); i < list.length; i += 1) {
    var key = list[i];

    delete _listeners[key];
  }
}

var PubSub = {
  on: on$1,
  fire: fire$1,
  reset: reset,
};

function uniquestring() {
  return Math.random().toString(36).substr(2);
}

function close() {
  this.destroy();
}

function attachEl() {
  var this$1 = this;

  var createPopper = function (attachEl) {
    if (!this$1.refs || !this$1.refs.el) { return; }
    this$1.popper = new Popper(attachEl, this$1.refs.el, Object.assign({}, this$1.options));
    this$1.on('destroy', function () {
      this$1.popper.destroy();
    });
  };

  var ref = this.options;
  var attach = ref.attach;
  var comp = Registry.component(attach);
  if (comp && comp.instance) { attach = comp.instance.refs.el; }

  // TODO: handle `attach` that is a component in the registry
  // If the `attach` option is an element, use it right away. Otherwise wait (2.5s by default) for the attach element
  //   to exist.
  if (isDom(attach)) {
    this.set({ attach: attach });
    createPopper(attach);
  } else {
    waitForTheElement.waitForTheElement(attach)
      .then(function (attachEl) {
        this$1.set({ attach: attachEl });
        createPopper(attachEl);
      });
  }
}

function generateEventHandler(handler, mappedComponent) {
  if (typeof (handler) === 'function') { return handler; }

  var ref = handler.split(/\./);
  var pair1 = ref[0]; if ( pair1 === void 0 ) pair1 = '';
  var pair2 = ref[1]; if ( pair2 === void 0 ) pair2 = '';
  var comp = Registry.component(pair1);
  var tour = Registry.tour(pair1);

  if (comp) {
    var component = comp.component;
    var args = comp.args;

    // Do something with a component
    if (!pair2 || pair2 === 'show') {
      handler = function () {
        // Show if not already instanced
        if (Registry.component(args.name).instance) { return; }
        new component(args); /* eslint-disable-line no-new */
      };
    } else if (pair2 === 'hide') {
      handler = function () {
        if (comp.instance) { comp.instance.close(); }
      };
    }
  } else if (tour) ; else if (handler === 'close') {
    handler = function () {
      if (mappedComponent.instance) { mappedComponent.instance.close(); }
    };
  } else if (handler === 'next') {
    handler = function () { return Registry.activeTour().next(); }; // TODO: this will throw if there's no activeTour, add a guard?
  } else if (handler === 'show') {
    // TODO: this one will need to work when generating handlers for components that don't exist in the DOM yet
    handler = function () {
      if (mappedComponent) {
        var component = mappedComponent.component;
        var args = mappedComponent.args;
        if (Registry.component(args.name).instance) { return; }
        if (component) { new component(args); } /* eslint-disable-line no-new */
      }
    };
  } else {
    throw new Error(("Unknown event handler " + handler));
  }

  return handler;
}

function registerForEvents(eventArg, mappedComponent) {
  var this$1 = this;
  if ( eventArg === void 0 ) eventArg = {};

  for (var i$1 = 0, list$1 = Object.entries(eventArg); i$1 < list$1.length; i$1 += 1) {
    var loop = function () {
      var event = list[i];

      event = event.trim();

      var h = generateEventHandler.call(this$1, handler, mappedComponent);

      // Event key is a DOM event
      if (['click', 'mouseover', 'mouseout', 'contextmenu', 'dblclick'].includes(event)) {
        // This is not an instanced component, so no interactive events can be attached yet
        if (!this$1 || !this$1.refs) { return {}; }
        this$1.refs.el.addEventListener(event, h);
        this$1.on('destroy', function () { return this$1.refs.el.removeEventListener(event, h); });
      } else {
        // Treat event as an Onboardist event
        var dereg = PubSub.on(event, h);
        if (this$1) { this$1.on('destroy', dereg); }
      }
    };

    var ref = list$1[i$1];
    var events = ref[0];
    var handler = ref[1];

    for (var i = 0, list = [].concat(events); i < list.length; i += 1) {
      var returned = loop();

      if ( returned ) return returned.v;
    }
  }
}

function oncreate$1() {
  // Set name to a random string if not already set
  if (!this.get().name) { this.set({ name: uniquestring() }); }

  // Attach element to a DOM element if necessary
  if (this.options.attach) { attachEl.call(this); }

  var ref = this.get();
  var name = ref.name;
  var args = Object.assign({}, this.options);
  delete args.data;

  if (!Registry.component(name)) {
    var mappedComponent = {
      component: args.component,
      name: name,
      args: args,
      instance: this,
    };
    Registry.registerComponent(mappedComponent);
    if (this.options.events) { registerForEvents.call(this, this.options.events, mappedComponent); }
  }

  // Register instance globally
  Registry.registerInstance({ name: this.get().name, instance: this });
}

function ondestroy$1() {
  Registry.deregisterInstance(this.get().name);
}

function expandButtonArgs(buttons) {
  if (!buttons) { return buttons; }

  return buttons.map(function (button) {
    if (typeof (button) !== 'string') { return button; }

    switch (button.toLowerCase()) {
      // TODO: remove this? next button should only be added by Tours, I think
      // case ('next'):
      //   return { text: 'Next', handler() { Onboardist.UI.next(); } };
      case ('ok'):
        return {
          type: 'close',
          text: 'OK',
          handler: function handler() {
            this.close();
          },
        };
      default:
        return button;
    }
  });
}

/* src/components/Coachmark.svelte generated by Svelte v2.16.1 */



function data$4() {
	return {
  buttons: ['ok'],
  target: null,
  textElement: null,
  textId: uniquestring(),
};
}

var methods$3 = {
  call: function call(fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    fn.call.apply(fn, [ this ].concat( args ));
  },
  close: close,
  keypress: function keypress(event) {
    if (event.key === 'Escape') { this.close(); }
  },
};

function oncreate_1() {
  injectSVG(svg);

  return oncreate$1.call(this);
}
function onstate$3(ref) {
  var changed = ref.changed;
  var current = ref.current;
  var previous = ref.previous;

  if (!previous && this.get().buttons) { this.set({ buttons: expandButtonArgs(this.get().buttons) }); }

  if (current.attach) { this.set({ target: current.attach }); }
  if (this.refs && this.refs.text) { this.set({ textElement: this.refs.text.refs.text }); }
}
var file$4 = "src/components/Coachmark.svelte";

function get_each_context(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.button = list[i];
	return child_ctx;
}

function create_main_fragment$4(component, ctx) {
	var text0, div, current_block_type_index, if_block, text1, text3, div_aria_label_value, current;

	function onwindowkeydown(event) {
		component.keypress(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	var nineslice_initial_data = { target: ctx.target };
	var nineslice = new NineSlice({
		root: component.root,
		store: component.store,
		data: nineslice_initial_data
	});

	var if_block_creators = [
		create_if_block$1,
		create_else_block$1
	];

	var if_blocks = [];

	function select_block_type(ctx) {
		if (ctx.buttons) { return 0; }
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);

	var text2_initial_data = {
	 	id: ctx.textId,
	 	text: ctx.content,
	 	target: ctx.target
	 };
	var text2 = new Text({
		root: component.root,
		store: component.store,
		data: text2_initial_data
	});

	component.refs.text = text2;

	var arrow_initial_data = { from: ctx.textElement, to: ctx.target };
	var arrow = new Arrow({
		root: component.root,
		store: component.store,
		data: arrow_initial_data
	});

	return {
		c: function create() {
			nineslice._fragment.c();
			text0 = createText("\n");
			div = createElement("div");
			if_block.c();
			text1 = createText("\n  ");
			text2._fragment.c();
			text3 = createText("\n  ");
			arrow._fragment.c();
			div.className = "onboardist-coachmark";
			setAttribute(div, "role", "alertdialog");
			setAttribute(div, "aria-modal", "true");
			setAttribute(div, "aria-label", div_aria_label_value = ctx.title || ctx.content);
			setAttribute(div, "aria-describedby", ctx.textId);
			addLoc(div, file$4, 2, 0, 79);
		},

		m: function mount(target, anchor) {
			nineslice._mount(target, anchor);
			insert(target, text0, anchor);
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			append(div, text1);
			text2._mount(div, null);
			append(div, text3);
			arrow._mount(div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var nineslice_changes = {};
			if (changed.target) { nineslice_changes.target = ctx.target; }
			nineslice._set(nineslice_changes);

			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				if_block.o(function() {
					if_blocks[previous_block_index].d(1);
					if_blocks[previous_block_index] = null;
				});

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](component, ctx);
					if_block.c();
				}
				if_block.m(div, text1);
			}

			var text2_changes = {};
			if (changed.textId) { text2_changes.id = ctx.textId; }
			if (changed.content) { text2_changes.text = ctx.content; }
			if (changed.target) { text2_changes.target = ctx.target; }
			text2._set(text2_changes);

			var arrow_changes = {};
			if (changed.textElement) { arrow_changes.from = ctx.textElement; }
			if (changed.target) { arrow_changes.to = ctx.target; }
			arrow._set(arrow_changes);

			if ((!current || changed.title || changed.content) && div_aria_label_value !== (div_aria_label_value = ctx.title || ctx.content)) {
				setAttribute(div, "aria-label", div_aria_label_value);
			}

			if (!current || changed.textId) {
				setAttribute(div, "aria-describedby", ctx.textId);
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			outrocallback = callAfter(outrocallback, 4);

			if (nineslice) { nineslice._fragment.o(outrocallback); }

			if (if_block) { if_block.o(outrocallback); }
			else { outrocallback(); }

			if (text2) { text2._fragment.o(outrocallback); }
			if (arrow) { arrow._fragment.o(outrocallback); }
			current = false;
		},

		d: function destroy$$1(detach) {
			window.removeEventListener("keydown", onwindowkeydown);

			nineslice.destroy(detach);
			if (detach) {
				detachNode(text0);
				detachNode(div);
			}

			if_blocks[current_block_type_index].d();
			text2.destroy();
			if (component.refs.text === text2) { component.refs.text = null; }
			arrow.destroy();
		}
	};
}

// (15:2) {:else}
function create_else_block$1(component, ctx) {
	var text, current;

	return {
		c: function create() {
			text = createText(" ");
		},

		m: function mount(target, anchor) {
			insert(target, text, anchor);
			current = true;
		},

		p: noop,

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

// (9:2) {#if buttons}
function create_if_block$1(component, ctx) {
	var each_anchor, current;

	var each_value = ctx.buttons;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	}

	function outroBlock(i, detach, fn) {
		if (each_blocks[i]) {
			each_blocks[i].o(function () {
				if (detach) {
					each_blocks[i].d(detach);
					each_blocks[i] = null;
				}
				if (fn) { fn(); }
			});
		}
	}

	return {
		c: function create() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function mount(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].i(target, anchor);
			}

			insert(target, each_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (changed.buttons) {
				each_value = ctx.buttons;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(component, child_ctx);
						each_blocks[i].c();
					}
					each_blocks[i].i(each_anchor.parentNode, each_anchor);
				}
				for (; i < each_blocks.length; i += 1) { outroBlock(i, 1); }
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			each_blocks = each_blocks.filter(Boolean);
			var countdown = callAfter(outrocallback, each_blocks.length);
			for (var i = 0; i < each_blocks.length; i += 1) { outroBlock(i, 0, countdown); }

			current = false;
		},

		d: function destroy$$1(detach) {
			destroyEach(each_blocks, detach);

			if (detach) {
				detachNode(each_anchor);
			}
		}
	};
}

// (11:6) {#if typeof(button) === 'object'}
function create_if_block_1(component, ctx) {
	var current;

	var actionbutton_initial_data = { type: ctx.button.type };
	var actionbutton = new ActionButton({
		root: component.root,
		store: component.store,
		data: actionbutton_initial_data
	});

	actionbutton.on("click", function(event) {
		component.call(ctx.button.handler);
	});

	return {
		c: function create() {
			actionbutton._fragment.c();
		},

		m: function mount(target, anchor) {
			actionbutton._mount(target, anchor);
			current = true;
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var actionbutton_changes = {};
			if (changed.buttons) { actionbutton_changes.type = ctx.button.type; }
			actionbutton._set(actionbutton_changes);
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (actionbutton) { actionbutton._fragment.o(outrocallback); }
			current = false;
		},

		d: function destroy$$1(detach) {
			actionbutton.destroy(detach);
		}
	};
}

// (10:4) {#each buttons as button}
function create_each_block(component, ctx) {
	var if_block_anchor, current;

	var if_block = (typeof(ctx.button) === 'object') && create_if_block_1(component, ctx);

	return {
		c: function create() {
			if (if_block) { if_block.c(); }
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if (if_block) { if_block.m(target, anchor); }
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (typeof(ctx.button) === 'object') {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_1(component, ctx);
					if (if_block) { if_block.c(); }
				}

				if_block.i(if_block_anchor.parentNode, if_block_anchor);
			} else if (if_block) {
				if_block.o(function() {
					if_block.d(1);
					if_block = null;
				});
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (if_block) { if_block.o(outrocallback); }
			else { outrocallback(); }

			current = false;
		},

		d: function destroy$$1(detach) {
			if (if_block) { if_block.d(detach); }
			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

function Coachmark(options) {
	var this$1 = this;

	this._debugName = '<Coachmark>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$4(), options.data);
	if (!('target' in this._state)) { console.warn("<Coachmark> was created without expected data property 'target'"); }
	if (!('title' in this._state)) { console.warn("<Coachmark> was created without expected data property 'title'"); }
	if (!('content' in this._state)) { console.warn("<Coachmark> was created without expected data property 'content'"); }
	if (!('textId' in this._state)) { console.warn("<Coachmark> was created without expected data property 'textId'"); }
	if (!('buttons' in this._state)) { console.warn("<Coachmark> was created without expected data property 'buttons'"); }
	if (!('textElement' in this._state)) { console.warn("<Coachmark> was created without expected data property 'textElement'"); }
	this._intro = !!options.intro;

	this._handlers.state = [onstate$3];

	this._handlers.destroy = [ondestroy$1];

	onstate$3.call(this, { changed: assignTrue({}, this._state), current: this._state });

	this._fragment = create_main_fragment$4(this, this._state);

	this.root._oncreate.push(function () {
		oncreate_1.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Coachmark.prototype, protoDev);
assign(Coachmark.prototype, methods$3);

Coachmark.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var config = {
  colors: {
    active: '#62A8FC',
    lightText: '#fff',
  },
};

/* src/components/Backdrop.svelte generated by Svelte v2.16.1 */

function data$5() {
	return {
  backdrop: false,
};
}

function oncreate$2() {
  // Singleton
  if (!document.querySelector('.onboardist-backdrop')) {
    this.set({ backdrop: true });
  } else {
    this.destroy();
  }
}
var file$5 = "src/components/Backdrop.svelte";

function add_css$4() {
	var style = createElement("style");
	style.id = 'svelte-a48jt5-style';
	style.textContent = ".onboardist-backdrop.svelte-a48jt5{background-color:rgba(0, 0, 0, 0.5);z-index:998;position:fixed;left:0;right:0;bottom:0;top:0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFja2Ryb3Auc3ZlbHRlIiwic291cmNlcyI6WyJCYWNrZHJvcC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPGRpdj5cbiAgeyNpZiBiYWNrZHJvcH1cbiAgICA8ZGl2IGNsYXNzPVwib25ib2FyZGlzdC1iYWNrZHJvcFwiPjwvZGl2PlxuICB7L2lmfVxuPC9kaXY+XG5cbjxzY3JpcHQ+XG5leHBvcnQgZGVmYXVsdCB7XG4gIGRhdGE6ICgpID0+ICh7XG4gICAgYmFja2Ryb3A6IGZhbHNlLFxuICB9KSxcbiAgb25jcmVhdGUoKSB7XG4gICAgLy8gU2luZ2xldG9uXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcub25ib2FyZGlzdC1iYWNrZHJvcCcpKSB7XG4gICAgICB0aGlzLnNldCh7IGJhY2tkcm9wOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG4gIH0sXG59XG48L3NjcmlwdD5cblxuPHN0eWxlPi5vbmJvYXJkaXN0LWJ1dHRvbiB7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm9yZGVyOiAxcHggc29saWQgIzA1NzFmMztcbiAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gIGNvbG9yOiAjMDU3MWYzO1xuICBmb250LXNpemU6IDAuOGVtO1xuICBwYWRkaW5nOiAwLjVlbSAxZW07XG4gIG1hcmdpbjogMC41ZW07XG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5vbmJvYXJkaXN0LWJ1dHRvbjpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6ICM2MkE4RkM7XG4gIGJvcmRlci1jb2xvcjogIzYyQThGQztcbiAgY29sb3I6IHdoaXRlO1xuICBib3gtc2hhZG93OiBpbnNldCAwcHggMHB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMik7XG59XG4ub25ib2FyZGlzdC1iYWNrZHJvcCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC41KTtcbiAgei1pbmRleDogOTk4O1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIHRvcDogMDtcbn1cbjwvc3R5bGU+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXdDQSxvQkFBb0IsY0FBQyxDQUFDLEFBQ3BCLGdCQUFnQixDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ3BDLE9BQU8sQ0FBRSxHQUFHLENBQ1osUUFBUSxDQUFFLEtBQUssQ0FDZixJQUFJLENBQUUsQ0FBQyxDQUNQLEtBQUssQ0FBRSxDQUFDLENBQ1IsTUFBTSxDQUFFLENBQUMsQ0FDVCxHQUFHLENBQUUsQ0FBQyxBQUNSLENBQUMifQ== */";
	append(document.head, style);
}

function create_main_fragment$5(component, ctx) {
	var div, current;

	var if_block = (ctx.backdrop) && create_if_block$2(component, ctx);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			addLoc(div, file$5, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
			if (if_block) { if_block.m(div, null); }
			current = true;
		},

		p: function update(changed, ctx) {
			if (ctx.backdrop) {
				if (!if_block) {
					if_block = create_if_block$2(component, ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}

			if (if_block) { if_block.d(); }
		}
	};
}

// (2:2) {#if backdrop}
function create_if_block$2(component, ctx) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			div.className = "onboardist-backdrop svelte-a48jt5";
			addLoc(div, file$5, 2, 4, 27);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Backdrop(options) {
	var this$1 = this;

	this._debugName = '<Backdrop>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this._state = assign(data$5(), options.data);
	if (!('backdrop' in this._state)) { console.warn("<Backdrop> was created without expected data property 'backdrop'"); }
	this._intro = !!options.intro;

	if (!document.getElementById("svelte-a48jt5-style")) { add_css$4(); }

	this._fragment = create_main_fragment$5(this, this._state);

	this.root._oncreate.push(function () {
		oncreate$2.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Backdrop.prototype, protoDev);

Backdrop.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/Hotspot.svelte generated by Svelte v2.16.1 */



function data$6() {
	return {
  backdrop: false,
  color: config.colors.active,
  style: 'pulse',
  size: 20,
};
}

function oncreate_1$1() {
  // NOTE: this was an attempt to make the popper overlap the element slightly. Turns out just making it
  //   0w x 0h is easier
  // this.options = {
  //   ...this.options,
  //   modifiers: {
  //     offset: {
  //       enabled: true,
  //       offset: `-50%p,-50%p`, // -${this.get().size / 2}px
  //     },
  //     flip: {
  //       enabled: false,
  //     }
  //   },
  // };

  return oncreate$1.call(this);
}
var file$6 = "src/components/Hotspot.svelte";

function add_css$5() {
	var style = createElement("style");
	style.id = 'svelte-9a2dtp-style';
	style.textContent = ".onboardist-button.svelte-9a2dtp{border-radius:8px;border:1px solid #0571f3;background-color:white;color:#0571f3;font-size:0.8em;padding:0.5em 1em;margin:0.5em;text-transform:uppercase;outline:none;cursor:pointer}.onboardist-button.svelte-9a2dtp:hover{background-color:#62A8FC;border-color:#62A8FC;color:white;box-shadow:inset 0px 0px 5px rgba(0, 0, 0, 0.2)}.svelte-ref-el.svelte-9a2dtp{z-index:999}.hotspot.svelte-9a2dtp{position:absolute;z-index:999;cursor:pointer}.hotspot.svelte-9a2dtp .dot.svelte-9a2dtp{position:absolute;z-index:999;top:50%;left:50%;border-radius:50%;background-color:#62A8FC}.hotspot.pulse.svelte-9a2dtp .dot.svelte-9a2dtp{border:2px solid #499afc}.hotspot.pulse.svelte-9a2dtp .pulse.svelte-9a2dtp{border-radius:50%;position:absolute;z-index:999;top:50%;left:50%;border:2px solid #62A8FC;animation:svelte-9a2dtp-pulsate 2s ease-out;animation-iteration-count:infinite}@keyframes svelte-9a2dtp-pulsate{0%{transform:scale(1, 1);opacity:0.9}100%{transform:scale(2.5, 2.5);opacity:0}}.hotspot.teardrop.svelte-9a2dtp .dot.svelte-9a2dtp{border-top-left-radius:0}[x-placement^=\"top\"] .hotspot.teardrop.svelte-9a2dtp .dot.svelte-9a2dtp{transform:rotate(225deg)}[x-placement^=\"right\"] .hotspot.teardrop.svelte-9a2dtp .dot.svelte-9a2dtp{transform:rotate(315deg)}[x-placement^=\"bottom\"] .hotspot.teardrop.svelte-9a2dtp .dot.svelte-9a2dtp{transform:rotate(45deg)}[x-placement^=\"top\"] .hotspot.teardrop.svelte-9a2dtp .dot.svelte-9a2dtp{transform:rotate(315deg)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG90c3BvdC5zdmVsdGUiLCJzb3VyY2VzIjpbIkhvdHNwb3Quc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxkaXYgcmVmOmVsPlxuICA8ZGl2IGNsYXNzPVwiaG90c3BvdCB7IHN0eWxlIH1cIj5cbiAgICA8ZGl2IGNsYXNzPVwiZG90XCIgc3R5bGU9XCJ3aWR0aDogeyBzaXplIH1weDsgaGVpZ2h0OiB7IHNpemUgfXB4OyBtYXJnaW46IC17IHNpemUgLyAyIH1weFwiPjwvZGl2PlxuXG4gICAgeyNpZiBzdHlsZSA9PSAncHVsc2UnfVxuICAgICAgPGRpdiBjbGFzcz1cInB1bHNlXCIgc3R5bGU9XCJ3aWR0aDogeyBzaXplIH1weDsgaGVpZ2h0OiB7IHNpemUgfXB4OyBtYXJnaW46IC17IHNpemUgLyAyIH1weFwiPjwvZGl2PlxuICAgIHsvaWZ9XG4gICAgeyNpZiBzdHlsZSA9PSAndGVhcmRyb3AnfVxuICAgICAgPGRpdiBjbGFzcz1cImhvdHNwb3QtYXJyb3dcIj48L2Rpdj5cbiAgICB7L2lmfVxuICA8L2Rpdj5cbjwvZGl2PlxueyNpZiBiYWNrZHJvcH08QmFja2Ryb3A+PC9CYWNrZHJvcD57L2lmfVxuXG48c2NyaXB0PlxuaW1wb3J0IENvbmZpZyBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IEJhY2tkcm9wIGZyb20gJy4vQmFja2Ryb3Auc3ZlbHRlJztcbmltcG9ydCB7IG9uY3JlYXRlLCBvbmRlc3Ryb3kgfSBmcm9tICcuLi9tZXRob2RzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBvbmNyZWF0ZSgpIHtcbiAgICAvLyBOT1RFOiB0aGlzIHdhcyBhbiBhdHRlbXB0IHRvIG1ha2UgdGhlIHBvcHBlciBvdmVybGFwIHRoZSBlbGVtZW50IHNsaWdodGx5LiBUdXJucyBvdXQganVzdCBtYWtpbmcgaXRcbiAgICAvLyAgIDB3IHggMGggaXMgZWFzaWVyXG4gICAgLy8gdGhpcy5vcHRpb25zID0ge1xuICAgIC8vICAgLi4udGhpcy5vcHRpb25zLFxuICAgIC8vICAgbW9kaWZpZXJzOiB7XG4gICAgLy8gICAgIG9mZnNldDoge1xuICAgIC8vICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgLy8gICAgICAgb2Zmc2V0OiBgLTUwJXAsLTUwJXBgLCAvLyAtJHt0aGlzLmdldCgpLnNpemUgLyAyfXB4XG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIGZsaXA6IHtcbiAgICAvLyAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSxcbiAgICAvLyB9O1xuXG4gICAgcmV0dXJuIG9uY3JlYXRlLmNhbGwodGhpcyk7XG4gIH0sXG4gIG9uZGVzdHJveSxcbiAgY29tcG9uZW50czogeyBCYWNrZHJvcCB9LFxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGJhY2tkcm9wOiBmYWxzZSxcbiAgICBjb2xvcjogQ29uZmlnLmNvbG9ycy5hY3RpdmUsXG4gICAgc3R5bGU6ICdwdWxzZScsXG4gICAgc2l6ZTogMjAsXG4gIH0pLFxufTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+Lm9uYm9hcmRpc3QtYnV0dG9uIHtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBib3JkZXI6IDFweCBzb2xpZCAjMDU3MWYzO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgY29sb3I6ICMwNTcxZjM7XG4gIGZvbnQtc2l6ZTogMC44ZW07XG4gIHBhZGRpbmc6IDAuNWVtIDFlbTtcbiAgbWFyZ2luOiAwLjVlbTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLm9uYm9hcmRpc3QtYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzYyQThGQztcbiAgYm9yZGVyLWNvbG9yOiAjNjJBOEZDO1xuICBjb2xvcjogd2hpdGU7XG4gIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggNXB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcbn1cbi8qIEBjb2xvcjogIzYyQThGQzsgKi9cbnJlZjplbCB7XG4gIHotaW5kZXg6IDk5OTtcbn1cbi5ob3RzcG90IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiA5OTk7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5ob3RzcG90IC5kb3Qge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDk5OTtcbiAgdG9wOiA1MCU7XG4gIGxlZnQ6IDUwJTtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDO1xufVxuLmhvdHNwb3QucHVsc2UgLmRvdCB7XG4gIGJvcmRlcjogMnB4IHNvbGlkICM0OTlhZmM7XG59XG4uaG90c3BvdC5wdWxzZSAucHVsc2Uge1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogOTk5O1xuICB0b3A6IDUwJTtcbiAgbGVmdDogNTAlO1xuICBib3JkZXI6IDJweCBzb2xpZCAjNjJBOEZDO1xuICBhbmltYXRpb246IHB1bHNhdGUgMnMgZWFzZS1vdXQ7XG4gIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlO1xufVxuQGtleWZyYW1lcyBwdWxzYXRlIHtcbiAgMCUge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMSwgMSk7XG4gICAgb3BhY2l0eTogMC45O1xuICB9XG4gIDEwMCUge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMi41LCAyLjUpO1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbn1cbi5ob3RzcG90LnRlYXJkcm9wIC5kb3Qge1xuICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAwO1xufVxuOmdsb2JhbChbeC1wbGFjZW1lbnRePVwidG9wXCJdKSAuaG90c3BvdC50ZWFyZHJvcCAuZG90IHtcbiAgdHJhbnNmb3JtOiByb3RhdGUoMjI1ZGVnKTtcbn1cbjpnbG9iYWwoW3gtcGxhY2VtZW50Xj1cInJpZ2h0XCJdKSAuaG90c3BvdC50ZWFyZHJvcCAuZG90IHtcbiAgdHJhbnNmb3JtOiByb3RhdGUoMzE1ZGVnKTtcbn1cbjpnbG9iYWwoW3gtcGxhY2VtZW50Xj1cImJvdHRvbVwiXSkgLmhvdHNwb3QudGVhcmRyb3AgLmRvdCB7XG4gIHRyYW5zZm9ybTogcm90YXRlKDQ1ZGVnKTtcbn1cbjpnbG9iYWwoW3gtcGxhY2VtZW50Xj1cInRvcFwiXSkgLmhvdHNwb3QudGVhcmRyb3AgLmRvdCB7XG4gIHRyYW5zZm9ybTogcm90YXRlKDMxNWRlZyk7XG59XG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpRE8sa0JBQWtCLGNBQUMsQ0FBQyxBQUN6QixhQUFhLENBQUUsR0FBRyxDQUNsQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ3pCLGdCQUFnQixDQUFFLEtBQUssQ0FDdkIsS0FBSyxDQUFFLE9BQU8sQ0FDZCxTQUFTLENBQUUsS0FBSyxDQUNoQixPQUFPLENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FDbEIsTUFBTSxDQUFFLEtBQUssQ0FDYixjQUFjLENBQUUsU0FBUyxDQUN6QixPQUFPLENBQUUsSUFBSSxDQUNiLE1BQU0sQ0FBRSxPQUFPLEFBQ2pCLENBQUMsQUFDRCxnQ0FBa0IsTUFBTSxBQUFDLENBQUMsQUFDeEIsZ0JBQWdCLENBQUUsT0FBTyxDQUN6QixZQUFZLENBQUUsT0FBTyxDQUNyQixLQUFLLENBQUUsS0FBSyxDQUNaLFVBQVUsQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQUFDbEQsQ0FBQyxBQUVELDRCQUFPLENBQUMsQUFDTixPQUFPLENBQUUsR0FBRyxBQUNkLENBQUMsQUFDRCxRQUFRLGNBQUMsQ0FBQyxBQUNSLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxHQUFHLENBQ1osTUFBTSxDQUFFLE9BQU8sQUFDakIsQ0FBQyxBQUNELHNCQUFRLENBQUMsSUFBSSxjQUFDLENBQUMsQUFDYixRQUFRLENBQUUsUUFBUSxDQUNsQixPQUFPLENBQUUsR0FBRyxDQUNaLEdBQUcsQ0FBRSxHQUFHLENBQ1IsSUFBSSxDQUFFLEdBQUcsQ0FDVCxhQUFhLENBQUUsR0FBRyxDQUNsQixnQkFBZ0IsQ0FBRSxPQUFPLEFBQzNCLENBQUMsQUFDRCxRQUFRLG9CQUFNLENBQUMsSUFBSSxjQUFDLENBQUMsQUFDbkIsTUFBTSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUMzQixDQUFDLEFBQ0QsUUFBUSxvQkFBTSxDQUFDLE1BQU0sY0FBQyxDQUFDLEFBQ3JCLGFBQWEsQ0FBRSxHQUFHLENBQ2xCLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxHQUFHLENBQ1osR0FBRyxDQUFFLEdBQUcsQ0FDUixJQUFJLENBQUUsR0FBRyxDQUNULE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDekIsU0FBUyxDQUFFLHFCQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FDOUIseUJBQXlCLENBQUUsUUFBUSxBQUNyQyxDQUFDLEFBQ0QsV0FBVyxxQkFBUSxDQUFDLEFBQ2xCLEVBQUUsQUFBQyxDQUFDLEFBQ0YsU0FBUyxDQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3RCLE9BQU8sQ0FBRSxHQUFHLEFBQ2QsQ0FBQyxBQUNELElBQUksQUFBQyxDQUFDLEFBQ0osU0FBUyxDQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQzFCLE9BQU8sQ0FBRSxDQUFDLEFBQ1osQ0FBQyxBQUNILENBQUMsQUFDRCxRQUFRLHVCQUFTLENBQUMsSUFBSSxjQUFDLENBQUMsQUFDdEIsc0JBQXNCLENBQUUsQ0FBQyxBQUMzQixDQUFDLEFBQ08sb0JBQW9CLEFBQUMsQ0FBQyxRQUFRLHVCQUFTLENBQUMsSUFBSSxjQUFDLENBQUMsQUFDcEQsU0FBUyxDQUFFLE9BQU8sTUFBTSxDQUFDLEFBQzNCLENBQUMsQUFDTyxzQkFBc0IsQUFBQyxDQUFDLFFBQVEsdUJBQVMsQ0FBQyxJQUFJLGNBQUMsQ0FBQyxBQUN0RCxTQUFTLENBQUUsT0FBTyxNQUFNLENBQUMsQUFDM0IsQ0FBQyxBQUNPLHVCQUF1QixBQUFDLENBQUMsUUFBUSx1QkFBUyxDQUFDLElBQUksY0FBQyxDQUFDLEFBQ3ZELFNBQVMsQ0FBRSxPQUFPLEtBQUssQ0FBQyxBQUMxQixDQUFDLEFBQ08sb0JBQW9CLEFBQUMsQ0FBQyxRQUFRLHVCQUFTLENBQUMsSUFBSSxjQUFDLENBQUMsQUFDcEQsU0FBUyxDQUFFLE9BQU8sTUFBTSxDQUFDLEFBQzNCLENBQUMifQ== */";
	append(document.head, style);
}

function create_main_fragment$6(component, ctx) {
	var div2, div1, div0, text0, text1, div1_class_value, text2, if_block2_anchor, current;

	var if_block0 = (ctx.style == 'pulse') && create_if_block_2(component, ctx);

	var if_block1 = (ctx.style == 'teardrop') && create_if_block_1$1(component, ctx);

	var if_block2 = (ctx.backdrop) && create_if_block$3(component, ctx);

	return {
		c: function create() {
			div2 = createElement("div");
			div1 = createElement("div");
			div0 = createElement("div");
			text0 = createText("\n\n    ");
			if (if_block0) { if_block0.c(); }
			text1 = createText("\n    ");
			if (if_block1) { if_block1.c(); }
			text2 = createText("\n");
			if (if_block2) { if_block2.c(); }
			if_block2_anchor = createComment();
			div0.className = "dot svelte-9a2dtp";
			setStyle(div0, "width", "" + ctx.size + "px");
			setStyle(div0, "height", "" + ctx.size + "px");
			setStyle(div0, "margin", "-" + ctx.size / 2 + "px");
			addLoc(div0, file$6, 2, 4, 51);
			div1.className = div1_class_value = "hotspot " + ctx.style + " svelte-9a2dtp";
			addLoc(div1, file$6, 1, 2, 15);
			div2.className = "svelte-9a2dtp svelte-ref-el";
			addLoc(div2, file$6, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div1);
			append(div1, div0);
			append(div1, text0);
			if (if_block0) { if_block0.m(div1, null); }
			append(div1, text1);
			if (if_block1) { if_block1.m(div1, null); }
			component.refs.el = div2;
			insert(target, text2, anchor);
			if (if_block2) { if_block2.m(target, anchor); }
			insert(target, if_block2_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (!current || changed.size) {
				setStyle(div0, "width", "" + ctx.size + "px");
				setStyle(div0, "height", "" + ctx.size + "px");
				setStyle(div0, "margin", "-" + ctx.size / 2 + "px");
			}

			if (ctx.style == 'pulse') {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_2(component, ctx);
					if_block0.c();
					if_block0.m(div1, text1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.style == 'teardrop') {
				if (!if_block1) {
					if_block1 = create_if_block_1$1(component, ctx);
					if_block1.c();
					if_block1.m(div1, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if ((!current || changed.style) && div1_class_value !== (div1_class_value = "hotspot " + ctx.style + " svelte-9a2dtp")) {
				div1.className = div1_class_value;
			}

			if (ctx.backdrop) {
				if (!if_block2) {
					if_block2 = create_if_block$3(component, ctx);
					if_block2.c();
				}
				if_block2.i(if_block2_anchor.parentNode, if_block2_anchor);
			} else if (if_block2) {
				if_block2.o(function() {
					if_block2.d(1);
					if_block2 = null;
				});
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (if_block2) { if_block2.o(outrocallback); }
			else { outrocallback(); }

			current = false;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div2);
			}

			if (if_block0) { if_block0.d(); }
			if (if_block1) { if_block1.d(); }
			if (component.refs.el === div2) { component.refs.el = null; }
			if (detach) {
				detachNode(text2);
			}

			if (if_block2) { if_block2.d(detach); }
			if (detach) {
				detachNode(if_block2_anchor);
			}
		}
	};
}

// (5:4) {#if style == 'pulse'}
function create_if_block_2(component, ctx) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			div.className = "pulse svelte-9a2dtp";
			setStyle(div, "width", "" + ctx.size + "px");
			setStyle(div, "height", "" + ctx.size + "px");
			setStyle(div, "margin", "-" + ctx.size / 2 + "px");
			addLoc(div, file$6, 5, 6, 180);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.size) {
				setStyle(div, "width", "" + ctx.size + "px");
				setStyle(div, "height", "" + ctx.size + "px");
				setStyle(div, "margin", "-" + ctx.size / 2 + "px");
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (8:4) {#if style == 'teardrop'}
function create_if_block_1$1(component, ctx) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			div.className = "hotspot-arrow svelte-9a2dtp";
			addLoc(div, file$6, 8, 6, 323);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (13:0) {#if backdrop}
function create_if_block$3(component, ctx) {
	var current;

	var backdrop = new Backdrop({
		root: component.root,
		store: component.store
	});

	return {
		c: function create() {
			backdrop._fragment.c();
		},

		m: function mount(target, anchor) {
			backdrop._mount(target, anchor);
			current = true;
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (backdrop) { backdrop._fragment.o(outrocallback); }
			current = false;
		},

		d: function destroy$$1(detach) {
			backdrop.destroy(detach);
		}
	};
}

function Hotspot(options) {
	var this$1 = this;

	this._debugName = '<Hotspot>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$6(), options.data);
	if (!('style' in this._state)) { console.warn("<Hotspot> was created without expected data property 'style'"); }
	if (!('size' in this._state)) { console.warn("<Hotspot> was created without expected data property 'size'"); }
	if (!('backdrop' in this._state)) { console.warn("<Hotspot> was created without expected data property 'backdrop'"); }
	this._intro = !!options.intro;

	this._handlers.destroy = [ondestroy$1];

	if (!document.getElementById("svelte-9a2dtp-style")) { add_css$5(); }

	this._fragment = create_main_fragment$6(this, this._state);

	this.root._oncreate.push(function () {
		oncreate_1$1.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Hotspot.prototype, protoDev);

Hotspot.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/Box.svelte generated by Svelte v2.16.1 */

function data$7() {
	return {
  title: '',
  content: '',
  backgroundColor: config.colors.active,
  headerTextColor: config.colors.lightText,
};
}

var file$7 = "src/components/Box.svelte";

function add_css$6() {
	var style = createElement("style");
	style.id = 'svelte-uyaeo1-style';
	style.textContent = ".box.svelte-uyaeo1{margin:5px;display:inline-block;border-radius:8px;box-shadow:0px 0px 40px rgba(0, 0, 0, 0.05);background:white;text-align:initial}.box.svelte-uyaeo1 .box-header.svelte-uyaeo1{font-size:18px;font-weight:bold;padding:12px 20px;border-radius:8px 8px 0 0;text-align:center}.box.svelte-uyaeo1 .box-content.svelte-uyaeo1{padding:20px;text-align:left}.box.svelte-uyaeo1 .box-buttons.svelte-uyaeo1{color:inherit}.box.svelte-uyaeo1 .box-buttons.svelte-uyaeo1 [slot]{display:flex;justify-content:flex-end}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm94LnN2ZWx0ZSIsInNvdXJjZXMiOlsiQm94LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8ZGl2IGNsYXNzPVwiYm94XCIgcmVmOmVsPlxuICAgIHsjaWYgdGl0bGV9XG4gICAgICA8ZGl2IGNsYXNzPVwiYm94LWhlYWRlclwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogeyBiYWNrZ3JvdW5kQ29sb3IgfTsgY29sb3I6IHsgaGVhZGVyVGV4dENvbG9yIH1cIj57IHRpdGxlIH08L2Rpdj5cbiAgICB7L2lmfVxuICAgIDxkaXYgY2xhc3M9XCJib3gtY29udGVudFwiPlxuICAgICAgPHNsb3QgbmFtZT1cImNvbnRlbnRcIj48L3Nsb3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImJveC1idXR0b25zXCI+XG4gICAgICA8c2xvdCBuYW1lPVwiYnV0dG9uc1wiPiZuYnNwOzwvc2xvdD5cbiAgICA8L2Rpdj5cbjwvZGl2PlxuXG48c2NyaXB0PlxuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRhdGE6ICgpID0+ICh7XG4gICAgdGl0bGU6ICcnLFxuICAgIGNvbnRlbnQ6ICcnLFxuICAgIGJhY2tncm91bmRDb2xvcjogY29uZmlnLmNvbG9ycy5hY3RpdmUsXG4gICAgaGVhZGVyVGV4dENvbG9yOiBjb25maWcuY29sb3JzLmxpZ2h0VGV4dCxcbiAgfSksXG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT4ub25ib2FyZGlzdC1idXR0b24ge1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMwNTcxZjM7XG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICBjb2xvcjogIzA1NzFmMztcbiAgZm9udC1zaXplOiAwLjhlbTtcbiAgcGFkZGluZzogMC41ZW0gMWVtO1xuICBtYXJnaW46IDAuNWVtO1xuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICBvdXRsaW5lOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ub25ib2FyZGlzdC1idXR0b246aG92ZXIge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDO1xuICBib3JkZXItY29sb3I6ICM2MkE4RkM7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm94LXNoYWRvdzogaW5zZXQgMHB4IDBweCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xufVxuLmJveCB7XG4gIG1hcmdpbjogNXB4O1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm94LXNoYWRvdzogMHB4IDBweCA0MHB4IHJnYmEoMCwgMCwgMCwgMC4wNSk7XG4gIC8qIG1pbi13aWR0aDogMTAwcHg7XG4gIG1pbi1oZWlnaHQ6IDEwMHB4OyAqL1xuICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgdGV4dC1hbGlnbjogaW5pdGlhbDtcbn1cbi5ib3ggLmJveC1oZWFkZXIge1xuICBmb250LXNpemU6IDE4cHg7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xuICBwYWRkaW5nOiAxMnB4IDIwcHg7XG4gIGJvcmRlci1yYWRpdXM6IDhweCA4cHggMCAwO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4uYm94IC5ib3gtY29udGVudCB7XG4gIHBhZGRpbmc6IDIwcHg7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG59XG4uYm94IC5ib3gtYnV0dG9ucyB7XG4gIGNvbG9yOiBpbmhlcml0O1xufVxuLmJveCAuYm94LWJ1dHRvbnMgOmdsb2JhbChbc2xvdF0pIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcbn1cbjwvc3R5bGU+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJDQSxJQUFJLGNBQUMsQ0FBQyxBQUNKLE1BQU0sQ0FBRSxHQUFHLENBQ1gsT0FBTyxDQUFFLFlBQVksQ0FDckIsYUFBYSxDQUFFLEdBQUcsQ0FDbEIsVUFBVSxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBRzVDLFVBQVUsQ0FBRSxLQUFLLENBQ2pCLFVBQVUsQ0FBRSxPQUFPLEFBQ3JCLENBQUMsQUFDRCxrQkFBSSxDQUFDLFdBQVcsY0FBQyxDQUFDLEFBQ2hCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsV0FBVyxDQUFFLElBQUksQ0FDakIsT0FBTyxDQUFFLElBQUksQ0FBQyxJQUFJLENBQ2xCLGFBQWEsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzFCLFVBQVUsQ0FBRSxNQUFNLEFBQ3BCLENBQUMsQUFDRCxrQkFBSSxDQUFDLFlBQVksY0FBQyxDQUFDLEFBQ2pCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsVUFBVSxDQUFFLElBQUksQUFDbEIsQ0FBQyxBQUNELGtCQUFJLENBQUMsWUFBWSxjQUFDLENBQUMsQUFDakIsS0FBSyxDQUFFLE9BQU8sQUFDaEIsQ0FBQyxBQUNELGtCQUFJLENBQUMsMEJBQVksQ0FBQyxBQUFRLE1BQU0sQUFBRSxDQUFDLEFBQ2pDLE9BQU8sQ0FBRSxJQUFJLENBQ2IsZUFBZSxDQUFFLFFBQVEsQUFDM0IsQ0FBQyJ9 */";
	append(document.head, style);
}

function create_main_fragment$7(component, ctx) {
	var div2, text0, div0, slot_content_content = component._slotted.content, text1, div1, slot_content_buttons = component._slotted.buttons, text2, current;

	var if_block = (ctx.title) && create_if_block$4(component, ctx);

	return {
		c: function create() {
			div2 = createElement("div");
			if (if_block) { if_block.c(); }
			text0 = createText("\n    ");
			div0 = createElement("div");
			text1 = createText("\n    ");
			div1 = createElement("div");
			if (!slot_content_buttons) {
				text2 = createText(" ");
			}
			div0.className = "box-content svelte-uyaeo1";
			addLoc(div0, file$7, 4, 4, 175);
			div1.className = "box-buttons svelte-uyaeo1";
			addLoc(div1, file$7, 7, 4, 251);
			div2.className = "box svelte-uyaeo1";
			addLoc(div2, file$7, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert(target, div2, anchor);
			if (if_block) { if_block.m(div2, null); }
			append(div2, text0);
			append(div2, div0);

			if (slot_content_content) {
				append(div0, slot_content_content);
			}

			append(div2, text1);
			append(div2, div1);
			if (!slot_content_buttons) {
				append(div1, text2);
			}

			else {
				append(div1, slot_content_buttons);
			}

			component.refs.el = div2;
			current = true;
		},

		p: function update(changed, ctx) {
			if (ctx.title) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$4(component, ctx);
					if_block.c();
					if_block.m(div2, text0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: run,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div2);
			}

			if (if_block) { if_block.d(); }

			if (slot_content_content) {
				reinsertChildren(div0, slot_content_content);
			}

			if (slot_content_buttons) {
				reinsertChildren(div1, slot_content_buttons);
			}

			if (component.refs.el === div2) { component.refs.el = null; }
		}
	};
}

// (2:4) {#if title}
function create_if_block$4(component, ctx) {
	var div, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(ctx.title);
			div.className = "box-header svelte-uyaeo1";
			setStyle(div, "background-color", ctx.backgroundColor);
			setStyle(div, "color", ctx.headerTextColor);
			addLoc(div, file$7, 2, 6, 47);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
			append(div, text);
		},

		p: function update(changed, ctx) {
			if (changed.title) {
				setData(text, ctx.title);
			}

			if (changed.backgroundColor) {
				setStyle(div, "background-color", ctx.backgroundColor);
			}

			if (changed.headerTextColor) {
				setStyle(div, "color", ctx.headerTextColor);
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Box(options) {
	this._debugName = '<Box>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$7(), options.data);
	if (!('title' in this._state)) { console.warn("<Box> was created without expected data property 'title'"); }
	if (!('backgroundColor' in this._state)) { console.warn("<Box> was created without expected data property 'backgroundColor'"); }
	if (!('headerTextColor' in this._state)) { console.warn("<Box> was created without expected data property 'headerTextColor'"); }
	this._intro = !!options.intro;

	this._slotted = options.slots || {};

	if (!document.getElementById("svelte-uyaeo1-style")) { add_css$6(); }

	this._fragment = create_main_fragment$7(this, this._state);

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}

	this._intro = true;
}

assign(Box.prototype, protoDev);

Box.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/Modal.svelte generated by Svelte v2.16.1 */



function data$8() {
  return {
    id: uniquestring(),
    title: '',
    buttons: ['ok'],
    content: '',
    backdrop: true,
  };
}
var methods$4 = {
  close: close,
  call: function call(fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    fn.call.apply(fn, [ this ].concat( args ));
  },
  keypress: function keypress(event) {
    if (event.key === 'Escape') { this.close(); }
  },
};

function oncreate_1$2() {
  if (this.get().buttons) { this.set({ buttons: expandButtonArgs(this.get().buttons) }); }

  // Focus first button
  var firstButton = this.refs.el.querySelector('button');
  if (firstButton) { firstButton.focus(); }

  return oncreate$1.call(this);
}
var file$8 = "src/components/Modal.svelte";

function add_css$7() {
	var style = createElement("style");
	style.id = 'svelte-v4jc40-style';
	style.textContent = ".onboardist-button.svelte-v4jc40{border-radius:8px;border:1px solid #0571f3;background-color:white;color:#0571f3;font-size:0.8em;padding:0.5em 1em;margin:0.5em;text-transform:uppercase;outline:none;cursor:pointer}.onboardist-button.svelte-v4jc40:hover{background-color:#62A8FC;border-color:#62A8FC;color:white;box-shadow:inset 0px 0px 5px rgba(0, 0, 0, 0.2)}.oboardist-container.svelte-v4jc40{position:fixed;left:0;right:0;bottom:0;top:0;z-index:999;display:flex;justify-content:center;align-items:center}.backdrop.svelte-v4jc40{position:fixed;left:0;right:0;bottom:0;top:0;z-index:998;background:black;opacity:0.3}.oboardist-container .box{border:none !important;z-index:1000;box-shadow:0 0 50px 10px rgba(0, 0, 0, 0.2) !important}.oboardist-container .box .positioned{}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kYWwuc3ZlbHRlIiwic291cmNlcyI6WyJNb2RhbC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHN2ZWx0ZTp3aW5kb3cgb246a2V5ZG93bj1cImtleXByZXNzKGV2ZW50KVwiLz5cbjxkaXYgcmVmOmVsIGNsYXNzPVwib2JvYXJkaXN0LWNvbnRhaW5lciBtb2RhbFwiXG4gIHJvbGU9XCJhbGVydGRpYWxvZ1wiXG4gIGFyaWEtbW9kYWw9XCJ0cnVlXCJcbiAgYXJpYS1sYWJlbD17dGl0bGUgfHwgY29udGVudH1cbiAgYXJpYS1kZXNjcmliZWRieT1cImNvYWNobWFyay1tb2RhbC1jb250ZW50LXtpZH1cIlxuPlxuICA8Qm94IHJlZjpib3ggdGl0bGU9e3RpdGxlfT5cbiAgICA8ZGl2IGlkPVwiY29hY2htYXJrLW1vZGFsLWNvbnRlbnQte2lkfVwiIHNsb3Q9XCJjb250ZW50XCI+e0BodG1sIGNvbnRlbnR9PC9kaXY+XG4gICAgPGRpdiBzbG90PVwiYnV0dG9uc1wiPlxuICAgICAgeyNpZiBidXR0b25zfVxuICAgICAgICB7I2VhY2ggYnV0dG9ucyBhcyBidXR0b259XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgY2xhc3M9XCJvbmJvYXJkaXN0LWJ1dHRvblwiIG9uOmNsaWNrPVwiY2FsbChidXR0b24uaGFuZGxlcilcIj57YnV0dG9uLnRleHR9PC9idXR0b24+XG4gICAgICAgIHsvZWFjaH1cbiAgICAgIHs6ZWxzZX1cbiAgICAgICAgJm5ic3A7XG4gICAgICB7L2lmfVxuICAgIDwvZGl2PlxuICA8L0JveD5cbjwvZGl2PlxueyNpZiBiYWNrZHJvcH1cbiAgPGRpdiBjbGFzczpiYWNrZHJvcD1cImJhY2tkcm9wXCI+PC9kaXY+XG57L2lmfVxuXG48c2NyaXB0PlxuaW1wb3J0IEJveCBmcm9tICcuL0JveC5zdmVsdGUnO1xuaW1wb3J0IHsgY2xvc2UsIGV4cGFuZEJ1dHRvbkFyZ3MsIG9uY3JlYXRlLCBvbmRlc3Ryb3kgfSBmcm9tICcuLi9tZXRob2RzJztcbmltcG9ydCB7IHVuaXF1ZXN0cmluZyB9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG9uY3JlYXRlKCkge1xuICAgIGlmICh0aGlzLmdldCgpLmJ1dHRvbnMpIHRoaXMuc2V0KHsgYnV0dG9uczogZXhwYW5kQnV0dG9uQXJncyh0aGlzLmdldCgpLmJ1dHRvbnMpIH0pO1xuXG4gICAgLy8gRm9jdXMgZmlyc3QgYnV0dG9uXG4gICAgY29uc3QgZmlyc3RCdXR0b24gPSB0aGlzLnJlZnMuZWwucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XG4gICAgaWYgKGZpcnN0QnV0dG9uKSBmaXJzdEJ1dHRvbi5mb2N1cygpO1xuXG4gICAgcmV0dXJuIG9uY3JlYXRlLmNhbGwodGhpcyk7XG4gIH0sXG4gIG9uZGVzdHJveSxcbiAgY29tcG9uZW50czogeyBCb3ggfSxcbiAgZGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHVuaXF1ZXN0cmluZygpLFxuICAgICAgdGl0bGU6ICcnLFxuICAgICAgYnV0dG9uczogWydvayddLFxuICAgICAgY29udGVudDogJycsXG4gICAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICB9O1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgY2xvc2UsXG4gICAgY2FsbChmbiwgLi4uYXJncykge1xuICAgICAgZm4uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICB9LFxuICAgIGtleXByZXNzKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgdGhpcy5jbG9zZSgpO1xuICAgIH0sXG4gIH0sXG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT4ub25ib2FyZGlzdC1idXR0b24ge1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMwNTcxZjM7XG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICBjb2xvcjogIzA1NzFmMztcbiAgZm9udC1zaXplOiAwLjhlbTtcbiAgcGFkZGluZzogMC41ZW0gMWVtO1xuICBtYXJnaW46IDAuNWVtO1xuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICBvdXRsaW5lOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ub25ib2FyZGlzdC1idXR0b246aG92ZXIge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDO1xuICBib3JkZXItY29sb3I6ICM2MkE4RkM7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm94LXNoYWRvdzogaW5zZXQgMHB4IDBweCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xufVxuLm9ib2FyZGlzdC1jb250YWluZXIge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIHRvcDogMDtcbiAgei1pbmRleDogOTk5O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cbi5iYWNrZHJvcCB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgbGVmdDogMDtcbiAgcmlnaHQ6IDA7XG4gIGJvdHRvbTogMDtcbiAgdG9wOiAwO1xuICB6LWluZGV4OiA5OTg7XG4gIGJhY2tncm91bmQ6IGJsYWNrO1xuICBvcGFjaXR5OiAwLjM7XG59XG46Z2xvYmFsKC5vYm9hcmRpc3QtY29udGFpbmVyIC5ib3gpIHtcbiAgYm9yZGVyOiBub25lICFpbXBvcnRhbnQ7XG4gIHotaW5kZXg6IDEwMDA7XG4gIGJveC1zaGFkb3c6IDAgMCA1MHB4IDEwcHggcmdiYSgwLCAwLCAwLCAwLjIpICFpbXBvcnRhbnQ7XG59XG46Z2xvYmFsKC5vYm9hcmRpc3QtY29udGFpbmVyIC5ib3gpIC5wb3NpdGlvbmVkIHtcbiAgLyogcG9zaXRpb246IGFic29sdXRlO1xuICAgIG1hcmdpbjogYXV0bztcbiAgICB0b3A6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgYm90dG9tOiAwO1xuICAgIGxlZnQ6IDA7ICovXG59XG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE4RE8sa0JBQWtCLGNBQUMsQ0FBQyxBQUN6QixhQUFhLENBQUUsR0FBRyxDQUNsQixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQ3pCLGdCQUFnQixDQUFFLEtBQUssQ0FDdkIsS0FBSyxDQUFFLE9BQU8sQ0FDZCxTQUFTLENBQUUsS0FBSyxDQUNoQixPQUFPLENBQUUsS0FBSyxDQUFDLEdBQUcsQ0FDbEIsTUFBTSxDQUFFLEtBQUssQ0FDYixjQUFjLENBQUUsU0FBUyxDQUN6QixPQUFPLENBQUUsSUFBSSxDQUNiLE1BQU0sQ0FBRSxPQUFPLEFBQ2pCLENBQUMsQUFDRCxnQ0FBa0IsTUFBTSxBQUFDLENBQUMsQUFDeEIsZ0JBQWdCLENBQUUsT0FBTyxDQUN6QixZQUFZLENBQUUsT0FBTyxDQUNyQixLQUFLLENBQUUsS0FBSyxDQUNaLFVBQVUsQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQUFDbEQsQ0FBQyxBQUNELG9CQUFvQixjQUFDLENBQUMsQUFDcEIsUUFBUSxDQUFFLEtBQUssQ0FDZixJQUFJLENBQUUsQ0FBQyxDQUNQLEtBQUssQ0FBRSxDQUFDLENBQ1IsTUFBTSxDQUFFLENBQUMsQ0FDVCxHQUFHLENBQUUsQ0FBQyxDQUNOLE9BQU8sQ0FBRSxHQUFHLENBQ1osT0FBTyxDQUFFLElBQUksQ0FDYixlQUFlLENBQUUsTUFBTSxDQUN2QixXQUFXLENBQUUsTUFBTSxBQUNyQixDQUFDLEFBQ0QsU0FBUyxjQUFDLENBQUMsQUFDVCxRQUFRLENBQUUsS0FBSyxDQUNmLElBQUksQ0FBRSxDQUFDLENBQ1AsS0FBSyxDQUFFLENBQUMsQ0FDUixNQUFNLENBQUUsQ0FBQyxDQUNULEdBQUcsQ0FBRSxDQUFDLENBQ04sT0FBTyxDQUFFLEdBQUcsQ0FDWixVQUFVLENBQUUsS0FBSyxDQUNqQixPQUFPLENBQUUsR0FBRyxBQUNkLENBQUMsQUFDTyx5QkFBeUIsQUFBRSxDQUFDLEFBQ2xDLE1BQU0sQ0FBRSxJQUFJLENBQUMsVUFBVSxDQUN2QixPQUFPLENBQUUsSUFBSSxDQUNiLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEFBQ3pELENBQUMsQUFDTyx5QkFBeUIsQUFBQyxDQUFDLFdBQVcsQUFBQyxDQUFDLEFBT2hELENBQUMifQ== */";
	append(document.head, style);
}

function click_handler(event) {
	var ref = this._svelte;
	var component = ref.component;
	var ctx = ref.ctx;

	component.call(ctx.button.handler);
}

function get_each_context$1(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.button = list[i];
	return child_ctx;
}

function create_main_fragment$8(component, ctx) {
	var div2, div0, div0_id_value, text0, div1, div2_aria_label_value, div2_aria_describedby_value, text1, if_block1_anchor, current;

	function onwindowkeydown(event) {
		component.keypress(event);	}
	window.addEventListener("keydown", onwindowkeydown);

	function select_block_type(ctx) {
		if (ctx.buttons) { return create_if_block_1$2; }
		return create_else_block$2;
	}

	var current_block_type = select_block_type(ctx);
	var if_block0 = current_block_type(component, ctx);

	var box_initial_data = { title: ctx.title };
	var box = new Box({
		root: component.root,
		store: component.store,
		slots: { default: createFragment(), buttons: createFragment(), content: createFragment() },
		data: box_initial_data
	});

	component.refs.box = box;

	var if_block1 = (ctx.backdrop) && create_if_block$5(component, ctx);

	return {
		c: function create() {
			div2 = createElement("div");
			div0 = createElement("div");
			text0 = createText("\n    ");
			div1 = createElement("div");
			if_block0.c();
			box._fragment.c();
			text1 = createText("\n");
			if (if_block1) { if_block1.c(); }
			if_block1_anchor = createComment();
			div0.id = div0_id_value = "coachmark-modal-content-" + ctx.id;
			setAttribute(div0, "slot", "content");
			addLoc(div0, file$8, 8, 4, 251);
			setAttribute(div1, "slot", "buttons");
			addLoc(div1, file$8, 9, 4, 331);
			div2.className = "oboardist-container modal svelte-v4jc40";
			setAttribute(div2, "role", "alertdialog");
			setAttribute(div2, "aria-modal", "true");
			setAttribute(div2, "aria-label", div2_aria_label_value = ctx.title || ctx.content);
			setAttribute(div2, "aria-describedby", div2_aria_describedby_value = "coachmark-modal-content-" + ctx.id);
			addLoc(div2, file$8, 1, 0, 46);
		},

		m: function mount(target, anchor) {
			insert(target, div2, anchor);
			append(box._slotted.content, div0);
			div0.innerHTML = ctx.content;
			append(box._slotted.default, text0);
			append(box._slotted.buttons, div1);
			if_block0.m(div1, null);
			box._mount(div2, null);
			component.refs.el = div2;
			insert(target, text1, anchor);
			if (if_block1) { if_block1.m(target, anchor); }
			insert(target, if_block1_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (!current || changed.content) {
				div0.innerHTML = ctx.content;
			}

			if ((!current || changed.id) && div0_id_value !== (div0_id_value = "coachmark-modal-content-" + ctx.id)) {
				div0.id = div0_id_value;
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(changed, ctx);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(component, ctx);
				if_block0.c();
				if_block0.m(div1, null);
			}

			var box_changes = {};
			if (changed.title) { box_changes.title = ctx.title; }
			box._set(box_changes);

			if ((!current || changed.title || changed.content) && div2_aria_label_value !== (div2_aria_label_value = ctx.title || ctx.content)) {
				setAttribute(div2, "aria-label", div2_aria_label_value);
			}

			if ((!current || changed.id) && div2_aria_describedby_value !== (div2_aria_describedby_value = "coachmark-modal-content-" + ctx.id)) {
				setAttribute(div2, "aria-describedby", div2_aria_describedby_value);
			}

			if (ctx.backdrop) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block$5(component, ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (box) { box._fragment.o(outrocallback); }
			current = false;
		},

		d: function destroy$$1(detach) {
			window.removeEventListener("keydown", onwindowkeydown);

			if (detach) {
				detachNode(div2);
			}

			if_block0.d();
			box.destroy();
			if (component.refs.box === box) { component.refs.box = null; }
			if (component.refs.el === div2) { component.refs.el = null; }
			if (detach) {
				detachNode(text1);
			}

			if (if_block1) { if_block1.d(detach); }
			if (detach) {
				detachNode(if_block1_anchor);
			}
		}
	};
}

// (15:6) {:else}
function create_else_block$2(component, ctx) {
	var text;

	return {
		c: function create() {
			text = createText(" ");
		},

		m: function mount(target, anchor) {
			insert(target, text, anchor);
		},

		p: noop,

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

// (11:6) {#if buttons}
function create_if_block_1$2(component, ctx) {
	var each_anchor;

	var each_value = ctx.buttons;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
	}

	return {
		c: function create() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function mount(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_anchor, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.buttons) {
				each_value = ctx.buttons;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		d: function destroy$$1(detach) {
			destroyEach(each_blocks, detach);

			if (detach) {
				detachNode(each_anchor);
			}
		}
	};
}

// (12:8) {#each buttons as button}
function create_each_block$1(component, ctx) {
	var button, text_value = ctx.button.text, text;

	return {
		c: function create() {
			button = createElement("button");
			text = createText(text_value);
			button._svelte = { component: component, ctx: ctx };

			addListener(button, "click", click_handler);
			button.type = "button";
			button.tabIndex = "0";
			button.className = "onboardist-button svelte-v4jc40";
			addLoc(button, file$8, 12, 10, 416);
		},

		m: function mount(target, anchor) {
			insert(target, button, anchor);
			append(button, text);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			if ((changed.buttons) && text_value !== (text_value = ctx.button.text)) {
				setData(text, text_value);
			}

			button._svelte.ctx = ctx;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(button);
			}

			removeListener(button, "click", click_handler);
		}
	};
}

// (21:0) {#if backdrop}
function create_if_block$5(component, ctx) {
	var div;

	return {
		c: function create() {
			div = createElement("div");
			div.className = "svelte-v4jc40";
			toggleClass(div, "backdrop", ctx.backdrop);
			addLoc(div, file$8, 21, 2, 633);
		},

		m: function mount(target, anchor) {
			insert(target, div, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.backdrop) {
				toggleClass(div, "backdrop", ctx.backdrop);
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Modal(options) {
	var this$1 = this;

	this._debugName = '<Modal>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$8(), options.data);
	if (!('title' in this._state)) { console.warn("<Modal> was created without expected data property 'title'"); }
	if (!('content' in this._state)) { console.warn("<Modal> was created without expected data property 'content'"); }
	if (!('id' in this._state)) { console.warn("<Modal> was created without expected data property 'id'"); }
	if (!('buttons' in this._state)) { console.warn("<Modal> was created without expected data property 'buttons'"); }
	if (!('backdrop' in this._state)) { console.warn("<Modal> was created without expected data property 'backdrop'"); }
	this._intro = !!options.intro;

	this._handlers.destroy = [ondestroy$1];

	if (!document.getElementById("svelte-v4jc40-style")) { add_css$7(); }

	this._fragment = create_main_fragment$8(this, this._state);

	this.root._oncreate.push(function () {
		oncreate_1$2.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Modal.prototype, protoDev);
assign(Modal.prototype, methods$4);

Modal.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src/components/Tooltip.svelte generated by Svelte v2.16.1 */



function data$9() {
	return {
  id: uniquestring(),
  title: '',
  content: '',
  backdrop: false,
  buttons: ['ok'],
};
}

var methods$5 = {
  close: close,
  call: function call(fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    fn.call.apply(fn, [ this ].concat( args ));
  },
};

function oncreate_1$3() {
  this.options.modifiers = this.options.modifiers || {};
  if (this.get().buttons) { this.set({ buttons: expandButtonArgs(this.get().buttons) }); }

  // Focus first button
  var firstButton = this.refs.el.querySelector('button');
  if (firstButton) { firstButton.focus(); }

  return oncreate$1.call(this);
}
var file$9 = "src/components/Tooltip.svelte";

function add_css$8() {
	var style = createElement("style");
	style.id = 'svelte-zx5vrt-style';
	style.textContent = ".onboardist-button.svelte-zx5vrt{border-radius:8px;border:1px solid #0571f3;background-color:white;color:#0571f3;font-size:0.8em;padding:0.5em 1em;margin:0.5em;text-transform:uppercase;outline:none;cursor:pointer}.onboardist-button.svelte-zx5vrt:hover{background-color:#62A8FC;border-color:#62A8FC;color:white;box-shadow:inset 0px 0px 5px rgba(0, 0, 0, 0.2)}.onboardist-container.svelte-zx5vrt{margin:5px;z-index:999}.onboardist-container[x-placement^=\"right\"]{margin-left:10px}.onboardist-container[x-placement^=\"left\"]{margin-right:10px}.onboardist-container[x-placement^=\"bottom\"]{margin-top:10px}.onboardist-container[x-placement^=\"top\"]{margin-bottom:10px}.tooltip.svelte-zx5vrt{border-radius:12px;box-shadow:0px 0px 40px rgba(0, 0, 0, 0.05);background:rgba(0, 0, 0, 0)}.tooltip.svelte-zx5vrt .box{margin:0 !important;color:white;background-color:#62A8FC !important}.tooltip.svelte-zx5vrt .box > .box-content:first-child{padding-top:10px !important}.tooltip.svelte-zx5vrt .box > div:last-child{padding-bottom:5px !important}.tooltip.svelte-zx5vrt .box .box-header{padding:10px !important}.tooltip.svelte-zx5vrt .box .box-content{padding:5px 10px !important}.tooltip.svelte-zx5vrt .box .box-buttons{padding:0}.tooltip.svelte-zx5vrt .box .box-buttons button{background-color:#62A8FC;color:white;border-color:white}.tooltip.svelte-zx5vrt .tooltip-arrow.svelte-zx5vrt{background:#62A8FC;height:10px;width:10px;position:absolute;display:inline-block;transform:rotate(45deg)}[x-placement^=\"right\"] .tooltip.svelte-zx5vrt .tooltip-arrow.svelte-zx5vrt{left:-3px}[x-placement^=\"left\"] .tooltip.svelte-zx5vrt .tooltip-arrow.svelte-zx5vrt{right:-3px}[x-placement^=\"bottom\"] .tooltip.svelte-zx5vrt .tooltip-arrow.svelte-zx5vrt{top:-3px}[x-placement^=\"top\"] .tooltip.svelte-zx5vrt .tooltip-arrow.svelte-zx5vrt{bottom:-3px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9vbHRpcC5zdmVsdGUiLCJzb3VyY2VzIjpbIlRvb2x0aXAuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxkaXYgcmVmOmVsIGNsYXNzPVwib25ib2FyZGlzdC1jb250YWluZXJcIj5cbiAgPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1sYWJlbD17dGl0bGUgfHwgY29udGVudH0gYXJpYS1kZXNjcmliZWRieT1cImNvYWNobWFyay10b29sdGlwLWNvbnRlbnQte2lkfVwiPlxuICAgIDxCb3ggcmVmOmJveCB0aXRsZT17dGl0bGV9PlxuICAgICAgPGRpdiBzbG90PVwiY29udGVudFwiIGlkPVwiY29hY2htYXJrLXRvb2x0aXAtY29udGVudC17aWR9XCI+e0BodG1sIGNvbnRlbnR9PC9kaXY+XG4gICAgICA8ZGl2IHNsb3Q9XCJidXR0b25zXCI+XG4gICAgICAgIHsjaWYgYnV0dG9ucyAmJiBidXR0b25zLmxlbmd0aCA+IDB9XG4gICAgICAgICAgeyNlYWNoIGJ1dHRvbnMgYXMgYnV0dG9ufVxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdGFiaW5kZXg9XCIwXCIgY2xhc3M9XCJvbmJvYXJkaXN0LWJ1dHRvblwiIG9uOmNsaWNrPVwiY2FsbChidXR0b24uaGFuZGxlcilcIj57YnV0dG9uLnRleHR9PC9idXR0b24+XG4gICAgICAgICAgey9lYWNofVxuICAgICAgICB7L2lmfVxuICAgICAgPC9kaXY+XG4gICAgPC9Cb3g+XG4gICAgPGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIiB4LWFycm93PjwvZGl2PlxuICA8L2Rpdj5cbjwvZGl2PlxueyNpZiBiYWNrZHJvcH08QmFja2Ryb3A+PC9CYWNrZHJvcD57L2lmfVxuXG48c2NyaXB0PlxuaW1wb3J0IEJhY2tkcm9wIGZyb20gJy4vQmFja2Ryb3Auc3ZlbHRlJztcbmltcG9ydCBCb3ggZnJvbSAnLi9Cb3guc3ZlbHRlJztcbmltcG9ydCB7IGNsb3NlLCBleHBhbmRCdXR0b25BcmdzLCBvbmNyZWF0ZSwgb25kZXN0cm95IH0gZnJvbSAnLi4vbWV0aG9kcyc7XG5pbXBvcnQgeyB1bmlxdWVzdHJpbmcgfSBmcm9tICcuLi91dGlsJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb21wb25lbnRzOiB7IEJhY2tkcm9wLCBCb3ggfSxcbiAgb25jcmVhdGUoKSB7XG4gICAgdGhpcy5vcHRpb25zLm1vZGlmaWVycyA9IHRoaXMub3B0aW9ucy5tb2RpZmllcnMgfHwge307XG4gICAgaWYgKHRoaXMuZ2V0KCkuYnV0dG9ucykgdGhpcy5zZXQoeyBidXR0b25zOiBleHBhbmRCdXR0b25BcmdzKHRoaXMuZ2V0KCkuYnV0dG9ucykgfSk7XG5cbiAgICAvLyBGb2N1cyBmaXJzdCBidXR0b25cbiAgICBjb25zdCBmaXJzdEJ1dHRvbiA9IHRoaXMucmVmcy5lbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcbiAgICBpZiAoZmlyc3RCdXR0b24pIGZpcnN0QnV0dG9uLmZvY3VzKCk7XG5cbiAgICByZXR1cm4gb25jcmVhdGUuY2FsbCh0aGlzKTtcbiAgfSxcbiAgb25kZXN0cm95LFxuICBkYXRhOiAoKSA9PiAoe1xuICAgIGlkOiB1bmlxdWVzdHJpbmcoKSxcbiAgICB0aXRsZTogJycsXG4gICAgY29udGVudDogJycsXG4gICAgYmFja2Ryb3A6IGZhbHNlLFxuICAgIGJ1dHRvbnM6IFsnb2snXSxcbiAgfSksXG4gIG1ldGhvZHM6IHtcbiAgICBjbG9zZSxcbiAgICBjYWxsKGZuLCAuLi5hcmdzKSB7XG4gICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH0sXG4gIH0sXG59O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT4ub25ib2FyZGlzdC1idXR0b24ge1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMwNTcxZjM7XG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICBjb2xvcjogIzA1NzFmMztcbiAgZm9udC1zaXplOiAwLjhlbTtcbiAgcGFkZGluZzogMC41ZW0gMWVtO1xuICBtYXJnaW46IDAuNWVtO1xuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICBvdXRsaW5lOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ub25ib2FyZGlzdC1idXR0b246aG92ZXIge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDO1xuICBib3JkZXItY29sb3I6ICM2MkE4RkM7XG4gIGNvbG9yOiB3aGl0ZTtcbiAgYm94LXNoYWRvdzogaW5zZXQgMHB4IDBweCA1cHggcmdiYSgwLCAwLCAwLCAwLjIpO1xufVxuLm9uYm9hcmRpc3QtY29udGFpbmVyIHtcbiAgbWFyZ2luOiA1cHg7XG4gIHotaW5kZXg6IDk5OTtcbn1cbjpnbG9iYWwoLm9uYm9hcmRpc3QtY29udGFpbmVyW3gtcGxhY2VtZW50Xj1cInJpZ2h0XCJdKSB7XG4gIG1hcmdpbi1sZWZ0OiAxMHB4O1xufVxuOmdsb2JhbCgub25ib2FyZGlzdC1jb250YWluZXJbeC1wbGFjZW1lbnRePVwibGVmdFwiXSkge1xuICBtYXJnaW4tcmlnaHQ6IDEwcHg7XG59XG46Z2xvYmFsKC5vbmJvYXJkaXN0LWNvbnRhaW5lclt4LXBsYWNlbWVudF49XCJib3R0b21cIl0pIHtcbiAgbWFyZ2luLXRvcDogMTBweDtcbn1cbjpnbG9iYWwoLm9uYm9hcmRpc3QtY29udGFpbmVyW3gtcGxhY2VtZW50Xj1cInRvcFwiXSkge1xuICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuLnRvb2x0aXAge1xuICBib3JkZXItcmFkaXVzOiAxMnB4O1xuICBib3gtc2hhZG93OiAwcHggMHB4IDQwcHggcmdiYSgwLCAwLCAwLCAwLjA1KTtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwKTtcbn1cbi50b29sdGlwIDpnbG9iYWwoLmJveCkge1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgY29sb3I6IHdoaXRlO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDICFpbXBvcnRhbnQ7XG59XG4udG9vbHRpcCA6Z2xvYmFsKC5ib3ggPiAuYm94LWNvbnRlbnQ6Zmlyc3QtY2hpbGQpIHtcbiAgcGFkZGluZy10b3A6IDEwcHggIWltcG9ydGFudDtcbn1cbi50b29sdGlwIDpnbG9iYWwoLmJveCA+IGRpdjpsYXN0LWNoaWxkKSB7XG4gIHBhZGRpbmctYm90dG9tOiA1cHggIWltcG9ydGFudDtcbn1cbi50b29sdGlwIDpnbG9iYWwoLmJveCAuYm94LWhlYWRlcikge1xuICBwYWRkaW5nOiAxMHB4ICFpbXBvcnRhbnQ7XG59XG4udG9vbHRpcCA6Z2xvYmFsKC5ib3ggLmJveC1jb250ZW50KSB7XG4gIHBhZGRpbmc6IDVweCAxMHB4ICFpbXBvcnRhbnQ7XG59XG4udG9vbHRpcCA6Z2xvYmFsKC5ib3ggLmJveC1idXR0b25zKSB7XG4gIHBhZGRpbmc6IDA7XG59XG4udG9vbHRpcCA6Z2xvYmFsKC5ib3ggLmJveC1idXR0b25zIGJ1dHRvbikge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjNjJBOEZDO1xuICBjb2xvcjogd2hpdGU7XG4gIGJvcmRlci1jb2xvcjogd2hpdGU7XG59XG4udG9vbHRpcCAuaGVhZGVyIHtcbiAgZm9udC1zaXplOiAxOHB4O1xuICBmb250LXdlaWdodDogYm9sZDtcbiAgcGFkZGluZzogMTJweCAyMHB4O1xuICBib3JkZXItcmFkaXVzOiAxMnB4IDEycHggMCAwO1xufVxuLnRvb2x0aXAgLmNvbnRlbnQge1xuICBwYWRkaW5nOiA1cHggMjBweCAyMHB4O1xufVxuLnRvb2x0aXAgLnRvb2x0aXAtYXJyb3cge1xuICBiYWNrZ3JvdW5kOiAjNjJBOEZDO1xuICBoZWlnaHQ6IDEwcHg7XG4gIHdpZHRoOiAxMHB4O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgdHJhbnNmb3JtOiByb3RhdGUoNDVkZWcpO1xufVxuOmdsb2JhbChbeC1wbGFjZW1lbnRePVwicmlnaHRcIl0pIC50b29sdGlwIC50b29sdGlwLWFycm93IHtcbiAgbGVmdDogLTNweDtcbn1cbjpnbG9iYWwoW3gtcGxhY2VtZW50Xj1cImxlZnRcIl0pIC50b29sdGlwIC50b29sdGlwLWFycm93IHtcbiAgcmlnaHQ6IC0zcHg7XG59XG46Z2xvYmFsKFt4LXBsYWNlbWVudF49XCJib3R0b21cIl0pIC50b29sdGlwIC50b29sdGlwLWFycm93IHtcbiAgdG9wOiAtM3B4O1xufVxuOmdsb2JhbChbeC1wbGFjZW1lbnRePVwidG9wXCJdKSAudG9vbHRpcCAudG9vbHRpcC1hcnJvdyB7XG4gIGJvdHRvbTogLTNweDtcbn1cbjwvc3R5bGU+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9ETyxrQkFBa0IsY0FBQyxDQUFDLEFBQ3pCLGFBQWEsQ0FBRSxHQUFHLENBQ2xCLE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDekIsZ0JBQWdCLENBQUUsS0FBSyxDQUN2QixLQUFLLENBQUUsT0FBTyxDQUNkLFNBQVMsQ0FBRSxLQUFLLENBQ2hCLE9BQU8sQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUNsQixNQUFNLENBQUUsS0FBSyxDQUNiLGNBQWMsQ0FBRSxTQUFTLENBQ3pCLE9BQU8sQ0FBRSxJQUFJLENBQ2IsTUFBTSxDQUFFLE9BQU8sQUFDakIsQ0FBQyxBQUNELGdDQUFrQixNQUFNLEFBQUMsQ0FBQyxBQUN4QixnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLFlBQVksQ0FBRSxPQUFPLENBQ3JCLEtBQUssQ0FBRSxLQUFLLENBQ1osVUFBVSxDQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUNsRCxDQUFDLEFBQ0QscUJBQXFCLGNBQUMsQ0FBQyxBQUNyQixNQUFNLENBQUUsR0FBRyxDQUNYLE9BQU8sQ0FBRSxHQUFHLEFBQ2QsQ0FBQyxBQUNPLDJDQUEyQyxBQUFFLENBQUMsQUFDcEQsV0FBVyxDQUFFLElBQUksQUFDbkIsQ0FBQyxBQUNPLDBDQUEwQyxBQUFFLENBQUMsQUFDbkQsWUFBWSxDQUFFLElBQUksQUFDcEIsQ0FBQyxBQUNPLDRDQUE0QyxBQUFFLENBQUMsQUFDckQsVUFBVSxDQUFFLElBQUksQUFDbEIsQ0FBQyxBQUNPLHlDQUF5QyxBQUFFLENBQUMsQUFDbEQsYUFBYSxDQUFFLElBQUksQUFDckIsQ0FBQyxBQUNELFFBQVEsY0FBQyxDQUFDLEFBQ1IsYUFBYSxDQUFFLElBQUksQ0FDbkIsVUFBVSxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQzVDLFVBQVUsQ0FBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUM5QixDQUFDLEFBQ0Qsc0JBQVEsQ0FBQyxBQUFRLElBQUksQUFBRSxDQUFDLEFBQ3RCLE1BQU0sQ0FBRSxDQUFDLENBQUMsVUFBVSxDQUNwQixLQUFLLENBQUUsS0FBSyxDQUNaLGdCQUFnQixDQUFFLE9BQU8sQ0FBQyxVQUFVLEFBQ3RDLENBQUMsQUFDRCxzQkFBUSxDQUFDLEFBQVEsK0JBQStCLEFBQUUsQ0FBQyxBQUNqRCxXQUFXLENBQUUsSUFBSSxDQUFDLFVBQVUsQUFDOUIsQ0FBQyxBQUNELHNCQUFRLENBQUMsQUFBUSxxQkFBcUIsQUFBRSxDQUFDLEFBQ3ZDLGNBQWMsQ0FBRSxHQUFHLENBQUMsVUFBVSxBQUNoQyxDQUFDLEFBQ0Qsc0JBQVEsQ0FBQyxBQUFRLGdCQUFnQixBQUFFLENBQUMsQUFDbEMsT0FBTyxDQUFFLElBQUksQ0FBQyxVQUFVLEFBQzFCLENBQUMsQUFDRCxzQkFBUSxDQUFDLEFBQVEsaUJBQWlCLEFBQUUsQ0FBQyxBQUNuQyxPQUFPLENBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEFBQzlCLENBQUMsQUFDRCxzQkFBUSxDQUFDLEFBQVEsaUJBQWlCLEFBQUUsQ0FBQyxBQUNuQyxPQUFPLENBQUUsQ0FBQyxBQUNaLENBQUMsQUFDRCxzQkFBUSxDQUFDLEFBQVEsd0JBQXdCLEFBQUUsQ0FBQyxBQUMxQyxnQkFBZ0IsQ0FBRSxPQUFPLENBQ3pCLEtBQUssQ0FBRSxLQUFLLENBQ1osWUFBWSxDQUFFLEtBQUssQUFDckIsQ0FBQyxBQVVELHNCQUFRLENBQUMsY0FBYyxjQUFDLENBQUMsQUFDdkIsVUFBVSxDQUFFLE9BQU8sQ0FDbkIsTUFBTSxDQUFFLElBQUksQ0FDWixLQUFLLENBQUUsSUFBSSxDQUNYLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLFNBQVMsQ0FBRSxPQUFPLEtBQUssQ0FBQyxBQUMxQixDQUFDLEFBQ08sc0JBQXNCLEFBQUMsQ0FBQyxzQkFBUSxDQUFDLGNBQWMsY0FBQyxDQUFDLEFBQ3ZELElBQUksQ0FBRSxJQUFJLEFBQ1osQ0FBQyxBQUNPLHFCQUFxQixBQUFDLENBQUMsc0JBQVEsQ0FBQyxjQUFjLGNBQUMsQ0FBQyxBQUN0RCxLQUFLLENBQUUsSUFBSSxBQUNiLENBQUMsQUFDTyx1QkFBdUIsQUFBQyxDQUFDLHNCQUFRLENBQUMsY0FBYyxjQUFDLENBQUMsQUFDeEQsR0FBRyxDQUFFLElBQUksQUFDWCxDQUFDLEFBQ08sb0JBQW9CLEFBQUMsQ0FBQyxzQkFBUSxDQUFDLGNBQWMsY0FBQyxDQUFDLEFBQ3JELE1BQU0sQ0FBRSxJQUFJLEFBQ2QsQ0FBQyJ9 */";
	append(document.head, style);
}

function click_handler$1(event) {
	var ref = this._svelte;
	var component = ref.component;
	var ctx = ref.ctx;

	component.call(ctx.button.handler);
}

function get_each_context$2(ctx, list, i) {
	var child_ctx = Object.create(ctx);
	child_ctx.button = list[i];
	return child_ctx;
}

function create_main_fragment$9(component, ctx) {
	var div4, div3, div0, div0_id_value, text0, div1, text1, div2, div3_aria_label_value, div3_aria_describedby_value, text2, if_block1_anchor, current;

	var if_block0 = (ctx.buttons && ctx.buttons.length > 0) && create_if_block_1$3(component, ctx);

	var box_initial_data = { title: ctx.title };
	var box = new Box({
		root: component.root,
		store: component.store,
		slots: { default: createFragment(), buttons: createFragment(), content: createFragment() },
		data: box_initial_data
	});

	component.refs.box = box;

	var if_block1 = (ctx.backdrop) && create_if_block$6(component, ctx);

	return {
		c: function create() {
			div4 = createElement("div");
			div3 = createElement("div");
			div0 = createElement("div");
			text0 = createText("\n      ");
			div1 = createElement("div");
			if (if_block0) { if_block0.c(); }
			box._fragment.c();
			text1 = createText("\n    ");
			div2 = createElement("div");
			text2 = createText("\n");
			if (if_block1) { if_block1.c(); }
			if_block1_anchor = createComment();
			setAttribute(div0, "slot", "content");
			div0.id = div0_id_value = "coachmark-tooltip-content-" + ctx.id;
			addLoc(div0, file$9, 3, 6, 198);
			setAttribute(div1, "slot", "buttons");
			addLoc(div1, file$9, 4, 6, 282);
			div2.className = "tooltip-arrow svelte-zx5vrt";
			setAttribute(div2, "x-arrow", true);
			addLoc(div2, file$9, 12, 4, 571);
			div3.className = "tooltip svelte-zx5vrt";
			setAttribute(div3, "role", "dialog");
			setAttribute(div3, "aria-label", div3_aria_label_value = ctx.title || ctx.content);
			setAttribute(div3, "aria-describedby", div3_aria_describedby_value = "coachmark-tooltip-content-" + ctx.id);
			addLoc(div3, file$9, 1, 2, 44);
			div4.className = "onboardist-container svelte-zx5vrt";
			addLoc(div4, file$9, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div3);
			append(box._slotted.content, div0);
			div0.innerHTML = ctx.content;
			append(box._slotted.default, text0);
			append(box._slotted.buttons, div1);
			if (if_block0) { if_block0.m(div1, null); }
			box._mount(div3, null);
			append(div3, text1);
			append(div3, div2);
			component.refs.el = div4;
			insert(target, text2, anchor);
			if (if_block1) { if_block1.m(target, anchor); }
			insert(target, if_block1_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			if (!current || changed.content) {
				div0.innerHTML = ctx.content;
			}

			if ((!current || changed.id) && div0_id_value !== (div0_id_value = "coachmark-tooltip-content-" + ctx.id)) {
				div0.id = div0_id_value;
			}

			if (ctx.buttons && ctx.buttons.length > 0) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_1$3(component, ctx);
					if_block0.c();
					if_block0.m(div1, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			var box_changes = {};
			if (changed.title) { box_changes.title = ctx.title; }
			box._set(box_changes);

			if ((!current || changed.title || changed.content) && div3_aria_label_value !== (div3_aria_label_value = ctx.title || ctx.content)) {
				setAttribute(div3, "aria-label", div3_aria_label_value);
			}

			if ((!current || changed.id) && div3_aria_describedby_value !== (div3_aria_describedby_value = "coachmark-tooltip-content-" + ctx.id)) {
				setAttribute(div3, "aria-describedby", div3_aria_describedby_value);
			}

			if (ctx.backdrop) {
				if (!if_block1) {
					if_block1 = create_if_block$6(component, ctx);
					if_block1.c();
				}
				if_block1.i(if_block1_anchor.parentNode, if_block1_anchor);
			} else if (if_block1) {
				if_block1.o(function() {
					if_block1.d(1);
					if_block1 = null;
				});
			}
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			outrocallback = callAfter(outrocallback, 2);

			if (box) { box._fragment.o(outrocallback); }

			if (if_block1) { if_block1.o(outrocallback); }
			else { outrocallback(); }

			current = false;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div4);
			}

			if (if_block0) { if_block0.d(); }
			box.destroy();
			if (component.refs.box === box) { component.refs.box = null; }
			if (component.refs.el === div4) { component.refs.el = null; }
			if (detach) {
				detachNode(text2);
			}

			if (if_block1) { if_block1.d(detach); }
			if (detach) {
				detachNode(if_block1_anchor);
			}
		}
	};
}

// (6:8) {#if buttons && buttons.length > 0}
function create_if_block_1$3(component, ctx) {
	var each_anchor;

	var each_value = ctx.buttons;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
	}

	return {
		c: function create() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function mount(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_anchor, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.buttons) {
				each_value = ctx.buttons;

				for (var i = 0; i < each_value.length; i += 1) {
					var child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$2(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		d: function destroy$$1(detach) {
			destroyEach(each_blocks, detach);

			if (detach) {
				detachNode(each_anchor);
			}
		}
	};
}

// (7:10) {#each buttons as button}
function create_each_block$2(component, ctx) {
	var button, text_value = ctx.button.text, text;

	return {
		c: function create() {
			button = createElement("button");
			text = createText(text_value);
			button._svelte = { component: component, ctx: ctx };

			addListener(button, "click", click_handler$1);
			button.type = "button";
			button.tabIndex = "0";
			button.className = "onboardist-button svelte-zx5vrt";
			addLoc(button, file$9, 7, 12, 395);
		},

		m: function mount(target, anchor) {
			insert(target, button, anchor);
			append(button, text);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			if ((changed.buttons) && text_value !== (text_value = ctx.button.text)) {
				setData(text, text_value);
			}

			button._svelte.ctx = ctx;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(button);
			}

			removeListener(button, "click", click_handler$1);
		}
	};
}

// (16:0) {#if backdrop}
function create_if_block$6(component, ctx) {
	var current;

	var backdrop = new Backdrop({
		root: component.root,
		store: component.store
	});

	return {
		c: function create() {
			backdrop._fragment.c();
		},

		m: function mount(target, anchor) {
			backdrop._mount(target, anchor);
			current = true;
		},

		i: function intro(target, anchor) {
			if (current) { return; }

			this.m(target, anchor);
		},

		o: function outro(outrocallback) {
			if (!current) { return; }

			if (backdrop) { backdrop._fragment.o(outrocallback); }
			current = false;
		},

		d: function destroy$$1(detach) {
			backdrop.destroy(detach);
		}
	};
}

function Tooltip(options) {
	var this$1 = this;

	this._debugName = '<Tooltip>';
	if (!options || (!options.target && !options.root)) {
		throw new Error("'target' is a required option");
	}

	init(this, options);
	this.refs = {};
	this._state = assign(data$9(), options.data);
	if (!('title' in this._state)) { console.warn("<Tooltip> was created without expected data property 'title'"); }
	if (!('content' in this._state)) { console.warn("<Tooltip> was created without expected data property 'content'"); }
	if (!('id' in this._state)) { console.warn("<Tooltip> was created without expected data property 'id'"); }
	if (!('buttons' in this._state)) { console.warn("<Tooltip> was created without expected data property 'buttons'"); }
	if (!('backdrop' in this._state)) { console.warn("<Tooltip> was created without expected data property 'backdrop'"); }
	this._intro = !!options.intro;

	this._handlers.destroy = [ondestroy$1];

	if (!document.getElementById("svelte-zx5vrt-style")) { add_css$8(); }

	this._fragment = create_main_fragment$9(this, this._state);

	this.root._oncreate.push(function () {
		oncreate_1$3.call(this$1);
		this$1.fire("update", { changed: assignTrue({}, this$1._state), current: this$1._state });
	});

	if (options.target) {
		if (options.hydrate) { throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option"); }
		this._fragment.c();
		this._mount(options.target, options.anchor);

		flush(this);
	}

	this._intro = true;
}

assign(Tooltip.prototype, protoDev);
assign(Tooltip.prototype, methods$5);

Tooltip.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var props = ['backdrop', 'buttons', 'content', 'events', 'name', 'style', 'title'];

function genericConstructor(component, args) {
  var data = {};
  props.forEach(function (x) {
    if (x in args) { data[x] = args[x]; }
  });

  return new component(Object.assign({}, args,
    {data: data,
    target: document.querySelector('body')}));
}

var Coachmark$1 = function Coachmark$$1(args) {
  args.component = 'coachmark';
  return genericConstructor(Coachmark, args);
};

var Hotspot$1 = function Hotspot$$1(args) {
  args.component = 'hotspot';
  return genericConstructor(Hotspot, args);
};

var Modal$1 = function Modal$$1(args) {
  args.component = 'modal';
  return genericConstructor(Modal, args);
};

var Tooltip$1 = function Tooltip$$1(args) {
  args.component = 'tooltip';
  return genericConstructor(Tooltip, args);
};

// TODO: rewrite with Map()
// Singleton registry
var _registry = {
  tours: {},
  components: {},
  listeners: [],

  activeTour: null,
};

var ComponentMap = {
  coachmark: Coachmark$1,
  hotspot: Hotspot$1,
  modal: Modal$1,
  tooltip: Tooltip$1,
};

function clear() {
  destroyInstances();

  for (var i = 0, list = Object.keys(_registry.components); i < list.length; i += 1) {
    var key = list[i];

    delete _registry.components[key];
  }

  for (var i$1 = 0, list$1 = Object.keys(_registry.tours); i$1 < list$1.length; i$1 += 1) {
    var key$1 = list$1[i$1];

    delete _registry.tours[key$1];
  }
}

function component(name) {
  return _registry.components[name];
}

function tour(name) {
  return _registry.tours[name];
}

function registerComponent(ref) {
  var name = ref.name;
  var component = ref.component;
  var args = ref.args;
  var instance = ref.instance;

  if (!name) { name = uniquestring(); }
  args = args || {};
  args.name = name;

  if (component in ComponentMap) { component = ComponentMap[component]; }

  _registry.components[name] = {
    component: component,
    args: args,
    instance: instance,
  };

  // TODO: this doesn't belong here. Causing circular dependency
  // registerForEvents.call(this, args.events, _registry.components[name]);

  return _registry.components[name];
}

function registerTour(tour) {
  tour.name = tour.name || uniquestring();

  _registry.tours[tour.name] = tour;

  return tour;
}

function activeTour() {
  return _registry.activeTour;
}

function setActiveTour(tour) {
  if (typeof tour === 'string') { tour = _registry.tours[tour]; }
  if (!tour) { throw new Error('No tour specified'); }

  _registry.activeTour = tour;
}

function registerInstance(ref) {
  var name = ref.name;
  var instance = ref.instance;

  if (!name) { throw new Error('No component name provided'); }
  if (!instance) { throw new Error('No component instance provided'); }

  _registry.components[name] = _registry.components[name] || {};
  _registry.components[name].instance = instance;
}

function deregisterInstance(name) {
  if (name in _registry.components) {
    if (_registry.components[name].instance) { _registry.components[name].instance.destroy(); }
    delete _registry.components[name].instance;
  }
}

function destroyInstances() {
  for (var i = 0, list = Object.values(_registry.components); i < list.length; i += 1) {
    var component = list[i];

    if (component.instance) {
      component.instance.destroy();
      delete component.instance;
    }
  }
}

var Registry = {
  _registry: _registry,

  activeTour: activeTour,
  clear: clear,
  component: component,
  deregisterInstance: deregisterInstance,
  destroyInstances: destroyInstances,
  registerComponent: registerComponent,
  registerTour: registerTour,
  registerInstance: registerInstance,
  setActiveTour: setActiveTour,
  tour: tour,
};

function Store(state, options) {
	this._handlers = {};
	this._dependents = [];

	this._computed = blankObject();
	this._sortedComputedProperties = [];

	this._state = assign({}, state);
	this._differs = options && options.immutable ? _differsImmutable : _differs;
}

assign(Store.prototype, {
	_add: function _add(component, props) {
		this._dependents.push({
			component: component,
			props: props
		});
	},

	_init: function _init(props) {
		var state = {};
		for (var i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this._state[prop];
		}
		return state;
	},

	_remove: function _remove(component) {
		var i = this._dependents.length;
		while (i--) {
			if (this._dependents[i].component === component) {
				this._dependents.splice(i, 1);
				return;
			}
		}
	},

	_set: function _set$$1(newState, changed) {
		var this$1 = this;

		var previous = this._state;
		this._state = assign(assign({}, previous), newState);

		for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
			this._sortedComputedProperties[i].update(this._state, changed);
		}

		this.fire('state', {
			changed: changed,
			previous: previous,
			current: this._state
		});

		this._dependents
			.filter(function (dependent) {
				var componentState = {};
				var dirty = false;

				for (var j = 0; j < dependent.props.length; j += 1) {
					var prop = dependent.props[j];
					if (prop in changed) {
						componentState['$' + prop] = this$1._state[prop];
						dirty = true;
					}
				}

				if (dirty) {
					dependent.component._stage(componentState);
					return true;
				}
			})
			.forEach(function (dependent) {
				dependent.component.set({});
			});

		this.fire('update', {
			changed: changed,
			previous: previous,
			current: this._state
		});
	},

	_sortComputedProperties: function _sortComputedProperties() {
		var computed = this._computed;
		var sorted = this._sortedComputedProperties = [];
		var visited = blankObject();
		var currentKey;

		function visit(key) {
			var c = computed[key];

			if (c) {
				c.deps.forEach(function (dep) {
					if (dep === currentKey) {
						throw new Error(("Cyclical dependency detected between " + dep + " <-> " + key));
					}

					visit(dep);
				});

				if (!visited[key]) {
					visited[key] = true;
					sorted.push(c);
				}
			}
		}

		for (var key in this._computed) {
			visit(currentKey = key);
		}
	},

	compute: function compute(key, deps, fn) {
		var this$1 = this;

		var value;

		var c = {
			deps: deps,
			update: function (state, changed, dirty) {
				var values = deps.map(function (dep) {
					if (dep in changed) { dirty = true; }
					return state[dep];
				});

				if (dirty) {
					var newValue = fn.apply(null, values);
					if (this$1._differs(newValue, value)) {
						value = newValue;
						changed[key] = true;
						state[key] = value;
					}
				}
			}
		};

		this._computed[key] = c;
		this._sortComputedProperties();

		var state = assign({}, this._state);
		var changed = {};
		c.update(state, changed, true);
		this._set(state, changed);
	},

	fire: fire,

	get: get,

	on: on,

	set: function set$$1(newState) {
		var oldState = this._state;
		var changed = this._changed = {};
		var dirty = false;

		for (var key in newState) {
			if (this._computed[key]) { throw new Error(("'" + key + "' is a read-only computed property")); }
			if (this._differs(newState[key], oldState[key])) { changed[key] = dirty = true; }
		}
		if (!dirty) { return; }

		this._set(newState, changed);
	}
});

var Tour = function Tour(options) {
  if ( options === void 0 ) options = {};

  this.options = Object.assign({}, {
    name: uniquestring(),
    showNext: true,
    showPrev: true,
    scenarios: [],
  }, options);

  this.name = this.options.name;
  this.scenarios = this.options.scenarios;

  this.store = new Store({});
  this.elementMap = {};

  if (!this.scenarios || this.scenarios.length === 0) { throw new Error(("Tour " + (this.name) + " was not given any scenarios")); }

  this.register();
};

Tour.prototype.register = function register () {
  Registry.registerTour(this);

  for (var i in this.scenarios) {
    if (!{}.hasOwnProperty.call(this.scenarios, i)) { continue; }

    var scenario = this.scenarios[i];
    if (!scenario.components) {
      throw new Error(("Tour '" + (this.name) + "' scenario #" + (parseInt(i, 10) + 1) + " has no components property. Should be an array"));
    }

    for (var i$1 = 0, list = scenario.components; i$1 < list.length; i$1 += 1) {
      var args = list[i$1];

        var comp = Registry.registerComponent({
        component: args.component,
        args: args,
        name: args.name,
      });

      registerForEvents(args.events, comp);
    }
  }
};

Tour.prototype.start = function start () {
  // We are now the active tour
  Registry.setActiveTour(this);

  // Reset scenario in case //#endregionit was set
  this.scenario = null;

  this.next();
};

Tour.prototype.render = function render (scenario) {
  this.clear();

  // Start the component render chain
  this.renderChain(scenario.components[0], scenario);
};

Tour.prototype.nextComponent = function nextComponent (compArgs, scenario) {
  return scenario.components[scenario.components.indexOf(compArgs) + 1];
};

// NOTE: right now the chain of elements has to be in order; i.e. if component 2 attaches to component 1, component 1
// has to come prior to two in the list of components.
Tour.prototype.renderChain = function renderChain (compArgs, scenario) {
    var this$1 = this;

  var comp = compArgs.component;
  var args = Object.assign({}, compArgs);

  if (typeof (comp) === 'string') {
    comp = ComponentMap[comp];
  }

  if (!comp) { throw new Error(("Component '" + comp + "' unrecognized")); }

  var nextButton = this.isLastScenario(scenario) ?
    { text: 'End', handler: function () { return this$1.clear(); } } :
    { text: 'Next', handler: function () { return this$1.next(); } };

  // Clear out buttons 'cause we're overriding them
  args.buttons = [];
  if (this.options.showPrev && args.showPrev !== false && !this.isFirstScenario(scenario)) {
    args.buttons = [{ text: 'Prev', handler: function () { return this$1.prev(); } } ].concat( (args.buttons || []));
  }
  if (this.options.showNext && args.showNext !== false) {
    args.buttons = (args.buttons || []).concat( [nextButton]);
  }
  args.store = this.store;
  args.name = args.name || uniquestring();

  if (args.attach in this.elementMap) {
    args.attach = this.elementMap[args.attach].refs.el;
  }

  var el = new comp(args);
  Registry.registerInstance({ name: el.get().name, instance: el });

  this.elementMap[el.get().name] = el;

  var next = this.nextComponent(compArgs, scenario);
  if (next) {
    setTimeout(function () { return this$1.renderChain(next, scenario); });
  }
};

Tour.prototype.waitScenario = function waitScenario (scenario) {
    var this$1 = this;

  // Handle wait
  var p = scenario.wait;
  if (p) {
    // Number
    var ms = parseInt(p, 10);
    if (isNaN(ms)) {
      p = waitForTheElement.waitForTheElement(p, {
        timeout: 10000,
      });
    } else {
      p = new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, ms);
      });
    }
  }

  Promise.resolve(p)
    .then(function () {
      this$1.scenario = scenario;
      this$1.render(scenario);
    });
};

Tour.prototype.next = function next () {
  var scenario = this.nextScenario(this.scenario);

  if (!scenario) { return; }

  this.scenario = scenario;

  this.render(this.scenario);

  var nextScenario = this.nextScenario(scenario);
  if (nextScenario && nextScenario.wait) { this.waitScenario(nextScenario); }
};

Tour.prototype.prev = function prev () {
  var scenario = this.prevScenario(this.scenario);

  if (!scenario) { return; }

  this.scenario = scenario;

  this.render(this.scenario);

  var prevScenario = this.prevScenario(scenario);
  if (prevScenario && prevScenario.wait) { this.waitScenario(prevScenario); }
};

Tour.prototype.clear = function clear () {
  // Remove all rendered elements
  for (var i = 0, list = Object.values(this.elementMap); i < list.length; i += 1) {
    var el = list[i];

      el.destroy();
  }

  this.elementMap = {};
};

Tour.prototype.isFirstScenario = function isFirstScenario (scenario) {
  return this.scenarios.indexOf(scenario) === 0;
};

Tour.prototype.isLastScenario = function isLastScenario (scenario) {
  return this.scenarios.indexOf(scenario) === this.scenarios.length - 1;
};

Tour.prototype.nextScenario = function nextScenario (scenario) {
  if (scenario) {
    var curIdx = this.scenarios.indexOf(scenario);

    if (curIdx === -1) {
      return;
    }

    return this.scenarios[curIdx + 1];
  }

  this.clear();
  return this.scenarios[0];
};

Tour.prototype.prevScenario = function prevScenario (scenario) {
  if (scenario) {
    var curIdx = this.scenarios.indexOf(scenario);

    if (curIdx === -1) {
      return;
    }

    return this.scenarios[curIdx - 1];
  }

  this.clear();
  return this.scenarios[0];
};

Tour.prototype.stop = function stop () {
  this.clear();
};

var version = "0.0.13";

var on$2 = PubSub.on;
var fire$2 = PubSub.fire;
var registerComponent$1 = Registry.registerComponent;
var registerTour$1 = Registry.registerTour;

function configure(config) {
  (config.tours || []).forEach(function (t) { return Registry.registerTour(t); });
  // TODO: make sure each component exists
  (config.components || []).forEach(function (c) {
    var comp = Registry.registerComponent(c);
    var args = comp.args || {};
    registerForEvents(args.events, comp);
  });
}

function start(tourName) {
  var tourArgs = Registry.tour(tourName);
  var tour = new Tour(tourArgs);
  Registry.setActiveTour(tour);
  tour.start();
}

// Functions
function next() {
  if (Registry.activeTour()) { Registry.activeTour().next(); }
}

function prev() {
  if (Registry.activeTour()) { Registry.activeTour().prev(); }
}

function stop() {
  if (Registry.activeTour()) { Registry.activeTour().stop(); }
}

function reset$1() {
  PubSub.reset();

  Registry.clear();
}

exports.Registry = Registry;
exports.Tour = Tour;
exports.on = on$2;
exports.fire = fire$2;
exports.registerComponent = registerComponent$1;
exports.registerTour = registerTour$1;
exports.configure = configure;
exports.start = start;
exports.next = next;
exports.prev = prev;
exports.stop = stop;
exports.reset = reset$1;
exports.version = version;
exports.config = config;
exports.Coachmark = Coachmark$1;
exports.Hotspot = Hotspot$1;
exports.Modal = Modal$1;
exports.Tooltip = Tooltip$1;
exports.CoachmarkComponent = Coachmark;
exports.HotspotComponent = Hotspot;
exports.ModalComponent = Modal;
exports.TooltipComponent = Tooltip;
//# sourceMappingURL=onboardist-ui.cjs.js.map
