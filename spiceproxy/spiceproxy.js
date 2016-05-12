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
	 * YES: wdi.Debug.log("something happened: ", whatever);
	 * NO : wdi.Debug.log("something happened: " + whatever);
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

    stringToBytes: function (string) {
        var length = string.length;
        var rawData = [];

        for (var i = 0; i < length; i++) {
            rawData.push(string.charCodeAt(i));
        }

        return rawData;
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode:3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode:3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode:3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode:3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode:3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
            this.numberTo32(this.pixmap_cache_size),
            this.numberTo32(0),
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
            wdi.Debug.log('THERE IS A MASK IMAGE');
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

        this.multimedia_time = this.bytesToInt32NoAllocate(queue);
        
        return this;
    }
});

wdi.PlaybackStop = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,




    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});

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
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
        
        return this;
    }
});

wdi.SpiceDisplayMark = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
        
        return this;
    }
});

wdi.SpiceDisplayReset = $.spcExtend(wdi.SpiceObject, {
    objectSize: 0,

    demarshall: function (queue, expSize) {
        this.expectedSize = expSize || this.objectSize;
        if (queue.getLength() < this.expectedSize) throw new wdi.Exception({message: "Not enough queue to read", errorCode: 3});
        
        return this;
    }
});


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
            wdi.Debug.error("GlobalPool: cleanPool called with invalid objectType: ",objectType);
        }
    }
};
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
var net = require('net');

wdi.socketStatus = {
	'idle':0,
	'prepared':1,
	'connected':2,
	'disconnected':3,
	'failed':4
};

