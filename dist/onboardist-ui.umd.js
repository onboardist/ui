(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Onboardist = global.Onboardist || {}, global.Onboardist.UI = {})));
}(this, (function (exports) { 'use strict';

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

	/*! LeaderLine v1.0.5 (c) anseki https://anseki.github.io/leader-line/ */
	var LeaderLine=function(){var te,g,y,S,_,o,t,h,f,p,a,i,l,v="leader-line",M=1,I=2,C=3,L=4,n={top:M,right:I,bottom:C,left:L},A=1,V=2,P=3,N=4,T=5,m={straight:A,arc:V,fluid:P,magnet:N,grid:T},ne="behind",r=v+"-defs",s='<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="leader-line-defs"><style><![CDATA[.leader-line{position:absolute;overflow:visible!important;pointer-events:none!important;font-size:16px}#leader-line-defs{width:0;height:0;position:absolute;left:0;top:0}.leader-line-line-path{fill:none}.leader-line-mask-bg-rect{fill:#fff}.leader-line-caps-mask-anchor,.leader-line-caps-mask-marker-shape{fill:#000}.leader-line-caps-mask-anchor{stroke:#000}.leader-line-caps-mask-line,.leader-line-plugs-face{stroke:transparent}.leader-line-line-mask-shape{stroke:#fff}.leader-line-line-outline-mask-shape{stroke:#000}.leader-line-plug-mask-shape{fill:#fff;stroke:#000}.leader-line-plug-outline-mask-shape{fill:#000;stroke:#fff}.leader-line-areaAnchor{position:absolute;overflow:visible!important}]]></style><defs><circle id="leader-line-disc" cx="0" cy="0" r="5"/><rect id="leader-line-square" x="-5" y="-5" width="10" height="10"/><polygon id="leader-line-arrow1" points="-8,-8 8,0 -8,8 -5,0"/><polygon id="leader-line-arrow2" points="-4,-8 4,0 -4,8 -7,5 -2,0 -7,-5"/><polygon id="leader-line-arrow3" points="-4,-5 8,0 -4,5"/><g id="leader-line-hand"><path style="fill: #fcfcfc" d="M9.19 11.14h4.75c1.38 0 2.49-1.11 2.49-2.49 0-.51-.15-.98-.41-1.37h1.3c1.38 0 2.49-1.11 2.49-2.49s-1.11-2.53-2.49-2.53h1.02c1.38 0 2.49-1.11 2.49-2.49s-1.11-2.49-2.49-2.49h14.96c1.37 0 2.49-1.11 2.49-2.49s-1.11-2.49-2.49-2.49H16.58C16-9.86 14.28-11.14 9.7-11.14c-4.79 0-6.55 3.42-7.87 4.73H-2.14v13.23h3.68C3.29 9.97 5.47 11.14 9.19 11.14L9.19 11.14Z"/><path style="fill: black" d="M13.95 12c1.85 0 3.35-1.5 3.35-3.35 0-.17-.02-.34-.04-.51h.07c1.85 0 3.35-1.5 3.35-3.35 0-.79-.27-1.51-.72-2.08 1.03-.57 1.74-1.67 1.74-2.93 0-.59-.16-1.15-.43-1.63h12.04c1.85 0 3.35-1.5 3.35-3.35 0-1.85-1.5-3.35-3.35-3.35H17.2C16.26-10.93 13.91-12 9.7-12 5.36-12 3.22-9.4 1.94-7.84c0 0-.29.33-.5.57-.63 0-3.58 0-3.58 0C-2.61-7.27-3-6.88-3-6.41v13.23c0 .47.39.86.86.86 0 0 2.48 0 3.2 0C2.9 10.73 5.29 12 9.19 12L13.95 12ZM9.19 10.28c-3.46 0-5.33-1.05-6.9-3.87-.15-.27-.44-.44-.75-.44 0 0-1.81 0-2.82 0V-5.55c1.06 0 3.11 0 3.11 0 .25 0 .44-.06.61-.25l.83-.95c1.23-1.49 2.91-3.53 6.43-3.53 3.45 0 4.9.74 5.57 1.72h-4.3c-.48 0-.86.38-.86.86s.39.86.86.86h22.34c.9 0 1.63.73 1.63 1.63 0 .9-.73 1.63-1.63 1.63H15.83c-.48 0-.86.38-.86.86 0 .47.39.86.86.86h2.52c.9 0 1.63.73 1.63 1.63s-.73 1.63-1.63 1.63h-3.12c-.48 0-.86.38-.86.86 0 .47.39.86.86.86h2.11c.88 0 1.63.76 1.63 1.67 0 .9-.73 1.63-1.63 1.63h-3.2c-.48 0-.86.39-.86.86 0 .47.39.86.86.86h1.36c.05.16.09.34.09.51 0 .9-.73 1.63-1.63 1.63C13.95 10.28 9.19 10.28 9.19 10.28Z"/></g><g id="leader-line-crosshair"><path d="M0-78.97c-43.54 0-78.97 35.43-78.97 78.97 0 43.54 35.43 78.97 78.97 78.97s78.97-35.43 78.97-78.97C78.97-43.54 43.55-78.97 0-78.97ZM76.51-1.21h-9.91v-9.11h-2.43v9.11h-11.45c-.64-28.12-23.38-50.86-51.5-51.5V-64.17h9.11V-66.6h-9.11v-9.91C42.46-75.86 75.86-42.45 76.51-1.21ZM-1.21-30.76h-9.11v2.43h9.11V-4.2c-1.44.42-2.57 1.54-2.98 2.98H-28.33v-9.11h-2.43v9.11H-50.29C-49.65-28-27.99-49.65-1.21-50.29V-30.76ZM-30.76 1.21v9.11h2.43v-9.11H-4.2c.42 1.44 1.54 2.57 2.98 2.98v24.13h-9.11v2.43h9.11v19.53C-27.99 49.65-49.65 28-50.29 1.21H-30.76ZM1.22 30.75h9.11v-2.43h-9.11V4.2c1.44-.42 2.56-1.54 2.98-2.98h24.13v9.11h2.43v-9.11h19.53C49.65 28 28 49.65 1.22 50.29V30.75ZM30.76-1.21v-9.11h-2.43v9.11H4.2c-.42-1.44-1.54-2.56-2.98-2.98V-28.33h9.11v-2.43h-9.11V-50.29C28-49.65 49.65-28 50.29-1.21H30.76ZM-1.21-76.51v9.91h-9.11v2.43h9.11v11.45c-28.12.64-50.86 23.38-51.5 51.5H-64.17v-9.11H-66.6v9.11h-9.91C-75.86-42.45-42.45-75.86-1.21-76.51ZM-76.51 1.21h9.91v9.11h2.43v-9.11h11.45c.64 28.12 23.38 50.86 51.5 51.5v11.45h-9.11v2.43h9.11v9.91C-42.45 75.86-75.86 42.45-76.51 1.21ZM1.22 76.51v-9.91h9.11v-2.43h-9.11v-11.45c28.12-.64 50.86-23.38 51.5-51.5h11.45v9.11h2.43v-9.11h9.91C75.86 42.45 42.45 75.86 1.22 76.51Z"/><path d="M0 83.58-7.1 96 7.1 96Z"/><path d="M0-83.58 7.1-96-7.1-96"/><path d="M83.58 0 96 7.1 96-7.1Z"/><path d="M-83.58 0-96-7.1-96 7.1Z"/></g></defs></svg>',ae={disc:{elmId:"leader-line-disc",noRotate:!0,bBox:{left:-5,top:-5,width:10,height:10,right:5,bottom:5},widthR:2.5,heightR:2.5,bCircle:5,sideLen:5,backLen:5,overhead:0,outlineBase:1,outlineMax:4},square:{elmId:"leader-line-square",noRotate:!0,bBox:{left:-5,top:-5,width:10,height:10,right:5,bottom:5},widthR:2.5,heightR:2.5,bCircle:5,sideLen:5,backLen:5,overhead:0,outlineBase:1,outlineMax:4},arrow1:{elmId:"leader-line-arrow1",bBox:{left:-8,top:-8,width:16,height:16,right:8,bottom:8},widthR:4,heightR:4,bCircle:8,sideLen:8,backLen:8,overhead:8,outlineBase:2,outlineMax:1.5},arrow2:{elmId:"leader-line-arrow2",bBox:{left:-7,top:-8,width:11,height:16,right:4,bottom:8},widthR:2.75,heightR:4,bCircle:8,sideLen:8,backLen:7,overhead:4,outlineBase:1,outlineMax:1.75},arrow3:{elmId:"leader-line-arrow3",bBox:{left:-4,top:-5,width:12,height:10,right:8,bottom:5},widthR:3,heightR:2.5,bCircle:8,sideLen:5,backLen:4,overhead:8,outlineBase:1,outlineMax:2.5},hand:{elmId:"leader-line-hand",bBox:{left:-3,top:-12,width:40,height:24,right:37,bottom:12},widthR:10,heightR:6,bCircle:37,sideLen:12,backLen:3,overhead:37},crosshair:{elmId:"leader-line-crosshair",noRotate:!0,bBox:{left:-96,top:-96,width:192,height:192,right:96,bottom:96},widthR:48,heightR:48,bCircle:96,sideLen:96,backLen:96,overhead:0}},E={behind:ne,disc:"disc",square:"square",arrow1:"arrow1",arrow2:"arrow2",arrow3:"arrow3",hand:"hand",crosshair:"crosshair"},ie={disc:"disc",square:"square",arrow1:"arrow1",arrow2:"arrow2",arrow3:"arrow3",hand:"hand",crosshair:"crosshair"},W=[M,I,C,L],x="auto",oe={x:"left",y:"top",width:"width",height:"height"},B=80,R=4,F=5,G=120,D=8,z=3.75,j=10,H=30,U=.5522847,Z=.25*Math.PI,u=/^\s*(\-?[\d\.]+)\s*(\%)?\s*$/,b="http://www.w3.org/2000/svg",e="-ms-scroll-limit"in document.documentElement.style&&"-ms-ime-align"in document.documentElement.style&&!window.navigator.msPointerEnabled,le=!e&&!!document.uniqueID,re="MozAppearance"in document.documentElement.style,se=!(e||re||!window.chrome||!window.CSS),ue=!e&&!le&&!re&&!se&&!window.chrome&&"WebkitAppearance"in document.documentElement.style,he=le||e?.2:.1,pe={path:P,lineColor:"coral",lineSize:4,plugSE:[ne,"arrow1"],plugSizeSE:[1,1],lineOutlineEnabled:!1,lineOutlineColor:"indianred",lineOutlineSize:.25,plugOutlineEnabledSE:[!1,!1],plugOutlineSizeSE:[1,1]},k=(a={}.toString,i={}.hasOwnProperty.toString,l=i.call(Object),function(e){var t,n;return e&&"[object Object]"===a.call(e)&&(!(t=Object.getPrototypeOf(e))||(n=t.hasOwnProperty("constructor")&&t.constructor)&&"function"==typeof n&&i.call(n)===l)}),w=Number.isFinite||function(e){return "number"==typeof e&&window.isFinite(e)},c=function(){var e,x={ease:[.25,.1,.25,1],linear:[0,0,1,1],"ease-in":[.42,0,1,1],"ease-out":[0,0,.58,1],"ease-in-out":[.42,0,.58,1]},b=1e3/60/2,t=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||function(e){setTimeout(e,b);},n=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame||function(e){clearTimeout(e);},a=Number.isFinite||function(e){return "number"==typeof e&&window.isFinite(e)},k=[],w=0;function l(){var i=Date.now(),o=!1;e&&(n.call(window,e),e=null),k.forEach(function(e){var t,n,a;if(e.framesStart){if((t=i-e.framesStart)>=e.duration&&e.count&&e.loopsLeft<=1){ return a=e.frames[e.lastFrame=e.reverse?0:e.frames.length-1],e.frameCallback(a.value,!0,a.timeRatio,a.outputRatio),void(e.framesStart=null); }if(t>e.duration){if(n=Math.floor(t/e.duration),e.count){if(n>=e.loopsLeft){ return a=e.frames[e.lastFrame=e.reverse?0:e.frames.length-1],e.frameCallback(a.value,!0,a.timeRatio,a.outputRatio),void(e.framesStart=null); }e.loopsLeft-=n;}e.framesStart+=e.duration*n,t=i-e.framesStart;}e.reverse&&(t=e.duration-t),a=e.frames[e.lastFrame=Math.round(t/b)],!1!==e.frameCallback(a.value,!1,a.timeRatio,a.outputRatio)?o=!0:e.framesStart=null;}}),o&&(e=t.call(window,l));}function O(e,t){e.framesStart=Date.now(),null!=t&&(e.framesStart-=e.duration*(e.reverse?1-t:t)),e.loopsLeft=e.count,e.lastFrame=null,l();}return {add:function(n,e,t,a,i,o,l){var r,s,u,h,p,c,d,f,y,S,m,g,_,v=++w;function E(e,t){return {value:n(t),timeRatio:e,outputRatio:t}}if("string"==typeof i&&(i=x[i]),n=n||function(){},t<b){ s=[E(0,0),E(1,1)]; }else{if(u=b/t,s=[E(0,0)],0===i[0]&&0===i[1]&&1===i[2]&&1===i[3]){ for(p=u;p<=1;p+=u){ s.push(E(p,p)); } }else { for(c=h=(p=u)/10;c<=1;c+=h){ S=(y=(f=c)*f)*f,_=3*(m=1-f)*y,p<=(d={x:(g=3*(m*m)*f)*i[0]+_*i[2]+S,y:g*i[1]+_*i[3]+S}).x&&(s.push(E(d.x,d.y)),p+=u); } }s.push(E(1,1));}return r={animId:v,frameCallback:e,duration:t,count:a,frames:s,reverse:!!o},k.push(r),!1!==l&&O(r,l),v},remove:function(n){var a;k.some(function(e,t){return e.animId===n&&(a=t,!(e.framesStart=null))})&&k.splice(a,1);},start:function(t,n,a){k.some(function(e){return e.animId===t&&(e.reverse=!!n,O(e,a),!0)});},stop:function(t,n){var a;return k.some(function(e){return e.animId===t&&(n?null!=e.lastFrame&&(a=e.frames[e.lastFrame].timeRatio):(a=(Date.now()-e.framesStart)/e.duration,e.reverse&&(a=1-a),a<0?a=0:1<a&&(a=1)),!(e.framesStart=null))}),a},validTiming:function(t){return "string"==typeof t?x[t]:Array.isArray(t)&&[0,1,2,3].every(function(e){return a(t[e])&&0<=t[e]&&t[e]<=1})?[t[0],t[1],t[2],t[3]]:null}}}(),d=function(e){e.SVGPathElement.prototype.getPathData&&e.SVGPathElement.prototype.setPathData||function(){var i={Z:"Z",M:"M",L:"L",C:"C",Q:"Q",A:"A",H:"H",V:"V",S:"S",T:"T",z:"Z",m:"m",l:"l",c:"c",q:"q",a:"a",h:"h",v:"v",s:"s",t:"t"},o=function(e){this._string=e,this._currentIndex=0,this._endIndex=this._string.length,this._prevCommand=null,this._skipOptionalSpaces();},l=-1!==e.navigator.userAgent.indexOf("MSIE ");o.prototype={parseSegment:function(){var e=this._string[this._currentIndex],t=i[e]?i[e]:null;if(null===t){if(null===this._prevCommand){ return null; }if(null===(t=("+"===e||"-"===e||"."===e||"0"<=e&&e<="9")&&"Z"!==this._prevCommand?"M"===this._prevCommand?"L":"m"===this._prevCommand?"l":this._prevCommand:null)){ return null }}else { this._currentIndex+=1; }var n=null,a=(this._prevCommand=t).toUpperCase();return "H"===a||"V"===a?n=[this._parseNumber()]:"M"===a||"L"===a||"T"===a?n=[this._parseNumber(),this._parseNumber()]:"S"===a||"Q"===a?n=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"C"===a?n=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"A"===a?n=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseArcFlag(),this._parseArcFlag(),this._parseNumber(),this._parseNumber()]:"Z"===a&&(this._skipOptionalSpaces(),n=[]),null===n||0<=n.indexOf(null)?null:{type:t,values:n}},hasMoreData:function(){return this._currentIndex<this._endIndex},peekSegmentType:function(){var e=this._string[this._currentIndex];return i[e]?i[e]:null},initialCommandIsMoveTo:function(){if(!this.hasMoreData()){ return !0; }var e=this.peekSegmentType();return "M"===e||"m"===e},_isCurrentSpace:function(){var e=this._string[this._currentIndex];return e<=" "&&(" "===e||"\n"===e||"\t"===e||"\r"===e||"\f"===e)},_skipOptionalSpaces:function(){for(;this._currentIndex<this._endIndex&&this._isCurrentSpace();){ this._currentIndex+=1; }return this._currentIndex<this._endIndex},_skipOptionalSpacesOrDelimiter:function(){return !(this._currentIndex<this._endIndex&&!this._isCurrentSpace()&&","!==this._string[this._currentIndex])&&(this._skipOptionalSpaces()&&this._currentIndex<this._endIndex&&","===this._string[this._currentIndex]&&(this._currentIndex+=1,this._skipOptionalSpaces()),this._currentIndex<this._endIndex)},_parseNumber:function(){var e=0,t=0,n=1,a=0,i=1,o=1,l=this._currentIndex;if(this._skipOptionalSpaces(),this._currentIndex<this._endIndex&&"+"===this._string[this._currentIndex]?this._currentIndex+=1:this._currentIndex<this._endIndex&&"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,i=-1),this._currentIndex===this._endIndex||(this._string[this._currentIndex]<"0"||"9"<this._string[this._currentIndex])&&"."!==this._string[this._currentIndex]){ return null; }for(var r=this._currentIndex;this._currentIndex<this._endIndex&&"0"<=this._string[this._currentIndex]&&this._string[this._currentIndex]<="9";){ this._currentIndex+=1; }if(this._currentIndex!==r){ for(var s=this._currentIndex-1,u=1;r<=s;){ t+=u*(this._string[s]-"0"),s-=1,u*=10; } }if(this._currentIndex<this._endIndex&&"."===this._string[this._currentIndex]){if(this._currentIndex+=1,this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||"9"<this._string[this._currentIndex]){ return null; }for(;this._currentIndex<this._endIndex&&"0"<=this._string[this._currentIndex]&&this._string[this._currentIndex]<="9";){ n*=10,a+=(this._string.charAt(this._currentIndex)-"0")/n,this._currentIndex+=1; }}if(this._currentIndex!==l&&this._currentIndex+1<this._endIndex&&("e"===this._string[this._currentIndex]||"E"===this._string[this._currentIndex])&&"x"!==this._string[this._currentIndex+1]&&"m"!==this._string[this._currentIndex+1]){if(this._currentIndex+=1,"+"===this._string[this._currentIndex]?this._currentIndex+=1:"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,o=-1),this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||"9"<this._string[this._currentIndex]){ return null; }for(;this._currentIndex<this._endIndex&&"0"<=this._string[this._currentIndex]&&this._string[this._currentIndex]<="9";){ e*=10,e+=this._string[this._currentIndex]-"0",this._currentIndex+=1; }}var h=t+a;return h*=i,e&&(h*=Math.pow(10,o*e)),l===this._currentIndex?null:(this._skipOptionalSpacesOrDelimiter(),h)},_parseArcFlag:function(){if(this._currentIndex>=this._endIndex){ return null; }var e=null,t=this._string[this._currentIndex];if(this._currentIndex+=1,"0"===t){ e=0; }else{if("1"!==t){ return null; }e=1;}return this._skipOptionalSpacesOrDelimiter(),e}};var a=function(e){if(!e||0===e.length){ return []; }var t=new o(e),n=[];if(t.initialCommandIsMoveTo()){ for(;t.hasMoreData();){var a=t.parseSegment();if(null===a){ break; }n.push(a);} }return n},n=e.SVGPathElement.prototype.setAttribute,r=e.SVGPathElement.prototype.removeAttribute,d=e.Symbol?e.Symbol():"__cachedPathData",f=e.Symbol?e.Symbol():"__cachedNormalizedPathData",U=function(e,t,n,a,i,o,l,r,s,u){var h,p,c,d,f,y=function(e,t,n){return {x:e*Math.cos(n)-t*Math.sin(n),y:e*Math.sin(n)+t*Math.cos(n)}},S=(h=l,Math.PI*h/180),m=[];if(u){ p=u[0],c=u[1],d=u[2],f=u[3]; }else{var g=y(e,t,-S);e=g.x,t=g.y;var _=y(n,a,-S),v=(e-(n=_.x))/2,E=(t-(a=_.y))/2,x=v*v/(i*i)+E*E/(o*o);1<x&&(i*=x=Math.sqrt(x),o*=x);var b=i*i,k=o*o,w=b*k-b*E*E-k*v*v,O=b*E*E+k*v*v,M=(r===s?-1:1)*Math.sqrt(Math.abs(w/O));d=M*i*E/o+(e+n)/2,f=M*-o*v/i+(t+a)/2,p=Math.asin(parseFloat(((t-f)/o).toFixed(9))),c=Math.asin(parseFloat(((a-f)/o).toFixed(9))),e<d&&(p=Math.PI-p),n<d&&(c=Math.PI-c),p<0&&(p=2*Math.PI+p),c<0&&(c=2*Math.PI+c),s&&c<p&&(p-=2*Math.PI),!s&&p<c&&(c-=2*Math.PI);}var I=c-p;if(Math.abs(I)>120*Math.PI/180){var C=c,L=n,A=a;c=s&&p<c?p+120*Math.PI/180*1:p+120*Math.PI/180*-1,n=d+i*Math.cos(c),a=f+o*Math.sin(c),m=U(n,a,L,A,i,o,l,0,s,[c,C,d,f]);}I=c-p;var V=Math.cos(p),P=Math.sin(p),N=Math.cos(c),T=Math.sin(c),W=Math.tan(I/4),B=4/3*i*W,R=4/3*o*W,F=[e,t],G=[e+B*P,t-R*V],D=[n+B*T,a-R*N],z=[n,a];if(G[0]=2*F[0]-G[0],G[1]=2*F[1]-G[1],u){ return [G,D,z].concat(m); }m=[G,D,z].concat(m).join().split(",");var j=[],H=[];return m.forEach(function(e,t){t%2?H.push(y(m[t-1],m[t],S).y):H.push(y(m[t],m[t+1],S).x),6===H.length&&(j.push(H),H=[]);}),j},y=function(e){return e.map(function(e){return {type:e.type,values:Array.prototype.slice.call(e.values)}})},S=function(e){var S=[],m=null,g=null,_=null,v=null,E=null,x=null,b=null;return e.forEach(function(e){if("M"===e.type){var t=e.values[0],n=e.values[1];S.push({type:"M",values:[t,n]}),v=x=t,E=b=n;}else if("C"===e.type){var a=e.values[0],i=e.values[1],o=e.values[2],l=e.values[3];t=e.values[4],n=e.values[5];S.push({type:"C",values:[a,i,o,l,t,n]}),g=o,_=l,v=t,E=n;}else if("L"===e.type){t=e.values[0],n=e.values[1];S.push({type:"L",values:[t,n]}),v=t,E=n;}else if("H"===e.type){t=e.values[0];S.push({type:"L",values:[t,E]}),v=t;}else if("V"===e.type){n=e.values[0];S.push({type:"L",values:[v,n]}),E=n;}else if("S"===e.type){o=e.values[0],l=e.values[1],t=e.values[2],n=e.values[3];"C"===m||"S"===m?(r=v+(v-g),s=E+(E-_)):(r=v,s=E),S.push({type:"C",values:[r,s,o,l,t,n]}),g=o,_=l,v=t,E=n;}else if("T"===e.type){t=e.values[0],n=e.values[1];"Q"===m||"T"===m?(a=v+(v-g),i=E+(E-_)):(a=v,i=E);var r=v+2*(a-v)/3,s=E+2*(i-E)/3,u=t+2*(a-t)/3,h=n+2*(i-n)/3;S.push({type:"C",values:[r,s,u,h,t,n]}),g=a,_=i,v=t,E=n;}else if("Q"===e.type){a=e.values[0],i=e.values[1],t=e.values[2],n=e.values[3],r=v+2*(a-v)/3,s=E+2*(i-E)/3,u=t+2*(a-t)/3,h=n+2*(i-n)/3;S.push({type:"C",values:[r,s,u,h,t,n]}),g=a,_=i,v=t,E=n;}else if("A"===e.type){var p=e.values[0],c=e.values[1],d=e.values[2],f=e.values[3],y=e.values[4];t=e.values[5],n=e.values[6];if(0===p||0===c){ S.push({type:"C",values:[v,E,t,n,t,n]}),v=t,E=n; }else if(v!==t||E!==n){ U(v,E,t,n,p,c,d,f,y).forEach(function(e){S.push({type:"C",values:e}),v=t,E=n;}); }}else{ "Z"===e.type&&(S.push(e),v=x,E=b); }m=e.type;}),S};e.SVGPathElement.prototype.setAttribute=function(e,t){"d"===e&&(this[d]=null,this[f]=null),n.call(this,e,t);},e.SVGPathElement.prototype.removeAttribute=function(e,t){"d"===e&&(this[d]=null,this[f]=null),r.call(this,e);},e.SVGPathElement.prototype.getPathData=function(e){if(e&&e.normalize){if(this[f]){ return y(this[f]); }this[d]?n=y(this[d]):(n=a(this.getAttribute("d")||""),this[d]=y(n));var t=S((s=[],c=p=h=u=null,n.forEach(function(e){var t=e.type;if("M"===t){var n=e.values[0],a=e.values[1];s.push({type:"M",values:[n,a]}),u=p=n,h=c=a;}else if("m"===t){ n=u+e.values[0],a=h+e.values[1],s.push({type:"M",values:[n,a]}),u=p=n,h=c=a; }else if("L"===t){ n=e.values[0],a=e.values[1],s.push({type:"L",values:[n,a]}),u=n,h=a; }else if("l"===t){ n=u+e.values[0],a=h+e.values[1],s.push({type:"L",values:[n,a]}),u=n,h=a; }else if("C"===t){var i=e.values[0],o=e.values[1],l=e.values[2],r=e.values[3];n=e.values[4],a=e.values[5],s.push({type:"C",values:[i,o,l,r,n,a]}),u=n,h=a;}else{ "c"===t?(i=u+e.values[0],o=h+e.values[1],l=u+e.values[2],r=h+e.values[3],n=u+e.values[4],a=h+e.values[5],s.push({type:"C",values:[i,o,l,r,n,a]}),u=n,h=a):"Q"===t?(i=e.values[0],o=e.values[1],n=e.values[2],a=e.values[3],s.push({type:"Q",values:[i,o,n,a]}),u=n,h=a):"q"===t?(i=u+e.values[0],o=h+e.values[1],n=u+e.values[2],a=h+e.values[3],s.push({type:"Q",values:[i,o,n,a]}),u=n,h=a):"A"===t?(n=e.values[5],a=e.values[6],s.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],n,a]}),u=n,h=a):"a"===t?(n=u+e.values[5],a=h+e.values[6],s.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],n,a]}),u=n,h=a):"H"===t?(n=e.values[0],s.push({type:"H",values:[n]}),u=n):"h"===t?(n=u+e.values[0],s.push({type:"H",values:[n]}),u=n):"V"===t?(a=e.values[0],s.push({type:"V",values:[a]}),h=a):"v"===t?(a=h+e.values[0],s.push({type:"V",values:[a]}),h=a):"S"===t?(l=e.values[0],r=e.values[1],n=e.values[2],a=e.values[3],s.push({type:"S",values:[l,r,n,a]}),u=n,h=a):"s"===t?(l=u+e.values[0],r=h+e.values[1],n=u+e.values[2],a=h+e.values[3],s.push({type:"S",values:[l,r,n,a]}),u=n,h=a):"T"===t?(n=e.values[0],a=e.values[1],s.push({type:"T",values:[n,a]}),u=n,h=a):"t"===t?(n=u+e.values[0],a=h+e.values[1],s.push({type:"T",values:[n,a]}),u=n,h=a):"Z"!==t&&"z"!==t||(s.push({type:"Z",values:[]}),u=p,h=c); }}),s));return this[f]=y(t),t}if(this[d]){ return y(this[d]); }var s,u,h,p,c,n=a(this.getAttribute("d")||"");return this[d]=y(n),n},e.SVGPathElement.prototype.setPathData=function(e){if(0===e.length){ l?this.setAttribute("d",""):this.removeAttribute("d"); }else{for(var t="",n=0,a=e.length;n<a;n+=1){var i=e[n];0<n&&(t+=" "),t+=i.type,i.values&&0<i.values.length&&(t+=" "+i.values.join(" "));}this.setAttribute("d",t);}},e.SVGRectElement.prototype.getPathData=function(e){var t=this.x.baseVal.value,n=this.y.baseVal.value,a=this.width.baseVal.value,i=this.height.baseVal.value,o=this.hasAttribute("rx")?this.rx.baseVal.value:this.ry.baseVal.value,l=this.hasAttribute("ry")?this.ry.baseVal.value:this.rx.baseVal.value;a/2<o&&(o=a/2),i/2<l&&(l=i/2);var r=[{type:"M",values:[t+o,n]},{type:"H",values:[t+a-o]},{type:"A",values:[o,l,0,0,1,t+a,n+l]},{type:"V",values:[n+i-l]},{type:"A",values:[o,l,0,0,1,t+a-o,n+i]},{type:"H",values:[t+o]},{type:"A",values:[o,l,0,0,1,t,n+i-l]},{type:"V",values:[n+l]},{type:"A",values:[o,l,0,0,1,t+o,n]},{type:"Z",values:[]}];return r=r.filter(function(e){return "A"!==e.type||0!==e.values[0]&&0!==e.values[1]}),e&&!0===e.normalize&&(r=S(r)),r},e.SVGCircleElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,n=this.cy.baseVal.value,a=this.r.baseVal.value,i=[{type:"M",values:[t+a,n]},{type:"A",values:[a,a,0,0,1,t,n+a]},{type:"A",values:[a,a,0,0,1,t-a,n]},{type:"A",values:[a,a,0,0,1,t,n-a]},{type:"A",values:[a,a,0,0,1,t+a,n]},{type:"Z",values:[]}];return e&&!0===e.normalize&&(i=S(i)),i},e.SVGEllipseElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,n=this.cy.baseVal.value,a=this.rx.baseVal.value,i=this.ry.baseVal.value,o=[{type:"M",values:[t+a,n]},{type:"A",values:[a,i,0,0,1,t,n+i]},{type:"A",values:[a,i,0,0,1,t-a,n]},{type:"A",values:[a,i,0,0,1,t,n-i]},{type:"A",values:[a,i,0,0,1,t+a,n]},{type:"Z",values:[]}];return e&&!0===e.normalize&&(o=S(o)),o},e.SVGLineElement.prototype.getPathData=function(){return [{type:"M",values:[this.x1.baseVal.value,this.y1.baseVal.value]},{type:"L",values:[this.x2.baseVal.value,this.y2.baseVal.value]}]},e.SVGPolylineElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var n=this.points.getItem(t);e.push({type:0===t?"M":"L",values:[n.x,n.y]});}return e},e.SVGPolygonElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var n=this.points.getItem(t);e.push({type:0===t?"M":"L",values:[n.x,n.y]});}return e.push({type:"Z",values:[]}),e};}();},O=function(n){var a={};function i(e){if(a[e]){ return a[e].exports; }var t=a[e]={i:e,l:!1,exports:{}};return n[e].call(t.exports,t,t.exports,i),t.l=!0,t.exports}return i.m=n,i.c=a,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n});},i.r=function(e){Object.defineProperty(e,"__esModule",{value:!0});},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,n){n.r(t);var a=500,i=[],o=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||function(e){return setTimeout(e,1e3/60)},l=window.cancelAnimationFrame||window.mozCancelAnimationFrame||window.webkitCancelAnimationFrame||window.msCancelAnimationFrame||function(e){return clearTimeout(e)},r=void 0,s=Date.now();function u(){var t=void 0,e=void 0;r&&(l.call(window,r),r=null),i.forEach(function(e){e.event&&(e.listener(e.event),e.event=null,t=!0);}),t?(s=Date.now(),e=!0):Date.now()-s<a&&(e=!0),e&&(r=o.call(window,u));}function h(n){var a=-1;return i.some(function(e,t){return e.listener===n&&(a=t,!0)}),a}var p={add:function(e){var t=void 0;return -1===h(e)?(i.push(t={listener:e}),function(e){t.event=e,r||u();}):null},remove:function(e){var t;-1<(t=h(e))&&(i.splice(t,1),!i.length&&r&&(l.call(window,r),r=null));}};t.default=p;}]).default,Y={line_altColor:{iniValue:!1},line_color:{},line_colorTra:{iniValue:!1},line_strokeWidth:{},plug_enabled:{iniValue:!1},plug_enabledSE:{hasSE:!0,iniValue:!1},plug_plugSE:{hasSE:!0,iniValue:ne},plug_colorSE:{hasSE:!0},plug_colorTraSE:{hasSE:!0,iniValue:!1},plug_markerWidthSE:{hasSE:!0},plug_markerHeightSE:{hasSE:!0},lineOutline_enabled:{iniValue:!1},lineOutline_color:{},lineOutline_colorTra:{iniValue:!1},lineOutline_strokeWidth:{},lineOutline_inStrokeWidth:{},plugOutline_enabledSE:{hasSE:!0,iniValue:!1},plugOutline_plugSE:{hasSE:!0,iniValue:ne},plugOutline_colorSE:{hasSE:!0},plugOutline_colorTraSE:{hasSE:!0,iniValue:!1},plugOutline_strokeWidthSE:{hasSE:!0},plugOutline_inStrokeWidthSE:{hasSE:!0},position_socketXYSE:{hasSE:!0,hasProps:!0},position_plugOverheadSE:{hasSE:!0},position_path:{},position_lineStrokeWidth:{},position_socketGravitySE:{hasSE:!0},path_pathData:{},path_edge:{hasProps:!0},viewBox_bBox:{hasProps:!0},viewBox_plugBCircleSE:{hasSE:!0},lineMask_enabled:{iniValue:!1},lineMask_outlineMode:{iniValue:!1},lineMask_x:{},lineMask_y:{},lineOutlineMask_x:{},lineOutlineMask_y:{},maskBGRect_x:{},maskBGRect_y:{},capsMaskAnchor_enabledSE:{hasSE:!0,iniValue:!1},capsMaskAnchor_pathDataSE:{hasSE:!0},capsMaskAnchor_strokeWidthSE:{hasSE:!0},capsMaskMarker_enabled:{iniValue:!1},capsMaskMarker_enabledSE:{hasSE:!0,iniValue:!1},capsMaskMarker_plugSE:{hasSE:!0,iniValue:ne},capsMaskMarker_markerWidthSE:{hasSE:!0},capsMaskMarker_markerHeightSE:{hasSE:!0},caps_enabled:{iniValue:!1},attach_plugSideLenSE:{hasSE:!0},attach_plugBackLenSE:{hasSE:!0}},X={show_on:{},show_effect:{},show_animOptions:{},show_animId:{},show_inAnim:{}},q="fade",Q=[],K={},J=0,$={},ee=0;function ce(t,n){var e,a;return typeof t!=typeof n||(e=k(t)?"obj":Array.isArray(t)?"array":"")!=(k(n)?"obj":Array.isArray(n)?"array":"")||("obj"===e?ce(a=Object.keys(t).sort(),Object.keys(n).sort())||a.some(function(e){return ce(t[e],n[e])}):"array"===e?t.length!==n.length||t.some(function(e,t){return ce(e,n[t])}):t!==n)}function de(n){return n?k(n)?Object.keys(n).reduce(function(e,t){return e[t]=de(n[t]),e},{}):Array.isArray(n)?n.map(de):n:n}function fe(e){var t,n,a,i=1,o=e=(e+"").trim();function l(e){var t=1,n=u.exec(e);return n&&(t=parseFloat(n[1]),n[2]?t=0<=t&&t<=100?t/100:1:(t<0||1<t)&&(t=1)),t}return (t=/^(rgba|hsla|hwb|gray|device\-cmyk)\s*\(([\s\S]+)\)$/i.exec(e))?(n=t[1].toLowerCase(),a=t[2].trim().split(/\s*,\s*/),"rgba"===n&&4===a.length?(i=l(a[3]),o="rgb("+a.slice(0,3).join(", ")+")"):"hsla"===n&&4===a.length?(i=l(a[3]),o="hsl("+a.slice(0,3).join(", ")+")"):"hwb"===n&&4===a.length?(i=l(a[3]),o="hwb("+a.slice(0,3).join(", ")+")"):"gray"===n&&2===a.length?(i=l(a[1]),o="gray("+a[0]+")"):"device-cmyk"===n&&5<=a.length&&(i=l(a[4]),o="device-cmyk("+a.slice(0,4).join(", ")+")")):(t=/^\#(?:([\da-f]{6})([\da-f]{2})|([\da-f]{3})([\da-f]))$/i.exec(e))?t[1]?(i=parseInt(t[2],16)/255,o="#"+t[1]):(i=parseInt(t[4]+t[4],16)/255,o="#"+t[3]):"transparent"===e.toLocaleLowerCase()&&(i=0),[i,o]}function ye(e){return !(!e||e.nodeType!==Node.ELEMENT_NODE||"function"!=typeof e.getBoundingClientRect)}function Se(e,t){var n,a,i,o,l={};if(!(i=e.ownerDocument)){ return console.error("Cannot get document that contains the element."),null; }if(e.compareDocumentPosition(i)&Node.DOCUMENT_POSITION_DISCONNECTED){ return console.error("A disconnected element was passed."),null; }for(a in n=e.getBoundingClientRect()){ l[a]=n[a]; }if(!t){if(!(o=i.defaultView)){ return console.error("Cannot get window that contains the element."),null; }l.left+=o.pageXOffset,l.right+=o.pageXOffset,l.top+=o.pageYOffset,l.bottom+=o.pageYOffset;}return l}function me(e,t){var n,a,i=[],o=e;for(t=t||window;;){if(!(n=o.ownerDocument)){ return console.error("Cannot get document that contains the element."),null; }if(!(a=n.defaultView)){ return console.error("Cannot get window that contains the element."),null; }if(a===t){ break; }if(!(o=a.frameElement)){ return console.error("`baseWindow` was not found."),null; }i.unshift(o);}return i}function ge(e,t){var n,a,o=0,l=0;return (a=me(e,t=t||window))?a.length?(a.forEach(function(e,t){var n,a,i=Se(e,0<t);o+=i.left,l+=i.top,a=(n=e).ownerDocument.defaultView.getComputedStyle(n,""),i={left:n.clientLeft+parseFloat(a.paddingLeft),top:n.clientTop+parseFloat(a.paddingTop)},o+=i.left,l+=i.top;}),(n=Se(e,!0)).left+=o,n.right+=o,n.top+=l,n.bottom+=l,n):Se(e):null}function _e(e,t){var n=e.x-t.x,a=e.y-t.y;return Math.sqrt(n*n+a*a)}function ve(e,t,n){var a=t.x-e.x,i=t.y-e.y;return {x:e.x+a*n,y:e.y+i*n,angle:Math.atan2(i,a)/(Math.PI/180)}}function Ee(e,t,n){var a=Math.atan2(e.y-t.y,t.x-e.x);return {x:t.x+Math.cos(a)*n,y:t.y+Math.sin(a)*n*-1}}function xe(e,t,n,a,i){var o=i*i,l=o*i,r=1-i,s=r*r,u=s*r,h=u*e.x+3*s*i*t.x+3*r*o*n.x+l*a.x,p=u*e.y+3*s*i*t.y+3*r*o*n.y+l*a.y,c=e.x+2*i*(t.x-e.x)+o*(n.x-2*t.x+e.x),d=e.y+2*i*(t.y-e.y)+o*(n.y-2*t.y+e.y),f=t.x+2*i*(n.x-t.x)+o*(a.x-2*n.x+t.x),y=t.y+2*i*(n.y-t.y)+o*(a.y-2*n.y+t.y),S=r*e.x+i*t.x,m=r*e.y+i*t.y,g=r*n.x+i*a.x,_=r*n.y+i*a.y,v=90-180*Math.atan2(c-f,d-y)/Math.PI;return {x:h,y:p,fromP2:{x:c,y:d},toP1:{x:f,y:y},fromP1:{x:S,y:m},toP2:{x:g,y:_},angle:v+=180<v?-180:180}}function be(n,a,i,o,e){function l(e,t,n,a,i){return e*(e*(-3*t+9*n-9*a+3*i)+6*t-12*n+6*a)-3*t+3*n}var r,s,u,h,p,c=[.2491,.2491,.2335,.2335,.2032,.2032,.1601,.1601,.1069,.1069,.0472,.0472],d=0;return r=(e=null==e||1<e?1:e<0?0:e)/2,[-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816].forEach(function(e,t){u=l(s=r*e+r,n.x,a.x,i.x,o.x),h=l(s,n.y,a.y,i.y,o.y),p=u*u+h*h,d+=c[t]*Math.sqrt(p);}),r*d}function ke(e,t,n,a,i){for(var o,l=.5,r=1-l;o=be(e,t,n,a,r),!(Math.abs(o-i)<=.01);){ r+=(o<i?1:-1)*(l/=2); }return r}function we(e,n){var a;return e.forEach(function(e){var t=n?e.map(function(e){var t={x:e.x,y:e.y};return n(t),t}):e;a||(a=[{type:"M",values:[t[0].x,t[0].y]}]),a.push(t.length?2===t.length?{type:"L",values:[t[1].x,t[1].y]}:{type:"C",values:[t[1].x,t[1].y,t[2].x,t[2].y,t[3].x,t[3].y]}:{type:"Z",values:[]});}),a}function Oe(e){var n=[],a=0;return e.forEach(function(e){var t=(2===e.length?_e:be).apply(null,e);n.push(t),a+=t;}),{segsLen:n,lenAll:a}}function Me(e,a){return null==e||null==a||e.length!==a.length||e.some(function(e,t){var n=a[t];return e.type!==n.type||e.values.some(function(e,t){return e!==n.values[t]})})}function Ie(e,t,n){e.events[t]?e.events[t].indexOf(n)<0&&e.events[t].push(n):e.events[t]=[n];}function Ce(e,t,n){var a;e.events[t]&&-1<(a=e.events[t].indexOf(n))&&e.events[t].splice(a,1);}function Le(e){t&&clearTimeout(t),Q.push(e),t=setTimeout(function(){Q.forEach(function(e){e();}),Q=[];},0);}function Ae(e,t){e.reflowTargets.indexOf(t)<0&&e.reflowTargets.push(t);}function Ve(e){e.reflowTargets.forEach(function(e){var n;n=e,setTimeout(function(){var e=n.parentNode,t=n.nextSibling;e.insertBefore(e.removeChild(n),t);},0);}),e.reflowTargets=[];}function Pe(e,t,n,a,i,o,l){var r,s,u;"auto-start-reverse"===n?("boolean"!=typeof h&&(t.setAttribute("orient","auto-start-reverse"),h=t.orientType.baseVal===SVGMarkerElement.SVG_MARKER_ORIENT_UNKNOWN),h?t.setAttribute("orient",n):((r=i.createSVGTransform()).setRotate(180,0,0),o.transform.baseVal.appendItem(r),t.setAttribute("orient","auto"),u=!0)):(t.setAttribute("orient",n),!1===h&&o.transform.baseVal.clear()),s=t.viewBox.baseVal,u?(s.x=-a.right,s.y=-a.bottom):(s.x=a.left,s.y=a.top),s.width=a.width,s.height=a.height,le&&Ae(e,l);}function Ne(e,t){return {prop:e?"markerEnd":"markerStart",orient:t?t.noRotate?"0":e?"auto":"auto-start-reverse":null}}function Te(n,a){Object.keys(a).forEach(function(e){var t=a[e];n[e]=null!=t.iniValue?t.hasSE?[t.iniValue,t.iniValue]:t.iniValue:t.hasSE?t.hasProps?[{},{}]:[]:t.hasProps?{}:null;});}function We(t,e,n,a,i){return a!==e[n]&&(e[n]=a,i&&i.forEach(function(e){e(t,a,n);}),!0)}function Be(e){function t(e,t){return e+parseFloat(t)}var n=e.document,a=e.getComputedStyle(n.documentElement,""),i=e.getComputedStyle(n.body,""),o={x:0,y:0};return "static"!==i.position?(o.x-=[a.marginLeft,a.borderLeftWidth,a.paddingLeft,i.marginLeft,i.borderLeftWidth].reduce(t,0),o.y-=[a.marginTop,a.borderTopWidth,a.paddingTop,i.marginTop,i.borderTopWidth].reduce(t,0)):"static"!==a.position&&(o.x-=[a.marginLeft,a.borderLeftWidth].reduce(t,0),o.y-=[a.marginTop,a.borderTopWidth].reduce(t,0)),o}function Re(e){var t,n=e.document;n.getElementById(r)||(t=(new e.DOMParser).parseFromString(s,"image/svg+xml"),n.body.appendChild(t.documentElement),d(e));}function Fe(u){var _,f,v,e,n,a,i,y,s,h,p,t,o,l,r,c,d,S,m,g=u.options,E=u.curStats,x=u.aplStats,b=E.position_socketXYSE,k=!1;function w(e,t){var n=t===M?{x:e.left+e.width/2,y:e.top}:t===I?{x:e.right,y:e.top+e.height/2}:t===C?{x:e.left+e.width/2,y:e.bottom}:{x:e.left,y:e.top+e.height/2};return n.socketId=t,n}function O(e){return {x:e.x,y:e.y}}if(E.position_path=g.path,E.position_lineStrokeWidth=E.line_strokeWidth,E.position_socketGravitySE=_=de(g.socketGravitySE),f=[0,1].map(function(e){var t,n,a,i=g.anchorSE[e],o=u.optionIsAttach.anchorSE[e],l=!1!==o?$[i._id]:null,r=!1!==o&&l.conf.getStrokeWidth?l.conf.getStrokeWidth(l,u):0,s=!1!==o&&l.conf.getBBoxNest?l.conf.getBBoxNest(l,u,r):ge(i,u.baseWindow);return E.capsMaskAnchor_pathDataSE[e]=!1!==o&&l.conf.getPathData?l.conf.getPathData(l,u,r):(n=null!=(t=s).right?t.right:t.left+t.width,a=null!=t.bottom?t.bottom:t.top+t.height,[{type:"M",values:[t.left,t.top]},{type:"L",values:[n,t.top]},{type:"L",values:[n,a]},{type:"L",values:[t.left,a]},{type:"Z",values:[]}]),E.capsMaskAnchor_strokeWidthSE[e]=r,s}),i=-1,g.socketSE[0]&&g.socketSE[1]?(b[0]=w(f[0],g.socketSE[0]),b[1]=w(f[1],g.socketSE[1])):(g.socketSE[0]||g.socketSE[1]?(g.socketSE[0]?(n=0,a=1):(n=1,a=0),b[n]=w(f[n],g.socketSE[n]),(e=W.map(function(e){return w(f[a],e)})).forEach(function(e){var t=_e(e,b[n]);(t<i||-1===i)&&(b[a]=e,i=t);})):(e=W.map(function(e){return w(f[1],e)}),W.map(function(e){return w(f[0],e)}).forEach(function(n){e.forEach(function(e){var t=_e(n,e);(t<i||-1===i)&&(b[0]=n,b[1]=e,i=t);});})),[0,1].forEach(function(e){var t,n;g.socketSE[e]||(f[e].width||f[e].height?f[e].width||b[e].socketId!==L&&b[e].socketId!==I?f[e].height||b[e].socketId!==M&&b[e].socketId!==C||(b[e].socketId=0<=b[e?0:1].y-f[e].top?C:M):b[e].socketId=0<=b[e?0:1].x-f[e].left?I:L:(t=b[e?0:1].x-f[e].left,n=b[e?0:1].y-f[e].top,b[e].socketId=Math.abs(t)>=Math.abs(n)?0<=t?I:L:0<=n?C:M));})),E.position_path!==x.position_path||E.position_lineStrokeWidth!==x.position_lineStrokeWidth||[0,1].some(function(e){return E.position_plugOverheadSE[e]!==x.position_plugOverheadSE[e]||(i=b[e],o=x.position_socketXYSE[e],i.x!==o.x||i.y!==o.y||i.socketId!==o.socketId)||(t=_[e],n=x.position_socketGravitySE[e],(a=null==t?"auto":Array.isArray(t)?"array":"number")!==(null==n?"auto":Array.isArray(n)?"array":"number")||("array"===a?t[0]!==n[0]||t[1]!==n[1]:t!==n));var t,n,a,i,o;})){switch(u.pathList.baseVal=v=[],u.pathList.animVal=null,E.position_path){case A:v.push([O(b[0]),O(b[1])]);break;case V:t="number"==typeof _[0]&&0<_[0]||"number"==typeof _[1]&&0<_[1],o=Z*(t?-1:1),l=Math.atan2(b[1].y-b[0].y,b[1].x-b[0].x),r=-l+o,c=Math.PI-l-o,d=_e(b[0],b[1])/Math.sqrt(2)*U,S={x:b[0].x+Math.cos(r)*d,y:b[0].y+Math.sin(r)*d*-1},m={x:b[1].x+Math.cos(c)*d,y:b[1].y+Math.sin(c)*d*-1},v.push([O(b[0]),S,m,O(b[1])]);break;case P:case N:s=[_[0],E.position_path===N?0:_[1]],h=[],p=[],b.forEach(function(e,t){var n,a,i,o,l,r=s[t];Array.isArray(r)?n={x:r[0],y:r[1]}:"number"==typeof r?n=e.socketId===M?{x:0,y:-r}:e.socketId===I?{x:r,y:0}:e.socketId===C?{x:0,y:r}:{x:-r,y:0}:(a=b[t?0:1],o=0<(i=E.position_plugOverheadSE[t])?G+(D<i?(i-D)*z:0):B+(E.position_lineStrokeWidth>R?(E.position_lineStrokeWidth-R)*F:0),e.socketId===M?((l=(e.y-a.y)/2)<o&&(l=o),n={x:0,y:-l}):e.socketId===I?((l=(a.x-e.x)/2)<o&&(l=o),n={x:l,y:0}):e.socketId===C?((l=(a.y-e.y)/2)<o&&(l=o),n={x:0,y:l}):((l=(e.x-a.x)/2)<o&&(l=o),n={x:-l,y:0})),h[t]=e.x+n.x,p[t]=e.y+n.y;}),v.push([O(b[0]),{x:h[0],y:p[0]},{x:h[1],y:p[1]},O(b[1])]);break;case T:!function(){var a,o=1,l=2,r=3,s=4,u=[[],[]],h=[];function p(e){return e===o?r:e===l?s:e===r?o:l}function c(e){return e===l||e===s?"x":"y"}function d(e,t,n){var a={x:e.x,y:e.y};if(n){if(n===p(e.dirId)){ throw new Error("Invalid dirId: "+n); }a.dirId=n;}else { a.dirId=e.dirId; }return a.dirId===o?a.y-=t:a.dirId===l?a.x+=t:a.dirId===r?a.y+=t:a.x-=t,a}function f(e,t){return t.dirId===o?e.y<=t.y:t.dirId===l?e.x>=t.x:t.dirId===r?e.y>=t.y:e.x<=t.x}function y(e,t){return t.dirId===o||t.dirId===r?e.x===t.x:e.y===t.y}function S(e){return e[0]?{contain:0,notContain:1}:{contain:1,notContain:0}}function m(e,t,n){return Math.abs(t[n]-e[n])}function g(e,t,n){return "x"===n?e.x<t.x?l:s:e.y<t.y?r:o}function e(){var e,t,a,i,n=[f(h[1],h[0]),f(h[0],h[1])],o=[c(h[0].dirId),c(h[1].dirId)];if(o[0]===o[1]){if(n[0]&&n[1]){ return y(h[1],h[0])||(h[0][o[0]]===h[1][o[1]]?(u[0].push(h[0]),u[1].push(h[1])):(e=h[0][o[0]]+(h[1][o[1]]-h[0][o[0]])/2,u[0].push(d(h[0],Math.abs(e-h[0][o[0]]))),u[1].push(d(h[1],Math.abs(e-h[1][o[1]]))))),!1; }n[0]!==n[1]?(t=S(n),(a=m(h[t.notContain],h[t.contain],o[t.notContain]))<H&&(h[t.notContain]=d(h[t.notContain],H-a)),u[t.notContain].push(h[t.notContain]),h[t.notContain]=d(h[t.notContain],H,y(h[t.contain],h[t.notContain])?"x"===o[t.notContain]?r:l:g(h[t.notContain],h[t.contain],"x"===o[t.notContain]?"y":"x"))):(a=m(h[0],h[1],"x"===o[0]?"y":"x"),u.forEach(function(e,t){var n=0===t?1:0;e.push(h[t]),h[t]=d(h[t],H,2*H<=a?g(h[t],h[n],"x"===o[t]?"y":"x"):"x"===o[t]?r:l);}));}else{if(n[0]&&n[1]){ return y(h[1],h[0])?u[1].push(h[1]):y(h[0],h[1])?u[0].push(h[0]):u[0].push("x"===o[0]?{x:h[1].x,y:h[0].y}:{x:h[0].x,y:h[1].y}),!1; }n[0]!==n[1]?(t=S(n),u[t.notContain].push(h[t.notContain]),h[t.notContain]=d(h[t.notContain],H,m(h[t.notContain],h[t.contain],o[t.contain])>=H?g(h[t.notContain],h[t.contain],o[t.contain]):h[t.contain].dirId)):(i=[{x:h[0].x,y:h[0].y},{x:h[1].x,y:h[1].y}],u.forEach(function(e,t){var n=0===t?1:0,a=m(i[t],i[n],o[t]);a<H&&(h[t]=d(h[t],H-a)),e.push(h[t]),h[t]=d(h[t],H,g(h[t],h[n],o[n]));}));}return !0}for(b.forEach(function(e,t){var n,a=O(e),i=_[t];n=Array.isArray(i)?i[0]<0?[s,-i[0]]:0<i[0]?[l,i[0]]:i[1]<0?[o,-i[1]]:0<i[1]?[r,i[1]]:[e.socketId,0]:"number"!=typeof i?[e.socketId,H]:0<=i?[e.socketId,i]:[p(e.socketId),-i],a.dirId=n[0],i=n[1],u[t].push(a),h[t]=d(a,i);});e();){ }u[1].reverse(),u[0].concat(u[1]).forEach(function(e,t){var n={x:e.x,y:e.y};0<t&&v.push([a,n]),a=n;});}();}y=[],E.position_plugOverheadSE.forEach(function(e,t){var n,a,i,o,l,r,s,u,h,p,c,d=!t;0<e?2===(n=v[a=d?0:v.length-1]).length?(y[a]=y[a]||_e.apply(null,n),y[a]>j&&(y[a]-e<j&&(e=y[a]-j),i=ve(n[0],n[1],(d?e:y[a]-e)/y[a]),v[a]=d?[i,n[1]]:[n[0],i],y[a]-=e)):(y[a]=y[a]||be.apply(null,n),y[a]>j&&(y[a]-e<j&&(e=y[a]-j),i=xe(n[0],n[1],n[2],n[3],ke(n[0],n[1],n[2],n[3],d?e:y[a]-e)),d?(o=n[0],l=i.toP1):(o=n[3],l=i.fromP2),r=Math.atan2(o.y-i.y,i.x-o.x),s=_e(i,l),i.x=o.x+Math.cos(r)*e,i.y=o.y+Math.sin(r)*e*-1,l.x=i.x+Math.cos(r)*s,l.y=i.y+Math.sin(r)*s*-1,v[a]=d?[i,i.toP1,i.toP2,n[3]]:[n[0],i.fromP1,i.fromP2,i],y[a]=null)):e<0&&(n=v[a=d?0:v.length-1],u=b[t].socketId,h=u===L||u===I?"x":"y",e<(c=-f[t]["x"===h?"width":"height"])&&(e=c),p=e*(u===L||u===M?-1:1),2===n.length?n[d?0:n.length-1][h]+=p:(d?[0,1]:[n.length-2,n.length-1]).forEach(function(e){n[e][h]+=p;}),y[a]=null);}),x.position_socketXYSE=de(b),x.position_plugOverheadSE=de(E.position_plugOverheadSE),x.position_path=E.position_path,x.position_lineStrokeWidth=E.position_lineStrokeWidth,x.position_socketGravitySE=de(_),k=!0,u.events.apl_position&&u.events.apl_position.forEach(function(e){e(u,v);});}return k}function Ge(t,n){n!==t.isShown&&(!!n!=!!t.isShown&&(t.svg.style.visibility=n?"":"hidden"),t.isShown=n,t.events&&t.events.svgShow&&t.events.svgShow.forEach(function(e){e(t,n);}));}function De(e,t){var n,a,i,o,l,h,p,c,d,f,r,s,u,y,S,m,g,_,v,E,x,b,k,w,O,M,I,C,L,A,V,P,N,T,W,B,R,F,G,D,z,j,H,U,Z,Y,X,q,Q,K,J,$,ee={};t.line&&(ee.line=(a=(n=e).options,i=n.curStats,o=n.events,l=!1,l=We(n,i,"line_color",a.lineColor,o.cur_line_color)||l,l=We(n,i,"line_colorTra",fe(i.line_color)[0]<1)||l,l=We(n,i,"line_strokeWidth",a.lineSize,o.cur_line_strokeWidth)||l)),(t.plug||ee.line)&&(ee.plug=(p=(h=e).options,c=h.curStats,d=h.events,f=!1,[0,1].forEach(function(e){var t,n,a,i,o,l,r,s,u=p.plugSE[e];f=We(h,c.plug_enabledSE,e,u!==ne)||f,f=We(h,c.plug_plugSE,e,u)||f,f=We(h,c.plug_colorSE,e,s=p.plugColorSE[e]||c.line_color,d.cur_plug_colorSE)||f,f=We(h,c.plug_colorTraSE,e,fe(s)[0]<1)||f,u!==ne&&(i=n=(t=ae[ie[u]]).widthR*p.plugSizeSE[e],o=a=t.heightR*p.plugSizeSE[e],ue&&(i*=c.line_strokeWidth,o*=c.line_strokeWidth),f=We(h,c.plug_markerWidthSE,e,i)||f,f=We(h,c.plug_markerHeightSE,e,o)||f,c.capsMaskMarker_markerWidthSE[e]=n,c.capsMaskMarker_markerHeightSE[e]=a),c.plugOutline_plugSE[e]=c.capsMaskMarker_plugSE[e]=u,c.plug_enabledSE[e]?(s=c.line_strokeWidth/pe.lineSize*p.plugSizeSE[e],c.position_plugOverheadSE[e]=t.overhead*s,c.viewBox_plugBCircleSE[e]=t.bCircle*s,l=t.sideLen*s,r=t.backLen*s):(c.position_plugOverheadSE[e]=-c.line_strokeWidth/2,c.viewBox_plugBCircleSE[e]=l=r=0),We(h,c.attach_plugSideLenSE,e,l,d.cur_attach_plugSideLenSE),We(h,c.attach_plugBackLenSE,e,r,d.cur_attach_plugBackLenSE),c.capsMaskAnchor_enabledSE[e]=!c.plug_enabledSE[e];}),f=We(h,c,"plug_enabled",c.plug_enabledSE[0]||c.plug_enabledSE[1])||f)),(t.lineOutline||ee.line)&&(ee.lineOutline=(u=(r=e).options,y=r.curStats,S=!1,S=We(r,y,"lineOutline_enabled",u.lineOutlineEnabled)||S,S=We(r,y,"lineOutline_color",u.lineOutlineColor)||S,S=We(r,y,"lineOutline_colorTra",fe(y.lineOutline_color)[0]<1)||S,s=y.line_strokeWidth*u.lineOutlineSize,S=We(r,y,"lineOutline_strokeWidth",y.line_strokeWidth-2*s)||S,S=We(r,y,"lineOutline_inStrokeWidth",y.lineOutline_colorTra?y.lineOutline_strokeWidth+2*he:y.line_strokeWidth-s)||S)),(t.plugOutline||ee.line||ee.plug||ee.lineOutline)&&(ee.plugOutline=(g=(m=e).options,_=m.curStats,v=!1,[0,1].forEach(function(e){var t,n=_.plugOutline_plugSE[e],a=n!==ne?ae[ie[n]]:null;v=We(m,_.plugOutline_enabledSE,e,g.plugOutlineEnabledSE[e]&&_.plug_enabled&&_.plug_enabledSE[e]&&!!a&&!!a.outlineBase)||v,v=We(m,_.plugOutline_colorSE,e,t=g.plugOutlineColorSE[e]||_.lineOutline_color)||v,v=We(m,_.plugOutline_colorTraSE,e,fe(t)[0]<1)||v,a&&a.outlineBase&&((t=g.plugOutlineSizeSE[e])>a.outlineMax&&(t=a.outlineMax),t*=2*a.outlineBase,v=We(m,_.plugOutline_strokeWidthSE,e,t)||v,v=We(m,_.plugOutline_inStrokeWidthSE,e,_.plugOutline_colorTraSE[e]?t-he/(_.line_strokeWidth/pe.lineSize)/g.plugSizeSE[e]*2:t/2)||v);}),v)),(t.faces||ee.line||ee.plug||ee.lineOutline||ee.plugOutline)&&(ee.faces=(b=(E=e).curStats,k=E.aplStats,w=E.events,O=!1,!b.line_altColor&&We(E,k,"line_color",x=b.line_color,w.apl_line_color)&&(E.lineFace.style.stroke=x,O=!0),We(E,k,"line_strokeWidth",x=b.line_strokeWidth,w.apl_line_strokeWidth)&&(E.lineShape.style.strokeWidth=x+"px",O=!0,(re||le)&&(Ae(E,E.lineShape),le&&(Ae(E,E.lineFace),Ae(E,E.lineMaskCaps)))),We(E,k,"lineOutline_enabled",x=b.lineOutline_enabled,w.apl_lineOutline_enabled)&&(E.lineOutlineFace.style.display=x?"inline":"none",O=!0),b.lineOutline_enabled&&(We(E,k,"lineOutline_color",x=b.lineOutline_color,w.apl_lineOutline_color)&&(E.lineOutlineFace.style.stroke=x,O=!0),We(E,k,"lineOutline_strokeWidth",x=b.lineOutline_strokeWidth,w.apl_lineOutline_strokeWidth)&&(E.lineOutlineMaskShape.style.strokeWidth=x+"px",O=!0,le&&(Ae(E,E.lineOutlineMaskCaps),Ae(E,E.lineOutlineFace))),We(E,k,"lineOutline_inStrokeWidth",x=b.lineOutline_inStrokeWidth,w.apl_lineOutline_inStrokeWidth)&&(E.lineMaskShape.style.strokeWidth=x+"px",O=!0,le&&(Ae(E,E.lineOutlineMaskCaps),Ae(E,E.lineOutlineFace)))),We(E,k,"plug_enabled",x=b.plug_enabled,w.apl_plug_enabled)&&(E.plugsFace.style.display=x?"inline":"none",O=!0),b.plug_enabled&&[0,1].forEach(function(n){var e=b.plug_plugSE[n],t=e!==ne?ae[ie[e]]:null,a=Ne(n,t);We(E,k.plug_enabledSE,n,x=b.plug_enabledSE[n],w.apl_plug_enabledSE)&&(E.plugsFace.style[a.prop]=x?"url(#"+E.plugMarkerIdSE[n]+")":"none",O=!0),b.plug_enabledSE[n]&&(We(E,k.plug_plugSE,n,e,w.apl_plug_plugSE)&&(E.plugFaceSE[n].href.baseVal="#"+t.elmId,Pe(E,E.plugMarkerSE[n],a.orient,t.bBox,E.svg,E.plugMarkerShapeSE[n],E.plugsFace),O=!0,re&&Ae(E,E.plugsFace)),We(E,k.plug_colorSE,n,x=b.plug_colorSE[n],w.apl_plug_colorSE)&&(E.plugFaceSE[n].style.fill=x,O=!0,(se||ue||le)&&!b.line_colorTra&&Ae(E,le?E.lineMaskCaps:E.capsMaskLine)),["markerWidth","markerHeight"].forEach(function(e){var t="plug_"+e+"SE";We(E,k[t],n,x=b[t][n],w["apl_"+t])&&(E.plugMarkerSE[n][e].baseVal.value=x,O=!0);}),We(E,k.plugOutline_enabledSE,n,x=b.plugOutline_enabledSE[n],w.apl_plugOutline_enabledSE)&&(x?(E.plugFaceSE[n].style.mask="url(#"+E.plugMaskIdSE[n]+")",E.plugOutlineFaceSE[n].style.display="inline"):(E.plugFaceSE[n].style.mask="none",E.plugOutlineFaceSE[n].style.display="none"),O=!0),b.plugOutline_enabledSE[n]&&(We(E,k.plugOutline_plugSE,n,e,w.apl_plugOutline_plugSE)&&(E.plugOutlineFaceSE[n].href.baseVal=E.plugMaskShapeSE[n].href.baseVal=E.plugOutlineMaskShapeSE[n].href.baseVal="#"+t.elmId,[E.plugMaskSE[n],E.plugOutlineMaskSE[n]].forEach(function(e){e.x.baseVal.value=t.bBox.left,e.y.baseVal.value=t.bBox.top,e.width.baseVal.value=t.bBox.width,e.height.baseVal.value=t.bBox.height;}),O=!0),We(E,k.plugOutline_colorSE,n,x=b.plugOutline_colorSE[n],w.apl_plugOutline_colorSE)&&(E.plugOutlineFaceSE[n].style.fill=x,O=!0,le&&(Ae(E,E.lineMaskCaps),Ae(E,E.lineOutlineMaskCaps))),We(E,k.plugOutline_strokeWidthSE,n,x=b.plugOutline_strokeWidthSE[n],w.apl_plugOutline_strokeWidthSE)&&(E.plugOutlineMaskShapeSE[n].style.strokeWidth=x+"px",O=!0),We(E,k.plugOutline_inStrokeWidthSE,n,x=b.plugOutline_inStrokeWidthSE[n],w.apl_plugOutline_inStrokeWidthSE)&&(E.plugMaskShapeSE[n].style.strokeWidth=x+"px",O=!0)));}),O)),(t.position||ee.line||ee.plug)&&(ee.position=Fe(e)),(t.path||ee.position)&&(ee.path=(C=(M=e).curStats,L=M.aplStats,A=M.pathList.animVal||M.pathList.baseVal,V=C.path_edge,P=!1,A&&(V.x1=V.x2=A[0][0].x,V.y1=V.y2=A[0][0].y,C.path_pathData=I=we(A,function(e){e.x<V.x1&&(V.x1=e.x),e.y<V.y1&&(V.y1=e.y),e.x>V.x2&&(V.x2=e.x),e.y>V.y2&&(V.y2=e.y);}),Me(I,L.path_pathData)&&(M.linePath.setPathData(I),L.path_pathData=I,P=!0,le?(Ae(M,M.plugsFace),Ae(M,M.lineMaskCaps)):re&&Ae(M,M.linePath),M.events.apl_path&&M.events.apl_path.forEach(function(e){e(M,I);}))),P)),ee.viewBox=(B=(N=e).curStats,R=N.aplStats,F=B.path_edge,G=B.viewBox_bBox,D=R.viewBox_bBox,z=N.svg.viewBox.baseVal,j=N.svg.style,H=!1,T=Math.max(B.line_strokeWidth/2,B.viewBox_plugBCircleSE[0]||0,B.viewBox_plugBCircleSE[1]||0),W={x1:F.x1-T,y1:F.y1-T,x2:F.x2+T,y2:F.y2+T},N.events.new_edge4viewBox&&N.events.new_edge4viewBox.forEach(function(e){e(N,W);}),G.x=B.lineMask_x=B.lineOutlineMask_x=B.maskBGRect_x=W.x1,G.y=B.lineMask_y=B.lineOutlineMask_y=B.maskBGRect_y=W.y1,G.width=W.x2-W.x1,G.height=W.y2-W.y1,["x","y","width","height"].forEach(function(e){var t;(t=G[e])!==D[e]&&(z[e]=D[e]=t,j[oe[e]]=t+("x"===e||"y"===e?N.bodyOffset[e]:0)+"px",H=!0);}),H),ee.mask=(Y=(U=e).curStats,X=U.aplStats,q=!1,Y.plug_enabled?[0,1].forEach(function(e){Y.capsMaskMarker_enabledSE[e]=Y.plug_enabledSE[e]&&Y.plug_colorTraSE[e]||Y.plugOutline_enabledSE[e]&&Y.plugOutline_colorTraSE[e];}):Y.capsMaskMarker_enabledSE[0]=Y.capsMaskMarker_enabledSE[1]=!1,Y.capsMaskMarker_enabled=Y.capsMaskMarker_enabledSE[0]||Y.capsMaskMarker_enabledSE[1],Y.lineMask_outlineMode=Y.lineOutline_enabled,Y.caps_enabled=Y.capsMaskMarker_enabled||Y.capsMaskAnchor_enabledSE[0]||Y.capsMaskAnchor_enabledSE[1],Y.lineMask_enabled=Y.caps_enabled||Y.lineMask_outlineMode,(Y.lineMask_enabled&&!Y.lineMask_outlineMode||Y.lineOutline_enabled)&&["x","y"].forEach(function(e){var t="maskBGRect_"+e;We(U,X,t,Z=Y[t])&&(U.maskBGRect[e].baseVal.value=Z,q=!0);}),We(U,X,"lineMask_enabled",Z=Y.lineMask_enabled)&&(U.lineFace.style.mask=Z?"url(#"+U.lineMaskId+")":"none",q=!0,ue&&Ae(U,U.lineMask)),Y.lineMask_enabled&&(We(U,X,"lineMask_outlineMode",Z=Y.lineMask_outlineMode)&&(Z?(U.lineMaskBG.style.display="none",U.lineMaskShape.style.display="inline"):(U.lineMaskBG.style.display="inline",U.lineMaskShape.style.display="none"),q=!0),["x","y"].forEach(function(e){var t="lineMask_"+e;We(U,X,t,Z=Y[t])&&(U.lineMask[e].baseVal.value=Z,q=!0);}),We(U,X,"caps_enabled",Z=Y.caps_enabled)&&(U.lineMaskCaps.style.display=U.lineOutlineMaskCaps.style.display=Z?"inline":"none",q=!0,ue&&Ae(U,U.capsMaskLine)),Y.caps_enabled&&([0,1].forEach(function(e){var t;We(U,X.capsMaskAnchor_enabledSE,e,Z=Y.capsMaskAnchor_enabledSE[e])&&(U.capsMaskAnchorSE[e].style.display=Z?"inline":"none",q=!0,ue&&Ae(U,U.lineMask)),Y.capsMaskAnchor_enabledSE[e]&&(Me(t=Y.capsMaskAnchor_pathDataSE[e],X.capsMaskAnchor_pathDataSE[e])&&(U.capsMaskAnchorSE[e].setPathData(t),X.capsMaskAnchor_pathDataSE[e]=t,q=!0),We(U,X.capsMaskAnchor_strokeWidthSE,e,Z=Y.capsMaskAnchor_strokeWidthSE[e])&&(U.capsMaskAnchorSE[e].style.strokeWidth=Z+"px",q=!0));}),We(U,X,"capsMaskMarker_enabled",Z=Y.capsMaskMarker_enabled)&&(U.capsMaskLine.style.display=Z?"inline":"none",q=!0),Y.capsMaskMarker_enabled&&[0,1].forEach(function(n){var e=Y.capsMaskMarker_plugSE[n],t=e!==ne?ae[ie[e]]:null,a=Ne(n,t);We(U,X.capsMaskMarker_enabledSE,n,Z=Y.capsMaskMarker_enabledSE[n])&&(U.capsMaskLine.style[a.prop]=Z?"url(#"+U.lineMaskMarkerIdSE[n]+")":"none",q=!0),Y.capsMaskMarker_enabledSE[n]&&(We(U,X.capsMaskMarker_plugSE,n,e)&&(U.capsMaskMarkerShapeSE[n].href.baseVal="#"+t.elmId,Pe(U,U.capsMaskMarkerSE[n],a.orient,t.bBox,U.svg,U.capsMaskMarkerShapeSE[n],U.capsMaskLine),q=!0,re&&(Ae(U,U.capsMaskLine),Ae(U,U.lineFace))),["markerWidth","markerHeight"].forEach(function(e){var t="capsMaskMarker_"+e+"SE";We(U,X[t],n,Z=Y[t][n])&&(U.capsMaskMarkerSE[n][e].baseVal.value=Z,q=!0);}));}))),Y.lineOutline_enabled&&["x","y"].forEach(function(e){var t="lineOutlineMask_"+e;We(U,X,t,Z=Y[t])&&(U.lineOutlineMask[e].baseVal.value=Z,q=!0);}),q),t.effect&&(J=(Q=e).curStats,$=Q.aplStats,Object.keys(te).forEach(function(e){var t=te[e],n=e+"_enabled",a=e+"_options",i=J[a];We(Q,$,n,K=J[n])?(K&&($[a]=de(i)),t[K?"init":"remove"](Q)):K&&ce(i,$[a])&&(t.remove(Q),$[n]=!0,$[a]=de(i),t.init(Q));})),(se||ue)&&ee.line&&!ee.path&&Ae(e,e.lineShape),se&&ee.plug&&!ee.line&&Ae(e,e.plugsFace),Ve(e);}function ze(e,t){return {duration:w(e.duration)&&0<e.duration?e.duration:t.duration,timing:c.validTiming(e.timing)?e.timing:de(t.timing)}}function je(e,t,n,a){var i,o=e.curStats,l=e.aplStats,r={};function s(){["show_on","show_effect","show_animOptions"].forEach(function(e){l[e]=o[e];});}o.show_on=t,n&&g[n]&&(o.show_effect=n,o.show_animOptions=ze(k(a)?a:{},g[n].defaultAnimOptions)),r.show_on=o.show_on!==l.show_on,r.show_effect=o.show_effect!==l.show_effect,r.show_animOptions=ce(o.show_animOptions,l.show_animOptions),r.show_effect||r.show_animOptions?o.show_inAnim?(i=r.show_effect?g[l.show_effect].stop(e,!0,!0):g[l.show_effect].stop(e),s(),g[l.show_effect].init(e,i)):r.show_on&&(l.show_effect&&r.show_effect&&g[l.show_effect].stop(e,!0,!0),s(),g[l.show_effect].init(e)):r.show_on&&(s(),g[l.show_effect].start(e));}function He(e,t,n){var a={props:e,optionName:n};return !(!(e.attachments.indexOf(t)<0)||t.conf.bind&&!t.conf.bind(t,a))&&(e.attachments.push(t),t.boundTargets.push(a),!0)}function Ue(n,a,e){var i=n.attachments.indexOf(a);-1<i&&n.attachments.splice(i,1),a.boundTargets.some(function(e,t){return e.props===n&&(a.conf.unbind&&a.conf.unbind(a,e),i=t,!0)})&&(a.boundTargets.splice(i,1),e||Le(function(){a.boundTargets.length||o(a);}));}function Ze(s,u){var e,i,h=s.options,p={};function f(e,t,n,a,i){var o={};return n?null!=a?(o.container=e[n],o.key=a):(o.container=e,o.key=n):(o.container=e,o.key=t),o.default=i,o.acceptsAuto=null==o.default,o}function c(e,t,n,a,i,o,l){var r,s,u,h=f(e,n,i,o,l);return null!=t[n]&&(s=(t[n]+"").toLowerCase())&&(h.acceptsAuto&&s===x||(u=a[s]))&&u!==h.container[h.key]&&(h.container[h.key]=u,r=!0),null!=h.container[h.key]||h.acceptsAuto||(h.container[h.key]=h.default,r=!0),r}function d(e,t,n,a,i,o,l,r,s){var u,h,p,c,d=f(e,n,i,o,l);if(!a){if(null==d.default){ throw new Error("Invalid `type`: "+n); }a=typeof d.default;}return null!=t[n]&&(d.acceptsAuto&&(t[n]+"").toLowerCase()===x||(p=h=t[n],("number"===(c=a)?w(p):typeof p===c)&&(h=s&&"string"===a&&h?h.trim():h,1)&&(!r||r(h))))&&h!==d.container[d.key]&&(d.container[d.key]=h,u=!0),null!=d.container[d.key]||d.acceptsAuto||(d.container[d.key]=d.default,u=!0),u}if(u=u||{},["start","end"].forEach(function(e,t){var n=u[e],a=!1;if(n&&(ye(n)||(a=_(n,"anchor")))&&n!==h.anchorSE[t]){if(!1!==s.optionIsAttach.anchorSE[t]&&Ue(s,$[h.anchorSE[t]._id]),a&&!He(s,$[n._id],e)){ throw new Error("Can't bind attachment"); }h.anchorSE[t]=n,s.optionIsAttach.anchorSE[t]=a,i=p.position=!0;}}),!h.anchorSE[0]||!h.anchorSE[1]||h.anchorSE[0]===h.anchorSE[1]){ throw new Error("`start` and `end` are required."); }i&&(e=function(e,t){var n,a,i;if(!(n=me(e))||!(a=me(t))){ throw new Error("Cannot get frames."); }return n.length&&a.length&&(n.reverse(),a.reverse(),n.some(function(t){return a.some(function(e){return e===t&&(i=e.contentWindow,!0)})})),i||window}(!1!==s.optionIsAttach.anchorSE[0]?$[h.anchorSE[0]._id].element:h.anchorSE[0],!1!==s.optionIsAttach.anchorSE[1]?$[h.anchorSE[1]._id].element:h.anchorSE[1]))!==s.baseWindow&&(!function(a,e){var t,n,i,o,l,r,s,u,h,p,c=a.aplStats,d=e.document,f=v+"-"+a._id;function y(e){var t=n.appendChild(d.createElementNS(b,"mask"));return t.id=e,t.maskUnits.baseVal=SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE,[t.x,t.y,t.width,t.height].forEach(function(e){e.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0);}),t}function S(e){var t=n.appendChild(d.createElementNS(b,"marker"));return t.id=e,t.markerUnits.baseVal=SVGMarkerElement.SVG_MARKERUNITS_STROKEWIDTH,t.viewBox.baseVal||t.setAttribute("viewBox","0 0 0 0"),t}function m(e){return [e.width,e.height].forEach(function(e){e.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE,100);}),e}a.pathList={},Te(c,Y),Object.keys(te).forEach(function(e){var t=e+"_enabled";c[t]&&(te[e].remove(a),c[t]=!1);}),a.baseWindow&&a.svg&&a.baseWindow.document.body.removeChild(a.svg),Re(a.baseWindow=e),a.bodyOffset=Be(e),a.svg=t=d.createElementNS(b,"svg"),t.className.baseVal=v,t.viewBox.baseVal||t.setAttribute("viewBox","0 0 0 0"),a.defs=n=t.appendChild(d.createElementNS(b,"defs")),a.linePath=o=n.appendChild(d.createElementNS(b,"path")),o.id=l=f+"-line-path",o.className.baseVal=v+"-line-path",ue&&(o.style.fill="none"),a.lineShape=o=n.appendChild(d.createElementNS(b,"use")),o.id=r=f+"-line-shape",o.href.baseVal="#"+l,(i=n.appendChild(d.createElementNS(b,"g"))).id=s=f+"-caps",a.capsMaskAnchorSE=[0,1].map(function(){var e=i.appendChild(d.createElementNS(b,"path"));return e.className.baseVal=v+"-caps-mask-anchor",e}),a.lineMaskMarkerIdSE=[f+"-caps-mask-marker-0",f+"-caps-mask-marker-1"],a.capsMaskMarkerSE=[0,1].map(function(e){return S(a.lineMaskMarkerIdSE[e])}),a.capsMaskMarkerShapeSE=[0,1].map(function(e){var t=a.capsMaskMarkerSE[e].appendChild(d.createElementNS(b,"use"));return t.className.baseVal=v+"-caps-mask-marker-shape",t}),a.capsMaskLine=o=i.appendChild(d.createElementNS(b,"use")),o.className.baseVal=v+"-caps-mask-line",o.href.baseVal="#"+r,a.maskBGRect=o=m(n.appendChild(d.createElementNS(b,"rect"))),o.id=u=f+"-mask-bg-rect",o.className.baseVal=v+"-mask-bg-rect",ue&&(o.style.fill="white"),a.lineMask=m(y(a.lineMaskId=f+"-line-mask")),a.lineMaskBG=o=a.lineMask.appendChild(d.createElementNS(b,"use")),o.href.baseVal="#"+u,a.lineMaskShape=o=a.lineMask.appendChild(d.createElementNS(b,"use")),o.className.baseVal=v+"-line-mask-shape",o.href.baseVal="#"+l,o.style.display="none",a.lineMaskCaps=o=a.lineMask.appendChild(d.createElementNS(b,"use")),o.href.baseVal="#"+s,a.lineOutlineMask=m(y(h=f+"-line-outline-mask")),(o=a.lineOutlineMask.appendChild(d.createElementNS(b,"use"))).href.baseVal="#"+u,a.lineOutlineMaskShape=o=a.lineOutlineMask.appendChild(d.createElementNS(b,"use")),o.className.baseVal=v+"-line-outline-mask-shape",o.href.baseVal="#"+l,a.lineOutlineMaskCaps=o=a.lineOutlineMask.appendChild(d.createElementNS(b,"use")),o.href.baseVal="#"+s,a.face=t.appendChild(d.createElementNS(b,"g")),a.lineFace=o=a.face.appendChild(d.createElementNS(b,"use")),o.href.baseVal="#"+r,a.lineOutlineFace=o=a.face.appendChild(d.createElementNS(b,"use")),o.href.baseVal="#"+r,o.style.mask="url(#"+h+")",o.style.display="none",a.plugMaskIdSE=[f+"-plug-mask-0",f+"-plug-mask-1"],a.plugMaskSE=[0,1].map(function(e){return y(a.plugMaskIdSE[e])}),a.plugMaskShapeSE=[0,1].map(function(e){var t=a.plugMaskSE[e].appendChild(d.createElementNS(b,"use"));return t.className.baseVal=v+"-plug-mask-shape",t}),p=[],a.plugOutlineMaskSE=[0,1].map(function(e){return y(p[e]=f+"-plug-outline-mask-"+e)}),a.plugOutlineMaskShapeSE=[0,1].map(function(e){var t=a.plugOutlineMaskSE[e].appendChild(d.createElementNS(b,"use"));return t.className.baseVal=v+"-plug-outline-mask-shape",t}),a.plugMarkerIdSE=[f+"-plug-marker-0",f+"-plug-marker-1"],a.plugMarkerSE=[0,1].map(function(e){var t=S(a.plugMarkerIdSE[e]);return ue&&(t.markerUnits.baseVal=SVGMarkerElement.SVG_MARKERUNITS_USERSPACEONUSE),t}),a.plugMarkerShapeSE=[0,1].map(function(e){return a.plugMarkerSE[e].appendChild(d.createElementNS(b,"g"))}),a.plugFaceSE=[0,1].map(function(e){return a.plugMarkerShapeSE[e].appendChild(d.createElementNS(b,"use"))}),a.plugOutlineFaceSE=[0,1].map(function(e){var t=a.plugMarkerShapeSE[e].appendChild(d.createElementNS(b,"use"));return t.style.mask="url(#"+p[e]+")",t.style.display="none",t}),a.plugsFace=o=a.face.appendChild(d.createElementNS(b,"use")),o.className.baseVal=v+"-plugs-face",o.href.baseVal="#"+r,o.style.display="none",a.curStats.show_inAnim?(a.isShown=1,g[c.show_effect].stop(a,!0)):a.isShown||(t.style.visibility="hidden"),d.body.appendChild(t),[0,1,2].forEach(function(e){var t,n=a.options.labelSEM[e];n&&_(n,"label")&&(t=$[n._id]).conf.initSvg&&t.conf.initSvg(t,a);});}(s,e),p.line=p.plug=p.lineOutline=p.plugOutline=p.faces=p.effect=!0),p.position=c(h,u,"path",m,null,null,pe.path)||p.position,p.position=c(h,u,"startSocket",n,"socketSE",0)||p.position,p.position=c(h,u,"endSocket",n,"socketSE",1)||p.position,[u.startSocketGravity,u.endSocketGravity].forEach(function(e,t){var n,a,i=!1;null!=e&&(Array.isArray(e)?w(e[0])&&w(e[1])&&(i=[e[0],e[1]],Array.isArray(h.socketGravitySE[t])&&(n=i,a=h.socketGravitySE[t],n.length===a.length&&n.every(function(e,t){return e===a[t]}))&&(i=!1)):((e+"").toLowerCase()===x?i=null:w(e)&&0<=e&&(i=e),i===h.socketGravitySE[t]&&(i=!1)),!1!==i&&(h.socketGravitySE[t]=i,p.position=!0));}),p.line=d(h,u,"color",null,"lineColor",null,pe.lineColor,null,!0)||p.line,p.line=d(h,u,"size",null,"lineSize",null,pe.lineSize,function(e){return 0<e})||p.line,["startPlug","endPlug"].forEach(function(e,t){p.plug=c(h,u,e,E,"plugSE",t,pe.plugSE[t])||p.plug,p.plug=d(h,u,e+"Color","string","plugColorSE",t,null,null,!0)||p.plug,p.plug=d(h,u,e+"Size",null,"plugSizeSE",t,pe.plugSizeSE[t],function(e){return 0<e})||p.plug;}),p.lineOutline=d(h,u,"outline",null,"lineOutlineEnabled",null,pe.lineOutlineEnabled)||p.lineOutline,p.lineOutline=d(h,u,"outlineColor",null,"lineOutlineColor",null,pe.lineOutlineColor,null,!0)||p.lineOutline,p.lineOutline=d(h,u,"outlineSize",null,"lineOutlineSize",null,pe.lineOutlineSize,function(e){return 0<e&&e<=.48})||p.lineOutline,["startPlugOutline","endPlugOutline"].forEach(function(e,t){p.plugOutline=d(h,u,e,null,"plugOutlineEnabledSE",t,pe.plugOutlineEnabledSE[t])||p.plugOutline,p.plugOutline=d(h,u,e+"Color","string","plugOutlineColorSE",t,null,null,!0)||p.plugOutline,p.plugOutline=d(h,u,e+"Size",null,"plugOutlineSizeSE",t,pe.plugOutlineSizeSE[t],function(e){return 1<=e})||p.plugOutline;}),["startLabel","endLabel","middleLabel"].forEach(function(e,t){var n,a,i,o=u[e],l=h.labelSEM[t]&&!s.optionIsAttach.labelSEM[t]?$[h.labelSEM[t]._id].text:h.labelSEM[t],r=!1;if((n="string"==typeof o)&&(o=o.trim()),(n||o&&(r=_(o,"label")))&&o!==l){if(h.labelSEM[t]&&(Ue(s,$[h.labelSEM[t]._id]),h.labelSEM[t]=""),o){if(r?(a=$[(i=o)._id]).boundTargets.slice().forEach(function(e){a.conf.removeOption(a,e);}):i=new S(y.captionLabel,[o]),!He(s,$[i._id],e)){ throw new Error("Can't bind attachment"); }h.labelSEM[t]=i;}s.optionIsAttach.labelSEM[t]=r;}}),Object.keys(te).forEach(function(a){var e,t,o=te[a],n=a+"_enabled",i=a+"_options";function l(a){var i={};return o.optionsConf.forEach(function(e){var t=e[0],n=e[3];null==e[4]||i[n]||(i[n]=[]),("function"==typeof t?t:"id"===t?c:d).apply(null,[i,a].concat(e.slice(1)));}),i}function r(e){var t,n=a+"_animOptions";return e.hasOwnProperty("animation")?k(e.animation)?t=s.curStats[n]=ze(e.animation,o.defaultAnimOptions):(t=!!e.animation,s.curStats[n]=t?ze({},o.defaultAnimOptions):null):(t=!!o.defaultEnabled,s.curStats[n]=t?ze({},o.defaultAnimOptions):null),t}u.hasOwnProperty(a)&&(e=u[a],k(e)?(s.curStats[n]=!0,t=s.curStats[i]=l(e),o.anim&&(s.curStats[i].animation=r(e))):(t=s.curStats[n]=!!e)&&(s.curStats[i]=l({}),o.anim&&(s.curStats[i].animation=r({}))),ce(t,h[a])&&(h[a]=t,p.effect=!0));}),De(s,p);}function Ye(e,t,n){var a={options:{anchorSE:[],socketSE:[],socketGravitySE:[],plugSE:[],plugColorSE:[],plugSizeSE:[],plugOutlineEnabledSE:[],plugOutlineColorSE:[],plugOutlineSizeSE:[],labelSEM:["","",""]},optionIsAttach:{anchorSE:[!1,!1],labelSEM:[!1,!1,!1]},curStats:{},aplStats:{},attachments:[],events:{},reflowTargets:[]};Te(a.curStats,Y),Te(a.aplStats,Y),Object.keys(te).forEach(function(e){var t=te[e].stats;Te(a.curStats,t),Te(a.aplStats,t),a.options[e]=!1;}),Te(a.curStats,X),Te(a.aplStats,X),a.curStats.show_effect=q,a.curStats.show_animOptions=de(g[q].defaultAnimOptions),Object.defineProperty(this,"_id",{value:++J}),a._id=this._id,K[this._id]=a,1===arguments.length&&(n=e,e=null),n=n||{},(e||t)&&(n=de(n),e&&(n.start=e),t&&(n.end=t)),a.isShown=a.aplStats.show_on=!n.hide,this.setOptions(n);}return te={dash:{stats:{dash_len:{},dash_gap:{},dash_maxOffset:{}},anim:!0,defaultAnimOptions:{duration:1e3,timing:"linear"},optionsConf:[["type","len","number",null,null,null,function(e){return 0<e}],["type","gap","number",null,null,null,function(e){return 0<e}]],init:function(e){Ie(e,"apl_line_strokeWidth",te.dash.update),e.lineFace.style.strokeDashoffset=0,te.dash.update(e);},remove:function(e){var t=e.curStats;Ce(e,"apl_line_strokeWidth",te.dash.update),t.dash_animId&&(c.remove(t.dash_animId),t.dash_animId=null),e.lineFace.style.strokeDasharray="none",e.lineFace.style.strokeDashoffset=0,Te(e.aplStats,te.dash.stats);},update:function(t){var e,n=t.curStats,a=t.aplStats,i=a.dash_options,o=!1;n.dash_len=i.len||2*a.line_strokeWidth,n.dash_gap=i.gap||a.line_strokeWidth,n.dash_maxOffset=n.dash_len+n.dash_gap,o=We(t,a,"dash_len",n.dash_len)||o,(o=We(t,a,"dash_gap",n.dash_gap)||o)&&(t.lineFace.style.strokeDasharray=a.dash_len+","+a.dash_gap),n.dash_animOptions?(o=We(t,a,"dash_maxOffset",n.dash_maxOffset),a.dash_animOptions&&(o||ce(n.dash_animOptions,a.dash_animOptions))&&(n.dash_animId&&(e=c.stop(n.dash_animId),c.remove(n.dash_animId)),a.dash_animOptions=null),a.dash_animOptions||(n.dash_animId=c.add(function(e){return (1-e)*a.dash_maxOffset+"px"},function(e){t.lineFace.style.strokeDashoffset=e;},n.dash_animOptions.duration,0,n.dash_animOptions.timing,!1,e),a.dash_animOptions=de(n.dash_animOptions))):a.dash_animOptions&&(n.dash_animId&&(c.remove(n.dash_animId),n.dash_animId=null),t.lineFace.style.strokeDashoffset=0,a.dash_animOptions=null);}},gradient:{stats:{gradient_colorSE:{hasSE:!0},gradient_pointSE:{hasSE:!0,hasProps:!0}},optionsConf:[["type","startColor","string","colorSE",0,null,null,!0],["type","endColor","string","colorSE",1,null,null,!0]],init:function(e){var t,a=e.baseWindow.document,n=e.defs,i=v+"-"+e._id+"-gradient";e.efc_gradient_gradient=t=n.appendChild(a.createElementNS(b,"linearGradient")),t.id=i,t.gradientUnits.baseVal=SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE,[t.x1,t.y1,t.x2,t.y2].forEach(function(e){e.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0);}),e.efc_gradient_stopSE=[0,1].map(function(t){var n=e.efc_gradient_gradient.appendChild(a.createElementNS(b,"stop"));try{n.offset.baseVal=t;}catch(e){if(e.code!==DOMException.NO_MODIFICATION_ALLOWED_ERR){ throw e; }n.setAttribute("offset",t);}return n}),Ie(e,"cur_plug_colorSE",te.gradient.update),Ie(e,"apl_path",te.gradient.update),e.curStats.line_altColor=!0,e.lineFace.style.stroke="url(#"+i+")",te.gradient.update(e);},remove:function(e){e.efc_gradient_gradient&&(e.defs.removeChild(e.efc_gradient_gradient),e.efc_gradient_gradient=e.efc_gradient_stopSE=null),Ce(e,"cur_plug_colorSE",te.gradient.update),Ce(e,"apl_path",te.gradient.update),e.curStats.line_altColor=!1,e.lineFace.style.stroke=e.curStats.line_color,Te(e.aplStats,te.gradient.stats);},update:function(a){var e,t,i=a.curStats,o=a.aplStats,n=o.gradient_options,l=a.pathList.animVal||a.pathList.baseVal;[0,1].forEach(function(e){i.gradient_colorSE[e]=n.colorSE[e]||i.plug_colorSE[e];}),t=l[0][0],i.gradient_pointSE[0]={x:t.x,y:t.y},t=(e=l[l.length-1])[e.length-1],i.gradient_pointSE[1]={x:t.x,y:t.y},[0,1].forEach(function(t){var n;We(a,o.gradient_colorSE,t,n=i.gradient_colorSE[t])&&(ue?(n=fe(n),a.efc_gradient_stopSE[t].style.stopColor=n[1],a.efc_gradient_stopSE[t].style.stopOpacity=n[0]):a.efc_gradient_stopSE[t].style.stopColor=n),["x","y"].forEach(function(e){(n=i.gradient_pointSE[t][e])!==o.gradient_pointSE[t][e]&&(a.efc_gradient_gradient[e+(t+1)].baseVal.value=o.gradient_pointSE[t][e]=n);});});}},dropShadow:{stats:{dropShadow_dx:{},dropShadow_dy:{},dropShadow_blur:{},dropShadow_color:{},dropShadow_opacity:{},dropShadow_x:{},dropShadow_y:{}},optionsConf:[["type","dx",null,null,null,2],["type","dy",null,null,null,4],["type","blur",null,null,null,3,function(e){return 0<=e}],["type","color",null,null,null,"#000",null,!0],["type","opacity",null,null,null,.8,function(e){return 0<=e&&e<=1}]],init:function(t){var e,n,a,i,o,l=t.baseWindow.document,r=t.defs,s=v+"-"+t._id+"-dropShadow",u=(e=l,n=s,o={},"boolean"!=typeof p&&(p=!!window.SVGFEDropShadowElement&&!ue),o.elmsAppend=[o.elmFilter=a=e.createElementNS(b,"filter")],a.filterUnits.baseVal=SVGUnitTypes.SVG_UNIT_TYPE_USERSPACEONUSE,a.x.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0),a.y.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0),a.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE,100),a.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE,100),a.id=n,p?(o.elmOffset=o.elmBlur=i=a.appendChild(e.createElementNS(b,"feDropShadow")),o.styleFlood=i.style):(o.elmBlur=a.appendChild(e.createElementNS(b,"feGaussianBlur")),o.elmOffset=i=a.appendChild(e.createElementNS(b,"feOffset")),i.result.baseVal="offsetblur",i=a.appendChild(e.createElementNS(b,"feFlood")),o.styleFlood=i.style,(i=a.appendChild(e.createElementNS(b,"feComposite"))).in2.baseVal="offsetblur",i.operator.baseVal=SVGFECompositeElement.SVG_FECOMPOSITE_OPERATOR_IN,(i=a.appendChild(e.createElementNS(b,"feMerge"))).appendChild(e.createElementNS(b,"feMergeNode")),i.appendChild(e.createElementNS(b,"feMergeNode")).in1.baseVal="SourceGraphic"),o);["elmFilter","elmOffset","elmBlur","styleFlood","elmsAppend"].forEach(function(e){t["efc_dropShadow_"+e]=u[e];}),u.elmsAppend.forEach(function(e){r.appendChild(e);}),t.face.setAttribute("filter","url(#"+s+")"),Ie(t,"new_edge4viewBox",te.dropShadow.adjustEdge),te.dropShadow.update(t);},remove:function(e){var t=e.defs;e.efc_dropShadow_elmsAppend&&(e.efc_dropShadow_elmsAppend.forEach(function(e){t.removeChild(e);}),e.efc_dropShadow_elmFilter=e.efc_dropShadow_elmOffset=e.efc_dropShadow_elmBlur=e.efc_dropShadow_styleFlood=e.efc_dropShadow_elmsAppend=null),Ce(e,"new_edge4viewBox",te.dropShadow.adjustEdge),De(e,{}),e.face.removeAttribute("filter"),Te(e.aplStats,te.dropShadow.stats);},update:function(e){var t,n,a=e.curStats,i=e.aplStats,o=i.dropShadow_options;a.dropShadow_dx=t=o.dx,We(e,i,"dropShadow_dx",t)&&(e.efc_dropShadow_elmOffset.dx.baseVal=t,n=!0),a.dropShadow_dy=t=o.dy,We(e,i,"dropShadow_dy",t)&&(e.efc_dropShadow_elmOffset.dy.baseVal=t,n=!0),a.dropShadow_blur=t=o.blur,We(e,i,"dropShadow_blur",t)&&(e.efc_dropShadow_elmBlur.setStdDeviation(t,t),n=!0),n&&De(e,{}),a.dropShadow_color=t=o.color,We(e,i,"dropShadow_color",t)&&(e.efc_dropShadow_styleFlood.floodColor=t),a.dropShadow_opacity=t=o.opacity,We(e,i,"dropShadow_opacity",t)&&(e.efc_dropShadow_styleFlood.floodOpacity=t);},adjustEdge:function(a,i){var e,t,o=a.curStats,l=a.aplStats;null!=o.dropShadow_dx&&(e=3*o.dropShadow_blur,(t={x1:i.x1-e+o.dropShadow_dx,y1:i.y1-e+o.dropShadow_dy,x2:i.x2+e+o.dropShadow_dx,y2:i.y2+e+o.dropShadow_dy}).x1<i.x1&&(i.x1=t.x1),t.y1<i.y1&&(i.y1=t.y1),t.x2>i.x2&&(i.x2=t.x2),t.y2>i.y2&&(i.y2=t.y2),["x","y"].forEach(function(e){var t,n="dropShadow_"+e;o[n]=t=i[e+"1"],We(a,l,n,t)&&(a.efc_dropShadow_elmFilter[e].baseVal.value=t);}));}}},Object.keys(te).forEach(function(e){var t=te[e],n=t.stats;n[e+"_enabled"]={iniValue:!1},n[e+"_options"]={hasProps:!0},t.anim&&(n[e+"_animOptions"]={},n[e+"_animId"]={});}),g={none:{defaultAnimOptions:{},init:function(e,t){var n=e.curStats;n.show_animId&&(c.remove(n.show_animId),n.show_animId=null),g.none.start(e,t);},start:function(e,t){g.none.stop(e,!0);},stop:function(e,t,n){var a=e.curStats;return n=null!=n?n:e.aplStats.show_on,a.show_inAnim=!1,t&&Ge(e,n),n?1:0}},fade:{defaultAnimOptions:{duration:300,timing:"linear"},init:function(n,e){var t=n.curStats,a=n.aplStats;t.show_animId&&c.remove(t.show_animId),t.show_animId=c.add(function(e){return e},function(e,t){t?g.fade.stop(n,!0):(n.svg.style.opacity=e+"",le&&(Ae(n,n.svg),Ve(n)));},a.show_animOptions.duration,1,a.show_animOptions.timing,null,!1),g.fade.start(n,e);},start:function(e,t){var n,a=e.curStats;a.show_inAnim&&(n=c.stop(a.show_animId)),Ge(e,1),a.show_inAnim=!0,c.start(a.show_animId,!e.aplStats.show_on,null!=t?t:n);},stop:function(e,t,n){var a,i=e.curStats;return n=null!=n?n:e.aplStats.show_on,a=i.show_inAnim?c.stop(i.show_animId):n?1:0,i.show_inAnim=!1,t&&(e.svg.style.opacity=n?"":"0",Ge(e,n)),a}},draw:{defaultAnimOptions:{duration:500,timing:[.58,0,.42,1]},init:function(n,e){var t=n.curStats,a=n.aplStats,l=n.pathList.baseVal,i=Oe(l),r=i.segsLen,s=i.lenAll;t.show_animId&&c.remove(t.show_animId),t.show_animId=c.add(function(e){var t,n,a,i,o=-1;if(0===e){ n=[[l[0][0],l[0][0]]]; }else if(1===e){ n=l; }else{for(t=s*e,n=[];t>=r[++o];){ n.push(l[o]),t-=r[o]; }t&&(2===(a=l[o]).length?n.push([a[0],ve(a[0],a[1],t/r[o])]):(i=xe(a[0],a[1],a[2],a[3],ke(a[0],a[1],a[2],a[3],t)),n.push([a[0],i.fromP1,i.fromP2,i])));}return n},function(e,t){t?g.draw.stop(n,!0):(n.pathList.animVal=e,De(n,{path:!0}));},a.show_animOptions.duration,1,a.show_animOptions.timing,null,!1),g.draw.start(n,e);},start:function(e,t){var n,a=e.curStats;a.show_inAnim&&(n=c.stop(a.show_animId)),Ge(e,1),a.show_inAnim=!0,Ie(e,"apl_position",g.draw.update),c.start(a.show_animId,!e.aplStats.show_on,null!=t?t:n);},stop:function(e,t,n){var a,i=e.curStats;return n=null!=n?n:e.aplStats.show_on,a=i.show_inAnim?c.stop(i.show_animId):n?1:0,i.show_inAnim=!1,t&&(e.pathList.animVal=n?null:[[e.pathList.baseVal[0][0],e.pathList.baseVal[0][0]]],De(e,{path:!0}),Ge(e,n)),a},update:function(e){Ce(e,"apl_position",g.draw.update),e.curStats.show_inAnim?g.draw.init(e,g.draw.stop(e)):e.aplStats.show_animOptions={};}}},function(){function r(n){return function(e){var t={};t[n]=e,this.setOptions(t);}}[["start","anchorSE",0],["end","anchorSE",1],["color","lineColor"],["size","lineSize"],["startSocketGravity","socketGravitySE",0],["endSocketGravity","socketGravitySE",1],["startPlugColor","plugColorSE",0],["endPlugColor","plugColorSE",1],["startPlugSize","plugSizeSE",0],["endPlugSize","plugSizeSE",1],["outline","lineOutlineEnabled"],["outlineColor","lineOutlineColor"],["outlineSize","lineOutlineSize"],["startPlugOutline","plugOutlineEnabledSE",0],["endPlugOutline","plugOutlineEnabledSE",1],["startPlugOutlineColor","plugOutlineColorSE",0],["endPlugOutlineColor","plugOutlineColorSE",1],["startPlugOutlineSize","plugOutlineSizeSE",0],["endPlugOutlineSize","plugOutlineSizeSE",1]].forEach(function(e){var t=e[0],n=e[1],a=e[2];Object.defineProperty(Ye.prototype,t,{get:function(){var e=null!=a?K[this._id].options[n][a]:n?K[this._id].options[n]:K[this._id].options[t];return null==e?x:de(e)},set:r(t),enumerable:!0});}),[["path",m],["startSocket",n,"socketSE",0],["endSocket",n,"socketSE",1],["startPlug",E,"plugSE",0],["endPlug",E,"plugSE",1]].forEach(function(e){var a=e[0],i=e[1],o=e[2],l=e[3];Object.defineProperty(Ye.prototype,a,{get:function(){var t,n=null!=l?K[this._id].options[o][l]:o?K[this._id].options[o]:K[this._id].options[a];return n?Object.keys(i).some(function(e){return i[e]===n&&(t=e,!0)})?t:new Error("It's broken"):x},set:r(a),enumerable:!0});}),Object.keys(te).forEach(function(n){var a=te[n];Object.defineProperty(Ye.prototype,n,{get:function(){var u,e,t=K[this._id].options[n];return k(t)?(u=t,e=a.optionsConf.reduce(function(e,t){var n,a=t[0],i=t[1],o=t[2],l=t[3],r=t[4],s=null!=r?u[l][r]:l?u[l]:u[i];return e[i]="id"===a?s?Object.keys(o).some(function(e){return o[e]===s&&(n=e,!0)})?n:new Error("It's broken"):x:null==s?x:de(s),e},{}),a.anim&&(e.animation=de(u.animation)),e):t},set:r(n),enumerable:!0});}),["startLabel","endLabel","middleLabel"].forEach(function(e,n){Object.defineProperty(Ye.prototype,e,{get:function(){var e=K[this._id],t=e.options;return t.labelSEM[n]&&!e.optionIsAttach.labelSEM[n]?$[t.labelSEM[n]._id].text:t.labelSEM[n]||""},set:r(e),enumerable:!0});});}(),Ye.prototype.setOptions=function(e){return Ze(K[this._id],e),this},Ye.prototype.position=function(){return De(K[this._id],{position:!0}),this},Ye.prototype.remove=function(){var t=K[this._id],n=t.curStats;Object.keys(te).forEach(function(e){var t=e+"_animId";n[t]&&c.remove(n[t]);}),n.show_animId&&c.remove(n.show_animId),t.attachments.slice().forEach(function(e){Ue(t,e);}),t.baseWindow&&t.svg&&t.baseWindow.document.body.removeChild(t.svg),delete K[this._id];},Ye.prototype.show=function(e,t){return je(K[this._id],!0,e,t),this},Ye.prototype.hide=function(e,t){return je(K[this._id],!1,e,t),this},o=function(t){t&&$[t._id]&&(t.boundTargets.slice().forEach(function(e){Ue(e.props,t,!0);}),t.conf.remove&&t.conf.remove(t),delete $[t._id]);},S=function(){function e(e,t){var n,a={conf:e,curStats:{},aplStats:{},boundTargets:[]},i={};e.argOptions.every(function(e){return !(!t.length||("string"==typeof e.type?typeof t[0]!==e.type:"function"!=typeof e.type||!e.type(t[0])))&&(i[e.optionName]=t.shift(),!0)}),n=t.length&&k(t[0])?de(t[0]):{},Object.keys(i).forEach(function(e){n[e]=i[e];}),e.stats&&(Te(a.curStats,e.stats),Te(a.aplStats,e.stats)),Object.defineProperty(this,"_id",{value:++ee}),Object.defineProperty(this,"isRemoved",{get:function(){return !$[this._id]}}),a._id=this._id,e.init&&!e.init(a,n)||($[this._id]=a);}return e.prototype.remove=function(){var t=this,n=$[t._id];n&&(n.boundTargets.slice().forEach(function(e){n.conf.removeOption(n,e);}),Le(function(){var e=$[t._id];e&&(console.error("LeaderLineAttachment was not removed by removeOption"),o(e));}));},e}(),window.LeaderLineAttachment=S,_=function(e,t){return e instanceof S&&(!(e.isRemoved||t&&$[e._id].conf.type!==t)||null)},y={pointAnchor:{type:"anchor",argOptions:[{optionName:"element",type:ye}],init:function(e,t){return e.element=y.pointAnchor.checkElement(t.element),e.x=y.pointAnchor.parsePercent(t.x,!0)||[.5,!0],e.y=y.pointAnchor.parsePercent(t.y,!0)||[.5,!0],!0},removeOption:function(e,t){var n=t.props,a={},i=e.element,o=n.options.anchorSE["start"===t.optionName?1:0];i===o&&(i=o===document.body?new S(y.pointAnchor,[i]):document.body),a[t.optionName]=i,Ze(n,a);},getBBoxNest:function(e,t){var n=ge(e.element,t.baseWindow),a=n.width,i=n.height;return n.width=n.height=0,n.left=n.right=n.left+e.x[0]*(e.x[1]?a:1),n.top=n.bottom=n.top+e.y[0]*(e.y[1]?i:1),n},parsePercent:function(e,t){var n,a,i=!1;return w(e)?a=e:"string"==typeof e&&(n=u.exec(e))&&n[2]&&(i=0!==(a=parseFloat(n[1])/100)),null!=a&&(t||0<=a)?[a,i]:null},checkElement:function(e){if(null==e){ e=document.body; }else if(!ye(e)){ throw new Error("`element` must be Element"); }return e}},areaAnchor:{type:"anchor",argOptions:[{optionName:"element",type:ye},{optionName:"shape",type:"string"}],stats:{color:{},strokeWidth:{},elementWidth:{},elementHeight:{},elementLeft:{},elementTop:{},pathListRel:{},bBoxRel:{},pathData:{},viewBoxBBox:{hasProps:!0},dashLen:{},dashGap:{}},init:function(i,e){var t,n,a,o=[];return i.element=y.pointAnchor.checkElement(e.element),"string"==typeof e.color&&(i.color=e.color.trim()),"string"==typeof e.fillColor&&(i.fill=e.fillColor.trim()),w(e.size)&&0<=e.size&&(i.size=e.size),e.dash&&(i.dash=!0,w(e.dash.len)&&0<e.dash.len&&(i.dashLen=e.dash.len),w(e.dash.gap)&&0<e.dash.gap&&(i.dashGap=e.dash.gap)),"circle"===e.shape?i.shape=e.shape:"polygon"===e.shape&&Array.isArray(e.points)&&3<=e.points.length&&e.points.every(function(e){var t={};return !(!(t.x=y.pointAnchor.parsePercent(e[0],!0))||!(t.y=y.pointAnchor.parsePercent(e[1],!0)))&&(o.push(t),(t.x[1]||t.y[1])&&(i.hasRatio=!0),!0)})?(i.shape=e.shape,i.points=o):(i.shape="rect",i.radius=w(e.radius)&&0<=e.radius?e.radius:0),"rect"!==i.shape&&"circle"!==i.shape||(i.x=y.pointAnchor.parsePercent(e.x,!0)||[-.05,!0],i.y=y.pointAnchor.parsePercent(e.y,!0)||[-.05,!0],i.width=y.pointAnchor.parsePercent(e.width)||[1.1,!0],i.height=y.pointAnchor.parsePercent(e.height)||[1.1,!0],(i.x[1]||i.y[1]||i.width[1]||i.height[1])&&(i.hasRatio=!0)),t=i.element.ownerDocument,i.svg=n=t.createElementNS(b,"svg"),n.className.baseVal=v+"-areaAnchor",n.viewBox.baseVal||n.setAttribute("viewBox","0 0 0 0"),i.path=n.appendChild(t.createElementNS(b,"path")),i.path.style.fill=i.fill||"none",i.isShown=!1,n.style.visibility="hidden",t.body.appendChild(n),Re(a=t.defaultView),i.bodyOffset=Be(a),i.updateColor=function(){var e,t=i.curStats,n=i.aplStats,a=i.boundTargets.length?i.boundTargets[0].props.curStats:null;t.color=e=i.color||(a?a.line_color:pe.lineColor),We(i,n,"color",e)&&(i.path.style.stroke=e);},i.updateShow=function(){Ge(i,i.boundTargets.some(function(e){return !0===e.props.isShown}));},!0},bind:function(e,t){var n=t.props;return e.color||Ie(n,"cur_line_color",e.updateColor),Ie(n,"svgShow",e.updateShow),Le(function(){e.updateColor(),e.updateShow();}),!0},unbind:function(e,t){var n=t.props;e.color||Ce(n,"cur_line_color",e.updateColor),Ce(n,"svgShow",e.updateShow),1<e.boundTargets.length&&Le(function(){e.updateColor(),e.updateShow(),y.areaAnchor.update(e)&&e.boundTargets.forEach(function(e){De(e.props,{position:!0});});});},removeOption:function(e,t){y.pointAnchor.removeOption(e,t);},remove:function(t){t.boundTargets.length&&(console.error("LeaderLineAttachment was not unbound by remove"),t.boundTargets.forEach(function(e){y.areaAnchor.unbind(t,e);})),t.svg.parentNode.removeChild(t.svg);},getStrokeWidth:function(e,t){return y.areaAnchor.update(e)&&1<e.boundTargets.length&&Le(function(){e.boundTargets.forEach(function(e){e.props!==t&&De(e.props,{position:!0});});}),e.curStats.strokeWidth},getPathData:function(e,t){var n=ge(e.element,t.baseWindow);return we(e.curStats.pathListRel,function(e){e.x+=n.left,e.y+=n.top;})},getBBoxNest:function(e,t){var n=ge(e.element,t.baseWindow),a=e.curStats.bBoxRel;return {left:a.left+n.left,top:a.top+n.top,right:a.right+n.left,bottom:a.bottom+n.top,width:a.width,height:a.height}},update:function(t){var a,n,i,o,e,l,r,s,u,h,p,c,d,f,y,S,m,g,_,v,E,x,b,k,w,O,M,I,C,L,A,V,P=t.curStats,N=t.aplStats,T=t.boundTargets.length?t.boundTargets[0].props.curStats:null,W={};if(W.strokeWidth=We(t,P,"strokeWidth",null!=t.size?t.size:T?T.line_strokeWidth:pe.lineSize),a=Se(t.element),W.elementWidth=We(t,P,"elementWidth",a.width),W.elementHeight=We(t,P,"elementHeight",a.height),W.elementLeft=We(t,P,"elementLeft",a.left),W.elementTop=We(t,P,"elementTop",a.top),W.strokeWidth||t.hasRatio&&(W.elementWidth||W.elementHeight)){switch(t.shape){case"rect":(v={left:t.x[0]*(t.x[1]?a.width:1),top:t.y[0]*(t.y[1]?a.height:1),width:t.width[0]*(t.width[1]?a.width:1),height:t.height[0]*(t.height[1]?a.height:1)}).right=v.left+v.width,v.bottom=v.top+v.height,k=P.strokeWidth/2,x=(b=Math.min(v.width,v.height))?b/2*Math.SQRT2+k:0,(E=t.radius?t.radius<=x?t.radius:x:0)?(O=E-(w=(E-k)/Math.SQRT2),I=E*U,M=[{x:v.left-O,y:v.top+w},{x:v.left+w,y:v.top-O},{x:v.right-w,y:v.top-O},{x:v.right+O,y:v.top+w},{x:v.right+O,y:v.bottom-w},{x:v.right-w,y:v.bottom+O},{x:v.left+w,y:v.bottom+O},{x:v.left-O,y:v.bottom-w}],P.pathListRel=[[M[0],{x:M[0].x,y:M[0].y-I},{x:M[1].x-I,y:M[1].y},M[1]]],M[1].x!==M[2].x&&P.pathListRel.push([M[1],M[2]]),P.pathListRel.push([M[2],{x:M[2].x+I,y:M[2].y},{x:M[3].x,y:M[3].y-I},M[3]]),M[3].y!==M[4].y&&P.pathListRel.push([M[3],M[4]]),P.pathListRel.push([M[4],{x:M[4].x,y:M[4].y+I},{x:M[5].x+I,y:M[5].y},M[5]]),M[5].x!==M[6].x&&P.pathListRel.push([M[5],M[6]]),P.pathListRel.push([M[6],{x:M[6].x-I,y:M[6].y},{x:M[7].x,y:M[7].y+I},M[7]]),M[7].y!==M[0].y&&P.pathListRel.push([M[7],M[0]]),P.pathListRel.push([]),O=E-w+P.strokeWidth/2,M=[{x:v.left-O,y:v.top-O},{x:v.right+O,y:v.bottom+O}]):(O=P.strokeWidth/2,M=[{x:v.left-O,y:v.top-O},{x:v.right+O,y:v.bottom+O}],P.pathListRel=[[M[0],{x:M[1].x,y:M[0].y}],[{x:M[1].x,y:M[0].y},M[1]],[M[1],{x:M[0].x,y:M[1].y}],[]],M=[{x:v.left-P.strokeWidth,y:v.top-P.strokeWidth},{x:v.right+P.strokeWidth,y:v.bottom+P.strokeWidth}]),P.bBoxRel={left:M[0].x,top:M[0].y,right:M[1].x,bottom:M[1].y,width:M[1].x-M[0].x,height:M[1].y-M[0].y};break;case"circle":(r={left:t.x[0]*(t.x[1]?a.width:1),top:t.y[0]*(t.y[1]?a.height:1),width:t.width[0]*(t.width[1]?a.width:1),height:t.height[0]*(t.height[1]?a.height:1)}).width||r.height||(r.width=r.height=10),r.width||(r.width=r.height),r.height||(r.height=r.width),r.right=r.left+r.width,r.bottom=r.top+r.height,s=r.left+r.width/2,u=r.top+r.height/2,f=P.strokeWidth/2,y=r.width/2,S=r.height/2,h=y*Math.SQRT2+f,p=S*Math.SQRT2+f,c=h*U,d=p*U,_=[{x:s-h,y:u},{x:s,y:u-p},{x:s+h,y:u},{x:s,y:u+p}],P.pathListRel=[[_[0],{x:_[0].x,y:_[0].y-d},{x:_[1].x-c,y:_[1].y},_[1]],[_[1],{x:_[1].x+c,y:_[1].y},{x:_[2].x,y:_[2].y-d},_[2]],[_[2],{x:_[2].x,y:_[2].y+d},{x:_[3].x+c,y:_[3].y},_[3]],[_[3],{x:_[3].x-c,y:_[3].y},{x:_[0].x,y:_[0].y+d},_[0]],[]],m=h-y+P.strokeWidth/2,g=p-S+P.strokeWidth/2,_=[{x:r.left-m,y:r.top-g},{x:r.right+m,y:r.bottom+g}],P.bBoxRel={left:_[0].x,top:_[0].y,right:_[1].x,bottom:_[1].y,width:_[1].x-_[0].x,height:_[1].y-_[0].y};break;case"polygon":t.points.forEach(function(e){var t=e.x[0]*(e.x[1]?a.width:1),n=e.y[0]*(e.y[1]?a.height:1);i?(t<i.left&&(i.left=t),t>i.right&&(i.right=t),n<i.top&&(i.top=n),n>i.bottom&&(i.bottom=n)):i={left:t,right:t,top:n,bottom:n},o?P.pathListRel.push([o,{x:t,y:n}]):P.pathListRel=[],o={x:t,y:n};}),P.pathListRel.push([]),e=P.strokeWidth/2,l=[{x:i.left-e,y:i.top-e},{x:i.right+e,y:i.bottom+e}],P.bBoxRel={left:l[0].x,top:l[0].y,right:l[1].x,bottom:l[1].y,width:l[1].x-l[0].x,height:l[1].y-l[0].y};}W.pathListRel=W.bBoxRel=!0;}return (W.pathListRel||W.elementLeft||W.elementTop)&&(P.pathData=we(P.pathListRel,function(e){e.x+=a.left,e.y+=a.top;})),We(t,N,"strokeWidth",n=P.strokeWidth)&&(t.path.style.strokeWidth=n+"px"),Me(n=P.pathData,N.pathData)&&(t.path.setPathData(n),N.pathData=n,W.pathData=!0),t.dash&&(!W.pathData&&(!W.strokeWidth||t.dashLen&&t.dashGap)||(P.dashLen=t.dashLen||2*P.strokeWidth,P.dashGap=t.dashGap||P.strokeWidth),W.dash=We(t,N,"dashLen",P.dashLen)||W.dash,W.dash=We(t,N,"dashGap",P.dashGap)||W.dash,W.dash&&(t.path.style.strokeDasharray=N.dashLen+","+N.dashGap)),C=P.viewBoxBBox,L=N.viewBoxBBox,A=t.svg.viewBox.baseVal,V=t.svg.style,C.x=P.bBoxRel.left+a.left,C.y=P.bBoxRel.top+a.top,C.width=P.bBoxRel.width,C.height=P.bBoxRel.height,["x","y","width","height"].forEach(function(e){(n=C[e])!==L[e]&&(A[e]=L[e]=n,V[oe[e]]=n+("x"===e||"y"===e?t.bodyOffset[e]:0)+"px");}),W.strokeWidth||W.pathListRel||W.bBoxRel}},mouseHoverAnchor:{type:"anchor",argOptions:[{optionName:"element",type:ye},{optionName:"showEffectName",type:"string"}],style:{backgroundImage:"url('data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cG9seWdvbiBwb2ludHM9IjI0LDAgMCw4IDgsMTEgMCwxOSA1LDI0IDEzLDE2IDE2LDI0IiBmaWxsPSJjb3JhbCIvPjwvc3ZnPg==')",backgroundSize:"",backgroundRepeat:"no-repeat",backgroundColor:"#f8f881",cursor:"default"},hoverStyle:{backgroundImage:"none",backgroundColor:"#fadf8f"},padding:{top:1,right:15,bottom:1,left:2},minHeight:15,backgroundPosition:{right:2,top:2},backgroundSize:{width:12,height:12},dirKeys:[["top","Top"],["right","Right"],["bottom","Bottom"],["left","Left"]],init:function(a,i){var o,t,e,n,l,r,s,u,h,p,c,d=y.mouseHoverAnchor,f={};if(a.element=y.pointAnchor.checkElement(i.element),u=a.element,!((p=u.ownerDocument)&&(h=p.defaultView)&&h.HTMLElement&&u instanceof h.HTMLElement)){ throw new Error("`element` must be HTML element"); }return d.style.backgroundSize=d.backgroundSize.width+"px "+d.backgroundSize.height+"px",["style","hoverStyle"].forEach(function(e){var n=d[e];a[e]=Object.keys(n).reduce(function(e,t){return e[t]=n[t],e},{});}),"inline"===(o=a.element.ownerDocument.defaultView.getComputedStyle(a.element,"")).display?a.style.display="inline-block":"none"===o.display&&(a.style.display="block"),y.mouseHoverAnchor.dirKeys.forEach(function(e){var t=e[0],n="padding"+e[1];parseFloat(o[n])<d.padding[t]&&(a.style[n]=d.padding[t]+"px");}),a.style.display&&(n=a.element.style.display,a.element.style.display=a.style.display),y.mouseHoverAnchor.dirKeys.forEach(function(e){var t="padding"+e[1];a.style[t]&&(f[t]=a.element.style[t],a.element.style[t]=a.style[t]);}),(e=a.element.getBoundingClientRect()).height<d.minHeight&&(le?(c=d.minHeight,"content-box"===o.boxSizing?c-=parseFloat(o.borderTopWidth)+parseFloat(o.borderBottomWidth)+parseFloat(o.paddingTop)+parseFloat(o.paddingBottom):"padding-box"===o.boxSizing&&(c-=parseFloat(o.borderTopWidth)+parseFloat(o.borderBottomWidth)),a.style.height=c+"px"):a.style.height=parseFloat(o.height)+(d.minHeight-e.height)+"px"),a.style.backgroundPosition=ue?e.width-d.backgroundSize.width-d.backgroundPosition.right+"px "+d.backgroundPosition.top+"px":"right "+d.backgroundPosition.right+"px top "+d.backgroundPosition.top+"px",a.style.display&&(a.element.style.display=n),y.mouseHoverAnchor.dirKeys.forEach(function(e){var t="padding"+e[1];a.style[t]&&(a.element.style[t]=f[t]);}),["style","hoverStyle"].forEach(function(e){var t=a[e],n=i[e];k(n)&&Object.keys(n).forEach(function(e){"string"==typeof n[e]||w(n[e])?t[e]=n[e]:null==n[e]&&delete t[e];});}),"function"==typeof i.onSwitch&&(s=i.onSwitch),i.showEffectName&&g[i.showEffectName]&&(a.showEffectName=l=i.showEffectName),r=i.animOptions,a.elmStyle=t=a.element.style,a.mouseenter=function(e){a.hoverStyleSave=d.getStyles(t,Object.keys(a.hoverStyle)),d.setStyles(t,a.hoverStyle),a.boundTargets.forEach(function(e){je(e.props,!0,l,r);}),s&&s(e);},a.mouseleave=function(e){d.setStyles(t,a.hoverStyleSave),a.boundTargets.forEach(function(e){je(e.props,!1,l,r);}),s&&s(e);},!0},bind:function(e,t){var n,a,i,o,l;return t.props.svg?y.mouseHoverAnchor.llShow(t.props,!1,e.showEffectName):Le(function(){y.mouseHoverAnchor.llShow(t.props,!1,e.showEffectName);}),e.enabled||(e.styleSave=y.mouseHoverAnchor.getStyles(e.elmStyle,Object.keys(e.style)),y.mouseHoverAnchor.setStyles(e.elmStyle,e.style),e.removeEventListener=(n=e.element,a=e.mouseenter,i=e.mouseleave,"onmouseenter"in n&&"onmouseleave"in n?(n.addEventListener("mouseenter",a,!1),n.addEventListener("mouseleave",i,!1),function(){n.removeEventListener("mouseenter",a,!1),n.removeEventListener("mouseleave",i,!1);}):(console.warn("mouseenter and mouseleave events polyfill is enabled."),o=function(e){e.relatedTarget&&(e.relatedTarget===this||this.compareDocumentPosition(e.relatedTarget)&Node.DOCUMENT_POSITION_CONTAINED_BY)||a.apply(this,arguments);},n.addEventListener("mouseover",o),l=function(e){e.relatedTarget&&(e.relatedTarget===this||this.compareDocumentPosition(e.relatedTarget)&Node.DOCUMENT_POSITION_CONTAINED_BY)||i.apply(this,arguments);},n.addEventListener("mouseout",l),function(){n.removeEventListener("mouseover",o,!1),n.removeEventListener("mouseout",l,!1);})),e.enabled=!0),!0},unbind:function(e,t){e.enabled&&e.boundTargets.length<=1&&(e.removeEventListener(),y.mouseHoverAnchor.setStyles(e.elmStyle,e.styleSave),e.enabled=!1),y.mouseHoverAnchor.llShow(t.props,!0,e.showEffectName);},removeOption:function(e,t){y.pointAnchor.removeOption(e,t);},remove:function(t){t.boundTargets.length&&(console.error("LeaderLineAttachment was not unbound by remove"),t.boundTargets.forEach(function(e){y.mouseHoverAnchor.unbind(t,e);}));},getBBoxNest:function(e,t){return ge(e.element,t.baseWindow)},llShow:function(e,t,n){g[n||e.curStats.show_effect].stop(e,!0,t),e.aplStats.show_on=t;},getStyles:function(n,e){return e.reduce(function(e,t){return e[t]=n[t],e},{})},setStyles:function(t,n){Object.keys(n).forEach(function(e){t[e]=n[e];});}},captionLabel:{type:"label",argOptions:[{optionName:"text",type:"string"}],stats:{color:{},x:{},y:{}},textStyleProps:["fontFamily","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","kerning","letterSpacing","wordSpacing","textDecoration"],init:function(u,t){return "string"==typeof t.text&&(u.text=t.text.trim()),!!u.text&&("string"==typeof t.color&&(u.color=t.color.trim()),u.outlineColor="string"==typeof t.outlineColor?t.outlineColor.trim():"#fff",Array.isArray(t.offset)&&w(t.offset[0])&&w(t.offset[1])&&(u.offset={x:t.offset[0],y:t.offset[1]}),w(t.lineOffset)&&(u.lineOffset=t.lineOffset),y.captionLabel.textStyleProps.forEach(function(e){null!=t[e]&&(u[e]=t[e]);}),u.updateColor=function(e){y.captionLabel.updateColor(u,e);},u.updateSocketXY=function(e){var t,n,a,i,o=u.curStats,l=u.aplStats,r=e.curStats,s=r.position_socketXYSE[u.socketIndex];null!=s.x&&(u.offset?(o.x=s.x+u.offset.x,o.y=s.y+u.offset.y):(t=u.height/2,n=Math.max(r.attach_plugSideLenSE[u.socketIndex]||0,r.line_strokeWidth/2),a=r.position_socketXYSE[u.socketIndex?0:1],s.socketId===L||s.socketId===I?(o.x=s.socketId===L?s.x-t-u.width:s.x+t,o.y=a.y<s.y?s.y+n+t:s.y-n-t-u.height):(o.x=a.x<s.x?s.x+n+t:s.x-n-t-u.width,o.y=s.socketId===M?s.y-t-u.height:s.y+t)),We(u,l,"x",i=o.x)&&(u.elmPosition.x.baseVal.getItem(0).value=i),We(u,l,"y",i=o.y)&&(u.elmPosition.y.baseVal.getItem(0).value=i+u.height));},u.updatePath=function(e){var t,n,a=u.curStats,i=u.aplStats,o=e.pathList.animVal||e.pathList.baseVal;o&&(t=y.captionLabel.getMidPoint(o,u.lineOffset),a.x=t.x-u.width/2,a.y=t.y-u.height/2,We(u,i,"x",n=a.x)&&(u.elmPosition.x.baseVal.getItem(0).value=n),We(u,i,"y",n=a.y)&&(u.elmPosition.y.baseVal.getItem(0).value=n+u.height));},u.updateShow=function(e){y.captionLabel.updateShow(u,e);},ue&&(u.adjustEdge=function(e,t){var n=u.curStats;null!=n.x&&y.captionLabel.adjustEdge(t,{x:n.x,y:n.y,width:u.width,height:u.height},u.strokeWidth/2);}),!0)},updateColor:function(e,t){var n,a=e.curStats,i=e.aplStats,o=t.curStats;a.color=n=e.color||o.line_color,We(e,i,"color",n)&&(e.styleFill.fill=n);},updateShow:function(e,t){var n=!0===t.isShown;n!==e.isShown&&(e.styleShow.visibility=n?"":"hidden",e.isShown=n);},adjustEdge:function(e,t,n){var a={x1:t.x-n,y1:t.y-n,x2:t.x+t.width+n,y2:t.y+t.height+n};a.x1<e.x1&&(e.x1=a.x1),a.y1<e.y1&&(e.y1=a.y1),a.x2>e.x2&&(e.x2=a.x2),a.y2>e.y2&&(e.y2=a.y2);},newText:function(e,t,n,a,i){var o,l,r,s,u,h;return (o=t.createElementNS(b,"text")).textContent=e,[o.x,o.y].forEach(function(e){var t=n.createSVGLength();t.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0),e.baseVal.initialize(t);}),"boolean"!=typeof f&&(f="paintOrder"in o.style),i&&!f?(r=t.createElementNS(b,"defs"),o.id=a,r.appendChild(o),(u=(l=t.createElementNS(b,"g")).appendChild(t.createElementNS(b,"use"))).href.baseVal="#"+a,(s=l.appendChild(t.createElementNS(b,"use"))).href.baseVal="#"+a,(h=u.style).strokeLinejoin="round",{elmPosition:o,styleText:o.style,styleFill:s.style,styleStroke:h,styleShow:l.style,elmsAppend:[r,l]}):(h=o.style,i&&(h.strokeLinejoin="round",h.paintOrder="stroke"),{elmPosition:o,styleText:h,styleFill:h,styleStroke:i?h:null,styleShow:h,elmsAppend:[o]})},getMidPoint:function(e,t){var n,a,i,o=Oe(e),l=o.segsLen,r=o.lenAll,s=-1;if((n=r/2+(t||0))<=0){ return 2===(a=e[0]).length?ve(a[0],a[1],0):xe(a[0],a[1],a[2],a[3],0); }if(r<=n){ return 2===(a=e[e.length-1]).length?ve(a[0],a[1],1):xe(a[0],a[1],a[2],a[3],1); }for(i=[];n>l[++s];){ i.push(e[s]),n-=l[s]; }return 2===(a=e[s]).length?ve(a[0],a[1],n/l[s]):xe(a[0],a[1],a[2],a[3],ke(a[0],a[1],a[2],a[3],n))},initSvg:function(t,n){var e,a,i=y.captionLabel.newText(t.text,n.baseWindow.document,n.svg,v+"-captionLabel-"+t._id,t.outlineColor);["elmPosition","styleFill","styleShow","elmsAppend"].forEach(function(e){t[e]=i[e];}),t.isShown=!1,t.styleShow.visibility="hidden",y.captionLabel.textStyleProps.forEach(function(e){null!=t[e]&&(i.styleText[e]=t[e]);}),i.elmsAppend.forEach(function(e){n.svg.appendChild(e);}),e=i.elmPosition.getBBox(),t.width=e.width,t.height=e.height,t.outlineColor&&(a=10<(a=e.height/9)?10:a<2?2:a,i.styleStroke.strokeWidth=a+"px",i.styleStroke.stroke=t.outlineColor),t.strokeWidth=a||0,Te(t.aplStats,y.captionLabel.stats),t.updateColor(n),t.refSocketXY?t.updateSocketXY(n):t.updatePath(n),ue&&De(n,{}),t.updateShow(n);},bind:function(e,t){var n=t.props;return e.color||Ie(n,"cur_line_color",e.updateColor),(e.refSocketXY="startLabel"===t.optionName||"endLabel"===t.optionName)?(e.socketIndex="startLabel"===t.optionName?0:1,Ie(n,"apl_position",e.updateSocketXY),e.offset||(Ie(n,"cur_attach_plugSideLenSE",e.updateSocketXY),Ie(n,"cur_line_strokeWidth",e.updateSocketXY))):Ie(n,"apl_path",e.updatePath),Ie(n,"svgShow",e.updateShow),ue&&Ie(n,"new_edge4viewBox",e.adjustEdge),y.captionLabel.initSvg(e,n),!0},unbind:function(e,t){var n=t.props;e.elmsAppend&&(e.elmsAppend.forEach(function(e){n.svg.removeChild(e);}),e.elmPosition=e.styleFill=e.styleShow=e.elmsAppend=null),Te(e.curStats,y.captionLabel.stats),Te(e.aplStats,y.captionLabel.stats),e.color||Ce(n,"cur_line_color",e.updateColor),e.refSocketXY?(Ce(n,"apl_position",e.updateSocketXY),e.offset||(Ce(n,"cur_attach_plugSideLenSE",e.updateSocketXY),Ce(n,"cur_line_strokeWidth",e.updateSocketXY))):Ce(n,"apl_path",e.updatePath),Ce(n,"svgShow",e.updateShow),ue&&(Ce(n,"new_edge4viewBox",e.adjustEdge),De(n,{}));},removeOption:function(e,t){var n=t.props,a={};a[t.optionName]="",Ze(n,a);},remove:function(t){t.boundTargets.length&&(console.error("LeaderLineAttachment was not unbound by remove"),t.boundTargets.forEach(function(e){y.captionLabel.unbind(t,e);}));}},pathLabel:{type:"label",argOptions:[{optionName:"text",type:"string"}],stats:{color:{},startOffset:{},pathData:{}},init:function(s,t){return "string"==typeof t.text&&(s.text=t.text.trim()),!!s.text&&("string"==typeof t.color&&(s.color=t.color.trim()),s.outlineColor="string"==typeof t.outlineColor?t.outlineColor.trim():"#fff",w(t.lineOffset)&&(s.lineOffset=t.lineOffset),y.captionLabel.textStyleProps.forEach(function(e){null!=t[e]&&(s[e]=t[e]);}),s.updateColor=function(e){y.captionLabel.updateColor(s,e);},s.updatePath=function(e){var t,n=s.curStats,a=s.aplStats,i=e.curStats,o=e.pathList.animVal||e.pathList.baseVal;o&&(n.pathData=t=y.pathLabel.getOffsetPathData(o,i.line_strokeWidth/2+s.strokeWidth/2+s.height/4,1.25*s.height),Me(t,a.pathData)&&(s.elmPath.setPathData(t),a.pathData=t,s.bBox=s.elmPosition.getBBox(),s.updateStartOffset(e)));},s.updateStartOffset=function(e){var t,n,a,i,o=s.curStats,l=s.aplStats,r=e.curStats;o.pathData&&((2!==s.semIndex||s.lineOffset)&&(t=o.pathData.reduce(function(e,t){var n,a=t.values;switch(t.type){case"M":i={x:a[0],y:a[1]};break;case"L":n={x:a[0],y:a[1]},i&&(e+=_e(i,n)),i=n;break;case"C":n={x:a[4],y:a[5]},i&&(e+=be(i,{x:a[0],y:a[1]},{x:a[2],y:a[3]},n)),i=n;}return e},0),a=0===s.semIndex?0:1===s.semIndex?t:t/2,2!==s.semIndex&&(n=Math.max(r.attach_plugBackLenSE[s.semIndex]||0,r.line_strokeWidth/2)+s.strokeWidth/2+s.height/4,a=(a+=0===s.semIndex?n:-n)<0?0:t<a?t:a),s.lineOffset&&(a=(a+=s.lineOffset)<0?0:t<a?t:a),o.startOffset=a,We(s,l,"startOffset",a)&&(s.elmOffset.startOffset.baseVal.value=a)));},s.updateShow=function(e){y.captionLabel.updateShow(s,e);},ue&&(s.adjustEdge=function(e,t){s.bBox&&y.captionLabel.adjustEdge(t,s.bBox,s.strokeWidth/2);}),!0)},getOffsetPathData:function(e,x,n){var b,a,i=3,k=[];function w(e,t){return Math.abs(e.x-t.x)<i&&Math.abs(e.y-t.y)<i}return e.forEach(function(e){var t,n,a,i,o,l,r,s,u,h,p,c,d,f,y,S,m,g,_,v,E;2===e.length?(g=e[0],_=e[1],v=x,E=Math.atan2(g.y-_.y,_.x-g.x)+.5*Math.PI,t=[{x:g.x+Math.cos(E)*v,y:g.y+Math.sin(E)*v*-1},{x:_.x+Math.cos(E)*v,y:_.y+Math.sin(E)*v*-1}],b?(a=b.points,0<=(i=Math.atan2(a[1].y-a[0].y,a[0].x-a[1].x)-Math.atan2(e[0].y-e[1].y,e[1].x-e[0].x))&&i<=Math.PI?n={type:"line",points:t,inside:!0}:(l=Ee(a[0],a[1],x),o=Ee(t[1],t[0],x),s=a[0],h=o,p=t[1],c=(u=l).x-s.x,d=u.y-s.y,f=p.x-h.x,y=p.y-h.y,S=(-d*(s.x-h.x)+c*(s.y-h.y))/(-f*d+c*y),m=(f*(s.y-h.y)-y*(s.x-h.x))/(-f*d+c*y),(r=0<=S&&S<=1&&0<=m&&m<=1?{x:s.x+m*c,y:s.y+m*d}:null)?n={type:"line",points:[a[1]=r,t[1]]}:(a[1]=w(o,l)?o:l,n={type:"line",points:[o,t[1]]}),b.len=_e(a[0],a[1]))):n={type:"line",points:t},n.len=_e(n.points[0],n.points[1]),k.push(b=n)):(k.push({type:"cubic",points:function(e,t,n,a,i,o){for(var l,r,s=be(e,t,n,a)/o,u=1/(o<i?s*(i/o):s),h=[],p=0;r=(90-(l=xe(e,t,n,a,p)).angle)*(Math.PI/180),h.push({x:l.x+Math.cos(r)*i,y:l.y+Math.sin(r)*i*-1}),!(1<=p);){ 1<(p+=u)&&(p=1); }return h}(e[0],e[1],e[2],e[3],x,16)}),b=null);}),b=null,k.forEach(function(e){var t;"line"===e.type?(e.inside&&(b.len>x?((t=b.points)[1]=Ee(t[0],t[1],-x),b.len=_e(t[0],t[1])):(b.points=null,b.len=0),e.len>x+n?((t=e.points)[0]=Ee(t[1],t[0],-(x+n)),e.len=_e(t[0],t[1])):(e.points=null,e.len=0)),b=e):b=null;}),k.reduce(function(t,e){var n=e.points;return n&&(a&&w(n[0],a)||t.push({type:"M",values:[n[0].x,n[0].y]}),"line"===e.type?t.push({type:"L",values:[n[1].x,n[1].y]}):(n.shift(),n.forEach(function(e){t.push({type:"L",values:[e.x,e.y]});})),a=n[n.length-1]),t},[])},newText:function(e,t,n,a){var i,o,l,r,s,u,h,p,c,d;return (r=(l=t.createElementNS(b,"defs")).appendChild(t.createElementNS(b,"path"))).id=i=n+"-path",(u=(s=t.createElementNS(b,"text")).appendChild(t.createElementNS(b,"textPath"))).href.baseVal="#"+i,u.startOffset.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,0),u.textContent=e,"boolean"!=typeof f&&(f="paintOrder"in s.style),a&&!f?(s.id=o=n+"-text",l.appendChild(s),(c=(h=t.createElementNS(b,"g")).appendChild(t.createElementNS(b,"use"))).href.baseVal="#"+o,(p=h.appendChild(t.createElementNS(b,"use"))).href.baseVal="#"+o,(d=c.style).strokeLinejoin="round",{elmPosition:s,elmPath:r,elmOffset:u,styleText:s.style,styleFill:p.style,styleStroke:d,styleShow:h.style,elmsAppend:[l,h]}):(d=s.style,a&&(d.strokeLinejoin="round",d.paintOrder="stroke"),{elmPosition:s,elmPath:r,elmOffset:u,styleText:d,styleFill:d,styleStroke:a?d:null,styleShow:d,elmsAppend:[l,s]})},initSvg:function(t,n){var e,a,i=y.pathLabel.newText(t.text,n.baseWindow.document,v+"-pathLabel-"+t._id,t.outlineColor);["elmPosition","elmPath","elmOffset","styleFill","styleShow","elmsAppend"].forEach(function(e){t[e]=i[e];}),t.isShown=!1,t.styleShow.visibility="hidden",y.captionLabel.textStyleProps.forEach(function(e){null!=t[e]&&(i.styleText[e]=t[e]);}),i.elmsAppend.forEach(function(e){n.svg.appendChild(e);}),i.elmPath.setPathData([{type:"M",values:[0,100]},{type:"h",values:[100]}]),e=i.elmPosition.getBBox(),i.styleText.textAnchor=["start","end","middle"][t.semIndex],2!==t.semIndex||t.lineOffset||i.elmOffset.startOffset.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE,50),t.height=e.height,t.outlineColor&&(a=10<(a=e.height/9)?10:a<2?2:a,i.styleStroke.strokeWidth=a+"px",i.styleStroke.stroke=t.outlineColor),t.strokeWidth=a||0,Te(t.aplStats,y.pathLabel.stats),t.updateColor(n),t.updatePath(n),t.updateStartOffset(n),ue&&De(n,{}),t.updateShow(n);},bind:function(e,t){var n=t.props;return e.color||Ie(n,"cur_line_color",e.updateColor),Ie(n,"cur_line_strokeWidth",e.updatePath),Ie(n,"apl_path",e.updatePath),e.semIndex="startLabel"===t.optionName?0:"endLabel"===t.optionName?1:2,(2!==e.semIndex||e.lineOffset)&&Ie(n,"cur_attach_plugBackLenSE",e.updateStartOffset),Ie(n,"svgShow",e.updateShow),ue&&Ie(n,"new_edge4viewBox",e.adjustEdge),y.pathLabel.initSvg(e,n),!0},unbind:function(e,t){var n=t.props;e.elmsAppend&&(e.elmsAppend.forEach(function(e){n.svg.removeChild(e);}),e.elmPosition=e.elmPath=e.elmOffset=e.styleFill=e.styleShow=e.elmsAppend=null),Te(e.curStats,y.pathLabel.stats),Te(e.aplStats,y.pathLabel.stats),e.color||Ce(n,"cur_line_color",e.updateColor),Ce(n,"cur_line_strokeWidth",e.updatePath),Ce(n,"apl_path",e.updatePath),(2!==e.semIndex||e.lineOffset)&&Ce(n,"cur_attach_plugBackLenSE",e.updateStartOffset),Ce(n,"svgShow",e.updateShow),ue&&(Ce(n,"new_edge4viewBox",e.adjustEdge),De(n,{}));},removeOption:function(e,t){var n=t.props,a={};a[t.optionName]="",Ze(n,a);},remove:function(t){t.boundTargets.length&&(console.error("LeaderLineAttachment was not unbound by remove"),t.boundTargets.forEach(function(e){y.pathLabel.unbind(t,e);}));}}},Object.keys(y).forEach(function(e){Ye[e]=function(){return new S(y[e],Array.prototype.slice.call(arguments))};}),Ye.positionByWindowResize=!0,window.addEventListener("resize",O.add(function(){Ye.positionByWindowResize&&Object.keys(K).forEach(function(e){De(K[e],{position:!0});});}),!1),Ye}();

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

	var isDom = isNode;

	function isNode (val) {
	  return (!val || typeof val !== 'object')
	    ? false
	    : (typeof window === 'object' && typeof window.Node === 'object')
	      ? (val instanceof window.Node)
	      : (typeof val.nodeType === 'number') &&
	        (typeof val.nodeName === 'string')
	}

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

	/**!
	 * @fileOverview Kickass library to create and place poppers near their reference elements.
	 * @version 1.14.7
	 * @license
	 * Copyright (c) 2016 Federico Zivolo and contributors
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 */
	var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

	var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
	var timeoutDuration = 0;
	for (var i$1 = 0; i$1 < longerTimeoutBrowsers.length; i$1 += 1) {
	  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i$1]) >= 0) {
	    timeoutDuration = 1;
	    break;
	  }
	}

	function microtaskDebounce(fn) {
	  var called = false;
	  return function () {
	    if (called) {
	      return;
	    }
	    called = true;
	    window.Promise.resolve().then(function () {
	      called = false;
	      fn();
	    });
	  };
	}

	function taskDebounce(fn) {
	  var scheduled = false;
	  return function () {
	    if (!scheduled) {
	      scheduled = true;
	      setTimeout(function () {
	        scheduled = false;
	        fn();
	      }, timeoutDuration);
	    }
	  };
	}

	var supportsMicroTasks = isBrowser && window.Promise;

	/**
	* Create a debounced version of a method, that's asynchronously deferred
	* but called in the minimum time possible.
	*
	* @method
	* @memberof Popper.Utils
	* @argument {Function} fn
	* @returns {Function}
	*/
	var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

	/**
	 * Check if the given variable is a function
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Any} functionToCheck - variable to check
	 * @returns {Boolean} answer to: is a function?
	 */
	function isFunction(functionToCheck) {
	  var getType = {};
	  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}

	/**
	 * Get CSS computed property of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Eement} element
	 * @argument {String} property
	 */
	function getStyleComputedProperty(element, property) {
	  if (element.nodeType !== 1) {
	    return [];
	  }
	  // NOTE: 1 DOM access here
	  var window = element.ownerDocument.defaultView;
	  var css = window.getComputedStyle(element, null);
	  return property ? css[property] : css;
	}

	/**
	 * Returns the parentNode or the host of the element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} parent
	 */
	function getParentNode(element) {
	  if (element.nodeName === 'HTML') {
	    return element;
	  }
	  return element.parentNode || element.host;
	}

	/**
	 * Returns the scrolling parent of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} scroll parent
	 */
	function getScrollParent(element) {
	  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
	  if (!element) {
	    return document.body;
	  }

	  switch (element.nodeName) {
	    case 'HTML':
	    case 'BODY':
	      return element.ownerDocument.body;
	    case '#document':
	      return element.body;
	  }

	  // Firefox want us to check `-x` and `-y` variations as well

	  var _getStyleComputedProp = getStyleComputedProperty(element),
	      overflow = _getStyleComputedProp.overflow,
	      overflowX = _getStyleComputedProp.overflowX,
	      overflowY = _getStyleComputedProp.overflowY;

	  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
	    return element;
	  }

	  return getScrollParent(getParentNode(element));
	}

	var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
	var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

	/**
	 * Determines if the browser is Internet Explorer
	 * @method
	 * @memberof Popper.Utils
	 * @param {Number} version to check
	 * @returns {Boolean} isIE
	 */
	function isIE(version) {
	  if (version === 11) {
	    return isIE11;
	  }
	  if (version === 10) {
	    return isIE10;
	  }
	  return isIE11 || isIE10;
	}

	/**
	 * Returns the offset parent of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} offset parent
	 */
	function getOffsetParent(element) {
	  if (!element) {
	    return document.documentElement;
	  }

	  var noOffsetParent = isIE(10) ? document.body : null;

	  // NOTE: 1 DOM access here
	  var offsetParent = element.offsetParent || null;
	  // Skip hidden elements which don't have an offsetParent
	  while (offsetParent === noOffsetParent && element.nextElementSibling) {
	    offsetParent = (element = element.nextElementSibling).offsetParent;
	  }

	  var nodeName = offsetParent && offsetParent.nodeName;

	  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
	    return element ? element.ownerDocument.documentElement : document.documentElement;
	  }

	  // .offsetParent will return the closest TH, TD or TABLE in case
	  // no offsetParent is present, I hate this job...
	  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
	    return getOffsetParent(offsetParent);
	  }

	  return offsetParent;
	}

	function isOffsetContainer(element) {
	  var nodeName = element.nodeName;

	  if (nodeName === 'BODY') {
	    return false;
	  }
	  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
	}

	/**
	 * Finds the root node (document, shadowDOM root) of the given element
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} node
	 * @returns {Element} root node
	 */
	function getRoot(node) {
	  if (node.parentNode !== null) {
	    return getRoot(node.parentNode);
	  }

	  return node;
	}

	/**
	 * Finds the offset parent common to the two provided nodes
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element1
	 * @argument {Element} element2
	 * @returns {Element} common offset parent
	 */
	function findCommonOffsetParent(element1, element2) {
	  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
	  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
	    return document.documentElement;
	  }

	  // Here we make sure to give as "start" the element that comes first in the DOM
	  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
	  var start = order ? element1 : element2;
	  var end = order ? element2 : element1;

	  // Get common ancestor container
	  var range = document.createRange();
	  range.setStart(start, 0);
	  range.setEnd(end, 0);
	  var commonAncestorContainer = range.commonAncestorContainer;

	  // Both nodes are inside #document

	  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
	    if (isOffsetContainer(commonAncestorContainer)) {
	      return commonAncestorContainer;
	    }

	    return getOffsetParent(commonAncestorContainer);
	  }

	  // one of the nodes is inside shadowDOM, find which one
	  var element1root = getRoot(element1);
	  if (element1root.host) {
	    return findCommonOffsetParent(element1root.host, element2);
	  } else {
	    return findCommonOffsetParent(element1, getRoot(element2).host);
	  }
	}

	/**
	 * Gets the scroll value of the given element in the given side (top and left)
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @argument {String} side `top` or `left`
	 * @returns {number} amount of scrolled pixels
	 */
	function getScroll(element) {
	  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

	  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
	  var nodeName = element.nodeName;

	  if (nodeName === 'BODY' || nodeName === 'HTML') {
	    var html = element.ownerDocument.documentElement;
	    var scrollingElement = element.ownerDocument.scrollingElement || html;
	    return scrollingElement[upperSide];
	  }

	  return element[upperSide];
	}

	/*
	 * Sum or subtract the element scroll values (left and top) from a given rect object
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} rect - Rect object you want to change
	 * @param {HTMLElement} element - The element from the function reads the scroll values
	 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
	 * @return {Object} rect - The modifier rect object
	 */
	function includeScroll(rect, element) {
	  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	  var scrollTop = getScroll(element, 'top');
	  var scrollLeft = getScroll(element, 'left');
	  var modifier = subtract ? -1 : 1;
	  rect.top += scrollTop * modifier;
	  rect.bottom += scrollTop * modifier;
	  rect.left += scrollLeft * modifier;
	  rect.right += scrollLeft * modifier;
	  return rect;
	}

	/*
	 * Helper to detect borders of a given element
	 * @method
	 * @memberof Popper.Utils
	 * @param {CSSStyleDeclaration} styles
	 * Result of `getStyleComputedProperty` on the given element
	 * @param {String} axis - `x` or `y`
	 * @return {number} borders - The borders size of the given axis
	 */

	function getBordersSize(styles, axis) {
	  var sideA = axis === 'x' ? 'Left' : 'Top';
	  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

	  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
	}

	function getSize(axis, body, html, computedStyle) {
	  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
	}

	function getWindowSizes(document) {
	  var body = document.body;
	  var html = document.documentElement;
	  var computedStyle = isIE(10) && getComputedStyle(html);

	  return {
	    height: getSize('Height', body, html, computedStyle),
	    width: getSize('Width', body, html, computedStyle)
	  };
	}

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) { descriptor.writable = true; }
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) { defineProperties(Constructor.prototype, protoProps); }
	    if (staticProps) { defineProperties(Constructor, staticProps); }
	    return Constructor;
	  };
	}();





	var defineProperty = function (obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	};

	var _extends = Object.assign || function (target) {
	  var arguments$1 = arguments;

	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments$1[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	/**
	 * Given element offsets, generate an output similar to getBoundingClientRect
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Object} offsets
	 * @returns {Object} ClientRect like output
	 */
	function getClientRect(offsets) {
	  return _extends({}, offsets, {
	    right: offsets.left + offsets.width,
	    bottom: offsets.top + offsets.height
	  });
	}

	/**
	 * Get bounding client rect of given element
	 * @method
	 * @memberof Popper.Utils
	 * @param {HTMLElement} element
	 * @return {Object} client rect
	 */
	function getBoundingClientRect(element) {
	  var rect = {};

	  // IE10 10 FIX: Please, don't ask, the element isn't
	  // considered in DOM in some circumstances...
	  // This isn't reproducible in IE10 compatibility mode of IE11
	  try {
	    if (isIE(10)) {
	      rect = element.getBoundingClientRect();
	      var scrollTop = getScroll(element, 'top');
	      var scrollLeft = getScroll(element, 'left');
	      rect.top += scrollTop;
	      rect.left += scrollLeft;
	      rect.bottom += scrollTop;
	      rect.right += scrollLeft;
	    } else {
	      rect = element.getBoundingClientRect();
	    }
	  } catch (e) {}

	  var result = {
	    left: rect.left,
	    top: rect.top,
	    width: rect.right - rect.left,
	    height: rect.bottom - rect.top
	  };

	  // subtract scrollbar size from sizes
	  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
	  var width = sizes.width || element.clientWidth || result.right - result.left;
	  var height = sizes.height || element.clientHeight || result.bottom - result.top;

	  var horizScrollbar = element.offsetWidth - width;
	  var vertScrollbar = element.offsetHeight - height;

	  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
	  // we make this check conditional for performance reasons
	  if (horizScrollbar || vertScrollbar) {
	    var styles = getStyleComputedProperty(element);
	    horizScrollbar -= getBordersSize(styles, 'x');
	    vertScrollbar -= getBordersSize(styles, 'y');

	    result.width -= horizScrollbar;
	    result.height -= vertScrollbar;
	  }

	  return getClientRect(result);
	}

	function getOffsetRectRelativeToArbitraryNode(children, parent) {
	  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	  var isIE10 = isIE(10);
	  var isHTML = parent.nodeName === 'HTML';
	  var childrenRect = getBoundingClientRect(children);
	  var parentRect = getBoundingClientRect(parent);
	  var scrollParent = getScrollParent(children);

	  var styles = getStyleComputedProperty(parent);
	  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
	  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

	  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
	  if (fixedPosition && isHTML) {
	    parentRect.top = Math.max(parentRect.top, 0);
	    parentRect.left = Math.max(parentRect.left, 0);
	  }
	  var offsets = getClientRect({
	    top: childrenRect.top - parentRect.top - borderTopWidth,
	    left: childrenRect.left - parentRect.left - borderLeftWidth,
	    width: childrenRect.width,
	    height: childrenRect.height
	  });
	  offsets.marginTop = 0;
	  offsets.marginLeft = 0;

	  // Subtract margins of documentElement in case it's being used as parent
	  // we do this only on HTML because it's the only element that behaves
	  // differently when margins are applied to it. The margins are included in
	  // the box of the documentElement, in the other cases not.
	  if (!isIE10 && isHTML) {
	    var marginTop = parseFloat(styles.marginTop, 10);
	    var marginLeft = parseFloat(styles.marginLeft, 10);

	    offsets.top -= borderTopWidth - marginTop;
	    offsets.bottom -= borderTopWidth - marginTop;
	    offsets.left -= borderLeftWidth - marginLeft;
	    offsets.right -= borderLeftWidth - marginLeft;

	    // Attach marginTop and marginLeft because in some circumstances we may need them
	    offsets.marginTop = marginTop;
	    offsets.marginLeft = marginLeft;
	  }

	  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
	    offsets = includeScroll(offsets, parent);
	  }

	  return offsets;
	}

	function getViewportOffsetRectRelativeToArtbitraryNode(element) {
	  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	  var html = element.ownerDocument.documentElement;
	  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
	  var width = Math.max(html.clientWidth, window.innerWidth || 0);
	  var height = Math.max(html.clientHeight, window.innerHeight || 0);

	  var scrollTop = !excludeScroll ? getScroll(html) : 0;
	  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

	  var offset = {
	    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
	    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
	    width: width,
	    height: height
	  };

	  return getClientRect(offset);
	}

	/**
	 * Check if the given element is fixed or is inside a fixed parent
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @argument {Element} customContainer
	 * @returns {Boolean} answer to "isFixed?"
	 */
	function isFixed(element) {
	  var nodeName = element.nodeName;
	  if (nodeName === 'BODY' || nodeName === 'HTML') {
	    return false;
	  }
	  if (getStyleComputedProperty(element, 'position') === 'fixed') {
	    return true;
	  }
	  var parentNode = getParentNode(element);
	  if (!parentNode) {
	    return false;
	  }
	  return isFixed(parentNode);
	}

	/**
	 * Finds the first parent of an element that has a transformed property defined
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Element} first transformed parent or documentElement
	 */

	function getFixedPositionOffsetParent(element) {
	  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
	  if (!element || !element.parentElement || isIE()) {
	    return document.documentElement;
	  }
	  var el = element.parentElement;
	  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
	    el = el.parentElement;
	  }
	  return el || document.documentElement;
	}

	/**
	 * Computed the boundaries limits and return them
	 * @method
	 * @memberof Popper.Utils
	 * @param {HTMLElement} popper
	 * @param {HTMLElement} reference
	 * @param {number} padding
	 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
	 * @param {Boolean} fixedPosition - Is in fixed position mode
	 * @returns {Object} Coordinates of the boundaries
	 */
	function getBoundaries(popper, reference, padding, boundariesElement) {
	  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	  // NOTE: 1 DOM access here

	  var boundaries = { top: 0, left: 0 };
	  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

	  // Handle viewport case
	  if (boundariesElement === 'viewport') {
	    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
	  } else {
	    // Handle other cases based on DOM element used as boundaries
	    var boundariesNode = void 0;
	    if (boundariesElement === 'scrollParent') {
	      boundariesNode = getScrollParent(getParentNode(reference));
	      if (boundariesNode.nodeName === 'BODY') {
	        boundariesNode = popper.ownerDocument.documentElement;
	      }
	    } else if (boundariesElement === 'window') {
	      boundariesNode = popper.ownerDocument.documentElement;
	    } else {
	      boundariesNode = boundariesElement;
	    }

	    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

	    // In case of HTML, we need a different computation
	    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
	      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
	          height = _getWindowSizes.height,
	          width = _getWindowSizes.width;

	      boundaries.top += offsets.top - offsets.marginTop;
	      boundaries.bottom = height + offsets.top;
	      boundaries.left += offsets.left - offsets.marginLeft;
	      boundaries.right = width + offsets.left;
	    } else {
	      // for all the other DOM elements, this one is good
	      boundaries = offsets;
	    }
	  }

	  // Add paddings
	  padding = padding || 0;
	  var isPaddingNumber = typeof padding === 'number';
	  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
	  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
	  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
	  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

	  return boundaries;
	}

	function getArea(_ref) {
	  var width = _ref.width,
	      height = _ref.height;

	  return width * height;
	}

	/**
	 * Utility used to transform the `auto` placement to the placement with more
	 * available space.
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
	  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

	  if (placement.indexOf('auto') === -1) {
	    return placement;
	  }

	  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

	  var rects = {
	    top: {
	      width: boundaries.width,
	      height: refRect.top - boundaries.top
	    },
	    right: {
	      width: boundaries.right - refRect.right,
	      height: boundaries.height
	    },
	    bottom: {
	      width: boundaries.width,
	      height: boundaries.bottom - refRect.bottom
	    },
	    left: {
	      width: refRect.left - boundaries.left,
	      height: boundaries.height
	    }
	  };

	  var sortedAreas = Object.keys(rects).map(function (key) {
	    return _extends({
	      key: key
	    }, rects[key], {
	      area: getArea(rects[key])
	    });
	  }).sort(function (a, b) {
	    return b.area - a.area;
	  });

	  var filteredAreas = sortedAreas.filter(function (_ref2) {
	    var width = _ref2.width,
	        height = _ref2.height;
	    return width >= popper.clientWidth && height >= popper.clientHeight;
	  });

	  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

	  var variation = placement.split('-')[1];

	  return computedPlacement + (variation ? '-' + variation : '');
	}

	/**
	 * Get offsets to the reference element
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} state
	 * @param {Element} popper - the popper element
	 * @param {Element} reference - the reference element (the popper will be relative to this)
	 * @param {Element} fixedPosition - is in fixed position mode
	 * @returns {Object} An object containing the offsets which will be applied to the popper
	 */
	function getReferenceOffsets(state, popper, reference) {
	  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
	  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
	}

	/**
	 * Get the outer sizes of the given element (offset size + margins)
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element
	 * @returns {Object} object containing width and height properties
	 */
	function getOuterSizes(element) {
	  var window = element.ownerDocument.defaultView;
	  var styles = window.getComputedStyle(element);
	  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
	  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
	  var result = {
	    width: element.offsetWidth + y,
	    height: element.offsetHeight + x
	  };
	  return result;
	}

	/**
	 * Get the opposite placement of the given one
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement
	 * @returns {String} flipped placement
	 */
	function getOppositePlacement(placement) {
	  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
	  return placement.replace(/left|right|bottom|top/g, function (matched) {
	    return hash[matched];
	  });
	}

	/**
	 * Get offsets to the popper
	 * @method
	 * @memberof Popper.Utils
	 * @param {Object} position - CSS position the Popper will get applied
	 * @param {HTMLElement} popper - the popper element
	 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
	 * @param {String} placement - one of the valid placement options
	 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
	 */
	function getPopperOffsets(popper, referenceOffsets, placement) {
	  placement = placement.split('-')[0];

	  // Get popper node sizes
	  var popperRect = getOuterSizes(popper);

	  // Add position, width and height to our offsets object
	  var popperOffsets = {
	    width: popperRect.width,
	    height: popperRect.height
	  };

	  // depending by the popper placement we have to compute its offsets slightly differently
	  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
	  var mainSide = isHoriz ? 'top' : 'left';
	  var secondarySide = isHoriz ? 'left' : 'top';
	  var measurement = isHoriz ? 'height' : 'width';
	  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

	  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
	  if (placement === secondarySide) {
	    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
	  } else {
	    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
	  }

	  return popperOffsets;
	}

	/**
	 * Mimics the `find` method of Array
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Array} arr
	 * @argument prop
	 * @argument value
	 * @returns index or -1
	 */
	function find(arr, check) {
	  // use native find if supported
	  if (Array.prototype.find) {
	    return arr.find(check);
	  }

	  // use `filter` to obtain the same behavior of `find`
	  return arr.filter(check)[0];
	}

	/**
	 * Return the index of the matching object
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Array} arr
	 * @argument prop
	 * @argument value
	 * @returns index or -1
	 */
	function findIndex(arr, prop, value) {
	  // use native findIndex if supported
	  if (Array.prototype.findIndex) {
	    return arr.findIndex(function (cur) {
	      return cur[prop] === value;
	    });
	  }

	  // use `find` + `indexOf` if `findIndex` isn't supported
	  var match = find(arr, function (obj) {
	    return obj[prop] === value;
	  });
	  return arr.indexOf(match);
	}

	/**
	 * Loop trough the list of modifiers and run them in order,
	 * each of them will then edit the data object.
	 * @method
	 * @memberof Popper.Utils
	 * @param {dataObject} data
	 * @param {Array} modifiers
	 * @param {String} ends - Optional modifier name used as stopper
	 * @returns {dataObject}
	 */
	function runModifiers(modifiers, data, ends) {
	  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

	  modifiersToRun.forEach(function (modifier) {
	    if (modifier['function']) {
	      // eslint-disable-line dot-notation
	      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
	    }
	    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
	    if (modifier.enabled && isFunction(fn)) {
	      // Add properties to offsets to make them a complete clientRect object
	      // we do this before each modifier to make sure the previous one doesn't
	      // mess with these values
	      data.offsets.popper = getClientRect(data.offsets.popper);
	      data.offsets.reference = getClientRect(data.offsets.reference);

	      data = fn(data, modifier);
	    }
	  });

	  return data;
	}

	/**
	 * Updates the position of the popper, computing the new offsets and applying
	 * the new style.<br />
	 * Prefer `scheduleUpdate` over `update` because of performance reasons.
	 * @method
	 * @memberof Popper
	 */
	function update() {
	  // if popper is destroyed, don't perform any further update
	  if (this.state.isDestroyed) {
	    return;
	  }

	  var data = {
	    instance: this,
	    styles: {},
	    arrowStyles: {},
	    attributes: {},
	    flipped: false,
	    offsets: {}
	  };

	  // compute reference element offsets
	  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

	  // compute auto placement, store placement inside the data object,
	  // modifiers will be able to edit `placement` if needed
	  // and refer to originalPlacement to know the original value
	  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

	  // store the computed placement inside `originalPlacement`
	  data.originalPlacement = data.placement;

	  data.positionFixed = this.options.positionFixed;

	  // compute the popper offsets
	  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

	  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

	  // run the modifiers
	  data = runModifiers(this.modifiers, data);

	  // the first `update` will call `onCreate` callback
	  // the other ones will call `onUpdate` callback
	  if (!this.state.isCreated) {
	    this.state.isCreated = true;
	    this.options.onCreate(data);
	  } else {
	    this.options.onUpdate(data);
	  }
	}

	/**
	 * Helper used to know if the given modifier is enabled.
	 * @method
	 * @memberof Popper.Utils
	 * @returns {Boolean}
	 */
	function isModifierEnabled(modifiers, modifierName) {
	  return modifiers.some(function (_ref) {
	    var name = _ref.name,
	        enabled = _ref.enabled;
	    return enabled && name === modifierName;
	  });
	}

	/**
	 * Get the prefixed supported property name
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} property (camelCase)
	 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
	 */
	function getSupportedPropertyName(property) {
	  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
	  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

	  for (var i = 0; i < prefixes.length; i++) {
	    var prefix = prefixes[i];
	    var toCheck = prefix ? '' + prefix + upperProp : property;
	    if (typeof document.body.style[toCheck] !== 'undefined') {
	      return toCheck;
	    }
	  }
	  return null;
	}

	/**
	 * Destroys the popper.
	 * @method
	 * @memberof Popper
	 */
	function destroy$1() {
	  this.state.isDestroyed = true;

	  // touch DOM only if `applyStyle` modifier is enabled
	  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
	    this.popper.removeAttribute('x-placement');
	    this.popper.style.position = '';
	    this.popper.style.top = '';
	    this.popper.style.left = '';
	    this.popper.style.right = '';
	    this.popper.style.bottom = '';
	    this.popper.style.willChange = '';
	    this.popper.style[getSupportedPropertyName('transform')] = '';
	  }

	  this.disableEventListeners();

	  // remove the popper if user explicity asked for the deletion on destroy
	  // do not use `remove` because IE11 doesn't support it
	  if (this.options.removeOnDestroy) {
	    this.popper.parentNode.removeChild(this.popper);
	  }
	  return this;
	}

	/**
	 * Get the window associated with the element
	 * @argument {Element} element
	 * @returns {Window}
	 */
	function getWindow(element) {
	  var ownerDocument = element.ownerDocument;
	  return ownerDocument ? ownerDocument.defaultView : window;
	}

	function attachToScrollParents(scrollParent, event, callback, scrollParents) {
	  var isBody = scrollParent.nodeName === 'BODY';
	  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
	  target.addEventListener(event, callback, { passive: true });

	  if (!isBody) {
	    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
	  }
	  scrollParents.push(target);
	}

	/**
	 * Setup needed event listeners used to update the popper position
	 * @method
	 * @memberof Popper.Utils
	 * @private
	 */
	function setupEventListeners(reference, options, state, updateBound) {
	  // Resize event listener on window
	  state.updateBound = updateBound;
	  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

	  // Scroll event listener on scroll parents
	  var scrollElement = getScrollParent(reference);
	  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
	  state.scrollElement = scrollElement;
	  state.eventsEnabled = true;

	  return state;
	}

	/**
	 * It will add resize/scroll events and start recalculating
	 * position of the popper element when they are triggered.
	 * @method
	 * @memberof Popper
	 */
	function enableEventListeners() {
	  if (!this.state.eventsEnabled) {
	    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
	  }
	}

	/**
	 * Remove event listeners used to update the popper position
	 * @method
	 * @memberof Popper.Utils
	 * @private
	 */
	function removeEventListeners(reference, state) {
	  // Remove resize event listener on window
	  getWindow(reference).removeEventListener('resize', state.updateBound);

	  // Remove scroll event listener on scroll parents
	  state.scrollParents.forEach(function (target) {
	    target.removeEventListener('scroll', state.updateBound);
	  });

	  // Reset state
	  state.updateBound = null;
	  state.scrollParents = [];
	  state.scrollElement = null;
	  state.eventsEnabled = false;
	  return state;
	}

	/**
	 * It will remove resize/scroll events and won't recalculate popper position
	 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
	 * unless you call `update` method manually.
	 * @method
	 * @memberof Popper
	 */
	function disableEventListeners() {
	  if (this.state.eventsEnabled) {
	    cancelAnimationFrame(this.scheduleUpdate);
	    this.state = removeEventListeners(this.reference, this.state);
	  }
	}

	/**
	 * Tells if a given input is a number
	 * @method
	 * @memberof Popper.Utils
	 * @param {*} input to check
	 * @return {Boolean}
	 */
	function isNumeric(n) {
	  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
	}

	/**
	 * Set the style to the given popper
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element - Element to apply the style to
	 * @argument {Object} styles
	 * Object with a list of properties and values which will be applied to the element
	 */
	function setStyles(element, styles) {
	  Object.keys(styles).forEach(function (prop) {
	    var unit = '';
	    // add unit if the value is numeric and is one of the following
	    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
	      unit = 'px';
	    }
	    element.style[prop] = styles[prop] + unit;
	  });
	}

	/**
	 * Set the attributes to the given popper
	 * @method
	 * @memberof Popper.Utils
	 * @argument {Element} element - Element to apply the attributes to
	 * @argument {Object} styles
	 * Object with a list of properties and values which will be applied to the element
	 */
	function setAttributes$1(element, attributes) {
	  Object.keys(attributes).forEach(function (prop) {
	    var value = attributes[prop];
	    if (value !== false) {
	      element.setAttribute(prop, attributes[prop]);
	    } else {
	      element.removeAttribute(prop);
	    }
	  });
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} data.styles - List of style properties - values to apply to popper element
	 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The same data object
	 */
	function applyStyle(data) {
	  // any property present in `data.styles` will be applied to the popper,
	  // in this way we can make the 3rd party modifiers add custom styles to it
	  // Be aware, modifiers could override the properties defined in the previous
	  // lines of this modifier!
	  setStyles(data.instance.popper, data.styles);

	  // any property present in `data.attributes` will be applied to the popper,
	  // they will be set as HTML attributes of the element
	  setAttributes$1(data.instance.popper, data.attributes);

	  // if arrowElement is defined and arrowStyles has some properties
	  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
	    setStyles(data.arrowElement, data.arrowStyles);
	  }

	  return data;
	}

	/**
	 * Set the x-placement attribute before everything else because it could be used
	 * to add margins to the popper margins needs to be calculated to get the
	 * correct popper offsets.
	 * @method
	 * @memberof Popper.modifiers
	 * @param {HTMLElement} reference - The reference element used to position the popper
	 * @param {HTMLElement} popper - The HTML element used as popper
	 * @param {Object} options - Popper.js options
	 */
	function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
	  // compute reference element offsets
	  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

	  // compute auto placement, store placement inside the data object,
	  // modifiers will be able to edit `placement` if needed
	  // and refer to originalPlacement to know the original value
	  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

	  popper.setAttribute('x-placement', placement);

	  // Apply `position` to popper before anything else because
	  // without the position applied we can't guarantee correct computations
	  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

	  return options;
	}

	/**
	 * @function
	 * @memberof Popper.Utils
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
	 * @returns {Object} The popper's position offsets rounded
	 *
	 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
	 * good as it can be within reason.
	 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
	 *
	 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
	 * as well on High DPI screens).
	 *
	 * Firefox prefers no rounding for positioning and does not have blurriness on
	 * high DPI screens.
	 *
	 * Only horizontal placement and left/right values need to be considered.
	 */
	function getRoundedOffsets(data, shouldRound) {
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;
	  var round = Math.round,
	      floor = Math.floor;

	  var noRound = function noRound(v) {
	    return v;
	  };

	  var referenceWidth = round(reference.width);
	  var popperWidth = round(popper.width);

	  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
	  var isVariation = data.placement.indexOf('-') !== -1;
	  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
	  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

	  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
	  var verticalToInteger = !shouldRound ? noRound : round;

	  return {
	    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
	    top: verticalToInteger(popper.top),
	    bottom: verticalToInteger(popper.bottom),
	    right: horizontalToInteger(popper.right)
	  };
	}

	var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function computeStyle(data, options) {
	  var x = options.x,
	      y = options.y;
	  var popper = data.offsets.popper;

	  // Remove this legacy support in Popper.js v2

	  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
	    return modifier.name === 'applyStyle';
	  }).gpuAcceleration;
	  if (legacyGpuAccelerationOption !== undefined) {
	    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
	  }
	  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

	  var offsetParent = getOffsetParent(data.instance.popper);
	  var offsetParentRect = getBoundingClientRect(offsetParent);

	  // Styles
	  var styles = {
	    position: popper.position
	  };

	  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

	  var sideA = x === 'bottom' ? 'top' : 'bottom';
	  var sideB = y === 'right' ? 'left' : 'right';

	  // if gpuAcceleration is set to `true` and transform is supported,
	  //  we use `translate3d` to apply the position to the popper we
	  // automatically use the supported prefixed version if needed
	  var prefixedProperty = getSupportedPropertyName('transform');

	  // now, let's make a step back and look at this code closely (wtf?)
	  // If the content of the popper grows once it's been positioned, it
	  // may happen that the popper gets misplaced because of the new content
	  // overflowing its reference element
	  // To avoid this problem, we provide two options (x and y), which allow
	  // the consumer to define the offset origin.
	  // If we position a popper on top of a reference element, we can set
	  // `x` to `top` to make the popper grow towards its top instead of
	  // its bottom.
	  var left = void 0,
	      top = void 0;
	  if (sideA === 'bottom') {
	    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
	    // and not the bottom of the html element
	    if (offsetParent.nodeName === 'HTML') {
	      top = -offsetParent.clientHeight + offsets.bottom;
	    } else {
	      top = -offsetParentRect.height + offsets.bottom;
	    }
	  } else {
	    top = offsets.top;
	  }
	  if (sideB === 'right') {
	    if (offsetParent.nodeName === 'HTML') {
	      left = -offsetParent.clientWidth + offsets.right;
	    } else {
	      left = -offsetParentRect.width + offsets.right;
	    }
	  } else {
	    left = offsets.left;
	  }
	  if (gpuAcceleration && prefixedProperty) {
	    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
	    styles[sideA] = 0;
	    styles[sideB] = 0;
	    styles.willChange = 'transform';
	  } else {
	    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
	    var invertTop = sideA === 'bottom' ? -1 : 1;
	    var invertLeft = sideB === 'right' ? -1 : 1;
	    styles[sideA] = top * invertTop;
	    styles[sideB] = left * invertLeft;
	    styles.willChange = sideA + ', ' + sideB;
	  }

	  // Attributes
	  var attributes = {
	    'x-placement': data.placement
	  };

	  // Update `data` attributes, styles and arrowStyles
	  data.attributes = _extends({}, attributes, data.attributes);
	  data.styles = _extends({}, styles, data.styles);
	  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

	  return data;
	}

	/**
	 * Helper used to know if the given modifier depends from another one.<br />
	 * It checks if the needed modifier is listed and enabled.
	 * @method
	 * @memberof Popper.Utils
	 * @param {Array} modifiers - list of modifiers
	 * @param {String} requestingName - name of requesting modifier
	 * @param {String} requestedName - name of requested modifier
	 * @returns {Boolean}
	 */
	function isModifierRequired(modifiers, requestingName, requestedName) {
	  var requesting = find(modifiers, function (_ref) {
	    var name = _ref.name;
	    return name === requestingName;
	  });

	  var isRequired = !!requesting && modifiers.some(function (modifier) {
	    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
	  });

	  if (!isRequired) {
	    var _requesting = '`' + requestingName + '`';
	    var requested = '`' + requestedName + '`';
	    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
	  }
	  return isRequired;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function arrow(data, options) {
	  var _data$offsets$arrow;

	  // arrow depends on keepTogether in order to work
	  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
	    return data;
	  }

	  var arrowElement = options.element;

	  // if arrowElement is a string, suppose it's a CSS selector
	  if (typeof arrowElement === 'string') {
	    arrowElement = data.instance.popper.querySelector(arrowElement);

	    // if arrowElement is not found, don't run the modifier
	    if (!arrowElement) {
	      return data;
	    }
	  } else {
	    // if the arrowElement isn't a query selector we must check that the
	    // provided DOM node is child of its popper node
	    if (!data.instance.popper.contains(arrowElement)) {
	      console.warn('WARNING: `arrow.element` must be child of its popper element!');
	      return data;
	    }
	  }

	  var placement = data.placement.split('-')[0];
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

	  var len = isVertical ? 'height' : 'width';
	  var sideCapitalized = isVertical ? 'Top' : 'Left';
	  var side = sideCapitalized.toLowerCase();
	  var altSide = isVertical ? 'left' : 'top';
	  var opSide = isVertical ? 'bottom' : 'right';
	  var arrowElementSize = getOuterSizes(arrowElement)[len];

	  //
	  // extends keepTogether behavior making sure the popper and its
	  // reference have enough pixels in conjunction
	  //

	  // top/left side
	  if (reference[opSide] - arrowElementSize < popper[side]) {
	    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
	  }
	  // bottom/right side
	  if (reference[side] + arrowElementSize > popper[opSide]) {
	    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
	  }
	  data.offsets.popper = getClientRect(data.offsets.popper);

	  // compute center of the popper
	  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

	  // Compute the sideValue using the updated popper offsets
	  // take popper margin in account because we don't have this info available
	  var css = getStyleComputedProperty(data.instance.popper);
	  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
	  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
	  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

	  // prevent arrowElement from being placed not contiguously to its popper
	  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

	  data.arrowElement = arrowElement;
	  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

	  return data;
	}

	/**
	 * Get the opposite placement variation of the given one
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement variation
	 * @returns {String} flipped placement variation
	 */
	function getOppositeVariation(variation) {
	  if (variation === 'end') {
	    return 'start';
	  } else if (variation === 'start') {
	    return 'end';
	  }
	  return variation;
	}

	/**
	 * List of accepted placements to use as values of the `placement` option.<br />
	 * Valid placements are:
	 * - `auto`
	 * - `top`
	 * - `right`
	 * - `bottom`
	 * - `left`
	 *
	 * Each placement can have a variation from this list:
	 * - `-start`
	 * - `-end`
	 *
	 * Variations are interpreted easily if you think of them as the left to right
	 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
	 * is right.<br />
	 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
	 *
	 * Some valid examples are:
	 * - `top-end` (on top of reference, right aligned)
	 * - `right-start` (on right of reference, top aligned)
	 * - `bottom` (on bottom, centered)
	 * - `auto-end` (on the side with more space available, alignment depends by placement)
	 *
	 * @static
	 * @type {Array}
	 * @enum {String}
	 * @readonly
	 * @method placements
	 * @memberof Popper
	 */
	var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

	// Get rid of `auto` `auto-start` and `auto-end`
	var validPlacements = placements.slice(3);

	/**
	 * Given an initial placement, returns all the subsequent placements
	 * clockwise (or counter-clockwise).
	 *
	 * @method
	 * @memberof Popper.Utils
	 * @argument {String} placement - A valid placement (it accepts variations)
	 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
	 * @returns {Array} placements including their variations
	 */
	function clockwise(placement) {
	  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	  var index = validPlacements.indexOf(placement);
	  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
	  return counter ? arr.reverse() : arr;
	}

	var BEHAVIORS = {
	  FLIP: 'flip',
	  CLOCKWISE: 'clockwise',
	  COUNTERCLOCKWISE: 'counterclockwise'
	};

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function flip(data, options) {
	  // if `inner` modifier is enabled, we can't use the `flip` modifier
	  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
	    return data;
	  }

	  if (data.flipped && data.placement === data.originalPlacement) {
	    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
	    return data;
	  }

	  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

	  var placement = data.placement.split('-')[0];
	  var placementOpposite = getOppositePlacement(placement);
	  var variation = data.placement.split('-')[1] || '';

	  var flipOrder = [];

	  switch (options.behavior) {
	    case BEHAVIORS.FLIP:
	      flipOrder = [placement, placementOpposite];
	      break;
	    case BEHAVIORS.CLOCKWISE:
	      flipOrder = clockwise(placement);
	      break;
	    case BEHAVIORS.COUNTERCLOCKWISE:
	      flipOrder = clockwise(placement, true);
	      break;
	    default:
	      flipOrder = options.behavior;
	  }

	  flipOrder.forEach(function (step, index) {
	    if (placement !== step || flipOrder.length === index + 1) {
	      return data;
	    }

	    placement = data.placement.split('-')[0];
	    placementOpposite = getOppositePlacement(placement);

	    var popperOffsets = data.offsets.popper;
	    var refOffsets = data.offsets.reference;

	    // using floor because the reference offsets may contain decimals we are not going to consider here
	    var floor = Math.floor;
	    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

	    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
	    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
	    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
	    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

	    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

	    // flip the variation if required
	    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
	    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

	    if (overlapsRef || overflowsBoundaries || flippedVariation) {
	      // this boolean to detect any flip loop
	      data.flipped = true;

	      if (overlapsRef || overflowsBoundaries) {
	        placement = flipOrder[index + 1];
	      }

	      if (flippedVariation) {
	        variation = getOppositeVariation(variation);
	      }

	      data.placement = placement + (variation ? '-' + variation : '');

	      // this object contains `position`, we want to preserve it along with
	      // any additional property we may add in the future
	      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

	      data = runModifiers(data.instance.modifiers, data, 'flip');
	    }
	  });
	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function keepTogether(data) {
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var placement = data.placement.split('-')[0];
	  var floor = Math.floor;
	  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
	  var side = isVertical ? 'right' : 'bottom';
	  var opSide = isVertical ? 'left' : 'top';
	  var measurement = isVertical ? 'width' : 'height';

	  if (popper[side] < floor(reference[opSide])) {
	    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
	  }
	  if (popper[opSide] > floor(reference[side])) {
	    data.offsets.popper[opSide] = floor(reference[side]);
	  }

	  return data;
	}

	/**
	 * Converts a string containing value + unit into a px value number
	 * @function
	 * @memberof {modifiers~offset}
	 * @private
	 * @argument {String} str - Value + unit string
	 * @argument {String} measurement - `height` or `width`
	 * @argument {Object} popperOffsets
	 * @argument {Object} referenceOffsets
	 * @returns {Number|String}
	 * Value in pixels, or original string if no values were extracted
	 */
	function toValue(str, measurement, popperOffsets, referenceOffsets) {
	  // separate value from unit
	  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
	  var value = +split[1];
	  var unit = split[2];

	  // If it's not a number it's an operator, I guess
	  if (!value) {
	    return str;
	  }

	  if (unit.indexOf('%') === 0) {
	    var element = void 0;
	    switch (unit) {
	      case '%p':
	        element = popperOffsets;
	        break;
	      case '%':
	      case '%r':
	      default:
	        element = referenceOffsets;
	    }

	    var rect = getClientRect(element);
	    return rect[measurement] / 100 * value;
	  } else if (unit === 'vh' || unit === 'vw') {
	    // if is a vh or vw, we calculate the size based on the viewport
	    var size = void 0;
	    if (unit === 'vh') {
	      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	    } else {
	      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	    }
	    return size / 100 * value;
	  } else {
	    // if is an explicit pixel unit, we get rid of the unit and keep the value
	    // if is an implicit unit, it's px, and we return just the value
	    return value;
	  }
	}

	/**
	 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
	 * @function
	 * @memberof {modifiers~offset}
	 * @private
	 * @argument {String} offset
	 * @argument {Object} popperOffsets
	 * @argument {Object} referenceOffsets
	 * @argument {String} basePlacement
	 * @returns {Array} a two cells array with x and y offsets in numbers
	 */
	function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
	  var offsets = [0, 0];

	  // Use height if placement is left or right and index is 0 otherwise use width
	  // in this way the first offset will use an axis and the second one
	  // will use the other one
	  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

	  // Split the offset string to obtain a list of values and operands
	  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
	  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
	    return frag.trim();
	  });

	  // Detect if the offset string contains a pair of values or a single one
	  // they could be separated by comma or space
	  var divider = fragments.indexOf(find(fragments, function (frag) {
	    return frag.search(/,|\s/) !== -1;
	  }));

	  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
	    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
	  }

	  // If divider is found, we divide the list of values and operands to divide
	  // them by ofset X and Y.
	  var splitRegex = /\s*,\s*|\s+/;
	  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

	  // Convert the values with units to absolute pixels to allow our computations
	  ops = ops.map(function (op, index) {
	    // Most of the units rely on the orientation of the popper
	    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
	    var mergeWithPrevious = false;
	    return op
	    // This aggregates any `+` or `-` sign that aren't considered operators
	    // e.g.: 10 + +5 => [10, +, +5]
	    .reduce(function (a, b) {
	      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
	        a[a.length - 1] = b;
	        mergeWithPrevious = true;
	        return a;
	      } else if (mergeWithPrevious) {
	        a[a.length - 1] += b;
	        mergeWithPrevious = false;
	        return a;
	      } else {
	        return a.concat(b);
	      }
	    }, [])
	    // Here we convert the string values into number values (in px)
	    .map(function (str) {
	      return toValue(str, measurement, popperOffsets, referenceOffsets);
	    });
	  });

	  // Loop trough the offsets arrays and execute the operations
	  ops.forEach(function (op, index) {
	    op.forEach(function (frag, index2) {
	      if (isNumeric(frag)) {
	        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
	      }
	    });
	  });
	  return offsets;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @argument {Number|String} options.offset=0
	 * The offset value as described in the modifier description
	 * @returns {Object} The data object, properly modified
	 */
	function offset(data, _ref) {
	  var offset = _ref.offset;
	  var placement = data.placement,
	      _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var basePlacement = placement.split('-')[0];

	  var offsets = void 0;
	  if (isNumeric(+offset)) {
	    offsets = [+offset, 0];
	  } else {
	    offsets = parseOffset(offset, popper, reference, basePlacement);
	  }

	  if (basePlacement === 'left') {
	    popper.top += offsets[0];
	    popper.left -= offsets[1];
	  } else if (basePlacement === 'right') {
	    popper.top += offsets[0];
	    popper.left += offsets[1];
	  } else if (basePlacement === 'top') {
	    popper.left += offsets[0];
	    popper.top -= offsets[1];
	  } else if (basePlacement === 'bottom') {
	    popper.left += offsets[0];
	    popper.top += offsets[1];
	  }

	  data.popper = popper;
	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function preventOverflow(data, options) {
	  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

	  // If offsetParent is the reference element, we really want to
	  // go one step up and use the next offsetParent as reference to
	  // avoid to make this modifier completely useless and look like broken
	  if (data.instance.reference === boundariesElement) {
	    boundariesElement = getOffsetParent(boundariesElement);
	  }

	  // NOTE: DOM access here
	  // resets the popper's position so that the document size can be calculated excluding
	  // the size of the popper element itself
	  var transformProp = getSupportedPropertyName('transform');
	  var popperStyles = data.instance.popper.style; // assignment to help minification
	  var top = popperStyles.top,
	      left = popperStyles.left,
	      transform = popperStyles[transformProp];

	  popperStyles.top = '';
	  popperStyles.left = '';
	  popperStyles[transformProp] = '';

	  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

	  // NOTE: DOM access here
	  // restores the original style properties after the offsets have been computed
	  popperStyles.top = top;
	  popperStyles.left = left;
	  popperStyles[transformProp] = transform;

	  options.boundaries = boundaries;

	  var order = options.priority;
	  var popper = data.offsets.popper;

	  var check = {
	    primary: function primary(placement) {
	      var value = popper[placement];
	      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
	        value = Math.max(popper[placement], boundaries[placement]);
	      }
	      return defineProperty({}, placement, value);
	    },
	    secondary: function secondary(placement) {
	      var mainSide = placement === 'right' ? 'left' : 'top';
	      var value = popper[mainSide];
	      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
	        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
	      }
	      return defineProperty({}, mainSide, value);
	    }
	  };

	  order.forEach(function (placement) {
	    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
	    popper = _extends({}, popper, check[side](placement));
	  });

	  data.offsets.popper = popper;

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function shift(data) {
	  var placement = data.placement;
	  var basePlacement = placement.split('-')[0];
	  var shiftvariation = placement.split('-')[1];

	  // if shift shiftvariation is specified, run the modifier
	  if (shiftvariation) {
	    var _data$offsets = data.offsets,
	        reference = _data$offsets.reference,
	        popper = _data$offsets.popper;

	    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
	    var side = isVertical ? 'left' : 'top';
	    var measurement = isVertical ? 'width' : 'height';

	    var shiftOffsets = {
	      start: defineProperty({}, side, reference[side]),
	      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
	    };

	    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
	  }

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by update method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function hide(data) {
	  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
	    return data;
	  }

	  var refRect = data.offsets.reference;
	  var bound = find(data.instance.modifiers, function (modifier) {
	    return modifier.name === 'preventOverflow';
	  }).boundaries;

	  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
	    // Avoid unnecessary DOM access if visibility hasn't changed
	    if (data.hide === true) {
	      return data;
	    }

	    data.hide = true;
	    data.attributes['x-out-of-boundaries'] = '';
	  } else {
	    // Avoid unnecessary DOM access if visibility hasn't changed
	    if (data.hide === false) {
	      return data;
	    }

	    data.hide = false;
	    data.attributes['x-out-of-boundaries'] = false;
	  }

	  return data;
	}

	/**
	 * @function
	 * @memberof Modifiers
	 * @argument {Object} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {Object} The data object, properly modified
	 */
	function inner(data) {
	  var placement = data.placement;
	  var basePlacement = placement.split('-')[0];
	  var _data$offsets = data.offsets,
	      popper = _data$offsets.popper,
	      reference = _data$offsets.reference;

	  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

	  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

	  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

	  data.placement = getOppositePlacement(placement);
	  data.offsets.popper = getClientRect(popper);

	  return data;
	}

	/**
	 * Modifier function, each modifier can have a function of this type assigned
	 * to its `fn` property.<br />
	 * These functions will be called on each update, this means that you must
	 * make sure they are performant enough to avoid performance bottlenecks.
	 *
	 * @function ModifierFn
	 * @argument {dataObject} data - The data object generated by `update` method
	 * @argument {Object} options - Modifiers configuration and options
	 * @returns {dataObject} The data object, properly modified
	 */

	/**
	 * Modifiers are plugins used to alter the behavior of your poppers.<br />
	 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
	 * needed by the library.
	 *
	 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
	 * All the other properties are configurations that could be tweaked.
	 * @namespace modifiers
	 */
	var modifiers = {
	  /**
	   * Modifier used to shift the popper on the start or end of its reference
	   * element.<br />
	   * It will read the variation of the `placement` property.<br />
	   * It can be one either `-end` or `-start`.
	   * @memberof modifiers
	   * @inner
	   */
	  shift: {
	    /** @prop {number} order=100 - Index used to define the order of execution */
	    order: 100,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: shift
	  },

	  /**
	   * The `offset` modifier can shift your popper on both its axis.
	   *
	   * It accepts the following units:
	   * - `px` or unit-less, interpreted as pixels
	   * - `%` or `%r`, percentage relative to the length of the reference element
	   * - `%p`, percentage relative to the length of the popper element
	   * - `vw`, CSS viewport width unit
	   * - `vh`, CSS viewport height unit
	   *
	   * For length is intended the main axis relative to the placement of the popper.<br />
	   * This means that if the placement is `top` or `bottom`, the length will be the
	   * `width`. In case of `left` or `right`, it will be the `height`.
	   *
	   * You can provide a single value (as `Number` or `String`), or a pair of values
	   * as `String` divided by a comma or one (or more) white spaces.<br />
	   * The latter is a deprecated method because it leads to confusion and will be
	   * removed in v2.<br />
	   * Additionally, it accepts additions and subtractions between different units.
	   * Note that multiplications and divisions aren't supported.
	   *
	   * Valid examples are:
	   * ```
	   * 10
	   * '10%'
	   * '10, 10'
	   * '10%, 10'
	   * '10 + 10%'
	   * '10 - 5vh + 3%'
	   * '-10px + 5vh, 5px - 6%'
	   * ```
	   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
	   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
	   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  offset: {
	    /** @prop {number} order=200 - Index used to define the order of execution */
	    order: 200,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: offset,
	    /** @prop {Number|String} offset=0
	     * The offset value as described in the modifier description
	     */
	    offset: 0
	  },

	  /**
	   * Modifier used to prevent the popper from being positioned outside the boundary.
	   *
	   * A scenario exists where the reference itself is not within the boundaries.<br />
	   * We can say it has "escaped the boundaries" — or just "escaped".<br />
	   * In this case we need to decide whether the popper should either:
	   *
	   * - detach from the reference and remain "trapped" in the boundaries, or
	   * - if it should ignore the boundary and "escape with its reference"
	   *
	   * When `escapeWithReference` is set to`true` and reference is completely
	   * outside its boundaries, the popper will overflow (or completely leave)
	   * the boundaries in order to remain attached to the edge of the reference.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  preventOverflow: {
	    /** @prop {number} order=300 - Index used to define the order of execution */
	    order: 300,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: preventOverflow,
	    /**
	     * @prop {Array} [priority=['left','right','top','bottom']]
	     * Popper will try to prevent overflow following these priorities by default,
	     * then, it could overflow on the left and on top of the `boundariesElement`
	     */
	    priority: ['left', 'right', 'top', 'bottom'],
	    /**
	     * @prop {number} padding=5
	     * Amount of pixel used to define a minimum distance between the boundaries
	     * and the popper. This makes sure the popper always has a little padding
	     * between the edges of its container
	     */
	    padding: 5,
	    /**
	     * @prop {String|HTMLElement} boundariesElement='scrollParent'
	     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
	     * `viewport` or any DOM element.
	     */
	    boundariesElement: 'scrollParent'
	  },

	  /**
	   * Modifier used to make sure the reference and its popper stay near each other
	   * without leaving any gap between the two. Especially useful when the arrow is
	   * enabled and you want to ensure that it points to its reference element.
	   * It cares only about the first axis. You can still have poppers with margin
	   * between the popper and its reference element.
	   * @memberof modifiers
	   * @inner
	   */
	  keepTogether: {
	    /** @prop {number} order=400 - Index used to define the order of execution */
	    order: 400,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: keepTogether
	  },

	  /**
	   * This modifier is used to move the `arrowElement` of the popper to make
	   * sure it is positioned between the reference element and its popper element.
	   * It will read the outer size of the `arrowElement` node to detect how many
	   * pixels of conjunction are needed.
	   *
	   * It has no effect if no `arrowElement` is provided.
	   * @memberof modifiers
	   * @inner
	   */
	  arrow: {
	    /** @prop {number} order=500 - Index used to define the order of execution */
	    order: 500,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: arrow,
	    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
	    element: '[x-arrow]'
	  },

	  /**
	   * Modifier used to flip the popper's placement when it starts to overlap its
	   * reference element.
	   *
	   * Requires the `preventOverflow` modifier before it in order to work.
	   *
	   * **NOTE:** this modifier will interrupt the current update cycle and will
	   * restart it if it detects the need to flip the placement.
	   * @memberof modifiers
	   * @inner
	   */
	  flip: {
	    /** @prop {number} order=600 - Index used to define the order of execution */
	    order: 600,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: flip,
	    /**
	     * @prop {String|Array} behavior='flip'
	     * The behavior used to change the popper's placement. It can be one of
	     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
	     * placements (with optional variations)
	     */
	    behavior: 'flip',
	    /**
	     * @prop {number} padding=5
	     * The popper will flip if it hits the edges of the `boundariesElement`
	     */
	    padding: 5,
	    /**
	     * @prop {String|HTMLElement} boundariesElement='viewport'
	     * The element which will define the boundaries of the popper position.
	     * The popper will never be placed outside of the defined boundaries
	     * (except if `keepTogether` is enabled)
	     */
	    boundariesElement: 'viewport'
	  },

	  /**
	   * Modifier used to make the popper flow toward the inner of the reference element.
	   * By default, when this modifier is disabled, the popper will be placed outside
	   * the reference element.
	   * @memberof modifiers
	   * @inner
	   */
	  inner: {
	    /** @prop {number} order=700 - Index used to define the order of execution */
	    order: 700,
	    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
	    enabled: false,
	    /** @prop {ModifierFn} */
	    fn: inner
	  },

	  /**
	   * Modifier used to hide the popper when its reference element is outside of the
	   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
	   * be used to hide with a CSS selector the popper when its reference is
	   * out of boundaries.
	   *
	   * Requires the `preventOverflow` modifier before it in order to work.
	   * @memberof modifiers
	   * @inner
	   */
	  hide: {
	    /** @prop {number} order=800 - Index used to define the order of execution */
	    order: 800,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: hide
	  },

	  /**
	   * Computes the style that will be applied to the popper element to gets
	   * properly positioned.
	   *
	   * Note that this modifier will not touch the DOM, it just prepares the styles
	   * so that `applyStyle` modifier can apply it. This separation is useful
	   * in case you need to replace `applyStyle` with a custom implementation.
	   *
	   * This modifier has `850` as `order` value to maintain backward compatibility
	   * with previous versions of Popper.js. Expect the modifiers ordering method
	   * to change in future major versions of the library.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  computeStyle: {
	    /** @prop {number} order=850 - Index used to define the order of execution */
	    order: 850,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: computeStyle,
	    /**
	     * @prop {Boolean} gpuAcceleration=true
	     * If true, it uses the CSS 3D transformation to position the popper.
	     * Otherwise, it will use the `top` and `left` properties
	     */
	    gpuAcceleration: true,
	    /**
	     * @prop {string} [x='bottom']
	     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
	     * Change this if your popper should grow in a direction different from `bottom`
	     */
	    x: 'bottom',
	    /**
	     * @prop {string} [x='left']
	     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
	     * Change this if your popper should grow in a direction different from `right`
	     */
	    y: 'right'
	  },

	  /**
	   * Applies the computed styles to the popper element.
	   *
	   * All the DOM manipulations are limited to this modifier. This is useful in case
	   * you want to integrate Popper.js inside a framework or view library and you
	   * want to delegate all the DOM manipulations to it.
	   *
	   * Note that if you disable this modifier, you must make sure the popper element
	   * has its position set to `absolute` before Popper.js can do its work!
	   *
	   * Just disable this modifier and define your own to achieve the desired effect.
	   *
	   * @memberof modifiers
	   * @inner
	   */
	  applyStyle: {
	    /** @prop {number} order=900 - Index used to define the order of execution */
	    order: 900,
	    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
	    enabled: true,
	    /** @prop {ModifierFn} */
	    fn: applyStyle,
	    /** @prop {Function} */
	    onLoad: applyStyleOnLoad,
	    /**
	     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
	     * @prop {Boolean} gpuAcceleration=true
	     * If true, it uses the CSS 3D transformation to position the popper.
	     * Otherwise, it will use the `top` and `left` properties
	     */
	    gpuAcceleration: undefined
	  }
	};

	/**
	 * The `dataObject` is an object containing all the information used by Popper.js.
	 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
	 * @name dataObject
	 * @property {Object} data.instance The Popper.js instance
	 * @property {String} data.placement Placement applied to popper
	 * @property {String} data.originalPlacement Placement originally defined on init
	 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
	 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
	 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
	 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
	 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
	 * @property {Object} data.boundaries Offsets of the popper boundaries
	 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
	 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
	 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
	 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
	 */

	/**
	 * Default options provided to Popper.js constructor.<br />
	 * These can be overridden using the `options` argument of Popper.js.<br />
	 * To override an option, simply pass an object with the same
	 * structure of the `options` object, as the 3rd argument. For example:
	 * ```
	 * new Popper(ref, pop, {
	 *   modifiers: {
	 *     preventOverflow: { enabled: false }
	 *   }
	 * })
	 * ```
	 * @type {Object}
	 * @static
	 * @memberof Popper
	 */
	var Defaults = {
	  /**
	   * Popper's placement.
	   * @prop {Popper.placements} placement='bottom'
	   */
	  placement: 'bottom',

	  /**
	   * Set this to true if you want popper to position it self in 'fixed' mode
	   * @prop {Boolean} positionFixed=false
	   */
	  positionFixed: false,

	  /**
	   * Whether events (resize, scroll) are initially enabled.
	   * @prop {Boolean} eventsEnabled=true
	   */
	  eventsEnabled: true,

	  /**
	   * Set to true if you want to automatically remove the popper when
	   * you call the `destroy` method.
	   * @prop {Boolean} removeOnDestroy=false
	   */
	  removeOnDestroy: false,

	  /**
	   * Callback called when the popper is created.<br />
	   * By default, it is set to no-op.<br />
	   * Access Popper.js instance with `data.instance`.
	   * @prop {onCreate}
	   */
	  onCreate: function onCreate() {},

	  /**
	   * Callback called when the popper is updated. This callback is not called
	   * on the initialization/creation of the popper, but only on subsequent
	   * updates.<br />
	   * By default, it is set to no-op.<br />
	   * Access Popper.js instance with `data.instance`.
	   * @prop {onUpdate}
	   */
	  onUpdate: function onUpdate() {},

	  /**
	   * List of modifiers used to modify the offsets before they are applied to the popper.
	   * They provide most of the functionalities of Popper.js.
	   * @prop {modifiers}
	   */
	  modifiers: modifiers
	};

	/**
	 * @callback onCreate
	 * @param {dataObject} data
	 */

	/**
	 * @callback onUpdate
	 * @param {dataObject} data
	 */

	// Utils
	// Methods
	var Popper = function () {
	  /**
	   * Creates a new Popper.js instance.
	   * @class Popper
	   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
	   * @param {HTMLElement} popper - The HTML element used as the popper
	   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
	   * @return {Object} instance - The generated Popper.js instance
	   */
	  function Popper(reference, popper) {
	    var _this = this;

	    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	    classCallCheck(this, Popper);

	    this.scheduleUpdate = function () {
	      return requestAnimationFrame(_this.update);
	    };

	    // make update() debounced, so that it only runs at most once-per-tick
	    this.update = debounce(this.update.bind(this));

	    // with {} we create a new object with the options inside it
	    this.options = _extends({}, Popper.Defaults, options);

	    // init state
	    this.state = {
	      isDestroyed: false,
	      isCreated: false,
	      scrollParents: []
	    };

	    // get reference and popper elements (allow jQuery wrappers)
	    this.reference = reference && reference.jquery ? reference[0] : reference;
	    this.popper = popper && popper.jquery ? popper[0] : popper;

	    // Deep merge modifiers options
	    this.options.modifiers = {};
	    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
	      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
	    });

	    // Refactoring modifiers' list (Object => Array)
	    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
	      return _extends({
	        name: name
	      }, _this.options.modifiers[name]);
	    })
	    // sort the modifiers by order
	    .sort(function (a, b) {
	      return a.order - b.order;
	    });

	    // modifiers have the ability to execute arbitrary code when Popper.js get inited
	    // such code is executed in the same order of its modifier
	    // they could add new properties to their options configuration
	    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
	    this.modifiers.forEach(function (modifierOptions) {
	      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
	        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
	      }
	    });

	    // fire the first update to position the popper in the right place
	    this.update();

	    var eventsEnabled = this.options.eventsEnabled;
	    if (eventsEnabled) {
	      // setup event listeners, they will take care of update the position in specific situations
	      this.enableEventListeners();
	    }

	    this.state.eventsEnabled = eventsEnabled;
	  }

	  // We can't use class properties because they don't get listed in the
	  // class prototype and break stuff like Sinon stubs


	  createClass(Popper, [{
	    key: 'update',
	    value: function update$$1() {
	      return update.call(this);
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy$$1() {
	      return destroy$1.call(this);
	    }
	  }, {
	    key: 'enableEventListeners',
	    value: function enableEventListeners$$1() {
	      return enableEventListeners.call(this);
	    }
	  }, {
	    key: 'disableEventListeners',
	    value: function disableEventListeners$$1() {
	      return disableEventListeners.call(this);
	    }

	    /**
	     * Schedules an update. It will run on the next UI update available.
	     * @method scheduleUpdate
	     * @memberof Popper
	     */


	    /**
	     * Collection of utilities useful when writing custom modifiers.
	     * Starting from version 1.7, this method is available only if you
	     * include `popper-utils.js` before `popper.js`.
	     *
	     * **DEPRECATION**: This way to access PopperUtils is deprecated
	     * and will be removed in v2! Use the PopperUtils module directly instead.
	     * Due to the high instability of the methods contained in Utils, we can't
	     * guarantee them to follow semver. Use them at your own risk!
	     * @static
	     * @private
	     * @type {Object}
	     * @deprecated since version 1.8
	     * @member Utils
	     * @memberof Popper
	     */

	  }]);
	  return Popper;
	}();

	/**
	 * The `referenceObject` is an object that provides an interface compatible with Popper.js
	 * and lets you use it as replacement of a real DOM node.<br />
	 * You can use this method to position a popper relatively to a set of coordinates
	 * in case you don't have a DOM node to use as reference.
	 *
	 * ```
	 * new Popper(referenceObject, popperNode);
	 * ```
	 *
	 * NB: This feature isn't supported in Internet Explorer 10.
	 * @name referenceObject
	 * @property {Function} data.getBoundingClientRect
	 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
	 * @property {number} data.clientWidth
	 * An ES6 getter that will return the width of the virtual reference element.
	 * @property {number} data.clientHeight
	 * An ES6 getter that will return the height of the virtual reference element.
	 */


	Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
	Popper.placements = placements;
	Popper.Defaults = Defaults;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function getMatchingElementFromMutation  (mutation, selector)
	{
		var type = mutation.type;
		var target = mutation.target;
		var addedNodes = mutation.addedNodes;

		if (type === 'attributes' && target.matches(selector))
		{
			return target;
		}

		if (type === 'childList')
		{
			for (var i = 0, list = addedNodes; i < list.length; i += 1)
			{
				var addedNode = list[i];

				if (typeof addedNode.matches === 'function' && addedNode.matches(selector))
				{
					return addedNode;
				}
			}

			return target.querySelector(selector);
		}

		return null;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function waitForTheElement (selector, ref)
	{
		if ( ref === void 0 ) ref = {};
		var timeout = ref.timeout; if ( timeout === void 0 ) timeout = 2500;
		var scope = ref.scope; if ( scope === void 0 ) scope = document;

		return new Promise(function (resolve, reject) {
			var element = scope.querySelector(selector), timer = null;

			if (element !== null)
			{
				resolve(element);

				return;
			}

			var observer = new MutationObserver(function (mutations) {
				for (var i = 0, list = mutations; i < list.length; i += 1)
				{
					var mutation = list[i];

					var nodeThatMatches = getMatchingElementFromMutation(mutation, selector);

					if (nodeThatMatches !== null)
					{
						clearTimeout(timer);

						observer.disconnect();

						resolve(nodeThatMatches);

						break;
					}
				}
			});

			observer.observe(scope, {
				attributes : true, subtree : true, childList : true
			});

			timer = setTimeout(function () {
				observer.disconnect();

				reject(
					new Error(("No element matches the selector " + selector + "."))
				);

			}, timeout);
		});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function tryAndWaitForTheElement (selector, options)
	{
		return waitForTheElement(selector, options).catch(function () { return null; });
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var waitForTheElement_1 = { waitForTheElement: waitForTheElement, tryAndWaitForTheElement: tryAndWaitForTheElement };
	var waitForTheElement_2 = waitForTheElement_1.waitForTheElement;

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
	    waitForTheElement_2(attach)
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
	      p = waitForTheElement_2(p, {
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

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=onboardist-ui.umd.js.map
