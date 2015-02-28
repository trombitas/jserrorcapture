//Override send method of all XHR requests
/*var RealXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
	if (this.addEventListener) {
		this.addEventListener("readystatechange", function() {
			if (this.readyState === 4) {
				console.log(this.status);
			}
		}, false);
	} else {
		var realOnReadyStateChange = this.onreadystatechange;
		if (realOnReadyStateChange) {
			this.onreadystatechange = function() {
			if (this.readyState === 4) {
				console.log(this.status);
			}
			realOnReadyStateChange();
			};
		}
	}

	RealXHRSend.apply(this, arguments);
};*/

window.jsErrorCapture = (function(window) {
	'use strict';
	
	//Constructor
	var JsErrorCapture = function(options) {
		this.options = copy({
			captureHttpErrors: {
				ignoreStatuses: [400, 300]
			},
			sendOptions: {
				url: '',
				method: "image",			//image, script, post, get
				format: "string"		//string, json, xml
			},
			logErrorsTimeout: 5000,   //When an error is captured wait a bit to see whether others would join in the package (milliseconds)
			logErrorsCount: 1        //Send a package if the number of errors captured within the Timeout reaches this number
		}, options);
		
		//The collection of error objects (returned by captureErrorHandler())
		this.errors = [];
		//Error counter - the captured errors in a package
		this.errorCount = 0;
		
		//setTimeout object
		this.timeout = null;
		
		//Add 'error' event to window
		this.addErrorEvent(this.registerError);
		
		//Capture HTTP calls
		if (this.options.captureHttpErrors) {
			this.watchHttpCalls();
		}	
	};
	
	//Add "error" event to window (fallback window.onerror())
	JsErrorCapture.prototype.addErrorEvent = function(callback) {
		var event = "error",
			element = window,
			self = this;
			
		//Modern browsers way (and IE 11+)
		if (element.addEventListener) {
			element.addEventListener(event, bind(this, callback));
			return true;
		} 
		//MSIE way
		else if (element.attachEvent) {
			return element.attachEvent('on' + event, bind(this, callback));
		}
		//Traditional way
		else {
			event = 'on' + event;
			if (typeof element[event] === 'function'){
				callback = (function(f1, f2){
					return function(){
						f1.apply(this, arguments);
						f2.apply(self, arguments);
					}
				})(element[event], bind(self, callback));
			} else {
				callback = bind(self, callback);
			}
			element[event] = callback;
			return true;
		}
	};
	
	//When an error occurs this function is called
	JsErrorCapture.prototype.registerError = function(errorObj) {
		//Increment the error counter 
		this.errorCount++;
		//Save the error
		this.errors.push({
				message: errorObj.message,
				filename: errorObj.filename,
				lineNumber: errorObj.lineno,
				colNumber: errorObj.colno,
				time: 1 * new Date(),
				browser: window.navigator.userAgent,
				platform: window.navigator.platform,
				lang: window.navigator.language,
				resolutionWidth: screen.width,
				resolutionHeight: screen.height,
				orientation: 'orientation' in screen ? screen.orientation :
							 'mozOrientation' in screen ? screen.mozOrientation :
							 'msOrientation'  in screen ? screen.msOrientation :
							 null
			});
		
		//The number of errors has reached the maximum value
		if (this.errorCount === this.options.logErrorsCount) {
			this.log();
		} else {
			//Start the timer
			if (!this.timeout) {
				this.timeout = window.setTimeout(bind(this, this.log), this.options.logErrorsTimeout);
			} else {
				//If a new error has been found clear the timeout and start a new one again
				window.clearTimeout(this.timeout);
				this.timeout = window.setTimeout(bind(this, this.log), this.options.logErrorsTimeout);
			}
		}	
	};
	
	//Prepare to dispatch the errors
	JsErrorCapture.prototype.log = function() {
		//Send the errors
		this.dispatch();
		
		//Reset counters
		this.errors = [];
		this.errorCount = 0;
		
		//Clear the timeout
		if (this.timeout) {
			window.clearTimeout(this.timeout);
		} 		
	};
	
	//Dispatch the errors
	JsErrorCapture.prototype.dispatch = function() {
		if (this.options.sendOptions && this.options.sendOptions.url) {
			var data = this.formatErrors[this.options.sendOptions.format](this.errors);
		
			this.options.sendOptions.method = this.options.sendOptions.method.toLowerCase();
		
			//Create an AJAX request
			if (this.options.sendOptions.method === "post" || this.options.sendOptions.method === "get") { 
				this.requestXHR({
					type: this.options.sendOptions.method,
					url: this.options.sendOptions.url,
					data: data
				});
			}
			
			//Make an Image request (<img>)
			if (this.options.sendOptions.method === "image") { 
				this.requestImage(this.options.sendOptions.url, data);
			}
			
			//Make a JSONP request
			if (this.options.sendOptions.method === "script") {
				this.requestScript(options.url + '?callback=jsErrorCaptureAjaxSuccess&' + data, {
					callbackName: 'jsErrorCaptureAjaxSuccess',
					timeout: 5
				});
			}
		}
	};
	
	//XML
	JsErrorCapture.prototype.formatErrors = {};
	JsErrorCapture.prototype.formatErrors['xml'] = function(errors) {
		var xml = "<?xml version='1.0' encoding='UTF-8' ?><errors>";
		
		for (var i = errors.length - 1; i >= 0; i--) {
			xml += "<error>";
			for (var key in errors[i]) {
				if (errors[i].hasOwnProperty(key)) {
					xml += "<" + key + ">" + escapeXml(errors[i][key]) + "</" + key + ">";
				}
			}
			xml += "</error>";
		}
		
		xml += "</errors>";
		
		function escapeXml(unsafe) {
			return String(unsafe).replace(/[<>&'"]/g, function (c) {
				switch (c) {
					case '<': return '&lt;';
					case '>': return '&gt;';
					case '&': return '&amp;';
					case '\'': return '&apos;';
					case '"': return '&quot;';
				}
			});
		}

		return xml;
	};
	
	//JSON
	JsErrorCapture.prototype.formatErrors['json'] = function(errors) {
		var json = "{", elem, block = [], blockString;
		
		for (var i = errors.length - 1; i >= 0; i--) {
			blockString = "'error':{";
			elem = [];
			for (var key in errors[i]) {
				if (errors[i].hasOwnProperty(key)) {
					elem.push("'" + key + "':'" + escapeJson(errors[i][key]) + "'");
				}
			}
			blockString += elem.join(",") + "}";
			block.push(blockString);
		}
		
		json += block.join(",") + "}";
		
		function escapeJson(unsafe) {
			return String(unsafe)
				.replace(/\\n/g, "\\n")
				.replace(/\\'/g, "\\'")
				.replace(/\\"/g, '\\"')
				.replace(/\\&/g, "\\&")
				.replace(/\\r/g, "\\r")
				.replace(/\\t/g, "\\t")
				.replace(/\\b/g, "\\b")
				.replace(/\\f/g, "\\f");
		}
		
		return json;
	};
	
	//STRING
	JsErrorCapture.prototype.formatErrors['string'] = function(errors) {
		function serialize(obj, prefix) {
			var str = [];
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					var k = prefix ? prefix + "[" + p + "]" : p, 
						v = obj[p];
					str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
				}
			}
			return str.join("&");
		}
		
		return serialize(errors, "error");
	};
	
	//Capture also errors after erroneous HTTP calls
	JsErrorCapture.prototype.watchHttpCalls = function() {
		//Check jQuery
		if (typeof window.jQuery === "function") {
			this.watchJQueryAjaxErrors();
		}
	};
	
	//Watch jQuery HTTP calls and log errors if any
	JsErrorCapture.prototype.watchJQueryAjaxErrors = function() {
		var self = this,
			origAjax = jQuery.ajax;
			
		jQuery.ajax = function(url, settings) {
			var promise = origAjax.apply(this, arguments);
			
			//Assign another fail() handler
			promise.fail(function(e) {
				/*var ignoreStatuses = self.options.captureHttpErrors.ignoreStatuses;
				
				if ((ignoreStatuses && ignoreStatuses.indexOf(e.status) === -1) || !ignoreStatuses) {
					//When an error occurs call the registerError function 
					self.registerError({
						message: "AJAX " + this.type + " call to " + this.url + "failed, status: " + e.status + ", statusText = " + e.statusText,
						filename: location.href
					});
				}*/
			});
			
			return promise;
		};
	};
	
	//Helper function for making AJAX calls
	//@param options {Object} required options: { type [POST, GET], url, data [Object], success [function], error [function] }
	JsErrorCapture.prototype.requestXHR = function(options) {
		var data = options.data,
			xhr;
			
		//Create the main xmlHTTPRequest object
		try { xhr = _createXHR(); } catch(e) {}
		
		if (window.location.protocol.replace(":", "") !== "https" && xhr && "withCredentials" in xhr){
			xhr.open(options.type, options.url, true);
		} else if (window.location.protocol.replace(":", "") !== "https" && typeof XDomainRequest != "undefined"){
			xhr = new XDomainRequest();
			xhr.open(options.type, options.url);
		} else {
			xhr = document.createElement("script");
			xhr.type = "text/javascript";
			xhr.src = options.url;
		}	
		
		if (!xhr) {
			console && console.log && console.log("Error, no support for AJAX!");
			return;
		}
		
		try { xhr.withCredentials = false; } catch(e) {};
		//xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        //xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		xhr.onload = function (e) { 
			_handleResponse('load')(_is_iexplorer() ? e : e.target); 
		};
	    xhr.onerror = function (e) { 
			console.log("Original Error!!!");
			_handleResponse('error')(_is_iexplorer() ? e : e.target);
		};
	    xhr.send(data || null);
		
		function _handleResponse(eventType) {
			return function (XHRobj) {
				var XHRobj = _is_iexplorer() ? xhr : XHRobj;

				if (eventType == 'load' && (_is_iexplorer() || XHRobj.readyState == 4) && typeof options.success === "function") {
					options.success(XHRobj.responseText, XHRobj);
				} else if (typeof options.error === "function") {
					options.error(XHRobj);
				}	
			}
	    };
	
		//Returns cross-browser XMLHttpRequest, or null if unable
		function _createXHR(){ 
			try { return new XMLHttpRequest(); } catch(e){}
			try { return new ActiveXObject("Msxml3.XMLHTTP"); } catch(e){}
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e){}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e){}
			try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch(e){}
			try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e){}
			return null;
		}
		
		function _is_iexplorer() { 
			return navigator.userAgent.indexOf('MSIE') !== -1;
		}
	};
	
	//JSONP - Cross Origin Calls
    JsErrorCapture.prototype.requestScript = function(url, options) {
		var callback_name = options.callbackName || 'callback',
			on_success = options.onSuccess || function(){},
			on_timeout = options.onTimeout || function(){},
			timeout = options.timeout || 10; // sec

		var timeout_trigger = window.setTimeout(function(){
			on_timeout();
		}, timeout * 1000);

		window[callback_name] = function(data) {
			window.clearTimeout(timeout_trigger);
			on_success(data);
		};

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = url;

		document.getElementsByTagName('head')[0].appendChild(script);
	};
	
	//Image request
	JsErrorCapture.prototype.requestImage = function(url, data) {
		var img = document.createElement("img");
				
		img.width = 1;
		img.height = 1;
		img.style = "position:absolute;display:none";
		img.src = url + (url.indexOf("?") > -1 ? "&" : "?") + 
				  "data=" + data + 
				  "&r0=" + Math.floor((Math.random() * 100) + 1) + 
				  "&r1=" + (1 * new Date());
				  
		document.getElementsByTagName("body")[0].appendChild(img);
	};
	
	//Creates a function having context as this binded
	var bind = function(context, fn) {
		return function() {
			return fn.apply(context, arguments);
		};
	};
	
	//Copy object literals from srcObj to destObj
	var copy = function(destObj, srcObj) {
		var destObj = destObj || {};
		
		if (srcObj) {
			for (var attr in srcObj) {
				if (srcObj.hasOwnProperty(attr)) {
					//Nested object literals
					if (Object.prototype.toString.call(srcObj[attr]) === "[object Object]") {
						copy(destObj[attr], srcObj[attr]);
					} else {
						//Primitive value
						destObj[attr] = srcObj[attr];
					}	
				}	
			}
		}
		
		return destObj;
	};
	
	return JsErrorCapture;

})(window);

var jsec = new jsErrorCapture({
	sendOptions: {
		url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php',
		method: "get",
		format: "string"
	},
	logErrorsTimeout: 2000,
	logErrorsCount: 1
});	