//Works only with arrays of bytes (this means each value is a number in 0 to 255)
wdi.Socket = $.spcExtend(wdi.EventObject.prototype, {
	netSocket: null,
	status: wdi.socketStatus.idle,
	binary: false,

	connect: function (uri) {
		var self = this;

		var uriParts = uri.split(':');
		var port = uriParts.pop();
		var host = uriParts.pop();

		this.netSocket = new net.Socket();
		this.netSocket.connect(port, host);

		this.status = wdi.socketStatus.prepared;

		this.netSocket.on('spiceMessage', function (data) {
			self.fire('message', new Uint8Array(data));
		});
	},

	send: function (message) {
		this.netSocket.write(message);
	},
	
	disconnect: function () {
		this.netSocket.removeAllListeners();
		this.netSocket.end();
	},
	
	setStatus: function (status) {
		this.status = status;
	},
	
	getStatus: function () {
		return this.status;
	},

	getSocket: function () {
		return this.netSocket;
	}
	
});
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
                 pool.discard(this.retained[objectType][i].poolIndex);
             }
             this.retained[objectType] = [];
        } else {
            wdi.Debug.error("GlobalPool: cleanPool called with invalid objectType: ",objectType);
        }
    }
}
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
            throw "Not enough queue to read";
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
		wdi.Debug.log('socket Queue disconnect');
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
wdi.PacketController = $.spcExtend(wdi.EventObject.prototype, {
	sizeDefiner: null,
	packetExtractor: null,
	
	init: function(c) {
		this.superInit();
		this.sizeDefiner = c.sizeDefiner;
		this.packetExtractor = c.packetExtractor;
	},

	dispose: function() {
		wdi.Debug.log('PacketTroller dispose');
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
		wdi.Debug.log('packetReassembler dispose');
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
	JavaScript BigInteger library version 0.9
	http://silentmatt.com/biginteger/

	Copyright (c) 2009 Matthew Crumley <email@matthewcrumley.com>
	Copyright (c) 2010,2011 by John Tobey <John.Tobey@gmail.com>
	Licensed under the MIT license.

	Support for arbitrary internal representation base was added by
	Vitaly Magerya.
*/

/*
	File: biginteger.js

	Exports:

		<BigInteger>
*/

/*
	Class: BigInteger
	An arbitrarily-large integer.

	<BigInteger> objects should be considered immutable. None of the "built-in"
	methods modify *this* or their arguments. All properties should be
	considered private.

	All the methods of <BigInteger> instances can be called "statically". The
	static versions are convenient if you don't already have a <BigInteger>
	object.

	As an example, these calls are equivalent.

	> BigInteger(4).multiply(5); // returns BigInteger(20);
	> BigInteger.multiply(4, 5); // returns BigInteger(20);

	> var a = 42;
	> var a = BigInteger.toJSValue("0b101010"); // Not completely useless...
*/

// IE doesn't support Array.prototype.map
if (!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
		var len = this.length >>> 0;
		if (typeof fun !== "function") {
			throw new TypeError();
		}

		var res = new Array(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				res[i] = fun.call(thisp, this[i], i, this);
			}
		}

		return res;
	};
}

/*
	Constructor: BigInteger()
	Convert a value to a <BigInteger>.

	Although <BigInteger()> is the constructor for <BigInteger> objects, it is
	best not to call it as a constructor. If *n* is a <BigInteger> object, it is
	simply returned as-is. Otherwise, <BigInteger()> is equivalent to <parse>
	without a radix argument.

	> var n0 = BigInteger();      // Same as <BigInteger.ZERO>
	> var n1 = BigInteger("123"); // Create a new <BigInteger> with value 123
	> var n2 = BigInteger(123);   // Create a new <BigInteger> with value 123
	> var n3 = BigInteger(n2);    // Return n2, unchanged

	The constructor form only takes an array and a sign. *n* must be an
	array of numbers in little-endian order, where each digit is between 0
	and BigInteger.base.  The second parameter sets the sign: -1 for
	negative, +1 for positive, or 0 for zero. The array is *not copied and
	may be modified*. If the array contains only zeros, the sign parameter
	is ignored and is forced to zero.

	> new BigInteger([5], -1): create a new BigInteger with value -5

	Parameters:

		n - Value to convert to a <BigInteger>.

	Returns:

		A <BigInteger> value.

	See Also:

		<parse>, <BigInteger>
*/
function BigInteger(n, s) {
	if (!(this instanceof BigInteger)) {
		if (n instanceof BigInteger) {
			return n;
		}
		else if (typeof n === "undefined") {
			return BigInteger.ZERO;
		}
		return BigInteger.parse(n);
	}

	n = n || [];  // Provide the nullary constructor for subclasses.
	while (n.length && !n[n.length - 1]) {
		--n.length;
	}
	this._d = n;
	this._s = n.length ? (s || 1) : 0;
}

// Base-10 speedup hacks in parse, toString, exp10 and log functions
// require base to be a power of 10. 10^7 is the largest such power
// that won't cause a precision loss when digits are multiplied.
BigInteger.base = 10000000;
BigInteger.base_log10 = 7;

BigInteger.init = function() {

// Constant: ZERO
// <BigInteger> 0.
BigInteger.ZERO = new BigInteger([], 0);

// Constant: ONE
// <BigInteger> 1.
BigInteger.ONE = new BigInteger([1], 1);

// Constant: M_ONE
// <BigInteger> -1.
BigInteger.M_ONE = new BigInteger(BigInteger.ONE._d, -1);

// Constant: _0
// Shortcut for <ZERO>.
BigInteger._0 = BigInteger.ZERO;

// Constant: _1
// Shortcut for <ONE>.
BigInteger._1 = BigInteger.ONE;

/*
	Constant: small
	Array of <BigIntegers> from 0 to 36.

	These are used internally for parsing, but useful when you need a "small"
	<BigInteger>.

	See Also:

		<ZERO>, <ONE>, <_0>, <_1>
*/
BigInteger.small = [
	BigInteger.ZERO,
	BigInteger.ONE,
	/* Assuming BigInteger.base > 36 */
	new BigInteger( [2], 1),
	new BigInteger( [3], 1),
	new BigInteger( [4], 1),
	new BigInteger( [5], 1),
	new BigInteger( [6], 1),
	new BigInteger( [7], 1),
	new BigInteger( [8], 1),
	new BigInteger( [9], 1),
	new BigInteger([10], 1),
	new BigInteger([11], 1),
	new BigInteger([12], 1),
	new BigInteger([13], 1),
	new BigInteger([14], 1),
	new BigInteger([15], 1),
	new BigInteger([16], 1),
	new BigInteger([17], 1),
	new BigInteger([18], 1),
	new BigInteger([19], 1),
	new BigInteger([20], 1),
	new BigInteger([21], 1),
	new BigInteger([22], 1),
	new BigInteger([23], 1),
	new BigInteger([24], 1),
	new BigInteger([25], 1),
	new BigInteger([26], 1),
	new BigInteger([27], 1),
	new BigInteger([28], 1),
	new BigInteger([29], 1),
	new BigInteger([30], 1),
	new BigInteger([31], 1),
	new BigInteger([32], 1),
	new BigInteger([33], 1),
	new BigInteger([34], 1),
	new BigInteger([35], 1),
	new BigInteger([36], 1)
];
}
BigInteger.init();

// Used for parsing/radix conversion
BigInteger.digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/*
	Method: toString
	Convert a <BigInteger> to a string.

	When *base* is greater than 10, letters are upper case.

	Parameters:

		base - Optional base to represent the number in (default is base 10).
		       Must be between 2 and 36 inclusive, or an Error will be thrown.

	Returns:

		The string representation of the <BigInteger>.
*/
BigInteger.prototype.toString = function(base) {
	base = +base || 10;
	if (base < 2 || base > 36) {
		throw new Error("illegal radix " + base + ".");
	}
	if (this._s === 0) {
		return "0";
	}
	if (base === 10) {
		var str = this._s < 0 ? "-" : "";
		str += this._d[this._d.length - 1].toString();
		for (var i = this._d.length - 2; i >= 0; i--) {
			var group = this._d[i].toString();
			while (group.length < BigInteger.base_log10) group = '0' + group;
			str += group;
		}
		return str;
	}
	else {
		var numerals = BigInteger.digits;
		base = BigInteger.small[base];
		var sign = this._s;

		var n = this.abs();
		var digits = [];
		var digit;

		while (n._s !== 0) {
			var divmod = n.divRem(base);
			n = divmod[0];
			digit = divmod[1];
			// TODO: This could be changed to unshift instead of reversing at the end.
			// Benchmark both to compare speeds.
			digits.push(numerals[digit.valueOf()]);
		}
		return (sign < 0 ? "-" : "") + digits.reverse().join("");
	}
};

// Verify strings for parsing
BigInteger.radixRegex = [
	/^$/,
	/^$/,
	/^[01]*$/,
	/^[012]*$/,
	/^[0-3]*$/,
	/^[0-4]*$/,
	/^[0-5]*$/,
	/^[0-6]*$/,
	/^[0-7]*$/,
	/^[0-8]*$/,
	/^[0-9]*$/,
	/^[0-9aA]*$/,
	/^[0-9abAB]*$/,
	/^[0-9abcABC]*$/,
	/^[0-9a-dA-D]*$/,
	/^[0-9a-eA-E]*$/,
	/^[0-9a-fA-F]*$/,
	/^[0-9a-gA-G]*$/,
	/^[0-9a-hA-H]*$/,
	/^[0-9a-iA-I]*$/,
	/^[0-9a-jA-J]*$/,
	/^[0-9a-kA-K]*$/,
	/^[0-9a-lA-L]*$/,
	/^[0-9a-mA-M]*$/,
	/^[0-9a-nA-N]*$/,
	/^[0-9a-oA-O]*$/,
	/^[0-9a-pA-P]*$/,
	/^[0-9a-qA-Q]*$/,
	/^[0-9a-rA-R]*$/,
	/^[0-9a-sA-S]*$/,
	/^[0-9a-tA-T]*$/,
	/^[0-9a-uA-U]*$/,
	/^[0-9a-vA-V]*$/,
	/^[0-9a-wA-W]*$/,
	/^[0-9a-xA-X]*$/,
	/^[0-9a-yA-Y]*$/,
	/^[0-9a-zA-Z]*$/
];

/*
	Function: parse
	Parse a string into a <BigInteger>.

	*base* is optional but, if provided, must be from 2 to 36 inclusive. If
	*base* is not provided, it will be guessed based on the leading characters
	of *s* as follows:

	- "0x" or "0X": *base* = 16
	- "0c" or "0C": *base* = 8
	- "0b" or "0B": *base* = 2
	- else: *base* = 10

	If no base is provided, or *base* is 10, the number can be in exponential
	form. For example, these are all valid:

	> BigInteger.parse("1e9");              // Same as "1000000000"
	> BigInteger.parse("1.234*10^3");       // Same as 1234
	> BigInteger.parse("56789 * 10 ** -2"); // Same as 567

	If any characters fall outside the range defined by the radix, an exception
	will be thrown.

	Parameters:

		s - The string to parse.
		base - Optional radix (default is to guess based on *s*).

	Returns:

		a <BigInteger> instance.
*/
BigInteger.parse = function(s, base) {
	// Expands a number in exponential form to decimal form.
	// expandExponential("-13.441*10^5") === "1344100";
	// expandExponential("1.12300e-1") === "0.112300";
	// expandExponential(1000000000000000000000000000000) === "1000000000000000000000000000000";
	function expandExponential(str) {
		str = str.replace(/\s*[*xX]\s*10\s*(\^|\*\*)\s*/, "e");

		return str.replace(/^([+\-])?(\d+)\.?(\d*)[eE]([+\-]?\d+)$/, function(x, s, n, f, c) {
			c = +c;
			var l = c < 0;
			var i = n.length + c;
			x = (l ? n : f).length;
			c = ((c = Math.abs(c)) >= x ? c - x + l : 0);
			var z = (new Array(c + 1)).join("0");
			var r = n + f;
			return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
		});
	}

	s = s.toString();
	if (typeof base === "undefined" || +base === 10) {
		s = expandExponential(s);
	}

	var parts = /^([+\-]?)(0[xXcCbB])?([0-9A-Za-z]*)(?:\.\d*)?$/.exec(s);
	if (parts) {
		var sign = parts[1] || "+";
		var baseSection = parts[2] || "";
		var digits = parts[3] || "";

		if (typeof base === "undefined") {
			// Guess base
			if (baseSection === "0x" || baseSection === "0X") { // Hex
				base = 16;
			}
			else if (baseSection === "0c" || baseSection === "0C") { // Octal
				base = 8;
			}
			else if (baseSection === "0b" || baseSection === "0B") { // Binary
				base = 2;
			}
			else {
				base = 10;
			}
		}
		else if (base < 2 || base > 36) {
			throw new Error("Illegal radix " + base + ".");
		}

		base = +base;

		// Check for digits outside the range
		if (!(BigInteger.radixRegex[base].test(digits))) {
			throw new Error("Bad digit for radix " + base);
		}

		// Strip leading zeros, and convert to array
		digits = digits.replace(/^0+/, "").split("");
		if (digits.length === 0) {
			return BigInteger.ZERO;
		}

		// Get the sign (we know it's not zero)
		sign = (sign === "-") ? -1 : 1;

		// Optimize 10
		if (base == 10) {
			var d = [];
			while (digits.length >= BigInteger.base_log10) {
				d.push(parseInt(digits.splice(-BigInteger.base_log10).join(''), 10));
			}
			d.push(parseInt(digits.join(''), 10));
			return new BigInteger(d, sign);
		}

		// Optimize base
		if (base === BigInteger.base) {
			return new BigInteger(digits.map(Number).reverse(), sign);
		}

		// Do the conversion
		var d = BigInteger.ZERO;
		base = BigInteger.small[base];
		var small = BigInteger.small;
		for (var i = 0; i < digits.length; i++) {
			d = d.multiply(base).add(small[parseInt(digits[i], 36)]);
		}
		return new BigInteger(d._d, sign);
	}
	else {
		throw new Error("Invalid BigInteger format: " + s);
	}
};

/*
	Function: add
	Add two <BigIntegers>.

	Parameters:

		n - The number to add to *this*. Will be converted to a <BigInteger>.

	Returns:

		The numbers added together.

	See Also:

		<subtract>, <multiply>, <quotient>, <next>
*/
BigInteger.prototype.add = function(n) {
	if (this._s === 0) {
		return BigInteger(n);
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return this;
	}
	if (this._s !== n._s) {
		n = n.negate();
		return this.subtract(n);
	}

	var a = this._d;
	var b = n._d;
	var al = a.length;
	var bl = b.length;
	var sum = new Array(Math.max(al, bl) + 1);
	var size = Math.min(al, bl);
	var carry = 0;
	var digit;

	for (var i = 0; i < size; i++) {
		digit = a[i] + b[i] + carry;
		sum[i] = digit % BigInteger.base;
		carry = (digit / BigInteger.base) | 0;
	}
	if (bl > al) {
		a = b;
		al = bl;
	}
	for (i = size; carry && i < al; i++) {
		digit = a[i] + carry;
		sum[i] = digit % BigInteger.base;
		carry = (digit / BigInteger.base) | 0;
	}
	if (carry) {
		sum[i] = carry;
	}

	for ( ; i < al; i++) {
		sum[i] = a[i];
	}

	return new BigInteger(sum, this._s);
};

/*
	Function: negate
	Get the additive inverse of a <BigInteger>.

	Returns:

		A <BigInteger> with the same magnatude, but with the opposite sign.

	See Also:

		<abs>
*/
BigInteger.prototype.negate = function() {
	return new BigInteger(this._d, -this._s);
};

/*
	Function: abs
	Get the absolute value of a <BigInteger>.

	Returns:

		A <BigInteger> with the same magnatude, but always positive (or zero).

	See Also:

		<negate>
*/
BigInteger.prototype.abs = function() {
	return (this._s < 0) ? this.negate() : this;
};

/*
	Function: subtract
	Subtract two <BigIntegers>.

	Parameters:

		n - The number to subtract from *this*. Will be converted to a <BigInteger>.

	Returns:

		The *n* subtracted from *this*.

	See Also:

		<add>, <multiply>, <quotient>, <prev>
*/
BigInteger.prototype.subtract = function(n) {
	if (this._s === 0) {
		return BigInteger(n).negate();
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return this;
	}
	if (this._s !== n._s) {
		n = n.negate();
		return this.add(n);
	}

	var m = this;
	var t;
	// negative - negative => -|a| - -|b| => -|a| + |b| => |b| - |a|
	if (this._s < 0) {
		t = m;
		m = new BigInteger(n._d, 1);
		n = new BigInteger(t._d, 1);
	}

	// Both are positive => a - b
	var sign = m.compareAbs(n);
	if (sign === 0) {
		return BigInteger.ZERO;
	}
	else if (sign < 0) {
		// swap m and n
		t = n;
		n = m;
		m = t;
	}

	// a > b
	var a = m._d;
	var b = n._d;
	var al = a.length;
	var bl = b.length;
	var diff = new Array(al); // al >= bl since a > b
	var borrow = 0;
	var i;
	var digit;

	for (i = 0; i < bl; i++) {
		digit = a[i] - borrow - b[i];
		if (digit < 0) {
			digit += BigInteger.base;
			borrow = 1;
		}
		else {
			borrow = 0;
		}
		diff[i] = digit;
	}
	for (i = bl; i < al; i++) {
		digit = a[i] - borrow;
		if (digit < 0) {
			digit += BigInteger.base;
		}
		else {
			diff[i++] = digit;
			break;
		}
		diff[i] = digit;
	}
	for ( ; i < al; i++) {
		diff[i] = a[i];
	}

	return new BigInteger(diff, sign);
};

(function() {
	function addOne(n, sign) {
		var a = n._d;
		var sum = a.slice();
		var carry = true;
		var i = 0;

		while (true) {
			var digit = (a[i] || 0) + 1;
			sum[i] = digit % BigInteger.base;
			if (digit <= BigInteger.base - 1) {
				break;
			}
			++i;
		}

		return new BigInteger(sum, sign);
	}

	function subtractOne(n, sign) {
		var a = n._d;
		var sum = a.slice();
		var borrow = true;
		var i = 0;

		while (true) {
			var digit = (a[i] || 0) - 1;
			if (digit < 0) {
				sum[i] = digit + BigInteger.base;
			}
			else {
				sum[i] = digit;
				break;
			}
			++i;
		}

		return new BigInteger(sum, sign);
	}

	/*
		Function: next
		Get the next <BigInteger> (add one).

		Returns:

			*this* + 1.

		See Also:

			<add>, <prev>
	*/
	BigInteger.prototype.next = function() {
		switch (this._s) {
		case 0:
			return BigInteger.ONE;
		case -1:
			return subtractOne(this, -1);
		// case 1:
		default:
			return addOne(this, 1);
		}
	};

	/*
		Function: prev
		Get the previous <BigInteger> (subtract one).

		Returns:

			*this* - 1.

		See Also:

			<next>, <subtract>
	*/
	BigInteger.prototype.prev = function() {
		switch (this._s) {
		case 0:
			return BigInteger.M_ONE;
		case -1:
			return addOne(this, -1);
		// case 1:
		default:
			return subtractOne(this, 1);
		}
	};
})();

/*
	Function: compareAbs
	Compare the absolute value of two <BigIntegers>.

	Calling <compareAbs> is faster than calling <abs> twice, then <compare>.

	Parameters:

		n - The number to compare to *this*. Will be converted to a <BigInteger>.

	Returns:

		-1, 0, or +1 if *|this|* is less than, equal to, or greater than *|n|*.

	See Also:

		<compare>, <abs>
*/
BigInteger.prototype.compareAbs = function(n) {
	if (this === n) {
		return 0;
	}

	if (!(n instanceof BigInteger)) {
		if (!isFinite(n)) {
			return(isNaN(n) ? n : -1);
		}
		n = BigInteger(n);
	}

	if (this._s === 0) {
		return (n._s !== 0) ? -1 : 0;
	}
	if (n._s === 0) {
		return 1;
	}

	var l = this._d.length;
	var nl = n._d.length;
	if (l < nl) {
		return -1;
	}
	else if (l > nl) {
		return 1;
	}

	var a = this._d;
	var b = n._d;
	for (var i = l-1; i >= 0; i--) {
		if (a[i] !== b[i]) {
			return a[i] < b[i] ? -1 : 1;
		}
	}

	return 0;
};

/*
	Function: compare
	Compare two <BigIntegers>.

	Parameters:

		n - The number to compare to *this*. Will be converted to a <BigInteger>.

	Returns:

		-1, 0, or +1 if *this* is less than, equal to, or greater than *n*.

	See Also:

		<compareAbs>, <isPositive>, <isNegative>, <isUnit>
*/
BigInteger.prototype.compare = function(n) {
	if (this === n) {
		return 0;
	}

	n = BigInteger(n);

	if (this._s === 0) {
		return -n._s;
	}

	if (this._s === n._s) { // both positive or both negative
		var cmp = this.compareAbs(n);
		return cmp * this._s;
	}
	else {
		return this._s;
	}
};

/*
	Function: isUnit
	Return true iff *this* is either 1 or -1.

	Returns:

		true if *this* compares equal to <BigInteger.ONE> or <BigInteger.M_ONE>.

	See Also:

		<isZero>, <isNegative>, <isPositive>, <compareAbs>, <compare>,
		<BigInteger.ONE>, <BigInteger.M_ONE>
*/
BigInteger.prototype.isUnit = function() {
	return this === BigInteger.ONE ||
		this === BigInteger.M_ONE ||
		(this._d.length === 1 && this._d[0] === 1);
};

/*
	Function: multiply
	Multiply two <BigIntegers>.

	Parameters:

		n - The number to multiply *this* by. Will be converted to a
		<BigInteger>.

	Returns:

		The numbers multiplied together.

	See Also:

		<add>, <subtract>, <quotient>, <square>
*/
BigInteger.prototype.multiply = function(n) {
	// TODO: Consider adding Karatsuba multiplication for large numbers
	if (this._s === 0) {
		return BigInteger.ZERO;
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return BigInteger.ZERO;
	}
	if (this.isUnit()) {
		if (this._s < 0) {
			return n.negate();
		}
		return n;
	}
	if (n.isUnit()) {
		if (n._s < 0) {
			return this.negate();
		}
		return this;
	}
	if (this === n) {
		return this.square();
	}

	var r = (this._d.length >= n._d.length);
	var a = (r ? this : n)._d; // a will be longer than b
	var b = (r ? n : this)._d;
	var al = a.length;
	var bl = b.length;

	var pl = al + bl;
	var partial = new Array(pl);
	var i;
	for (i = 0; i < pl; i++) {
		partial[i] = 0;
	}

	for (i = 0; i < bl; i++) {
		var carry = 0;
		var bi = b[i];
		var jlimit = al + i;
		var digit;
		for (var j = i; j < jlimit; j++) {
			digit = partial[j] + bi * a[j - i] + carry;
			carry = (digit / BigInteger.base) | 0;
			partial[j] = (digit % BigInteger.base) | 0;
		}
		if (carry) {
			digit = partial[j] + carry;
			carry = (digit / BigInteger.base) | 0;
			partial[j] = digit % BigInteger.base;
		}
	}
	return new BigInteger(partial, this._s * n._s);
};

// Multiply a BigInteger by a single-digit native number
// Assumes that this and n are >= 0
// This is not really intended to be used outside the library itself
BigInteger.prototype.multiplySingleDigit = function(n) {
	if (n === 0 || this._s === 0) {
		return BigInteger.ZERO;
	}
	if (n === 1) {
		return this;
	}

	var digit;
	if (this._d.length === 1) {
		digit = this._d[0] * n;
		if (digit >= BigInteger.base) {
			return new BigInteger([(digit % BigInteger.base)|0,
					(digit / BigInteger.base)|0], 1);
		}
		return new BigInteger([digit], 1);
	}

	if (n === 2) {
		return this.add(this);
	}
	if (this.isUnit()) {
		return new BigInteger([n], 1);
	}

	var a = this._d;
	var al = a.length;

	var pl = al + 1;
	var partial = new Array(pl);
	for (var i = 0; i < pl; i++) {
		partial[i] = 0;
	}

	var carry = 0;
	for (var j = 0; j < al; j++) {
		digit = n * a[j] + carry;
		carry = (digit / BigInteger.base) | 0;
		partial[j] = (digit % BigInteger.base) | 0;
	}
	if (carry) {
		digit = carry;
		carry = (digit / BigInteger.base) | 0;
		partial[j] = digit % BigInteger.base;
	}

	return new BigInteger(partial, 1);
};

/*
	Function: square
	Multiply a <BigInteger> by itself.

	This is slightly faster than regular multiplication, since it removes the
	duplicated multiplcations.

	Returns:

		> this.multiply(this)

	See Also:
		<multiply>
*/
BigInteger.prototype.square = function() {
	// Normally, squaring a 10-digit number would take 100 multiplications.
	// Of these 10 are unique diagonals, of the remaining 90 (100-10), 45 are repeated.
	// This procedure saves (N*(N-1))/2 multiplications, (e.g., 45 of 100 multiplies).
	// Based on code by Gary Darby, Intellitech Systems Inc., www.DelphiForFun.org

	if (this._s === 0) {
		return BigInteger.ZERO;
	}
	if (this.isUnit()) {
		return BigInteger.ONE;
	}

	var digits = this._d;
	var length = digits.length;
	var imult1 = new Array(length + length + 1);
	var product, carry, k;
	var i;

	// Calculate diagonal
	for (i = 0; i < length; i++) {
		k = i * 2;
		product = digits[i] * digits[i];
		carry = (product / BigInteger.base) | 0;
		imult1[k] = product % BigInteger.base;
		imult1[k + 1] = carry;
	}

	// Calculate repeating part
	for (i = 0; i < length; i++) {
		carry = 0;
		k = i * 2 + 1;
		for (var j = i + 1; j < length; j++, k++) {
			product = digits[j] * digits[i] * 2 + imult1[k] + carry;
			carry = (product / BigInteger.base) | 0;
			imult1[k] = product % BigInteger.base;
		}
		k = length + i;
		var digit = carry + imult1[k];
		carry = (digit / BigInteger.base) | 0;
		imult1[k] = digit % BigInteger.base;
		imult1[k + 1] += carry;
	}

	return new BigInteger(imult1, 1);
};

/*
	Function: quotient
	Divide two <BigIntegers> and truncate towards zero.

	<quotient> throws an exception if *n* is zero.

	Parameters:

		n - The number to divide *this* by. Will be converted to a <BigInteger>.

	Returns:

		The *this* / *n*, truncated to an integer.

	See Also:

		<add>, <subtract>, <multiply>, <divRem>, <remainder>
*/
BigInteger.prototype.quotient = function(n) {
	return this.divRem(n)[0];
};

/*
	Function: divide
	Deprecated synonym for <quotient>.
*/
BigInteger.prototype.divide = BigInteger.prototype.quotient;

/*
	Function: remainder
	Calculate the remainder of two <BigIntegers>.

	<remainder> throws an exception if *n* is zero.

	Parameters:

		n - The remainder after *this* is divided *this* by *n*. Will be
		    converted to a <BigInteger>.

	Returns:

		*this* % *n*.

	See Also:

		<divRem>, <quotient>
*/
BigInteger.prototype.remainder = function(n) {
	return this.divRem(n)[1];
};

/*
	Function: divRem
	Calculate the integer quotient and remainder of two <BigIntegers>.

	<divRem> throws an exception if *n* is zero.

	Parameters:

		n - The number to divide *this* by. Will be converted to a <BigInteger>.

	Returns:

		A two-element array containing the quotient and the remainder.

		> a.divRem(b)

		is exactly equivalent to

		> [a.quotient(b), a.remainder(b)]

		except it is faster, because they are calculated at the same time.

	See Also:

		<quotient>, <remainder>
*/
BigInteger.prototype.divRem = function(n) {
	n = BigInteger(n);
	if (n._s === 0) {
		throw new Error("Divide by zero");
	}
	if (this._s === 0) {
		return [BigInteger.ZERO, BigInteger.ZERO];
	}
	if (n._d.length === 1) {
		return this.divRemSmall(n._s * n._d[0]);
	}

	// Test for easy cases -- |n1| <= |n2|
	switch (this.compareAbs(n)) {
	case 0: // n1 == n2
		return [this._s === n._s ? BigInteger.ONE : BigInteger.M_ONE, BigInteger.ZERO];
	case -1: // |n1| < |n2|
		return [BigInteger.ZERO, this];
	}

	var sign = this._s * n._s;
	var a = n.abs();
	var b_digits = this._d.slice();
	var digits = n._d.length;
	var max = b_digits.length;
	var quot = [];
	var guess;

	var part = new BigInteger([], 1);
	part._s = 1;

	while (b_digits.length) {
		part._d.unshift(b_digits.pop());
		part = new BigInteger(part._d, 1);

		if (part.compareAbs(n) < 0) {
			quot.push(0);
			continue;
		}
		if (part._s === 0) {
			guess = 0;
		}
		else {
			var xlen = part._d.length, ylen = a._d.length;
			var highx = part._d[xlen-1]*BigInteger.base + part._d[xlen-2];
			var highy = a._d[ylen-1]*BigInteger.base + a._d[ylen-2];
			if (part._d.length > a._d.length) {
				// The length of part._d can either match a._d length,
				// or exceed it by one.
				highx = (highx+1)*BigInteger.base;
			}
			guess = Math.ceil(highx/highy);
		}
		do {
			var check = a.multiplySingleDigit(guess);
			if (check.compareAbs(part) <= 0) {
				break;
			}
			guess--;
		} while (guess);

		quot.push(guess);
		if (!guess) {
			continue;
		}
		var diff = part.subtract(check);
		part._d = diff._d.slice();
	}

	return [new BigInteger(quot.reverse(), sign),
		   new BigInteger(part._d, this._s)];
};

// Throws an exception if n is outside of (-BigInteger.base, -1] or
// [1, BigInteger.base).  It's not necessary to call this, since the
// other division functions will call it if they are able to.
BigInteger.prototype.divRemSmall = function(n) {
	var r;
	n = +n;
	if (n === 0) {
		throw new Error("Divide by zero");
	}

	var n_s = n < 0 ? -1 : 1;
	var sign = this._s * n_s;
	n = Math.abs(n);

	if (n < 1 || n >= BigInteger.base) {
		throw new Error("Argument out of range");
	}

	if (this._s === 0) {
		return [BigInteger.ZERO, BigInteger.ZERO];
	}

	if (n === 1 || n === -1) {
		return [(sign === 1) ? this.abs() : new BigInteger(this._d, sign), BigInteger.ZERO];
	}

	// 2 <= n < BigInteger.base

	// divide a single digit by a single digit
	if (this._d.length === 1) {
		var q = new BigInteger([(this._d[0] / n) | 0], 1);
		r = new BigInteger([(this._d[0] % n) | 0], 1);
		if (sign < 0) {
			q = q.negate();
		}
		if (this._s < 0) {
			r = r.negate();
		}
		return [q, r];
	}

	var digits = this._d.slice();
	var quot = new Array(digits.length);
	var part = 0;
	var diff = 0;
	var i = 0;
	var guess;

	while (digits.length) {
		part = part * BigInteger.base + digits[digits.length - 1];
		if (part < n) {
			quot[i++] = 0;
			digits.pop();
			diff = BigInteger.base * diff + part;
			continue;
		}
		if (part === 0) {
			guess = 0;
		}
		else {
			guess = (part / n) | 0;
		}

		var check = n * guess;
		diff = part - check;
		quot[i++] = guess;
		if (!guess) {
			digits.pop();
			continue;
		}

		digits.pop();
		part = diff;
	}

	r = new BigInteger([diff], 1);
	if (this._s < 0) {
		r = r.negate();
	}
	return [new BigInteger(quot.reverse(), sign), r];
};

/*
	Function: isEven
	Return true iff *this* is divisible by two.

	Note that <BigInteger.ZERO> is even.

	Returns:

		true if *this* is even, false otherwise.

	See Also:

		<isOdd>
*/
BigInteger.prototype.isEven = function() {
	var digits = this._d;
	return this._s === 0 || digits.length === 0 || (digits[0] % 2) === 0;
};

/*
	Function: isOdd
	Return true iff *this* is not divisible by two.

	Returns:

		true if *this* is odd, false otherwise.

	See Also:

		<isEven>
*/
BigInteger.prototype.isOdd = function() {
	return !this.isEven();
};

/*
	Function: sign
	Get the sign of a <BigInteger>.

	Returns:

		* -1 if *this* < 0
		* 0 if *this* == 0
		* +1 if *this* > 0

	See Also:

		<isZero>, <isPositive>, <isNegative>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.sign = function() {
	return this._s;
};

/*
	Function: isPositive
	Return true iff *this* > 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == 1.

	See Also:

		<sign>, <isZero>, <isNegative>, <isUnit>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.isPositive = function() {
	return this._s > 0;
};

/*
	Function: isNegative
	Return true iff *this* < 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == -1.

	See Also:

		<sign>, <isPositive>, <isZero>, <isUnit>, <compare>, <BigInteger.ZERO>
*/
BigInteger.prototype.isNegative = function() {
	return this._s < 0;
};

/*
	Function: isZero
	Return true iff *this* == 0.

	Returns:

		true if *this*.compare(<BigInteger.ZERO>) == 0.

	See Also:

		<sign>, <isPositive>, <isNegative>, <isUnit>, <BigInteger.ZERO>
*/
BigInteger.prototype.isZero = function() {
	return this._s === 0;
};

/*
	Function: exp10
	Multiply a <BigInteger> by a power of 10.

	This is equivalent to, but faster than

	> if (n >= 0) {
	>     return this.multiply(BigInteger("1e" + n));
	> }
	> else { // n <= 0
	>     return this.quotient(BigInteger("1e" + -n));
	> }

	Parameters:

		n - The power of 10 to multiply *this* by. *n* is converted to a
		javascipt number and must be no greater than <BigInteger.MAX_EXP>
		(0x7FFFFFFF), or an exception will be thrown.

	Returns:

		*this* * (10 ** *n*), truncated to an integer if necessary.

	See Also:

		<pow>, <multiply>
*/
BigInteger.prototype.exp10 = function(n) {
	n = +n;
	if (n === 0) {
		return this;
	}
	if (Math.abs(n) > Number(BigInteger.MAX_EXP)) {
		throw new Error("exponent too large in BigInteger.exp10");
	}
	if (n > 0) {
		var k = new BigInteger(this._d.slice(), this._s);

		for (; n >= BigInteger.base_log10; n -= BigInteger.base_log10) {
			k._d.unshift(0);
		}
		if (n == 0)
			return k;
		k._s = 1;
		k = k.multiplySingleDigit(Math.pow(10, n));
		return (this._s < 0 ? k.negate() : k);
	} else if (-n >= this._d.length*BigInteger.base_log10) {
		return BigInteger.ZERO;
	} else {
		var k = new BigInteger(this._d.slice(), this._s);

		for (n = -n; n >= BigInteger.base_log10; n -= BigInteger.base_log10) {
			k._d.shift();
		}
		return (n == 0) ? k : k.divRemSmall(Math.pow(10, n))[0];
	}
};

/*
	Function: pow
	Raise a <BigInteger> to a power.

	In this implementation, 0**0 is 1.

	Parameters:

		n - The exponent to raise *this* by. *n* must be no greater than
		<BigInteger.MAX_EXP> (0x7FFFFFFF), or an exception will be thrown.

	Returns:

		*this* raised to the *nth* power.

	See Also:

		<modPow>
*/
BigInteger.prototype.pow = function(n) {
	if (this.isUnit()) {
		if (this._s > 0) {
			return this;
		}
		else {
			return BigInteger(n).isOdd() ? this : this.negate();
		}
	}

	n = BigInteger(n);
	if (n._s === 0) {
		return BigInteger.ONE;
	}
	else if (n._s < 0) {
		if (this._s === 0) {
			throw new Error("Divide by zero");
		}
		else {
			return BigInteger.ZERO;
		}
	}
	if (this._s === 0) {
		return BigInteger.ZERO;
	}
	if (n.isUnit()) {
		return this;
	}

	if (n.compareAbs(BigInteger.MAX_EXP) > 0) {
		throw new Error("exponent too large in BigInteger.pow");
	}
	var x = this;
	var aux = BigInteger.ONE;
	var two = BigInteger.small[2];

	while (n.isPositive()) {
		if (n.isOdd()) {
			aux = aux.multiply(x);
			if (n.isUnit()) {
				return aux;
			}
		}
		x = x.square();
		n = n.quotient(two);
	}

	return aux;
};

/*
	Function: modPow
	Raise a <BigInteger> to a power (mod m).

	Because it is reduced by a modulus, <modPow> is not limited by
	<BigInteger.MAX_EXP> like <pow>.

	Parameters:

		exponent - The exponent to raise *this* by. Must be positive.
		modulus - The modulus.

	Returns:

		*this* ^ *exponent* (mod *modulus*).

	See Also:

		<pow>, <mod>
*/
BigInteger.prototype.modPow = function(exponent, modulus) {
	var result = BigInteger.ONE;
	var base = this;

	while (exponent.isPositive()) {
		if (exponent.isOdd()) {
			result = result.multiply(base).remainder(modulus);
		}

		exponent = exponent.quotient(BigInteger.small[2]);
		if (exponent.isPositive()) {
			base = base.square().remainder(modulus);
		}
	}

	return result;
};

/*
	Function: log
	Get the natural logarithm of a <BigInteger> as a native JavaScript number.

	This is equivalent to

	> Math.log(this.toJSValue())

	but handles values outside of the native number range.

	Returns:

		log( *this* )

	See Also:

		<toJSValue>
*/
BigInteger.prototype.log = function() {
	switch (this._s) {
	case 0:	 return -Infinity;
	case -1: return NaN;
	default: // Fall through.
	}

	var l = this._d.length;

	if (l*BigInteger.base_log10 < 30) {
		return Math.log(this.valueOf());
	}

	var N = Math.ceil(30/BigInteger.base_log10);
	var firstNdigits = this._d.slice(l - N);
	return Math.log((new BigInteger(firstNdigits, 1)).valueOf()) + (l - N) * Math.log(BigInteger.base);
};

/*
	Function: valueOf
	Convert a <BigInteger> to a native JavaScript integer.

	This is called automatically by JavaScipt to convert a <BigInteger> to a
	native value.

	Returns:

		> parseInt(this.toString(), 10)

	See Also:

		<toString>, <toJSValue>
*/
BigInteger.prototype.valueOf = function() {
	return parseInt(this.toString(), 10);
};

/*
	Function: toJSValue
	Convert a <BigInteger> to a native JavaScript integer.

	This is the same as valueOf, but more explicitly named.

	Returns:

		> parseInt(this.toString(), 10)

	See Also:

		<toString>, <valueOf>
*/
BigInteger.prototype.toJSValue = function() {
	return parseInt(this.toString(), 10);
};

// Constant: MAX_EXP
// The largest exponent allowed in <pow> and <exp10> (0x7FFFFFFF or 2147483647).
BigInteger.MAX_EXP = BigInteger(0x7FFFFFFF);

(function() {
	function makeUnary(fn) {
		return function(a) {
			return fn.call(BigInteger(a));
		};
	}

	function makeBinary(fn) {
		return function(a, b) {
			return fn.call(BigInteger(a), BigInteger(b));
		};
	}

	function makeTrinary(fn) {
		return function(a, b, c) {
			return fn.call(BigInteger(a), BigInteger(b), BigInteger(c));
		};
	}

	(function() {
		var i, fn;
		var unary = "toJSValue,isEven,isOdd,sign,isZero,isNegative,abs,isUnit,square,negate,isPositive,toString,next,prev,log".split(",");
		var binary = "compare,remainder,divRem,subtract,add,quotient,divide,multiply,pow,compareAbs".split(",");
		var trinary = ["modPow"];

		for (i = 0; i < unary.length; i++) {
			fn = unary[i];
			BigInteger[fn] = makeUnary(BigInteger.prototype[fn]);
		}

		for (i = 0; i < binary.length; i++) {
			fn = binary[i];
			BigInteger[fn] = makeBinary(BigInteger.prototype[fn]);
		}

		for (i = 0; i < trinary.length; i++) {
			fn = trinary[i];
			BigInteger[fn] = makeTrinary(BigInteger.prototype[fn]);
		}

		BigInteger.exp10 = function(x, n) {
			return BigInteger(x).exp10(n);
		};
	})();
})();

if (typeof exports !== 'undefined') {
	exports.BigInteger = BigInteger;
}
wdi.SpiceChannel = $.spcExtend(wdi.EventObject.prototype, {
	socketQ: null,
	packetReassembler: null,

	init: function (c) {
		this.superInit();
		var socketQ = c.socketQ  || new wdi.SocketQueue();
		this.socketQ = socketQ;
		this.packetReassembler = c.packetReassembler || wdi.ReassemblerFactory.getPacketReassembler(socketQ);
		this.setListeners();
	},

	setListeners: function () {
		this.packetReassembler.addListener('packetComplete', function (e) {
			this.send(e);
		}, this);
	},

	connect: function (uri) {
		this.socketQ.connect(uri);
		this.packetReassembler.start();
	},

	send: function (data) {
		this.fire('send', data);
	}
});

module.exports = wdi; 
