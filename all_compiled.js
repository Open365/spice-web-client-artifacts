/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

//If we are in NODE
if (typeof module !== "undefined" && module.exports) {

	jQuery = $ = {
		isArray: function (obj) {
			return Object.prototype.toString.apply(obj) === "[object Array]"
		},
		isPlainObject: function( obj ) {
			var key;

			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			for ( key in obj ) {}

			return key === undefined || core_hasOwn.call( obj, key );
		},
		extend: function() {
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			if ( typeof target === "boolean" ) {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			}

			// extend jQuery itself if only one argument is passed
			if ( length === i ) {
				target = this;
				--i;
			}

			for ( ; i < length; i++ ) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) != null ) {
					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && this.isArray(src) ? src : [];

							} else {
								clone = src && this.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[ name ] = this.extend( deep, clone, copy );

						// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		}
	};
}

$.extend({
	spcExtend: function(obj) {
		var f = function(c) {
			if(typeof this['init'] !== 'undefined') {
				this.init(c || {});
			}
		};
		f.prototype.superInit = obj.init;
		var args = [];
		args.push(f.prototype);
		var length = arguments.length;
		for(var i =0; i<length;i++) {
			args.push(arguments[i]);
		}

		$.extend.apply($, args);
		return f;
	}
});

$.extend(String.prototype, {
	lpad: function(padString, length) {
		var str = this;
		while (str.length < length)
		   str = padString + str;
		return str;
	},

	rpad: function(padString, length) {
		var str = this;
		while (str.length < length)
		   str = str + padString;
		return str;
	}
});

wdi = {};

wdi.DomainObject = {};

wdi.RawMessage = $.spcExtend(wdi.DomainObject, {
	status: null,
	data: null,

	init: function(c) {
		this.status = c.status;
		this.data = c.data;
	}
});

wdi.RawSpiceMessage = $.spcExtend(wdi.DomainObject, {
	header: null,
	body: null,
	channel: null,

	set: function(header, body, channel) {
		this.header = header;
		this.body = body;
		this.channel = channel;
	}
});

wdi.SpiceMessage = $.spcExtend(wdi.DomainObject, {
	messageType: null,
	args: null,
	channel: null,

	init: function(c) {
		this.channel = c.channel;
		this.messageType = c.messageType;
		this.args = c.args;
	}
});

wdi.EventObject = $.spcExtend(wdi.DomainObject, {
	events: null,

	init: function() {
		this.eyeEvents = {};
	},

	getListenersLength: function(eventName) {
		if (this.eyeEvents[eventName] == undefined) {
			this.eyeEvents[eventName] = [];
		}

		return this.eyeEvents[eventName].length;
	},

	addListener: function(eventName, fn, scope) {
		scope = scope || this;

		if (this.eyeEvents[eventName] == undefined) {
			this.eyeEvents[eventName] = [];
		}

		this.eyeEvents[eventName].push({
			fn: fn,
			scope: scope
		});
	},

	removeEvent: function(eventName) {
		this.eyeEvents[eventName] = undefined;
	},

	clearEvents: function() {
		this.eyeEvents = {};
	},

	fire: function(eventName, params) {
		var listeners = this.eyeEvents[eventName];
		if(listeners) {
			var size = listeners.length;
			while(size--) {
				listeners[size].fn.call(listeners[size].scope, params);
			}
		}
	}
});

wdi.CHANNEL_STATUS = {
	disconnected:-1,
	idle:0,
	establishing:1,
	established:2
};

wdi.Debug = {
	debug: false,

	/* these logging functions accept multiple parameters, and will be passed
	 * directly to console.{log,info,warn,error}(), so we can have better
	 * messages.
	 *
	 * Call them with multiple params instead of concatenating:
	 * YES: 
	 * NO : 
	 */

	log: function(variable_list_of_args /* , ... */) {
		if (this.debug) {
			console.log.apply(console, Array.prototype.slice.call(arguments));
		}
	},

	warn: function(variable_list_of_args /* , ... */) {
		console.warn.apply(console, Array.prototype.slice.call(arguments));
	},

	info: function(variable_list_of_args /* , ... */) {
		if (this.debug) {
			console.info.apply(console, Array.prototype.slice.call(arguments));
		}
	},

	error: function(variable_list_of_args /* , ... */) {
		console.error.apply(console, Array.prototype.slice.call(arguments));
	}
};

wdi.Utils = {
    generateWebSocketUrl: function(protocol, host, port, destHost, destPort, type, destInfoToken) {
        /**
         * Generates websockify URL.
         * If destHost and destPort are available, they are used to form explicit URL with host and port.
         * If not, an URL with destInfoToken is generated, host and port are resolved by backend service.
         */
        if ( ! destHost || ! destPort ) {
            url = protocol + '://' + host + ':' + port + '/websockify/destInfoToken/' + destInfoToken + '/type/' + type;
        } else {
            url = protocol + '://' + host + ':' + port + '/websockify/host/' + destHost + '/port/' + destPort + '/type/' + type;
        }
        return url;
    }
};

wdi.postMessageW3CCompilant = typeof window !== "undefined" && window['bowser'] && !(window['bowser']['msie'] && window['bowser']['version'] >= 10);

wdi.Exception = $.spcExtend(wdi.DomainObject, {
	errorCode: null,
	message: null,

	init: function(c) {
		this.message = c.message || '';
		this.errorCode = c.errorCode || 0;
	}
});

try {
	new ImageData(1,1);
} catch(e) {
	if (typeof window !== 'undefined') {//Just in case it is nodejs
		window.ImageData = function(arr, width, height) {
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			var imgData = context.createImageData(width, height);
			imgData.data.set(arr);
			return imgData;
		}
	}
}

wdi.bppMask = [];
wdi.bppMask[1] = [128, 64, 32, 16, 8, 4, 2, 1];
wdi.bppMask[4] = [240, 15];
wdi.bppMask[8] = [255];

wdi.SeamlessIntegration = true;
wdi.Debug.debug = false;
wdi.exceptionHandling = true;
wdi.IntegrationBenchmarkEnabled = false; // MS Excel loading time benchmark
wdi.useWorkers = true;
wdi.logOperations = false;

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.CollisionDetector = {
	thereIsBoxCollision: function(baseBox, queueBox) {
		if(baseBox.bottom < queueBox.top) return false;
		if(baseBox.top > queueBox.bottom) return false;
		if(baseBox.right < queueBox.left) return false;
		return baseBox.left < queueBox.right;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.GlobalPool = {
    pools: {},
    retained: null,
    init: function() {
        this.retained = {};
        var self = this;
        this.pools['ViewQueue'] = new wdi.GenericObjectPool([function() {
            //factory
            return new wdi.ViewQueue();
        }, function(obj, index) {
            //reset
            obj.poolIndex = index; //update index at pool
            obj.setData([]); //reset the object
        }]);

        this.pools['RawSpiceMessage'] = new wdi.GenericObjectPool([function() {
            //factory
            return new wdi.RawSpiceMessage();
        }, function(obj, index) {
            //reset
            obj.poolIndex = index; //update index at pool
            obj.set(null, null, null); //reset the object
        }]);

		this.retained['Image'] = [];
        this.pools['Image'] = new wdi.GenericObjectPool([function() {
            //factory
            return new Image();
        }, function(obj, index) {
            //reset
            obj.poolIndex = index;
            obj.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';//Blank image 1x1 pixel (avoids console error GET null image)
            obj.onload = null;
			obj.keepAlive = false;
			self.retained['Image'][index] = obj;
        }]);


        this.retained['Canvas'] = [];
        this.pools['Canvas'] = new wdi.GenericObjectPool([function() {
            //factory
            return self.createCanvas();
        }, function(obj, index) {
            //reset
            obj.keepAlive = false;
            //obj.getContext('2d').clearRect(0, 0, obj.width, obj.height);
            obj.poolIndex = index;
            self.retained['Canvas'][index] = obj;
        }]);
    },

    dispose: function () {
        var self = this;
        Object.keys(this.retained).forEach(function (key) {
            self.cleanPool(key);
            self.retained[key].length = 0;
        });
        Object.keys(this.pools).forEach(function (key) {
            self.pools[key].dispose();
        });
        this.pools = {};
        this.retained = null;
    },

    createCanvas: function() {
    	return $('<canvas/>')[0];
    },

    create: function(objectType) {
        return this.pools[objectType].create();
    },

    discard: function(objectType, obj) {
        //check if its an autorelease pool
        if(this.retained.hasOwnProperty(objectType)) {
            delete this.retained[objectType][obj.poolIndex];
        }
        return this.pools[objectType].discard(obj.poolIndex);
    },

    cleanPool: function(objectType) {

        if(this.retained.hasOwnProperty(objectType)) {
             var pool = this.pools[objectType];

             for(var i in this.retained[objectType]) {
                 if(pool.discard(this.retained[objectType][i].poolIndex)) {
                     delete this.retained[objectType][i];
                 }
             }
        } else {
            
        }
    }
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/*
Generic Object Pooling from:
https://github.com/miohtama/objectpool.js/
MIT License

Copyright (C) 2013 Mikko Ohtamaa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Version: 65c7399c30a3f6f3593bb4bfca3d9cde65675b84 (git commit)
 */


wdi.GenericObjectPool = $.spcExtend(wdi.EventObject.prototype, {

    /** How fast we grow */
    expandFactor : 0.2,

    /** Minimum number of items we grow */
    expandMinUnits : 16,

    elems : null,

    /** List of discarded element indexes in our this.elems pool */
    freeElems : null,

    allocator: null,
    resetor: null,

    /**
     * Generic object pool for Javascript.
     *
     * @param {Function} allocator return new empty elements
     *
     * @param {Function} resetor resetor(obj, index) is called on all new elements when they are (re)allocated from pool.
     *                   This is mostly useful for making object to track its own pool index.
     */
    init : function(params) {
        var allocator = params[0];
        var resetor = params[1];
        // Start with one element
        this.allocator = allocator;
        this.resetor = resetor;
        // Set initial state of 1 object
        this.elems = [this.allocator()];
        this.freeElems = [0];
    },

    dispose: function () {
        this.elems = null;
        this.freeElems = null;
        this.allocator = null;
        this.resetor = null;
    },

    /**
     * @return {[type]} [description]
     */
    create : function() {

        if(!this.freeElems.length) {
            this.expand();
        }

        // See if we have any allocated elements to reuse
        var index = this.freeElems.pop();
        var elem = this.elems[index];
        this.resetor(elem, index);
        return elem;

    },

    /**
     * How many allocated units we have
     *
     * @type {Number}
     */
    length : function() {
        return this.elems.length - this.freeElems.length;
    },

    /**
     * Make pool bigger by the default growth parameters.
     *
     */
    expand : function() {

        var oldSize = this.elems.length;

        var growth = Math.ceil(this.elems.length * this.expandFactor);

        if(growth < this.expandMinUnits) {
            growth = this.expandMinUnits;
        }

        this.elems.length = this.elems.length + growth;

        for(var i=oldSize; i<this.elems.length; i++) {
            this.elems[i] = this.allocator();
            this.freeElems.push(i);
        }
    },

    /**
     * Deallocate object at index n
     *
     * @param  {Number} n
     * @return {Object} discarded object
     */
    discard : function(n) {

        // Cannot double deallocate
        if(this.freeElems.indexOf(n) >= 0) {
            throw "GeneircObjectPool: Double-free for element index: "+n;
        }

        if(this.elems[n].keepAlive) {
            return false;
        }

        this.freeElems.push(n);
        return true;
    },

    /**
     * Return object at pool index n
     */
    get : function(n) {
        return this.elems[n];
    }
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.AsyncConsumer = $.spcExtend(wdi.EventObject.prototype, {
	worker: null,
	task: null,
	packetWorkerIdentifier: null,
	imageProperties: null,
	disposed: false,

	init: function(c) {
		this.superInit();
		this.worker = c.AsyncWorker || new wdi.AsyncWorker({
			script: wdi.spiceClientPath + 'application/WorkerProcess_c.js'
		});
		this.packetWorkerIdentifier = c.packetWorkerIdentifier || new wdi.PacketWorkerIdentifier();
	},

	consume: function(task) {
		this.task = task; //store current task
		var message = task.message;
		var imageProperties;

		//check if the packet is a type of packet that should be intercepted
		//this doesn't mean it contains a compressed image, it means that it COULD
		var intercept = this.packetWorkerIdentifier.shouldUseWorker(message);

		if(intercept == wdi.PacketWorkerIdentifier.processingType.DECOMPRESS) {
			//get image properties to check if there is really a compressed image
			imageProperties = this.packetWorkerIdentifier.getImageProperties(message);
			this.imageProperties = imageProperties;
			//compressed images are quic and lz
			if(imageProperties && (imageProperties.descriptor.type !=  wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_RGB &&
				imageProperties.descriptor.type != wdi.SpiceImageType.SPICE_IMAGE_TYPE_QUIC)) {

				intercept = 0;
			} else if(!imageProperties) {
				intercept = 0;
			}
		}

		//the packet is not going to be intercepted by the worker thread.
		//mark as procssed.
		if(intercept === 0) {
			this.taskDone();
			return;
		}

		var data;
		var descriptor;
		var opaque;
		var brush;
		var ret;
		var arr;
		var u8;

		if(intercept == wdi.PacketWorkerIdentifier.processingType.DECOMPRESS) {
			data = imageProperties.data;
			descriptor = imageProperties.descriptor;
			opaque = imageProperties.opaque;
			brush = imageProperties.brush;

			if(descriptor.type === wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_RGB) {
				var header = null;

				if(!brush) { //brushes are still js arrays
					var headerData = data.subarray(0,32).toJSArray();
					data = data.subarray(32); //skip the header
					header = wdi.LZSS.demarshall_rgb(headerData);
				} else {
					header = wdi.LZSS.demarshall_rgb(data);
				}



				arr = new ArrayBuffer(data.length+16);
				u8 = new Uint8Array(arr);

				u8[0] = 1; //LZ_RGB
				u8[1] = opaque;
				u8[2] = header.type;
				u8[3] = header.top_down; //RESERVED

				var number = header.width * header.height * 4;

				for (var i = 0;i < 4;i++) {//iterations because of javascript number size
					u8[4+i] = number & (255);//Get only the last byte
					number = number >> 8;//Remove the last byte
				}
				var view = new DataView(arr);
				view.setUint32(8, header.width);
				view.setUint32(12, header.height);
				u8.set(data, 16);

				//intercept
				//var encoded = encodeURIComponent(Base64.encode(u8.toJSArray()));
				//$.post('record.php','data='+encoded+'&name=lz_rgba_'+encoded.length+'_'+descriptor.width+'x'+descriptor.height);

				this.worker.run(arr, this._workerCompleted, {type: 'lz',top_down: header.top_down, opaque: opaque}, this);
			} else if(descriptor.type === wdi.SpiceImageType.SPICE_IMAGE_TYPE_QUIC) {
				var adata = new ArrayBuffer(data.length+4);
				var view = new Uint8Array(adata);
				view.set(data, 4);
				view[1] = opaque?1:0;
				view[0] = 0; //quic

				//intercept
				/*
				var jsarray = new Uint8Array(adata);
				var encoded = encodeURIComponent(Base64.encode(jsarray.toJSArray()));
				var dateat = Date.now() /1000;
				$.post('record.php','data='+encoded+'&name=quic_'+encoded.length+'_'+descriptor.width+'x'+descriptor.height);
				*/

				this.worker.run(adata, this._workerCompleted, {type: 'quic'}, this);
			}
		} else if(intercept == wdi.PacketWorkerIdentifier.processingType.PROCESSVIDEO) {
			data = this.packetWorkerIdentifier.getVideoData(message);
			arr = new ArrayBuffer(data.length+4);
			u8 = new Uint8Array(arr);

			u8[0] = 2; //2 means bytestouri
			u8[1] = 0;
			u8[2] = 0;
			u8[3] = 0; //reserved

			u8.set(data, 4);
			this.worker.run(arr, function(buf, params) {
				message.args.data = buf;
				this.taskDone();
			}, null, this);
		}
	},

	//executed from webworker when processing is finished
	_workerCompleted: function(buf, options) {
		if(!buf) {
			this.taskDone();
			return;
		}
		var descriptor = this.imageProperties.descriptor;
		var u8 = new Uint8ClampedArray(buf);
		var source_img = new ImageData(u8, descriptor.width, descriptor.height);

		//it is strange, but we can't use pooling on the getimagefromdata
		//the second argument (optional) tell getimagefromdata to avoid pooling
		var myImage = source_img;


		if(options.type === 'lz') {
			var top_down = options.top_down;
			var opaque = options.opaque;
			if(!top_down && !opaque) {
				myImage = wdi.graphics.getImageFromData(source_img, true);
				myImage = wdi.RasterOperation.flip(myImage);
			}
		}

		descriptor.originalType = descriptor.type;
		descriptor.type = wdi.SpiceImageType.SPICE_IMAGE_TYPE_CANVAS;

		//replace data
		if(this.task.message.messageType === wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL) {
			this.task.message.args.brush.pattern.imageData = myImage;
			this.task.message.args.brush.pattern.image.type = wdi.SpiceImageType.SPICE_IMAGE_TYPE_CANVAS;
		} else {
			this.task.message.args.image.data = myImage;
		}
		this.taskDone();
	},
	
	taskDone: function() {
		this.task.state = 1;
		this.fire('done', this);
	},

	dispose: function () {
		if (this.disposed) return;
		this.disposed = true;
		this.worker.dispose();

		this.worker = null;
		this.task = null;
		this.packetWorkerIdentifier = null;
		this.imageProperties = null;

	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.AsyncWorker = $.spcExtend(wdi.EventObject.prototype, {
	worker: null,
	fn: null,
	scope: null,
    params: null,
	callback: null,
    
	init: function(c) {
		this.superInit();
		this.worker = new Worker(c.script);
		var self = this;
		this.callback = function (oEvent) {
			self.fn.call(self.scope, oEvent.data, self.params);
		};
		this.worker.addEventListener("message", this.callback);
	},

	run: function(data, fn, params, scope) {
		this.fn = fn;
		this.scope = scope;
        this.params = params;

		if (wdi.postMessageW3CCompilant) {
			this.worker.postMessage(data, [data]);
		} else {
			this.worker.postMessage(data);
		}
	},

	dispose: function () {
		this.worker.removeEventListener("message", this.callback);
		this.worker.terminate();

		this.worker = null;
		this.fn = null;
		this.scope = null;
		this.params = null;
		this.callback = null;

	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * Check if a packet should be intercepted in packetpreprocess to be executed
 * in parallel.
 */

wdi.PacketWorkerIdentifier = $.spcExtend(wdi.EventObject.prototype, {
    init: function(c) {
        //default empty constructor
    },

	dispose: function () {

	},
    
    shouldUseWorker: function(message) {
		switch (message.messageType) {
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_COPY:
				return wdi.PacketWorkerIdentifier.processingType.DECOMPRESS;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL:
				var brush = message.args.brush;
				if(brush.type === wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
					return wdi.PacketWorkerIdentifier.processingType.DECOMPRESS;
				}
				break;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND:
				return wdi.PacketWorkerIdentifier.processingType.DECOMPRESS;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLEND:
				return wdi.PacketWorkerIdentifier.processingType.DECOMPRESS;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TRANSPARENT:
				return wdi.PacketWorkerIdentifier.processingType.DECOMPRESS;
			//case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DATA:
			//	return wdi.PacketWorkerIdentifier.processingType.PROCESSVIDEO;
		}

        return 0;
    },
    
    getImageProperties: function(message) {
        var props = {
            data: null,
            descriptor: null,
            opaque: true,
            brush: null
        };
        
		//coupling here, to be cleaned when doing real code
		switch (message.messageType) {
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_COPY:
				props.descriptor = message.args.image.imageDescriptor;
				props.data = message.args.image.data;
				break;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL:
				props.brush = message.args.brush;
				if(props.brush.type === wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
					props.descriptor = props.brush.pattern.image;
					props.data = props.brush.pattern.imageData;
				} else {
                    return false;
                }
				break;
			case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND:
            case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLEND:
            case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TRANSPARENT:
				props.data = message.args.image.data;
				props.descriptor = message.args.image.imageDescriptor;
				props.opaque = false;
				break;
            default:
                
                return false;
		}
        
        return props;
    },

    getVideoData: function(message) {
        if(message.messageType !== wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DATA) {
            
            return false;
        }

        return message.args.data;
    }
});

wdi.PacketWorkerIdentifier.processingType = {};
wdi.PacketWorkerIdentifier.processingType.DECOMPRESS = 1;
wdi.PacketWorkerIdentifier.processingType.PROCESSVIDEO = 2;

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.SpiceObject = {

    properties: {},

    //Methods to demarshall
    bytesToString: function (bytes, nbytes) {
        var result = '';
        var numBytes = nbytes || bytes.length;

        for (var i = 0; i < numBytes; i++) {
            result += String.fromCharCode(bytes.shift());
        }

        return result;
    },

    bytesToURI: function (data) {
        var blob = new Blob([data], {type: "image/jpeg"});
        return URL.createObjectURL(blob);
    },

    bytesToStringBE: function (bytes, nbytes) {
        var result = '';
        var numBytes = nbytes || bytes.length;

        for (var i = numBytes; i >= 0; i--) {
            result += String.fromCharCode(bytes[i]);
        }

        return result;
    },

    bytesToInt8: function (bytes) {
        return bytes.shift();
    },

    bytesToInt8NoAllocate: function (bytes) {
        var data = bytes.getByte(0);
        bytes.eatBytes(1);
        return data;
    },

    bytesToInt16: function (bytes) {
        var low = bytes.shift();
        var high = bytes.shift();

        return high * Math.pow(16, 2) + low;
    },

    bytesToInt16BE: function (bytes) {
        var high = bytes.shift();
        var low = bytes.shift();

        return high * Math.pow(16, 2) + low;
    },

    bytesToInt32: function (bytes) {
        var low = wdi.SpiceObject.bytesToInt16(bytes);
        var high = wdi.SpiceObject.bytesToInt16(bytes);

        return high * Math.pow(16, 4) + low;
    },

    bytesToInt16NoAllocate: function (bytes) {
        var low = bytes.getByte(0);
        var high = bytes.getByte(1);
        bytes.eatBytes(2);
        return high * Math.pow(16, 2) + low;
    },

    bytesToInt32NoAllocate: function (bytes) {
        var low = wdi.SpiceObject.bytesToInt16NoAllocate(bytes);
        var high = wdi.SpiceObject.bytesToInt16NoAllocate(bytes);
        return high * Math.pow(16, 4) + low;
    },

    bytesToInt32BE: function (bytes) {
        var high = wdi.SpiceObject.bytesToInt16BE(bytes);
        var low = wdi.SpiceObject.bytesToInt16BE(bytes);

        return high * Math.pow(16, 4) + low;
    },

    bytesToInt64: function (bytes) {
        var low = wdi.SpiceObject.bytesToInt32(bytes).toString(2).lpad('0', 32);
        var high = wdi.SpiceObject.bytesToInt32(bytes).toString(2).lpad('0', 32);

        return BigInteger.parse(high + low, 2);
    },

    bytesToInt64NoAllocate: function (bytes) {
        var low = wdi.SpiceObject.bytesToInt32NoAllocate(bytes).toString(2).lpad('0', 32);
        var high = wdi.SpiceObject.bytesToInt32NoAllocate(bytes).toString(2).lpad('0', 32);

        return BigInteger.parse(high + low, 2);
    },

    bytesToInt64BE: function (bytes) {
        var high = wdi.SpiceObject.bytesToInt32BE(bytes).toString(2).lpad('0', 32);
        var low = wdi.SpiceObject.bytesToInt32BE(bytes).toString(2).lpad('0', 32);

        return BigInteger.parse(high + low, 2);
    },

    bytesToArray: function (arr, blockSize, nblocks, endian) {
        var length = arr.length;
        var numBlocks = nblocks || length;
        var endianness = endian || 'LE';
        var numbers = [];
        var f = null;

        switch (blockSize) {
            case 8:
                f = wdi.SpiceObject.bytesToInt8;
                break;
            case 16:
                endianness == 'LE' ? f = wdi.SpiceObject.bytesToInt16 : f = wdi.SpiceObject.bytesToInt16BE;
                break;
            case 32:
                endianness == 'LE' ? f = wdi.SpiceObject.bytesToInt32 : f = wdi.SpiceObject.bytesToInt32BE;
                break;
            case 64:
                endianness == 'LE' ? f = wdi.SpiceObject.bytesToInt64 : f = wdi.SpiceObject.bytesToInt64BE;
                break;
            default:
                throw new Exception("Not supported number of bits", 1);
                return false;
        }

        for (var i = 0; i < numBlocks; i++) {
            numbers = numbers.concat(f(arr));
        }

        return numbers;
    },

    int32ToDouble: function (number) {
        var sInt = wdi.SpiceObject.unsignedToSigned(number >> 4);
        var decimals = (number & 0x0f) / 0x0f;
        var result = decimals + sInt;

        return result;
    },

    unsignedToSigned: function (number, stride) {
        //TODO: ugly?
        var maxBit = Math.pow(2, stride) - 1;
        if (number & Math.pow(2, stride - 1)) {
            number = -1 * (maxBit - number);
        }
        return number;
    },

    //Methods to marshall
    arrayToBytes: function (arr, blockSize, nblocks) {
        var length = arr.length;
        var numBlocks = nblocks || length;
        var f = null;
        var rawData = [];

        switch (blockSize) {
            case 8:
                f = wdi.SpiceObject.numberTo8;
                break;
            case 16:
                f = wdi.SpiceObject.numberTo16;
                break;
            case 32:
                f = wdi.SpiceObject.numberTo32;
                break;
            case 64:
                f = wdi.SpiceObject.numberTo64;
                break;
            default:
                throw new Exception("Not supported number of bits", 1);
                return false;
        }

        for (var i = 0; i < numBlocks; i++) {
            if (i <= length) {
                rawData = rawData.concat(f(arr[i]));
            } else {
                rawData.push(0x00);
            }
        }

        return rawData;
    },

    stringToBytes: function (str) {
        // Code from  http://stackoverflow.com/a/18729931
        var utf8 = [];
        for (var i=0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                    | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                    0x80 | ((charcode>>12) & 0x3f),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    },

    arrayBufferToBytes: function(buffer) {
        return (new Uint8Array(buffer)).toJSArray();
    },

    stringHexToBytes: function (string) {
        var length = string.length;
        var rawData = [];

        for (var i = 0; i < length; i += 2) {
            rawData.push(parseInt(string[i] + string[i + 1], 16));
        }

        return rawData;
    },

    stringBinaryToBytes: function (string, blocksize) {
        string = string.lpad('0', blocksize);
        var rawData = [];

        for (var i = blocksize; i >= 8; i -= 8) {
            rawData = rawData.concat(parseInt(string.substr(i - 8, 8), 2));
        }

        return rawData;
    },

    stringToBytesPadding: function (string, size) {
        var rawData = [];
        var strsize = string.length;

        for (var i = 0; i < size; i++) {
            if (size > strsize - 1) {
                rawData.push(0x00);
            } else {
                rawData.push(string.charCodeAt(i));
            }
        }

        return rawData;
    },

    numberTo64: function (biginteger) {
        var tmp = this.numberTo32((biginteger & 0xffffffffffffffff) >> 32);
        var tmp2 = this.numberTo32(biginteger & 0x00000000ffffffff);
        var rawData = tmp2.concat(tmp);
        return rawData;
    },

    numberTo32: function (number) {
        var rawData = new Array(3);

        for (var i = 0; i < 4; i++) {//iterations because of javascript number size
            rawData[i] = number & (255);//Get only the last byte
            number = number >> 8;//Remove the last byte
        }

        return rawData;
    },

    numberTo16: function (number) {
        var rawData = new Array(1);

        for (var i = 0; i < 2; i++) {
            rawData[i] = number & (255);
            number = number >> 8;
        }

        return rawData;
    },

    numberTo8: function (number) {
        return [number & (255)];
    },

    getMessageProperties: function () {
        return this.properties;
    },

    getMessageProperty: function (propName, defaultValue) {
        if (this.properties.hasOwnProperty(propName)) {
            return this.properties[propName];
        } else {
            return defaultValue;
        }
    }
};

wdi.SpiceDataHeader = $.spcExtend(wdi.SpiceObject, {
    objectSize:6,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        //this.serial = c.serial;
        this.type = c.type;
        this.size = c.size;
        //this.sub_list = c.sub_list;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            //this.numberTo64(this.serial),
            this.numberTo16(this.type),
            this.numberTo32(this.size)
            //sthis.numberTo32(this.sub_list)W
        );
        return this.rawData;
    },

    demarshall: function(queue) {
        //this.serial = this.bytesToInt64(queue.shift(8));
        this.type = this.bytesToInt16NoAllocate(queue);
        this.size = this.bytesToInt32NoAllocate(queue);
        //this.sub_list = this.bytesToInt32(queue.shift(4));

        return this;
    }
});

wdi.SpiceLinkAuthMechanism = $.spcExtend(wdi.SpiceObject, {
    objectSize:4,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        this.auth_mechanism = c.auth_mechanism;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.auth_mechanism)
        );
        return this.rawData;
    },

    demarshall: function(queue) {
        this.expectedSize = arguments[1] || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode:3});
        this.auth_mechanism = this.bytesToInt32NoAllocate(queue);
        'customDemarshall' in this?this.customDemarshall(queue):false;

        return this;
    }
});

wdi.SpiceLinkReply = $.spcExtend(wdi.SpiceObject, {
    objectSize:178,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        this.error = c.error;
        this.pub_key = c.pub_key;
        this.num_common_caps = c.num_common_caps;
        this.num_channel_caps = c.num_channel_caps;
        this.caps_offset = c.caps_offset;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.error),
            this.arrayToBytes(this.pub_key, 8),
            this.numberTo32(this.num_common_caps),
            this.numberTo32(this.num_channel_caps),
            this.numberTo32(this.caps_offset)
        );
        return this.rawData;
    },

    demarshall: function(queue) {
        this.expectedSize = arguments[1] || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode:3});
        this.error = this.bytesToInt32NoAllocate(queue);
        this.pub_key = this.bytesToArray(queue.shift(this.expectedSize), 8);
        this.num_common_caps = this.bytesToInt32NoAllocate(queue);
        this.num_channel_caps = this.bytesToInt32NoAllocate(queue);
        this.caps_offset = this.bytesToInt32NoAllocate(queue);
        'customDemarshall' in this?this.customDemarshall(queue):false;

        return this;
    }
});

wdi.SpiceLinkEncryptedTicket = $.spcExtend(wdi.SpiceObject, {
    objectSize:128,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        this.encrypted_data = c.encrypted_data;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.stringToBytes(this.encrypted_data, 8)
        );
        return this.rawData;
    },

    demarshall: function(queue) {
        this.expectedSize = arguments[1] || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode:3});
        this.encrypted_data = this.bytesToArray(queue.shift(this.expectedSize), 8);
        'customDemarshall' in this?this.customDemarshall(queue):false;

        return this;
    }
});

wdi.SpiceLinkMess = $.spcExtend(wdi.SpiceObject, {
    objectSize:18,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        this.connection_id = c.connection_id;
        this.channel_type = c.channel_type;
        this.channel_id = c.channel_id;
        this.num_common_caps = c.num_common_caps;
        this.num_channel_caps = c.num_channel_caps;
        this.caps_offset = c.caps_offset;
        this.common_caps = c.common_caps;
        this.channel_caps = c.channel_caps;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.connection_id),
            this.numberTo8(this.channel_type),
            this.numberTo8(this.channel_id),
            this.numberTo32(this.num_common_caps),
            this.numberTo32(this.num_channel_caps),
            this.numberTo32(this.caps_offset)
        );
        if(this.num_common_caps > 0) {
            this.rawData = this.rawData.concat(this.numberTo32(this.common_caps));
        }
        if(this.num_channel_caps > 0) {
            this.rawData = this.rawData.concat(this.numberTo32(this.channel_caps));
        }
        return this.rawData;
    },

    demarshall: function(queue) {
        this.expectedSize = arguments[1] || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode:3});
        this.connection_id = this.bytesToInt32NoAllocate(queue);
        this.channel_type = this.bytesToInt8NoAllocate(queue);
        this.channel_id = this.bytesToInt8NoAllocate(queue);
        this.num_common_caps = this.bytesToInt32NoAllocate(queue);
        this.num_channel_caps = this.bytesToInt32NoAllocate(queue);
        this.caps_offset = this.bytesToInt32NoAllocate(queue);
        'customDemarshall' in this?this.customDemarshall(queue):false;

        return this;
    }
});

wdi.SpiceLinkHeader = $.spcExtend(wdi.SpiceObject, {
    objectSize:16,

    init: function(c) {
        c?this.setContent(c):false;
    },

    setContent: function(c) {
        this.magic = c.magic;
        this.major_version = c.major_version;
        this.minor_version = c.minor_version;
        this.size = c.size;
    },

    marshall: function() {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.magic),
            this.numberTo32(this.major_version),
            this.numberTo32(this.minor_version),
            this.numberTo32(this.size)
        );
        return this.rawData;
    },

    demarshall: function(queue) {
        this.expectedSize = arguments[1] || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode:3});
        this.magic = this.bytesToInt32NoAllocate(queue);
        this.major_version = this.bytesToInt32NoAllocate(queue);
        this.minor_version = this.bytesToInt32NoAllocate(queue);
        this.size = this.bytesToInt32NoAllocate(queue);
        'customDemarshall' in this?this.customDemarshall(queue):false;

        return this;
    }
});

wdi.RedMigrateData = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.vector = c.vector;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.arrayToBytes(this.vector, 8)
        );

        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.vector = this.bytesToArray(queue.shift(this.expectedSize), 8);
        

        return this;
    }
});

wdi.RedMainInit = $.spcExtend(wdi.SpiceObject, {
    objectSize: 32,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.session_id = c.session_id;
        this.display_channels_hint = c.display_channels_hint;
        this.supported_mouse_modes = c.supported_mouse_modes;
        this.current_mouse_mode = c.current_mouse_mode;
        this.agent_connected = c.agent_connected;
        this.agent_tokens = c.agent_tokens;
        this.multi_media_time = c.multi_media_time;
        this.ram_hint = c.ram_hint;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.session_id),
            this.numberTo32(this.display_channels_hint),
            this.numberTo32(this.supported_mouse_modes),
            this.numberTo32(this.current_mouse_mode),
            this.numberTo32(this.agent_connected),
            this.numberTo32(this.agent_tokens),
            this.numberTo32(this.multi_media_time),
            this.numberTo32(this.ram_hint)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.session_id = this.bytesToInt32NoAllocate(queue);
        this.display_channels_hint = this.bytesToInt32NoAllocate(queue);
        this.supported_mouse_modes = this.bytesToInt32NoAllocate(queue);
        this.current_mouse_mode = this.bytesToInt32NoAllocate(queue);
        this.agent_connected = this.bytesToInt32NoAllocate(queue);
        this.agent_tokens = this.bytesToInt32NoAllocate(queue);
        this.multi_media_time = this.bytesToInt32NoAllocate(queue);
        this.ram_hint = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceMsgMainAgentConnected = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        

        return this;
    }
});

wdi.SpiceChannelsList = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.num_of_channels = c.num_of_channels;
        this.channels = c.channels;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.num_of_channels),
            this.arrayToBytes(this.channels, 16)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.num_of_channels = this.bytesToInt32NoAllocate(queue);
        this.channels = this.bytesToArray(queue.shift(this.expectedSize), 16);
        

        return this;
    }
});

wdi.RedSetAck = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.generation = c.generation;
        this.window = c.window;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.generation),
            this.numberTo32(this.window)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.generation = this.bytesToInt32NoAllocate(queue);
        this.window = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

//Exactly the same as RedPong
wdi.RedPing = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.id = c.id;
        this.time = c.time;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.id),
            this.numberTo64(this.time)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.id = this.bytesToInt32NoAllocate(queue);
        this.time = this.bytesToInt64NoAllocate(queue);

        if (this.expectedSize > 12) {
            queue.shift(this.expectedSize - 12);
        }


        return this;
    }
});

wdi.RedMigrate = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.flags = c.flags;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.flags)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.flags = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.RedWaitForChannel = $.spcExtend(wdi.SpiceObject, {
    objectSize: 10,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.type = c.type;
        this.id = c.id;
        this.serial = c.serial;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo8(this.type),
            this.numberTo8(this.id),
            this.numberTo64(this.serial)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.type = this.bytesToInt8NoAllocate(queue);
        this.id = this.bytesToInt8NoAllocate(queue);
        this.serial = this.bytesToInt64NoAllocate(queue);
        

        return this;
    }
});

wdi.RedWaitForChannels = $.spcExtend(wdi.SpiceObject, {
    objectSize: 1,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.wait_count = c.wait_count;
        this.wait_list = c.wait_list;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo8(this.wait_count),
            this.arrayToBytes(this.wait_list, 8)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.wait_count = this.bytesToInt8NoAllocate(queue);
        this.wait_list = this.bytesToArray(queue.shift(this.expectedSize), 8);
        

        return this;
    }
});

wdi.RedDisconnect = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.time_stamp = c.time_stamp;
        this.reason = c.reason;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo64(this.time_stamp),
            this.numberTo32(this.reason)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.time_stamp = this.bytesToInt64NoAllocate(queue);
        this.reason = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.RedMigrationBegin = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.port = c.port;
        this.sport = c.sport;
        this.host_name = c.host_name;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo16(this.port),
            this.numberTo16(this.sport),
            this.arrayToBytes(this.host_name, 8)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.port = this.bytesToInt16NoAllocate(queue);
        this.sport = this.bytesToInt16NoAllocate(queue);
        this.host_name = this.bytesToArray(queue.shift(this.expectedSize), 8);
        

        return this;
    }
});

wdi.RedNotify = $.spcExtend(wdi.SpiceObject, {
    objectSize: 25,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.time_stamp = c.time_stamp;
        this.severity = c.severity;
        this.visibility = c.visibility;
        this.what = c.what;
        this.message_len = c.message_len;
        this.message = c.message;
        this.zero = c.zero;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo64(this.time_stamp),
            this.numberTo32(this.severity),
            this.numberTo32(this.visibility),
            this.numberTo32(this.what),
            this.numberTo32(this.message_len),
            this.arrayToBytes(this.message, 8),
            this.numberTo8(this.zero)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.time_stamp = this.bytesToInt64NoAllocate(queue);
        this.severity = this.bytesToInt32NoAllocate(queue);
        this.visibility = this.bytesToInt32NoAllocate(queue);
        this.what = this.bytesToInt32NoAllocate(queue);
        this.message_len = this.bytesToInt32NoAllocate(queue);
        this.message = this.bytesToString(queue.shift(this.message_len));
        this.zero = this.bytesToInt8NoAllocate(queue);
        

        return this;
    }
});

wdi.RedMode = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.width = c.width;
        this.height = c.height;
        this.depth = c.depth;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.width),
            this.numberTo32(this.height),
            this.numberTo32(this.depth)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.width = this.bytesToInt32NoAllocate(queue);
        this.height = this.bytesToInt32NoAllocate(queue);
        this.depth = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceCDisplayInit = $.spcExtend(wdi.SpiceObject, {
    objectSize: 14,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.pixmap_cache_id = c.pixmap_cache_id;
        this.pixmap_cache_size = c.pixmap_cache_size;
        this.glz_dictionary_id = c.glz_dictionary_id;
        this.glz_dictionary_window_size = c.glz_dictionary_window_size;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo8(this.pixmap_cache_id),
            this.numberTo8(0), //LSB
            this.numberTo8(127),
            this.numberTo8(0),
            this.numberTo8(0),
            this.numberTo8(0),
            this.numberTo8(0),
            this.numberTo8(0),
            this.numberTo8(0), //MSB
            this.numberTo8(this.glz_dictionary_id),
            this.numberTo32(this.glz_dictionary_window_size)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.pixmap_cache_id = this.bytesToInt8NoAllocate(queue);
        this.pixmap_cache_size = this.bytesToInt64NoAllocate(queue);
        this.glz_dictionary_id = this.bytesToInt8NoAllocate(queue);
        this.glz_dictionary_window_size = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceSurfaceDestroy = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.surface_id = c.surface_id;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.surface_id)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.surface_id = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceSurface = $.spcExtend(wdi.SpiceObject, {
    objectSize: 20,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.surface_id = c.surface_id;
        this.width = c.width;
        this.height = c.height;
        this.format = c.format;
        this.flags = c.flags;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.surface_id),
            this.numberTo32(this.width),
            this.numberTo32(this.height),
            this.numberTo32(this.format),
            this.numberTo32(this.flags)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.surface_id = this.bytesToInt32NoAllocate(queue);
        this.width = this.bytesToInt32NoAllocate(queue);
        this.height = this.bytesToInt32NoAllocate(queue);
        this.format = this.bytesToInt32NoAllocate(queue);
        this.flags = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpicePath = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,


    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        var num = this.num_segments = this.bytesToInt32NoAllocate(queue);
        this.segments = [];

        for (var i= 0; i < num;i++) {
            this.segments[i] = new wdi.SpicePathSeg().demarshall(queue);
        }

        return this;
    }
});

wdi.SpicePathSeg = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,


    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.flags = this.bytesToInt8NoAllocate(queue);
        var count = this.count = this.bytesToInt32NoAllocate(queue);
        this.points = [];
        for(var i=0;i<count;i++) {
            this.points[i] = new wdi.SpicePointFix().demarshall(queue);
        }

        return this;
    }
});

wdi.SpicePoint = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.x = c.x;
        this.y = c.y;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.x),
            this.numberTo32(this.y)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.x = this.unsignedToSigned(this.bytesToInt32(queue.shift(4)), 32);
        this.y = this.unsignedToSigned(this.bytesToInt32(queue.shift(4)), 32);
        

        return this;
    }
});

wdi.SpicePoint16 = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.x = c.x;
        this.y = c.y;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo16(this.x),
            this.numberTo16(this.y)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.x = this.bytesToInt16NoAllocate(queue);
        this.y = this.bytesToInt16NoAllocate(queue);
        

        return this;
    }
});

wdi.SpicePointFix = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.x = c.hasOwnProperty('x') ? c.x : 0;
        this.y = c.hasOwnProperty('y') ? c.y : 0;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.x),
            this.numberTo32(this.y)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.x = this.int32ToDouble(this.bytesToInt32(queue.shift(4)), 32);
        this.y = this.int32ToDouble(this.bytesToInt32(queue.shift(4)), 32);
        

        return this;
    }
});

wdi.SpiceRect = $.spcExtend(wdi.SpiceObject, {
    objectSize: 16,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.top = c.top;
        this.left = c.left;
        this.bottom = c.bottom;
        this.right = c.right;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.top),
            this.numberTo32(this.left),
            this.numberTo32(this.bottom),
            this.numberTo32(this.right)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        //if (queue.getLength() < this.objectSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.top = this.bytesToInt32NoAllocate(queue);
        this.left = this.bytesToInt32NoAllocate(queue);
        this.bottom = this.bytesToInt32NoAllocate(queue);
        this.right = this.bytesToInt32NoAllocate(queue);

        return this;
    }
});

wdi.SpiceClipRects = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.num_rects = c.num_rects;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.num_rects)
        );
        for (var i = 0; i < this.num_rects; i++) {
            this.rawData = this.rawData.concat(this.rects[i].marshall());
        }

        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.num_rects = this.bytesToInt32NoAllocate(queue);

        if (this.num_rects > 0) {
            this.rects = [];
            for (var i = 0; i < this.num_rects; i++) {
                this.rects[i] = new wdi.SpiceRect().demarshall(queue);
            }
        }

        return this;
    }
});


wdi.SpiceClip = $.spcExtend(wdi.SpiceObject, {
    objectSize: 1,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.type = c.type;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo8(this.type)
        );
        if (this.type == wdi.SpiceClipType.SPICE_CLIP_TYPE_RECTS) {
            this.rawData = this.rawData.concat(
                this.rects.marshall()
            );
        }
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.type = this.bytesToInt8NoAllocate(queue);

        if (this.type == wdi.SpiceClipType.SPICE_CLIP_TYPE_RECTS) {
            this.rects = new wdi.SpiceClipRects().demarshall(queue);
        }
        return this;
    }
});

wdi.SpiceDisplayBase = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.surface_id = c.surface_id;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.surface_id),
            this.box.marshall(),
            this.clip.marshall()
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.surface_id = this.bytesToInt32NoAllocate(queue);
        this.box = new wdi.SpiceRect().demarshall(queue);
        this.clip = new wdi.SpiceClip().demarshall(queue);
        return this;
    }
});

wdi.SpiceQMask = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.numberTo8(this.flags),
            this.pos.marshall(),
            this.numberTo32(this.offset)
        );
        if (this.offset) {
            rawData = rawData.concat(
                this.image.marshall()
            );
        }
        return rawData;
    },

    demarshall: function (queue, expSize) {
        //in the timeline, demarshalling spiceqmask takes lot of time
        //and mask is not used anywhere in the code, its still unsupported
        //so we leave it commented until we realize whats a mask and why it takes sooooo long
        //to demarshall
        //to prevent the packet to not be contiguous, remove the bytes and leave
        queue.eatBytes(13); //the normal qmask size
        /*
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.flags = this.bytesToInt8NoAllocate(queue);
        this.pos = new wdi.SpicePoint().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        if (this.offset) {
            
            var qdata = new wdi.ViewQueue();
            qdata.setData(queue.getDataOffset(this.offset));
            this.image = new wdi.SpiceImage().demarshall(qdata);
        }
        return this;
        */
    }
});

wdi.SpiceImageDescriptor = $.spcExtend(wdi.SpiceObject, {
    objectSize: 18,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.numberTo64(this.id),
            this.numberTo8(this.type),
            this.numberTo8(this.flags),
            this.numberTo32(this.width),
            this.numberTo32(this.height)
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        var id = this.bytesToInt32NoAllocate(queue);
        this.id = id.toString(16)+this.bytesToInt32NoAllocate(queue).toString(16);
        this.type = this.bytesToInt8NoAllocate(queue);
        this.flags = this.bytesToInt8NoAllocate(queue);
        this.width = this.bytesToInt32NoAllocate(queue);
        this.height = this.bytesToInt32NoAllocate(queue);
        this.offset = queue.getPosition();
        

        return this;
    }
});

wdi.SpiceImage = $.spcExtend(wdi.SpiceObject, {
    objectSize: 1,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.imageDescriptor.marshall(),
            this.data
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.imageDescriptor = new wdi.SpiceImageDescriptor().demarshall(queue);
        this.data = queue.getRawData();
        return this;
    }
});

wdi.SpiceDrawCopy = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    properties: {
        'overWriteScreenArea': true
    },

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.offset = c.offset;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.base.marshall(),
            this.numberTo32(this.offset),
            this.src_area.marshall(),
            this.numberTo16(this.rop_descriptor),
            this.numberTo8(this.scale_mode),
            this.mask.marshall(),
            this.image.marshall()
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        //this.src_bitmap = new wdi.SpiceImageDescriptor().demarshall(queue);
        this.src_area = new wdi.SpiceRect().demarshall(queue);
        this.rop_descriptor = this.bytesToInt16NoAllocate(queue);
        this.scale_mode = this.bytesToInt8NoAllocate(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);


        //if offset equals to "at", then there is no need to adapt the queue!
        //this gives 10ms instead of 30ms in lot of situations
        if (queue.getPosition() == this.offset) {
            this.image = new wdi.SpiceImage().demarshall(queue);
        } else {
            var qdata = new wdi.ViewQueue();
            qdata.setData(queue.getDataOffset(this.offset));
            this.image = new wdi.SpiceImage().demarshall(qdata);
        }

        return this;
    }
});

wdi.drawBlend = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.base = c.base;
        this.alpha_flags = c.alpha_flags;
        this.alpha = c.alpha;
        this.offset = c.offset;
        this.src_area = c.src_area;
    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.numberTo32(this.offset),
            this.src_area.marshall(),
            this.numberTo16(this.rop_descriptor),
            this.numberTo8(this.flags),
            this.mask.marshall(),
            this.image.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.src_area = new wdi.SpiceRect().demarshall(queue);
        this.rop_descriptor = this.bytesToInt16NoAllocate(queue);
        this.flags = this.bytesToInt8NoAllocate(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);

        this.image = new wdi.SpiceImage().demarshall(queue);
        return this;
    }
});

wdi.drawAlphaBlend = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.base = c.base;
        this.alpha_flags = c.alpha_flags;
        this.alpha = c.alpha;
        this.offset = c.offset;
        this.src_area = c.src_area;
    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.alpha_flags = this.bytesToInt8NoAllocate(queue);
        this.alpha = this.bytesToInt8NoAllocate(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.src_area = new wdi.SpiceRect().demarshall(queue);

        this.image = new wdi.SpiceImage().demarshall(queue);
        return this;
    }
});

wdi.drawTransparent = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.src_area = new wdi.SpiceRect().demarshall(queue);
        this.transparent_color = new wdi.SpiceColor().demarshall(queue);
        this.transparent_true_color = new wdi.SpiceColor().demarshall(queue);
        this.image = new wdi.SpiceImage().demarshall(queue);
        return this;
    }
});

wdi.SpiceCopyBits = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.offset = c.offset;
    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.src_position.marshall()
        );
        return rawData;

    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.src_position = new wdi.SpicePoint().demarshall(queue);
        return this;
    }
});

wdi.SpiceImageLZRGB = $.spcExtend(wdi.SpiceObject, {
    objectSize: 32,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.length = this.bytesToInt32BE(queue.shift(4));
        this.magic = this.bytesToStringBE(queue.shift(4));
        this.version = this.bytesToInt32BE(queue.shift(4));
        this.type = this.bytesToInt32BE(queue.shift(4));
        this.width = this.bytesToInt32BE(queue.shift(4));
        this.height = this.bytesToInt32BE(queue.shift(4));
        this.stride = this.bytesToInt32BE(queue.shift(4));
        this.top_down = this.bytesToInt32BE(queue.shift(4));

        this.data = queue.shift(this.length);

        return this;
    }
});

wdi.SpiceMouseModeRequest = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.request_mode = c.request_mode;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.request_mode)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.request_mode = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceMouseMode = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.supported_modes = c.supported_modes;
        this.current_mode = c.current_mode;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.supported_modes),
            this.numberTo32(this.current_mode)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) return;
        this.supported_modes = this.bytesToInt16NoAllocate(queue);
        this.current_mode = this.bytesToInt16NoAllocate(queue);
        

        return this;
    }
});

wdi.RedcMousePress = $.spcExtend(wdi.SpiceObject, {
    objectSize: 3,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.button_id = c.button_id;
        this.buttons_state = c.buttons_state;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo8(this.button_id),
            this.numberTo16(this.buttons_state)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.button_id = this.bytesToInt8NoAllocate(queue);
        this.buttons_state = this.bytesToInt16NoAllocate(queue);
        

        return this;
    }
});

wdi.RedcMousePosition = $.spcExtend(wdi.SpiceObject, {
    objectSize: 11,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.x = c.x;
        this.y = c.y;
        this.buttons_state = c.buttons_state;
        this.display_id = c.display_id;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.x),
            this.numberTo32(this.y),
            this.numberTo16(this.buttons_state),
            this.numberTo8(this.display_id)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.x = this.bytesToInt32NoAllocate(queue);
        this.y = this.bytesToInt32NoAllocate(queue);
        this.buttons_state = this.bytesToInt16NoAllocate(queue);
        this.display_id = this.bytesToInt8NoAllocate(queue);
        

        return this;
    }
});

wdi.RedcMouseMotion = $.spcExtend(wdi.SpiceObject, {
    objectSize: 10,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.x = c.x;
        this.y = c.y;
        this.buttons_state = c.buttons_state;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.x),
            this.numberTo32(this.y),
            this.numberTo16(this.buttons_state)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.x = this.bytesToInt32NoAllocate(queue);
        this.y = this.bytesToInt32NoAllocate(queue);
        this.buttons_state = this.bytesToInt16NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceBrush = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.type = c.type;
        this.color = c.color;
    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.type = this.bytesToInt8NoAllocate(queue);

        if (this.type == wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
            this.pattern = new wdi.SpicePattern().demarshall(queue);
        } else if (this.type == wdi.SpiceBrushType.SPICE_BRUSH_TYPE_SOLID) {
            this.color = new wdi.SpiceColor().demarshall(queue);
        }

        return this;
    }
});

wdi.SpiceColor = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        return [this.r, this.g, this.b];
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.data = this.bytesToInt32(queue.shift(4)) & 0xffffff; //make sure 24 bits, this is RGB888

        this.r = (this.data >> 16);
        this.g = ((this.data >> 8) & 0xff);
        this.b = (this.data & 0xff);

        this.html_color = "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";

        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);

        if(r.length < 2) {
            r = '0'+r;
        }

        if(g.length < 2) {
            g = '0'+g;
        }

        if(b.length < 2) {
            b = '0'+b;
        }

        this.simple_html_color = '#'+r+g+b;
        return this;
    }
});

wdi.RgbaColor = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.data = this.bytesToInt32(queue.shift(4)) & 0xffffffff; //make sure 32 bits, this is ARGB8888

        this.a = this.data >>> 24;
        this.r = (this.data >>> 16) & 0xff;
        this.g = (this.data >>> 8) & 0xff;
        this.b = this.data & 0xff;

        this.html_color = "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";

        return this;
    }
});

wdi.SpicePattern = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.point = new wdi.SpicePoint().demarshall(queue);
        var qdata = new wdi.ViewQueue();
        qdata.setData(queue.getDataOffset(this.offset));
        this.image = new wdi.SpiceImage().demarshall(qdata);

        return this;
    }
});

wdi.SpiceDrawFill = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    properties: {
        'overWriteScreenArea': true
    },

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.offset = c.offset;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.offset)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.brush = new wdi.SpiceBrush().demarshall(queue);
        this.rop_descriptor = this.bytesToInt16NoAllocate(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);

        if (this.brush.type == wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
            this.brush.pattern.image = new wdi.SpiceImageDescriptor().demarshall(queue);
            this.brush.pattern.imageData = queue.getData();
        }
        return this;
    }
});

wdi.SpiceDrawRop3 = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,


    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.numberTo32(this.offset),
            this.src_area.marshall(),
            this.brush.marshall(),
            this.numberTo8(this.rop_descriptor),
            this.numberTo8(this.scale_mode),
            this.mask.marshall(),
            this.src_image.marshall()
        );
        if (this.brush.type == wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
            rawData = rawData.concat(
                this.brush.pattern.image.marshall(),
                this.brush.pattern.imageData
            );
        }
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.src_area = new wdi.SpiceRect().demarshall(queue);
        this.brush = new wdi.SpiceBrush().demarshall(queue);
        this.rop_descriptor = this.bytesToInt8NoAllocate(queue);
        this.scale_mode = this.bytesToInt8NoAllocate(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);
        this.src_image = new wdi.SpiceImage().demarshall(queue);

        if (this.brush.type == wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
            this.brush.pattern.image = new wdi.SpiceImageDescriptor().demarshall(queue);
            this.brush.pattern.imageData = queue.getData();
        }
        return this;
    }
});

wdi.SpiceDrawBlackness = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.offset = c.offset;
    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.mask.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);
        return this;
    }
});

wdi.SpiceDrawWhiteness = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.offset = c.offset;
    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.mask.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);
        return this;
    }
});

wdi.SpiceScanCode = $.spcExtend(wdi.SpiceObject, {
    objectSize: 1,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (scanCode) {
        this.code = scanCode || 0;
        this.zero = 0;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.arrayToBytes(this.code, 8),
            this.numberTo8(this.zero)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        return this;
    },

    getCode: function () {
        return this.code;
    }
});

wdi.RedCursorInit = $.spcExtend(wdi.SpiceObject, {
    objectSize: 9,


    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.position = new wdi.SpicePoint16().demarshall(queue);
        this.trail_length = this.bytesToInt16NoAllocate(queue);
        this.trail_frequency = this.bytesToInt16NoAllocate(queue);
        this.visible = this.bytesToInt8NoAllocate(queue);
        this.cursor = new wdi.RedCursor().demarshall(queue);
        

        return this;
    }
});

wdi.RedCursor = $.spcExtend(wdi.SpiceObject, {
    objectSize: 2,


    marshall: function () {
		this.rawData = [];
		this.rawData = this.rawData.concat(
			this.numberTo16(this.flags)
		);
		if(!(this.flags & 1)){
			this.rawData = this.rawData.concat(
				this.header.marshall(),
				this.data
			);
		}
		return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.flags = this.bytesToInt16NoAllocate(queue);

        this.header = null;
        this.data = null;

        if (!(this.flags & 1)) {
            this.header = new wdi.RedCursorHeader().demarshall(queue);
            this.data = queue.getData();
        }

        return this;
    }
});

wdi.RedCursorHeader = $.spcExtend(wdi.SpiceObject, {
    objectSize: 17,


    marshall: function () {
		this.rawData = [];
		this.rawData = this.rawData.concat(
			this.numberTo64(this.unique),
			this.numberTo8(this.type),
			this.numberTo16(this.width),
			this.numberTo16(this.height),
			this.numberTo16(this.hot_spot_x),
			this.numberTo16(this.hot_spot_y)
		);
		return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.unique = this.bytesToInt64NoAllocate(queue);
        this.type = this.bytesToInt8NoAllocate(queue);
        this.width = this.bytesToInt16NoAllocate(queue);
        this.height = this.bytesToInt16NoAllocate(queue);
        this.hot_spot_x = this.bytesToInt16NoAllocate(queue);
        this.hot_spot_y = this.bytesToInt16NoAllocate(queue);
        

        return this;
    }
});

wdi.RedCursorSet = $.spcExtend(wdi.SpiceObject, {
    objectSize: 5,

    marshall: function () {
		this.rawData = [];
		this.rawData = this.rawData.concat(
			this.position.marshall(),
			this.numberTo8(this.visible),
			this.cursor.marshall()
		);
		return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.position = new wdi.SpicePoint16().demarshall(queue);
        this.visible = this.bytesToInt8NoAllocate(queue);
        this.cursor = new wdi.RedCursor().demarshall(queue);

        return this;
    }
});

wdi.RedCursorHide = $.spcExtend(wdi.SpiceObject, {
    objectSize: 5,

    marshall: function () {
    },

    demarshall: function () {
        return this;
    }
});

wdi.RasterGlyph = $.spcExtend(wdi.SpiceObject, {
    objectSize: 20,
    
    marshall: function () {
    },

    demarshall: function (queue, flags, numGlyphs) {
        var bpp = flags == 1 ? 1 : flags * 2;
        var result = [];

        for (var i = 0; i < numGlyphs; i++) {
            result[i] = {};
            result[i].render_pos = new wdi.SpicePoint().demarshall(queue);
            result[i].glyph_origin = new wdi.SpicePoint().demarshall(queue);
            result[i].width = this.bytesToInt16NoAllocate(queue);
            result[i].height = this.bytesToInt16NoAllocate(queue);
            result[i].data = queue.shift(result[i].height * Math.ceil(result[i].width * bpp / 8));
        }
        return result;
    }
});

wdi.GlyphString = $.spcExtend(wdi.SpiceObject, {
    objectSize: 3,

    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.len = this.bytesToInt16NoAllocate(queue);
        this.flags = this.bytesToInt8NoAllocate(queue);
        this.raster_glyph = new wdi.RasterGlyph().demarshall(queue, this.flags, this.len);
        

        return this;
    }
});

wdi.SpiceDrawText = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.back_area = new wdi.SpiceRect().demarshall(queue);
        this.fore_brush = new wdi.SpiceBrush().demarshall(queue);
        this.back_brush = new wdi.SpiceBrush().demarshall(queue);
        this.fore_mode = this.bytesToInt16NoAllocate(queue);
        this.back_mode = this.bytesToInt16NoAllocate(queue);
        this.glyph_string = new wdi.GlyphString().demarshall(queue);
        return this;
    }
});

wdi.SpiceLineAttr = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,
    

    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.flags = this.bytesToInt8NoAllocate(queue);
        if (this.flags) {
            this.style_nseg = this.bytesToInt8NoAllocate(queue);
            this.style = this.int32ToDouble(this.bytesToInt32(queue.shift(4)));
        }

        return this;
    }
});

wdi.SpiceStroke = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.offset = this.bytesToInt32NoAllocate(queue);
        this.attr = new wdi.SpiceLineAttr().demarshall(queue);
        this.brush = new wdi.SpiceBrush().demarshall(queue);
        this.fore_mode = this.bytesToInt16NoAllocate(queue);
        this.back_mode = this.bytesToInt16NoAllocate(queue);
        this.path = new wdi.SpicePath().demarshall(queue);
        return this;
    }
});


wdi.SpiceDrawInvers = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.base.marshall(),
            this.mask.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.base = new wdi.SpiceDisplayBase().demarshall(queue);
        this.mask = new wdi.SpiceQMask().demarshall(queue);
        return this;
    }
});

wdi.SpiceStreamCreate = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData.concat(
            this.numberTo32(this.surface_id),
            this.numberTo32(this.id),
            this.numberTo8(this.flags),
            this.numberTo8(this.codec),
            this.numberTo64(this.stamp),
            this.numberTo32(this.stream_width),
            this.numberTo32(this.stream_height),
            this.numberTo32(this.src_width),
            this.numberTo32(this.src_height),
            this.rect.marshall(),
            this.clip.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.surface_id = this.bytesToInt32NoAllocate(queue);
        this.id = this.bytesToInt32NoAllocate(queue);
        this.flags = this.bytesToInt8NoAllocate(queue);
        this.codec = this.bytesToInt8NoAllocate(queue);
        this.stamp = this.bytesToInt64NoAllocate(queue);
        this.stream_width = this.bytesToInt32NoAllocate(queue);
        this.stream_height = this.bytesToInt32NoAllocate(queue);
        this.src_width = this.bytesToInt32NoAllocate(queue);
        this.src_height = this.bytesToInt32NoAllocate(queue);
        this.rect = new wdi.SpiceRect().demarshall(queue);
        this.clip = new wdi.SpiceClip().demarshall(queue);
        return this;
    }
});

wdi.SpiceStreamDestroy = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.numberTo32(this.surface_id),
            this.numberTo32(this.id)
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.surface_id = this.bytesToInt32NoAllocate(queue);
        this.id = this.bytesToInt32NoAllocate(queue);
        return this;
    }
});

wdi.SpiceStreamData = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.numberTo32(this.id),
            this.numberTo32(this.multi_media_type),
            this.numberTo32(this.data_size),
            this.data
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.id = this.bytesToInt32NoAllocate(queue);
        this.multi_media_type = this.bytesToInt32NoAllocate(queue);
        this.data_size = this.bytesToInt32NoAllocate(queue);
        this.data = queue.getRawData();
        return this;
    }
});

wdi.SpiceStreamClip = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        rawData = rawData.concat(
            this.numberTo32(this.id),
            this.clip.marshall()
        );
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.id = this.bytesToInt32NoAllocate(queue);
        this.clip = new wdi.SpiceClip().demarshall(queue);
        return this;
    }
});

wdi.SpiceResourceList = $.spcExtend(wdi.SpiceObject, {
    objectSize: 2,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {

    },

    marshall: function () {
        var rawData = [];
        for (var i = 0; i < this.num_items; i++) {
            rawData = rawData.concat(
                this.numberTo8(this.items[i].type),
                this.numberTo64(this.items[i].id)
            );
        }
        return rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: 'Not enough queue to read', errorCode: 3});
        this.num_items = this.bytesToInt16NoAllocate(queue);
        this.items = [];
        for (var i = 0; i < this.num_items; i++) {
            this.items[i] = {
                type: this.bytesToInt8(queue.shift(1)),
                id: this.bytesToInt64(queue.shift(8))
            };
        }
        return this;
    }
});

wdi.SpiceMsgMainAgentTokens = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.num_tokens = c.num_tokens;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.num_tokens)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.num_tokens = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceMsgMainAgentDisconnected = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.error = c.error;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.error)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.error = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.SpiceMsgMainAgentData = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.agentMessage = c.agentMessage;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.agentMessage.marshall()
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        this.agentMessage = new wdi.VDAgentMessage().demarshall(queue);
        

        return this;
    }
});

wdi.VDIChunkHeader = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.port = c.port;
        this.size = c.size;
        this.packet = c.packet;
    },

    marshall: function () {
        this.rawData = [];
        var data = this.packet.marshall();
        this.rawData = this.rawData.concat(
            this.numberTo32(this.port),
            this.numberTo32(data.length),
            data
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentMessage = $.spcExtend(wdi.SpiceObject, {
    objectSize: 20,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.protocol = c.protocol;
        this.type = c.type;
        this.opaque = c.opaque;
        this.size = c.size;
        this.data = c.data;
    },

    marshall: function () {
        this.rawData = [];
        var data = this.data.marshall();
        this.rawData = this.rawData.concat(
            this.numberTo32(this.protocol),
            this.numberTo32(this.type),
            this.numberTo64(this.opaque),
            this.numberTo32(data.length),
            data
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.protocol = this.bytesToInt32NoAllocate(queue);
        this.type = this.bytesToInt32NoAllocate(queue);
        this.opaque = this.bytesToInt64NoAllocate(queue);
        this.size = this.bytesToInt32NoAllocate(queue);

        if (this.type == wdi.AgentMessageTypes.VD_AGENT_GET_WINDOWS_LIST) {
            var str = this.bytesToString(queue.shift(queue.length));
            if (str == "change") {
                this.window_list = str;
            } else {
                this.window_list = jQuery.parseJSON(str);
            }
        } else if(this.type == wdi.AgentMessageTypes.VD_AGENT_ANNOUNCE_CAPABILITIES) {
            this.caps = new wdi.VDAgentAnnounceCapabilities().demarshall(queue);
        } else if(this.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_GRAB) {
            if(queue.getLength() == 0) {
                this.clipboardType = wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_NONE;
            } else {
                this.clipboardType = this.bytesToInt32NoAllocate(queue);
            }
        } else if(this.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_REQUEST) {
            this.clipboardType = this.bytesToInt32NoAllocate(queue);
        } else if(this.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD) {
            this.clipboardType = this.bytesToInt32NoAllocate(queue);
            this.clipboardData = this.bytesToString(queue.shift(queue.length));
        }

        

        return this;
    }
});

wdi.VDAgentHwndWindow = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.hwnd = c.hwnd;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.hwnd)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentMoveWindow = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.hwnd = c.hwnd;
        this.x = c.x;
        this.y = c.y;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.hwnd),
            this.numberTo32(this.x),
            this.numberTo32(this.y)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentResizeWindow = $.spcExtend(wdi.SpiceObject, {
    objectSize: 12,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.hwnd = c.hwnd;
        this.width = c.width;
        this.height = c.height;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.hwnd),
            this.numberTo32(this.width),
            this.numberTo32(this.height)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentMonitorsConfig = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.num_of_monitors = c.num_of_monitors;
        this.flags = c.flags;
        this.data = c.data;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.num_of_monitors),
            this.numberTo32(this.flags),
            this.data.marshall()
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentMonConfig = $.spcExtend(wdi.SpiceObject, {
    objectSize: 20,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.height = c.height;
        this.width = c.width;
        this.depth = c.depth;
        this.x = c.x;
        this.y = c.y;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.height),
            this.numberTo32(this.width),
            this.numberTo32(this.depth),
            this.numberTo32(this.x),
            this.numberTo32(this.y)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentAnnounceCapabilities = $.spcExtend(wdi.SpiceObject, {
    objectSize: 8,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.request = c.request;
        this.caps = c.caps;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.request),
            this.numberTo32(this.caps)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.request = this.bytesToInt32NoAllocate(queue);
        this.caps = this.bytesToInt32NoAllocate(queue);

        

        return this;
    }
});

wdi.VDAgentExecuteCommand = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.size = c.size;
        this.data = c.data;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.size),
            this.stringToBytes(this.data)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        

        return this;
    }
});

wdi.VDAgentClipboardRequest = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.type = c.type;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.type)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.type = this.bytesToInt32NoAllocate(queue);

        return this;
    }
});

wdi.VDAgentClipboardGrab = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.types = c.types;
    },

    marshall: function () {
        this.rawData = [];
        this.rawData = this.rawData.concat(
            this.numberTo32(this.types)
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.types = this.bytesToInt32NoAllocate(queue);

        

        return this;
    }
});

wdi.VDAgentClipboard = $.spcExtend(wdi.SpiceObject, {
    objectSize: 6,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.type = c.type;
        this.data = c.data;
    },

    marshall: function () {
        this.rawData = [];
        var data;
        if(this.type === wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_UTF8_TEXT){
            data = this.stringToBytes(this.data);
        } else {
            data = this.arrayBufferToBytes(this.data);
        }
        this.rawData = this.rawData.concat(
            this.numberTo32(this.type),
            data
        );
        return this.rawData;
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.type = this.bytesToInt32NoAllocate(queue);
        this.data = queue.getData();

        

        return this;
    }
});

wdi.PlaybackMode = $.spcExtend(wdi.SpiceObject, {
    objectSize: 6,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.multimedia_time = c.multimedia_time;
        this.audio_data_mode = c.audio_data_mode;
        this.data = c.data;
    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.multimedia_time = this.bytesToInt32NoAllocate(queue);
        this.audio_data_mode = this.bytesToInt16NoAllocate(queue);
        this.data = queue.getData();
        

        return this;
    }
});

wdi.PlaybackStart = $.spcExtend(wdi.SpiceObject, {
    objectSize: 14,
    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.channels = c.channels;
        this.format = c.format;
        this.frequency = c.frequency;
        this.time = c.time;
    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.channels = this.bytesToInt32NoAllocate(queue);
        this.format = this.bytesToInt16NoAllocate(queue);
        this.frequency = this.bytesToInt32NoAllocate(queue);
        this.time = this.bytesToInt32NoAllocate(queue);
        

        return this;
    }
});

wdi.PlaybackData = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.multimedia_time = c.multimedia_time;
        this.data = c.data;
    },



    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.multimedia_time = this.bytesToInt32NoAllocate(queue);
        this.data = queue.getData();
        

        return this;
    }
});

wdi.MainMultiMediaTime = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.multimedia_time = c.multimedia_time;
    },

    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.multimedia_time = this.bytesToInt32NoAllocate(queue);
        
        return this;
    }
});

wdi.PlaybackStop = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,




    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        return this;
    }
});

wdi.MainMChannelsList = $.spcExtend(wdi.SpiceObject, {
    objectSize: 4,

    init: function (c) {
        c ? this.setContent(c) : false;
    },

    setContent: function (c) {
        this.num_of_channels = c.num_of_channels;
    },

    marshall: function () {
    },

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});

        this.num_of_channels = this.bytesToInt32NoAllocate(queue);
        this.channels = [];
        var type = null;
        var id = null;
        for(var i = 0;i<this.num_of_channels;i++) {
            type = this.bytesToInt8NoAllocate(queue);
            id = this.bytesToInt8NoAllocate(queue);
            this.channels.push(type);
        }

        
        return this;
    }
});

wdi.SpiceDisplayInvalidAllPalettes = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        
        return this;
    }
});

wdi.SpiceDisplayMark = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        
        return this;
    }
});

wdi.SpiceDisplayReset = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "errq", errorCode: 3});
        
        return this;
    }
});


/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


wdi.SpicePubkeyType = {
	SPICE_PUBKEY_TYPE_INVALID:0,
	SPICE_PUBKEY_TYPE_RSA:1,
	SPICE_PUBKEY_TYPE_RSA2:2,
	SPICE_PUBKEY_TYPE_DSA:3,
	SPICE_PUBKEY_TYPE_DSA1:4,
	SPICE_PUBKEY_TYPE_DSA2:5,
	SPICE_PUBKEY_TYPE_DSA3:6,
	SPICE_PUBKEY_TYPE_DSA4:7,
	SPICE_PUBKEY_TYPE_DH:8,
	SPICE_PUBKEY_TYPE_EC:9,
	SPICE_PUBKEY_TYPE_ENUM_END:10
}

wdi.SpiceWarnCode = {
	SPICE_WARN_GENERAL:0,
	SPICE_WARN_CODE_ENUM_END:1
}

wdi.SpiceLineFlags = {
	SPICE_LINE_FLAGS_START_WITH_GAP:4,
	SPICE_LINE_FLAGS_STYLED:8,
	SPICE_LINE_FLAGS_MASK:12
}

wdi.SpiceNotifyVisibility = {
	SPICE_NOTIFY_VISIBILITY_LOW:0,
	SPICE_NOTIFY_VISIBILITY_MEDIUM:1,
	SPICE_NOTIFY_VISIBILITY_HIGH:2,
	SPICE_NOTIFY_VISIBILITY_ENUM_END:3
}

wdi.SpiceVars = {
	SPICE_MSGC_ACK_SYNC:1,
	SPICE_MSGC_ACK:2,
	SPICE_MSGC_PONG:3,
	SPICE_MSGC_MIGRATE_FLUSH_MARK:4,
	SPICE_MSGC_MIGRATE_DATA:5,
	SPICE_MSGC_DISCONNECTING:6,
	SPICE_MSGC_DISPLAY_INIT:101,
	SPICE_MSGC_END_DISPLAY:102,
	SPICE_CHANNEL_MAIN:1,
	SPICE_CHANNEL_DISPLAY:2,
	SPICE_CHANNEL_INPUTS:3,
	SPICE_CHANNEL_CURSOR:4,
	SPICE_CHANNEL_PLAYBACK:5,
	SPICE_CHANNEL_RECORD:6,
	SPICE_CHANNEL_TUNNEL:7,
	SPICE_CHANNEL_SMARTCARD:8,
	SPICE_CHANNEL_USBREDIR:9,
	SPICE_END_CHANNEL:10,
	SPICE_MSG_MIGRATE:1,
	SPICE_MSG_MIGRATE_DATA:2,
	SPICE_MSG_SET_ACK:3,
	SPICE_MSG_PING:4,
	SPICE_MSG_WAIT_FOR_CHANNELS:5,
	SPICE_MSG_DISCONNECTING:6,
	SPICE_MSG_NOTIFY:7,
	SPICE_MSG_LIST:8,
	SPICE_MSGC_MAIN_CLIENT_INFO:101,
	SPICE_MSGC_MAIN_MIGRATE_CONNECTED:102,
	SPICE_MSGC_MAIN_MIGRATE_CONNECT_ERROR:103,
	SPICE_MSGC_MAIN_ATTACH_CHANNELS:104,
	SPICE_MSGC_MAIN_MOUSE_MODE_REQUEST:105,
	SPICE_MSGC_MAIN_AGENT_START:106,
	SPICE_MSGC_MAIN_AGENT_DATA:107,
	SPICE_MSGC_MAIN_AGENT_TOKEN:108,
	SPICE_MSGC_MAIN_MIGRATE_END:109,
	SPICE_MSGC_END_MAIN:110,
	SPICE_MSG_DISPLAY_MODE:101,
	SPICE_MSG_DISPLAY_MARK:102,
	SPICE_MSG_DISPLAY_RESET:103,
	SPICE_MSG_DISPLAY_COPY_BITS:104,
	SPICE_MSG_DISPLAY_INVAL_LIST:105,
	SPICE_MSG_DISPLAY_INVAL_ALL_PIXMAPS:106,
	SPICE_MSG_DISPLAY_INVAL_PALETTE:107,
	SPICE_MSG_DISPLAY_INVAL_ALL_PALETTES:108,
	SPICE_MSG_DISPLAY_STREAM_CREATE:122,
	SPICE_MSG_DISPLAY_STREAM_DATA:123,
	SPICE_MSG_DISPLAY_STREAM_CLIP:124,
	SPICE_MSG_DISPLAY_STREAM_DESTROY:125,
	SPICE_MSG_DISPLAY_STREAM_DESTROY_ALL:126,
	SPICE_MSG_DISPLAY_DRAW_FILL:302,
	SPICE_MSG_DISPLAY_DRAW_OPAQUE:303,
	SPICE_MSG_DISPLAY_DRAW_COPY:304,
	SPICE_MSG_DISPLAY_DRAW_BLEND:305,
	SPICE_MSG_DISPLAY_DRAW_BLACKNESS:306,
	SPICE_MSG_DISPLAY_DRAW_WHITENESS:307,
	SPICE_MSG_DISPLAY_DRAW_INVERS:308,
	SPICE_MSG_DISPLAY_DRAW_ROP3:309,
	SPICE_MSG_DISPLAY_DRAW_STROKE:310,
	SPICE_MSG_DISPLAY_DRAW_TEXT:311,
	SPICE_MSG_DISPLAY_DRAW_TRANSPARENT:312,
	SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND:313,
	SPICE_MSG_DISPLAY_SURFACE_CREATE:314,
	SPICE_MSG_DISPLAY_SURFACE_DESTROY:315,
	SPICE_MSG_END_DISPLAY:316,
	SPICE_MSG_INPUTS_INIT:101,
	SPICE_MSG_INPUTS_KEY_MODIFIERS:102,
	SPICE_MSG_INPUTS_MOUSE_MOTION_ACK:111,
	SPICE_MSG_END_INPUTS:112,
	SPICE_MSGC_INPUTS_KEY_DOWN:101,
	SPICE_MSGC_INPUTS_KEY_UP:102,
	SPICE_MSGC_INPUTS_KEY_MODIFIERS:103,
	SPICE_MSGC_INPUTS_MOUSE_MOTION:111,
	SPICE_MSGC_INPUTS_MOUSE_POSITION:112,
	SPICE_MSGC_INPUTS_MOUSE_PRESS:113,
	SPICE_MSGC_INPUTS_MOUSE_RELEASE:114,
	SPICE_MSGC_END_INPUTS:115,
	SPICE_MSG_CURSOR_INIT:101,
	SPICE_MSG_CURSOR_RESET:102,
	SPICE_MSG_CURSOR_SET:103,
	SPICE_MSG_CURSOR_MOVE:104,
	SPICE_MSG_CURSOR_HIDE:105,
	SPICE_MSG_CURSOR_TRAIL:106,
	SPICE_MSG_CURSOR_INVAL_ONE:107,
	SPICE_MSG_CURSOR_INVAL_ALL:108,
	SPICE_MSG_END_CURSOR:109,
	SPICE_MSG_RECORD_START:101,
	SPICE_MSG_RECORD_STOP:102,
	SPICE_MSG_RECORD_VOLUME:103,
	SPICE_MSG_RECORD_MUTE:104,
	SPICE_MSG_END_RECORD:105,
	SPICE_MSGC_SMARTCARD_DATA:101,
	SPICE_MSGC_END_SMARTCARD:102,
	SPICE_MSGC_SPICEVMC_DATA:101,
	SPICE_MSGC_END_SPICEVMC:102,
	SPICE_MSG_MAIN_MIGRATE_BEGIN:101,
	SPICE_MSG_MAIN_MIGRATE_CANCEL:102,
	SPICE_MSG_MAIN_INIT:103,
	SPICE_MSG_MAIN_CHANNELS_LIST:104,
	SPICE_MSG_MAIN_MOUSE_MODE:105,
	SPICE_MSG_MAIN_MULTI_MEDIA_TIME:106,
	SPICE_MSG_MAIN_AGENT_CONNECTED:107,
	SPICE_MSG_MAIN_AGENT_DISCONNECTED:108,
	SPICE_MSG_MAIN_AGENT_DATA:109,
	SPICE_MSG_MAIN_AGENT_TOKEN:110,
	SPICE_MSG_MAIN_MIGRATE_SWITCH_HOST:111,
	SPICE_MSG_MAIN_MIGRATE_END:112,
	SPICE_MSG_END_MAIN:113,
	SPICE_MSG_PLAYBACK_DATA:101,
	SPICE_MSG_PLAYBACK_MODE:102,
	SPICE_MSG_PLAYBACK_START:103,
	SPICE_MSG_PLAYBACK_STOP:104,
	SPICE_MSG_PLAYBACK_VOLUME:105,
	SPICE_MSG_PLAYBACK_MUTE:106,
	SPICE_MSG_END_PLAYBACK:107,
	SPICE_MSGC_RECORD_DATA:101,
	SPICE_MSGC_RECORD_MODE:102,
	SPICE_MSGC_RECORD_START_MARK:103,
	SPICE_MSGC_END_RECORD:104,
	SPICE_MSG_TUNNEL_INIT:101,
	SPICE_MSG_TUNNEL_SERVICE_IP_MAP:102,
	SPICE_MSG_TUNNEL_SOCKET_OPEN:103,
	SPICE_MSG_TUNNEL_SOCKET_FIN:104,
	SPICE_MSG_TUNNEL_SOCKET_CLOSE:105,
	SPICE_MSG_TUNNEL_SOCKET_DATA:106,
	SPICE_MSG_TUNNEL_SOCKET_CLOSED_ACK:107,
	SPICE_MSG_TUNNEL_SOCKET_TOKEN:108,
	SPICE_MSG_END_TUNNEL:109,
	SPICE_MSGC_TUNNEL_SERVICE_ADD:101,
	SPICE_MSGC_TUNNEL_SERVICE_REMOVE:102,
	SPICE_MSGC_TUNNEL_SOCKET_OPEN_ACK:103,
	SPICE_MSGC_TUNNEL_SOCKET_OPEN_NACK:104,
	SPICE_MSGC_TUNNEL_SOCKET_FIN:105,
	SPICE_MSGC_TUNNEL_SOCKET_CLOSED:106,
	SPICE_MSGC_TUNNEL_SOCKET_CLOSED_ACK:107,
	SPICE_MSGC_TUNNEL_SOCKET_DATA:108,
	SPICE_MSGC_TUNNEL_SOCKET_TOKEN:109,
	SPICE_MSGC_END_TUNNEL:110,
	SPICE_MSG_SMARTCARD_DATA:101,
	SPICE_MSG_END_SMARTCARD:102,
	SPICE_MSG_SPICEVMC_DATA:101,
	SPICE_MSG_END_SPICEVMC:102,
	SPICE_COMMON_CAP_PROTOCOL_AUTH_SELECTION:0,
	SPICE_COMMON_CAP_AUTH_SPICE:1,
	SPICE_COMMON_CAP_AUTH_SASL:2,
	SPICE_COMMON_CAP_MINI_HEADER:3,
	SPICE_PLAYBACK_CAP_CELT_0_5_1:0,
	SPICE_PLAYBACK_CAP_VOLUME:1,
	SPICE_RECORD_CAP_CELT_0_5_1:0,
	SPICE_RECORD_CAP_VOLUME:1,
	SPICE_MAIN_CAP_SEMI_SEAMLESS_MIGRATE:0
}

wdi.SpiceTunnelServiceType = {
	SPICE_TUNNEL_SERVICE_TYPE_INVALID:0,
	SPICE_TUNNEL_SERVICE_TYPE_GENERIC:1,
	SPICE_TUNNEL_SERVICE_TYPE_IPP:2,
	SPICE_TUNNEL_SERVICE_TYPE_ENUM_END:3
}

wdi.SpiceJpegAlphaFlags = {
	SPICE_JPEG_ALPHA_FLAGS_TOP_DOWN:1,
	SPICE_JPEG_ALPHA_FLAGS_MASK:1
}

wdi.SpiceMaskFlags = {
	SPICE_MASK_FLAGS_INVERS:1,
	SPICE_MASK_FLAGS_MASK:1
}

wdi.SpiceCursorType = {
	SPICE_CURSOR_TYPE_ALPHA:0,
	SPICE_CURSOR_TYPE_MONO:1,
	SPICE_CURSOR_TYPE_COLOR4:2,
	SPICE_CURSOR_TYPE_COLOR8:3,
	SPICE_CURSOR_TYPE_COLOR16:4,
	SPICE_CURSOR_TYPE_COLOR24:5,
	SPICE_CURSOR_TYPE_COLOR32:6,
	SPICE_CURSOR_TYPE_ENUM_END:7,
	SPICE_CURSOR_TYPE_URL:8
}

wdi.SpiceImageFlags = {
	SPICE_IMAGE_FLAGS_CACHE_ME:1,
	SPICE_IMAGE_FLAGS_HIGH_BITS_SET:2,
	SPICE_IMAGE_FLAGS_CACHE_REPLACE_ME:4,
	SPICE_IMAGE_FLAGS_MASK:7
}

wdi.SpiceAudioDataMode = {
	SPICE_AUDIO_DATA_MODE_INVALID:0,
	SPICE_AUDIO_DATA_MODE_RAW:1,
	SPICE_AUDIO_DATA_MODE_CELT_0_5_1:2,
	SPICE_AUDIO_DATA_MODE_ENUM_END:3
}

wdi.SpiceAudioFmt = {
	SPICE_AUDIO_FMT_INVALID:0,
	SPICE_AUDIO_FMT_S16:1,
	SPICE_AUDIO_FMT_ENUM_END:2
}

wdi.SpiceBitmapFmt = {
	SPICE_BITMAP_FMT_INVALID:0,
	SPICE_BITMAP_FMT_1BIT_LE:1,
	SPICE_BITMAP_FMT_1BIT_BE:2,
	SPICE_BITMAP_FMT_4BIT_LE:3,
	SPICE_BITMAP_FMT_4BIT_BE:4,
	SPICE_BITMAP_FMT_8BIT:5,
	SPICE_BITMAP_FMT_16BIT:6,
	SPICE_BITMAP_FMT_24BIT:7,
	SPICE_BITMAP_FMT_32BIT:8,
	SPICE_BITMAP_FMT_RGBA:9,
	SPICE_BITMAP_FMT_ENUM_END:10
}

wdi.SpiceStreamFlags = {
	SPICE_STREAM_FLAGS_TOP_DOWN:1,
	SPICE_STREAM_FLAGS_MASK:1
}

wdi.SpiceTunnelIpType = {
	SPICE_TUNNEL_IP_TYPE_INVALID:0,
	SPICE_TUNNEL_IP_TYPE_IPv4:1,
	SPICE_TUNNEL_IP_TYPE_ENUM_END:2
}

wdi.SpiceBitmapFlags = {
	SPICE_BITMAP_FLAGS_PAL_CACHE_ME:1,
	SPICE_BITMAP_FLAGS_PAL_FROM_CACHE:2,
	SPICE_BITMAP_FLAGS_TOP_DOWN:4,
	SPICE_BITMAP_FLAGS_MASK:7
}

wdi.SpiceStringFlags = {
	SPICE_STRING_FLAGS_RASTER_A1:1,
	SPICE_STRING_FLAGS_RASTER_A4:2,
	SPICE_STRING_FLAGS_RASTER_A8:4,
	SPICE_STRING_FLAGS_RASTER_TOP_DOWN:8,
	SPICE_STRING_FLAGS_MASK:15
}

wdi.SpiceSurfaceFmt = {
	SPICE_SURFACE_FMT_INVALID:0,
	SPICE_SURFACE_FMT_1_A:1,
	SPICE_SURFACE_FMT_8_A:8,
	SPICE_SURFACE_FMT_16_555:16,
	SPICE_SURFACE_FMT_32_xRGB:32,
	SPICE_SURFACE_FMT_16_565:80,
	SPICE_SURFACE_FMT_32_ARGB:96,
	SPICE_SURFACE_FMT_ENUM_END:97
}

wdi.SpiceCursorFlags = {
	SPICE_CURSOR_FLAGS_NONE:1,
	SPICE_CURSOR_FLAGS_CACHE_ME:2,
	SPICE_CURSOR_FLAGS_FROM_CACHE:4,
	SPICE_CURSOR_FLAGS_MASK:7
}

wdi.SpiceLinkErr = {
	SPICE_LINK_ERR_OK:0,
	SPICE_LINK_ERR_ERROR:1,
	SPICE_LINK_ERR_INVALID_MAGIC:2,
	SPICE_LINK_ERR_INVALID_DATA:3,
	SPICE_LINK_ERR_VERSION_MISMATCH:4,
	SPICE_LINK_ERR_NEED_SECURED:5,
	SPICE_LINK_ERR_NEED_UNSECURED:6,
	SPICE_LINK_ERR_PERMISSION_DENIED:7,
	SPICE_LINK_ERR_BAD_CONNECTION_ID:8,
	SPICE_LINK_ERR_CHANNEL_NOT_AVAILABLE:9,
	SPICE_LINK_ERR_ENUM_END:10
}

wdi.SpiceNotifySeverity = {
	SPICE_NOTIFY_SEVERITY_INFO:0,
	SPICE_NOTIFY_SEVERITY_WARN:1,
	SPICE_NOTIFY_SEVERITY_ERROR:2,
	SPICE_NOTIFY_SEVERITY_ENUM_END:3
}

wdi.SpiceBrushType = {
	SPICE_BRUSH_TYPE_NONE:0,
	SPICE_BRUSH_TYPE_SOLID:1,
	SPICE_BRUSH_TYPE_PATTERN:2,
	SPICE_BRUSH_TYPE_ENUM_END:3
}

wdi.SpiceAlphaFlags = {
	SPICE_ALPHA_FLAGS_DEST_HAS_ALPHA:1,
	SPICE_ALPHA_FLAGS_SRC_SURFACE_HAS_ALPHA:2,
	SPICE_ALPHA_FLAGS_MASK:3
}

wdi.SpiceSurfaceFlags = {
	SPICE_SURFACE_FLAGS_PRIMARY:1,
	SPICE_SURFACE_FLAGS_MASK:1
}

wdi.QuicImageType = {
    QUIC_IMAGE_TYPE_INVALID: 0,
    QUIC_IMAGE_TYPE_GRAY: 1,
    QUIC_IMAGE_TYPE_RGB16: 2,
    QUIC_IMAGE_TYPE_RGB24: 3,
    QUIC_IMAGE_TYPE_RGB32: 4,
    QUIC_IMAGE_TYPE_RGBA: 5
}

wdi.SpiceImageType = {
	SPICE_IMAGE_TYPE_BITMAP:0,
	SPICE_IMAGE_TYPE_QUIC:1,
	SPICE_IMAGE_TYPE_RESERVED:2,
	SPICE_IMAGE_TYPE_LZ_PLT:100,
	SPICE_IMAGE_TYPE_LZ_RGB:101,
	SPICE_IMAGE_TYPE_GLZ_RGB:102,
	SPICE_IMAGE_TYPE_FROM_CACHE:103,
	SPICE_IMAGE_TYPE_SURFACE:104,
	SPICE_IMAGE_TYPE_JPEG:105,
	SPICE_IMAGE_TYPE_FROM_CACHE_LOSSLESS:106,
	SPICE_IMAGE_TYPE_ZLIB_GLZ_RGB:107,
	SPICE_IMAGE_TYPE_JPEG_ALPHA:108,
	SPICE_IMAGE_TYPE_CANVAS:109,
	SPICE_IMAGE_TYPE_PNG:110,
	SPICE_IMAGE_TYPE_ENUM_END:111
}

wdi.SpiceImageScaleMode = {
	SPICE_IMAGE_SCALE_MODE_INTERPOLATE:0,
	SPICE_IMAGE_SCALE_MODE_NEAREST:1,
	SPICE_IMAGE_SCALE_MODE_ENUM_END:2
}

wdi.SpiceResourceType = {
	SPICE_RES_TYPE_INVALID:0,
	SPICE_RES_TYPE_PIXMAP:1,
	SPICE_RESOURCE_TYPE_ENUM_END:2
}

wdi.SpicePathFlags = {
	SPICE_PATH_BEGIN:1,
	SPICE_PATH_END:2,
	SPICE_PATH_CLOSE:8,
	SPICE_PATH_BEZIER:16,
	SPICE_PATH_FLAGS_MASK:27
}

wdi.SpiceVideoCodecType = {
	SPICE_VIDEO_CODEC_TYPE_MJPEG:1,
	SPICE_VIDEO_CODEC_TYPE_ENUM_END:2
}

wdi.SpiceRopd = {
	SPICE_ROPD_INVERS_SRC:1,
	SPICE_ROPD_INVERS_BRUSH:2,
	SPICE_ROPD_INVERS_DEST:4,
	SPICE_ROPD_OP_PUT:8,
	SPICE_ROPD_OP_OR:16,
	SPICE_ROPD_OP_AND:32,
	SPICE_ROPD_OP_XOR:64,
	SPICE_ROPD_OP_BLACKNESS:128,
	SPICE_ROPD_OP_WHITENESS:256,
	SPICE_ROPD_OP_INVERS:512,
	SPICE_ROPD_INVERS_RES:1024,
	SPICE_ROPD_MASK:2047
}

wdi.SpiceMigrateFlags = {
	SPICE_MIGRATE_NEED_FLUSH:1,
	SPICE_MIGRATE_NEED_DATA_TRANSFER:2,
	SPICE_MIGRATE_FLAGS_MASK:3
}

wdi.SpiceKeyboardModifierFlags = {
	SPICE_KEYBOARD_MODIFIER_FLAGS_SCROLL_LOCK:1,
	SPICE_KEYBOARD_MODIFIER_FLAGS_NUM_LOCK:2,
	SPICE_KEYBOARD_MODIFIER_FLAGS_CAPS_LOCK:4,
	SPICE_KEYBOARD_MODIFIER_FLAGS_MASK:7
}

wdi.SpiceInfoCode = {
	SPICE_INFO_GENERAL:0,
	SPICE_INFO_CODE_ENUM_END:1
}

wdi.SpiceMouseButton = {
	SPICE_MOUSE_BUTTON_INVALID:0,
	SPICE_MOUSE_BUTTON_LEFT:1,
	SPICE_MOUSE_BUTTON_MIDDLE:2,
	SPICE_MOUSE_BUTTON_RIGHT:3,
	SPICE_MOUSE_BUTTON_UP:4,
	SPICE_MOUSE_BUTTON_DOWN:5,
	SPICE_MOUSE_BUTTON_ENUM_END:6
}

wdi.SpiceClipType = {
	SPICE_CLIP_TYPE_NONE:0,
	SPICE_CLIP_TYPE_RECTS:1,
	SPICE_CLIP_TYPE_ENUM_END:2
}

wdi.SpiceMouseButtonMask = {
	SPICE_MOUSE_BUTTON_MASK_LEFT:1,
	SPICE_MOUSE_BUTTON_MASK_MIDDLE:2,
	SPICE_MOUSE_BUTTON_MASK_RIGHT:4,
	SPICE_MOUSE_BUTTON_MASK_MASK:7
}

wdi.SpiceMouseModeTypes = {
	SPICE_MOUSE_MODE_SERVER:1,
	SPICE_MOUSE_MODE_CLIENT:2,
	SPICE_MOUSE_MODE_MASK:3
}

wdi.AgentCaps = {
	VD_AGENT_CAP_MOUSE_STATE: 0,
	VD_AGENT_CAP_MONITORS_CONFIG: 1,
	VD_AGENT_CAP_REPLY: 2,
	VD_AGENT_CAP_CLIPBOARD: 3,
	VD_AGENT_CAP_DISPLAY_CONFIG: 4,
    VD_AGENT_CAP_CLIPBOARD_BY_DEMAND: 5,
    VD_AGENT_CAP_CLIPBOARD_SELECTION : 6
};

wdi.AgentMessageTypes =  {
    VD_AGENT_MOUSE_STATE:1,
    VD_AGENT_MONITORS_CONFIG: 2,
    VD_AGENT_REPLY: 3,
    VD_AGENT_CLIPBOARD: 4,
    VD_AGENT_DISPLAY_CONFIG: 5,
    VD_AGENT_ANNOUNCE_CAPABILITIES: 6,
    VD_AGENT_CLIPBOARD_GRAB: 7,
    VD_AGENT_CLIPBOARD_REQUEST: 8,
    VD_AGENT_CLIPBOARD_RELEASE: 9,

    VD_AGENT_GET_WINDOWS_LIST: 10,
   	VD_AGENT_CLOSE_WINDOW: 11,
   	VD_AGENT_MOVE_WINDOW: 12,
   	VD_AGENT_RESIZE_WINDOW: 13,
   	VD_AGENT_MINIMIZE_WINDOW: 14,
   	VD_AGENT_RESTORE_WINDOW: 15,
   	VD_AGENT_MAXIMIZE_WINDOW: 16,
   	VD_AGENT_FOCUS_WINDOW: 17,
   	VD_AGENT_EXECUTE_COMMAND: 18
};

wdi.ClipBoardTypes = {
    VD_AGENT_CLIPBOARD_NONE: 0,
    VD_AGENT_CLIPBOARD_UTF8_TEXT: 1,
    VD_AGENT_CLIPBOARD_IMAGE_PNG: 2,  /* All clients with image support should support this one */
    VD_AGENT_CLIPBOARD_IMAGE_BMP: 3,  /* optional */
    VD_AGENT_CLIPBOARD_IMAGE_TIFF: 4, /* optional */
    VD_AGENT_CLIPBOARD_IMAGE_JPG: 5  /* optional */
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.GraphicDebug = $.spcExtend(wdi.DomainObject, {
	debugMode: null,
	spiceGraphicMessageTypes: [],
	cloneSpiceMessage: null,
	clientGui: null,
	tmpCanvas: null,
	tmpContext: null,
	originalCanvas: null,
	spiceMessageData: null,
	endCanvas: null,
	currentOperation: null,

	init: function(c) {
		this.debugMode = c.debugMode;
		if (this.debugMode) {
			this._generateArray();
			this._showDebug();
		} else {
			this._hideDebug();
		}
	},

	_generateArray: function() {
		var self = this;
		$.each(wdi.SpiceVars, function(key, value) {
			if (key.search("SPICE_MSG_DISPLAY_") != -1) {
				self.spiceGraphicMessageTypes[value] = key;
			}
		});
	},

	_showDebug: function() {
		$('#canvasSpace').show();
		$('#graphicDebug').show();
	},

	_hideDebug: function() {
		$('#canvasSpace').hide();
		$('#graphicDebug').hide();
	},

    printDebugMessageOnFilter: function(spiceMessage, clientGui) {
        if(spiceMessage.channel === wdi.SpiceVars.SPICE_CHANNEL_DISPLAY && this.debugMode && ($('#logActive').prop('checked'))) {
            var surface_id = null;
			this.clientGui = clientGui;
			this.cloneSpiceMessage = $.extend(true, {}, spiceMessage);
			if(this.cloneSpiceMessage.args.base && this.cloneSpiceMessage.args.base.surface_id !== null) {
				surface_id = this.cloneSpiceMessage.args.base.surface_id;
				var box = wdi.graphics.getBoxFromSrcArea(this.cloneSpiceMessage.args.base.box);
				var spiceMessageDiv = $('<div/>')
					.append(prettyPrint(this.cloneSpiceMessage))
					.hide();

				this.originalCanvas =  this._copyCanvasFromSurfaceId(surface_id);
				this.spiceMessageData = spiceMessage.args.originalData;
				this.currentOperation = this.spiceGraphicMessageTypes[this.cloneSpiceMessage.messageType];

				$('#debugInfo')
					.append($('<br/>'))
					.append($('<hr/>'))
					.append(this._copyAndHighlightCanvas(surface_id, box))
					.append($('<br/>'))
					.append($('<div/>')
						.append(this.currentOperation + ' (Click to hide/show)')
						.css('cursor', 'pointer')
						.css('color', 'blue')
						.css('text-decoration', 'underline')
						.click(function() {
							spiceMessageDiv.toggle();
						})
					).append(spiceMessageDiv);

				if (this.cloneSpiceMessage.args.hasOwnProperty('image')) {
					this._printImage(spiceMessageDiv);
				}
			}
		}
	},

	_printImage: function(spiceMessageDiv) {
		wdi.graphics.getImageFromSpice(this.cloneSpiceMessage.args.image.imageDescriptor, this.cloneSpiceMessage.args.image.data, this.clientGui, function(srcImg) {
			if(srcImg) {
				spiceMessageDiv.append(
					$('<div/>').css('font-size', '12px')
						.append('Image inside spiceMessage:')
						.append($('<br/>'))
						.css('border', '1px solid black')
						.append(srcImg)
				);
			}
		}, this);
	},

	printDebugMessageOnNotifyEnd: function(spiceMessage, clientGui) {
		this.clientGui = clientGui;
		if(spiceMessage.channel === wdi.SpiceVars.SPICE_CHANNEL_DISPLAY && this.debugMode && ($('#logActive').prop('checked'))) {
			var surface_id = null;
			if(spiceMessage.args.base && spiceMessage.args.base.surface_id !== null) {
				var self = this;
				var createTestClickCallback = function (currentSpiceMessage, originalCanvas, endCanvas, currentOperation) {
					return function () {
						self.createImageTest(currentSpiceMessage, originalCanvas, endCanvas, currentOperation);
					};
				};
				var createReplayClickCallback = function (currentSpiceMessage, originalCanvas, endCanvas, currentOperation) {
					return function () {
						self.createReplay(currentSpiceMessage, originalCanvas, endCanvas, currentOperation);
					};
				};
				surface_id = spiceMessage.args.base.surface_id;
				var box = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.base.box);
				var currentCanvas = this._copyCanvasFromSurfaceId(surface_id);
				$('#debugInfo')
					.append($('<br/>'))
					.append($('<div/>')
						.append($('<button>Create test</button>')
							.css('cursor', 'pointer')
							.click(createTestClickCallback(this.spiceMessageData, this.originalCanvas, currentCanvas, this.currentOperation))
						)
						.append($('<button>Create replay window</button>')
							.css('cursor', 'pointer')
							.click(createReplayClickCallback(this.spiceMessageData, this.originalCanvas, currentCanvas, this.currentOperation))
						)
					).append($('<br/>'))
					.append(this._copyAndHighlightCanvas(surface_id, box));
			}
		}
	},

	createImageTest: function (spiceMessage, originalCanvas, endCanvas, currentOperation) {
		var name = prompt('Name of the test', currentOperation);
		var data1 = originalCanvas.toDataURL('image/png');
		var data2 = endCanvas.toDataURL('image/png');
		var dataObj = {
			origin: data1,
			expected: data2,
			object: spiceMessage,
			name: name
		};
		var data = JSON.stringify(dataObj);
		var fileName = name.replace(/\s/g, '_');

		$.post('graphictestgenerator.php','data=' + data + '&name=' + fileName).done(function (data,status,xhr) {
			alert('Test created');
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert('Test creation failed.\n\nGot response: ' + jqXHR.status + ' '
				+ jqXHR.statusText + '\n\n' + jqXHR.responseText);
		});

	},

	createReplay: function (spiceMessage, originalCanvas) {
		var data1 = originalCanvas.toDataURL('image/png');
		var dataObj = {
			origin: data1,
			object: spiceMessage,
			width: originalCanvas.width,
			height: originalCanvas.height
		};
		var data = JSON.stringify(dataObj);

		$.post('graphictestgenerator.php','data=' + data + '&replay=true').done(function (data,status,xhr) {
			window.open('replay.html', 'replay');
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert('Replay failed.\n\nGot response: ' + jqXHR.status + ' '
				+ jqXHR.statusText + '\n\n' + jqXHR.responseText);
		});
	},

	_copyCanvasFromSurfaceId: function (surface_id) {
		var context = this.clientGui.getContext(surface_id);
		this.tmpCanvas = context.canvas;
		var myCanvas = document.createElement('canvas');
		myCanvas.width = this.tmpCanvas.width;
		myCanvas.height = this.tmpCanvas.height;
		myCanvas.getContext('2d').drawImage(this.tmpCanvas, 0, 0);

		return myCanvas;
	},

	_copyAndHighlightCanvas: function(surface_id, box) {
		var myCanvas = this._copyCanvasFromSurfaceId(surface_id);

		context = myCanvas.getContext('2d');

		context.fillStyle = "rgba(255,0,0,0.3)";
		context.fillRect(box.x, box.y, box.width, box.height);
		return myCanvas;
	}


});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.LZSS = {
	LZ_IMAGE_TYPE_INVALID: 0,
	LZ_IMAGE_TYPE_PLT1_LE: 1,
	LZ_IMAGE_TYPE_PLT1_BE: 2,
	LZ_IMAGE_TYPE_PLT4_LE: 3,
	LZ_IMAGE_TYPE_PLT4_BE: 4,
	LZ_IMAGE_TYPE_PLT8: 5,
	LZ_IMAGE_TYPE_RGB16: 6,
	LZ_IMAGE_TYPE_RGB24: 7,
	LZ_IMAGE_TYPE_RGB32: 8,
	LZ_IMAGE_TYPE_RGBA: 9,
	LZ_IMAGE_TYPE_XXXA: 10,
	LZPALETTE_FLAG_PAL_CACHE_ME: 1,
	LZPALETTE_FLAG_PAL_FROM_CACHE: 2,
	LZPALETTE_FLAG_TOP_DOWN: 4,
	PLT_PIXELS_PER_BYTE: [0, 8, 8, 2, 2, 1],
	PLT1_MASK: [1, 2, 4, 8, 16, 32, 64, 128],

	copy_pixel: function(op, color, out_buf) {
		out_buf[(op) + 0] = color.r;
		out_buf[(op) + 1] = color.g;
		out_buf[(op) + 2] = color.b;
	},
		
	lz_rgb32_decompress_rgb: function(arr) {
		//TODO: global alpha and uncouple code
		var encoder = 0;
		var op = 0;
		var ctrl;
		var in_buf = new Uint8Array(arr);
		var format = in_buf[encoder++];
		var opaque = in_buf[encoder++];
		var type = in_buf[encoder++];
		encoder++; //padding
		
		var low = in_buf[encoder+1]*Math.pow(16, 2)+in_buf[encoder];
		encoder += 2;
		var high = in_buf[encoder+1]*Math.pow(16, 2)+in_buf[encoder];
		encoder += 2;
		var len = high*Math.pow(16, 4)+low;

		var buf = new ArrayBuffer(len);
		var buf8 = new Uint8Array(buf);
		var data = new Uint32Array(buf);
		var out_buf_len = len/4;
		
		var code, ref, len, ofs, ref_4, b_4, b;
 
		for (ctrl = in_buf[encoder++]; op < out_buf_len; ctrl = in_buf[encoder++])
		{
			ref = op;
			len = ctrl >> 5;
			ofs = ((ctrl & 31) << 8);

			if (ctrl > 31) { //>=32
				len--;
	
				if (len === 6) {
					do {
						code = in_buf[encoder++];
						len += code;
					} while (code === 255);
				}
				code = in_buf[encoder++];
				ofs += code;
	
	
				if (code === 255) {
					if ((ofs - code) === (31 << 8)) {
						ofs = in_buf[encoder++] << 8;
						ofs += in_buf[encoder++];
						ofs += 8191;
					}
				}
				len += 1;
				ofs += 1;
				ref -= ofs;
				
				if (ref === (op - 1)) {//plt4/1 what?
					b = ref;
					b_4 = b*4;
					for (; len; --len) {
						data[op] =
							(255   << 24) |    // alpha
							(buf8[(b_4)+2] << 16) |    // blue
							(buf8[(b_4)+1] <<  8) |    // green
							 buf8[(b_4)];            // red
						
						op++;
					}
				} else {

					for (; len; --len) {
						//COPY_REF_PIXEL
						ref_4 = ref*4;

						data[op] =
							(255   << 24) |    // alpha
							(buf8[(ref_4)+2] << 16) |    // blue
							(buf8[(ref_4)+1] <<  8) |    // green
							 buf8[(ref_4)];            // red
						
						op++;ref++;
					}
				}
			} else {
				//COPY_COMP_PIXEL
				ctrl++;

				data[op] =
					(255   << 24) |    // alpha
					(in_buf[encoder] << 16) |    // blue
					(in_buf[encoder + 1] <<  8) |    // green
					 in_buf[encoder + 2];            // red
					 
				encoder += 3;
				
				op++;
				
	
				for (--ctrl; ctrl; ctrl--) {
					//COPY_COMP_PIXEL

					data[op] =
						(255   << 24) |    // alpha
						(in_buf[encoder] << 16) |    // blue
						(in_buf[encoder + 1] <<  8) |    // green
						 in_buf[encoder + 2];            // red
					encoder += 3;
					
					op++;
				}
			}
		}
	
		if (type === this.LZ_IMAGE_TYPE_RGBA && !opaque) {
	
			op = 0;
			ctrl = null;
			encoder--;
			for (ctrl = in_buf[encoder++]; op < out_buf_len; ctrl = in_buf[encoder++])
			{
				var ref = op;
				var len = ctrl >> 5;
				var ofs = ((ctrl & 31) << 8);
				var op_4 = op*4;

				if (ctrl >= 32) {

					var code;
					len--;

					if (len === 7 - 1) {
						do {
							code = in_buf[encoder++];
							len += code;
						} while (code === 255);
					}
					code = in_buf[encoder++];
					ofs += code;


					if (code === 255) {
						if ((ofs - code) === (31 << 8)) {
							ofs = in_buf[encoder++] << 8;
							ofs += in_buf[encoder++];
							ofs += 8191;
						}
					}
					len += 3;

					ofs += 1;

					ref -= ofs;
					if (ref === (op - 1)) {//plt4/1 what?
						var b = ref;

						for (; len; --len) {
							op_4 = op*4;
							//COPY_PIXEL
							buf8[(op_4) + 3] = buf8[(b*4)+3];

							op++;
						}
					} else {

						for (; len; --len) {
							//COPY_REF_PIXEL
							op_4 = op*4;
							buf8[(op_4) + 3] = buf8[(ref*4)+3];

							op++;ref++;
						}
					}
				} else {
					//COPY_COMP_PIXEL
					ctrl++;
					buf8[(op_4) + 3] = in_buf[encoder++];
					op++;


					for (--ctrl; ctrl; ctrl--) {
						//COPY_COMP_PIXEL
						op_4 = op*4; // faster?
						buf8[(op_4) + 3] = in_buf[encoder++];
						op++;
					}
				}
			}	
		}
		return buf;
	},
		
	lz_rgb32_decompress: function(in_buf, at, out_buf, type, default_alpha, palette, opaque) {
		//TODO: global alpha and uncouple code
		var encoder = at;
		var op = 0;
		var ctrl;
		var out_buf_len = out_buf.length/4;
		var is_rgba = type === this.LZ_IMAGE_TYPE_RGBA?true:false;
 
		for (ctrl = in_buf[encoder++]; op < out_buf_len; ctrl = in_buf[encoder++])
		{
			var ref = op;
			var len = ctrl >> 5;
			var ofs = ((ctrl & 31) << 8);
			var op_4 = op*4;

			if (ctrl >= 32) {
	
				var code;
				len--;
	
				if (len === 7 - 1) {
					do {
						code = in_buf[encoder++];
						len += code;
					} while (code === 255);
				}
				code = in_buf[encoder++];
				ofs += code;
	
	
				if (code === 255) {
					if ((ofs - code) === (31 << 8)) {
						ofs = in_buf[encoder++] << 8;
						ofs += in_buf[encoder++];
						ofs += 8191;
					}
				}
				len += 1;
				if (is_rgba || palette)
					len += 2;

				ofs += 1;
				//CAST_PLT_DISTANCE ofs and len
				if (type === this.LZ_IMAGE_TYPE_PLT4_LE || type === this.LZ_IMAGE_TYPE_PLT4_BE) {
					ofs = ofs*2;
					len = len*2;
				} else if (type === this.LZ_IMAGE_TYPE_PLT1_BE || type === this.LZ_IMAGE_TYPE_PLT1_LE) {
					ofs = ofs*8;
					len = len*8;
				}

				ref -= ofs;
				if (ref === (op - 1)) {//plt4/1 what?
					var b = ref;

					for (; len; --len) {
						op_4 = op*4;
						//COPY_PIXEL
						if (is_rgba)
						{
							if(opaque) {
								out_buf[(op_4) + 3] = 255;
							} else {
								out_buf[(op_4) + 3] = out_buf[(b*4)+3];
							}
						}
						else
						{
							for (var i = 0; i < 4; i++)
								out_buf[(op_4) + i] = out_buf[(b*4)+i];
						}
						op++;
					}
				} else {

					for (; len; --len) {
						//COPY_REF_PIXEL
						op_4 = op*4;
						if (is_rgba)
						{
							if(opaque) {
								out_buf[(op_4) + 3] = 255;
							} else {
								out_buf[(op_4) + 3] = out_buf[(ref*4)+3];
							}
							
						}
						else
						{
							for (i = 0; i < 4; i++)
								out_buf[(op_4) + i] = out_buf[(ref*4)+i];
						}
						op++;ref++;
					}
				}
			} else {
				//COPY_COMP_PIXEL
				ctrl++;

				if (is_rgba) {
					if(opaque) {
						out_buf[(op_4) + 3] = 255;encoder++;
					} else {
						out_buf[(op_4) + 3] = in_buf[encoder++];
					}
				} else if (palette) {
					if (type === this.LZ_IMAGE_TYPE_PLT1_LE) {
						var oct = in_buf[encoder++];
						var foreColor = palette[1];
						var backColor = palette[0];

						for (var i = 0; i < 8; i++) {
							if (oct & this.PLT1_MASK[i]) {
								this.copy_pixel(op_4, foreColor, out_buf);
							} else {
								this.copy_pixel(op_4, backColor, out_buf);
							}
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
							if (i < 7)
								op++;op_4 = op*4;
						}
					} else if (type === this.LZ_IMAGE_TYPE_PLT1_BE) {
						var oct = in_buf[encoder++];
						var foreColor = palette[1];
						var backColor = palette[0];

						for (var i = 7; i >= 0; i--) {
							if (oct & this.PLT1_MASK[i]) {
								this.copy_pixel(op_4, foreColor, out_buf);
							} else {
								this.copy_pixel(op_4, backColor, out_buf);
							}
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
							if (i > 0)
								op++;op_4 = op*4;
						}
					} else if (type === this.LZ_IMAGE_TYPE_PLT4_LE) {
						var oct = in_buf[encoder++];
						var spiceColor = palette[(oct & 0x0f)];
						this.copy_pixel(op_4, spiceColor, out_buf);
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
						op++;
						op_4 = op*4;

						var spiceColor = palette[((oct >>> 4) & 0x0f)];
						this.copy_pixel(op_4, spiceColor, out_buf);
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
					} else if (type === this.LZ_IMAGE_TYPE_PLT4_BE) {
						var oct = in_buf[encoder++];
						var bits1 = ((oct >>> 4) & 0x0f);
						var bits2 = oct & 0x0f;
						var spiceColor = palette[bits1];
						this.copy_pixel(op_4, spiceColor, out_buf);
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
						op++;
						op_4 = op*4;

						var spiceColor = palette[bits2];
						this.copy_pixel(op_4, spiceColor, out_buf);
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
					} else if (type === this.LZ_IMAGE_TYPE_PLT8) {
						var posPal = in_buf[encoder++];
						var spiceColor = palette[posPal];
						this.copy_pixel(op_4, spiceColor, out_buf);
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
					}
				} else {
					out_buf[(op_4) + 0] = in_buf[encoder + 2];
					out_buf[(op_4) + 1] = in_buf[encoder + 1];
					out_buf[(op_4) + 2] = in_buf[encoder + 0];
					if (default_alpha)
						out_buf[(op_4) + 3] = 255;
					encoder += 3;
				}
				op++;
				
	
				for (--ctrl; ctrl; ctrl--) {
					//COPY_COMP_PIXEL
					op_4 = op*4; // faster?
					if (is_rgba) {
						if(opaque) {
							out_buf[(op_4) + 3] = 255;
						} else {
							out_buf[(op_4) + 3] = in_buf[encoder++];
						}
					} else if (palette) {
						if (type === this.LZ_IMAGE_TYPE_PLT1_LE) {
							var oct = in_buf[encoder++];
							var foreColor = palette[1];
							var backColor = palette[0];

							for (var i = 0; i < 8; i++) {
								if (oct & this.PLT1_MASK[i]) {
									this.copy_pixel(op_4, foreColor, out_buf);
								} else {
									this.copy_pixel(op_4, backColor, out_buf);
								}
								if (default_alpha)
									out_buf[(op_4) + 3] = 255;
								if (i < 7)
									op++;op_4 = op*4;
							}
						} else if (type === this.LZ_IMAGE_TYPE_PLT1_BE) {
							var oct = in_buf[encoder++];
							var foreColor = palette[1];
							var backColor = palette[0];

							for (var i = 7; i >=0; i--) {
								if (oct & this.PLT1_MASK[i]) {
									this.copy_pixel(op_4, foreColor, out_buf);
								} else {
									this.copy_pixel(op_4, backColor, out_buf);
								}
								if (default_alpha)
									out_buf[(op_4) + 3] = 255;
								if (i > 0)
									op++;op_4 = op*4;
							}
						} else if (type === this.LZ_IMAGE_TYPE_PLT4_LE) {
							var oct = in_buf[encoder++];
							var spiceColor = palette[(oct & 0x0f)];
							this.copy_pixel(op_4, spiceColor, out_buf);
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
							op++;
							op_4 = op*4;
							var spiceColor = palette[((oct >>> 4) & 0x0f)];
							this.copy_pixel(op_4, spiceColor, out_buf);
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
						} else if (type === this.LZ_IMAGE_TYPE_PLT4_BE) {
							var oct = in_buf[encoder++];
							var spiceColor = palette[((oct >>> 4) & 0x0f)];
							this.copy_pixel(op_4, spiceColor, out_buf);
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
							op++;
							op_4 = op*4;

							var spiceColor = palette[(oct & 0x0f)];
							this.copy_pixel(op_4, spiceColor, out_buf);
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
						} else if (type === this.LZ_IMAGE_TYPE_PLT8) {
							var posPal = in_buf[encoder++];
							var spiceColor = palette[posPal];
							this.copy_pixel(op_4, spiceColor, out_buf);
							if (default_alpha)
								out_buf[(op_4) + 3] = 255;
						}
					} else {
						out_buf[(op_4) + 0] = in_buf[encoder + 2];
						out_buf[(op_4) + 1] = in_buf[encoder + 1];
						out_buf[(op_4) + 2] = in_buf[encoder + 0];
						if (default_alpha)
							out_buf[(op_4) + 3] = 255;
						encoder += 3;
					}
					op++;
				}
			}
		}
		return encoder - 1;
	},

	convert_spice_lz_to_web: function(context, data, imageDescriptor, opaque) { //TODO: refactor this shit code
		// var aux = data.toJSArray();
		var format = imageDescriptor.type;
        data = data.toJSArray(); //this old functions has no support for typed arrays...
		if (format === wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_PLT) {
			var flags = wdi.SpiceObject.bytesToInt8(data.splice(0, 1));
			if (flags === this.LZPALETTE_FLAG_PAL_FROM_CACHE) {
				var header = data.splice(0, 12);
				var length = wdi.SpiceObject.bytesToInt32(header.splice(0, 4));
                var palette_id = wdi.SpiceObject.bytesToInt64(header.splice(0, 8));

                header = data;

                var magic = wdi.SpiceObject.bytesToStringBE(header.splice(0, 4));
                var version = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
                var type = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
                var width = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
                var height = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
                var stride = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
                var top_down = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));

			} else if (flags === this.LZPALETTE_FLAG_PAL_CACHE_ME) {
				var imageHeaders = imageDescriptor.offset + 1; //+1 because of the Flags byte
				var currentHeaders = 36;
				var header = data.splice(0, currentHeaders);
				var length = wdi.SpiceObject.bytesToInt32(header.splice(0, 4));
				var palette_offset = wdi.SpiceObject.bytesToInt32(header.splice(0, 4));
				var spliceInit = palette_offset-imageHeaders-currentHeaders;
				//LZ Compression headers with its magic
				var magic = wdi.SpiceObject.bytesToStringBE(header.splice(0, 4));
				var version = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
				var type = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
				var width = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
				var height = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
				var stride = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));
				var top_down = wdi.SpiceObject.bytesToInt32BE(header.splice(0,4));

				var palette_id = wdi.SpiceObject.bytesToInt64(data.splice(spliceInit, 8));

				var num_palettes = wdi.SpiceObject.bytesToInt16(data.splice(spliceInit, 2));
				var palette = [];
				
				for (var i = 0; i < num_palettes; i++) {
					var queue = new wdi.Queue();
					queue.setData(data.splice(spliceInit, 4));
					palette.push(new wdi.SpiceColor().demarshall(queue));
				}
				wdi.ImageCache.addPalette(palette_id, palette);
			} else {
				
			}
			var palette = wdi.ImageCache.getPalette(palette_id);
		}

		if (type !== this.LZ_IMAGE_TYPE_RGB32 && type !== this.LZ_IMAGE_TYPE_RGBA &&
			type !== this.LZ_IMAGE_TYPE_RGB24 && type !== this.LZ_IMAGE_TYPE_PLT8 &&
			type !== this.LZ_IMAGE_TYPE_PLT1_LE && type !== this.LZ_IMAGE_TYPE_PLT1_BE && 
			type !== this.LZ_IMAGE_TYPE_PLT4_LE && type !== this.LZ_IMAGE_TYPE_PLT4_BE) {
			return false;
		}

		if (palette) {
			var ret = context.createImageData(stride*this.PLT_PIXELS_PER_BYTE[type], height);
			// if (type === this.LZ_IMAGE_TYPE_PLT1_BE) {
				// this.lz_rgb32_plt1_be_decompress(data, ret.data, palette);
			// } else {
				this.lz_rgb32_decompress(data, 0, ret.data, type, type !== this.LZ_IMAGE_TYPE_RGBA, palette);
			// }

			var tmpCanvas = wdi.graphics.getNewTmpCanvas(width, height);
			tmpCanvas.getContext('2d').putImageData(ret, 0, 0, 0, 0, width, height);
			ret = tmpCanvas;
		} else {
			var arr = new ArrayBuffer(data.length+8);
			var u8 = new Uint8Array(arr);
			u8[0] = 1;
			u8[1] = opaque;
			u8[2] = type;
			u8[3] = 0;
			
			var number = ret.data.length;
		
			for (var i = 0;i < 4;i++) {//iterations because of javascript number size 
				u8[4+i] = number & (255);//Get only the last byte
				number = number >> 8;//Remove the last byte
			}
		
			u8.set(data, 8);
			var result = new Uint8ClampedArray(this.lz_rgb32_decompress_rgb(arr));
			ret = new ImageData(result, width, height);
			ret = wdi.graphics.getImageFromData(ret);
		}

		if(!top_down) {
			//TODO: PERFORMANCE:
			ret = wdi.RasterOperation.flip(ret);
		}



		return ret;
	},
    
    demarshall_rgb: function(data) {
        var header = data.splice(0, 32);
        return {
            length: wdi.SpiceObject.bytesToInt32(header.splice(0,4)),
            magic: wdi.SpiceObject.bytesToStringBE(header.splice(0,4)),
            version: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4)),
            type: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4)),
            width: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4)),
            height: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4)),
            stride: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4)),
            top_down: wdi.SpiceObject.bytesToInt32BE(header.splice(0,4))
        }
    },

    lz_rgb32_plt1_be_decompress: function(in_buf, out_buf, palette) {
		var encoder = 0;
		var op = 0;
		var ctrl;
		var out_buf_len = out_buf.length/4;
		var ref, len, ofs, next, ref_4, oct, foreColor, backColor, i;
		var type = this.LZ_IMAGE_TYPE_PLT1_BE;

		var pix_per_byte = this.PLT_PIXELS_PER_BYTE[type];

		var pre_255_24 = 255 << 24;
		var pre_31_8_plus255 = (31 << 8) + 255; //8191 === 13 bits to 1

		for (ctrl = in_buf[encoder++]; op < out_buf_len; ctrl = in_buf[encoder++]) {
			ref = op;
			len = ctrl >> 5;
			ofs = ((ctrl & 31) << 8);

			if (ctrl > 31) {

				if (len === 7) {
					do {
						next = in_buf[encoder++];
						len += next;
					} while (next === 255);
				}

				ofs += in_buf[encoder++];

				if (ofs  === pre_31_8_plus255) {
					ofs += in_buf[encoder++] << 8 + in_buf[encoder++];
				}

				//CAST_PLT_DISTANCE ofs and len
				len = (len + 2) * pix_per_byte;

				ref -= (ofs + 1) * pix_per_byte;
				if (ref === (op - 1)) {
					ref_4 = ref * 4;
					while (len-- !== 0) {
						//COPY_PIXEL
						op_4 = op * 4;

						out_buf[op_4] = out_buf[ref_4];
						out_buf[op_4 + 1] = out_buf[ref_4 + 1];
						out_buf[op_4 + 2] = out_buf[ref_4 + 2];
						out_buf[op_4 + 3] = out_buf[ref_4 + 3];

						op++;
					}
				} else {
					while (len-- !== 0) {
						//COPY_REF_PIXEL
						op_4 = op * 4;
						ref_4 = ref * 4;

						out_buf[op_4] = out_buf[ref_4];
						out_buf[op_4 + 1] = out_buf[ref_4 + 1];
						out_buf[op_4 + 2] = out_buf[ref_4 + 2];
						out_buf[op_4 + 3] = out_buf[ref_4 + 3];

						op++;ref++;
					}
				}
			} else {
				//COPY_COMP_PIXEL
				while (ctrl-- !== -1) {
					//COPY_COMP_PIXEL
					op_4 = op * 4; // faster?

					oct = in_buf[encoder++];
					foreColor = palette[1];
					backColor = palette[0];

					for (i = 7; i >=0; i--) {
						op_4 = op * 4;

						if (oct & this.PLT1_MASK[i]) {
							out_buf[op_4 + 0] = foreColor.r;
							out_buf[op_4 + 1] = foreColor.g;
							out_buf[op_4 + 2] = foreColor.b;
						} else {
							out_buf[op_4 + 0] = backColor.r;
							out_buf[op_4 + 1] = backColor.g;
							out_buf[op_4 + 2] = backColor.b;
						}
						out_buf[(op_4) + 3] = 255;

						op++;
					}
				}
			}
		}
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.BMP2 = $.spcExtend(wdi.SpiceObject, {
	objectSize: 0,
	mapper: [0, 1, 1, 4, 4, 8, 16, 24, 32, 32],

	init: function(imageData) {
		var type = this.bytesToInt8(imageData);
		var flags = this.bytesToInt8(imageData); // bit 1 => normal, bit 2 => palette cache (...)
		var width = this.bytesToInt32(imageData); // width in pixels
		var height = this.bytesToInt32(imageData); // height in pixels
		var stride = this.bytesToInt32(imageData); // width in bytes including padding
		var len;
		var bpp = this.mapper[type];
		var i;


		var paletteSize = 0, unique, paletteData, numEnts = 0;
		if (bpp <= 8 && bpp > 0) {
			var palette = [];
			if (flags & 1) {
				var paletteOffset = this.bytesToInt32(imageData); // From the begininig of the spice packet?
				len = imageData.length;
				paletteSize = 4*Math.pow(2,bpp);
				var paletteDataSize = paletteSize + 8 + 2; //palette + unique(64b) + numEnts (16b)
				len -= paletteDataSize;
				paletteData = imageData.splice(len, paletteDataSize);
				unique = this.bytesToInt64(paletteData);
				numEnts = this.bytesToInt16(paletteData);
				var queue;

				for (i = 0; i < numEnts*4; i+=4) {
					queue = new wdi.Queue();
					queue.setData(paletteData.slice(i, i+4));
					palette.push(new wdi.SpiceColor().demarshall(queue));
				}
				wdi.ImageCache.addPalette(unique, palette);
			} else {
				//get palette from cache
				unique = this.bytesToInt64(imageData);
				len = imageData.length;
				palette = wdi.ImageCache.getPalette(unique);
				var spiceColors;
				paletteData = [];
				numEnts = palette.length;
				for (i =0; i < numEnts; i++ ) {
					spiceColors = palette[i].marshall();
					spiceColors.push(0);
					paletteData = paletteData.concat(spiceColors);
				}

			}
			// imageData = paletteData.concat(imageData);

		} else {
			// Removing 4 bytes from the image data to fix index out of range error.
			var unknown = this.bytesToInt32(imageData);
		}

		this.setContent({
			imageSize: len,
			width: width,
			height: height,
			bpp: bpp,
			imageData: imageData,
			paletteSize: numEnts * 4,
			palette: palette,
			stride: stride,
			type: type
		});
	},
	
	setContent: function(c) {
		this.imageSize = c.imageSize;
		this.width = c.width;
		this.height = c.height;
		this.bpp = c.bpp;
		this.imageData = c.imageData;
		this.palette = c.palette;
		this.offset = c.paletteSize + 0x36; //0x36 === Current harcoded header size (BMP + DIB)
		this.size = this.offset + this.imageSize;
		this.stride = c.stride;
		this.type = c.type;
	},
	
	marshall: function(context) {
		var type = this.type;
		var palette = this.palette;
        var width = this.width;
        var height = this.height;
		var stride = this.stride;
		var data = this.imageData;
		var size = data.length;

		var pixelsStride = stride * 8/this.bpp;
		var bytesStride = pixelsStride * 4;
		var buf = new ArrayBuffer(bytesStride * height);
		var buf8 = new Uint8ClampedArray(buf);
		var buf32 = new Uint32Array(buf);
		var topdown = false;

		var oct, i, pos, buffPos, spiceColor;
		var b;
		if (palette) {
			buffPos = 0
			if (type === wdi.SpiceBitmapFmt.SPICE_BITMAP_FMT_1BIT_BE) {
				spiceColor = palette[1];
				var foreColor = spiceColor.r << 24 | spiceColor.g << 16 | spiceColor.b << 8 | 255;

				spiceColor = palette[0];
				var backColor = spiceColor.r << 24 | spiceColor.g << 16 | spiceColor.b << 8 | 255;

				var PLT1_MASK = [1, 2, 4, 8, 16, 32, 64, 128];

				for (pos = 0; pos < size; pos++) {
					oct = data[pos];

					for (i = 7; i >= 0; i--) {
						if (oct & PLT1_MASK[i]) {
							buf32[buffPos++] = foreColor;
						} else {
							buf32[buffPos++] = backColor;
						}
					}
				}
			} else if (type === wdi.SpiceBitmapFmt.SPICE_BITMAP_FMT_4BIT_BE) {
				for (pos = 0; pos < size; pos++) {
					oct = data[pos];
					spiceColor = palette[oct >>> 4];
					buf32[buffPos++] = spiceColor.r << 24 | spiceColor.g << 16 | spiceColor.b << 8 | 255;
					spiceColor = palette[oct & 0x0f];
					buf32[buffPos++] = spiceColor.r << 24 | spiceColor.g << 16 | spiceColor.b << 8 | 255;
				}
			}

		} else {
			if (type === wdi.SpiceBitmapFmt.SPICE_BITMAP_FMT_32BIT) {
				for (pos = 0; pos < size; pos += 4) {
					b = data[pos];
					data[pos] = data[pos + 2];
					data[pos + 2] = b;
					data[pos + 3] = 255;
				}

			} else if (type === wdi.SpiceBitmapFmt.SPICE_BITMAP_FMT_RGBA) {
				topdown = true;
				for (pos = 0; pos < size; pos+=4) {
					b = data[pos];
					data[pos] = data[pos+2];
					data[pos+2] = b;
				}
			} else if (type === wdi.SpiceBitmapFmt.SPICE_BITMAP_FMT_24BIT) {
				for (pos = 0; pos < size; pos+=3) {
					b = data[pos];
					data[pos] = data[pos+2];
					data[pos+2] = b;
				}
			}
			buf8 = new Uint8ClampedArray(data);
		}

		var ret = new ImageData(buf8, pixelsStride, height);

		var tmpCanvas = wdi.graphics.getNewTmpCanvas(width, height);
		tmpCanvas.getContext('2d').putImageData(ret, 0, 0, 0, 0, width, height);
		ret = tmpCanvas;

		if(!topdown) {
			ret = wdi.RasterOperation.flip(ret);
		}

		return ret;

	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";
/*
   Copyright (C) 2012 by Jeremy P. White <jwhite@codeweavers.com>

   This file is part of spice-html5.

   spice-html5 is free software: you can redistribute it and/or modify
   it under the terms of the GNU Lesser General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   spice-html5 is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Lesser General Public License for more details.

   You should have received a copy of the GNU Lesser General Public License
   along with spice-html5.  If not, see <http://www.gnu.org/licenses/>.
*/

/*----------------------------------------------------------------------------
**  crc logic from rfc2083 ported to Javascript
**--------------------------------------------------------------------------*/

var rfc2083_crc_table = Array(256);
var rfc2083_crc_table_computed = 0;
/* Make the table for a fast CRC. */
function rfc2083_make_crc_table()
{
    var c;
    var n, k;
    for (n = 0; n < 256; n++)
    {
        c = n;
        for (k = 0; k < 8; k++)
        {
            if (c & 1)
                c = ((0xedb88320 ^ (c >>> 1)) >>> 0) & 0xffffffff;
            else
                c = c >>> 1;
        }
        rfc2083_crc_table[n] = c;
    }

    rfc2083_crc_table_computed = 1;
}

/* Update a running CRC with the bytes buf[0..len-1]--the CRC
     should be initialized to all 1's, and the transmitted value
     is the 1's complement of the final running CRC (see the
     crc() routine below)). */

function rfc2083_update_crc(crc, u8buf, at, len)
{
    var c = crc;
    var n;

    if (!rfc2083_crc_table_computed)
        rfc2083_make_crc_table();

    for (n = 0; n < len; n++)
    {
        c = rfc2083_crc_table[(c ^ u8buf[at + n]) & 0xff] ^ (c >>> 8);
    }

    return c;
}

function rfc2083_crc(u8buf, at, len)
{
    return rfc2083_update_crc(0xffffffff, u8buf, at, len) ^ 0xffffffff;
}

function crc32(mb, at, len)
{
    var u8 = new Uint8Array(mb);
    return rfc2083_crc(u8, at, len);
}

function PngIHDR(width, height)
{
    this.width = width;
    this.height = height;
    this.depth = 8;
    this.type = 6;
    this.compression = 0;
    this.filter = 0;
    this.interlace = 0;
}

PngIHDR.prototype =
{
    to_buffer: function(a, at)
    {
        at = at || 0;
        var orig = at;
        var dv = new SpiceDataView(a);
        dv.setUint32(at, this.buffer_size() - 12); at += 4;
        dv.setUint8(at, 'I'.charCodeAt(0)); at++;
        dv.setUint8(at, 'H'.charCodeAt(0)); at++;
        dv.setUint8(at, 'D'.charCodeAt(0)); at++;
        dv.setUint8(at, 'R'.charCodeAt(0)); at++;
        dv.setUint32(at, this.width); at += 4;
        dv.setUint32(at, this.height); at += 4;
        dv.setUint8(at, this.depth); at++;
        dv.setUint8(at, this.type); at++;
        dv.setUint8(at, this.compression); at++;
        dv.setUint8(at, this.filter); at++;
        dv.setUint8(at, this.interlace); at++;
        dv.setUint32(at, crc32(a, orig + 4, this.buffer_size() - 8)); at += 4;
        return at;
    },
    buffer_size: function()
    {
        return 12 + 13;
    }
}


function adler()
{
    this.s1 = 1;
    this.s2 = 0;
}

adler.prototype.update = function(b)
{
    this.s1 += b;
    this.s1 %= 65521;
    this.s2 += this.s1;
    this.s2 %= 65521;
}

function PngIDAT(width, height, bytes)
{
    if (bytes.byteLength > 65535)
    {
        throw new Error("Cannot handle more than 64K");
    }
    this.data = bytes;
    this.width = width;
    this.height = height;
}

PngIDAT.prototype =
{
    to_buffer: function(a, at)
    {
        at = at || 0;
        var orig = at;
        var x, y, i, j;
        var dv = new SpiceDataView(a);
        var zsum = new adler();
        dv.setUint32(at, this.buffer_size() - 12); at += 4;
        dv.setUint8(at, 'I'.charCodeAt(0)); at++;
        dv.setUint8(at, 'D'.charCodeAt(0)); at++;
        dv.setUint8(at, 'A'.charCodeAt(0)); at++;
        dv.setUint8(at, 'T'.charCodeAt(0)); at++;

        /* zlib header.  */
        dv.setUint8(at, 0x78); at++;
        dv.setUint8(at, 0x01); at++;

        /* Deflate header.  Specifies uncompressed, final bit */
        dv.setUint8(at, 0x80); at++;
        dv.setUint16(at, this.data.byteLength + this.height); at += 2;
        dv.setUint16(at, ~(this.data.byteLength + this.height)); at += 2;
        var u8 = new Uint8Array(this.data);
        for (i = 0, y = 0; y < this.height; y++)
        {
            /* Filter type 0 - uncompressed */
            dv.setUint8(at, 0); at++;
            zsum.update(0);
            for (x = 0; x < this.width && i < this.data.byteLength; x++)
            {
                zsum.update(u8[i]);
                dv.setUint8(at, u8[i++]); at++;
                zsum.update(u8[i]);
                dv.setUint8(at, u8[i++]); at++;
                zsum.update(u8[i]);
                dv.setUint8(at, u8[i++]); at++;
                zsum.update(u8[i]);
                dv.setUint8(at, u8[i++]); at++;
            }
        }

        /* zlib checksum.   */
        dv.setUint16(at, zsum.s2); at+=2;
        dv.setUint16(at, zsum.s1); at+=2;

        /* FIXME - something is not quite right with the zlib code;
                   you get an error from libpng if you open the image in
                   gimp.  But it works, so it's good enough for now... */

        dv.setUint32(at, crc32(a, orig + 4, this.buffer_size() - 8)); at += 4;
        return at;
    },
    buffer_size: function()
    {
        return 12 + this.data.byteLength + this.height + 4 + 2 + 1 + 2 + 2;
    }
}


function PngIEND()
{
}

PngIEND.prototype =
{
    to_buffer: function(a, at)
    {
        at = at || 0;
        var orig = at;
        var i;
        var dv = new SpiceDataView(a);
        dv.setUint32(at, this.buffer_size() - 12); at += 4;
        dv.setUint8(at, 'I'.charCodeAt(0)); at++;
        dv.setUint8(at, 'E'.charCodeAt(0)); at++;
        dv.setUint8(at, 'N'.charCodeAt(0)); at++;
        dv.setUint8(at, 'D'.charCodeAt(0)); at++;
        dv.setUint32(at, crc32(a, orig + 4, this.buffer_size() - 8)); at += 4;
        return at;
    },
    buffer_size: function()
    {
        return 12;
    }
}


function create_rgba_png(width, height, bytes)
{
    var i;
    var ihdr = new PngIHDR(width, height);
    var idat = new PngIDAT(width, height, bytes);
    var iend = new PngIEND;

    var mb = new ArrayBuffer(ihdr.buffer_size() + idat.buffer_size() + iend.buffer_size());
    var at = ihdr.to_buffer(mb);
    at = idat.to_buffer(mb, at);
    at = iend.to_buffer(mb, at);

    var u8 = new Uint8Array(mb);
    var str = "";
    for (i = 0; i < at; i++)
    {
        str += "%";
        if (u8[i] < 16)
            str += "0";
        str += u8[i].toString(16);
    }


    return "%89PNG%0D%0A%1A%0A" + str;
}

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.RunQueue = $.spcExtend(wdi.DomainObject, {
	tasks: null,
	isRunning: false,
	
	init: function() {
		this.tasks = [];
	},
	
	getTasksLength: function() {
		return this.tasks.length;
	},
	
	add: function(fn, scope, endCallback, params) {
		this.tasks.push({
			fn: fn,
			scope: scope,
            fnFinish: endCallback,
            params: params
		});
		
		return this;
	},
	
	clear: function() {
		
		this.tasks = [];
		
		return this;
	},
	
	_process: function() {
		wdi.ExecutionControl.sync = true;
		var proxy, self = this;
		this.isRunning = true;
		var task = this.tasks.shift();
		
		if (!task) {
			this.isRunning = false;
			return;
		}
		
		proxy = {
			end: function() {
                if(task.fnFinish) {
                    task.fnFinish.call(task.scope);
                }
				self._process();
			}
		};

		try {
			task.fn.call(task.scope, proxy, task.params);
		} catch(e) {
			
			proxy.end();
		}
		
		return this;
	},

	process: function() {
		if (!this.isRunning) {
			this._process();
		} else {
			return;
		}
	}
});

//wdi.ExecutionControl = $.spcExtend(wdi.DomainObject, {
//	currentProxy: null,
//	sync: true,
//	runQ: null,
//	init: function(c) {
//		this.runQ = c.runQ || new wdi.RunQueue(); 
//	}
//});

//TODO: make an instance of it on each channel
wdi.ExecutionControl = {
	currentProxy: null,
	sync: true,
	runQ: new wdi.RunQueue()
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

if (typeof CanvasPixelArray != 'undefined' && !CanvasPixelArray.prototype.set) {
	CanvasPixelArray.prototype.set = function(u8) {
		var length = u8.length;
		for (var i=0; i<length; i++) {
			this[i] = u8[i];
		}
	};
}

wdi.graphics = {
	tmpCanvas: document.createElement('canvas'),
	imageLoader: new Image(),

	dispose: function () {
		
		$(this.tmpCanvas).remove();
		$(this.imageLoader).remove();
		this.tmpCanvas = document.createElement('canvas');
		this.imageLoader = new Image();
		wdi.GlobalPool.dispose();
		wdi.ImageCache.dispose();
		wdi.ImageUncompressor.dispose();
		wdi.RasterOperation.dispose();
	},

	getRect: function(box, image) {
		//if the subpart is the whole image, return image
		if (box.x === 0 && box.y === 0 && box.width === image.width && box.height === image.height) {
			return image;
		}

		var cnv = this.getImageFromData(image);
		//get a subpart of the image

		//first, create a canvas to hold the new image
		var tmp_canvas = wdi.graphics.getNewTmpCanvas(box.width, box.height);
		var tmp_context = tmp_canvas.getContext('2d');

		tmp_context.drawImage(cnv, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
		return tmp_canvas;
	},

	//TODO: why this is not argb?
	argbToImageData: function(bytes, width, height) {
		var length = bytes.length;
		var canvas = wdi.graphics.getTmpCanvas(width, height);
		var context = canvas.getContext('2d');
		var imageData = context.createImageData(width, height);

		for (var i = 0; i < length; i += 4) {
			imageData.data[i] = bytes[i]; //r
			imageData.data[i + 1] = bytes[i + 1]; //g
			imageData.data[i + 2] = bytes[i + 2]; //b
			imageData.data[i + 3] = bytes[i + 3]; //a
		}

		return imageData;
	},

	align: function(a, size) {
		return (((a) + ((size) - 1)) & ~((size) - 1));
	},

	monoMask: [1, 2, 4, 8, 16, 32, 64, 128],

	monoToImageData: function(bytes, width, height) {
		var stride = this.align(width, 8) >>> 3;
		var length = bytes.length;
		var half = length / 2;

		var canvas = wdi.graphics.getTmpCanvas(width, height);
		var context = canvas.getContext('2d');

		var result = context.createImageData(width, height);

		var andMask = [];
		var xorMask = [];

		for (var i = 0; i < length; i++) {
			var currentByte = bytes[i];
			var bitsLeft = 8;

			if (i >= half) {
				while (bitsLeft--) {
					var bit = (currentByte & this.monoMask[bitsLeft]) && true;
					andMask.push(bit);
				}
			} else if (i < half) {
				while (bitsLeft--) {
					var bit = (currentByte & this.monoMask[bitsLeft]) && true;
					xorMask.push(bit);
				}
			}
		}

		var pos = 0;
		half = xorMask.length;

		for (i = 0; i < half; i++) {
			pos = i * 4;
			if (!andMask[i] && !xorMask[i]) {
				result.data[pos] = 0;
				result.data[pos + 1] = 0;
				result.data[pos + 2] = 0;
				result.data[pos + 3] = 255;
			} else if (!andMask[i] && xorMask[i]) {
				result.data[pos] = 255;
				result.data[pos + 1] = 255;
				result.data[pos + 2] = 255;
				result.data[pos + 3] = 0;
			} else if (andMask[i] && !xorMask[i]) {
				result.data[pos] = 255;
				result.data[pos + 1] = 255;
				result.data[pos + 2] = 255;
				result.data[pos + 3] = 255;
			} else if (andMask[i] && xorMask[i]) {
				result.data[pos] = 0;
				result.data[pos + 1] = 0;
				result.data[pos + 2] = 0;
				result.data[pos + 3] = 255;
			}
		}
		return result;
	},

	drawJpeg: function (imageDescriptor, jpegData, callback, previousScope) {
		return this.drawBrowserImage(imageDescriptor, jpegData, callback, previousScope, 'jpeg', false);
	},

    drawBrowserImage: function (imageDescriptor, jpegData, callback, previousScope, type, alreadyEncoded) {
        var tmpstr;
        var img = wdi.GlobalPool.create('Image');
		var url;
        img.onload = function() {
			URL.revokeObjectURL(url)
			try {
				if (imageDescriptor.flags & wdi.SpiceImageFlags.SPICE_IMAGE_FLAGS_CACHE_ME) {
					var myImage = wdi.graphics.getTmpCanvas(this.width, this.height);
					var tmp_context = myImage.getContext('2d');
					tmp_context.drawImage(this, 0, 0);
					wdi.ImageCache.addImage(imageDescriptor, myImage);
				}

                callback.call(previousScope, this);
            } catch (e) {
                
            } finally {
                wdi.ExecutionControl.currentProxy.end();
            }
        };

        img.onerror = function() {
			URL.revokeObjectURL(url)
            
            wdi.ExecutionControl.currentProxy.end();
        };

		if(!alreadyEncoded) {
			url = wdi.SpiceObject.bytesToURI(jpegData);
			img.src = url;
		} else {
			tmpstr = jpegData;
			img.src = tmpstr;
		}
    },

	getImageFromSpice: function (imageDescriptor, imageData, clientGui, callback, previousScope, options) {
		var myImage;
		var source_img = null;
		var opaque;
		var brush;
		var raw;

		if (options) {
			opaque = options['opaque'];
			brush = options['brush'];
			raw = options['raw'];
		} else {
			opaque = false;
			raw = false;
			brush = false;
		}




		switch (imageDescriptor.type) {
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_RGB:
				source_img = this.processLz(imageDescriptor, imageData, brush, opaque, clientGui);
				break;

			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_PLT:
				
				source_img = wdi.LZSS.convert_spice_lz_to_web(clientGui.getContext(0), imageData, imageDescriptor, opaque);
				break;

			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_QUIC:
				source_img = this.processQuic(imageDescriptor, imageData, brush, opaque, clientGui);
				break;

            case wdi.SpiceImageType.SPICE_IMAGE_TYPE_JPEG:
				
				wdi.ExecutionControl.sync = false;
                this.drawJpeg(imageDescriptor, imageData.subarray(4), callback, previousScope);
                return;

            case wdi.SpiceImageType.SPICE_IMAGE_TYPE_JPEG_ALPHA:
                
                wdi.ExecutionControl.sync = false;
                var jpeg_data = imageData.subarray(9);
                this.drawJpeg(imageDescriptor, jpeg_data, callback, previousScope);

                // TODO: extract alpha mask and apply

                return;

            case wdi.SpiceImageType.SPICE_IMAGE_TYPE_BITMAP:
				

				if (imageData.toJSArray) {
					imageData = imageData.toJSArray();
				}

				//Spice BMP Headers
				source_img = new wdi.BMP2(imageData).marshall(clientGui.getContext(0));
				break;
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_FROM_CACHE_LOSSLESS:
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_FROM_CACHE:
                wdi.ExecutionControl.sync = false;
				wdi.ImageCache.getImageFrom(imageDescriptor, function(img) {
                    callback.call(previousScope, img);
                    wdi.ExecutionControl.currentProxy.end();
                });
				return;
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_SURFACE:
				var origin_surface_id = wdi.SpiceObject.bytesToInt32(imageData.toJSArray());
				var context = clientGui.getContext(origin_surface_id);
				source_img = context.canvas;
				break;
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_CANVAS:
				source_img = imageData;
				break;
			case wdi.SpiceImageType.SPICE_IMAGE_TYPE_PNG:
				wdi.ExecutionControl.sync = false;
				imageData = wdi.SpiceObject.bytesToString(imageData.toJSArray());
				this.drawBrowserImage(imageDescriptor, imageData, callback, previousScope, "png", true);
				return;
			default:
				
				wdi.ExecutionControl.currentProxy.end();
				return;
		}
		myImage = null;
		if (imageDescriptor.flags & wdi.SpiceImageFlags.SPICE_IMAGE_FLAGS_CACHE_ME) {
			wdi.ImageCache.addImage(imageDescriptor, source_img);
		}

		if(source_img.getContext || raw) {
			myImage = source_img;
		} else {
			myImage = this.getImageFromData(source_img);
		}

		if (imageDescriptor.flags & wdi.SpiceImageFlags.SPICE_IMAGE_FLAGS_CACHE_ME) {
			wdi.ImageCache.addImage(imageDescriptor, myImage);
		}

		if (wdi.ExecutionControl.sync) callback.call(previousScope, myImage);
	},

	processUncompress: function (imageDescriptor, imageData, brush, opaque, clientGui, callback) {
		var scope = this;
		var imageUncompressor = wdi.ImageUncompressor.getSyncInstance();

		imageUncompressor.process(
			imageDescriptor, imageData, brush, opaque, clientGui, callback, scope
		);
	},

	processQuic: function(imageDescriptor, imageData, brush, opaque, clientGui) {
		var source_img;

		var callback = function(data) {
			var u8 = new Uint8ClampedArray(data);
			source_img = new ImageData(u8, imageDescriptor.width, imageDescriptor.height);
		};

		this.processUncompress(imageDescriptor, imageData, brush, opaque, clientGui, callback);

		return source_img;
	},

	processLz: function(imageDescriptor, imageData, brush, opaque, clientGui) {
		var source_img;
		var self = this;
		function callback(data) {
			var imageUncompressor = wdi.ImageUncompressor.getSyncInstance();
			var extractedData = imageUncompressor.extractLzHeader(imageData, brush);

			var u8 = new Uint8ClampedArray(data);
			source_img = new ImageData(u8, imageDescriptor.width, imageDescriptor.height);

			if (!extractedData.header.top_down && !opaque) {
				source_img = this.imageFlip(source_img);
			}
		};


		this.processUncompress(imageDescriptor, imageData, brush, opaque, clientGui, callback);
		return source_img;
	},

	imageFlip: function (source_img) {
		return wdi.RasterOperation.flip(this.getImageFromData(source_img));
	},

	//given an imagedata it returns a canvas
	getImageFromData: function(data, notUsePool) {
		if(data.getContext || data instanceof Image) {
			return data;
		}
		var sourceCanvas;
		if (!notUsePool) {
			sourceCanvas = this.getNewTmpCanvas(data.width, data.height);
		} else {
			sourceCanvas = $('<canvas/>').attr({
				'width': data.width,
				'height': data.height
			})[0]; //this.getNewTmpCanvas(data.width, data.height);
		}

		var srcCtx = sourceCanvas.getContext('2d');
		srcCtx.putImageData(data, 0, 0);
		return sourceCanvas;
	},

	//given a canvas it returns a ImageData
	getDataFromImage: function(canvas) {
		return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	},


	getBoxFromSrcArea: function(src_area) {
		var box = {
			width: src_area.right - src_area.left,
			height: src_area.bottom - src_area.top,
			x: src_area.left,
			y: src_area.top
		};
		return box;
	},

	setBrush: function(clientGui, context, brush, box, ropd) {
		var pattern, imageDescriptor, type, imageData;
		if (brush.type === wdi.SpiceBrushType.SPICE_BRUSH_TYPE_PATTERN) {
			imageDescriptor = brush.pattern.image;
			this.getImageFromSpice(imageDescriptor, brush.pattern.imageData, clientGui, function(sourceImg) {
				pattern = context.createPattern(sourceImg, "repeat");


				if (ropd === wdi.SpiceRopd.SPICE_ROPD_OP_PUT) { //no rop, direct draw
					context.fillStyle = pattern;
					context.fillRect(box.x, box.y, box.width, box.height);
				} else {
					//Creating brushImg to raster
					var tmp_canvas = wdi.graphics.getTmpCanvas(box.width, box.height);
					var tmp_context = tmp_canvas.getContext('2d');
					tmp_context.fillStyle = pattern;
					tmp_context.fillRect(0, 0, box.width, box.height);
					var dest = wdi.graphics.getRect(box, context.canvas);
					imageData = wdi.RasterOperation.process(ropd, tmp_canvas, dest);
					//draw to screen, imageData is a canvas
					context.drawImage(imageData, box.x, box.y, box.width, box.height);
				}
			}, this, {
				'opaque': true
			});

		} else if (brush.type === wdi.SpiceBrushType.SPICE_BRUSH_TYPE_SOLID) {
			if (ropd === wdi.SpiceRopd.SPICE_ROPD_OP_PUT) { //no rop, direct draw
                if(context.fillStyle != brush.color.simple_html_color) {
                    context.fillStyle = brush.color.simple_html_color;
                }
				context.fillRect(box.x, box.y, box.width, box.height);

			} else { //if we need rop, we need intermediate canvas...
				//Creating brushImg to raster
				var tmp_canvas = wdi.graphics.getTmpCanvas(box.width, box.height);
				var tmp_context = tmp_canvas.getContext('2d');
				tmp_context.fillStyle = brush.color.html_color;
				tmp_context.fillRect(0, 0, box.width, box.height);
				var dest = wdi.graphics.getRect(box, context.canvas);
				imageData = wdi.RasterOperation.process(ropd, tmp_canvas, dest);

				//draw to screen, imageData is a canvas
				context.drawImage(imageData, box.x, box.y, box.width, box.height);
			}
		}
	},

    imageIsEntireColor: function(r,g,b, size, data) {
        var pos = 0;
        var equal;

        do {
            equal = data[pos] === r && data[pos+1] === g && data[pos+2] === b;
            pos+= 4;
        } while(pos != size && equal);

        return equal;
    },

	drawBackText: function(clientGui, context, text) {
		var back_brush = text.back_brush;
		var back_mode = text.back_mode;

		var box = wdi.graphics.getBoxFromSrcArea(text.base.box);

		this.setBrush(clientGui, context, back_brush, box, back_mode);
	},

	drawString: function(context, string, bpp, fore_brush, clip_type, display) {
		var color = fore_brush.color;
		var length = string.len;

		var render_pos, glyph_origin;
		var width;
		var height;
		var data;
		var lines;
		var imgData;
		var factor;
		var x;
		var y;
		var i;
		var buf, buf8, rawData;
		var bytesLeft;
		var bytesTotal;
		var subData;

		var rasterArray = string.raster_glyph;
		var currentRaster;

		var rawLine;
		var bitsLeft;
		var byteCounter;
		var alpha;
		var index;

		var box;


		if (bpp === 1) {
			factor = 255;
		} else if (bpp === 4) {
			factor = 17;
		} else {
			factor = 1;
		}

		for (i = 0; i < length; i++) {

			currentRaster = rasterArray[i];
			//Loop for each Glyph
			render_pos = currentRaster.render_pos;
			glyph_origin = currentRaster.glyph_origin;
			width = currentRaster.width;
			height = currentRaster.height;
			data = currentRaster.data;

			lines = height;

			buf = new ArrayBuffer(width * height * 4);
			buf8 = new Uint8ClampedArray(buf);
			rawData = new Uint32Array(buf);

			x = 0;
			y = 0;

			while (lines--) { //glyphline, not text line
				//Loop for each line
				bytesLeft = Math.ceil(width * bpp / 8);
				bytesTotal = bytesLeft;
				subData = [];

				while (bytesTotal--) {
					subData.push(data.pop());
				}

				while (bytesLeft--) {
					rawLine = subData.pop();
					bitsLeft = 8;
					byteCounter = 0;

					while (bitsLeft) {
						alpha = wdi.bppMask[bpp][byteCounter] & rawLine;
						if (bpp === 1 && alpha) {
							alpha = 1;
						} else if (bpp === 4 && alpha && alpha > 15) {
							alpha = alpha >> 4;
						}
						if (alpha) {
							index = (y * width + x);
							rawData[index] = factor * alpha << 24 | // alpha
							color.b << 16 | // blue
							color.g << 8 | // green
							color.r; // red
						}
						bitsLeft -= bpp;
						x++;
						byteCounter++;
					}
				}
				y++;
				x = 0;
			}

			box = {
				'x': render_pos.x + glyph_origin.x,
				'y': render_pos.y + glyph_origin.y - 1,
				'width': width,
				'height': height
			};

			imgData = new ImageData(buf8, width, height);
			var tmpCanvas = wdi.graphics.getImageFromData(imgData);
			display.drawClip(tmpCanvas, box, context);
			wdi.GlobalPool.discard('Canvas', tmpCanvas);

		}
	},

	getImgDataPosition: function(x, y, width) {
		var index = (y * width + x) * 4;
		return index;
	},

	//returns the shared canvas
	getTmpCanvas: function(width, height) {
		var canvas = this.tmpCanvas;
		canvas.width = width;
		canvas.height = height;
		return canvas;
	},

	//return always a new canvas
	getNewTmpCanvas: function(width, height) {
		//pool!
		var sourceCanvas = wdi.GlobalPool.create('Canvas');
		sourceCanvas.width = width;
		sourceCanvas.height = height;
		return sourceCanvas;
	}
}

wdi.Rop3 = {
	0x01: function(pat, src, dest) {
		return~ (pat | src | dest)
	},
	0x02: function(pat, src, dest) {
		return~ (pat | src) & dest
	},
	0x04: function(pat, src, dest) {
		return~ (pat | dest) & src
	},
	0x06: function(pat, src, dest) {
		return~ (~(src ^ dest) | pat)
	},
	0x07: function(pat, src, dest) {
		return~ ((src & dest) | pat)
	},
	0x08: function(pat, src, dest) {
		return~ pat & dest & src
	},
	0x09: function(pat, src, dest) {
		return~ ((src ^ dest) | pat)
	},
	0x0b: function(pat, src, dest) {
		return~ ((~dest & src) | pat)
	},
	0x0d: function(pat, src, dest) {
		return~ ((~src & dest) | pat)
	},
	0x0e: function(pat, src, dest) {
		return~ (~(src | dest) | pat)
	},
	0x10: function(pat, src, dest) {
		return~ (src | dest) & pat
	},
	0x12: function(pat, src, dest) {
		return~ (~(pat ^ dest) | src)
	},
	0x13: function(pat, src, dest) {
		return~ ((pat & dest) | src)
	},
	0x14: function(pat, src, dest) {
		return~ (~(pat ^ src) | dest)
	},
	0x15: function(pat, src, dest) {
		return~ ((pat & src) | dest)
	},
	0x16: function(pat, src, dest) {
		return (~(pat & src) & dest) ^ src ^ pat
	},
	0x17: function(pat, src, dest) {
		return~ (((src ^ dest) & (src ^ pat)) ^ src)
	},
	0x18: function(pat, src, dest) {
		return (src ^ pat) & (pat ^ dest)
	},
	0x19: function(pat, src, dest) {
		return~ ((~(pat & src) & dest) ^ src)
	},
	0x1a: function(pat, src, dest) {
		return ((pat & src) | dest) ^ pat
	},
	0x1b: function(pat, src, dest) {
		return~ (((pat ^ src) & dest) ^ src)
	},
	0x1c: function(pat, src, dest) {
		return ((pat & dest) | src) ^ pat
	},
	0x1d: function(pat, src, dest) {
		return~ (((pat ^ dest) & src) ^ dest)
	},
	0x1e: function(pat, src, dest) {
		return (dest | src) ^ pat
	},
	0x1f: function(pat, src, dest) {
		return~ ((src | dest) & pat)
	},
	0x20: function(pat, src, dest) {
		return~ src & pat & dest
	},
	0x21: function(pat, src, dest) {
		return~ ((pat ^ dest) | src)
	},
	0x23: function(pat, src, dest) {
		return~ ((~dest & pat) | src)
	},
	0x24: function(pat, src, dest) {
		return (src ^ pat) & (dest ^ src)
	},
	0x25: function(pat, src, dest) {
		return~ ((~(src & pat) & dest) ^ pat)
	},
	0x26: function(pat, src, dest) {
		return ((src & pat) | dest) ^ src
	},
	0x27: function(pat, src, dest) {
		return (~(src ^ pat) | dest) ^ src
	},
	0x28: function(pat, src, dest) {
		return (pat ^ src) & dest
	},
	0x29: function(pat, src, dest) {
		return~ (((src & pat) | dest) ^ src ^ pat)
	},
	0x2a: function(pat, src, dest) {
		return~ (src & pat) & dest
	},
	0x2b: function(pat, src, dest) {
		return~ (((pat ^ dest) & (src ^ pat)) ^ src)
	},
	0x2c: function(pat, src, dest) {
		return ((src | dest) & pat) ^ src
	},
	0x2d: function(pat, src, dest) {
		return (~dest | src) ^ pat
	},
	0x2e: function(pat, src, dest) {
		return ((pat ^ dest) | src) ^ pat
	},
	0x2f: function(pat, src, dest) {
		return~ ((~dest | src) & pat)
	},
	0x31: function(pat, src, dest) {
		return~ ((~pat & dest) | src)
	},
	0x32: function(pat, src, dest) {
		return (src | pat | dest) ^ src
	},
	0x34: function(pat, src, dest) {
		return ((src & dest) | pat) ^ src
	},
	0x35: function(pat, src, dest) {
		return (~(src ^ dest) | pat) ^ src
	},
	0x36: function(pat, src, dest) {
		return (pat | dest) ^ src
	},
	0x37: function(pat, src, dest) {
		return~ ((pat | dest) & src)
	},
	0x38: function(pat, src, dest) {
		return ((pat | dest) & src) ^ pat
	},
	0x39: function(pat, src, dest) {
		return (~dest | pat) ^ src
	},
	0x3a: function(pat, src, dest) {
		return ((src ^ dest) | pat) ^ src
	},
	0x3b: function(pat, src, dest) {
		return~ ((~dest | pat) & src)
	},
	0x3d: function(pat, src, dest) {
		return (~(src | dest) | pat) ^ src
	},
	0x3e: function(pat, src, dest) {
		return ((~src & dest) | pat) ^ src
	},
	0x40: function(pat, src, dest) {
		return~ dest & src & pat
	},
	0x41: function(pat, src, dest) {
		return~ ((src ^ pat) | dest)
	},
	0x42: function(pat, src, dest) {
		return (src ^ dest) & (pat ^ dest)
	},
	0x43: function(pat, src, dest) {
		return~ ((~(src & dest) & pat) ^ src)
	},
	0x45: function(pat, src, dest) {
		return~ ((~src & pat) | dest)
	},
	0x46: function(pat, src, dest) {
		return ((dest & pat) | src) ^ dest
	},
	0x47: function(pat, src, dest) {
		return~ (((pat ^ dest) & src) ^ pat)
	},
	0x48: function(pat, src, dest) {
		return (pat ^ dest) & src
	},
	0x49: function(pat, src, dest) {
		return~ (((dest & pat) | src) ^ dest ^ pat)
	},
	0x4a: function(pat, src, dest) {
		return ((dest | src) & pat) ^ dest
	},
	0x4b: function(pat, src, dest) {
		return (~src | dest) ^ pat
	},
	0x4c: function(pat, src, dest) {
		return~ (pat & dest) & src
	},
	0x4d: function(pat, src, dest) {
		return~ (((src ^ dest) | (src ^ pat)) ^ src)
	},
	0x4e: function(pat, src, dest) {
		return ((pat ^ src) | dest) ^ pat
	},
	0x4f: function(pat, src, dest) {
		return~ ((~src | dest) & pat)
	},
	0x51: function(pat, src, dest) {
		return~ ((~pat & src) | dest)
	},
	0x52: function(pat, src, dest) {
		return ((dest & src) | pat) ^ dest
	},
	0x53: function(pat, src, dest) {
		return~ (((src ^ dest) & pat) ^ src)
	},
	0x54: function(pat, src, dest) {
		return~ (~(src | pat) | dest)
	},
	0x56: function(pat, src, dest) {
		return (src | pat) ^ dest
	},
	0x57: function(pat, src, dest) {
		return~ ((src | pat) & dest)
	},
	0x58: function(pat, src, dest) {
		return ((pat | src) & dest) ^ pat
	},
	0x59: function(pat, src, dest) {
		return (~src | pat) ^ dest
	},
	0x5b: function(pat, src, dest) {
		return (~(dest | src) | pat) ^ dest
	},
	0x5c: function(pat, src, dest) {
		return ((dest ^ src) | pat) ^ dest
	},
	0x5d: function(pat, src, dest) {
		return~ ((~src | pat) & dest)
	},
	0x5e: function(pat, src, dest) {
		return ((~dest & src) | pat) ^ dest
	},
	0x60: function(pat, src, dest) {
		return (src ^ dest) & pat
	},
	0x61: function(pat, src, dest) {
		return~ (((src & dest) | pat) ^ src ^ dest)
	},
	0x62: function(pat, src, dest) {
		return ((dest | pat) & src) ^ dest
	},
	0x63: function(pat, src, dest) {
		return (~pat | dest) ^ src
	},
	0x64: function(pat, src, dest) {
		return ((src | pat) & dest) ^ src
	},
	0x65: function(pat, src, dest) {
		return (~pat | src) ^ dest
	},
	0x67: function(pat, src, dest) {
		return (~(src | pat) | dest) ^ src
	},
	0x68: function(pat, src, dest) {
		return~ ((~(src | dest) | pat) ^ src ^ dest)
	},
	0x69: function(pat, src, dest) {
		return~ (src ^ dest ^ pat)
	},
	0x6a: function(pat, src, dest) {
		return (src & pat) ^ dest
	},
	0x6b: function(pat, src, dest) {
		return~ (((src | pat) & dest) ^ src ^ pat)
	},
	0x6c: function(pat, src, dest) {
		return (pat & dest) ^ src
	},
	0x6d: function(pat, src, dest) {
		return~ (((dest | pat) & src) ^ dest ^ pat)
	},
	0x6e: function(pat, src, dest) {
		return ((~src | pat) & dest) ^ src
	},
	0x6f: function(pat, src, dest) {
		return~ (~(src ^ dest) & pat)
	},
	0x70: function(pat, src, dest) {
		return~ (src & dest) & pat
	},
	0x71: function(pat, src, dest) {
		return~ (((dest ^ pat) & (src ^ dest)) ^ src)
	},
	0x72: function(pat, src, dest) {
		return ((src ^ pat) | dest) ^ src
	},
	0x73: function(pat, src, dest) {
		return~ ((~pat | dest) & src)
	},
	0x74: function(pat, src, dest) {
		return ((dest ^ pat) | src) ^ dest
	},
	0x75: function(pat, src, dest) {
		return~ ((~pat | src) & dest)
	},
	0x76: function(pat, src, dest) {
		return ((~src & pat) | dest) ^ src
	},
	0x78: function(pat, src, dest) {
		return (src & dest) ^ pat
	},
	0x79: function(pat, src, dest) {
		return~ (((src | dest) & pat) ^ src ^ dest)
	},
	0x7a: function(pat, src, dest) {
		return ((~dest | src) & pat) ^ dest
	},
	0x7b: function(pat, src, dest) {
		return~ (~(pat ^ dest) & src)
	},
	0x7c: function(pat, src, dest) {
		return ((~src | dest) & pat) ^ src
	},
	0x7d: function(pat, src, dest) {
		return~ (~(src ^ pat) & dest)
	},
	0x7e: function(pat, src, dest) {
		return (src ^ dest) | (pat ^ src)
	},
	0x7f: function(pat, src, dest) {
		return~ (src & pat & dest)
	},
	0x80: function(pat, src, dest) {
		return src & pat & dest
	},
	0x81: function(pat, src, dest) {
		return~ ((src ^ dest) | (pat ^ src))
	},
	0x82: function(pat, src, dest) {
		return~ (src ^ pat) & dest
	},
	0x83: function(pat, src, dest) {
		return~ (((~src | dest) & pat) ^ src)
	},
	0x84: function(pat, src, dest) {
		return~ (pat ^ dest) & src
	},
	0x85: function(pat, src, dest) {
		return~ (((~pat | src) & dest) ^ pat)
	},
	0x86: function(pat, src, dest) {
		return ((src | dest) & pat) ^ src ^ dest
	},
	0x87: function(pat, src, dest) {
		return~ ((src & dest) ^ pat)
	},
	0x89: function(pat, src, dest) {
		return~ (((~src & pat) | dest) ^ src)
	},
	0x8a: function(pat, src, dest) {
		return (~pat | src) & dest
	},
	0x8b: function(pat, src, dest) {
		return~ (((dest ^ pat) | src) ^ dest)
	},
	0x8c: function(pat, src, dest) {
		return (~pat | dest) & src
	},
	0x8d: function(pat, src, dest) {
		return~ (((src ^ pat) | dest) ^ src)
	},
	0x8e: function(pat, src, dest) {
		return ((dest ^ pat) & (dest ^ src)) ^ src
	},
	0x8f: function(pat, src, dest) {
		return~ (~(src & dest) & pat)
	},
	0x90: function(pat, src, dest) {
		return~ (src ^ dest) & pat
	},
	0x91: function(pat, src, dest) {
		return~ (((~src | pat) & dest) ^ src)
	},
	0x92: function(pat, src, dest) {
		return ((pat | dest) & src) ^ pat ^ dest
	},
	0x93: function(pat, src, dest) {
		return~ ((dest & pat) ^ src)
	},
	0x94: function(pat, src, dest) {
		return ((src | pat) & dest) ^ src ^ pat
	},
	0x95: function(pat, src, dest) {
		return~ ((src & pat) ^ dest)
	},
	0x96: function(pat, src, dest) {
		return src ^ pat ^ dest
	},
	0x97: function(pat, src, dest) {
		return (~(src | pat) | dest) ^ src ^ pat
	},
	0x98: function(pat, src, dest) {
		return~ ((~(src | pat) | dest) ^ src)
	},
	0x9a: function(pat, src, dest) {
		return (~src & pat) ^ dest
	},
	0x9b: function(pat, src, dest) {
		return~ (((src | pat) & dest) ^ src)
	},
	0x9c: function(pat, src, dest) {
		return (~dest & pat) ^ src
	},
	0x9d: function(pat, src, dest) {
		return~ (((dest | pat) & src) ^ dest)
	},
	0x9e: function(pat, src, dest) {
		return ((src & dest) | pat) ^ src ^ dest
	},
	0x9f: function(pat, src, dest) {
		return~ ((src ^ dest) & pat)
	},
	0xa1: function(pat, src, dest) {
		return~ (((~pat & src) | dest) ^ pat)
	},
	0xa2: function(pat, src, dest) {
		return (~src | pat) & dest
	},
	0xa3: function(pat, src, dest) {
		return~ (((dest ^ src) | pat) ^ dest)
	},
	0xa4: function(pat, src, dest) {
		return~ ((~(pat | src) | dest) ^ pat)
	},
	0xa6: function(pat, src, dest) {
		return (~pat & src) ^ dest
	},
	0xa7: function(pat, src, dest) {
		return~ (((pat | src) & dest) ^ pat)
	},
	0xa8: function(pat, src, dest) {
		return (src | pat) & dest
	},
	0xa9: function(pat, src, dest) {
		return~ ((src | pat) ^ dest)
	},
	0xab: function(pat, src, dest) {
		return~ (src | pat) | dest
	},
	0xac: function(pat, src, dest) {
		return ((src ^ dest) & pat) ^ src
	},
	0xad: function(pat, src, dest) {
		return~ (((dest & src) | pat) ^ dest)
	},
	0xae: function(pat, src, dest) {
		return (~pat & src) | dest
	},
	0xb0: function(pat, src, dest) {
		return (~src | dest) & pat
	},
	0xb1: function(pat, src, dest) {
		return~ (((pat ^ src) | dest) ^ pat)
	},
	0xb2: function(pat, src, dest) {
		return ((src ^ dest) | (pat ^ src)) ^ src
	},
	0xb3: function(pat, src, dest) {
		return~ (~(pat & dest) & src)
	},
	0xb4: function(pat, src, dest) {
		return (~dest & src) ^ pat
	},
	0xb5: function(pat, src, dest) {
		return~ (((dest | src) & pat) ^ dest)
	},
	0xb6: function(pat, src, dest) {
		return ((pat & dest) | src) ^ pat ^ dest
	},
	0xb7: function(pat, src, dest) {
		return~ ((pat ^ dest) & src)
	},
	0xb8: function(pat, src, dest) {
		return ((dest ^ pat) & src) ^ pat
	},
	0xb9: function(pat, src, dest) {
		return~ (((dest & pat) | src) ^ dest)
	},
	0xba: function(pat, src, dest) {
		return (~src & pat) | dest
	},
	0xbc: function(pat, src, dest) {
		return (~(src & dest) & pat) ^ src
	},
	0xbd: function(pat, src, dest) {
		return~ ((dest ^ pat) & (dest ^ src))
	},
	0xbe: function(pat, src, dest) {
		return (src ^ pat) | dest
	},
	0xbf: function(pat, src, dest) {
		return~ (src & pat) | dest
	},
	0xc1: function(pat, src, dest) {
		return~ (((~src & dest) | pat) ^ src)
	},
	0xc2: function(pat, src, dest) {
		return~ ((~(src | dest) | pat) ^ src)
	},
	0xc4: function(pat, src, dest) {
		return (~dest | pat) & src
	},
	0xc5: function(pat, src, dest) {
		return~ (((src ^ dest) | pat) ^ src)
	},
	0xc6: function(pat, src, dest) {
		return (~pat & dest) ^ src
	},
	0xc7: function(pat, src, dest) {
		return~ (((pat | dest) & src) ^ pat)
	},
	0xc8: function(pat, src, dest) {
		return (pat | dest) & src
	},
	0xc9: function(pat, src, dest) {
		return~ ((dest | pat) ^ src)
	},
	0xca: function(pat, src, dest) {
		return ((dest ^ src) & pat) ^ dest
	},
	0xcb: function(pat, src, dest) {
		return~ (((src & dest) | pat) ^ src)
	},
	0xcd: function(pat, src, dest) {
		return~ (pat | dest) | src
	},
	0xce: function(pat, src, dest) {
		return (~pat & dest) | src
	},
	0xd0: function(pat, src, dest) {
		return (~dest | src) & pat
	},
	0xd1: function(pat, src, dest) {
		return~ (((pat ^ dest) | src) ^ pat)
	},
	0xd2: function(pat, src, dest) {
		return (~src & dest) ^ pat
	},
	0xd3: function(pat, src, dest) {
		return~ (((src | dest) & pat) ^ src)
	},
	0xd4: function(pat, src, dest) {
		return ((dest ^ pat) & (pat ^ src)) ^ src
	},
	0xd5: function(pat, src, dest) {
		return~ (~(src & pat) & dest)
	},
	0xd6: function(pat, src, dest) {
		return ((src & pat) | dest) ^ src ^ pat
	},
	0xd7: function(pat, src, dest) {
		return~ ((src ^ pat) & dest)
	},
	0xd8: function(pat, src, dest) {
		return ((pat ^ src) & dest) ^ pat
	},
	0xd9: function(pat, src, dest) {
		return~ (((src & pat) | dest) ^ src)
	},
	0xda: function(pat, src, dest) {
		return (~(dest & src) & pat) ^ dest
	},
	0xdb: function(pat, src, dest) {
		return~ ((src ^ dest) & (pat ^ src))
	},
	0xdc: function(pat, src, dest) {
		return (~dest & pat) | src
	},
	0xde: function(pat, src, dest) {
		return (pat ^ dest) | src
	},
	0xdf: function(pat, src, dest) {
		return~ (pat & dest) | src
	},
	0xe0: function(pat, src, dest) {
		return (src | dest) & pat
	},
	0xe1: function(pat, src, dest) {
		return~ ((src | dest) ^ pat)
	},
	0xe2: function(pat, src, dest) {
		return ((dest ^ pat) & src) ^ dest
	},
	0xe3: function(pat, src, dest) {
		return~ (((pat & dest) | src) ^ pat)
	},
	0xe4: function(pat, src, dest) {
		return ((src ^ pat) & dest) ^ src
	},
	0xe5: function(pat, src, dest) {
		return~ (((pat & src) | dest) ^ pat)
	},
	0xe6: function(pat, src, dest) {
		return (~(src & pat) & dest) ^ src
	},
	0xe7: function(pat, src, dest) {
		return~ ((dest ^ pat) & (pat ^ src))
	},
	0xe8: function(pat, src, dest) {
		return ((src ^ dest) & (pat ^ src)) ^ src
	},
	0xe9: function(pat, src, dest) {
		return~ ((~(src & dest) & pat) ^ src ^ dest)
	},
	0xea: function(pat, src, dest) {
		return (src & pat) | dest
	},
	0xeb: function(pat, src, dest) {
		return~ (src ^ pat) | dest
	},
	0xec: function(pat, src, dest) {
		return (pat & dest) | src
	},
	0xed: function(pat, src, dest) {
		return~ (pat ^ dest) | src
	},
	0xef: function(pat, src, dest) {
		return~ pat | dest | src
	},
	0xf1: function(pat, src, dest) {
		return~ (src | dest) | pat
	},
	0xf2: function(pat, src, dest) {
		return (~src & dest) | pat
	},
	0xf4: function(pat, src, dest) {
		return (~dest & src) | pat
	},
	0xf6: function(pat, src, dest) {
		return (src ^ dest) | pat
	},
	0xf7: function(pat, src, dest) {
		return~ (src & dest) | pat
	},
	0xf8: function(pat, src, dest) {
		return (src & dest) | pat
	},
	0xf9: function(pat, src, dest) {
		return~ (src ^ dest) | pat
	},
	0xfb: function(pat, src, dest) {
		return~ src | pat | dest
	},
	0xfd: function(pat, src, dest) {
		return~ dest | src | pat
	},
	0xfe: function(pat, src, dest) {
		return src | pat | dest
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

Uint8Array.prototype.toJSArray = function() {
    if(this.length == 1) {
        return [this[0]];
    }

    var len = this.length;
    var arr = new Array(len);

    for(var i=0;i<len;i++) {
        arr[i] = this[i];
    }
    return arr;
}

wdi.FixedQueue = $.spcExtend(wdi.DomainObject, {
	q: null,
	size: 1024*1024*10,
    grow: 1024*1024*10,
	woffset: 0,
    roffset: 0,

	init: function(c) {
		this.q = new Uint8Array(this.size);
	},

    setData: function(q) {
        this.woffset = q.length;
        this.roffset = 0;
        this.q.set(q);
    },

	shift: function(elements) {
        if(this.roffset + elements > this.woffset) {
            throw "errq";
        }
        var toreturn = this.q.subarray(this.roffset, this.roffset + elements);
        this.roffset = this.roffset + elements;
        if(this.woffset == this.roffset) {
            this.woffset = 0;
            this.roffset = 0;
        }
		return toreturn;
	},

	push: function(collection) {
        if(this.woffset + collection.byteLength > this.size) {
            //we need to make the queue bigger...
            var oldq = this.q;
            this.size += this.grow;
            this.q = new Uint8Array(this.size);
            this.q.set(oldq);
        }
        this.q.set(collection, this.woffset);
        this.woffset += collection.byteLength;
	},

	getLength: function() {
		return this.woffset-this.roffset;
	}
});


wdi.Queue = $.spcExtend(wdi.DomainObject, {
	q: null,
    raw: false,
	
	init: function(c) {
        if(c.raw) {
            this.raw = c.raw;
        }
		this.q = new Uint8Array(0);
	},
	
	getData: function() {
		return this.toJSArray(this.q);
	},
	
	setData: function(q) {
        this.q = new Uint8Array(q.length);
		this.q.set(q);
	},
	
	shift: function() {
		var elements = arguments[0] || this.getLength();

		if (elements === this.q.length) {
			var toreturn = this.q;
			this.q = new Uint8Array(0);
		} else {
			var toreturn = this.q.subarray(0, elements);
			this.q = this.q.subarray(elements);
		}

        return this.toJSArray(toreturn)
	},
	
	peek: function(begin, end) {
        var tmp = null;
        if(begin == 0 && !end) {
            tmp = this.q; //read the entire queue
        } else {
            tmp = this.q.subarray(begin, end);
        }
		return this.toJSArray(tmp);
	},
	
	push: function(collection) {
		if (typeof collection == 'string') {
            var len = collection.length;
            var newq = new Uint8Array(this.q.length+len);
            newq.set(this.q);
            for(var i=0;i<len;i++) {
                newq[i+this.q.length] = collection[i];
            }
            this.q = newq;
		} else {
			if(this.getLength() === 0) {
				this.q = new Uint8Array(collection.length);
                this.q.set(collection);
			} else {
                var newq = new Uint8Array(collection.length+this.q.length);
                newq.set(this.q);
                newq.set(collection, this.q.length);
				this.q = newq;
			}
		}
	},
	
	getLength: function() {
		return this.q.length;
	},

    toJSArray: function(data) {
        if(this.raw) {
            return data;
        }

        return data.toJSArray();
    }
});

wdi.ViewQueue = $.spcExtend(wdi.DomainObject, {
	q: null,
	at: null,
	
	init: function() {
		this.q = new Uint8Array();
		this.at = 0;
	},
	
	getData: function() {
		return this.toJSArray(this.q.subarray(this.at));
	},

    getDataOffset: function(pos) {
   		return this.toJSArray(this.q.subarray(pos));
   	},

    getRawData: function() {
   		return this.q.subarray(this.at);
   	},

    getRawDataOffset: function(pos) {
        return this.q.subarray(pos);
    },
	
	setData: function(q) {
		this.q = new Uint8Array(q.length);
        this.q.set(q);
		this.at = 0;
	},
	
	shift: function(length) {
		var elements = length || this.getLength();
		if(elements > this.getLength()) {
			elements = this.getLength();
		}
		var ret = this.q.subarray(0+this.at, elements+this.at);
		this.at += elements;
		return this.toJSArray(ret);
	},

    eatBytes: function(bytes) {
        this.at += bytes;
    },

    getByte: function(pos) {
        return this.q[pos+this.at];
    },
	
	peek: function(begin, end) {
        var tmp = null;
        if(begin == 0 && !end) {
            tmp = this.q; //read the entire queue
        } else {
            if(end) {
                end += this.at;
            }
            tmp = this.q.subarray(begin+this.at, end);
        }
		return this.toJSArray(tmp);
	},
	
    push: function(collection) {
   		if (typeof collection == 'string') {
               var len = collection.length;
               var newq = new Uint8Array(this.q.length+len);
               newq.set(this.q);
               for(var i=0;i<len;i++) {
                   newq[i+this.q.length] = collection[i];
               }
               this.q = newq;
   		} else {
   			if(this.getLength() === 0) {
   				this.q = new Uint8Array(collection.length);
                   this.q.set(collection);
   			} else {
               var newq = new Uint8Array(collection.length+this.q.length);
               newq.set(this.q);
               newq.set(collection, this.q.length);
   				this.q = newq;
   			}
   		}
   	},
	
	getLength: function() {
		return this.q.length-this.at;
	},

	getPosition: function() {
		return this.at;
	},
    toJSArray: function(data) {
        if(data.length == 1) {
            return [data[0]];
        }
        return data.toJSArray();
    }
});


/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.StuckKeysHandler = $.spcExtend(wdi.EventObject.prototype, {
	ctrlTimeoutId: null,
	altTimeoutId: null,
	shiftTimeoutId: null,
	shiftKeyPressed: false,
	ctrlKeyPressed: false,
	altKeyPressed: false,

	dispose: function () {
		
		clearTimeout(this.ctrlTimeoutId);
		clearTimeout(this.altTimeoutId);
		clearTimeout(this.shiftTimeoutId);
		this.ctrlTimeoutId = null;
		this.altTimeoutId = null;
		this.shiftTimeoutId = null;
		this.shiftKeyPressed = false;
		this.ctrlKeyPressed = false;
		this.altKeyPressed = false;
	},

	handleStuckKeys: function (jqueryEvent) {
		if (jqueryEvent) {
			switch (jqueryEvent.keyCode) {
				case 16:
					this._handleKey('shiftTimeoutId', jqueryEvent.type, 16);
					break;
				case 17:
					this._handleKey('ctrlTimeoutId', jqueryEvent.type, 17);
					break;
				case 18:
					this._handleKey('altTimeoutId', jqueryEvent.type, 18);
					break;
			}
		}
	},

	releaseAllKeys: function releaseAllKeys () {
		var e;
		var i;
		for (i = 0; i < 300; i++) {
			this.releaseKeyPressed(i);
		}
	},

	_handleKey: function (variable, type, keyCode) {
		if (type === 'keydown') {
			this[variable] = this._configureTimeout(keyCode);
		} else if (type === 'keyup') {
			clearTimeout(this[variable]);
		}
	},

	_configureTimeout: function (keyCode) {
		var self = this;
		return setTimeout(function keyPressedTimeout () {
			// added the 'window' for the jQuery call for testing.
			self.releaseKeyPressed(keyCode);
		}, wdi.StuckKeysHandler.defaultTimeout);
	},

	releaseKeyPressed: function (keyCode) {
		var e = window.jQuery.Event("keyup");
		e["which"] = keyCode;
		e["keyCode"] = keyCode;
		e["charCode"] = 0;
		e["generated"] = true;
		this.fire('inputStuck', ['keyup', [e]]);
	},

	checkSpecialKey: function (event, keyCode) {
		switch (keyCode) {
			case 16:
				this.shiftKeyPressed = event === 'keydown';
				break;
			case 17:
				this.ctrlKeyPressed = event === 'keydown';
				break;
			case 18:
				this.altKeyPressed = event === 'keydown';
				break;
		}
	},

	releaseSpecialKeysPressed: function () {
		if (this.shiftKeyPressed) {
			this.releaseKeyPressed(16);
			this.shiftKeyPressed = false;
		}
		if (this.ctrlKeyPressed) {
			this.releaseKeyPressed(17);
			this.ctrlKeyPressed = false;
		}
		if (this.altKeyPressed) {
			this.releaseKeyPressed(18);
			this.altKeyPressed = false;
		}
	}


});

wdi.StuckKeysHandler.defaultTimeout = 2000;

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.TimeLapseDetector = $.spcExtend(wdi.EventObject.prototype, {
	lastTime: null,

	init: function timeLapseDetector_Init (c) {
		this.superInit();
	},

	dispose: function() {
		this.lastTime = null;
	},

	startTimer: function timeLapseDetector_startTimer () {
		var self = this;
		this.lastTime = Date.now();

		window.setInterval(
			function timeLapseDetectorInterval () {
				var now = Date.now();
				// this.constructor == access to the class itself, so you
				// can access to static properties without writing/knowing
				// the class name
				var elapsed = now - self.lastTime;
				if (elapsed >= self.constructor.maxIntervalAllowed) {
					self.fire('timeLapseDetected', elapsed);
				}
				self.lastTime = now;
			},
			wdi.TimeLapseDetector.defaultInterval
		);
	},

	getLastTime: function timeLapseDetector_getLastTime () {
		return this.lastTime;
	},

	setLastTime: function timeLapseDetector_setLastTime (lastTime) {
		this.lastTime = lastTime;
		return this;
	}
});

wdi.TimeLapseDetector.defaultInterval = 5000;
wdi.TimeLapseDetector.maxIntervalAllowed = wdi.TimeLapseDetector.defaultInterval * 3;

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.DisplayRouter = $.spcExtend(wdi.EventObject.prototype, {

	init: function(c) {
		this.time = Date.now();
		this.clientGui = c.clientGui;
		this.rasterEngine = c.rasterEngine || new wdi.RasterEngine({clientGui: this.clientGui});
		if(c.routeList) {
			this.routeList = c.routeList;
		} else {
			this._initRoutes();
		}

	},

	dispose: function () {
		this.rasterEngine.dispose();
		this.clientGui = null;
		this.rasterEngine = null;
		this.routeList = null;
	},

	_initRoutes: function() {
		
		this.routeList = {};
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_CREATE] = this.rasterEngine.drawCanvas;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_DESTROY] = this.rasterEngine.removeCanvas;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_COPY] = this.rasterEngine.drawImage;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL] = this.rasterEngine.drawFill;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND] = this.rasterEngine.drawAlphaBlend;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_WHITENESS] = this.rasterEngine.drawWhiteness;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLACKNESS] = this.rasterEngine.drawBlackness;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TRANSPARENT] = this.rasterEngine.drawTransparent;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_COPY_BITS] = this.rasterEngine.drawCopyBits;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TEXT] = this.rasterEngine.drawText;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_STROKE] = this.rasterEngine.drawStroke;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ROP3] = this.rasterEngine.drawRop3;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_INVERS] = this.rasterEngine.drawInvers;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CREATE] = this.rasterEngine.handleStreamCreate;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DESTROY] = this.rasterEngine.handleStreamDestroy;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DATA] = this.rasterEngine.handleStreamData;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CLIP] = this.rasterEngine.handleStreamClip;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLEND] = this.rasterEngine.drawBlend;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_LIST] = this.rasterEngine.invalList;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_ALL_PALETTES] = this.rasterEngine.invalPalettes;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_MARK] = false;
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_RESET] = false;
	},

	processPacket: function(spiceMessage) {
		//filter out empty messages
		if(!spiceMessage) {
			
			return;
		}

		var route = this.routeList[spiceMessage.messageType];
		if (route) {
			route.call(this.rasterEngine, spiceMessage);
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.RasterEngine = $.spcExtend(wdi.EventObject.prototype, {
	init: function(c) {
		this.time = Date.now();
		this.clientGui = c.clientGui;
	},

	dispose: function () {
		this.clientGui = null;
	},

	drawCanvas: function(spiceMessage) {
		
		return this.clientGui.drawCanvas(spiceMessage);
	},

	removeCanvas: function(spiceMessage) {
		return this.clientGui.removeCanvas(spiceMessage);
	},

	invalList: function(spiceMessage) {
		var items = spiceMessage.args.items;
		var item = null;
		for(var i in items) {
			item = items[i];
			wdi.ImageCache.delImage(item.id);
		}
	},

	handleStreamCreate: function(spiceMessage) {
		var stream = spiceMessage.args;
		stream.computedBox = wdi.graphics.getBoxFromSrcArea(stream.rect);
		wdi.Stream.addStream(spiceMessage.args.id, stream);
	},

	handleStreamData: function(spiceMessage) {
		var imageData = spiceMessage.args.data; //jpeg string encoded
		var stream = wdi.Stream.getStream(spiceMessage.args.id); //recover the stream
		var context = this.clientGui.getContext(stream.surface_id);
		var img = wdi.GlobalPool.create('Image'); //auto-release pool
		wdi.ExecutionControl.sync = true;
		var url;
		img.onload = function() {
			URL.revokeObjectURL(url);
			var box = stream.computedBox;
			// we only rotate the stream if spice tells us so through the TOP_DOWN flag mask
			if (!stream.flags & wdi.SpiceStreamFlags.SPICE_STREAM_FLAGS_TOP_DOWN) {
				var offsetX = box.x + (this.width/2);
				var offsetY = box.y + (this.height/2);
				context.save();
				context.translate(offsetX, offsetY);
				context.rotate(Math.PI);
				context.scale(-1,1);
				context.drawImage(this, box.x-offsetX, box.y-offsetY, box.width, box.height);
				context.restore();
			} else {
				context.drawImage(this, box.x, box.y, box.width, box.height);
			}
		};

		img.onerror = function() {
			URL.revokeObjectURL(url)
		};

		url = wdi.SpiceObject.bytesToURI(imageData);
		img.src = url;
	},

	handleStreamClip: function(spiceMessage) {
		wdi.Stream.clip(spiceMessage.args.id, spiceMessage.args.clip)
	},

	handleStreamDestroy: function(spiceMessage) {
		wdi.Stream.deleteStream(spiceMessage.args.id);
	},

	drawRop3: function(spiceMessage) {
		var box = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.base.box);
		var context = this.clientGui.getContext(spiceMessage.args.base.surface_id);
		var destImg = context.getImageData(box.x, box.y, box.width, box.height);
		var clientGui = this.clientGui;

		var brush = spiceMessage.args.brush;
		var rop = spiceMessage.args.rop_descriptor;

		var srcArea = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.src_area);
		wdi.graphics.getImageFromSpice(spiceMessage.args.src_image.imageDescriptor, spiceMessage.args.src_image.data, this.clientGui, function (sourceCanvas) {
			if (sourceCanvas) {
				//Get source image data (image coming from the packet)
				var sourceContext = sourceCanvas.getContext('2d');
				var srcImg = sourceContext.getImageData(srcArea.x, srcArea.y, srcArea.width, srcArea.height);
				var srcImgData = srcImg.data; //this

				//Get pattern image data
				//brush
				var tmpcanvas = wdi.graphics.getNewTmpCanvas(box.width, box.height);
				var tmpcontext = tmpcanvas.getContext('2d');
				var brushBox = {
					width: box.width,
					height: box.height,
					x: 0,
					y: 0
				};
				wdi.graphics.setBrush(clientGui, tmpcontext, brush, brushBox, wdi.SpiceRopd.SPICE_ROPD_OP_PUT);//Without alpha?
				var pattern = tmpcontext.getImageData(0, 0, box.width, box.height);
				var patImgData = pattern.data; //this

				//Get dest image data
				var destImgData = destImg.data;

				//Get result image data
				tmpcanvas = wdi.graphics.getNewTmpCanvas(box.width, box.height);
				tmpcontext = tmpcanvas.getContext('2d');
				var result = tmpcontext.createImageData(box.width, box.height);
				var resultData = result.data;

				if ((srcImg.width != pattern.width || srcImg.width != destImg.width) || (srcImg.height != pattern.height || srcImg.height != destImg.height)) {
					//TODO: resize
				}

				//Do the Ternary Raster Operation
				var length = destImgData.length;//Could be anyone
				var func = wdi.Rop3[rop];
				for (var i = 0;i<length;i+=4) {
					resultData[i] = func(patImgData[i], srcImgData[i], destImgData[i]) & 255;
					resultData[i+1] = func(patImgData[i+1], srcImgData[i+1], destImgData[i+1]) & 255;
					resultData[i+2] = func(patImgData[i+2], srcImgData[i+2], destImgData[i+2]) & 255;
					resultData[i+3] = 255;
				}

				tmpcontext.putImageData(result, 0, 0);

				this.drawClip(tmpcanvas, box, context);
			} else {
				
			}
		}, this);
	},

	drawInvers: function(spiceMessage) {
		var drawBase = spiceMessage.args.base;
		var box = wdi.graphics.getBoxFromSrcArea(drawBase.box);

		var surface_id = drawBase.surface_id;

		var context = this.clientGui.getContext(surface_id);

		var destImg = wdi.graphics.getRect(box, context.canvas);
		var imageData = wdi.RasterOperation.process(wdi.SpiceRopd.SPICE_ROPD_OP_INVERS, null, destImg);//this operation modifies destination

		context.drawImage(imageData, box.x, box.y, box.width, box.height);
	},

	drawStroke: function(spiceMessage) {
		var stroke = spiceMessage.args,
			context = this.clientGui.getContext(spiceMessage.args.base.surface_id),
			color = stroke.brush.color.html_color,
			lineWidth = 1,
			pointsLength,
			firstPoint,
			i,
			j,
			length = stroke.path.num_segments,
			seg;

		if (stroke.attr.flags & wdi.SpiceLineFlags.SPICE_LINE_FLAGS_STYLED) {
			
		}

		for (var i = 0;i < length; i++) {
			seg = stroke.path.segments[i];

			if (seg.flags & wdi.SpicePathFlags.SPICE_PATH_BEGIN) {
				context.beginPath();
				context.moveTo(seg.points[0].x, seg.points[0].y);
				context.strokeStyle = color;
				context.lineWidth = lineWidth;
			}
			if (seg.flags & wdi.SpicePathFlags.SPICE_PATH_BEZIER) {
				pointsLength = seg.points.length;
				if (pointsLength % 3 == 0) {
					for (j = 0; j < pointsLength; j += 3) {
						context.bezierCurveTo(
							seg.points[j].x, seg.points[j].y,
							seg.points[j+1].x, seg.points[j+1].y,
							seg.points[j+2].x, seg.points[j+2].y
						);
					}
				}
			} else {
				pointsLength = seg.points.length;

				for (j = 0; j < pointsLength; j++) {
					if (j == 0) firstPoint = seg.points[j];
					context.lineTo(seg.points[j].x + (lineWidth / 2), seg.points[j].y + (lineWidth / 2));
				}
			}
			if (seg.flags & wdi.SpicePathFlags.SPICE_PATH_END) {
				if (seg.flags & wdi.SpicePathFlags.SPICE_PATH_CLOSE) {
					context.lineTo(firstPoint.x + (lineWidth / 2), firstPoint.y + (lineWidth / 2));
				}
				context.stroke();
				context.closePath();
			}
		}
	},

	drawImage: function(spiceMessage) {
		var args = spiceMessage.args;
		var drawBase = args.base;
		var surface_id = drawBase.surface_id;
		var rop = args.rop_descriptor;

		var scale = args.scale_mode;


		//calculate src_area box
		var box_origin = wdi.graphics.getBoxFromSrcArea(args.src_area);

		var box_dest = wdi.graphics.getBoxFromSrcArea(drawBase.box);

		if (window.vdiLoadTest && window.firstImage === undefined) {
			window.firstImage = true;
		}

		//get the image in imagedata format
		wdi.graphics.getImageFromSpice(args.image.imageDescriptor, args.image.data, this.clientGui, function(srcImg) {
			//we have image?
			if(srcImg) {
				if (window.firstImage) {
					var data;
					if(srcImg.getContext) {
						data = srcImg.getContext('2d').getImageData(0, 0, srcImg.width, srcImg.height).data.buffer.slice(0)
					} else {
						data = srcImg.data.buffer.slice(0);
					}
					window.firstImageData = data;
					window.firstImage = false;
				}

				var rectangle = false;

				if(box_origin.width !== box_dest.width && box_origin.height !== box_dest.height) {
					rectangle = true;
					srcImg = wdi.graphics.getRect(box_origin, srcImg);
					srcImg = wdi.graphics.getImageFromData(srcImg);
					var newSrcImg = wdi.graphics.getNewTmpCanvas(box_dest.width, box_dest.height);
					var tmpcontext = newSrcImg.getContext('2d');
					tmpcontext.drawImage(srcImg, 0, 0, box_origin.width, box_origin.height, 0, 0, box_dest.width, box_dest.height);
					srcImg = newSrcImg;
				}

				//depending on the rop, we can avoid to get destImg
				if (rop !== wdi.SpiceRopd.SPICE_ROPD_OP_PUT) {
					//rop
					if(!rectangle) {
						srcImg = wdi.graphics.getRect(box_origin, srcImg);
					}
					var destImg = wdi.graphics.getRect(box_dest, this.clientGui.getCanvas(surface_id));
					srcImg = wdi.RasterOperation.process(rop, srcImg, destImg);
				}

				var context = this.clientGui.getContext(surface_id);

				if(srcImg instanceof ImageData) {
					if(rectangle) { //a subrectangle has been created, use it
						context.putImageData(srcImg, box_dest.x, box_dest.y, 0, 0, box_dest.width, box_dest.height);
					} else {
						context.putImageData(srcImg, box_dest.x, box_dest.y, box_origin.x, box_origin.y, box_origin.width, box_origin.height);
					}
				} else {
					if(rectangle) {
						context.drawImage(srcImg, box_dest.x, box_dest.y, box_dest.width, box_dest.height);
					} else {
						context.drawImage(srcImg, box_origin.x, box_origin.y, box_origin.width, box_origin.height, box_dest.x, box_dest.y, box_dest.width, box_dest.height);
					}
				}

			} else {
				//failed to get image, cache error?
				
			}
		}, this, {'opaque':true, 'brush': args.brush, 'raw': false});
	},

	drawClip: function(srcImg, box, context) {
		context.drawImage(srcImg, box.x, box.y, box.width, box.height);
	},

	drawFill: function(spiceMessage) {
		var args = spiceMessage.args;
		var context = this.clientGui.getContext(args.base.surface_id);
		var box = wdi.graphics.getBoxFromSrcArea(args.base.box);
		var brush = args.brush;
		var ropd = args.rop_descriptor;

		wdi.graphics.setBrush(this.clientGui, context, brush, box, ropd);
	},

	drawCopyBits: function(spiceMessage) {
		var drawBase = spiceMessage.args.base;
		var surface_id = drawBase.surface_id;
		var src_position = spiceMessage.args.src_position;
		var context = this.clientGui.getContext(surface_id);
		var box = drawBase.box;

		var width = box.right - box.left;
		var height = box.bottom - box.top;

		context.drawImage(context.canvas, src_position.x, src_position.y, width,
			height, drawBase.box.left, drawBase.box.top, width, height);
	},

	drawBlend: function(spiceMessage) {
		//TODO: alpha_flags
		//TODO: resize
		var descriptor = spiceMessage.args.image.imageDescriptor;
		var drawBase = spiceMessage.args.base;
		var imgData = spiceMessage.args.image.data;
		var surface_id = spiceMessage.args.base.surface_id;
		var rop_desc = spiceMessage.args.rop_descriptor;
		var flags = spiceMessage.args.flags;

		wdi.graphics.getImageFromSpice(descriptor, imgData, this.clientGui, function(srcImg) {
			if (!srcImg) {
				
				return;
			}

			//get box from src area
			var box = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.src_area);

			//adapt to src_area
			srcImg = wdi.graphics.getRect(box, srcImg);

			//destination box
			var dest_box = wdi.graphics.getBoxFromSrcArea(drawBase.box);
			var destImg = wdi.graphics.getRect(dest_box, this.clientGui.getCanvas(surface_id));

			var result = wdi.RasterOperation.process(rop_desc, srcImg, destImg);

			this.clientGui.getCanvas(surface_id).getContext('2d').drawImage(result, dest_box.x, dest_box.y, dest_box.width, dest_box.height);
		}, this);
	},

	drawAlphaBlend: function(spiceMessage) {

		//TODO: alpha_flags
		//TODO: resize

		var descriptor = spiceMessage.args.image.imageDescriptor;
		var drawBase = spiceMessage.args.base;
		var imgData = spiceMessage.args.image.data;
		var surface_id = spiceMessage.args.base.surface_id;
		var flags = spiceMessage.args.alpha_flags;
		var alpha = spiceMessage.args.alpha;

		wdi.graphics.getImageFromSpice(descriptor, imgData, this.clientGui, function(srcImg) {
			if (!srcImg) {
				
			}

			var box = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.src_area);

			//adapt to src_area
			srcImg = wdi.graphics.getRect(box, srcImg);


			//destination box
			var box_dest = wdi.graphics.getBoxFromSrcArea(drawBase.box);
			var destImg = wdi.graphics.getRect(box_dest, this.clientGui.getCanvas(surface_id));

			if(box.width !== box_dest.width && box.height !== box_dest.height) {
				var tmpcanvas = wdi.graphics.getNewTmpCanvas(box_dest.width, box_dest.height);
				var tmpcontext = tmpcanvas.getContext('2d');
				tmpcontext.drawImage(srcImg, 0, 0, box.width, box.height, 0, 0, box_dest.width, box_dest.height);
				srcImg = tmpcanvas;
			}

			var src = wdi.graphics.getDataFromImage(srcImg).data;
			var dst = wdi.graphics.getDataFromImage(destImg).data;

			var length = src.length-1;

			//create a new imagedata to store result
			var imageResult = wdi.graphics.getNewTmpCanvas(box_dest.width, box_dest.height);
			var context = imageResult.getContext('2d');

			var resultImageData = context.createImageData(box_dest.width, box_dest.height);
			var result = resultImageData.data;

			var rS, rD;
			var gS, gD;
			var bS, bD;
			var aS;

			for (var px=0;px<length;px+=4) {
				rS = src[px];
				gS = src[px+1];
				bS = src[px+2];

				if(flags || alpha === 255) {
					aS = src[px+3];
				} else {
					aS = alpha;
				}

				rD = dst[px];
				gD = dst[px+1];
				bD = dst[px+2];

				if(aS > 30 && alpha === 255) {
					//formula from reactos, this is premultiplied alpha values
					result[px] = ((rD * (255 - aS)) / 255 + rS) & 0xff;
					result[px+1] = ((gD * (255 - aS)) / 255 + gS) & 0xff;
					result[px+2] = ((bD * (255 - aS)) / 255 + bS) & 0xff;
				} else {
					//homemade blend function, this is the typical blend function simplified
					result[px] = (( (rS*aS)+(rD*(255-aS)) ) / 255) & 0xff;
					result[px+1] = (( (gS*aS)+(gD*(255-aS)) ) / 255) & 0xff;
					result[px+2] = (( (bS*aS)+(bD*(255-aS)) ) / 255) & 0xff;
				}

				result[px+3] = 255;
			}
			imageResult.getContext('2d').putImageData(resultImageData, 0, 0);

			this.drawClip(imageResult, box_dest, this.clientGui.getContext(surface_id));
		}, this);
	},

	drawWhiteness: function(spiceMessage) {
		//TODO: mask
		var base = spiceMessage.args.base;
		var context = this.clientGui.getContext(base.surface_id);
		var box = wdi.graphics.getBoxFromSrcArea(base.box);
		context.fillStyle = "white";
		context.fillRect(box.x, box.y, box.width, box.height);
	},

	drawBlackness: function(spiceMessage) {
		//TODO: mask
		var base = spiceMessage.args.base;
		var context = this.clientGui.getContext(base.surface_id);
		var box = wdi.graphics.getBoxFromSrcArea(base.box);
		context.fillStyle = "black";
		context.fillRect(box.x, box.y, box.width, box.height);
	},

	drawTransparent: function(spiceMessage) {
		var drawBase = spiceMessage.args.base;
		var surface_id = drawBase.surface_id;

		//calculate src_area box
		var box = wdi.graphics.getBoxFromSrcArea(spiceMessage.args.src_area);
		var dest_box = wdi.graphics.getBoxFromSrcArea(drawBase.box);

		//get destination iamge, in imagedata format because is what we need
		var destImg = this.clientGui.getContext(surface_id).getImageData(dest_box.x, dest_box.y,
			dest_box.width, dest_box.height);

		wdi.graphics.getImageFromSpice(spiceMessage.args.image.imageDescriptor, spiceMessage.args.image.data, this.clientGui, function(srcImg) {
			if(srcImg) {
				//adapt to src_area
				srcImg = wdi.graphics.getRect(box, srcImg);

				var source = wdi.graphics.getDataFromImage(srcImg).data;
				var dest = destImg.data;

				var length = source.length-1;
				var resultImageData = this.clientGui.getContext(surface_id).createImageData(dest_box.width, dest_box.height);

				var color = spiceMessage.args.transparent_true_color;
				while(length>0) {
					resultImageData.data[length] = 255; //alpha
					if(source[length-1] === color.b && source[length-2] === color.g
						&& source[length-3] === color.r) {
						resultImageData.data[length-1] = dest[length-1]; //b
						resultImageData.data[length-2] = dest[length-2]; //g
						resultImageData.data[length-3] = dest[length-3]; //r
					} else {
						resultImageData.data[length-1] = source[length-1]; //b
						resultImageData.data[length-2] = source[length-2]; //g
						resultImageData.data[length-3] = source[length-3]; //r
					}

					length-=4;
				}
				var resultImage = wdi.graphics.getImageFromData(resultImageData);
				this.drawClip(resultImage, dest_box, this.clientGui.getContext(surface_id));
			} else {
				//failed to get image, cache error?
				
			}
		}, this);
	},

	drawText: function(spiceMessage) {
		var context = this.clientGui.getContext(spiceMessage.args.base.surface_id);
		var bbox = spiceMessage.args.base.box;
		var clip = spiceMessage.args.base.clip;
		var text = spiceMessage.args;
		var string = text.glyph_string;
		var bpp = string.flags === 1 ? 1 : string.flags * 2;

		if (text.back_mode !== 0) {
			wdi.graphics.drawBackText(this.clientGui, context, text);
		}

		wdi.graphics.drawString(context, string, bpp, text.fore_brush, clip.type, this);
	},

	/**
	 * Clears all color palettes
	 * @param spiceMessage
	 * @param app
	 */
	invalPalettes: function(spiceMessage) {
		wdi.ImageCache.clearPalettes();
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.DataLogger = {
	testStartTime: 0,
	testStopTime: 0,
	networkStart:0,
	networkTotalTime: 0,
    data: {},
	routeList: {},
	imageTypes: {},
	startTimes: [],
	init: function() {
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_CREATE] = 'drawCanvas';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_DESTROY] = 'removeCanvas';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_COPY] = 'drawImage';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL] = 'drawFill';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND] = 'drawAlphaBlend';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_WHITENESS] = 'drawWhiteness';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLACKNESS] = 'drawBlackness';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TRANSPARENT] = 'drawTransparent';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_COPY_BITS] = 'drawCopyBits';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TEXT] = 'drawText';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_STROKE] = 'drawStroke';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ROP3] = 'drawRop3';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_INVERS] = 'drawInvers';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CREATE] = 'handleStreamCreate';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DESTROY] = 'handleStreamDestroy';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DATA] = 'handleStreamData';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CLIP] = 'handleStreamClip';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLEND] = 'drawBlend';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_LIST] = 'invalList';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_ALL_PALETTES] = 'invalPalettes';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_MARK] = 'displayMark';
		this.routeList[wdi.SpiceVars.SPICE_MSG_DISPLAY_RESET] = 'displayReset';

		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_BITMAP] = 'bitmap';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_QUIC] = 'quic';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_RESERVED] = 'reserved';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_PNG] = 'png';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_PLT] = 'lz_plt';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_LZ_RGB] = 'lz_rgb';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_GLZ_RGB] = 'glz_rgb';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_FROM_CACHE] = 'cache';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_SURFACE] = 'surface';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_JPEG] = 'jpeg';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_FROM_CACHE_LOSSLESS] = 'cache_lossless';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_ZLIB_GLZ_RGB] = 'zlib_glz_rgb';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_JPEG_ALPHA] = 'jpeg_alpha';
		this.imageTypes[wdi.SpiceImageType.SPICE_IMAGE_TYPE_CANVAS] = 'canvas';
	},

	setStartTime: function (time) {
		this.startTimes.push(time);
	},

	getSpiceMessageType: function (spiceMessage, prepend, append) {
		var type = this.routeList[spiceMessage.messageType];

		if (type === 'drawImage') {
			type += '_' + this.imageTypes[spiceMessage.args.image.imageDescriptor.type];
		}

		return (prepend || '') + type + (append || '');
	},

	setNetworkTimeStart: function (time) {
		this.networkStart = this.networkStart || time || Date.now();
	},

	logNetworkTime: function () {
		if (this.networkStart) {
			this.networkTotalTime += Date.now() - this.networkStart;
			this.networkStart = 0;
		}
	},

	startTestSession: function () {
		this.clear();
		wdi.logOperations = true;
		this.testStartTime = Date.now();
	},

	stopTestSession: function () {
		this.testStopTime = Date.now();
		wdi.logOperations = false;
	},

	log: function(spiceMessage, start, customType, useTimeQueue, prepend, append) {
		var end = Date.now();
		var type;
		if(customType) {
			type = customType;
		} else {
			type = this.getSpiceMessageType(spiceMessage, prepend, append);
		}

        if(!this.data.hasOwnProperty(type)) {
            this.data[type] = [];
        }

		if (useTimeQueue) {
			start = this.startTimes.shift();
		}

        this.data[type].push({start: start, end: end});
    },

    clear: function() {
		this.data = {};
		this.testStartTime = 0;
		this.testStopTime = 0;
		this.networkTotalTime = 0;
		this.networkStart = 0;
    },

    getData: function() {
        return this.data;
    },

	getStats: function() {
		var networkTime = this.networkTotalTime;
		var numOperations = 0;
		var totalTimeSpent = networkTime;
		var totalTime = this.testStopTime - this.testStartTime;

		var dataSource = this.data;
		var partialTimes = {};
		var result = "";
		var data;

		for(var i in this.data) {
			if(this.data.hasOwnProperty(i)) {
				data = dataSource[i];
				numOperations += data.length;
				partialTimes[i] = 0;
				for(var x = 0;x< data.length;x++) {
					partialTimes[i] += data[x].end - data[x].start;
				}
				totalTimeSpent += partialTimes[i];
			}
		}

		result += "Total operations by number:\n";

		var partial = 0;
		for(var i in dataSource) {
			if(dataSource.hasOwnProperty(i)) {
				partial = (dataSource[i].length / numOperations) * 100;
				result += i+': '+(~~partial)+"% (" + dataSource[i].length + ")\n";
			}
		}

		result += "Total numOperations: " + numOperations + "\n";
		result += "---------------------------------\n";
		result += "\n";

		result += "Total Operations by time:\n";

		for(i in partialTimes) {
			if(partialTimes.hasOwnProperty(i)) {
				partial = (partialTimes[i] / totalTime) * 100;
				result += i+': '+(~~partial)+"% ("+partialTimes[i]+"ms)\n";
			}
		}

		var idleTime = totalTime - totalTimeSpent;
		partial = (idleTime / totalTime) * 100;
		result += "Idle: "+(~~partial)+"% ("+idleTime+"ms)\n";
		partial = (networkTime / totalTime) * 100;
		result += "Network: " + (~~partial) + "% (" + networkTime + "ms)\n";

		result += 'Total time: ' + totalTime + 'ms \n';

		return "BEGIN OF PERFORMANCE STATS\n" + result + "\nEND OF PERFORMANCE STATS\n";
	}
};

wdi.DataLogger.init();

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.Flipper = {

	flip: function(sourceImg) {
		return this._handMadeFlip(sourceImg);
	},

	_handMadeFlip: function(sourceImg) {
		var newCanvas =  document.createElement('canvas');
		newCanvas.width = sourceImg.width;
		newCanvas.height = sourceImg.height;
		var ctx = newCanvas.getContext('2d');
		ctx.save();
		// Multiply the y value by -1 to flip vertically
		ctx.scale(1, -1);
		// Start at (0, -height), which is now the bottom-left corner
		ctx.drawImage(sourceImg, 0, -sourceImg.height);
		ctx.restore();
		return newCanvas;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.socketStatus = {
	'idle':0,
	'prepared':1,
	'connected':2,
	'disconnected':3,
	'failed':4
};
//Works only with arrays of bytes (this means each value is a number in 0 to 255)
wdi.Socket = $.spcExtend(wdi.EventObject.prototype, {
	websocket: null,
	status: wdi.socketStatus.idle,
	binary: false,
	
	connect: function(uri) {
		var self = this;
		var protocol = 'base64'; //default protocol
		
		if(Modernizr['websocketsbinary']) {
			protocol = 'binary';
			this.binary = true;
		}

		this.websocket = new WebSocket(uri, protocol);

		
		
		if(this.binary) {
			this.websocket.binaryType = 'arraybuffer';
		}
		
		this.status = wdi.socketStatus.prepared;
		this.websocket.onopen = function() {
			self.status = wdi.socketStatus.connected;
			self.fire('open');
		};
		this.websocket.onmessage = function(e) {
			self.fire('message', e.data);
		};
		this.websocket.onclose = function(e) {
			self.status = wdi.socketStatus.disconnected;
			console.warn('Spice Web Client: ', e.code, e.reason);
			self.disconnect();
			self.fire('close', e);
		};
		this.websocket.onerror = function(e) {
			self.status = wdi.socketStatus.failed;
			self.fire('error', e);
		};
	},

	setOnMessageCallback: function(callback) {
		this.websocket.onmessage = callback;
	},
	
	send: function(message) {
		try {
			this.websocket.send(this.encode_message(message));
		} catch (err) {
			this.status = wdi.socketStatus.failed;
			this.fire('error', err);
		}
	},
	
	disconnect: function() {
		if (this.websocket) {
			this.websocket.onopen = function() {};
			this.websocket.onmessage = function() {};
			this.websocket.onclose = function() {};
			this.websocket.onerror = function() {};
			this.websocket.close();
			this.status = wdi.socketStatus.idle;
			this.binary = false;
			this.websocket = null;
		}
	},
	
	setStatus: function(status) {
		this.status = status;
		this.fire('status', status);
	},
	
	getStatus: function() {
		return this.status;
	},
	
	encode_message: function(mess) {
		if(!this.binary) {
			var arr = Base64.encode(mess);
			return arr;
		} 
		
		var len = mess.length;
		
		var buffer = new ArrayBuffer(len);
		var u8 = new Uint8Array(buffer);
		
		u8.set(mess);
	
		return u8;
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.SocketQueue = $.spcExtend(wdi.EventObject.prototype, {
	rQ: null,
	sQ: null,
	socket: null,
	
	init: function(c) {
		this.superInit();
		this.socket = c.socket || new wdi.Socket();
		this.rQ = c.rQ || new wdi.FixedQueue();
		this.sQ = c.sQ || new wdi.Queue();
		this.setup();
	},
	
	setup: function() {
		this.socket.addListener('open', function() {
			this.fire('open');
		}, this);
		this.socket.addListener('message', function(data) {
			this.rQ.push(new Uint8Array(data));
			this.fire('message');
		}, this);
		this.socket.addListener('close', function(e) {
			this.fire('close', e);
		}, this);
		this.socket.addListener('error', function(e) {
			this.fire('error', e);
		}, this);
	},
	
	getStatus: function() {
		return this.socket.getStatus();
	},
	
	connect: function(uri) {
		this.socket.connect(uri);
	},
	
	disconnect: function() {
		
		if (this.socket) {
			this.socket.clearEvents();
			this.socket.disconnect();
		}
		this.rQ = null;
		this.sQ = null;
		this.socket = null;
	},
	
	send: function(data, shouldFlush) {
		//check for shouldFlush parameter, by default is true
		if (shouldFlush === undefined) {
			var flush = true;
		} else {
			var flush = shouldFlush;
		}

		//performance: avoid passing through the queue if there is no queue and
		//we have flush!
		if(this.sQ.getLength() == 0 && flush) {
			this.socket.send(data);
			return;
		}

		//normal operation, append to buffer and send if flush
		this.sQ.push(data);
		if (flush) this.flush();
	},
	
	flush: function() {
		var data = this.sQ.shift();
		this.socket.send(data);
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketController = $.spcExtend(wdi.EventObject.prototype, {
	sizeDefiner: null,
	packetExtractor: null,
	
	init: function(c) {
		this.superInit();
		this.sizeDefiner = c.sizeDefiner;
		this.packetExtractor = c.packetExtractor;
	},

	dispose: function() {
		
		this.clearEvents();
		this.packetExtractor.dispose();
		this.packetExtractor = null;
		this.sizeDefiner = null;
	},

	getNextPacket: function(data) {
		var self = this;
		if (wdi.logOperations) {
			wdi.DataLogger.setNetworkTimeStart();
		}
		var size = this.sizeDefiner.getSize(data);
		this.packetExtractor.getBytes(size, function(bytes) {
			var status = this.sizeDefiner.getStatus();

			this.execute(new wdi.RawMessage({status: status, data: bytes}));

			self.getNextPacket(bytes);


		}, this);
	},

	execute: function(message) {
		try {
			this.fire('chunkComplete', message);
		} catch (e) {
			console.error('PacketTroller: ', e);
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketExtractor = $.spcExtend(wdi.EventObject.prototype, {
	socketQ: null,
	numBytes: null,
	callback: null,
	scope: null,

	init: function(c) {
		this.superInit();
		this.socketQ = c.socketQ;
		this.setListener();
	},

	dispose: function() {
		this.clearEvents();
		this.socketQ.disconnect();
		this.socketQ = null;
		this.numBytes = null;
		this.callback = null;
		this.scope = null;
	},

	setListener: function() {
		this.socketQ.addListener('message', function() {
			if (wdi.logOperations) {
				wdi.DataLogger.setNetworkTimeStart();
			}
			this.getBytes(this.numBytes, this.callback, this.scope);
		}, this);
	},

	getBytes: function(numBytes, callback, scope) {
		var retLength = this.socketQ.rQ.getLength();
		this.numBytes = numBytes;
		this.callback = callback;
		this.scope = scope;
		
		if (numBytes !== null && retLength >= numBytes) {
			var ret;
			if (numBytes) {
				ret = this.socketQ.rQ.shift(numBytes);
			} else {
				ret = new Uint8Array(0);
			}
			this.numBytes = null;
			this.callback = null;
			this.scope = null;
			callback.call(scope, ret);
		} else {
			if (wdi.logOperations) {
				wdi.DataLogger.logNetworkTime();
			}
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketReassembler = $.spcExtend(wdi.EventObject.prototype, {
	packetController: null,
	currentHeader: null,
	statusToString: null,
	sizeDefinerConstant: null,

	init: function(c) {
		this.superInit();
		this.packetController = c.packetController;
		this.sizeDefinerConstant = wdi.SizeDefiner.prototype;
		this.statusToString = [];
		this.statusToString[this.sizeDefinerConstant.STATUS_REPLY_BODY] = 'reply';
		this.statusToString[this.sizeDefinerConstant.STATUS_ERROR_CODE] = 'errorCode';
		this.statusToString[this.sizeDefinerConstant.STATUS_BODY] = 'spicePacket';
		this.setListeners();

	},

	dispose: function() {
		
		this.clearEvents();
		this.packetController.dispose();
		this.packetController = null;
		this.currentHeader = null;
		this.statusToString = null;
		this.sizeDefinerConstant = null;
	},

	start: function () {
		this.packetController.getNextPacket();
	},

	setListeners: function() {
		this.packetController.addListener('chunkComplete', function(e) {
			var rawMessage = e;
			var status = rawMessage.status;
			switch(status) {
				case this.sizeDefinerConstant.STATUS_HEADER:
				case this.sizeDefinerConstant.STATUS_REPLY:
					this.currentHeader = rawMessage;
					break;
				case this.sizeDefinerConstant.STATUS_REPLY_BODY:
				case this.sizeDefinerConstant.STATUS_BODY:
					var tmpBuff = new Uint8Array(rawMessage.data.length + this.currentHeader.data.length);
					tmpBuff.set(this.currentHeader.data);
					tmpBuff.set(rawMessage.data, this.currentHeader.data.length);
					rawMessage.data = tmpBuff;
					rawMessage.status = this.statusToString[status];
					this.fire('packetComplete', rawMessage);
					break;
				default:
					rawMessage.status = this.statusToString[status];
					this.fire('packetComplete', rawMessage);
					break;
			}
		}, this);
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.ReassemblerFactory = {
	getPacketReassembler: function(socketQ) {
		var pE = this.getPacketExtractor(socketQ);
		var sD = this.getSizeDefiner();
		var pC = this.getPacketController(pE, sD);
		return new wdi.PacketReassembler({packetController: pC});
	},

	getPacketExtractor: function(socketQ) {
		return new wdi.PacketExtractor({socketQ: socketQ});
	},

	getSizeDefiner: function() {
		return new wdi.SizeDefiner();
	},

	getPacketController: function(packetExtractor, sizeDefiner) {
		return new wdi.PacketController({packetExtractor: packetExtractor, sizeDefiner: sizeDefiner});
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.SizeDefiner = $.spcExtend(wdi.DomainObject, {
	ERROR_CODE_SIZE: 4,
	status: null,
	STATUS_READY: 0,
	STATUS_REPLY: 1,
	STATUS_REPLY_BODY: 2,
	STATUS_ERROR_CODE: 3,
	STATUS_MESSAGE: 4,
	STATUS_HEADER: 5,
	STATUS_BODY: 6,
	isHeader: false,

	init: function(c) {
		this.status = this.STATUS_READY;
	},

	getSize: function(arr) {
		if (this.STATUS_READY === this.status) {
			this.status++;
			return wdi.SpiceLinkHeader.prototype.objectSize;
		} else if (this.STATUS_REPLY === this.status) {
			this.status++;
			return this.getReplyBodySize(arr);
		} else if (this.STATUS_REPLY_BODY === this.status) {
			this.status++;
			return this.ERROR_CODE_SIZE;
		} else if (this.STATUS_ERROR_CODE === this.status) {
			this.status++;
			this.isHeader = true;
			return 6; //wdi.SpiceDataHeader.prototype.objectSize access here is slow
		} else {
			if (this.isHeader) {
				this.isHeader = false;
				return this.getBodySizeFromArrayHeader(arr);
			} else {
				this.isHeader = true;
				return 6;//wdi.SpiceDataHeader.prototype.objectSize; access here is slow
			}
		}
	},

	getReplyBodySize: function (arr) {
		var queue = wdi.GlobalPool.create('ViewQueue');
		queue.setData(arr);
		var header = new wdi.SpiceLinkHeader().demarshall(queue);
		wdi.GlobalPool.discard('ViewQueue', queue);
		return header.size;
	},

	getBodySizeFromArrayHeader: function (arr) {
		var queue = wdi.GlobalPool.create('ViewQueue');
		queue.setData(arr);
		var header = new wdi.SpiceDataHeader().demarshall(queue);
		wdi.GlobalPool.discard('ViewQueue', queue);
		return header.size;
	},

	getStatus: function() {
		if (this.status === this.STATUS_MESSAGE && this.isHeader) {
			return this.STATUS_HEADER;
		} else if (this.status === this.STATUS_MESSAGE && !this.isHeader) {
			return this.STATUS_BODY;
		} else {
			return this.status;
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketLinkFactory = {
	extract: function(header, queue) {
		switch (header.type) {
			case wdi.SpiceVars.SPICE_MSG_SET_ACK:
				return new wdi.RedSetAck().demarshall(queue);
			case wdi.SpiceVars.SPICE_MSG_PING:
				return new wdi.RedPing().demarshall(queue, header.size);
			case wdi.SpiceVars.SPICE_MSG_MIGRATE:
				return new wdi.RedMigrate().demarshall(queue);
			case wdi.SpiceVars.SPICE_MSG_MIGRATE_DATA:
				return new wdi.RedMigrateData().demarshall(queue, header.size);
			case wdi.SpiceVars.SPICE_MSG_WAIT_FOR_CHANNELS:
				return new wdi.RedWaitForChannels().demarshall(queue);
			case wdi.SpiceVars.SPICE_MSG_DISCONNECTING:
				return new wdi.RedDisconnect().demarshall(queue);
			case wdi.SpiceVars.SPICE_MSG_NOTIFY:
				var packet = new wdi.RedNotify().demarshall(queue);
				return packet;
			case wdi.SpiceVars.SPICE_MSG_MAIN_MOUSE_MODE:
				return new wdi.SpiceMouseMode().demarshall(queue);
		}
	}
};

wdi.PacketLinkProcess = {
	process: function(header, packet, channel) {
		switch(header.type) {
			case wdi.SpiceVars.SPICE_MSG_SET_ACK:
				var body = wdi.SpiceObject.numberTo32(packet.generation);
				channel.setAckWindow(packet.window)
				channel.sendObject(body, wdi.SpiceVars.SPICE_MSGC_ACK_SYNC);
				break;
			case wdi.SpiceVars.SPICE_MSG_PING:
				var body = new wdi.RedPing({id: packet.id, time: packet.time}).marshall();
				channel.sendObject(body, wdi.SpiceVars.SPICE_MSGC_PONG);
				break;
			case wdi.SpiceVars.SPICE_MSG_MAIN_MOUSE_MODE:
				channel.fire('mouseMode', packet.current_mode);
				break;
			case wdi.SpiceVars.SPICE_MSG_NOTIFY:
				channel.fire('notify');
				break;
		}
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

//Must fire event types: connectionId and message

wdi.SpiceChannel = $.spcExtend(wdi.EventObject.prototype, {
	counter: 0,
	ackWindow: 0,
	connectionId: 0,
	socketQ: null,
	packetReassembler: null,
	channel: 1,
	proxy: null,
	token: null,
	
	init: function(c) {
		this.superInit();
		this.socketQ = c.socketQ || new wdi.SocketQueue();
		this.packetReassembler = c.packetReassembler || wdi.ReassemblerFactory.getPacketReassembler(this.socketQ);
		this.setListeners();
		this.ackWindow = 0;
	},

	startHandshakeTimeout: function () {
		var self = this;
		this.handshakeTimeout = window.setTimeout(function () {
				var err = new Error("Handshake timeout");
				err.code = 4200;
				
				self.fire('error', err);
			}, 5000);
	},

	cancelHandshakeTimeout: function () {
		clearTimeout(this.handshakeTimeout);
	},

	setListeners: function() {
		var date;
		var self = this;
		this.packetReassembler.addListener('packetComplete', function(e) {
			var rawMessage = e;
			if (rawMessage.status === 'spicePacket') {
				
				self.cancelHandshakeTimeout();
				if (wdi.logOperations) {
					wdi.DataLogger.logNetworkTime();
					date = Date.now();
				}
				var rsm = this.getRawSpiceMessage(rawMessage.data);
				if (rsm) {
					if (wdi.logOperations && rsm.channel === wdi.SpiceVars.SPICE_CHANNEL_DISPLAY) {
						wdi.DataLogger.setStartTime(date);
					}
					this.fire('message', rsm);
				}
			} else if (rawMessage.status === 'reply') {
				
				var packet = this.getRedLinkReplyBytes(rawMessage.data);
				this.send(packet);
			} else if (rawMessage.status === 'errorCode') {
				
				var packet = this.getErrorCodeBytes(rawMessage.data);
				if (packet) {
					this.send(packet);
				}
				this.fire('channelConnected');
			}
		}, this);
		
		this.socketQ.addListener('open', function() {
			var packet = this.getRedLinkMessBytes();
			this.send(packet);
			this.proxy ? this.proxy.end() : false;
		}, this);

		this.socketQ.addListener('close', function(e) {
			if (this.channel === 1) {
				this.fire('error', e);
			}
			this.socketQ.disconnect();
		}, this);

		this.socketQ.addListener('error', function(e) {
			this.fire('error', e);
			this.socketQ.disconnect();
		}, this);
	},

	connect: function(connectionInfo, channel, connectionId, proxy) {
		var url = wdi.Utils.generateWebSocketUrl(connectionInfo.protocol, connectionInfo.host, connectionInfo.port, connectionInfo.vmHost, connectionInfo.vmPort, 'spice', connectionInfo.vmInfoToken);
		this.channel = channel;
		this.connectionId = connectionId || 0;
		this.socketQ.connect(url);
		this.startHandshakeTimeout();
		this.proxy = proxy;
		this.token = connectionInfo.token;
		this.packetReassembler.start();
	},

	disconnect: function () {
		
		this.counter = 0;
		this.ackWindow = 0;
		this.connectionId = 0;
		this.socketQ.disconnect();
		this.socketQ = null;
		this.packetReassembler.dispose();
		this.packetReassembler = null;
		this.channel = 1;
		this.proxy = null;
		this.token = null;
	},

	send: function(data, flush) {
		this.socketQ.send(data, flush);
	},

	sendObject: function(data, type, flush) {

		// TODO: Unhardcode this value
		var bufSize = 2048;
		for (var current = 0; current < data.length; current += bufSize) {
			var part = data.slice(current, current + bufSize);
			var packet = new wdi.SpiceDataHeader({
				type: type,
				size: part.length
			}).marshall();

			packet = packet.concat(part);

			this.send(packet, flush);
		}
	},
	
	setAckWindow: function(window) {
		this.ackWindow = window;
		this.counter = 0;
	},

	getRawSpiceMessage: function (rawData) {
		var headerQueue = wdi.GlobalPool.create('ViewQueue');
		var body = wdi.GlobalPool.create('ViewQueue');

		var header = new Uint8Array(rawData, 0, wdi.SpiceDataHeader.prototype.objectSize);
		headerQueue.setData(header);
		var headerObj = new wdi.SpiceDataHeader().demarshall(headerQueue);
		wdi.GlobalPool.discard('ViewQueue', headerQueue);
		var rawBody = rawData.subarray(wdi.SpiceDataHeader.prototype.objectSize);
		body.setData(rawBody);

		this.counter++;

		if(this.ackWindow && this.counter === this.ackWindow) {
			this.counter = 0;
			var ack = new wdi.SpiceDataHeader({
				type: wdi.SpiceVars.SPICE_MSGC_ACK,
				size:0
			}).marshall();
			this.send(ack);
		}

		var packet = wdi.PacketLinkFactory.extract(headerObj, body) || false;
		if (packet) {
			wdi.PacketLinkProcess.process(headerObj, packet, this);
			wdi.GlobalPool.discard('ViewQueue', body);
			return false;
		} else {
			var rawSpiceMessage = wdi.GlobalPool.create('RawSpiceMessage');
			rawSpiceMessage.set(headerObj, body, this.channel);
			return rawSpiceMessage;
		}
	},


	//This functions are to avoid hardcoded values on logic
	getRedLinkReplyBytes: function(data) {
		if (this.token) {
			var newq = new wdi.ViewQueue();
			newq.setData(data);
			newq.eatBytes(wdi.SpiceLinkHeader.prototype.objectSize)
			var myBody = new wdi.SpiceLinkReply().demarshall(newq);

			//Returnnig void bytes or encrypted ticket
			var key = wdi.SpiceObject.stringHexToBytes(RSA_public_encrypt(this.token, myBody.pub_key));
			return key;
		} else {
			return wdi.SpiceObject.stringToBytesPadding('', 128);
		}
	},

	getRedLinkMessBytes: function() {
		var header = new wdi.SpiceLinkHeader({magic:1363428690, major_version:2, minor_version:2, size:22}).marshall();
		var body = new wdi.SpiceLinkMess({
			connection_id:this.connectionId, 
			channel_type:this.channel, 
			caps_offset:18,
			num_common_caps: 1,
			common_caps: (1 << wdi.SpiceVars.SPICE_COMMON_CAP_MINI_HEADER)
		}).marshall();
		return header.concat(body);
	},

	getErrorCodeBytes: function (data) {
		var errorQ = wdi.GlobalPool.create('ViewQueue');
		errorQ.setData(data);
		var errorCode = wdi.SpiceObject.bytesToInt32NoAllocate(errorQ);
		wdi.GlobalPool.discard('ViewQueue', errorQ);
		if (errorCode === 0) {
			if (this.channel === wdi.SpiceVars.SPICE_CHANNEL_DISPLAY) {
				var redDisplayInit = new wdi.SpiceDataHeader({type: wdi.SpiceVars.SPICE_MSGC_DISPLAY_INIT, size: 14}).marshall();
				//TODO: ultrahardcoded value here, move to configuration

				//DUE To high level storage the memory specified for cache
				//is 2-3 times bigger than expected.
				var cache_size = 1;

				var body = new wdi.SpiceCDisplayInit({
					pixmap_cache_id:1,
					pixmap_cache_size: cache_size,
					glz_dictionary_id: 0,
					glz_dictionary_window_size: 0
				}).marshall();

				return redDisplayInit.concat(body);
			} else if(this.channel == wdi.SpiceVars.SPICE_CHANNEL_MAIN) {
				return new wdi.SpiceDataHeader({type: wdi.SpiceVars.SPICE_MSGC_MAIN_ATTACH_CHANNELS, size: 0}).marshall();
			}
		} else {
			throw new wdi.Exception({message: "Server refused client", errorCode: 2});
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.BusConnection = $.spcExtend(wdi.EventObject.prototype, {
	ws: null,
	subscriptions: [],
	_busUser: null,
	_busPass: null,
	queue: '',
	binary: false,

	init: function(c) {
		this.superInit();
		this.ws = c.websocket || new wdi.WebSocketWrapper();
		this.clusterNodeChooser = c.clusterNodeChooser || new wdi.ClusterNodeChooser();
		this.binary = c.binary || false;
	},

	connect: function(c) {
		if (!c['useBus']) {
			
			return;
		}
        this._vdiBusToken = c['vdiBusToken'];
		if (!c['busHostList']) {
			
			c['busHostList'] = [{
				host: c['busHost'],
				port: c['busPort']
			}];
		}
		this.clusterNodeChooser.setNodeList(c['busHostList']);
		if (Modernizr['websocketsbinary']) {
			this.binary = true;
		}
		this._busUser = c['busUser'];
		this._busPass = c['busPass'];
		this._websockifyProtocol = c['protocol'];
		this._websockifyHost = c['host'];
		this._websockifyPort = c['port'];
		this.subscriptions = c['busSubscriptions'];

		this._connectToNextHost();
	},

	_connectToNextHost: function () {
		var busData = this.clusterNodeChooser.getAnother();

		// c['protocol'] is the protocol we use to connect to websockify
		// ie: ws, wss, https, ...
		var url = wdi.Utils.generateWebSocketUrl(
			this._websockifyProtocol,
			this._websockifyHost,
			this._websockifyPort,
			busData.host,
			busData.port,
			'raw',
            this._vdiBusToken
		);
		var websocketProtocol = 'base64';
		if (this.binary) {
			websocketProtocol = 'binary';
		}
		this.ws.connect(url, websocketProtocol);

		

		if (this.binary) {
			this.ws.setBinaryType('arraybuffer');
		}
		this.setListeners();
	},

	disconnect: function() {
		this.ws.close();
		this.queue = '';
		this.subscriptions = [];
	},

	setListeners: function() {
		var self = this;
		this.ws.onOpen(function(e) {
			self._send("CONNECT\nlogin:" + self._busUser + "\npasscode:" + self._busPass + "\n\n\x00");
		});

		this.ws.onMessage(function(e) {
			var message;
			var result;
			if (!self.binary) {
				message = Base64.decodeStr(e.data);
			} else {
				message = String.fromCharCode.apply(null, new Uint8Array(e.data));
				// Fix accented chars
				// [ http://stackoverflow.com/questions/5396560/how-do-i-convert-special-utf-8-chars-to-their-iso-8859-1-equivalent-using-javasc ]
				message = decodeURIComponent(escape(message));
			}
			var subChunks = message.split("\0");
			if (subChunks.length == 1) {
				// there is no \0 in the full message, add it to the queue
				self.queue += subChunks[0];
			} else {
				// at least one \0, process all but the last subchunk (that has no \0)
				for (var i = 0; i < subChunks.length - 1; i++) {
					message = self.queue + subChunks[i];
					result = self.parseMessage(message);
					self.fire('busMessage', result);
					self.queue = '';
				}
				// last chunk is now the queue
				self.queue = subChunks[subChunks.length - 1];
			}
		});

		this.ws.onClose(function(e) {
			
			self.fire('error', e);
		});

		this.ws.onError(function(e) {
			
		});
	},

	parseMessage: function(message) {
		try {
			var arr = message.split("\n\n");
			var header = arr[0].trim();
			var body = arr[1].replace(/\x00/, '').trim();
			if (body.length != 0) {
				// there is content, so convert to object
				body = JSON.parse(body);
			} else {
				body = null;
			}
			arr = header.split("\n");
			var verb = arr.shift();
			header = "{";
			var len = arr.length;
			for (var i = 0;i < len;i++) {
				var headerName = arr[i].split(':')[0];
				header += '"' + headerName + '":"' + arr[i].replace(headerName + ':', '') + '"';
				if (i != len-1) {
					header += ",";
				}
			}
			header += "}";

			return {'verb':verb, 'header':JSON.parse(header), 'body':body};
		} catch (e) {
			
			return {"verb":"ERROR"};
		}
	},

	setSubscriptions: function() {
		var len = this.subscriptions.length;
		for (var i = 0; i < len;i++) {
			this.subscribe(this.subscriptions[i]);
		}
	},

	send: function(message) {
		var destination = this.subscriptions[0];
		this._send("SEND\ndestination:" + destination + "\ncontent-type:text/plain\n\n" + JSON.stringify(message) + "\x00");
	},

	subscribe: function(destination) {
		//header browser: true for queue's to multiple subscribers
		this._send("SUBSCRIBE\ndestination:" + destination + "\n\n\x00");
	},

	_send: function(message) {
		if (!this.binary) {
			this.ws.send(Base64.encodeStr(message));
		} else {
			this.ws.send(message);
		}
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.WebSocketWrapper = $.spcExtend({}, {
	ws: {},
	onopen: null,
	onmessage: null,
	onclose: null,
	onerror: null,

	init: function() {

	},

	connect: function(url, protocol) {
		this.ws = new WebSocket(url, protocol);
	},

	onOpen: function(callback) {
		this.ws.onopen = callback;
	},

	onMessage: function(callback) {
		this.ws.onmessage = callback;
	},

	onClose: function(callback) {
		this.ws.onclose = callback;
	},

	onError: function(callback) {
		this.ws.onerror = callback;
	},

	setBinaryType: function(type) {
		this.ws.binaryType = type;
	},

	close: function() {
		if (!this.ws || !this.ws.close) {
			return;
		}

		this.ws.close();
		this.ws.onopen = function () {};
		this.ws.onmessage = function () {};
		this.ws.onclose = function () {};
		this.ws.onerror = function () {};
		this.onopen = function() {};
		this.onmessage = function() {};
		this.onclose = function() {};
		this.onerror = function() {};

	},

	send: function(message) {
		this.ws.send(message);
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.ConnectionControl = $.spcExtend(wdi.EventObject.prototype, {
	socket: null,
	pendingTimeToConnectionLost: null,
	previousTimeOut: null,

	init: function(c) {
		this.superInit();
		this.socket = c.socket || new wdi.Socket();
	},

	connect: function(c) {
		var url = wdi.Utils.generateWebSocketUrl(c.protocol, c.host, c.port, null, null,'raw', c.heartbeatToken);
		this.socket.connect(url);
		this.pendingTimeToConnectionLost = c.heartbeatTimeout;
		
		this.setListeners();
	},

	disconnect: function() {
		
		if(this.previousTimeOut){
			clearTimeout(this.previousTimeOut);
		}
		this.socket.disconnect();
		this.socket = null;
		this.pendingTimeToConnectionLost = null;
		this.previousTimeOut = null;
	},

	setListeners: function() {
		var self = this;
		this.socket.setOnMessageCallback(function(e) {
			
			clearTimeout(self.previousTimeOut);
			self.previousTimeOut = setTimeout(function() {
				
				self.fire('connectionLost', e);
			}, self.pendingTimeToConnectionLost);
		});
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.ClusterNodeChooser = $.spcExtend(wdi.EventObject.prototype, {
	init: function (c) {
	},

	setNodeList: function (nodeList) {
		this._nodeList = this._shuffle(nodeList);
		this._nodeListLength = this._nodeList.length;
		this._currentIndex = 0;
	},

	getAnother: function () {
		var toReturn = this._nodeList[this._currentIndex++ % this._nodeListLength];
		return toReturn;
	},

	// recipe from: http://stackoverflow.com/a/6274398
	_shuffle: function (list) {
		var counter = list.length,
			temp,
			index;
		while (counter > 0) {
			index = Math.floor(Math.random() * counter);
			counter--;
			temp = list[counter];
			list[counter] = list[index];
			list[index] = temp;
		}
		return list;
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.Agent = $.spcExtend(wdi.EventObject.prototype, {
	clientTokens:null,
    serverTokens: 10,
    app: null,
    clipboardEnabled: true,
	windows: null,
    clipboard: null,
    DELAY_BETWEEN_GRAB_AND_CTRLV: 30,

	init: function(c) {
		this.superInit();
		this.app = c.app;
        this.clipboard = new wdi.Clipboard()

    },

    dispose: function () {
        this.clientTokens = null;
        this.serverTokens = 10;
        this.app = null;
        this.clipboardContent = null;
        this.clipboardEnabled = true;
        this.windows = null;
    },

	sendInitMessage: function() {
		var packet = new wdi.SpiceMessage({
			messageType: wdi.SpiceVars.SPICE_MSGC_MAIN_AGENT_START,
			channel: wdi.SpiceVars.SPICE_CHANNEL_MAIN,
			args: new wdi.SpiceMsgMainAgentTokens({
				num_tokens: this.serverTokens
			})
		});
		this.app.spiceConnection.send(packet);

        var mycaps = (1 << wdi.AgentCaps.VD_AGENT_CAP_MONITORS_CONFIG);
        if (this.clipboardEnabled) {
            mycaps = mycaps | (1 << wdi.AgentCaps.VD_AGENT_CAP_CLIPBOARD_BY_DEMAND);
        }

        var packetData = {
            type: wdi.AgentMessageTypes.VD_AGENT_ANNOUNCE_CAPABILITIES,
            opaque: 0,
            data: new wdi.VDAgentAnnounceCapabilities({
                request: 0,
                caps: mycaps
            })
        };
      	this.sendAgentPacket(packetData);
	},

	setResolution: function(width, height) {
		//TODO move this to a setting
		if(width < 800) {
			width = 800;
		}

		if(height < 600) {
			height = 600;
		}

		//adapt resolution, TODO: this needs to be refractored
		var packetData = {
            type: wdi.AgentMessageTypes.VD_AGENT_MONITORS_CONFIG,
            opaque: 0,
            data: new wdi.VDAgentMonitorsConfig({
                num_of_monitors: 1,
                flags: 0,
                data: new wdi.VDAgentMonConfig({
                    width: width,
                    height: height,
                    depth: 32,
                    x: 0,
                    y: 0
                })
            })
        };
		this.sendAgentPacket(packetData);
	},

	setClientTokens: function(tokens) {
		this.clientTokens = tokens;
	},

	sendAgentPacket: function(packetData) {
		this.clientTokens--;

        var packet = new wdi.SpiceMessage({
            messageType: wdi.SpiceVars.SPICE_MSGC_MAIN_AGENT_DATA,
            channel: wdi.SpiceVars.SPICE_CHANNEL_MAIN,
            args: new wdi.VDAgentMessage({
                protocol: 1, //agent protocol version, should be unhardcoded
                type: packetData.type,
                opaque: packetData.opaque,
                data: packetData.data
            })
        });

		this.app.spiceConnection.send(packet);
	},

    sendServerTokens: function() {
        var packet = new wdi.SpiceMessage({
            messageType: wdi.SpiceVars.SPICE_MSGC_MAIN_AGENT_TOKEN,
            channel: wdi.SpiceVars.SPICE_CHANNEL_MAIN,
            args: new wdi.SpiceMsgMainAgentTokens({
                num_tokens: 10
            })
        });
        this.app.spiceConnection.send(packet);
        this.serverTokens = 10;
    },

    onAgentData: function(packet) {
        this.serverTokens--; //we have just received a server package, we decrement the tokens
        if (this.serverTokens == 0) { // we send 10 more tokens to server
            this.sendServerTokens();
        }

        if(packet.type == wdi.AgentMessageTypes.VD_AGENT_ANNOUNCE_CAPABILITIES) {
            //??
        } else if(packet.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_GRAB) {
            var clipboardPacket = this.clipboard.createRequest(packet.clipboardType);
            this.sendAgentPacket(clipboardPacket);
        } else if(packet.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD) {
            this.fire('clipBoardData', packet.clipboardData);
        } else if (packet.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_REQUEST) {
            var clipboardPacket = this.clipboard.createContent();
            this.sendAgentPacket(clipboardPacket);
        } else if (packet.type == wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_RELEASE) {

        } else if (packet.type == wdi.AgentMessageTypes.VD_AGENT_REPLY) {

        } else if (packet.type == wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_TOKEN) {
            this.clientTokens += packet.args.num_tokens;
        } else {
            console.warn('unknown message received by agent', packet);
        }
    },

    setClipboard: function(data) {
        this.clipboard.setContent(data);
        var clipboardPacket = this.clipboard.createGrab();
        this.sendAgentPacket(clipboardPacket);
        var self = this;
		setTimeout(function () {
            self.app.sendShortcut(wdi.keyShortcutsHandled.CTRLV);
        }, this.DELAY_BETWEEN_GRAB_AND_CTRLV);
    },

    disableClipboard: function () {
        this.clipboardEnabled = false;
    }
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.Clipboard = $.spcExtend(wdi.EventObject.prototype, {
	_blob: null,
    _type: null,

    getSpiceType: function(mimetype) {
        switch (mimetype) {
            case "text/plain": return wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_UTF8_TEXT;
            case "image/png": return wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_IMAGE_PNG;
            default: throw new Error("Unsupported mime type " + mimetype);
        }
    },

    getMimeType: function(spicetype) {
        switch (spicetype) {
            case wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_UTF8_TEXT: return "text/plain";
            case wdi.ClipBoardTypes.VD_AGENT_CLIPBOARD_IMAGE_PNG: return "image/png";
            default: throw new Error("Unsupported spice type " + spicetype);
        }
    },

    createGrab: function() {
        return {
            type: wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_GRAB,
            opaque: 0,
            data: new wdi.VDAgentClipboardGrab({
                types: [this.getSpiceType(this._type)]
            })
        };
    },

    createRequest: function(type) {
        return {
            type: wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD_REQUEST,
            opaque: 0,
            data: new wdi.VDAgentClipboardRequest({
                type: type
            })
        };
    },

    createContent: function() {
        return {
            type: wdi.AgentMessageTypes.VD_AGENT_CLIPBOARD,
            opaque: 0,
            data: new wdi.VDAgentClipboard({
                type: this.getSpiceType(this._type),
                data: this._blob
            })
        };
    },

    setContent: function (content) {
        this._type = content.type;
        this._blob = content.blob;
    },

    getContent: function () {
        return {
            blob: this._blob,
            type: this._type
        };
    }
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.ClipboardDataParser = $.spcExtend(wdi.EventObject.prototype, {

	fileReader: null,

	init: function (params) {
		this.fileReader = params["FileReader"] || FileReader;
	},

	parse: function parse(clipboardData, callback) {
		var self = this;
		// Prioritizes mime types that appear earlier in the list
		var mimeTypes = ["image/png", "text/plain"];

		function getItemAsPojo(item, callback) {
			switch (item["kind"]) {
				case "string":
					return getItemStringAsPojo(item, callback);
				case "file":
					return getItemFileAsPojo(item, callback);
			}
		}

		function getItemStringAsPojo(item, callback) {
			var type = item.type;
			item["getAsString"](function (str) {
				return callback({
					type: type,
					blob: str
				});
			})
		}

		function getItemFileAsPojo(item, callback) {
			var type = item["type"];
			var blob = item["getAsFile"]();
			var reader = new self.fileReader();
			reader.addEventListener("loadend", function() {
				return callback({
					type: type,
					blob: reader["result"]
				})
			});
			reader.readAsArrayBuffer(blob);
		}

		var items = clipboardData["items"];

		// If the browser implements the 'items' property of the clipboard event, use it. Supports pasting images.
		// Docs: https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
		if (items) {
			for (var i = 0; i < mimeTypes.length; i++) {
				var type = mimeTypes[i];
				for (var j = 0; j < items.length; j++) {
					var item = items[j];
					if (item["type"] == type) {
						return getItemAsPojo(item, callback);
					}
				}
			}
		}
		// If not, use old APIs or browser-specific hacks to get the data. This API does not allow pasting images directly.
		else if (clipboardData.getData){
			var type = "text/plain";
			if( clipboardData.types.contains(type)) {
				callback({
					type: type,
					blob: clipboardData.getData(type)
				})
			}
		}
	}
});


/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


wdi.LocalClipboard = $.spcExtend(wdi.EventObject.prototype, {

	init: function (c) {
		this.clipboardContainer = $('<div style="position:absolute;top:-10000000px;"><textarea id="remoteClipboard" style="position:absolute;top:-10000000px;font-size: 20px;color:black;z-index: 100" rows="4" cols="50"></textarea></div>');
		//this.clipboardContent = $('#remoteClipboard');
		$('body').append(this.clipboardContainer);

		this.clientGui = c.clientGui;
		this.eventHandlers = {
			keydown: this.triggerCopyToClipboard.bind(this)
		};

		$(document).on(this.eventHandlers);

		this.delayCopyEvents = {
			mousedown: this.copyToClipboard.bind(this),
			mouseup: this.copyToClipboard.bind(this),
			keydown: this.copyToClipboard.bind(this),
			keyup: this.copyToClipboard.bind(this)
		};
		$(document).on(this.delayCopyEvents);
	},

	updateClipboardBuffer: function (content) {
		//this.clipboardContent.val(content);
		$('#remoteClipboard').val(content);

	},

	triggerCopyToClipboard: function (e) {
		function isMac () {
			return navigator.appVersion.indexOf('Mac') != -1
		}
		function isCopyShortcutPressed(e) {
			var ctrlKey = e.ctrlKey;
			if(isMac()) {
				ctrlKey = e.metaKey;
			}
			return e.keyCode === 67 && ctrlKey;
		}

		if(isCopyShortcutPressed(e)){
			this.clipboardCopyDelay = Date.now() + 1000; //now + 1 seconds;
			e.preventDefault();
			this.copyToClipboard(e);
		}
	},

	copyToClipboard: function (e) {
		var self = this;

		if (!this.clipboardCopyDelay || this.clipboardCopyDelay < Date.now()) {
			//don't copy if this user action is later than the ctr+c plus some seconds.
			return;
		}

		var callback = function callback(e) {
			//self.clientGui.disableKeyboard();
			//self.clipboardContent.focus();
			$('#remoteClipboard').select();

			try {
				var c = document.execCommand("copy");
				$('#remoteClipboard').blur();
				//e.preventDefault();
				//window.getSelection().removeAllRanges();
				//self.clientGui.enableKeyboard();
				console.log("Result executeCommand", e.type, "-----", c);
			} catch (err) {
				console.error(err);
			}
		};
		callback(e);

		//[0, 100, 200, 500, 1000].map(function(timeInS){
		//	console.log("Setting timeout for", timeInS);
		//	setTimeout(function(){
		//		callback("" + timeInS);
		//	}, timeInS);
		//});
	},

	dispose: function () {
		this.clipboardContainer.remove();
		$(document).off(this.eventHandlers);
		$(document).off(this.delayCopyEvents);
	}

});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.SpiceConnection = $.spcExtend(wdi.EventObject.prototype, {
	channels:null,
	connectionId: null,
	connectionInfo: null,
	runQ: null,
	token: null,
	connectionControl: null,
	
	init: function(c) {
		this.superInit();
		this.channels = {};
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN] = c.mainChannel || new wdi.SpiceChannel();
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_DISPLAY] = c.displayChannel || new wdi.SpiceChannel();
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_INPUTS] = c.inputsChannel || new wdi.SpiceChannel();
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_CURSOR] = c.cursorChannel || new wdi.SpiceChannel();
        this.channels[wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK] = c.playbackChannel || new wdi.SpiceChannel();
		this.runQ = c.runQ || new wdi.RunQueue();
		this.connectionControl = c.connectionControl || new wdi.ConnectionControl();
		this.setup();
	},
	
	connect: function(connectionInfo) {
		this.connectionInfo = connectionInfo;
		if (connectionInfo.connectionControl) {
			this.connectionControl.connect(connectionInfo);
		}
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].connect(this.connectionInfo, wdi.SpiceVars.SPICE_CHANNEL_MAIN);
	},
	
	disconnect: function() {
		
		this.runQ.clear();
		this.clearEvents();
		for (var i in this.channels) {
			this.channels[i].disconnect();
			this.channels[i].clearEvents();
			this.channels[i] = null;
			delete(this.channels[i]);
		}
		this.connectionControl.disconnect();
		this.runQ = null;
		this.token = null;
		this.channels = null;
		this.connectionId = null;
		this.connectionInfo = null;
		this.connectionControl = null;
	},
	
	send: function(spcMessage) {
		var data = spcMessage.args.marshall();
		if(this.channels[spcMessage.channel]) {
			this.channels[spcMessage.channel].sendObject(
				data,
				spcMessage.messageType
			);
		} else {
			console.error("channel not available", spcMessage.channel);
		}
	},
	
	//set events to all channels
	setup: function() {
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].addListener('connectionId', this.onConnectionId, this);
        this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].addListener('channelListAvailable', this.onChannelList, this);
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].addListener('mouseMode', this.onMouseMode, this);
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].addListener('initAgent', this.onInitAgent, this);
		this.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN].addListener('notify', this.onNotify, this);
		this.connectionControl.addListener('connectionLost', this.onDisconnect, this);

		this._setConnectedListeners();
        
        var f = null;
        if(wdi.exceptionHandling) {
            f = this.onChannelMessageExceptionHandled;
        } else {
            f = this.processChannelMessage;
        }
        
		for(var i in this.channels) {
			if(this.channels.hasOwnProperty(i)) {
				this.channels[i].addListener('message', f, this);
				this.channels[i].addListener('status', this.onStatus, this);
				this.channels[i].addListener('error', this.onDisconnect, this);
			}
		}
	},

	_setConnectedListeners: function() {
		this._setConnectedListener(wdi.SpiceVars.SPICE_CHANNEL_MAIN);
		this._setConnectedListener(wdi.SpiceVars.SPICE_CHANNEL_DISPLAY);
		this._setConnectedListener(wdi.SpiceVars.SPICE_CHANNEL_INPUTS);
		this._setConnectedListener(wdi.SpiceVars.SPICE_CHANNEL_CURSOR);
		this._setConnectedListener(wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK);
	},


	_setConnectedListener: function(channel) {
		this.channels[channel].addListener('channelConnected', function () {
			this.fire('channelConnected', channel);
		}, this);
	},
		
	onDisconnect: function(params) {
		this.fire("error", params);
	},
	
	//events
	onConnectionId: function(params) {
		this.connectionId = params;
	},

    onChannelList: function(params) {
        this.connectChannels(params);
    },

    connectChannels: function(channels) {
        for(var i in this.channels) {
            i = parseInt(i, 10);
            if(i != wdi.SpiceVars.SPICE_CHANNEL_MAIN && channels.indexOf(i) != -1) {
                this.runQ.add(function(proxy, params) {
                    this.channels[params].connect(this.connectionInfo, params, this.connectionId, proxy);
                }, this, false, i);
            }
        }
        this.runQ.process();
    },
	
	onInitAgent: function(params) {
		var tokens = params;
		this.fire('initAgent', tokens);
	},
	
	onMouseMode: function(params) {
		var mode = params;
		this.fire('mouseMode', mode);
	},
	
	onNotify: function(params) {
		this.fire('notify');
	},
	
	onStatus: function(params) {
		/*var status = params[1];
		var channel = params[2];
		if (status == wdi.CHANNEL_STATUS.idle) {
			var self = this;
			this.channels[channel].timer = setTimeout(function() {
				self.channels[channel].connect(self.host, self.port, channel, self.connectionId);
			}, 800);
		} else if (status == wdi.CHANNEL_STATUS.establishing) {
			clearTimeout(this.channels[channel].timer);
		}*/
	},

            
    onChannelMessageExceptionHandled: function(params) {
        try {
            return this.processChannelMessage(params);
        } catch(e) {
            
        }	        
    },
    
    processChannelMessage: function(params) {
        var packet = wdi.PacketFactory.extract(params); //returns domain object

        //return ViewQueue to the pool, object is already decoded
        wdi.GlobalPool.discard('ViewQueue', params.body);
        wdi.GlobalPool.discard('RawSpiceMessage', params);

        if(packet) {
            this.fire('message', packet);
        } else {
            
            
        }                    
    }
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.SPICE_INPUT_MOTION_ACK_BUNCH = 8;

wdi.ClientGui = $.spcExtend(wdi.EventObject.prototype, {
	width: null,
	height: null,
	canvas: null,
	ack_wait: 0,
	mouse_mode: 0,
	mouse_status: 0,
	eventLayer: null,
	counter: 0,
	mainCanvas: 0,
	firstTime: true,
	clientOffsetX: 0,
	clientOffsetY: 0,
	magnifier: null,
	magnifierBackground: null,
	firstMove: true,
	isMagnified: true,
	isMouseDown: false,
	soundStarted: false,
	canvasMarginY: 0,
	canvasMarginX: 0,
	stuckKeysHandler: null,

	subCanvas: {},
	inputManager: null,
	clipboardEnabled: true,
	layer: null,
	freezeClass: 'freeze',
	app: {},

	init: function(c) {
		this.time = Date.now();
		this.canvas = {};
		this.contexts = {};
		this.superInit();
		this.magnifier = window.$('<canvas/>').attr({
			'width': 150,
			'height': 150
		}).css({
				'position': 'absolute',
				'left': '0px',
				'top': '0px'
			});
		this.stuckKeysHandler = c.stuckKeysHandler || new wdi.StuckKeysHandler();
		this.settings = c.settings || {};
		this.stuckKeysHandler.addListener('inputStuck', this._sendInput.bind(this), this);

		//load magnifier background
		this.magnifierBackground = window.$('<img/>');
		this.magnifierBackground.attr('src', 'resources/magnifier.png');
		this.initSound();
		this.inputManager = c.inputManager || new wdi.InputManager({ stuckKeysHandler: this.stuckKeysHandler, window: $(window)});
		this.inputManager.setCurrentWindow(window);
		this.clipBoardDataParser = c.clipBoardDataParser || new wdi.ClipboardDataParser({});
		this.localClipboard = c.localClipboard || new wdi.LocalClipboard({clientGui: this});
		this.app = c.app;

		var self = this;
		this.eventHandlers = {
			hide: function () {
				self.stuckKeysHandler.releaseAllKeys()
			}
		};
		window.$(document).on(this.eventHandlers);
	},

	dispose: function() {
		
		$(document).off(this.eventHandlers);
		this.unbindDOM();
		this.removeAllCanvases();
		this.inputManager.dispose();
		this.stuckKeysHandler.dispose();
		this.localClipboard.dispose();

		this.width = null;
		this.height = null;
		this.canvas = null;
		this.ack_wait = 0;
		this.mouse_mode = 0;
		this.mouse_status = 0;
		this.eventLayer = null;
		this.counter = 0;
		this.mainCanvas = 0;
		this.firstTime = true;
		this.clientOffsetX = 0;
		this.clientOffsetY = 0;
		this.magnifier = null;
		this.magnifierBackground = null;
		this.firstMove = true;
		this.isMagnified = true;
		this.isMouseDown = false;
		this.soundStarted = false;
		this.canvasMarginY = 0;
		this.canvasMarginX = 0;
		this.stuckKeysHandler = null;
		this.subCanvas = {};
		this.inputManager = null;
		this.clipboardEnabled = true;
		this.layer = null;
		clearInterval(self.rightClickTimer); //cancel, this is not a right click
		clearInterval(self.mouseDownTimer);  //cancel

	},

	removeAllCanvases: function() {
		var self = this;
		Object.keys(this.canvas).forEach(function (key) {
			$(self.canvas[key]).remove();
			delete self.canvas[key];
			delete self.contexts[key];
		});
		$(this.eventLayer).remove();
		this.eventLayer = null;
	},

	unbindDOM: function() {
		if (this.eventLayer) {
			var events = [
				'touchstart',
				'touchmove',
				'touchend',
				'mouseup',
				'mousedown',
				'mousemove',
				'contextmenu',
				'mousewheel'
			];
			events.forEach(function(event) {
				$(this.eventLayer).unbind(event);
			});
		}
	},

	freeze: function() {
		if (this.canvas[0]) {
			var image = new Image();
			var cnv = this.canvas[0];
			var $cnv = $(cnv);
			$(image).attr('style', $cnv.attr('style'));
			$(image).attr('class', this.freezeClass);
			image.src = cnv.toDataURL("image/png");
			$cnv.parent().append($(image));
		}
	},

	cancelFreeze: function() {
		$('.'+this.freezeClass).remove();
	},

	setLayer: function(layer) {
		this.layer = layer;
	},

	disableClipboard: function () {
		this.clipboardEnabled = false;
	},

	_sendInput: function (params) {
		var data = params;
		var type = data[0];
		var event = data[1];
		this.fire('input', [type, event]);
	},

	releaseAllKeys: function() {
		this.stuckKeysHandler.releaseAllKeys();
	},

	getContext: function(surface_id) {
		return this.contexts[surface_id];
	},

	getCanvas: function(surface_id) {
		return this.canvas[surface_id];
	},

	checkFeatures: function() {
		if (!Modernizr.canvas || !Modernizr.websockets) {
			alert('Your Browser is not compatible with WDI. Visit ... for a list of compatible browsers');
			return false;
		}
		return true;
	},

	deleteSubCanvas: function(window) {
		var obj = this.subCanvas[window['hwnd']];
		this.subCanvas[window['hwnd']] = null;
		return obj;
	},

	moveSubCanvas: function(window) {
		var obj = this.subCanvas[window['hwnd']];
		obj['info'] = window;
		this._fillSubCanvasFromWindow(window);
		return obj;
	},

	resizeSubCanvas: function(window) {
		var obj = this.subCanvas[window['hwnd']];
		$([obj["canvas"], obj["eventLayer"]]).attr({
			'width': window['width'],
			'height': window['height']
		});
		obj['info'] = window;
		this._fillSubCanvasFromWindow(window);
		return obj;
	},

	_fillSubCanvasFromWindow: function(window) {
		var top = parseInt(window.top, 10);
		var left = parseInt(window.left, 10);
		var width = parseInt(window.width, 10);
		var height = parseInt(window.height, 10);
		this.fillSubCanvas({
			top: top,
			left: left,
			right: left + width,
			bottom: top + height
		});
	},

	createNewSubCanvas: function(window) {
		var evtlayer = this.createEventLayer(window['hwnd'] + '_event', window['width'], window['height']);
		this.subCanvas[window['hwnd']] = {
			'canvas': $('<canvas/>').attr({
				width: window['width'],
				height: window['height']
			}).css({
					display: window['iconic'] ? 'none' : 'block'
				})[0],
			'eventLayer': evtlayer,
			'info': window,
			'position': 0
		};
		//we have the main area drawn?
		if (this.canvas[this.mainCanvas]) {
			this._fillSubCanvasFromWindow(window);
		}
		return [this.subCanvas[window['hwnd']]];
	},

	fillSubCanvas: function(filterPosition) {
		var canvas = this.canvas[this.mainCanvas];
		var info = null;
		for (var i in this.subCanvas) {
			if (this.subCanvas[i] != null && this.subCanvas[i] !== undefined && this.subCanvas.hasOwnProperty(i)) {
				info = this.subCanvas[i]['info'];
				if(filterPosition!= null || filterPosition != undefined) {
					var top = parseInt(info['top'], 10);
					var left = parseInt(info['left'], 10);
					var width = parseInt(info['width'], 10);
					var height = parseInt(info['height'], 10);
					var position = {
						top: top,
						left: left,
						right: left + width,
						bottom: top + height
					};
					if (wdi.CollisionDetector.thereIsBoxCollision(position, filterPosition)) {
						this._doDrawSubCanvas(canvas, this.subCanvas[i], info);
					}
				} else {
					this._doDrawSubCanvas(canvas, this.subCanvas[i], info);
				}
			}
		}
	},

	_doDrawSubCanvas: function(canvas, subCanvas, info) {
		if(this.canvas[this.mainCanvas] == null || this.canvas[this.mainCanvas] == undefined) {
			return;
		}
		var destCtx = null;
		if (info['iconic'] === 0) {
			var destCanvas = subCanvas['canvas'];
			destCtx = destCanvas.getContext("2d");

			var x = 0;
			var y = 0;
			var width = +info.width;
			var height = +info.height;
			var left = +info['left'];
			var top = +info['top'];

			if (left < 0) {
				width = width + left;
				x = -left;
				left = 0;
			}

			if (top < 0) {
				height = height + top;
				y = -top;
				top = 0;
			}

			try {
				// if width or height are less than 1 or a float
				// drawImage fails in firefox (ERROR: IndexSizeError)
				width = Math.max(1, Math.floor(width));
				height = Math.max(1, Math.floor(height));
				if (width > canvas.width) width = canvas.width;
				if (height > canvas.height) height = canvas.height;
				destCtx.drawImage(canvas, left, top, width, height, x, y, width, height);
			} catch (err) {
				
			}

		}
	},

	removeCanvas: function(spiceMessage) {
		var surface = spiceMessage.args;
		if (surface.surface_id === this.mainCanvas) {
			$(this.eventLayer).remove();
			this.eventLayer = null;
		}

		this.canvas[surface.surface_id].keepAlive = false;
		delete this.canvas[surface.surface_id];
		delete this.contexts[surface.surface_id];
	},

	drawCanvas: function(spiceMessage) {
		
		var surface = spiceMessage.args;
		var cnv = wdi.GlobalPool.create('Canvas');
		cnv.keepAlive = true; //prevent this canvas to return to the pool by packetfilter

		cnv.id = 'canvas_' + surface.surface_id;
		cnv.width = surface.width * this.pixelRatio;
		cnv.height = surface.height * this.pixelRatio;
		cnv.style.position = 'absolute';
		cnv.style.top = this.canvasMarginY + 'px';
		cnv.style.left = this.canvasMarginX + 'px';
		cnv.style.width = surface.width + 'px';
		cnv.style.height = surface.height+ 'px';

		this.canvas[surface.surface_id] = cnv;
		this.contexts[surface.surface_id] = cnv.getContext('2d');

		if (surface.flags && !wdi.SeamlessIntegration) {
			this.mainCanvas = surface.surface_id;

			this.eventLayer = this.createEventLayer('eventLayer', surface.width, surface.height);

			var evLayer = $(this.eventLayer).css({
				position: 'absolute',
				top: this.canvasMarginY + 'px',
				left: this.canvasMarginX + 'px'
			})[0];

			if(this.layer) {
				this.layer.appendChild(cnv);
				this.layer.appendChild(evLayer);
			} else {
				document.body.appendChild(cnv);
				document.body.appendChild(evLayer);
			}

			this.enableKeyboard();
		}

		//this goes here?
		if (this.firstTime && this.clipboardEnabled) {
			var self = this;
			var PASTES_PER_SECOND = this.settings.PASTES_PER_SECOND || 5;

			var firePaste = _.throttle(function (data) {
				self.fire('paste', data);
			}, 1000 / PASTES_PER_SECOND);

			$(document).bind('paste', function (event) {
				self.clipBoardDataParser.parse(event.originalEvent.clipboardData, firePaste);
			});


			$(document).bind('copy', function (e) {
				self.app.sendShortcut(wdi.keyShortcutsHandled.CTRLC);
			});

			this.firstTime = false;
		}


		//notify about resolution
		if (surface.flags) {
			this.fire('resolution', [this.canvas[surface.surface_id].width, this.canvas[surface.surface_id].height]);
		}
	},

	disableKeyboard: function() {
		var documentDOM = window.$(window.document);
		documentDOM.unbind('keydown', this.handleKey);
		documentDOM.unbind('keyup', this.handleKey);
		documentDOM.unbind('keypress', this.handleKey);
		this.inputManager.disable();
	},

	enableKeyboard: function() {
		var self = this,
			documentDOM = window.$(window.document);
		documentDOM['keydown']([self], this.handleKey);
		documentDOM['keypress']([self], this.handleKey);
		documentDOM['keyup']([self], this.handleKey);
		this.inputManager.enable();
	},

	setCanvasMargin: function(canvasMargin) {
		this.canvasMarginX = canvasMargin.x;
		this.canvasMarginY = canvasMargin.y;
	},

	createEventLayer: function(event_id, width, height) {
		var self = this;

		var eventLayer = $('<canvas/>').css({
			cursor: 'default',
			position: 'absolute'
		}).attr({
				id: event_id,
				width: width,
				height: height
			});

		if (window['bowser']['firefox']) {
			eventLayer.attr('contentEditable', true);
		}

		eventLayer.bind('touchstart', function(event) {
			event.preventDefault();
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			var x = touch.pageX;
			var y = touch.pageY;
			self.generateEvent.call(self, 'mousemove', [x + self.clientOffsetX, y + self.clientOffsetY, self.mouse_status]);
			if (event.originalEvent.touches.length === 1) {
				self.enabledTouchMove = true;
				self.launchRightClick.call(self, x, y);
			} else if (event.originalEvent.touches.length === 2) {
				self.touchX = x;
				self.touchY = y;
				self.enabledTouchMove = false;
			} else if (event.originalEvent.touches.length === 3) {
				self.touchY3 = y;
				self.enabledTouchMove = false;
			}

		});

		eventLayer.bind('touchmove', function(event) {
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			var x = touch.pageX;
			var y = touch.pageY;
			//TODO: ignore first move
			if (event.originalEvent.touches.length === 1 && self.enabledTouchMove) {
				self.isMagnified = true; //magnified!
				clearInterval(self.rightClickTimer); //cancel, this is not a right click

				if (!self.isMouseDown) {
					clearInterval(self.mouseDownTimer); //cancel, not enough time to send mousedown
					self.launchMouseDown(); //fire again
				}


				self.generateEvent.call(self, 'mousemove', [x + self.clientOffsetX, y + self.clientOffsetY - 80, self.mouse_status]);
				var pos = $(this).offset();
				var myX = x - pos.left;
				var myY = y - pos.top;

				//draw magnifier
				if (self.firstMove) {
					$('body').append(self.magnifier);//TODO: append to body?
					self.firstMove = false;
				}

				var posX = myX - 75;
				var posY = myY - 160;

				self.magnifier.css({
					'left': posX,
					'top': posY
				});

				//fill magnifier
				var ctx = self.magnifier[0].getContext('2d');
				ctx.clearRect(0, 0, 150, 150);
				ctx.save();
				ctx.beginPath();
				ctx.arc(75, 75, 75, 0, 2 * Math.PI, false);
				ctx.clip();
				ctx.drawImage(
					self.getCanvas(0),
					myX - 50, //-50 because we are going to get
					myY - 50 - 80, //100 px and we want the finder to be the center
					//-80 becasue the magnifier is 160px up (160/2)
					//we need to clean all this after the demo
					//is working
					100,
					100,
					0,
					0,
					150,
					150
				);
//				//draw the background
				ctx.drawImage(self.magnifierBackground[0], 0, 0);
				ctx.restore();
				//empty magnifier
			} else if (event.originalEvent.touches.length === 2) {
				var delta = self.touchY - y;
				if (Math.abs(delta) > 10) {
					var button = delta > 0 ? 4 : 3;
					self.touchX = x;
					self.touchY = y;
					self.generateEvent.call(self, 'mousedown', button);
					self.generateEvent.call(self, 'mouseup', button);
				}
			} else if (event.originalEvent.touches.length === 3) {
				var delta = self.touchY3 - y;
				if (delta > 100) {
					document.getElementById('hiddeninput').select();
				}
			}
			event.preventDefault();
		});

		eventLayer.bind('touchend', function(event) {
			if (self.enabledTouchMove) {
				var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
				var x = touch.pageX;
				var y = touch.pageY;
				if (!self.isMouseDown) {
					self.generateEvent.call(self, 'mousedown', 0);
				}
				self.isMouseDown = false;
				self.generateEvent.call(self, 'mouseup', 0);
				var pos = $(this).offset();

				self.enabledTouchMove = false;
				self.firstMove = true;
				if (self.isMagnified) {
					self.magnifier.remove();
				}
				self.isMagnified = false;
			}
			clearInterval(self.rightClickTimer); //cancel, this is not a right click
			clearInterval(self.mouseDownTimer);  //cancel
		});

		//if (!Modernizr.touch) {
			eventLayer['mouseup'](function(event) {
				var button = event.button;

				self.generateEvent.call(self, 'mouseup', button);
				self.mouse_status = 0;
				event.preventDefault();
			});

			eventLayer['mousedown'](function(event) {
				var button = event.button;

				self.generateEvent.call(self, 'mousedown', button);
				self.mouse_status = 1;
				event.preventDefault();
			});

			eventLayer['mousemove'](function(event) {
				var x = event.pageX;
				var y = event.pageY;
				self.generateEvent.call(self, 'mousemove', [(x + self.clientOffsetX)*self.pixelRatio, (y + self.clientOffsetY) * self.pixelRatio, self.mouse_status]);
				event.preventDefault();
			});

			eventLayer.bind('contextmenu', function(event) {
				event.preventDefault();
				return false;
			});
		//}

		var mouseEventPause = false;

		var fireWheel = _.throttle(function(event, delta) {
			var button = delta > 0 ? 3 : 4;

			self.generateEvent.call(self, 'mousedown', button);
			self.generateEvent.call(self, 'mouseup', button);

			return false;
		}, 60);

		eventLayer.bind('mousewheel', fireWheel);

		this.fire('eventLayerCreated', eventLayer[0]);

		wdi.VirtualMouse.setEventLayer(eventLayer[0], 0, 0, width, height, 1);
		return eventLayer[0];
	},

	launchRightClick: function(x, y) {
		var self = this;
		this.rightClickTimer = setTimeout(function() {
			self.generateEvent.call(self, 'mousedown', 2);
			self.generateEvent.call(self, 'mouseup', 2);
			self.enabledTouchMove = false;
		}, 400);
	},

	launchMouseDown: function(x, y) {
		var self = this;
		this.mouseDownTimer = setTimeout(function() {
			self.isMouseDown = true;
			self.generateEvent.call(self, 'mousedown', 0);
		}, 1500);
	},

	showError: function(message) {
		
		$('<div/>', {
			id: 'error'
		}).html(message).css({
				'background-color': '#ff4141'
			}).appendTo('body');

		setTimeout("$('#error').remove()", 2000);
	},

	generateEvent: function(event, params) {
		if (event === 'mousemove' || event === 'joystick') {
			if (this.ack_wait < wdi.SPICE_INPUT_MOTION_ACK_BUNCH) {
				this.ack_wait++;
				this.fire('input', [event, params]);
			}
		} else {
			if (event.indexOf('key') > -1) { // it's a keyEvent
				this.stuckKeysHandler.checkSpecialKey(event, params[0]['keyCode']);
				if (!this.shouldGenerateKeyEvents(params[0]['keyCode'])) { // Special keys should not generate keyEvents
					return;
				}
				var val = this.inputManager.getValue();
				if (val) {
					params = this.inputManager.manageChar(val, params);
				}
			}
			this.fire('input', [event, params]);
		}
	},

	shouldGenerateKeyEvents: function(keyCode) {
		return !this.inputManager.isSpecialKey(keyCode);
	},

	motion_ack: function() {
		this.ack_wait = 0;
	},

	setMouseMode: function(mode) {
		this.mouse_mode = mode;
	},

	handleKey: function(e) {
		e.data[0].generateEvent.call(e.data[0], e.type, [e]);

		if (wdi.Keymap.isInKeymap(e.keyCode) && e.type !== "keypress") {
			e.preventDefault();
		}
	},

	setClientOffset: function(x, y) {
		this.clientOffsetX = x;
		this.clientOffsetY = y;
	},

	setClipBoardData: function(data) {
		//we have received new clipboard data
		//show to the user
		//TODO: create a new dialog with buttons to copy the data directly
		//from the textbox
		//prompt("New clipboard data available, press ctrl+c to copy it", data);
	},

	setToLocalClipboard: function(data) {
		this.localClipboard.updateClipboardBuffer(data.value);
	},

	getStuckKeysHandler: function () {
		return this.stuckKeysHandler;
	},

	initSound: function() {
		var self = this;
//		if (!Modernizr.touch) {
			this.soundStarted = true;
			window.setTimeout(function() {
				self.fire('startAudio');
			}, 100);
/*		} else {
			var $button = $('<button>Start</button>', {id: "startAudio"}).css({
				padding: "10px 25px",
				fontSize: "25px",
				fontFamily: "Verdana",
				cursor: "pointer",
				margin: "0 auto"
			}).click(function() {
					self.soundStarted = true;
					self.fire('startAudio');
					$('#soundButtonContainer').remove();
				});

			var $messageContainer = $('<div id="messageContainer"><p>Click to start using your virtual session:</p></div>').css({
				color: "white",
				textAlign: "center",
				fontSize: "25px",
				fontFamily: "Verdana",
				marginTop: "75px"
			});

			var $container = $('<div></div>', {id: "soundButtonContainer"});

			$button.appendTo($messageContainer);
			$messageContainer.appendTo($container);
			$container.appendTo('body');

			$container.css({
				position: 'absolute',
				zIndex: 999999999,
				top: 0,
				left: 0,
				width: "100%",
				height: document.height,
				backgroundColor: "black"
			});
		}*/
	}

});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.CheckActivity = $.spcExtend(wdi.EventObject.prototype, {

    init: function(milliseconds) {
        this.superInit();
        this.milliseconds = milliseconds || 600000;
        this.eventHandlers = {
            keydown: this.resetActivity.bind(this),
            mousemove: this.resetActivity.bind(this),
            click: this.resetActivity.bind(this)
        };
        this.activityTimeout = this.createTimeout();
        $(document).on(this.eventHandlers);
    },

    resetActivity: function(e) {
        clearTimeout(this.activityTimeout);
        this.activityTimeout = this.createTimeout();
    },

    createTimeout: function() {
        var self = this;
        return setTimeout(function() {
            self.fire('activityLost');
        }, this.milliseconds);
    },

    dispose: function() {
        $(document).off(this.eventHandlers);
        clearTimeout(this.activityTimeout);
    }
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


wdi.PacketProcess = $.spcExtend(wdi.DomainObject, {
	processors: {},
	
	init: function(c) {
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_MAIN] = c.mainProcess || new wdi.MainProcess({
			app: c.app
		});
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_DISPLAY] = c.displayProcess || new wdi.DisplayPreProcess({
			clientGui: c.clientGui,
			disableMessageBuffering: c.disableMessageBuffering
		});
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_INPUTS] = c.inputsProcess || new wdi.InputProcess({
			clientGui: c.clientGui,
			spiceConnection: c.spiceConnection
		});
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_CURSOR] = c.cursorProcess || new wdi.CursorProcess();
        this.processors[wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK] = c.playbackProcess || new wdi.PlaybackProcess({
			app: c.app
		});
	},
            
    process: function(spiceMessage) {
        if(wdi.exceptionHandling) {
            return this.processExceptionHandled(spiceMessage);
        } else {
            return this.processPacket(spiceMessage);
        }
    },
            
    processExceptionHandled: function(spiceMessage) {
        try {
            return this.processPacket(spiceMessage);
        } catch(e) {
            
        }        
    },

	processPacket: function(spiceMessage) {
		if(!spiceMessage || !this.processors[spiceMessage.channel]) {
			throw "Invalid channel or null message";
		}

        this.processors[spiceMessage.channel].process(spiceMessage);
	},

	dispose: function () {
		
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_MAIN].dispose();
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_DISPLAY].dispose();
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_INPUTS].dispose();
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_CURSOR].dispose();
		this.processors[wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK].dispose();
		this.processors = {};
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketFilter = {
	restoreContext: false,
	start: null,
	dispose: function () {
		
		this.restoreContext = false;
		this.start = null;
	},

	filter: function(spiceMessage, fn, scope, clientGui) {
		if(wdi.logOperations) {
			this.start = Date.now();
		}

		//TODO: design an architecture for loading
		//dynamic filters, instead of filtering here.
		//This should be just the entry point for filters.
		if (wdi.graphicDebug && wdi.graphicDebug.debugMode) {
			wdi.graphicDebug.printDebugMessageOnFilter(spiceMessage, clientGui);
		}
		//end of hardcoded filter

        // MS Word Benchmark startup
        if (wdi.IntegrationBenchmark && wdi.IntegrationBenchmark.benchmarking) {
            var date = new Date();
            wdi.IntegrationBenchmark.setStartTime(date.getTime());
        }

		//check clipping
		if(spiceMessage.args.base) {
			if(spiceMessage.args.base.clip.type === wdi.SpiceClipType.SPICE_CLIP_TYPE_RECTS) {
				var context = clientGui.getContext(spiceMessage.args.base.surface_id);
				context.save();
				context.beginPath();
				var rects = spiceMessage.args.base.clip.rects.rects;
				var len = rects.length;
				while(len--) {
					var box = wdi.graphics.getBoxFromSrcArea(rects[len]);
					context.rect(box.x, box.y, box.width, box.height);
				}
				context.clip();
				this.restoreContext = spiceMessage.args.base.surface_id;
			}
		}
        fn.call(scope, spiceMessage);
	},

    notifyEnd: function(spiceMessage, clientGui) {
		if(this.restoreContext !== false) {
			var context = clientGui.getContext(this.restoreContext);
			context.restore();
			this.restoreContext = false;
		}

        if(wdi.SeamlessIntegration) {
			var filterPosition = null;
			if(spiceMessage.args.base && spiceMessage.args.base.box) {
				filterPosition = spiceMessage.args.base.box;
			}
            clientGui.fillSubCanvas(filterPosition);
        }

		if (wdi.graphicDebug && wdi.graphicDebug.debugMode) {
			wdi.graphicDebug.printDebugMessageOnNotifyEnd(spiceMessage, clientGui);
		}

        // MS Word Benchmark
        if (wdi.IntegrationBenchmark && wdi.IntegrationBenchmark.benchmarking) {
            var date = new Date();
            wdi.IntegrationBenchmark.setEndTime(date.getTime());
        }

        // clear the tmpcanvas
        wdi.GlobalPool.cleanPool('Canvas');
		wdi.GlobalPool.cleanPool('Image');
		if(wdi.logOperations) {
			wdi.DataLogger.log(spiceMessage, this.start);
		}
	}



}


/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PacketFactory = {
	dispose: function () {
		
	},
	extract: function(rawSpiceMessage) {
		var packet = null;
		switch (rawSpiceMessage.channel) {
			case wdi.SpiceVars.SPICE_CHANNEL_DISPLAY:
				if (wdi.graphicDebug && wdi.graphicDebug.debugMode) {
					var originalData = JSON.stringify(rawSpiceMessage);
				}
				switch (rawSpiceMessage.header.type) {
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_MODE:
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_MARK:
                        packet = new wdi.SpiceDisplayMark().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_RESET:
                        packet = new wdi.SpiceDisplayReset().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_COPY_BITS:
						packet = new wdi.SpiceCopyBits().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_LIST:
						packet = new wdi.SpiceResourceList().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_ALL_PIXMAPS:
						//TODO: remove all pixmaps
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_PALETTE:
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_INVAL_ALL_PALETTES:
                        packet =  new wdi.SpiceDisplayInvalidAllPalettes().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CREATE:
						packet =  new wdi.SpiceStreamCreate().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DATA:
						packet =  new wdi.SpiceStreamData().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_CLIP:
						packet =  new wdi.SpiceStreamClip().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DESTROY:
						packet =  new wdi.SpiceStreamDestroy().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_STREAM_DESTROY_ALL:
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_FILL:
						packet = new wdi.SpiceDrawFill().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_OPAQUE:
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_COPY:
						// Spice Draw Copy is composed by DisplayBase (surface_id 32, SpiceRect(top 32, left 32, bottom 32, right 32), SpiceClip(type 8 if 1: SpiceClipRects(num_rects 32, vector: SpiceRect(top 32, left 32, bottom 32, right 32)))) and SpiceCopy (offset 32 if not 0: SpiceImage(SpiceImageDescriptor(id 32, type 8, flags 8, width 32, height 32), case descriptor type to parse image), SpiceRect(top 32, left 32, bottom 32, right 32), rop_descriptor 16, scale_mode 8, SpiceQMask)
						packet = new wdi.SpiceDrawCopy().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLEND:
						packet = new wdi.drawBlend().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_BLACKNESS:
						packet = new wdi.SpiceDrawBlackness().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_WHITENESS:
						packet = new wdi.SpiceDrawWhiteness().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_INVERS:
						packet = new wdi.SpiceDrawInvers().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ROP3:
						packet = new wdi.SpiceDrawRop3().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_STROKE:
						packet = new wdi.SpiceStroke().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TEXT:
						packet = new wdi.SpiceDrawText().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_TRANSPARENT:
						packet = new wdi.drawTransparent().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_DRAW_ALPHA_BLEND:
						packet = new wdi.drawAlphaBlend().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_CREATE:
						packet = new wdi.SpiceSurface().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_DISPLAY_SURFACE_DESTROY:
						packet = new wdi.SpiceSurfaceDestroy().demarshall(rawSpiceMessage.body);
						break;
				}
				break;
			case wdi.SpiceVars.SPICE_CHANNEL_INPUTS:
				switch (rawSpiceMessage.header.type) {
					case wdi.SpiceVars.SPICE_MSG_INPUTS_MOUSE_MOTION_ACK:
						packet = new Object(); //dummy!
						break;
				}
				break;
			case wdi.SpiceVars.SPICE_CHANNEL_MAIN:
				switch (rawSpiceMessage.header.type) {
					case wdi.SpiceVars.SPICE_MSG_MAIN_INIT:
						packet = new wdi.RedMainInit().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_DATA:
						packet = new wdi.VDAgentMessage().demarshall(rawSpiceMessage.body);
						break;
					case wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_DISCONNECTED:
						packet = new wdi.SpiceMsgMainAgentDisconnected().demarshall(rawSpiceMessage.body);
						break;
                    case wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_CONNECTED:
                        packet = new wdi.SpiceMsgMainAgentConnected().demarshall(rawSpiceMessage.body);
                        break;
                    case wdi.SpiceVars.SPICE_MSG_MAIN_MULTI_MEDIA_TIME:
                        packet = new wdi.MainMultiMediaTime().demarshall(rawSpiceMessage.body);
                        break;
                    case wdi.SpiceVars.SPICE_MSG_MAIN_CHANNELS_LIST:
                        packet = new wdi.MainMChannelsList().demarshall(rawSpiceMessage.body);
                        break;
				}
				break;
			case wdi.SpiceVars.SPICE_CHANNEL_CURSOR:
				switch (rawSpiceMessage.header.type) {
					case wdi.SpiceVars.SPICE_MSG_CURSOR_INIT:
						packet = new wdi.RedCursorInit().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
						break;
					case wdi.SpiceVars.SPICE_MSG_CURSOR_SET:
						packet = new wdi.RedCursorSet().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
						break;
					case wdi.SpiceVars.SPICE_MSG_CURSOR_HIDE:
						packet = new wdi.RedCursorHide().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
						break;
				}
				break;
            case wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK:
                switch(rawSpiceMessage.header.type) {
                    case wdi.SpiceVars.SPICE_MSG_PLAYBACK_MODE:
                        packet = new wdi.PlaybackMode().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
                        break;
                    case wdi.SpiceVars.SPICE_MSG_PLAYBACK_START:
                        packet = new wdi.PlaybackStart().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
                        break;
                    case wdi.SpiceVars.SPICE_MSG_PLAYBACK_STOP:
                        packet = new wdi.PlaybackStop().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
                        break;
                    case wdi.SpiceVars.SPICE_MSG_PLAYBACK_DATA:
                        packet = new wdi.PlaybackData().demarshall(rawSpiceMessage.body, rawSpiceMessage.header.size);
                        break;
                }
		}
		if(packet) {
			if (wdi.graphicDebug && wdi.graphicDebug.debugMode && originalData) {
				packet.originalData = originalData;
			}
			return new wdi.SpiceMessage({
				messageType: rawSpiceMessage.header.type, 
				channel: rawSpiceMessage.channel, 
				args: packet
			});
		} 
		
		return false;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

Application = $.spcExtend(wdi.DomainObject, {
    spiceConnection: null,
    clientGui: null,
    agent: null,
    externalCallback: null,
    keyboardEnabled: true,
    packetProcess: null,
    inputProcess: null,
    multimediaTime: null,
    lastMultimediaTime: null,
    busConnection: null,
    busProcess: null,
	timeLapseDetector: null,
    connectionInfo: null,
    reconnecting: null,
    checkActivity: null,
    configs: null,

    init: function (c) {
        this.disposed = false;
        if (!c) {
            c = this.configs || {};
        } else {
            this.configs = c;
        }

        wdi.spiceClientPath = c.spiceClientPath || "";

        
        wdi.GlobalPool.init();
        this.spiceConnection = c.spiceConnection || new wdi.SpiceConnection();
        this.clientGui = c.clientGui || new wdi.ClientGui({app: this});
        this.agent = c.agent || new wdi.Agent({
			app: this
		});

        this.inputProcess = c.inputProcess || new wdi.InputProcess({
			clientGui: this.clientGui,
			spiceConnection: this.spiceConnection
		});
        this.packetProcess = c.packetProcess;
        this.busConnection = c.busConnection || new wdi.BusConnection();
        this.busProcess = c.busProcess || new wdi.BusProcess({
			clientGui: this.clientGui,
			busConnection: this.busConnection
		});
		this.timeLapseDetector = c.timeLapseDetector || new wdi.TimeLapseDetector();
        this.checkActivity = c.checkActivity;
        this.setup();

        if (c['supportHighDPI']) {
            this.clientGui.pixelRatio = window.devicePixelRatio;
            this.pixelRatio = window.devicePixelRatio;

        } else {
            this.clientGui.pixelRatio = 1;
            this.pixelRatio = 1;
        }
    },

    run: function (c) {
        this.runParams = c;
	    if(c.hasOwnProperty('seamlessDesktopIntegration')) {
		    wdi.SeamlessIntegration = c['seamlessDesktopIntegration'];
	    }

		if (!this.packetProcess) {
			var displayProcess = false;

            if (c.useWorkers === false) {
                displayProcess = new wdi.DisplayProcess({
                    clientGui: this.clientGui,
                    disableMessageBuffering: c.disableMessageBuffering
                });
            }

            this.packetProcess = new wdi.PacketProcess({
                app: this,
                clientGui: this.clientGui,
                agent: this.agent,
                spiceConnection: this.spiceConnection,
                inputsProcess: this.inputProcess,
                displayProcess: displayProcess,
                disableMessageBuffering: c.disableMessageBuffering
            });
		}

        if(!this.checkActivity) {
		    this.checkActivity = new wdi.CheckActivity(c.checkActivityInterval);
            this.checkActivity.addListener('activityLost', this.onActivityLost, this);
		}

        if (window.vdiLoadTest) {
            this.spiceConnection.addListener('message', this.onMessage, this);
        } else {
            this.spiceConnection.addListener('message', this.packetProcess.process, this.packetProcess);
        }


        this.busConnection.connect(c);
		this.timeLapseDetector.startTimer();

        if (c['canvasMargin']) {
            this.clientGui.setCanvasMargin(c['canvasMargin']);
        }

        if (c['disableClipboard']) {
            this.agent.disableClipboard();
            this.clientGui.disableClipboard();
            this.enableCtrlV();
        }

        if(c['layer']) {
            this.clientGui.setLayer(c['layer']);
        }

        if (this.clientGui.checkFeatures()) {
            if (wdi.SeamlessIntegration) {
                this.disableKeyboard();//keyboard should start disabled is integrated
            }
            wdi.Keymap.loadKeyMap(c['layout'], this.clientGui.getStuckKeysHandler());
            this.setExternalCallback(c['callback'], c['context']);

            try {
                this.connect({
					host: c['host'],
					port: c['port'],
					protocol: c['protocol'],
					vmHost: c['vmHost'],
					vmPort: c['vmPort'],
                    vmInfoToken: c['vmInfoToken'],
					busHost: c['busHost'],
					token: c['token'],
					connectionControl: c['connectionControl'],
                    heartbeatToken: c['heartbeatToken'],
					heartbeatTimeout: c['heartbeatTimeout']
				});
            } catch (e) {
                this.executeExternalCallback('error', 1);
            }

            this.clientGui.setClientOffset(c['clientOffset']['x'], c['clientOffset']['y']);
        }
		if (c.hasOwnProperty('externalClipboardHandling')) {
			this.externalClipoardHandling = c['externalClipboardHandling'];
		}
    },

    end: function () {
        //TODO: end?
    },

    setup: function () {
        this.spiceConnection.addListener('mouseMode', this.onMouseMode, this);
        this.spiceConnection.addListener('initAgent', this.onInitAgent, this);
        this.spiceConnection.addListener('error', this.onDisconnect, this);
		this.spiceConnection.addListener('channelConnected', this.onChannelConnected, this);
        this.clientGui.addListener('input', this.onClientInput, this);
        this.clientGui.addListener('resolution', this.onResolution, this);
        this.clientGui.addListener('paste', this.onPaste, this);
        this.clientGui.addListener('startAudio', this.onStartAudio, this);
        this.clientGui.addListener('eventLayerCreated', this.onEventLayerCreated, this);
        this.busProcess.addListener('windowCreated', this.onWindowCreated, this);
        this.busProcess.addListener('windowClosed', this.onWindowClosed, this);
        this.busProcess.addListener('windowMoved', this.onWindowMoved, this);
        this.busProcess.addListener('windowResized', this.onWindowResized, this);
        this.busProcess.addListener('windowFocused', this.onWindowFocused, this);
        this.busProcess.addListener('windowMinimized', this.onWindowMinimized, this);
        this.busProcess.addListener('windowRestored', this.onWindowRestored, this);
        this.busProcess.addListener('windowMaximized', this.onWindowMaximized, this);
        this.busProcess.addListener('busConnected', this.onBusConnected, this);
	    this.busProcess.addListener('menuResponse', this.onMenuResponse, this);
		this.busProcess.addListener('networkDriveResponse', this.onNetworkDriveResponse, this);
		this.busProcess.addListener('wrongPathError', this.onWrongPathError, this);
		this.busProcess.addListener('applicationLaunchedSuccessfully', this.onApplicationLaunchedSuccessfully, this);
		this.busProcess.addListener('selectedText', this.onRemoteSelectedText, this);
		this.busProcess.addListener('copiedText', this.onRemoteCopiedText, this);
		this.agent.addListener('clipBoardData', this.onClipBoardData, this);
        this.busConnection.addListener('busMessage', this.onBusMessage, this);
        this.busConnection.addListener('error', this.onDisconnect, this);
		this.timeLapseDetector.addListener('timeLapseDetected', this.onTimeLapseDetected, this);
        this.busProcess.addListener('defaultTypeEvent', this.onDefaultTypeEvent, this);
    },

	onChannelConnected: function(params) {
		var channel = params;
		if (channel === wdi.SpiceVars.SPICE_CHANNEL_INPUTS) {
			this.clientGui.releaseAllKeys();
		}
	},

	onDefaultTypeEvent: function (data) {
		this.executeExternalCallback(data['event'], data);
	},

	onNetworkDriveResponse: function(params) {
		this.executeExternalCallback('networkDriveResponse', params);
	},

    onDisconnect: function (params) {
		var error = params;
        this.executeExternalCallback('error', error);
    },

    onResolution: function (params) {
        this.executeExternalCallback('resolution', params);
    },

    onClipBoardData: function (params) {
		if (this.externalClipoardHandling) {
			this.executeExternalCallback('clipboardEvent', params);
		} else {
			this.clientGui.setClipBoardData(params);
		}
    },

	onRemoteCopiedText: function (data) {
		this.clientGui.setToLocalClipboard(data);
	},

	onRemoteSelectedText: function (data) {
		this.clientGui.setToLocalClipboard(data);
	},

	onWindowMinimized: function (params) {
        var window = params;
        var params = this.clientGui.resizeSubCanvas(window);
        this.executeExternalCallback('windowMinimized', params);
    },

    onWindowFocused: function (params) {
        this.executeExternalCallback('windowFocused', params);
    },

    onWindowRestored: function (params) {
        var window = params;
        var params = this.clientGui.resizeSubCanvas(window);
        this.executeExternalCallback('windowRestored', params);
    },

    onWindowMaximized: function (params) {
        var window = params;
        var params = this.clientGui.resizeSubCanvas(window);
        this.executeExternalCallback('windowMaximized', params);
    },

    onWindowResized: function (params) {
        var window = params;
        var params = this.clientGui.resizeSubCanvas(window);
        this.executeExternalCallback('windowResized', params);
    },

    onWindowMoved: function (params) {
        var window = params;
        var params = this.clientGui.moveSubCanvas(window);
        this.executeExternalCallback('windowMoved', params);
    },

    onWindowClosed: function (params) {
        var window = params;
        var params = this.clientGui.deleteSubCanvas(window);
        this.executeExternalCallback('windowClosed', params);
    },

    onWindowCreated: function (params) {
        var window = params;
        var params = this.clientGui.createNewSubCanvas(window);
        this.executeExternalCallback('windowCreated', params);
    },

	onMenuResponse: function(params) {
		var menuData = params;
		this.executeExternalCallback('menuResponse', menuData);
	},

    //Events
    onClientInput: function (params) {
        var data = params;
		var type = data[0];
		var event = data[1][0];
		if (this.inputProcess.isKeyboardShortcut(type, event)) {
			this._sendCtrlKey(event['keyCode']);
			return;
		}
		this.inputProcess.send(data, type);
	},

    onMessage: function (params) {
        var message = params;
        this.packetProcess.process(message);

        var self = this;

        window.checkResultsTimer && clearTimeout(window.checkResultsTimer);
        window.checkResultsTimer = window.setTimeout(function () {
            self.executeExternalCallback('checkResults');
            window.vdiLoadTest = false;
        }, 5000);

    },

    onBusConnected: function(params) {
        if (wdi.SeamlessIntegration) {
            this.busProcess.requestWindowList(); //request windows list
        }
    },

    onBusMessage: function (params) {
        var message = params;
        this.busProcess.process(message);
    },

    onInitAgent: function (params) {
        this.agent.setClientTokens(params);
        this.agent.sendInitMessage(this);
        this.reconnecting = false;
        this.executeExternalCallback('ready', params);
	},

    onMouseMode: function (params) {
        this.clientGui.setMouseMode(params);
    },

    onPaste: function (params) {
        this.agent.setClipboard(params);
    },

    onStartAudio: function () {
        this.packetProcess.processors[wdi.SpiceVars.SPICE_CHANNEL_PLAYBACK].startAudio();
    },

	onEventLayerCreated: function (params) {
		this.executeExternalCallback('eventLayerCreated', params);
	},

	onTimeLapseDetected: function (params) {
		var elapsedMillis = params;
		this.executeExternalCallback('timeLapseDetected', elapsedMillis);
	},

    connect: function (connectionInfo) {
        
        this.connectionInfo = connectionInfo;
        try {
            this.spiceConnection.connect(connectionInfo);
        } catch (e) {
			
            this.clientGui.showError(e.message);
        }
    },

    reconnect: function(reconnectionInfo) {
        this.reconnecting = true;
        if (reconnectionInfo.freeze) {
            this.freeze();
        }
        this.dispose();
        this.init();
        this.run(this.runParams);
    },

    freeze: function() {
        this.clientGui.freeze();
    },

    cancelFreeze: function() {
        this.clientGui.cancelFreeze();
    },

    setReconnecting: function(reconnecting) {
        this.reconnecting = reconnecting;
    },

    getReconnecting: function() {
        return this.reconnecting;
    },

    setExternalCallback: function (fn, context) {
        this.externalCallback = [fn, context];
    },

    executeExternalCallback: function (action, params) {
        this.externalCallback[0].call(this.externalCallback[1], action, params);
    },

    sendCommand: function (action, params) {
        switch (action) {
            case "close":
                this.busProcess.closeWindow(params['hwnd']);
                break;
            case "move":
                this.busProcess.moveWindow(params['hwnd'], params['x'], params['y']);
                break;
            case "minimize":
                this.busProcess.minimizeWindow(params['hwnd']);
                break;
            case "maximize":
                this.busProcess.maximizeWindow(params['hwnd']);
                break;
            case "restore":
                this.busProcess.restoreWindow(params['hwnd']);
                break;
            case "focus":
                this.busProcess.focusWindow(params['hwnd']);
                break;
            case "resize":
                this.busProcess.resizeWindow(params['hwnd'], params['width'], params['height']);
                break;
            case "run":
                this.busProcess.executeCommand(params['cmd']);
                break;
            case "setResolution":
                this.agent.setResolution(params['width'], params['height']);
                break;
			case 'getMenu':
				this.busProcess.getMenu();
				break;
			case 'reMountNetworkDrive':
				this.busProcess.reMountNetworkDrive(params['host'], params['username'], params['password']);
				break;
            case 'refreshFileSystem':
                this.busProcess.refreshFileSystem();
                break;
            default:
                this.busProcess.sendGenericMessage(action, params);
                break;
		}
    },

    enableKeyboard: function () {
    	this.clientGui.enableKeyboard();
    },

    disableKeyboard: function () {
		this.clientGui.disableKeyboard();
    },

    enableCtrlV: function () {
        wdi.KeymapES.setCtrlKey(86, 0x2F);
        wdi.KeymapUS.setCtrlKey(86, 0x2F);
    },

	disconnect: function() {
		this.busConnection.disconnect();
		this.spiceConnection.disconnect();
	},

    setMultimediaTime: function (time) {
        this.multimediaTime = time;
        this.lastMultimediaTime = Date.now();
    },

    sendShortcut: function(shortcut) {
        if(shortcut == wdi.keyShortcutsHandled.CTRLV) {
            this._sendCtrlKey(86);
        } else if(shortcut == wdi.keyShortcutsHandled.CTRLC) {
            this._sendCtrlKey(67);
        }
    },

    _sendCtrlKey: function (keycode){
        this.inputProcess.send([
            "keydown",
            [
                {
                    'generated': true,
                    'type': "keydown",
                    'keyCode': 17,
                    'charCode': 0
                }
            ]

        ], "keydown"); //ctrl down

        this.inputProcess.send([
            "keydown",
            [
                {
                    'generated': true,
                    'type': "keydown",
                    'keyCode': keycode,
                    'charCode': 0
                }
            ]

        ], "keydown");

        this.inputProcess.send([
            "keyup",
            [
                {
                    'generated': true,
                    'type': "keyup",
                    'keyCode': keycode,
                    'charCode': 0
                }
            ]

        ], "keyup");

        this.inputProcess.send([
            "keyup",
            [
                {
                    'generated': true,
                    'type': "keyup",
                    'keyCode': 17,
                    'charCode': 0
                }
            ]

        ], "keyup"); //ctrl up
    },

	dispose: function () {
        this.disposed = true;
        
        wdi.ExecutionControl.runQ.clear();
        wdi.ExecutionControl.currentProxy = null;
        wdi.ExecutionControl.sync = true;
		this.disableKeyboard();
		this.disconnect();
		this.packetProcess.dispose();
        this.clientGui.dispose();
        this.busProcess.clearEvents();
        this.busProcess.dispose();
        this.busConnection.clearEvents();
        this.agent.clearEvents();
        this.agent.dispose();
        this.timeLapseDetector.clearEvents();
        this.timeLapseDetector.dispose();
        this.checkActivity.dispose();
	},

    onWrongPathError: function (params) {
        this.executeExternalCallback('wrongPathError', params);
    },

    onApplicationLaunchedSuccessfully: function (params) {
        this.executeExternalCallback('applicationLaunchedSuccessfully', params);
    },

    getKeyboardHandler: function() {
        return this.clientGui.handleKey;
    },

    getClientGui: function() {
        return this.clientGui;
    },

    setCurrentWindow: function(wnd) {
        this.clientGui.inputManager.setCurrentWindow(wnd);
    },

    onActivityLost: function(params) {
        this.executeExternalCallback('activityLost', params);
    },

    resetActivity: function() {
        this.checkActivity.resetActivity();
    },

    toSpiceResolution: function (resolution) {
        return {
            width: resolution.width * this.pixelRatio,
            height: resolution.height * this.pixelRatio,
            scaleFactor: this.pixelRatio
        }
    }
});

window['Application'] = Application;
Application.prototype['run'] = Application.prototype.run;
Application.prototype['sendCommand'] = Application.prototype.sendCommand;
Application.prototype['enableKeyboard'] = Application.prototype.enableKeyboard;
Application.prototype['disableKeyboard'] = Application.prototype.disableKeyboard;
Application.prototype['dispose'] = Application.prototype.dispose;
Application.prototype['getKeyboardHandler'] = Application.prototype.getKeyboardHandler;
Application.prototype['getClientGui'] = Application.prototype.getClientGui;
Application.prototype['setCurrentWindow'] = Application.prototype.setCurrentWindow;
Application.prototype['reconnect'] = Application.prototype.reconnect;
Application.prototype['freeze'] = Application.prototype.freeze;
Application.prototype['cancelFreeze'] = Application.prototype.cancelFreeze;
Application.prototype['setReconnecting'] = Application.prototype.setReconnecting;
Application.prototype['getReconnecting'] = Application.prototype.getReconnecting;

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.VirtualMouse = {
	eventLayers: [],
	mouseData:null,
	visible: null,
	lastLayer: null,
	hotspot: {
		x: 0,
		y: 0
	},
	lastMousePosition: {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},

	dispose: function () {
		
		this.eventLayers =  [];
		this.mouseData =  null;
		this.visible =  null;
		this.lastLayer =  null;
		this.hotspot = {
			x: 0,
			y: 0
		};
		this.lastMousePosition = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
	},

	setHotspot: function(x, y) {
		this.hotspot.x = x;
		this.hotspot.y = y;
	},

	setEventLayer: function(ev, x, y, width, height, position) {
		this.eventLayers.push({
			layer: ev,
			left: x,
			top: y,
			right: x+width,
			bottom: y+height,
			position: position
		});
	},

	removeEventLayer: function(ev) {
		var len = this.eventLayers.length;
		for(var i=0;i<len;i++) {
			if(this.eventLayers[i].layer.id === ev.id) {
				this.eventLayers[ev.id] = undefined;
			}
		}
	},

	getEventLayer: function(x, y) {
		var len = this.eventLayers.length;
		var layer = null;
		for(var i=0;i<len;i++) {
			layer = this.eventLayers[i];
			if(x >= layer.left && x <= layer.right && y >= layer.top && y <= layer.bottom) {
				return layer.layer;
			}
		}
	},

	setMouse: function(mouseData, x, y) {
        //if(!Modernizr.touch) {
            var layer = null;
            var len = this.eventLayers.length;
            for(var i=0;i<len;i++) {
                layer = this.eventLayers[i];
                layer.layer.style.cursor = 'url('+mouseData+') ' + x + ' ' + y + ', default';
            }
        //}
	},

	hideMouse: function() {
		var layer = null;
		var len = this.eventLayers.length;
		for(var i=0;i<len;i++) {
			layer = this.eventLayers[i];
			layer.layer.style.cursor = 'none';
		}
	}
}

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.ImageCache = {
	images: {},
	cursor: {},
	palettes: {},

	dispose: function () {
		
		this.images = {};
		this.cursor = {};
		this.palettes = {};
	},

	getImageFrom: function(descriptor, cb) {
	//see http://jsperf.com/todataurl-vs-getimagedata-to-base64/7
		var cnv = wdi.GlobalPool.create('Canvas');
		var imgData = this.images[descriptor.id.toString()];
		cnv.width = imgData.width;
		cnv.height = imgData.height;
		cnv.getContext('2d').putImageData(imgData,0,0);
		cb(cnv);
	},

	isImageInCache: function(descriptor) {
		if(descriptor.id.toString() in this.images) {
			return true;
		}
		return false;
	},

	delImage: function(id) {
		delete this.images[id.toString()];
	},

	addImage: function(descriptor, canvas) {
		if(canvas.getContext) {
			this.images[descriptor.id.toString()] = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
		} else {
			this.images[descriptor.id.toString()] = canvas;
		}

	},

	getCursorFrom: function(cursor) {
		return this.cursor[cursor.header.unique.toString()];
	},

	addCursor: function(cursor, imageData) {
		this.cursor[cursor.header.unique.toString()] = imageData;
	},

	getPalette: function(id) {
		return this.palettes[id.toString()];
	},

	addPalette: function(id, palette) {
		this.palettes[id.toString()] = palette;
	},

	clearPalettes: function() {
		this.palettes = {};
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.RasterOperation = {
	dispose: function () {
		
	},
	process: function(rop, sourceImg, destImg) {//sourceImg could be brush or image (both imageData)
		var result = null;
		if (rop & wdi.SpiceRopd.SPICE_ROPD_INVERS_SRC) {
			sourceImg = this.invert(sourceImg);
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_INVERS_BRUSH) {
			sourceImg = this.invert(sourceImg);
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_INVERS_DEST) {
			destImg = this.invert(destImg);
		}

		if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_PUT) {
			return sourceImg;
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_OR) {
			result = this.boolOp(sourceImg, destImg, 'or');
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_AND) {
			result = this.boolOp(sourceImg, destImg, 'and');
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_XOR) {
			result = this.boolOp(sourceImg, destImg, 'xor');
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_BLACKNESS) {
			result = this.lightness(destImg, 'b');
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_WHITENESS) {
			result = this.lightness(destImg);
		} else if (rop & wdi.SpiceRopd.SPICE_ROPD_OP_INVERS) {
			result = this.invert(destImg);
		}

		if (rop & wdi.SpiceRopd.SPICE_ROPD_INVERS_RES) {
			return this.invert(result);
		} else {
			return result;
		}
		
	},

	flip: function(sourceImg) {
		sourceImg = wdi.Flipper.flip(sourceImg);
		return sourceImg;
	},

	invert: function(sourceImg) {
		sourceImg = $(sourceImg).pixastic('invert')[0];

		return sourceImg;
	},
	
	lightness: function(sourceImg, ratio) {
		var ratio = ratio==='b'?-100:100;
		sourceImg = $(sourceImg).pixastic('hsl', {hue:30,saturation:20,lightness:ratio})[0];
		
		return sourceImg;
	},
	
	boolOp: function(sourceImg, destImg, op) {
		//or and and xor implemented without globalcomposition
		//because it is really buggy
		
		var source = wdi.graphics.getDataFromImage(sourceImg).data;
		var dest = wdi.graphics.getDataFromImage(destImg).data;
		
		var length = source.length-1;
		var tmp_canvas = wdi.graphics.getNewTmpCanvas(sourceImg.width, sourceImg.height);
		var tmp_context = tmp_canvas.getContext('2d');
		
		var resultImageData = tmp_context.createImageData(sourceImg.width, sourceImg.height);
		var result = resultImageData.data;
		
		if(op === 'or') {
			while(length > 0) {
				resultImageData.data[length] = 255;
				result[length-1] = source[length-1] | dest[length-1];
				result[length-2] = source[length-2] | dest[length-2];
				result[length-3] = source[length-3] | dest[length-3];
				length-=4;
			}	
		} else if(op === 'and') {
			while(length > 0) {
				resultImageData.data[length] = 255;
				result[length-1] = source[length-1] & dest[length-1];
				result[length-2] = source[length-2] & dest[length-2];
				result[length-3] = source[length-3] & dest[length-3];
				length-=4;
			}	
		} else if(op === 'xor') {
			while(length > 0) {
				resultImageData.data[length] = 255;
				result[length-1] = source[length-1] ^ dest[length-1];
				result[length-2] = source[length-2] ^ dest[length-2];
				result[length-3] = source[length-3] ^ dest[length-3];
				length-=4;
			}		
		}
		tmp_context.putImageData(resultImageData, 0, 0);
		return tmp_canvas;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.Stream = {
	streams: {},

	dispose: function () {
		
		this.streams = {};
	},
	
	addStream: function(id, stream) {
		this.streams[id] = stream;
	},
	
	deleteStream: function(id) {
		this.streams[id] = undefined;
	},
	
	getStream: function(id) {
		return this.streams[id];
	},
	
	clip: function(id, clip) {
		this.streams[id].clip = clip;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.InputManager = $.spcExtend(wdi.EventObject.prototype, {

	checkFocus: false,
	input: null,
	window: null,
	stuckKeysHandler: null,

	init: function (c) {
		this.time = Date.now();
		
		this.superInit();
		this.input = c.input;
		this.window = c.window;
		this.stuckKeysHandler = c.stuckKeysHandler;
		this.$ = c.jQuery || $;
		if (!c.disableInput) {
			this.inputElement = this.$('<div style="position:absolute"><input type="text" id="inputmanager" style="opacity:0;color:transparent"/></div>');
		}
		this.currentWindow = null;

		// Get client's Operating System
		this.getClientSO();

		// Tildes - MAC compatibility, check index order between 'tildeMarks' y 'tildeReplacements'
		this.tildeMarks = ['´', '`', '^', '¨'];
		this.lastChar = null;

		// Replacements array
		this.tildeReplacements = {
			'a': {
				0: 'á',
				1: 'à',
				2: 'â',
				3: 'ä'
			},
			'e': {
				0: 'é',
				1: 'è',
				2: 'ê',
				3: 'ë'
			},
			'i': {
				0: 'í',
				1: 'ì',
				2: 'î',
				3: 'ï'
			},
			'o':  {
				0: 'ó',
				1: 'ò',
				2: 'ô',
				3: 'ö'
			},
			'u': {
				0: 'ú',
				1: 'ù',
				2: 'û',
				3: 'ü'
			},
			'A': {
				0: 'Á',
				1: 'À',
				2: 'Â',
				3: 'Ä'
			},
			'E': {
				0: 'É',
				1: 'È',
				2: 'Ê',
				3: 'Ë'
			},
			'I': {
				0: 'Í',
				1: 'Ì',
				2: 'Î',
				3: 'Ï'
			},
			'O': {
				0: 'Ó',
				1: 'Ò',
				2: 'Ô',
				3: 'Ö'
			},
			'U': {
				0: 'Ú',
				1: 'Ù',
				2: 'Û',
				3: 'Ü'
			}
		};
	},

	getClientSO: function() {
		var platform = window.navigator.platform.toLowerCase();

		if (platform.indexOf('mac') > -1) {
			this.clientSO = "mac";
		} else if (platform.indexOf('linux')) {
			this.clientSO = "linux";
		} else {
			this.clientSO = "windows";
		}
	},

	setCurrentWindow: function(wnd) {
		wnd = this.$(wnd);
		if(this.currentWindow) {
			this.inputElement.remove();
			//remove listeners
			this.currentWindow.unbind('blur');
		}
		this.$(wnd[0].document.body).prepend(this.inputElement);
		this.input = this.$(wnd[0].document.getElementById('inputmanager'));
		//TODO: remove events from the other window
		this.addListeners(wnd);
		this.currentWindow = wnd;
	},

	dispose: function() {
		this.disposed = true;
		this.inputElement.remove();
		this.currentWindow.unbind('blur');
		this.currentWindow.unbind('input');
		this.inputElement = null;

		this.checkFocus = false;
		this.input = null;
		this.window = null;
		this.stuckKeysHandler = null;
	},

	addListeners: function (wnd) {
		this._onBlur(wnd);
		this._onInput();
	},

	_onBlur: function (wnd) {
		var self = this;
		wnd.on('blur', function onBlur (e) {
			if (self.checkFocus) {
				self.input.focus();
			}
			self.stuckKeysHandler.releaseSpecialKeysPressed();
		});
	},

	_onInput: function () {
		var self = this;

		this.input.on('input', function input (e) {
			// ctrl-v issue related
			var aux = self.input.val();

			if (aux.length > 1) {
				self.reset();
			}
		});
	},

	enable: function () {
		
		this.checkFocus = true;
		this.input.select();
	},

	disable: function () {
		this.checkFocus = false;
		if (this.input) {
			this.input.blur();
		}
	},

	reset: function () {
		this.input.val("");
	},

	getValue: function () {

		var val = this.input.val();
		if (val) {
			this.reset();
		}


		// As MAC has a particular TILDE key behaviour, we need a special treatment to send them
		if (this.clientSO === 'mac') {

			// If my LAST CHAR was *any* of my known accent characters
			// AND my ACTUAL CHAR is a vocal (as a property of accentReplacemtns array)
			if (this.tildeMarks.indexOf(this.lastChar) > -1 && this.tildeReplacements.hasOwnProperty(val)) {

				switch (this.lastChar) {

					case this.tildeMarks[0]:
						val = this.tildeReplacements[val][0];
						break;

					case this.tildeMarks[1]:
						val = this.tildeReplacements[val][1];
						break;

					case this.tildeMarks[2]:
						val = this.tildeReplacements[val][2];
						break;

					case this.tildeMarks[3]:
						val = this.tildeReplacements[val][3];
						break;
				}
			}


			// If the received char is a type of TILDE we need a special process (just for MAC)
			if (val && this.tildeMarks.indexOf(val) > -1) {

				// Only print a TILDE char of pressed twice (MAC natively sends a tilde with one keypress)
				if (val != this.lastChar) {

					this.lastChar = val;
					val = "";

				} else if (val === this.lastChar) {

					this.lastChar = "";
				}

			} else {

				// Ensure 'lastChar' is never empty
				this.lastChar = val ? val:this.lastChar;
			}

		}

		return val;
	},

	manageChar: function (val, params) {
		var res = [Object.create(params[0])];
		res[0]['type'] = 'inputmanager';
		res[0]['charCode'] = val.charCodeAt(0);
		return res;
	},

	isSpecialKey: function(keyCode) {
		var ctrl_keycode = 17;
		return [ctrl_keycode].indexOf(keyCode) !== -1;
	}

});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.BUS_TYPES = {
	file: 0,  // obsolete
	print: 1, // obsolete
	launchApplication: 2,
	windowManagement: 3,
	menu: 5,
	networkDriveManagement: 6,
	clipboard: 9,

	// This is for those messages that doesn't fit in any of
	// the previous types and doesn't deserve its own type.
	generic: 99,


	// Messages used during developing (for benchmarks and whatever).
	// you should not use them in code for production purposes.
	killApplicationDoNotUseInProductionEver: 34423423
};

wdi.BusProcess = $.spcExtend(wdi.EventObject.prototype, {
	busConnection: null,
	clientGui: null,

	init: function(c) {
		this.superInit();
		this.clientGui = c.clientGui;
		this.busConnection = c.busConnection;
	},

	dispose: function () {
		this.clientGui = null;
		this.busConnection = null;
	},

	process: function(message) {
		switch(message['verb']) {
			case "CONNECTED":
				this.busConnection.setSubscriptions();
				this.fire('busConnected');
				break;
			case "MESSAGE":
				this.parseMessage(message['body']);
				break;
			case "ERROR":
				console.error("Bus error");
				break;
			default:
				
		}
	},

	parseMessage: function(body) {
		switch(parseInt(body['type'])) {
			case wdi.BUS_TYPES.launchApplication:
				this.parseLaunchApplicationMessage(body);
				break;
			case wdi.BUS_TYPES.killApplicationDoNotUseInProductionEver:
				// this is a message we send to the other side of the bus
				// so do nothing.
				break;
			case wdi.BUS_TYPES.windowManagement:
				this.parseWindowManagementMessage(body);
				break;
			case wdi.BUS_TYPES.menu:
				this.handleMenuMessage(body);
				break;
			case wdi.BUS_TYPES.networkDriveManagement:
				this._handleNetworkDriveMessage(body);
				break;
			case wdi.BUS_TYPES.clipboard:
				this.handleClipboardMessage(body);
				break;
			default:
				this.fire('defaultTypeEvent', body);
				break;
		}
	},

	_handleNetworkDriveMessage : function(message) {
		if(message.event != 'reMountNetworkDrive') {
			this.fire('networkDriveResponse', message);
		}
	},

	getMenu: function() {
		this.busConnection.send(
			{
				"type": wdi.BUS_TYPES.menu,
				"value": false,
				"event": 'request'
			}
		)
	},

	handleMenuMessage: function(message) {
		if(message.event == 'response') {
			this.fire('menuResponse', message);
		}
	},
	handleClipboardMessage: function(message) {
		if(message.event === 'selectedText' || message.event === 'copiedText') {
			this.fire(message.event, message);
		}
	},

	parseWindowManagementMessage: function(message) {
		switch (message['event']) {
			case 'windowList':
			case 'windowCreated':
			case 'windowClosed':
			case 'windowMoved':
			case 'windowResized':
			case 'windowFocused':
			case 'windowMinimized':
			case 'windowRestored':
			case 'windowMaximized':
				this.fire(message['event'], message['value']);
				break;
			default:
				wdi.Debug.info("Event '" + message['event'] + "' not implemented.")
		}
	},

	closeWindow: function(hwnd) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'closeWindow',
					"hwnd": hwnd
				}
			)
		);
	},

	moveWindow: function(hwnd, x, y) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'moveWindow',
					"hwnd": hwnd,
					"left": x,
					"top": y
				}
			)
		);
	},

	minimizeWindow: function(hwnd) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'minimizeWindow',
					"hwnd": hwnd
				}
			)
		);
	},

	maximizeWindow: function(hwnd) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'maximizeWindow',
					"hwnd": hwnd
				}
			)
		);
	},

	restoreWindow: function(hwnd) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'restoreWindow',
					"hwnd": hwnd
				}
			)
		);
	},

	focusWindow: function(hwnd) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'focusWindow',
					"hwnd": hwnd
				}
			)
		);
	},

	resizeWindow: function(hwnd, width, height) {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'resizeWindow',
					"hwnd": hwnd,
					"width": width,
					"height": height
				}
			)
		);
	},

	requestWindowList: function() {
		this.busConnection.send(
			this._constructWindowManagementMessage(
				{
					"event": 'getWindowList'
				}
			)
		)
	},

	executeCommand: function(cmd) {
		this.busConnection.send(
			{
				"type": wdi.BUS_TYPES.launchApplication,
				"application": cmd
			}
		)

	},

	refreshFileSystem: function(data) {
		this.busConnection.send(
			{
				'type': wdi.BUS_TYPES.file,
				'event': "refreshFileSystem",
				'value': {}
			}
		)
	},

	_constructGenericMessage: function (eventName, data) {
		return {
			'type': wdi.BUS_TYPES.generic,
			'event': eventName,
			'value': data || {}
		};
	},

	_constructWindowManagementMessage: function(obj) {
		if (obj['event'] === undefined) {
			throw new Error("You should pass an 'event' attribute in the object");
		}
		var ret = {
			'type': wdi.BUS_TYPES.windowManagement,
			'event': obj['event'],
			'value': {}
		};
		for (var i in obj) {
			if (i != 'event' && obj.hasOwnProperty(i)) {
				ret['value'][i] = obj[i];
			}
		}
		return ret;
	},

	reMountNetworkDrive: function(host, username, password) {
		this.busConnection.send(
			{
				"type": wdi.BUS_TYPES.networkDriveManagement,
				"event": "reMountNetworkDrive",
				"host": host,
				"username": username,
				"password": password
			}
		)
	},

	parseLaunchApplicationMessage: function (message) {
		switch (message['event']) {
			case 'applicationLauncherWrongAppPathError':
				this.fire('wrongPathError', message);
				break;
			case 'applicationLaunchedSuccessfully':
				this.fire('applicationLaunchedSuccessfully', message);
				break;
			default:
				wdi.Debug.info("Event '" + message['event'] + "' not implemented.")
		}
	},

	sendGenericMessage: function (eventName, data) {
		this.busConnection.send(
			this._constructGenericMessage(eventName, data)
		);
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.DisplayProcess = $.spcExtend(wdi.EventObject.prototype, {
	runQ: null,
	packetFilter: null,
	
	init: function(c) {
		this.runQ = c.runQ || wdi.ExecutionControl.runQ;
		this.packetFilter = c.packetFilter || wdi.PacketFilter;
		this.clientGui = c.clientGui;
		this.displayRouter = c.displayRouter || new wdi.DisplayRouter({clientGui:this.clientGui});
		this.started = false;
		this.waitingMessages = [];
		this.packetWorkerIdentifier = c.packetWorkerIdentifier || new wdi.PacketWorkerIdentifier();
		this.disableMessageBuffering = c.disableMessageBuffering;
	},

	dispose: function () {
		
		clearInterval(this.timer);
		this.timer = null;
		this.runQ = null;
		this.packetFilter.dispose();
		this.packetFilter = null;
		this.clientGui = null;
		this.displayRouter.dispose();
		this.displayRouter = null;
		this.packetWorkerIdentifier.dispose();
		this.packetWorkerIdentifier = null;
		this.started = false;
		this.waitingMessages = [];
	},

	process: function(spiceMessage) {
		//if message buffering is disabled, skip queuing and looking for duplicates, just process the message ASAP
		if(this.disableMessageBuffering) {
			this._process(spiceMessage);
			return;
		}

		var self = this;
		this.waitingMessages.push(spiceMessage);

		if(!this.started) {
			this.timer = setInterval(function() {
				self.flush();
			}, 50);
			this.started = true;
		}

	},

	flush: function() {
		if(this.waitingMessages.length === 0) {
			return;
		}

		var i = 0;
		var spiceMessage;

		//remove redundant draws
		this.removeRedundantDraws();

		var size = this.waitingMessages.length;

		while(i < size) {
			spiceMessage = this.waitingMessages[i];
			this._process(spiceMessage);
			i++;
		}

		this.waitingMessages = [];
	},

	removeRedundantDraws: function() {
		if(this.waitingMessages.length < 2) {
			return;
		}

		var size = this.waitingMessages.length;
		var message, body, imageProperties, rop, base;
		var collision_boxes = {};
		var to_delete = [];
		var deleted = false;
		var surface_id;
		var packetBox;
		var box;
		var i;
		var x;
		while(size--) {
			message = this.waitingMessages[size];
			//should remove any packet from the past overwritten by this one
			body = message.args;
			base = body.base;

			rop = body.rop_descriptor;
			deleted = false;

			//TODO TODO TODO: there is need for a special case for draw_copy_bits?!
			//we need base to have a box
			if(base) {
				surface_id = base.surface_id;
				packetBox = base.box;
				surface_id = base.surface_id;
				//check if this packet is occluded by another packet
				imageProperties = this.packetWorkerIdentifier.getImageProperties(message);
				//if there is no image properties, or there is but cache flags are 0
				if(!collision_boxes[surface_id]) {
					collision_boxes[surface_id] = [];
				}

				if((!imageProperties || (imageProperties && !(imageProperties.descriptor.flags & wdi.SpiceImageFlags.SPICE_IMAGE_FLAGS_CACHE_ME))) && surface_id === 0) {
					for(i=0; i<collision_boxes[surface_id].length; i++) {
						//check if base.box is inside one of the rectangles in collision_boxes
						box = collision_boxes[surface_id][i];
						if(box.bottom >= packetBox.bottom && box.top <= packetBox.top  && box.left <= packetBox.left
							&& box.right >= packetBox.right ) {

							deleted = true;
							to_delete.push(size);

							break;
						}
					}
				}

				//check if the message is still alive, and if it is, then put its box into collision_boxes if the message
				//will overWrite its screen area when painted
				//atm only drawcopy and drawfill have overwritescreenarea set
				if(!deleted && message.messageType === wdi.SpiceVars.SPICE_MSG_DISPLAY_COPY_BITS) {
					break;
				}

				if(!deleted && body.getMessageProperty('overWriteScreenArea', false) && base.clip.type == 0 && rop == wdi.SpiceRopd.SPICE_ROPD_OP_PUT) {
					collision_boxes[surface_id].push(base.box);
				}
			}
		}

		//itareate over messages marked for deletion and remove it from the array
		for(x = 0;x < to_delete.length;x++) {
			this.waitingMessages.splice(to_delete[x], 1);
		}
	},
		
	_process: function(spiceMessage) {
		if (wdi.logOperations) {
			wdi.DataLogger.log(spiceMessage, 0, null, true, '', '_decode');
		}
		//append the message to the runqueue
		//so the packet is not executed until the previous packets
		//finished processing
		this.runQ.add(function(proxy) {

			//pass the message through the packet filter
			//so the packet can be filtered, logged, etc
			this.packetFilter.filter(spiceMessage, function(message) {
				wdi.ExecutionControl.currentProxy = proxy;
				//process the packet
				this.displayRouter.processPacket(message);
				//post process operations
				this.postProcess();
			}, this, this.clientGui);


			//if the packet was synchronous, process next packet
			if (wdi.ExecutionControl.sync) {
				proxy.end();
			}
			//Now message could be asynchronous
		}, this, function() {
		   //this is executed when the message has finished processing
		   //we use processEnd to notify packetFilter about the ending of processing
		   //the current message
		   this.processEnd(spiceMessage, this.clientGui);

		});

		//if this is the first message in the queue, execute it
		//if not, this call will have no effect.
		this.runQ.process();

	},

	processEnd: function(spiceMessage, clientGui) {
		this.packetFilter.notifyEnd(spiceMessage, clientGui);
	},

	postProcess: function() {
		//TEST METHOD DON'T DELETE
	}
});


/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.DisplayPreProcess = $.spcExtend(wdi.EventObject.prototype, {
	displayProcess: null,
	queued: [],
	inProcess: [],
	idleConsumers : [],
	consumers: [],

	init: function(c) {
		this.idleConsumers = [];
		this.superInit();
		this.displayProcess = c.displayProcess || new wdi.DisplayProcess({
				clientGui: c.clientGui,
				disableMessageBuffering: c.disableMessageBuffering
		});
		this.clientGui = c.clientGui;

		/**

		Since javascript do not provide an API to check
		the number of cpu cores available, the best case for average computers
		and devices is 4.

		If the computer doesn't have 4 or more available cores, there is only a little
		memory waste creating the threads and a bit of cpu overheat doing context
		switching.

		There is an ongoing draft in w3c to standarize a way to detect this:

		http://www.w3.org/2012/sysapps/device-capabilities/#cpu

		**/
		if(c.numConsumers == null || c.numConsumers == undefined) c.numConsumers = 4;
		var numConsumers = c.numConsumers;

		for(var i = 0;i<numConsumers; i++) {
			var consumer = new wdi.AsyncConsumer();
			this.consumers.push(consumer);
			this.idleConsumers.push(consumer);
			consumer.addListener('done', this.onConsumerDone, this);
		}
	},

	onConsumerDone: function(e) {
		//we don't care about who has finished, only about the
		//state of the last item in queue
		var waitingTask = this.inProcess[0];
		var task = null;
		var i = 0;

		while(waitingTask && waitingTask.state === 1) {
			task = this.inProcess.shift();
			try {
				this.displayProcess.process(task.message);
			} catch(e) {
				
			}
			waitingTask = this.inProcess[0];
			i++;
		}

		//put the consumer as idle
		this.idleConsumers.push(e);
		//continue processing!
		if(this.queued.length > 0) {
			this.executeConsumer();
		}
	},

	process: function(spiceMessage) {
		this.addTask(spiceMessage); //first of all, queue it
		//it is the only item in the list?
		//we are the only message in the queue... process?
		this.executeConsumer();
	},

	addTask: function(spiceMessage) {
		this.queued.push({
			message: spiceMessage,
			clientGui: this.clientGui
		});
	},

	getNextTask : function () {
		var task = this.queued.shift();
		while(typeof task == 'undefined' && this.queued.length != 0) {
			task = this.queued.shift();
		}

		//we found a task?
		if(typeof task == 'undefined') {
			return false;
		}

		task.state = 0;
		this.inProcess.push(task); //add the task to the inProcess list
		return task;
	},

	executeConsumer: function() {
		//check if there are idle consumers
		if(this.idleConsumers.length > 0) {
			
			
			//idle consumer found
			var consumer = this.idleConsumers.shift();
			//execute the next task in this consumer
			var task = this.getNextTask();

			if(task) {
				consumer.consume(task);
			}

		}
	},

	dispose: function () {
		
		this.clearEvents();
		this.clientGui = null;
		this.queued = [];
		this.inProcess = [];
		this.idleConsumers = [];

		this.displayProcess.dispose();
		this.displayProcess = null;
		this.consumers.forEach(function (consumer) {
			consumer.clearEvents();
			consumer.dispose();
		});

		this.consumers = [];
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.InputProcess = $.spcExtend(wdi.EventObject.prototype, {
	clientGui: null,
	spiceConnection: null,
	
	init: function(c) {
		this.superInit();
		this.clientGui = c.clientGui;
		this.spiceConnection = c.spiceConnection;
	},

	dispose: function() {
		this.clearEvents();
		this.clientGui = null;
		this.spiceConnection = null;
	},
	
	process: function(spiceMessage) {
		switch (spiceMessage.messageType) {
			case wdi.SpiceVars.SPICE_MSG_INPUTS_MOUSE_MOTION_ACK:
				this.clientGui.motion_ack();
				break;
		}
	},
	
	send: function(data, type) {
		var packet, scanCodes, i;
		if(type == 'mousemove') {
			packet = new wdi.SpiceMessage({
				messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_MOUSE_POSITION, 
				channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS, 
				args: new wdi.RedcMousePosition({
					x:data[1][0]+wdi.VirtualMouse.hotspot.x,
					y:data[1][1]+wdi.VirtualMouse.hotspot.y,
					buttons_state:data[1][2],
					display_id:0
				})
			});
			this.spiceConnection.send(packet);
		} else if(type == 'mousedown') {
			packet = new wdi.SpiceMessage({
				messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_MOUSE_PRESS, 
				channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS, 
				args: new wdi.RedcMousePress({
					button_id:data[1]+1,
					buttons_state:1<<data[1]
				})
			});
			this.spiceConnection.send(packet);			
		} else if(type == 'mouseup') {
			packet = new wdi.SpiceMessage({
				messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_MOUSE_RELEASE, 
				channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS, 
				args: new wdi.RedcMousePress({
					button_id:data[1]+1,
					buttons_state:0
				})
			});
			this.spiceConnection.send(packet);				
		} else if (type == 'keydown' || type == 'keypress') {
			scanCodes = wdi.Keymap.getScanCodes(data[1][0]);
			for (i= 0; i<scanCodes.length;i++) {
				packet = new wdi.SpiceMessage({
					messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_KEY_DOWN,
					channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS,
					args: new wdi.SpiceScanCode(scanCodes[i])
				});
				this.spiceConnection.send(packet);
			}
		} else if (type == 'keyup') {
			scanCodes = wdi.Keymap.getScanCodes(data[1][0]);
			for (i= 0; i<scanCodes.length;i++) {
				packet = new wdi.SpiceMessage({
					messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_KEY_UP,
					channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS,
					args: new wdi.SpiceScanCode(scanCodes[i])
				});
				this.spiceConnection.send(packet);
			}
		} else if(type == 'joystick') {
			packet = new wdi.SpiceMessage({
				messageType: wdi.SpiceVars.SPICE_MSGC_INPUTS_MOUSE_MOTION, 
				channel: wdi.SpiceVars.SPICE_CHANNEL_INPUTS, 
				args: new wdi.RedcMouseMotion({
					x:data[1][0],
					y:data[1][1],
					buttons_state:0
				})
			});
			this.spiceConnection.send(packet);
		}
	},

	isKeyboardShortcut : function (type, event) {
		if (type == 'keydown') {
			var keycode = event["keyCode"];
			wdi.Keymap.controlPressed(keycode, type, event);
			var ctrlShortcut = wdi.Keymap.handledByCtrlKeyCode(type, keycode, true);
			return ctrlShortcut;
		}
	}


});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.CursorProcess = $.spcExtend(wdi.EventObject.prototype, {
	imageData: null,
	
	process: function(spiceMessage) {
		switch (spiceMessage.messageType) {
			case wdi.SpiceVars.SPICE_MSG_CURSOR_INIT:
			case wdi.SpiceVars.SPICE_MSG_CURSOR_SET:
				var wdiCursor = this.extractCursor(spiceMessage);
				if(wdiCursor) {
					wdi.VirtualMouse.setHotspot(0, 0);
					wdi.VirtualMouse.setMouse(wdiCursor.data, wdiCursor.header.hot_spot_x, wdiCursor.header.hot_spot_y);
				}
				break;
			case wdi.SpiceVars.SPICE_MSG_CURSOR_HIDE:
				wdi.VirtualMouse.hideMouse();
				break;
		}
	},

	dispose: function() {
		this.clearEvents();
		this.imageData = null;
	},

	_toUrl:function(data) {
		var imageData = $('<canvas/>').attr({
			'width': data.width,
			'height': data.height
		})[0];
		var ctx = imageData.getContext('2d');
		ctx.putImageData(data, 0, 0);
		return imageData.toDataURL("image/png");
	},
	
	extractCursor: function(spiceMessage) {
		var flags = spiceMessage.args.cursor.flags;
		var position = spiceMessage.args.position;
		var visible = spiceMessage.args.visible;
		
		//if there is no cursor, return null
		if(flags & 1) {
			return null;
		}
	
		var imageData = null;
		
		//cursor from cache?
		if(flags & wdi.SpiceCursorFlags.SPICE_CURSOR_FLAGS_FROM_CACHE) {
			imageData = wdi.ImageCache.getCursorFrom(spiceMessage.args.cursor);			
		} else {
			//cursor from packet
			//any case should return url
			switch (spiceMessage.args.cursor.header.type) {

				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_ALPHA:
					imageData = this._toUrl(wdi.graphics.argbToImageData(spiceMessage.args.cursor.data, spiceMessage.args.cursor.header.width, spiceMessage.args.cursor.header.height));
					break;
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_MONO:
					imageData = this._toUrl(wdi.graphics.monoToImageData(spiceMessage.args.cursor.data, spiceMessage.args.cursor.header.width, spiceMessage.args.cursor.header.height));
					break;
				case 8:
					imageData = wdi.SpiceObject.bytesToString(spiceMessage.args.cursor.data);
					break;
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_COLOR4:
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_COLOR8:
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_COLOR16:
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_COLOR24:
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_COLOR32:
				case wdi.SpiceCursorType.SPICE_CURSOR_TYPE_ENUM_END:
					break;
			}	
		}
	
		//got no cursor? error!
		if(!imageData) {
			return null;
		}
	
		//we have cursor, cache it?
		if(flags & wdi.SpiceCursorFlags.SPICE_CURSOR_FLAGS_CACHE_ME) {
			wdi.ImageCache.addCursor(spiceMessage.args.cursor, imageData);
		}
		
		return {
			data: imageData, 
			position: position, 
			visible: visible,
			header: spiceMessage.args.cursor.header
		};
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.PlaybackProcess = $.spcExtend(wdi.EventObject.prototype, {
	_lastApp: null,
	started: false,
	minBuffSize: 1024*32,
	frequency: null,
	channels: null,
	audioContext: null,
	startTime: null, // controls the playback time if no delay occurs
	hasAudioSupport: true, //whether the browser supports HTML5 Web Audio API

	typedBuffer: null,
	position: null,


	init: function(c) {
		this.app = c.app;
		this.audioContext = this.getAudioContext();
		if (this.audioContext) {
			this.hasAudioSupport = true;
		} else {
			this.hasAudioSupport = false;
			
		}
		this.startTime = 0;
		this.typedBuffer = new ArrayBuffer(1024*32);
		this.position = 0;
	},

	dispose: function() {
		this.clearEvents();
		this._lastApp = null;
		this.started = false;
		this.frequency = null;
		this.channels = null;
		this.audioContext = null;
		this.startTime = null;
		this.hasAudioSupport = true;
		this.typedBuffer = null;
		this.position = null;
	},

	getAudioContext: function() {
		//standard browser object
		try {
			return new AudioContext();
		} catch(e) {

		}

		//chrome and safari
		try {
		   return new webkitAudioContext();

		} catch(e) {

		}

		return false;
	},

	process: function(spiceMessage) {

		// if (this.hasAudioSupport && !Modernizr.touch) {
		if (this.hasAudioSupport) {
			switch (spiceMessage.messageType) {
				case wdi.SpiceVars.SPICE_MSG_PLAYBACK_MODE:
					break;
				case wdi.SpiceVars.SPICE_MSG_PLAYBACK_START:
					var packet = spiceMessage.args;
					this.channels = packet.channels;
					this.frequency = packet.frequency;
					break;
				case wdi.SpiceVars.SPICE_MSG_PLAYBACK_STOP:
					this.startTime = 0;
					var packet = spiceMessage.args;
					this.flush();
					break;
				case wdi.SpiceVars.SPICE_MSG_PLAYBACK_DATA:
					// While we receive data chunks, we store them in a buffer, so than when it is full we play the sound and empty it.
					// With this we get a more fluid playback and better overall performance than if we just played the data the moment we got it
					var packet = spiceMessage.args;
					var dataTimestamp = spiceMessage.args.multimedia_time;


					var tmpview = new Uint8Array(this.typedBuffer);
					tmpview.set(packet.data, this.position);
					this.position += packet.data.length;
					this._lastApp = this.app;

					if(this.position >= this.minBuffSize) {
						// ok, the buffer is full. We send the data to be played and later we can empty it to make room for more audio
						this.flush(dataTimestamp);
					}
					break;
			}
		} else {
			//TODO:
			// If the browser doesn't support Web Audio, we could still attach a wav header to the raw PCM we receive from spice and use the more widespread supported audio tag
			// Meanwhile, we can skip all the audio packets and gain some performance at least
		}
	},

	/**
	 * Plays all the audio buffer and empties it
	 *
	 * @param app
	 * @param dataTimestamp
	 */
	flush: function(dataTimestamp) {
		if(this.position > 0) {
			if (this.started) {
				this.playSound(this.typedBuffer, dataTimestamp);
			}
			this.position = 0;
			this.typedBuffer = new ArrayBuffer(1024*32);
		}
	},

	/**
	 * Plays the raw pcm data passed as param using HTML5's Web Audio API
	 *
	 * @param buffer
	 */
	playSound: function(buffer, dataTimestamp) {
		if(this.channels == 2) {
			return this.playSoundStereo(buffer, dataTimestamp);
		}

		var audio = new Int16Array(buffer);

		var channelData = new Array(this.channels);
		for(var i = 0;i<this.channels;i++) {
			channelData[i] = new Float32Array(audio.length / 2);
		}

		var channelCounter = 0;
		for (var i = 0; i < audio.length; ) {
		  for(var c = 0; c < this.channels; c++) {
			  //because the audio data spice gives us is 16 bits signed int (32768) and we wont to get a float out of it (between -1.0' and 1.0)
			  channelData[c][channelCounter] = audio[i++] / 32768;
		  }
		  channelCounter++;
		}

		var source = this.audioContext['createBufferSource'](); // creates a sound source
		var audioBuffer = this.audioContext['createBuffer'](this.channels, channelCounter, this.frequency);
		for(var i=0;i < this.channels; i++) {
			audioBuffer['getChannelData'](i)['set'](channelData[i]);
		}

		this._play(source, audioBuffer, dataTimestamp);
	},

	/**
	 * Plays the raw pcm STEREO data passed as param using HTML5's Web Audio API
	 *
	 * @param buffer
	 */
	playSoundStereo: function(buffer, dataTimestamp) {
		// Each data packet is 16 bits, the first being left channel data and the second being right channel data (LR-LR-LR-LR...)
		var audio = new Int16Array(buffer);

		// We split the audio buffer in two channels. Float32Array is the type required by Web Audio API
		var left = new Float32Array(audio.length / 2);
		var right = new Float32Array(audio.length / 2);

		var channelCounter = 0;

		var audioContext = this.audioContext;
		var len = audio.length;

		for (var i = 0; i < len; ) {
		  //because the audio data spice gives us is 16 bits signed int (32768) and we wont to get a float out of it (between -1.0 and 1.0)
		  left[channelCounter] = audio[i++] / 32768;
		  right[channelCounter] = audio[i++] / 32768;
		  channelCounter++;
		}

		var source = audioContext['createBufferSource'](); // creates a sound source
		var audioBuffer = audioContext['createBuffer'](2, channelCounter, this.frequency);

		audioBuffer['getChannelData'](0)['set'](left);
		audioBuffer['getChannelData'](1)['set'](right);

		this._play(source, audioBuffer, dataTimestamp);
	},

	_play: function(source, audioBuffer, dataTimestamp) {
		var wait = 0;
		if (dataTimestamp) {
			var elapsedTime = Date.now() - this.app.lastMultimediaTime; // time passed since we received the last multimedia time from main channel
			var currentMultimediaTime = elapsedTime + this.app.multimediaTime; // total delay we have at the moment
			wait = dataTimestamp - currentMultimediaTime;
			if (wait < 0) {
				wait = 0;
			}
		}
		source['buffer'] = audioBuffer;
		source['connect'](this.audioContext['destination']);	   // connect the source to the context's destination (the speakers)

		//if (!Modernizr.touch) {
			source['start'](this.startTime + wait);						   // play the source now
		//} else {
		//	source.noteOn(0);
		//}

		this.startTime += audioBuffer.duration;
	},

	startAudio: function () {
		this.started = true;
		this.flush();
	}
});

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.MainProcess = $.spcExtend(wdi.EventObject.prototype, {
	init: function(c) {
		this.superInit();
		this.app = c.app;
		this.spiceConnection = c.app.spiceConnection;
		this.agent = c.app.agent;
	},

	dispose: function() {
		this.clearEvents();
		this.app = null;
		this.spiceConnection = null;
		this.agent = null;
	},
	
	process: function(spiceMessage) {
		var channel = this.spiceConnection.channels[wdi.SpiceVars.SPICE_CHANNEL_MAIN];

		switch(spiceMessage.messageType) {
			case wdi.SpiceVars.SPICE_MSG_MAIN_INIT:
				channel.connectionId = spiceMessage.args.session_id;
				channel.fire('connectionId', channel.connectionId);
				if(spiceMessage.args.agent_connected == 1) {
					channel.fire('initAgent', spiceMessage.args.agent_tokens);
				}
				if (spiceMessage.args.current_mouse_mode == 1) {
					channel.fire('mouseMode', spiceMessage.args.current_mouse_mode);
				}
				// the mouse mode must be change both if we have agent or not
				this.changeMouseMode();
				break;
			case wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_DATA:
				var packet = spiceMessage.args;
				this.agent.onAgentData(packet);
			   	break;
			case wdi.SpiceVars.SPICE_MSG_MAIN_AGENT_CONNECTED:
				channel.fire('initAgent', spiceMessage.args.agent_tokens);
				this.changeMouseMode();
				break;
			case wdi.SpiceVars.SPICE_MSG_MAIN_MULTI_MEDIA_TIME:
				this.app.multimediaTime = spiceMessage.args.multimedia_time;
				break;
			case wdi.SpiceVars.SPICE_MSG_MAIN_CHANNELS_LIST:
				channel.fire('channelListAvailable', spiceMessage.args.channels);
				break;
		}
	},

	changeMouseMode: function() {
		var packet = new wdi.SpiceMessage({
			messageType: wdi.SpiceVars.SPICE_MSGC_MAIN_MOUSE_MODE_REQUEST,
			channel: wdi.SpiceVars.SPICE_CHANNEL_MAIN,
			args: new wdi.SpiceMouseModeRequest({
				request_mode: 2
			})
		});
		this.spiceConnection.send(packet);
	}
});

/*
 Copyright (c) 2016 eyeOS

 This file is part of Open365.

 Open365 is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

wdi.KeyEvent = {

	isCtrlPressed: function (e) {
		function isMac () {
			return navigator.platform.indexOf('Mac') != -1
		}

		if (!e) {
			throw new Error('isCtrlPressed: No event provided.')
		}
		var ctrlKey = e.ctrlKey;
		if (isMac()) {
			ctrlKey = e.metaKey;
		}
		return ctrlKey;
	}
};

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// These tables map the js keyboard keys to the spice equivalent
wdi.KeymapES = function() {

    // regular keys with associated chars. The columns  means all the event flux to activate the key (i.e. [key up, key down])
    // all the js events associated to these keys should have a charKey associated
    var charmapES = {};
    charmapES['º']   = [[0x29, 0, 0, 0], [0xA9, 0, 0, 0]];
    charmapES['ª']   = [[0x2A, 0, 0, 0], [0x29, 0, 0, 0], [0xA9, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['\\']  = [[0xE0, 0x38, 0, 0], [0x29, 0, 0, 0], [0xA9, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['1']   = [[0x2, 0, 0, 0], [0x82, 0, 0, 0]];
    charmapES['!']   = [[0x2A, 0, 0, 0], [0x2, 0, 0, 0], [0x82, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['|']   = [[0xE0, 0x38, 0, 0], [0x2, 0, 0, 0], [0x82, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['2']   = [[0x3, 0, 0, 0], [0x83, 0, 0, 0]];
    charmapES['"']   = [[0x2A, 0, 0, 0], [0x3, 0, 0, 0], [0x83, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['@']   = [[0xE0, 0x38, 0, 0], [0x3, 0, 0, 0], [0x83, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['3']   = [[0x4, 0, 0, 0], [0x84, 0, 0, 0]];
    charmapES['·']   = [[0x2A, 0, 0, 0], [0x4, 0, 0, 0], [0x84, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['#']   = [[0xE0, 0x38, 0, 0], [0x4, 0, 0, 0], [0x84, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['4']   = [[0x5, 0, 0, 0], [0x85, 0, 0, 0]];
    charmapES['$']   = [[0x2A, 0, 0, 0], [0x5, 0, 0, 0], [0x85, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['~']   = [[0xE0, 0x38, 0, 0], [0x5, 0, 0, 0], [0x85, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['5']   = [[0x6, 0, 0, 0], [0x86, 0, 0, 0]];
    charmapES['%']   = [[0x2A, 0, 0, 0], [0x6, 0, 0, 0], [0x86, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['6']   = [[0x7, 0, 0, 0], [0x87, 0, 0, 0]];
    charmapES['&']   = [[0x2A, 0, 0, 0], [0x7, 0, 0, 0], [0x87, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['¬']   = [[0xE0, 0x38, 0, 0], [0x7, 0, 0, 0], [0x87, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['7']   = [[0x8, 0, 0, 0], [0x88, 0, 0, 0]];
    charmapES['/']   = [[0x2A, 0, 0, 0], [0x8, 0, 0, 0], [0x88, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['8']   = [[0x9, 0, 0, 0], [0x89, 0, 0, 0]];
    charmapES['(']   = [[0x2A, 0, 0, 0], [0x9, 0, 0, 0], [0x89, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['9']   = [[0x0A, 0, 0, 0], [0x8A, 0, 0, 0]];
    charmapES[')']   = [[0x2A, 0, 0, 0], [0x0A, 0, 0, 0], [0x8A, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['0']   = [[0x0B, 0, 0, 0], [0x8B, 0, 0, 0]];
    charmapES['=']   = [[0x2A, 0, 0, 0], [0x0B, 0, 0, 0], [0x8B, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['\'']  = [[0x0C, 0, 0, 0], [0x8C, 0, 0, 0]];
    charmapES['?']   = [[0x2A, 0, 0, 0], [0x0C, 0, 0, 0], [0x8C, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['¡']   = [[0x0D, 0, 0, 0], [0x8D, 0, 0, 0]];
    charmapES['¿']   = [[0x2A, 0, 0, 0], [0x0D, 0, 0, 0], [0x8D, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['q']   = [[0x10, 0, 0, 0], [0x90, 0, 0, 0]];
    charmapES['Q']   = [[0x2A, 0, 0, 0], [0x10, 0, 0, 0], [0x90, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['w']   = [[0x11, 0, 0, 0], [0x91, 0, 0, 0]];
    charmapES['W']   = [[0x2A, 0, 0, 0], [0x11, 0, 0, 0], [0x91, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['e']   = [[0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapES['E']   = [[0x2A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['€']   = [[0xE0, 0x38, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['r']   = [[0x13, 0, 0, 0], [0x93, 0, 0, 0]];
    charmapES['R']   = [[0x2A, 0, 0, 0], [0x13, 0, 0, 0], [0x93, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['t']   = [[0x14, 0, 0, 0], [0x94, 0, 0, 0]];
    charmapES['T']   = [[0x2A, 0, 0, 0], [0x14, 0, 0, 0], [0x94, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['y']   = [[0x15, 0, 0, 0], [0x95, 0, 0, 0]];
    charmapES['Y']   = [[0x2A, 0, 0, 0], [0x15, 0, 0, 0], [0x95, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['u']   = [[0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapES['U']   = [[0x2A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['i']   = [[0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapES['I']   = [[0x2A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['o']   = [[0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapES['O']   = [[0x2A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['p']   = [[0x19, 0, 0, 0], [0x99, 0, 0, 0]];
    charmapES['P']   = [[0x2A, 0, 0, 0], [0x19, 0, 0, 0], [0x99, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['`']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x39, 0, 0, 0], [0xb9, 0, 0, 0]];

    charmapES['´']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x39, 0, 0, 0], [0xb9, 0, 0, 0]];
    charmapES['¨']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0xAA, 0, 0, 0], [0x39, 0, 0, 0], [0xb9, 0, 0, 0]];

    charmapES['à']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapES['À']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x2A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['è']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapES['È']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x2A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ì']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapES['Ì']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x2A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ò']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapES['Ò']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x2A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ù']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapES['Ù']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x2A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['â']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapES['Â']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ê']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapES['Ê']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['î']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapES['Î']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ô']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapES['Ô']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['û']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapES['Û']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['^']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0], [0x39, 0, 0, 0], [0xb9, 0, 0, 0]];
    charmapES['[']   = [[0xE0, 0x38, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['+']   = [[0x1B, 0, 0, 0], [0x9B, 0, 0, 0]];
    charmapES['*']   = [[0x2A, 0, 0, 0], [0x1B, 0, 0, 0], [0x9B, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES[']']   = [[0xE0, 0x38, 0, 0], [0x1B, 0, 0, 0], [0x9B, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['a']   = [[0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapES['A']   = [[0x2A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['s']   = [[0x1F, 0, 0, 0], [0x9F, 0, 0, 0]];
    charmapES['S']   = [[0x2A, 0, 0, 0], [0x1F, 0, 0, 0], [0x9F, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['d']   = [[0x20, 0, 0, 0], [0xA0, 0, 0, 0]];
    charmapES['D']   = [[0x2A, 0, 0, 0], [0x20, 0, 0, 0], [0xA0, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['f']   = [[0x21, 0, 0, 0], [0xA1, 0, 0, 0]];
    charmapES['F']   = [[0x2A, 0, 0, 0], [0x21, 0, 0, 0], [0xA1, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['g']   = [[0x22, 0, 0, 0], [0xA2, 0, 0, 0]];
    charmapES['G']   = [[0x2A, 0, 0, 0], [0x22, 0, 0, 0], [0xA2, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['h']   = [[0x23, 0, 0, 0], [0xA3, 0, 0, 0]];
    charmapES['H']   = [[0x2A, 0, 0, 0], [0x23, 0, 0, 0], [0xA3, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['j']   = [[0x24, 0, 0, 0], [0xA4, 0, 0, 0]];
    charmapES['J']   = [[0x2A, 0, 0, 0], [0x24, 0, 0, 0], [0xA4, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['k']   = [[0x25, 0, 0, 0], [0xA5, 0, 0, 0]];
    charmapES['K']   = [[0x2A, 0, 0, 0], [0x25, 0, 0, 0], [0xA5, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['l']   = [[0x26, 0, 0, 0], [0xA6, 0, 0, 0]];
    charmapES['L']   = [[0x2A, 0, 0, 0], [0x26, 0, 0, 0], [0xA6, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ñ']   = [[0x27, 0, 0, 0], [0xA7, 0, 0, 0]];
    charmapES['Ñ']   = [[0x2A, 0, 0, 0], [0x27, 0, 0, 0], [0xA7, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['á']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapES['Á']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['é']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapES['É']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['í']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapES['Í']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ó']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapES['Ó']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ú']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapES['Ú']   = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x2A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ä']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapES['Ä']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ë']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapES['Ë']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ï']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapES['Ï']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ö']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapES['Ö']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['ü']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapES['Ü']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['{']   = [[0xE0, 0x38, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['ç']   = [[0x2B, 0, 0, 0], [0xAB, 0, 0, 0]];
    charmapES['Ç']   = [[0x2A, 0, 0, 0], [0x2B, 0, 0, 0], [0xAB, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['}']   = [[0xE0, 0x38, 0, 0], [0x2B, 0, 0, 0], [0xAB, 0, 0, 0], [0xE0, 0xB8, 0, 0]];
    charmapES['<']   = [[0x56, 0, 0, 0], [0xD6, 0, 0, 0]];
    charmapES['>']   = [[0x2A, 0, 0, 0], [0x56, 0, 0, 0], [0xD6, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['z']   = [[0x2C, 0, 0, 0], [0xAC, 0, 0, 0]];
    charmapES['Z']   = [[0x2A, 0, 0, 0], [0x2C, 0, 0, 0], [0xAC, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['x']   = [[0x2D, 0, 0, 0], [0xAD, 0, 0, 0]];
    charmapES['X']   = [[0x2A, 0, 0, 0], [0x2D, 0, 0, 0], [0xAD, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['c']   = [[0x2E, 0, 0, 0], [0xAE, 0, 0, 0]];
    charmapES['C']   = [[0x2A, 0, 0, 0], [0x2E, 0, 0, 0], [0xAE, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['v']   = [[0x2F, 0, 0, 0], [0xAF, 0, 0, 0]];
    charmapES['V']   = [[0x2A, 0, 0, 0], [0x2F, 0, 0, 0], [0xAF, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['b']   = [[0x30, 0, 0, 0], [0xB0, 0, 0, 0]];
    charmapES['B']   = [[0x2A, 0, 0, 0], [0x30, 0, 0, 0], [0xB0, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['n']   = [[0x31, 0, 0, 0], [0xB1, 0, 0, 0]];
    charmapES['N']   = [[0x2A, 0, 0, 0], [0x31, 0, 0, 0], [0xB1, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['m']   = [[0x32, 0, 0, 0], [0xB2, 0, 0, 0]];
    charmapES['M']   = [[0x2A, 0, 0, 0], [0x32, 0, 0, 0], [0xB2, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES[',']   = [[0x33, 0, 0, 0], [0xB3, 0, 0, 0]];
    charmapES[';']   = [[0x2A, 0, 0, 0], [0x33, 0, 0, 0], [0xB3, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['.']   = [[0x34, 0, 0, 0], [0xB4, 0, 0, 0]];
    charmapES[':']   = [[0x2A, 0, 0, 0], [0x34, 0, 0, 0], [0xB4, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES['-']   = [[0x35, 0, 0, 0], [0xB5, 0, 0, 0]];
    charmapES['_']   = [[0x2A, 0, 0, 0], [0x35, 0, 0, 0], [0xB5, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapES[' ']   = [[0x39, 0, 0, 0], [0xb9, 0, 0, 0]];

    // keyboard keys without character associated.
    // all the js events associated to these keys should have a keyChar associated
    var keymapES = [];

    keymapES[27]                 = 0x1; // ESC
    keymapES[9]                 = 0x0F; // TAB
    //keymapES[20]                = 0x3A; // BLOQ.MAY. => see the charmap, all the capital letters and shift chars send a shift in their sequence
    keymapES[16]                = 0x2A; // LEFT SHIFT and RIGHT SHIFT
	keymapES[91]                = 0x1D; // LEFT GUI (META, COMMAND) BINDED TO CONTROL
	keymapES[17]                = 0x1D; // LEFT CONTROL and RIGHT CONTROL
    //keymapES[32]                = 0x39; // SPACE => see the charmap
    keymapES[8]                 = 0x0E; // BACKSPACE
    keymapES[13]                = 0x1C; // ENTER
    //keymapES[225]                 = 0x38; // RIGHT ALT (ALT GR) => see the charmap, all the altgr chars send a altgr in their sequence
    //keymapES[18]                = 0x38; // LEFT ALT
  // keymapES[92]                = 0x5C; // RIGHT GUI (WINDOWS)
    keymapES[38]                = 0x48; // UP ARROW
    keymapES[37]                = 0x4B; // LEFT ARROW
    keymapES[40]                = 0x50; // DOWN ARROW
    keymapES[39]                = 0x4D; // RIGHT ARROW
    keymapES[45]                = 0x52; // INSERT
    keymapES[46]                = 0x53; // DELETE
    keymapES[36]                = 0x47; // HOME
    keymapES[35]                = 0x4F; // FIN
    keymapES[33]                = 0x49; // PAGE UP
    keymapES[34]                = 0x51; // PAGE UP
    keymapES[144]               = 0x45; // BLOQ.NUM.
    keymapES[145]                = 0x46; // SCROLL LOCK
    keymapES[112]                = 0x3B; // F1
    keymapES[113]                = 0x3C; // F2
    keymapES[114]                = 0x3D; // F3
    keymapES[115]                = 0x3E; // F4
    keymapES[116]                = 0x3F; // F5
    keymapES[117]                = 0x40; // F6
    keymapES[118]                = 0x41; // F7
    keymapES[119]                = 0x42; // F8
    keymapES[120]                = 0x43; // F9
    keymapES[121]                = 0x44; // F10
    keymapES[122]                = 0x57; // F11
    keymapES[123]                = 0x58; // F12

    // combination keys with ctrl
    var ctrlKeymapES = [];
    ctrlKeymapES[90]                = 0x2C; // z

    // forbidden combinations that we are not going to send.
    var ctrlForbiddenKeymap = [];
    ctrlForbiddenKeymap[9]       = 0x0F; // TAB

    // reserved ctrl+? combinations we want to intercept from browser and inject manually to spice
    var reservedCtrlKeymap = [];
    reservedCtrlKeymap[81]                = 0x10; // q
    reservedCtrlKeymap[87]                = 0x11; // w
    reservedCtrlKeymap[69]                = 0x12; // e
    reservedCtrlKeymap[82]                = 0x13; // r
    reservedCtrlKeymap[84]                = 0x14; // t
    reservedCtrlKeymap[89]                = 0x15; // y
    reservedCtrlKeymap[85]                = 0x16; // u
    reservedCtrlKeymap[73]                = 0x17; // i
    reservedCtrlKeymap[79]                = 0x18; // o
    reservedCtrlKeymap[80]                = 0x19; // p
    reservedCtrlKeymap[65]                = 0x1E; // a
    reservedCtrlKeymap[83]                = 0x1F; // s
    reservedCtrlKeymap[68]                = 0x20; // d
    reservedCtrlKeymap[70]                = 0x21; // f
    reservedCtrlKeymap[71]                = 0x22; // g
    reservedCtrlKeymap[72]                = 0x23; // h
    reservedCtrlKeymap[74]                = 0x24; // j
    reservedCtrlKeymap[75]                = 0x25; // k
    reservedCtrlKeymap[76]                = 0x26; // l
    reservedCtrlKeymap[88]                = 0x2D; // x
    reservedCtrlKeymap[86]                = 0x2F; // v
    reservedCtrlKeymap[67]                = 0x2E; // c
    reservedCtrlKeymap[66]                = 0x30; // b
    reservedCtrlKeymap[78]                = 0x31; // n
    reservedCtrlKeymap[77]                = 0x32; // m

    return {
        getKeymap: function() {
            return keymapES;
        },

        getCtrlKeymap: function() {
            return ctrlKeymapES;
        },

        getCtrlForbiddenKeymap: function() {
            return ctrlForbiddenKeymap;
        },

        getReservedCtrlKeymap: function() {
            return reservedCtrlKeymap;
        },

        getCharmap: function() {
            return charmapES;
        },

        setCtrlKey: function (key, val) {
            ctrlKeymapES[key] = val;
        }
    };
}( );

/*
 Copyright (c) 2016 eyeOS

 This file is part of Open365.

 Open365 is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

wdi.scanCodeObjProvider = $.spcExtend(wdi.EventObject.prototype, {
	init: function (charObj) {
		this.charObj = charObj;
		this.prefix = this.charObj.prefix.slice();
		this.suffix = this.charObj.suffix.slice();
	},

	getPrefix: function () {
		return this.prefix;
	},

	getSufix: function () {
		return this.suffix;
	},

	setPrefix: function (val) {
		this.prefix = val;
	},
	setSuffix: function (val) {
		this.suffix = val;
	},

	getScanCode: function () {
		var res = [];
		var prefix = this.getPrefix();
		if (prefix.length > 0) {
			res = res.concat(prefix);
		}
		var main = this.charObj.main;
		res = res.concat(main);

		var suffix = this.getSufix();
		if (suffix.length > 0) {
			res = res.concat(suffix);
		}

		return res;
	}
});

/*
 Copyright (c) 2016 eyeOS

 This file is part of Open365.

 Open365 is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

wdi.ScanCodeObjModifier = $.spcExtend(wdi.EventObject.prototype, {
	SHIFTDOWN: [0x2A, 0, 0, 0],
	SHIFTUP: [0xAA, 0, 0, 0],

	init: function (charObj) {
		this.scanCodeObjProvider = new wdi.scanCodeObjProvider(charObj);
		this.prefix = this.scanCodeObjProvider.getPrefix();
		this.suffix = this.scanCodeObjProvider.getSufix();
	},

	removeShift: function () {
		this.prefix = this._removeKeyFromPart(this.SHIFTDOWN, this.prefix);
		this.scanCodeObjProvider.setPrefix(this.prefix);
		this.suffix = this._removeKeyFromPart(this.SHIFTUP, this.suffix);
		this.scanCodeObjProvider.setSuffix(this.suffix);

		return this.getScanCode();
	},

	containsShiftDown: function () {
		var found = false;
		var self = this;
		_.find(this.prefix, function (item) {
			found = _.isEqual(item, self.SHIFTDOWN)
		});
		return found;
	},
	addShiftUp: function () {
		this.prefix.unshift(this.SHIFTUP);
	},
	addShiftDown: function () {
		this.suffix.push(this.SHIFTDOWN);
	},

	getScanCode: function () {
		return this.scanCodeObjProvider.getScanCode();
	},

	_removeKeyFromPart: function (key, part) {
		return part.filter(function (item) {
			return !(_.isEqual(item, key))
		});
	}
});

/*
 Copyright (c) 2016 eyeOS

 This file is part of Open365.

 Open365 is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// These tables map the js keyboard keys to the spice equivalent
wdi.KeymapObjES = function() {
	var charmapES = {};
	charmapES['0']   = {"prefix":[],"main":[[11,0,0,0],[139,0,0,0]],"suffix":[]};
	charmapES['1']   = {"prefix":[],"main":[[2,0,0,0],[130,0,0,0]],"suffix":[]};
	charmapES['2']   = {"prefix":[],"main":[[3,0,0,0],[131,0,0,0]],"suffix":[]};
	charmapES['3']   = {"prefix":[],"main":[[4,0,0,0],[132,0,0,0]],"suffix":[]};
	charmapES['4']   = {"prefix":[],"main":[[5,0,0,0],[133,0,0,0]],"suffix":[]};
	charmapES['5']   = {"prefix":[],"main":[[6,0,0,0],[134,0,0,0]],"suffix":[]};
	charmapES['6']   = {"prefix":[],"main":[[7,0,0,0],[135,0,0,0]],"suffix":[]};
	charmapES['7']   = {"prefix":[],"main":[[8,0,0,0],[136,0,0,0]],"suffix":[]};
	charmapES['8']   = {"prefix":[],"main":[[9,0,0,0],[137,0,0,0]],"suffix":[]};
	charmapES['9']   = {"prefix":[],"main":[[10,0,0,0],[138,0,0,0]],"suffix":[]};
	charmapES['º']   = {"prefix":[],"main":[[41,0,0,0],[169,0,0,0]],"suffix":[]};
	charmapES['ª']   = {"prefix":[[42,0,0,0]],"main":[[41,0,0,0],[169,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['\\']   = {"prefix":[[224,56,0,0]],"main":[[41,0,0,0],[169,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['!']   = {"prefix":[[42,0,0,0]],"main":[[2,0,0,0],[130,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['|']   = {"prefix":[[224,56,0,0]],"main":[[2,0,0,0],[130,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['"']   = {"prefix":[[42,0,0,0]],"main":[[3,0,0,0],[131,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['@']   = {"prefix":[[224,56,0,0]],"main":[[3,0,0,0],[131,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['·']   = {"prefix":[[42,0,0,0]],"main":[[4,0,0,0],[132,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['#']   = {"prefix":[[224,56,0,0]],"main":[[4,0,0,0],[132,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['$']   = {"prefix":[[42,0,0,0]],"main":[[5,0,0,0],[133,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['~']   = {"prefix":[[224,56,0,0]],"main":[[5,0,0,0],[133,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['%']   = {"prefix":[[42,0,0,0]],"main":[[6,0,0,0],[134,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['&']   = {"prefix":[[42,0,0,0]],"main":[[7,0,0,0],[135,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['¬']   = {"prefix":[[224,56,0,0]],"main":[[7,0,0,0],[135,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['/']   = {"prefix":[[42,0,0,0]],"main":[[8,0,0,0],[136,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['(']   = {"prefix":[[42,0,0,0]],"main":[[9,0,0,0],[137,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES[')']   = {"prefix":[[42,0,0,0]],"main":[[10,0,0,0],[138,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['=']   = {"prefix":[[42,0,0,0]],"main":[[11,0,0,0],[139,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['\'']   = {"prefix":[],"main":[[12,0,0,0],[140,0,0,0]],"suffix":[]};
	charmapES['?']   = {"prefix":[[42,0,0,0]],"main":[[12,0,0,0],[140,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['¡']   = {"prefix":[],"main":[[13,0,0,0],[141,0,0,0]],"suffix":[]};
	charmapES['¿']   = {"prefix":[[42,0,0,0]],"main":[[13,0,0,0],[141,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['q']   = {"prefix":[],"main":[[16,0,0,0],[144,0,0,0]],"suffix":[]};
	charmapES['Q']   = {"prefix":[[42,0,0,0]],"main":[[16,0,0,0],[144,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['w']   = {"prefix":[],"main":[[17,0,0,0],[145,0,0,0]],"suffix":[]};
	charmapES['W']   = {"prefix":[[42,0,0,0]],"main":[[17,0,0,0],[145,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['e']   = {"prefix":[],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[]};
	charmapES['E']   = {"prefix":[[42,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['€']   = {"prefix":[[224,56,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['r']   = {"prefix":[],"main":[[19,0,0,0],[147,0,0,0]],"suffix":[]};
	charmapES['R']   = {"prefix":[[42,0,0,0]],"main":[[19,0,0,0],[147,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['t']   = {"prefix":[],"main":[[20,0,0,0],[148,0,0,0]],"suffix":[]};
	charmapES['T']   = {"prefix":[[42,0,0,0]],"main":[[20,0,0,0],[148,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['y']   = {"prefix":[],"main":[[21,0,0,0],[149,0,0,0]],"suffix":[]};
	charmapES['Y']   = {"prefix":[[42,0,0,0]],"main":[[21,0,0,0],[149,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['u']   = {"prefix":[],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[]};
	charmapES['U']   = {"prefix":[[42,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['i']   = {"prefix":[],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[]};
	charmapES['I']   = {"prefix":[[42,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['o']   = {"prefix":[],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[]};
	charmapES['O']   = {"prefix":[[42,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['p']   = {"prefix":[],"main":[[25,0,0,0],[153,0,0,0]],"suffix":[]};
	charmapES['P']   = {"prefix":[[42,0,0,0]],"main":[[25,0,0,0],[153,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['`']   = {"prefix":[[26,0,0,0],[154,0,0,0],[57,0,0,0],[185,0,0,0]],"main":[],"suffix":[]};
	charmapES['´']   = {"prefix":[[40,0,0,0],[168,0,0,0],[57,0,0,0],[185,0,0,0]],"main":[],"suffix":[]};
	charmapES['¨']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0],[170,0,0,0],[57,0,0,0],[185,0,0,0]],"main":[],"suffix":[]};
	charmapES['à']   = {"prefix":[[26,0,0,0],[154,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[]};
	charmapES['À']   = {"prefix":[[26,0,0,0],[154,0,0,0],[42,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['è']   = {"prefix":[[26,0,0,0],[154,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[]};
	charmapES['È']   = {"prefix":[[26,0,0,0],[154,0,0,0],[42,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ì']   = {"prefix":[[26,0,0,0],[154,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[]};
	charmapES['Ì']   = {"prefix":[[26,0,0,0],[154,0,0,0],[42,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ò']   = {"prefix":[[26,0,0,0],[154,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[]};
	charmapES['Ò']   = {"prefix":[[26,0,0,0],[154,0,0,0],[42,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ù']   = {"prefix":[[26,0,0,0],[154,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[]};
	charmapES['Ù']   = {"prefix":[[26,0,0,0],[154,0,0,0],[42,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['â']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0],[170,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[]};
	charmapES['Â']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ê']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0],[170,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[]};
	charmapES['Ê']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['î']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0],[170,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[]};
	charmapES['Î']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ô']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0],[170,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[]};
	charmapES['Ô']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['û']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0],[170,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[]};
	charmapES['Û']   = {"prefix":[[42,0,0,0],[26,0,0,0],[154,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['^']   = {"prefix":[[42,0,0,0]],"main":[[26,0,0,0],[154,0,0,0]],"suffix":[[170,0,0,0],[57,0,0,0],[185,0,0,0]]};
	charmapES['[']   = {"prefix":[[224,56,0,0],[26,0,0,0],[154,0,0,0],[224,184,0,0]],"main":[],"suffix":[]};
	charmapES['+']   = {"prefix":[],"main":[[27,0,0,0],[155,0,0,0]],"suffix":[]};
	charmapES['*']   = {"prefix":[[42,0,0,0]],"main":[[27,0,0,0],[155,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES[']']   = {"prefix":[[224,56,0,0]],"main":[[27,0,0,0],[155,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['a']   = {"prefix":[],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[]};
	charmapES['A']   = {"prefix":[[42,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['s']   = {"prefix":[],"main":[[31,0,0,0],[159,0,0,0]],"suffix":[]};
	charmapES['S']   = {"prefix":[[42,0,0,0]],"main":[[31,0,0,0],[159,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['d']   = {"prefix":[],"main":[[32,0,0,0],[160,0,0,0]],"suffix":[]};
	charmapES['D']   = {"prefix":[[42,0,0,0]],"main":[[32,0,0,0],[160,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['f']   = {"prefix":[],"main":[[33,0,0,0],[161,0,0,0]],"suffix":[]};
	charmapES['F']   = {"prefix":[[42,0,0,0]],"main":[[33,0,0,0],[161,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['g']   = {"prefix":[],"main":[[34,0,0,0],[162,0,0,0]],"suffix":[]};
	charmapES['G']   = {"prefix":[[42,0,0,0]],"main":[[34,0,0,0],[162,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['h']   = {"prefix":[],"main":[[35,0,0,0],[163,0,0,0]],"suffix":[]};
	charmapES['H']   = {"prefix":[[42,0,0,0]],"main":[[35,0,0,0],[163,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['j']   = {"prefix":[],"main":[[36,0,0,0],[164,0,0,0]],"suffix":[]};
	charmapES['J']   = {"prefix":[[42,0,0,0]],"main":[[36,0,0,0],[164,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['k']   = {"prefix":[],"main":[[37,0,0,0],[165,0,0,0]],"suffix":[]};
	charmapES['K']   = {"prefix":[[42,0,0,0]],"main":[[37,0,0,0],[165,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['l']   = {"prefix":[],"main":[[38,0,0,0],[166,0,0,0]],"suffix":[]};
	charmapES['L']   = {"prefix":[[42,0,0,0]],"main":[[38,0,0,0],[166,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ñ']   = {"prefix":[],"main":[[39,0,0,0],[167,0,0,0]],"suffix":[]};
	charmapES['Ñ']   = {"prefix":[[42,0,0,0]],"main":[[39,0,0,0],[167,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['á']   = {"prefix":[[40,0,0,0],[168,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[]};
	charmapES['Á']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['é']   = {"prefix":[[40,0,0,0],[168,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[]};
	charmapES['É']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['í']   = {"prefix":[[40,0,0,0],[168,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[]};
	charmapES['Í']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ó']   = {"prefix":[[40,0,0,0],[168,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[]};
	charmapES['Ó']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ú']   = {"prefix":[[40,0,0,0],[168,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[]};
	charmapES['Ú']   = {"prefix":[[40,0,0,0],[168,0,0,0],[42,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ä']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0],[170,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[]};
	charmapES['Ä']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0]],"main":[[30,0,0,0],[158,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ë']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0],[170,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[]};
	charmapES['Ë']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0]],"main":[[18,0,0,0],[146,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ï']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0],[170,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[]};
	charmapES['Ï']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0]],"main":[[23,0,0,0],[151,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ö']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0],[170,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[]};
	charmapES['Ö']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0]],"main":[[24,0,0,0],[152,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['ü']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0],[170,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[]};
	charmapES['Ü']   = {"prefix":[[42,0,0,0],[40,0,0,0],[168,0,0,0]],"main":[[22,0,0,0],[150,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['{']   = {"prefix":[[224,56,0,0],[40,0,0,0],[168,0,0,0],[224,184,0,0]],"main":[],"suffix":[]};
	charmapES['ç']   = {"prefix":[],"main":[[43,0,0,0],[171,0,0,0]],"suffix":[]};
	charmapES['Ç']   = {"prefix":[[42,0,0,0]],"main":[[43,0,0,0],[171,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['}']   = {"prefix":[[224,56,0,0]],"main":[[43,0,0,0],[171,0,0,0]],"suffix":[[224,184,0,0]]};
	charmapES['<']   = {"prefix":[],"main":[[86,0,0,0],[214,0,0,0]],"suffix":[]};
	charmapES['>']   = {"prefix":[[42,0,0,0]],"main":[[86,0,0,0],[214,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['z']   = {"prefix":[],"main":[[44,0,0,0],[172,0,0,0]],"suffix":[]};
	charmapES['Z']   = {"prefix":[[42,0,0,0]],"main":[[44,0,0,0],[172,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['x']   = {"prefix":[],"main":[[45,0,0,0],[173,0,0,0]],"suffix":[]};
	charmapES['X']   = {"prefix":[[42,0,0,0]],"main":[[45,0,0,0],[173,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['c']   = {"prefix":[],"main":[[46,0,0,0],[174,0,0,0]],"suffix":[]};
	charmapES['C']   = {"prefix":[[42,0,0,0]],"main":[[46,0,0,0],[174,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['v']   = {"prefix":[],"main":[[47,0,0,0],[175,0,0,0]],"suffix":[]};
	charmapES['V']   = {"prefix":[[42,0,0,0]],"main":[[47,0,0,0],[175,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['b']   = {"prefix":[],"main":[[48,0,0,0],[176,0,0,0]],"suffix":[]};
	charmapES['B']   = {"prefix":[[42,0,0,0]],"main":[[48,0,0,0],[176,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['n']   = {"prefix":[],"main":[[49,0,0,0],[177,0,0,0]],"suffix":[]};
	charmapES['N']   = {"prefix":[[42,0,0,0]],"main":[[49,0,0,0],[177,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['m']   = {"prefix":[],"main":[[50,0,0,0],[178,0,0,0]],"suffix":[]};
	charmapES['M']   = {"prefix":[[42,0,0,0]],"main":[[50,0,0,0],[178,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES[',']   = {"prefix":[],"main":[[51,0,0,0],[179,0,0,0]],"suffix":[]};
	charmapES[';']   = {"prefix":[[42,0,0,0]],"main":[[51,0,0,0],[179,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['.']   = {"prefix":[],"main":[[52,0,0,0],[180,0,0,0]],"suffix":[]};
	charmapES[':']   = {"prefix":[[42,0,0,0]],"main":[[52,0,0,0],[180,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES['-']   = {"prefix":[],"main":[[53,0,0,0],[181,0,0,0]],"suffix":[]};
	charmapES['_']   = {"prefix":[[42,0,0,0]],"main":[[53,0,0,0],[181,0,0,0]],"suffix":[[170,0,0,0]]};
	charmapES[' ']   = {"prefix":[[57,0,0,0],[185,0,0,0]],"main":[],"suffix":[]};

	return {
		getScanCode: function (char) {
			var charObj = new wdi.scanCodeObjProvider(this.getCharmap()[char]);
			return charObj.getScanCode();
		},
		getCharmap: function() {
			return charmapES;
		}
	};
}( );

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.KeymapUS = function() {

    var charmapUS = [];
    charmapUS['`']   = [[0x29, 0, 0, 0], [0xA9, 0, 0, 0]];
    charmapUS['~']   = [[0x2A, 0, 0, 0], [0x29, 0, 0, 0], [0xA9, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['1']   = [[0x2, 0, 0, 0],[0x82, 0, 0, 0]];
    charmapUS['!']   = [[0x2A, 0, 0, 0], [0x2, 0, 0, 0], [0x82, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['2']   = [[0x3, 0, 0, 0], [0x83, 0, 0, 0]];
    charmapUS['@']   = [[0x2A, 0, 0, 0], [0x3, 0, 0, 0], [0x83, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['3']   = [[0x4, 0, 0, 0], [0x84, 0, 0, 0]];
    charmapUS['#']   = [[0x2A, 0, 0, 0], [0x4, 0, 0, 0], [0x84, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['4']   = [[0x5, 0, 0, 0], [0x85, 0, 0, 0]];
    charmapUS['$']   = [[0x2A, 0, 0, 0], [0x5, 0, 0, 0], [0x85, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['5']   = [[0x6, 0, 0, 0], [0x86, 0, 0, 0]];
    charmapUS['%']   = [[0x2A, 0, 0, 0], [0x6, 0, 0, 0], [0x86, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['6']   = [[0x7, 0, 0, 0], [0x87, 0, 0, 0]];
    charmapUS['^']   = [[0x2A, 0, 0, 0], [0x7, 0, 0, 0], [0x87, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['7']   = [[0x8, 0, 0, 0], [0x88, 0, 0, 0]];
    charmapUS['&']   = [[0x2A, 0, 0, 0], [0x8, 0, 0, 0], [0x88, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['8']   = [[0x9, 0, 0, 0], [0x89, 0, 0, 0]];
    charmapUS['*']   = [[0x2A, 0, 0, 0], [0x9, 0, 0, 0], [0x89, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['9']   = [[0x0A, 0, 0, 0], [0x8A, 0, 0, 0]];
    charmapUS['(']   = [[0x2A, 0, 0, 0], [0x0A, 0, 0, 0], [0x8A, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['0']   = [[0x0B, 0, 0, 0], [0x8B, 0, 0, 0]];
    charmapUS[')']   = [[0x2A, 0, 0, 0], [0x0B, 0, 0, 0], [0x8B, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['-']   = [[0x0C, 0, 0, 0], [0x8C, 0, 0, 0]];
    charmapUS['_']   = [[0x2A, 0, 0, 0], [0x0C, 0, 0, 0], [0x8C, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['=']   = [[0x0D, 0, 0, 0], [0x8D, 0, 0, 0]];
    charmapUS['+']   = [[0x2A, 0, 0, 0], [0x0D, 0, 0, 0], [0x8D, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['q']   = [[0x10, 0, 0, 0], [0x90, 0, 0, 0]];
    charmapUS['Q']   = [[0x2A, 0, 0, 0], [0x10, 0, 0, 0], [0x90, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['w']   = [[0x11, 0, 0, 0], [0x91, 0, 0, 0]];
    charmapUS['W']   = [[0x2A, 0, 0, 0], [0x11, 0, 0, 0], [0x91, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['e']   = [[0x12, 0, 0, 0], [0x92, 0, 0, 0]];
    charmapUS['E']   = [[0x2A, 0, 0, 0], [0x12, 0, 0, 0], [0x92, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['r']   = [[0x13, 0, 0, 0], [0x93, 0, 0, 0]];
    charmapUS['R']   = [[0x2A, 0, 0, 0], [0x13, 0, 0, 0], [0x93, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['t']   = [[0x14, 0, 0, 0], [0x94, 0, 0, 0]];
    charmapUS['T']   = [[0x2A, 0, 0, 0], [0x14, 0, 0, 0], [0x94, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['y']   = [[0x15, 0, 0, 0], [0x95, 0, 0, 0]];
    charmapUS['Y']   = [[0x2A, 0, 0, 0], [0x15, 0, 0, 0], [0x95, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['u']   = [[0x16, 0, 0, 0], [0x96, 0, 0, 0]];
    charmapUS['U']   = [[0x2A, 0, 0, 0], [0x16, 0, 0, 0], [0x96, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['i']   = [[0x17, 0, 0, 0], [0x97, 0, 0, 0]];
    charmapUS['I']   = [[0x2A, 0, 0, 0], [0x17, 0, 0, 0], [0x97, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['o']   = [[0x18, 0, 0, 0], [0x98, 0, 0, 0]];
    charmapUS['O']   = [[0x2A, 0, 0, 0], [0x18, 0, 0, 0], [0x98, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['p']   = [[0x19, 0, 0, 0], [0x99, 0, 0, 0]];
    charmapUS['P']   = [[0x2A, 0, 0, 0], [0x19, 0, 0, 0], [0x99, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['[']   = [[0x1A, 0, 0, 0], [0x9A, 0, 0, 0]];
    charmapUS['{']   = [[0x2A, 0, 0, 0], [0x1A, 0, 0, 0], [0x9A, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS[']']   = [[0x1B, 0, 0, 0], [0x9B, 0, 0, 0]];
    charmapUS['}']   = [[0x2A, 0, 0, 0], [0x1B, 0, 0, 0], [0x9B, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['\\']   = [[0x2B, 0, 0, 0], [0xAB, 0, 0, 0]];
    charmapUS['|']   = [[0x2A, 0, 0, 0], [0x2B, 0, 0, 0], [0xAB, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['a']   = [[0x1E, 0, 0, 0], [0x9E, 0, 0, 0]];
    charmapUS['A']   = [[0x2A, 0, 0, 0], [0x1E, 0, 0, 0], [0x9E, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['s']   = [[0x1F, 0, 0, 0], [0x9F, 0, 0, 0]];
    charmapUS['S']   = [[0x2A, 0, 0, 0], [0x1F, 0, 0, 0], [0x9F, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['d']   = [[0x20, 0, 0, 0], [0xA0, 0, 0, 0]];
    charmapUS['D']   = [[0x2A, 0, 0, 0], [0x20, 0, 0, 0], [0xA0, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['f']   = [[0x21, 0, 0, 0], [0xA1, 0, 0, 0]];
    charmapUS['F']   = [[0x2A, 0, 0, 0], [0x21, 0, 0, 0], [0xA1, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['g']   = [[0x22, 0, 0, 0], [0xA2, 0, 0, 0]];
    charmapUS['G']   = [[0x2A, 0, 0, 0], [0x22, 0, 0, 0], [0xA2, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['h']   = [[0x23, 0, 0, 0], [0xA3, 0, 0, 0]];
    charmapUS['H']   = [[0x2A, 0, 0, 0], [0x23, 0, 0, 0], [0xA3, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['j']   = [[0x24, 0, 0, 0], [0xA4, 0, 0, 0]];
    charmapUS['J']   = [[0x2A, 0, 0, 0], [0x24, 0, 0, 0], [0xA4, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['k']   = [[0x25, 0, 0, 0], [0xA5, 0, 0, 0]];
    charmapUS['K']   = [[0x2A, 0, 0, 0], [0x25, 0, 0, 0], [0xA5, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['l']   = [[0x26, 0, 0, 0], [0xA6, 0, 0, 0]];
    charmapUS['L']   = [[0x2A, 0, 0, 0], [0x26, 0, 0, 0], [0xA6, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS[';']   = [[0x27, 0, 0, 0], [0xA7, 0, 0, 0]];
    charmapUS[':']   = [[0x2A, 0, 0, 0], [0x27, 0, 0, 0], [0xA7, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['\'']  = [[0x28, 0, 0, 0], [0xA8, 0, 0, 0]];
    charmapUS['"']   = [[0x2A, 0, 0, 0], [0x28, 0, 0, 0], [0xA8, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['z']   = [[0x2C, 0, 0, 0], [0xAC, 0, 0, 0]];
    charmapUS['Z']   = [[0x2A, 0, 0, 0], [0x2C, 0, 0, 0], [0xAC, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['x']   = [[0x2D, 0, 0, 0], [0xAD, 0, 0, 0]];
    charmapUS['X']   = [[0x2A, 0, 0, 0], [0x2D, 0, 0, 0], [0xAD, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['c']   = [[0x2E, 0, 0, 0], [0xAE, 0, 0, 0]];
    charmapUS['C']   = [[0x2A, 0, 0, 0], [0x2E, 0, 0, 0], [0xAE, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['v']   = [[0x2F, 0, 0, 0], [0xAF, 0, 0, 0]];
    charmapUS['V']   = [[0x2A, 0, 0, 0], [0x2F, 0, 0, 0], [0xAF, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['b']   = [[0x30, 0, 0, 0], [0xB0, 0, 0, 0]];
    charmapUS['B']   = [[0x2A, 0, 0, 0], [0x30, 0, 0, 0], [0xB0, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['n']   = [[0x31, 0, 0, 0], [0xB1, 0, 0, 0]];
    charmapUS['N']   = [[0x2A, 0, 0, 0], [0x31, 0, 0, 0], [0xB1, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['m']   = [[0x32, 0, 0, 0], [0xB2, 0, 0, 0]];
    charmapUS['M']   = [[0x2A, 0, 0, 0], [0x32, 0, 0, 0], [0xB2, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS[',']   = [[0x33, 0, 0, 0], [0xB3, 0, 0, 0]];
    charmapUS['<']   = [[0x2A, 0, 0, 0], [0x33, 0, 0, 0], [0xB3, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['.']   = [[0x34, 0, 0, 0], [0xB4, 0, 0, 0]];
    charmapUS['>']   = [[0x2A, 0, 0, 0], [0x34, 0, 0, 0], [0xB4, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS['/']   = [[0x35, 0, 0, 0], [0xB5, 0, 0, 0]];
    charmapUS['?']   = [[0x2A, 0, 0, 0], [0x35, 0, 0, 0], [0xB5, 0, 0, 0], [0xAA, 0, 0, 0]];
    charmapUS[' ']   = [[0x39, 0, 0, 0], [0xb9, 0, 0, 0]];

    var keymapUS = [];

    keymapUS[27]                 = 0x1; // ESC
    keymapUS[9]                 = 0x0F; // TAB
    //keymapUS[20]                = 0x3A; // // BLOQ.MAY. => see the charmap, all the capital letters and shift chars send a shift in their sequence
    keymapUS[16]                = 0x2A; // LEFT SHIFT and RIGHT SHIFT
	keymapUS[91]                = 0x1D; // LEFT GUI (META, COMMAND) BINDED TO CONTROL
	keymapUS[17]                = 0x1D; // LEFT CONTROL and RIGHT CONTROL
    keymapUS[32]                = 0x39; // SPACE
    keymapUS[8]                 = 0x0E; // BACKSPACE
    keymapUS[13]                = 0x1C; // ENTER
    //keymapUS[0]                 = 0x38; // RIGHT ALT (ALT GR)
    //keymapUS[92]                = 0x5C; // RIGHT GUI (WINDOWS)
    keymapUS[38]                = 0x48; // UP ARROW
    keymapUS[37]                = 0x4B; // LEFT ARROW
    keymapUS[40]                = 0x50; // DOWN ARROW
    keymapUS[39]                = 0x4D; // RIGHT ARROW
    keymapUS[45]                = 0x52; // INSERT
    keymapUS[46]                = 0x53; // DELETE
    keymapUS[36]                = 0x47; // HOME
    keymapUS[35]                = 0x4F; // FIN
    keymapUS[33]                = 0x49; // PAGE UP
    keymapUS[34]                = 0x51; // PAGE UP
    keymapUS[144]               = 0x45; // BLOQ.NUM.
    keymapUS[145]                = 0x46; // SCROLL LOCK
    keymapUS[112]                = 0x3B; // F1
    keymapUS[113]                = 0x3C; // F2
    keymapUS[114]                = 0x3D; // F3
    keymapUS[115]                = 0x3E; // F4
    keymapUS[116]                = 0x3F; // F5
    keymapUS[117]                = 0x40; // F6
    keymapUS[118]                = 0x41; // F7
    keymapUS[119]                = 0x42; // F8
    keymapUS[120]                = 0x43; // F9
    keymapUS[121]                = 0x44; // F10
    keymapUS[122]                = 0x57; // F11
    keymapUS[123]                = 0x58; // F12

    // combination keys with ctrl
    var ctrlkeymapUS = [];
    ctrlkeymapUS[90]                = 0x2C; // z

    // forbidden combinations that we are not going to send.
    var ctrlForbiddenKeymap = [];
    ctrlForbiddenKeymap[9]       = 0x0F; // TAB

    // reserved ctrl+? combinations we want to intercept from browser and inject manually to spice
    var reservedCtrlKeymap = [];
    reservedCtrlKeymap[65]                = 0x1E; // a
    reservedCtrlKeymap[81]                = 0x10; // q
    reservedCtrlKeymap[87]                = 0x11; // w
    reservedCtrlKeymap[69]                = 0x12; // e
    reservedCtrlKeymap[82]                = 0x13; // r
    reservedCtrlKeymap[84]                = 0x14; // t
    reservedCtrlKeymap[89]                = 0x15; // y
    reservedCtrlKeymap[85]                = 0x16; // u
    reservedCtrlKeymap[73]                = 0x17; // i
    reservedCtrlKeymap[79]                = 0x18; // o
    reservedCtrlKeymap[80]                = 0x19; // p
    reservedCtrlKeymap[65]                = 0x1E; // a
    reservedCtrlKeymap[83]                = 0x1F; // s
    reservedCtrlKeymap[68]                = 0x20; // d
    reservedCtrlKeymap[70]                = 0x21; // f
    reservedCtrlKeymap[71]                = 0x22; // g
    reservedCtrlKeymap[72]                = 0x23; // h
    reservedCtrlKeymap[74]                = 0x24; // j
    reservedCtrlKeymap[75]                = 0x25; // k
    reservedCtrlKeymap[76]                = 0x26; // l
    reservedCtrlKeymap[88]                = 0x2D; // x
    reservedCtrlKeymap[86]                = 0x2F; // v
    reservedCtrlKeymap[67]                = 0x2E; // c
    reservedCtrlKeymap[66]                = 0x30; // b
    reservedCtrlKeymap[78]                = 0x31; // n
    reservedCtrlKeymap[77]                = 0x32; // m


    return {
        getKeymap: function() {
            return keymapUS;
        },

        getCtrlKeymap: function() {
            return ctrlkeymapUS;
        },

        getCtrlForbiddenKeymap: function() {
            return ctrlForbiddenKeymap;
        },

        getReservedCtrlKeymap: function() {
            return reservedCtrlKeymap;
        },

        getCharmap: function() {
            return charmapUS;
        },

        setCtrlKey: function (key, val) {
            ctrlkeymapUS[key] = val;
        }
    };
}( );

/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

wdi.keyShortcutsHandled = {
    CTRLV: 0,
    CTRLC: 1
};

wdi.Keymap = {
    keymap: {},
    ctrlKeymap: {},
    ctrlForbiddenKeymap: {},
    charmap: {},
    ctrlPressed: false,
    twoBytesScanCodes: [0x5B, 0xDB, /*0x38, 0xB8,*/ 0x5C, 0xDC, 0x1D, 0x9D, 0x5D, 0xDD, 0x52, 0xD2, 0x53, 0xD3, 0x4B, 0xCB, 0x47, 0xC9, 0x4F, 0xCF, 0x48, 0xC8, 0x50, 0xD0, 0x49, 0xC9, 0x51, 0xD1, 0x4D, 0xCD, 0x1C, 0x9C],

    loadKeyMap: function(layout, stuckKeysHandler) {
        try {
            this.keymap = wdi['Keymap' + layout.toUpperCase()].getKeymap();
            this.ctrlKeymap = wdi['Keymap' + layout.toUpperCase()].getCtrlKeymap();
            this.ctrlForbiddenKeymap = wdi['Keymap' + layout.toUpperCase()].getCtrlForbiddenKeymap();
            this.reservedCtrlKeymap =  wdi['Keymap' + layout.toUpperCase()].getReservedCtrlKeymap();
            this.charmap = wdi['KeymapObj' + layout.toUpperCase()].getCharmap();
            this.stuckKeysHandler = stuckKeysHandler;
        } catch(e) {
			this.keymap = wdi.KeymapES.getKeymap();
            this.ctrlKeymap = wdi.KeymapES.getCtrlKeymap();
            this.ctrlForbiddenKeymap = wdi.KeymapES.getCtrlForbiddenKeymap();
            this.reservedCtrlKeymap =  wdi.KeymapES.getReservedCtrlKeymap();
            this.charmap = wdi.KeymapObjES.getCharmap();
            this.stuckKeysHandler = stuckKeysHandler;
		}
    },

    isInKeymap: function(keycode) {
        return this.keymap[keycode] !== undefined;
    },

    /**
     * Returns the associated spice key code from the given browser keyboard event
     * @param e
     * @returns {*}
     */
    getScanCodes: function(e) {
		if (e['hasScanCode']) {
			return e['scanCode'];
		} else if (this.isForbiddenCombination(e)) {
            return [];
            return this.getScanCodeFromKeyCode(e['keyCode'], e['type'], this.ctrlKeymap, this.reservedCtrlKeymap);
        } else if (this.isGeneratedShortcut(e['type'], e['keyCode'], e['generated'])) {
            return this.getScanCodeFromKeyCode(e['keyCode'], e['type'], this.ctrlKeymap, this.reservedCtrlKeymap);
        } else if (this.handledByCharmap(e['type'])) {
            return this.getScanCodesFromCharCode(e['charCode']);
        } else if (this.handledByNormalKeyCode(e['type'], e['keyCode'])) {
            return this.getScanCodeFromKeyCode(e['keyCode'], e['type'], this.keymap);
        } else {
            return [];
        }
    },

    getScanCodeFromKeyCode: function(keyCode, type, keymap, additionalKeymap) {
        this.controlPressed(keyCode, type);
        var key = null;
        if(keyCode in keymap) {
            key = keymap[keyCode];
        } else {
            key = additionalKeymap[keyCode];
        }
        if (key === undefined) return [];
        if (key < 0x100) {
            if (type == 'keydown') {
                return [this.makeKeymap(key)];
            } else if (type == 'keyup') {
                return [this.makeKeymap(key | 0x80)];
            }
        } else {
            if (type == 'keydown') {
                return [this.makeKeymap(0xe0 | ((key - 0x100) << 8))];
            } else if (type == 'keyup') {
                return [this.makeKeymap(0x80e0 | ((key - 0x100) << 8))];
            }
        }
        return key;
    },

    isForbiddenCombination: function(e) {
        var keyCode = e['keyCode'],
            type = e['type'],
            keymap = this.ctrlForbiddenKeymap;

        if(wdi.KeyEvent.isCtrlPressed(e) && keymap[keyCode]) {
            if(keymap[keyCode]) {
                return true;
            }
        }
        return false;
    },

    controlPressed: function(keyCode, type, event) {
        if (!event) return false;
        if (keyCode !== 17 && keyCode !== 91) {  // Ctrl or CMD key
            if (type === 'keydown') {
                if(wdi.KeyEvent.isCtrlPressed(event)){
                    this.ctrlPressed = true;
                }
            }
            else if (type === 'keyup') {
                if(!wdi.KeyEvent.isCtrlPressed(event)){
                    this.ctrlPressed = false;
                }
            }
        }
    },

    handledByCtrlKeyCode: function(type, keyCode, generated) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
            if (this.ctrlPressed) {
                if (type === 'keypress') {
                    return true;
                }

                if (this.ctrlKeymap[keyCode]) {
                    return true;  // is the second key in a keyboard shortcut (i.e. the x in Ctrl+x)
                }
            }
        }
        return false;
    },

    isGeneratedShortcut: function(type, keyCode, generated) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
            if (this.ctrlPressed) {
                //check if the event is a fake event generated from our gui or programatically
                if(generated && this.reservedCtrlKeymap[keyCode]) {
                    return true;
                }
            }
        }
        return false;
    },

    handledByNormalKeyCode: function(type, keyCode) {
        if (type === 'keydown' || type === 'keyup') {
            if (this.keymap[keyCode]) {
                return true;
            }
        }
        return false;
    },

    handledByCharmap: function(type) {
        return type === 'inputmanager';
    },

    getScanCodesFromCharCode: function(charCode) {
        var scanCodeObj = this.charmap[String.fromCharCode(charCode)];
        var scanCodeObjModifier = new wdi.ScanCodeObjModifier(scanCodeObj);

        if(this.stuckKeysHandler.shiftKeyPressed) {
            if(scanCodeObjModifier.containsShiftDown()) {
                scanCodeObjModifier.removeShift();
            } else {
                scanCodeObjModifier.addShiftUp();
                scanCodeObjModifier.addShiftDown();
            }
        }
        var scanCode = scanCodeObjModifier.getScanCode();
        return scanCode;
    },

    makeKeymap: function(scancode) {
        if ($.inArray(scancode, this.twoBytesScanCodes) != -1) {
            return [0xE0, scancode, 0, 0];
        } else {
            return [scancode, 0, 0];
        }
    }
};

