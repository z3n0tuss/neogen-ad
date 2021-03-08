
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Container.svelte generated by Svelte v3.35.0 */

    const file$3 = "src/Container.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "svelte-1x6ixm2");
    			add_location(div0, file$3, 3, 4, 61);
    			attr_dev(div1, "class", "container-div svelte-1x6ixm2");
    			add_location(div1, file$3, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Container", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Container> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Container extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Container",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Text.svelte generated by Svelte v3.35.0 */

    const file$2 = "src/Text.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let h2;

    	let t2_value = (/*jobLocation*/ ctx[1]
    	? `${/*jobLocation*/ ctx[1]},`
    	: "") + "";

    	let t2;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(/*jobTitle*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(/*jobSalary*/ ctx[2]);
    			attr_dev(h1, "class", "svelte-h3z5rk");
    			add_location(h1, file$2, 4, 4, 84);
    			attr_dev(h2, "class", "svelte-h3z5rk");
    			add_location(h2, file$2, 5, 4, 108);
    			attr_dev(div, "class", "svelte-h3z5rk");
    			add_location(div, file$2, 3, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*jobTitle*/ 1) set_data_dev(t0, /*jobTitle*/ ctx[0]);

    			if (dirty & /*jobLocation*/ 2 && t2_value !== (t2_value = (/*jobLocation*/ ctx[1]
    			? `${/*jobLocation*/ ctx[1]},`
    			: "") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*jobSalary*/ 4) set_data_dev(t4, /*jobSalary*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Text", slots, []);
    	let { jobTitle } = $$props, { jobLocation } = $$props, { jobSalary } = $$props;
    	const writable_props = ["jobTitle", "jobLocation", "jobSalary"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("jobTitle" in $$props) $$invalidate(0, jobTitle = $$props.jobTitle);
    		if ("jobLocation" in $$props) $$invalidate(1, jobLocation = $$props.jobLocation);
    		if ("jobSalary" in $$props) $$invalidate(2, jobSalary = $$props.jobSalary);
    	};

    	$$self.$capture_state = () => ({ jobTitle, jobLocation, jobSalary });

    	$$self.$inject_state = $$props => {
    		if ("jobTitle" in $$props) $$invalidate(0, jobTitle = $$props.jobTitle);
    		if ("jobLocation" in $$props) $$invalidate(1, jobLocation = $$props.jobLocation);
    		if ("jobSalary" in $$props) $$invalidate(2, jobSalary = $$props.jobSalary);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [jobTitle, jobLocation, jobSalary];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			jobTitle: 0,
    			jobLocation: 1,
    			jobSalary: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*jobTitle*/ ctx[0] === undefined && !("jobTitle" in props)) {
    			console.warn("<Text> was created without expected prop 'jobTitle'");
    		}

    		if (/*jobLocation*/ ctx[1] === undefined && !("jobLocation" in props)) {
    			console.warn("<Text> was created without expected prop 'jobLocation'");
    		}

    		if (/*jobSalary*/ ctx[2] === undefined && !("jobSalary" in props)) {
    			console.warn("<Text> was created without expected prop 'jobSalary'");
    		}
    	}

    	get jobTitle() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobTitle(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jobLocation() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobLocation(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jobSalary() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobSalary(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Banner.svelte generated by Svelte v3.35.0 */

    const file$1 = "src/Banner.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgUrl*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "banner");
    			attr_dev(img, "class", "svelte-1dfh01p");
    			add_location(img, file$1, 4, 4, 58);
    			add_location(div, file$1, 3, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*imgUrl*/ 1 && img.src !== (img_src_value = /*imgUrl*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Banner", slots, []);
    	let { imgUrl } = $$props;
    	const writable_props = ["imgUrl"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("imgUrl" in $$props) $$invalidate(0, imgUrl = $$props.imgUrl);
    	};

    	$$self.$capture_state = () => ({ imgUrl });

    	$$self.$inject_state = $$props => {
    		if ("imgUrl" in $$props) $$invalidate(0, imgUrl = $$props.imgUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imgUrl];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { imgUrl: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imgUrl*/ ctx[0] === undefined && !("imgUrl" in props)) {
    			console.warn("<Banner> was created without expected prop 'imgUrl'");
    		}
    	}

    	get imgUrl() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgUrl(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var domToImage = createCommonjsModule(function (module) {
    (function (global) {

        var util = newUtil();
        var inliner = newInliner();
        var fontFaces = newFontFaces();
        var images = newImages();

        // Default impl options
        var defaultOptions = {
            // Default is to fail on error, no placeholder
            imagePlaceholder: undefined,
            // Default cache bust is false, it will use the cache
            cacheBust: false
        };

        var domtoimage = {
            toSvg: toSvg,
            toPng: toPng,
            toJpeg: toJpeg,
            toBlob: toBlob,
            toPixelData: toPixelData,
            impl: {
                fontFaces: fontFaces,
                images: images,
                util: util,
                inliner: inliner,
                options: {}
            }
        };

        module.exports = domtoimage;


        /**
         * @param {Node} node - The DOM Node object to render
         * @param {Object} options - Rendering options
         * @param {Function} options.filter - Should return true if passed node should be included in the output
         *          (excluding node means excluding it's children as well). Not called on the root node.
         * @param {String} options.bgcolor - color for the background, any valid CSS color value.
         * @param {Number} options.width - width to be applied to node before rendering.
         * @param {Number} options.height - height to be applied to node before rendering.
         * @param {Object} options.style - an object whose properties to be copied to node's style before rendering.
         * @param {Number} options.quality - a Number between 0 and 1 indicating image quality (applicable to JPEG only),
                    defaults to 1.0.
         * @param {String} options.imagePlaceholder - dataURL to use as a placeholder for failed images, default behaviour is to fail fast on images we can't fetch
         * @param {Boolean} options.cacheBust - set to true to cache bust by appending the time to the request url
         * @return {Promise} - A promise that is fulfilled with a SVG image data URL
         * */
        function toSvg(node, options) {
            options = options || {};
            copyOptions(options);
            return Promise.resolve(node)
                .then(function (node) {
                    return cloneNode(node, options.filter, true);
                })
                .then(embedFonts)
                .then(inlineImages)
                .then(applyOptions)
                .then(function (clone) {
                    return makeSvgDataUri(clone,
                        options.width || util.width(node),
                        options.height || util.height(node)
                    );
                });

            function applyOptions(clone) {
                if (options.bgcolor) clone.style.backgroundColor = options.bgcolor;

                if (options.width) clone.style.width = options.width + 'px';
                if (options.height) clone.style.height = options.height + 'px';

                if (options.style)
                    Object.keys(options.style).forEach(function (property) {
                        clone.style[property] = options.style[property];
                    });

                return clone;
            }
        }

        /**
         * @param {Node} node - The DOM Node object to render
         * @param {Object} options - Rendering options, @see {@link toSvg}
         * @return {Promise} - A promise that is fulfilled with a Uint8Array containing RGBA pixel data.
         * */
        function toPixelData(node, options) {
            return draw(node, options || {})
                .then(function (canvas) {
                    return canvas.getContext('2d').getImageData(
                        0,
                        0,
                        util.width(node),
                        util.height(node)
                    ).data;
                });
        }

        /**
         * @param {Node} node - The DOM Node object to render
         * @param {Object} options - Rendering options, @see {@link toSvg}
         * @return {Promise} - A promise that is fulfilled with a PNG image data URL
         * */
        function toPng(node, options) {
            return draw(node, options || {})
                .then(function (canvas) {
                    return canvas.toDataURL();
                });
        }

        /**
         * @param {Node} node - The DOM Node object to render
         * @param {Object} options - Rendering options, @see {@link toSvg}
         * @return {Promise} - A promise that is fulfilled with a JPEG image data URL
         * */
        function toJpeg(node, options) {
            options = options || {};
            return draw(node, options)
                .then(function (canvas) {
                    return canvas.toDataURL('image/jpeg', options.quality || 1.0);
                });
        }

        /**
         * @param {Node} node - The DOM Node object to render
         * @param {Object} options - Rendering options, @see {@link toSvg}
         * @return {Promise} - A promise that is fulfilled with a PNG image blob
         * */
        function toBlob(node, options) {
            return draw(node, options || {})
                .then(util.canvasToBlob);
        }

        function copyOptions(options) {
            // Copy options to impl options for use in impl
            if(typeof(options.imagePlaceholder) === 'undefined') {
                domtoimage.impl.options.imagePlaceholder = defaultOptions.imagePlaceholder;
            } else {
                domtoimage.impl.options.imagePlaceholder = options.imagePlaceholder;
            }

            if(typeof(options.cacheBust) === 'undefined') {
                domtoimage.impl.options.cacheBust = defaultOptions.cacheBust;
            } else {
                domtoimage.impl.options.cacheBust = options.cacheBust;
            }
        }

        function draw(domNode, options) {
            return toSvg(domNode, options)
                .then(util.makeImage)
                .then(util.delay(100))
                .then(function (image) {
                    var canvas = newCanvas(domNode);
                    canvas.getContext('2d').drawImage(image, 0, 0);
                    return canvas;
                });

            function newCanvas(domNode) {
                var canvas = document.createElement('canvas');
                canvas.width = options.width || util.width(domNode);
                canvas.height = options.height || util.height(domNode);

                if (options.bgcolor) {
                    var ctx = canvas.getContext('2d');
                    ctx.fillStyle = options.bgcolor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                return canvas;
            }
        }

        function cloneNode(node, filter, root) {
            if (!root && filter && !filter(node)) return Promise.resolve();

            return Promise.resolve(node)
                .then(makeNodeCopy)
                .then(function (clone) {
                    return cloneChildren(node, clone, filter);
                })
                .then(function (clone) {
                    return processClone(node, clone);
                });

            function makeNodeCopy(node) {
                if (node instanceof HTMLCanvasElement) return util.makeImage(node.toDataURL());
                return node.cloneNode(false);
            }

            function cloneChildren(original, clone, filter) {
                var children = original.childNodes;
                if (children.length === 0) return Promise.resolve(clone);

                return cloneChildrenInOrder(clone, util.asArray(children), filter)
                    .then(function () {
                        return clone;
                    });

                function cloneChildrenInOrder(parent, children, filter) {
                    var done = Promise.resolve();
                    children.forEach(function (child) {
                        done = done
                            .then(function () {
                                return cloneNode(child, filter);
                            })
                            .then(function (childClone) {
                                if (childClone) parent.appendChild(childClone);
                            });
                    });
                    return done;
                }
            }

            function processClone(original, clone) {
                if (!(clone instanceof Element)) return clone;

                return Promise.resolve()
                    .then(cloneStyle)
                    .then(clonePseudoElements)
                    .then(copyUserInput)
                    .then(fixSvg)
                    .then(function () {
                        return clone;
                    });

                function cloneStyle() {
                    copyStyle(window.getComputedStyle(original), clone.style);

                    function copyStyle(source, target) {
                        if (source.cssText) target.cssText = source.cssText;
                        else copyProperties(source, target);

                        function copyProperties(source, target) {
                            util.asArray(source).forEach(function (name) {
                                target.setProperty(
                                    name,
                                    source.getPropertyValue(name),
                                    source.getPropertyPriority(name)
                                );
                            });
                        }
                    }
                }

                function clonePseudoElements() {
                    [':before', ':after'].forEach(function (element) {
                        clonePseudoElement(element);
                    });

                    function clonePseudoElement(element) {
                        var style = window.getComputedStyle(original, element);
                        var content = style.getPropertyValue('content');

                        if (content === '' || content === 'none') return;

                        var className = util.uid();
                        clone.className = clone.className + ' ' + className;
                        var styleElement = document.createElement('style');
                        styleElement.appendChild(formatPseudoElementStyle(className, element, style));
                        clone.appendChild(styleElement);

                        function formatPseudoElementStyle(className, element, style) {
                            var selector = '.' + className + ':' + element;
                            var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);
                            return document.createTextNode(selector + '{' + cssText + '}');

                            function formatCssText(style) {
                                var content = style.getPropertyValue('content');
                                return style.cssText + ' content: ' + content + ';';
                            }

                            function formatCssProperties(style) {

                                return util.asArray(style)
                                    .map(formatProperty)
                                    .join('; ') + ';';

                                function formatProperty(name) {
                                    return name + ': ' +
                                        style.getPropertyValue(name) +
                                        (style.getPropertyPriority(name) ? ' !important' : '');
                                }
                            }
                        }
                    }
                }

                function copyUserInput() {
                    if (original instanceof HTMLTextAreaElement) clone.innerHTML = original.value;
                    if (original instanceof HTMLInputElement) clone.setAttribute("value", original.value);
                }

                function fixSvg() {
                    if (!(clone instanceof SVGElement)) return;
                    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

                    if (!(clone instanceof SVGRectElement)) return;
                    ['width', 'height'].forEach(function (attribute) {
                        var value = clone.getAttribute(attribute);
                        if (!value) return;

                        clone.style.setProperty(attribute, value);
                    });
                }
            }
        }

        function embedFonts(node) {
            return fontFaces.resolveAll()
                .then(function (cssText) {
                    var styleNode = document.createElement('style');
                    node.appendChild(styleNode);
                    styleNode.appendChild(document.createTextNode(cssText));
                    return node;
                });
        }

        function inlineImages(node) {
            return images.inlineAll(node)
                .then(function () {
                    return node;
                });
        }

        function makeSvgDataUri(node, width, height) {
            return Promise.resolve(node)
                .then(function (node) {
                    node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                    return new XMLSerializer().serializeToString(node);
                })
                .then(util.escapeXhtml)
                .then(function (xhtml) {
                    return '<foreignObject x="0" y="0" width="100%" height="100%">' + xhtml + '</foreignObject>';
                })
                .then(function (foreignObject) {
                    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                        foreignObject + '</svg>';
                })
                .then(function (svg) {
                    return 'data:image/svg+xml;charset=utf-8,' + svg;
                });
        }

        function newUtil() {
            return {
                escape: escape,
                parseExtension: parseExtension,
                mimeType: mimeType,
                dataAsUrl: dataAsUrl,
                isDataUrl: isDataUrl,
                canvasToBlob: canvasToBlob,
                resolveUrl: resolveUrl,
                getAndEncode: getAndEncode,
                uid: uid(),
                delay: delay,
                asArray: asArray,
                escapeXhtml: escapeXhtml,
                makeImage: makeImage,
                width: width,
                height: height
            };

            function mimes() {
                /*
                 * Only WOFF and EOT mime types for fonts are 'real'
                 * see http://www.iana.org/assignments/media-types/media-types.xhtml
                 */
                var WOFF = 'application/font-woff';
                var JPEG = 'image/jpeg';

                return {
                    'woff': WOFF,
                    'woff2': WOFF,
                    'ttf': 'application/font-truetype',
                    'eot': 'application/vnd.ms-fontobject',
                    'png': 'image/png',
                    'jpg': JPEG,
                    'jpeg': JPEG,
                    'gif': 'image/gif',
                    'tiff': 'image/tiff',
                    'svg': 'image/svg+xml'
                };
            }

            function parseExtension(url) {
                var match = /\.([^\.\/]*?)$/g.exec(url);
                if (match) return match[1];
                else return '';
            }

            function mimeType(url) {
                var extension = parseExtension(url).toLowerCase();
                return mimes()[extension] || '';
            }

            function isDataUrl(url) {
                return url.search(/^(data:)/) !== -1;
            }

            function toBlob(canvas) {
                return new Promise(function (resolve) {
                    var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
                    var length = binaryString.length;
                    var binaryArray = new Uint8Array(length);

                    for (var i = 0; i < length; i++)
                        binaryArray[i] = binaryString.charCodeAt(i);

                    resolve(new Blob([binaryArray], {
                        type: 'image/png'
                    }));
                });
            }

            function canvasToBlob(canvas) {
                if (canvas.toBlob)
                    return new Promise(function (resolve) {
                        canvas.toBlob(resolve);
                    });

                return toBlob(canvas);
            }

            function resolveUrl(url, baseUrl) {
                var doc = document.implementation.createHTMLDocument();
                var base = doc.createElement('base');
                doc.head.appendChild(base);
                var a = doc.createElement('a');
                doc.body.appendChild(a);
                base.href = baseUrl;
                a.href = url;
                return a.href;
            }

            function uid() {
                var index = 0;

                return function () {
                    return 'u' + fourRandomChars() + index++;

                    function fourRandomChars() {
                        /* see http://stackoverflow.com/a/6248722/2519373 */
                        return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
                    }
                };
            }

            function makeImage(uri) {
                return new Promise(function (resolve, reject) {
                    var image = new Image();
                    image.onload = function () {
                        resolve(image);
                    };
                    image.onerror = reject;
                    image.src = uri;
                });
            }

            function getAndEncode(url) {
                var TIMEOUT = 30000;
                if(domtoimage.impl.options.cacheBust) {
                    // Cache bypass so we dont have CORS issues with cached images
                    // Source: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                    url += ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
                }

                return new Promise(function (resolve) {
                    var request = new XMLHttpRequest();

                    request.onreadystatechange = done;
                    request.ontimeout = timeout;
                    request.responseType = 'blob';
                    request.timeout = TIMEOUT;
                    request.open('GET', url, true);
                    request.send();

                    var placeholder;
                    if(domtoimage.impl.options.imagePlaceholder) {
                        var split = domtoimage.impl.options.imagePlaceholder.split(/,/);
                        if(split && split[1]) {
                            placeholder = split[1];
                        }
                    }

                    function done() {
                        if (request.readyState !== 4) return;

                        if (request.status !== 200) {
                            if(placeholder) {
                                resolve(placeholder);
                            } else {
                                fail('cannot fetch resource: ' + url + ', status: ' + request.status);
                            }

                            return;
                        }

                        var encoder = new FileReader();
                        encoder.onloadend = function () {
                            var content = encoder.result.split(/,/)[1];
                            resolve(content);
                        };
                        encoder.readAsDataURL(request.response);
                    }

                    function timeout() {
                        if(placeholder) {
                            resolve(placeholder);
                        } else {
                            fail('timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url);
                        }
                    }

                    function fail(message) {
                        console.error(message);
                        resolve('');
                    }
                });
            }

            function dataAsUrl(content, type) {
                return 'data:' + type + ';base64,' + content;
            }

            function escape(string) {
                return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
            }

            function delay(ms) {
                return function (arg) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(arg);
                        }, ms);
                    });
                };
            }

            function asArray(arrayLike) {
                var array = [];
                var length = arrayLike.length;
                for (var i = 0; i < length; i++) array.push(arrayLike[i]);
                return array;
            }

            function escapeXhtml(string) {
                return string.replace(/#/g, '%23').replace(/\n/g, '%0A');
            }

            function width(node) {
                var leftBorder = px(node, 'border-left-width');
                var rightBorder = px(node, 'border-right-width');
                return node.scrollWidth + leftBorder + rightBorder;
            }

            function height(node) {
                var topBorder = px(node, 'border-top-width');
                var bottomBorder = px(node, 'border-bottom-width');
                return node.scrollHeight + topBorder + bottomBorder;
            }

            function px(node, styleProperty) {
                var value = window.getComputedStyle(node).getPropertyValue(styleProperty);
                return parseFloat(value.replace('px', ''));
            }
        }

        function newInliner() {
            var URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;

            return {
                inlineAll: inlineAll,
                shouldProcess: shouldProcess,
                impl: {
                    readUrls: readUrls,
                    inline: inline
                }
            };

            function shouldProcess(string) {
                return string.search(URL_REGEX) !== -1;
            }

            function readUrls(string) {
                var result = [];
                var match;
                while ((match = URL_REGEX.exec(string)) !== null) {
                    result.push(match[1]);
                }
                return result.filter(function (url) {
                    return !util.isDataUrl(url);
                });
            }

            function inline(string, url, baseUrl, get) {
                return Promise.resolve(url)
                    .then(function (url) {
                        return baseUrl ? util.resolveUrl(url, baseUrl) : url;
                    })
                    .then(get || util.getAndEncode)
                    .then(function (data) {
                        return util.dataAsUrl(data, util.mimeType(url));
                    })
                    .then(function (dataUrl) {
                        return string.replace(urlAsRegex(url), '$1' + dataUrl + '$3');
                    });

                function urlAsRegex(url) {
                    return new RegExp('(url\\([\'"]?)(' + util.escape(url) + ')([\'"]?\\))', 'g');
                }
            }

            function inlineAll(string, baseUrl, get) {
                if (nothingToInline()) return Promise.resolve(string);

                return Promise.resolve(string)
                    .then(readUrls)
                    .then(function (urls) {
                        var done = Promise.resolve(string);
                        urls.forEach(function (url) {
                            done = done.then(function (string) {
                                return inline(string, url, baseUrl, get);
                            });
                        });
                        return done;
                    });

                function nothingToInline() {
                    return !shouldProcess(string);
                }
            }
        }

        function newFontFaces() {
            return {
                resolveAll: resolveAll,
                impl: {
                    readAll: readAll
                }
            };

            function resolveAll() {
                return readAll()
                    .then(function (webFonts) {
                        return Promise.all(
                            webFonts.map(function (webFont) {
                                return webFont.resolve();
                            })
                        );
                    })
                    .then(function (cssStrings) {
                        return cssStrings.join('\n');
                    });
            }

            function readAll() {
                return Promise.resolve(util.asArray(document.styleSheets))
                    .then(getCssRules)
                    .then(selectWebFontRules)
                    .then(function (rules) {
                        return rules.map(newWebFont);
                    });

                function selectWebFontRules(cssRules) {
                    return cssRules
                        .filter(function (rule) {
                            return rule.type === CSSRule.FONT_FACE_RULE;
                        })
                        .filter(function (rule) {
                            return inliner.shouldProcess(rule.style.getPropertyValue('src'));
                        });
                }

                function getCssRules(styleSheets) {
                    var cssRules = [];
                    styleSheets.forEach(function (sheet) {
                        try {
                            util.asArray(sheet.cssRules || []).forEach(cssRules.push.bind(cssRules));
                        } catch (e) {
                            console.log('Error while reading CSS rules from ' + sheet.href, e.toString());
                        }
                    });
                    return cssRules;
                }

                function newWebFont(webFontRule) {
                    return {
                        resolve: function resolve() {
                            var baseUrl = (webFontRule.parentStyleSheet || {}).href;
                            return inliner.inlineAll(webFontRule.cssText, baseUrl);
                        },
                        src: function () {
                            return webFontRule.style.getPropertyValue('src');
                        }
                    };
                }
            }
        }

        function newImages() {
            return {
                inlineAll: inlineAll,
                impl: {
                    newImage: newImage
                }
            };

            function newImage(element) {
                return {
                    inline: inline
                };

                function inline(get) {
                    if (util.isDataUrl(element.src)) return Promise.resolve();

                    return Promise.resolve(element.src)
                        .then(get || util.getAndEncode)
                        .then(function (data) {
                            return util.dataAsUrl(data, util.mimeType(element.src));
                        })
                        .then(function (dataUrl) {
                            return new Promise(function (resolve, reject) {
                                element.onload = resolve;
                                element.onerror = reject;
                                element.src = dataUrl;
                            });
                        });
                }
            }

            function inlineAll(node) {
                if (!(node instanceof Element)) return Promise.resolve(node);

                return inlineBackground(node)
                    .then(function () {
                        if (node instanceof HTMLImageElement)
                            return newImage(node).inline();
                        else
                            return Promise.all(
                                util.asArray(node.childNodes).map(function (child) {
                                    return inlineAll(child);
                                })
                            );
                    });

                function inlineBackground(node) {
                    var background = node.style.getPropertyValue('background');

                    if (!background) return Promise.resolve(node);

                    return inliner.inlineAll(background)
                        .then(function (inlined) {
                            node.style.setProperty(
                                'background',
                                inlined,
                                node.style.getPropertyPriority('background')
                            );
                        })
                        .then(function () {
                            return node;
                        });
                }
            }
        }
    })();
    });

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});


    });

    function exportImage() {
        const node = document.getElementById('ad');
        domToImage.toBlob(node)
            .then((blob) => {
            FileSaver_min.saveAs(blob, 'neogen-ad.png');
        });
    }

    /* src/App.svelte generated by Svelte v3.35.0 */
    const file = "src/App.svelte";

    // (10:2) <Container>
    function create_default_slot(ctx) {
    	let banner;
    	let t;
    	let text_1;
    	let current;

    	banner = new Banner({
    			props: { imgUrl: "build/img/neogen.png" },
    			$$inline: true
    		});

    	text_1 = new Text({
    			props: {
    				jobTitle: /*jobTitle*/ ctx[0],
    				jobLocation: /*jobLocation*/ ctx[1],
    				jobSalary: /*jobSalary*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(banner.$$.fragment);
    			t = space();
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(banner, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};
    			if (dirty & /*jobTitle*/ 1) text_1_changes.jobTitle = /*jobTitle*/ ctx[0];
    			if (dirty & /*jobLocation*/ 2) text_1_changes.jobLocation = /*jobLocation*/ ctx[1];
    			if (dirty & /*jobSalary*/ 4) text_1_changes.jobSalary = /*jobSalary*/ ctx[2];
    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(banner, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(10:2) <Container>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let container;
    	let t0;
    	let div1;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let input2;
    	let t3;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	container = new Container({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(container.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			input2 = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Export Image";
    			attr_dev(div0, "id", "ad");
    			add_location(div0, file, 8, 1, 292);
    			attr_dev(input0, "placeholder", "Enter job title");
    			add_location(input0, file, 19, 2, 506);
    			attr_dev(input1, "placeholder", "Enter job location");
    			add_location(input1, file, 20, 2, 570);
    			attr_dev(input2, "placeholder", "Enter job salary");
    			add_location(input2, file, 21, 2, 640);
    			add_location(button, file, 22, 2, 706);
    			attr_dev(div1, "class", "inputs");
    			add_location(div1, file, 18, 1, 483);
    			attr_dev(main, "class", "svelte-i46dtk");
    			add_location(main, file, 7, 0, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(container, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*jobTitle*/ ctx[0]);
    			append_dev(div1, t1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*jobLocation*/ ctx[1]);
    			append_dev(div1, t2);
    			append_dev(div1, input2);
    			set_input_value(input2, /*jobSalary*/ ctx[2]);
    			append_dev(div1, t3);
    			append_dev(div1, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(button, "click", exportImage, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const container_changes = {};

    			if (dirty & /*$$scope, jobTitle, jobLocation, jobSalary*/ 71) {
    				container_changes.$$scope = { dirty, ctx };
    			}

    			container.$set(container_changes);

    			if (dirty & /*jobTitle*/ 1 && input0.value !== /*jobTitle*/ ctx[0]) {
    				set_input_value(input0, /*jobTitle*/ ctx[0]);
    			}

    			if (dirty & /*jobLocation*/ 2 && input1.value !== /*jobLocation*/ ctx[1]) {
    				set_input_value(input1, /*jobLocation*/ ctx[1]);
    			}

    			if (dirty & /*jobSalary*/ 4 && input2.value !== /*jobSalary*/ ctx[2]) {
    				set_input_value(input2, /*jobSalary*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(container.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(container.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(container);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let jobTitle = "Senior React Engineer",
    		jobLocation = "Glasgow",
    		jobSalary = "60 - 65k";

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		jobTitle = this.value;
    		$$invalidate(0, jobTitle);
    	}

    	function input1_input_handler() {
    		jobLocation = this.value;
    		$$invalidate(1, jobLocation);
    	}

    	function input2_input_handler() {
    		jobSalary = this.value;
    		$$invalidate(2, jobSalary);
    	}

    	$$self.$capture_state = () => ({
    		Container,
    		Text,
    		Banner,
    		exportImage,
    		jobTitle,
    		jobLocation,
    		jobSalary
    	});

    	$$self.$inject_state = $$props => {
    		if ("jobTitle" in $$props) $$invalidate(0, jobTitle = $$props.jobTitle);
    		if ("jobLocation" in $$props) $$invalidate(1, jobLocation = $$props.jobLocation);
    		if ("jobSalary" in $$props) $$invalidate(2, jobSalary = $$props.jobSalary);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		jobTitle,
    		jobLocation,
    		jobSalary,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
