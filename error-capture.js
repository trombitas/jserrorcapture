window.jsErrorCapture = (function(window) {
	'use strict';
	
	//Constructor
	var JsErrorCapture = function(options) {
		this.options = copy({
			captureErrors: true,      //Capture errors (if set to false the tool does not do anything)
			captureErroneousAjaxCalls: {
				statuses: [500, 404]
			},
			sendErrorsViaAjax: {
				crossDomain: false     //Send the errors to different domain
			},
			logErrorsTimeout: 5000,   //When an error is captured wait a bit to see whether others would join in the package (milliseconds)
			logErrorsCount: 1,        //Send a package if the number of errors captured within the Timeout reaches this number
			maxLogsCount: -1          //The number of logs to send: -1 = infinite
		}, options);
		
		//The collection of error objects (returned by captureErrorHandler())
		this.errors = [];
		//The number of logs sent
		this.logsCount = 0;
		//Error counter - the captured errors in a package
		this.errorCount = 0;
		
		//setTimeout object
		this.timeout = null;
		
		//Add 'error' event to window
		if (this.options.captureErrors) {
			this.addErrorEvent(this.handleError);
		}
		
		//Log also errors after erroneous ajax calls
		if (this.options.captureErroneousAjaxCalls && this.options.captureErroneousAjaxCalls.statuses) {
			this.watchAjaxCalls();
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
						console.log(f2);
						f2.apply(self, arguments);
					}
				})(element[event], bind(self, callback));
			} else {
				callback = bind(self, callback);
			}
			element[event] = callback;
			return true;
		}
		
		//Add window.onerror()
		var originalOnError = window.onerror;
		window.onerror = function(errorMsg, url, lineNumber, columnNumber, errorObject) {
			var errorObj = {
				message: errorMsg,
				filename: url,
				lineno: lineNumber, 
				colno: columnNumber,
				timestamp: (new Date()).getTime(),
				target: url
				//errorObject: errorObject
			};
			
			bind(self, callback).call(this, errorObj);
			if (typeof originalOnError === "function") { originalOnError.apply(this, arguments); }
		};
	};
	
	//When an error occurs this function is called
	JsErrorCapture.prototype.handleError = function(errorObj) {
		//Increment the error counter 
		this.errorCount++;
		//Save the error
		this.errors.push({
			error: {
				message: errorObj.message,
				filename: errorObj.filename,
				lineNumber: errorObj.lineno,
				colNumber: errorObj.colno
			},
			data: collectBrowserData()
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
	
	//Send the error package
	JsErrorCapture.prototype.log = function() {
		//Check if the the maxLogsCount has been reached
		if (this.options.maxLogsCount === -1 || (this.logsCount < this.options.maxLogsCount && this.errors.length)) {
			//Send the errors
			this.sendErrors();
			
			//Reset counters
			this.errors = [];
			this.logsCount++;
			this.errorCount = 0;
			
			//Clear the timeout
			if (this.timeout) {
				window.clearTimeout(this.timeout);
			}
		} 		
	};
	
	//Send the errors
	JsErrorCapture.prototype.sendErrors = function() {
		if (this.options.sendErrorsViaAjax && this.options.sendErrorsViaAjax.url) {
			this.sendErrorsViaAjax();
		}
	};
	
	//Send errors via AJAX
	JsErrorCapture.prototype.sendErrorsViaAjax = function() {
		ajax({
            type: "POST",
            url: this.options.sendErrorsViaAjax.url,
            crossDomain: this.options.sendErrorsViaAjax.crossDomain,
            data: { errors: this.errors },
            success: function(response) {
				console.log("Ajax success!"/*, response*/);
			},
            error: function(error) {
				console.log("Ajax error!");
			}
        });
	};
	
	//Log also errors after erroneous ajax calls
	JsErrorCapture.prototype.watchAjaxCalls = function() {
		//Check jQuery
		if (typeof window.jQuery === "function") {
			this.watchJQueryAjaxErrors();
		}
	};
	
	//Watch jQuery ajax calls and log errors if any
	JsErrorCapture.prototype.watchJQueryAjaxErrors = function() {
		var self = this,
			origAjax = jQuery.ajax;
			
		jQuery.ajax = function(url, settings) {
			var promise = origAjax.apply(this, arguments);
			
			//Assign another fail() handler
			promise.fail(function(e) {
				var notAllowedStatuses = self.options.captureErroneousAjaxCalls.statuses;
				
				for (var i = 0; i < notAllowedStatuses.length; i++) {
					if (notAllowedStatuses[i] === e.status) {
						//When an error occurs call the handleError function 
						self.handleError({
							message: "AJAX " + this.type + " call to " + this.url + "failed, status: " + e.status + ", statusText = " + e.statusText,
							filename: location.href
						});
					}
				}
			});
			
			return promise;
		};
	};
	
	//Collect data from the current browser/platform
	var collectBrowserData = function() {
		return {
			time: (new Date()).getTime(),
			browser: window.navigator.userAgent,
			platform: window.navigator.platform,
			language: window.navigator.language,
			browserResolution: {
				width: screen.width,
				availWidth: screen.availWidth,
				height: screen.height,
				availHeight: screen.availHeight
			},
			browserOrientation: 'orientation' in screen ? screen.orientation :
                                'mozOrientation' in screen ? screen.mozOrientation :
                                'msOrientation'  in screen ? screen.msOrientation :
                                null
		};
	};
	
	//Helper function for making AJAX calls
	//@param options {Object} required options: { type [POST, GET], url, data [Object], success [function], error [function] }
	var ajax = function(options) {
		var data = serialize(options.data);
		
		//If crossDomain make a ajaxCORS call
        if (options.crossDomain) {
            ajaxCORS(options.url + '?callback=jsErrorCaptureAjaxSuccess&' + data, {
                callbackName: 'jsErrorCaptureAjaxSuccess',
                onSuccess: options.success,
                onTimeout: options.error,
                timeout: 5
            });
            return;
        }

        var xhr;
		
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
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		xhr.onload = function (e) { 
			_handleResponse('load')(_is_iexplorer() ? e : e.target); 
		};
	    xhr.onerror = function (e) { 
			_handleResponse('error')(_is_iexplorer() ? e : e.target);
		};
	    xhr.send(data);
		
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
    var ajaxCORS = function(src, options) {
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
		script.src = src;

		document.getElementsByTagName('head')[0].appendChild(script);
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
	
	//Serializes an array/object into a query string
	var serialize = function(obj, prefix) {
		var str = [];
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
		}
		return str.join("&");
	}
	
	return JsErrorCapture;

})(window);

//try {
	var jsec = new jsErrorCapture({
		sendErrorsViaAjax: {
			url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/request.php',
			crossDomain: false
		},
		logErrorsTimeout: 5000,
		logErrorsCount: 3
	});
//} catch(e) {
//	console && console.log && console.log("An error occurred when initializing JSErrorCapture: ", e.message);
//};	