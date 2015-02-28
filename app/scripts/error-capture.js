window.jsErrorCapture = (function(window) {
	'use strict';
	
	//Constructor
	var JsErrorCapture = function(options) {
		this.options = copy({
			sendOptions: {
				url: '',
				method: "img",	    //img, script, post, get
				format: "url"		//url, json, xml
			},
			notificationRate: {
				maxNotifications: 3,    //max 3 errors per interval
				interval: 8				//seconds
			}
		}, options);
		
		//Rate limiting algorithm (send maximum number of 'maxNotifications' errors in a time limit of 'seconds')
		this.rate = this.options.notificationRate.maxNotifications;
		this.seconds = this.options.notificationRate.interval;
		this.stack = [];
		
		//The error object
		this.error = {};
		
		//Add 'error' event to window
		this.addErrorEvent(this.registerError);
		console.log(this.options);
		//Capture HTTP erroneous calls
		if (this.options.ajax) {
			//this.captureHTTPErrors();
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
	JsErrorCapture.prototype.registerError = function() {
		//Modern browsers
		if (typeof arguments[0] === "object") {
			var errorObj = arguments[0];
			if (Object.prototype.hasOwnProperty.call(errorObj, "status")) {
				this.error = {
					status: errorObj.status,
					url: errorObj.url,
					method: errorObj.method
				};
			} else {
				this.error = {
					message: errorObj.message,
					filename: errorObj.filename,
					lineNumber: errorObj.lineno,
					colNumber: errorObj.colno,
					stack: errorObj.error ? errorObj.error.stack : ""
				};
			}	
		} else {
			//Older IE
			this.error = {
				message: arguments[0],
				filename: arguments[1],
				lineNumber: arguments[2],
				colNumber: arguments[3]
			};
		}
		
		//Add additional browser information to the error object
		this.error = copy(this.error, {
				time: 1 * new Date(),
				browser: navigator.userAgent,
				platform: navigator.platform,
				lang: navigator.language || navigator.userLanguage,
				cookieEnabled: navigator.cookieEnabled,
				resolutionWidth: screen.width,
				resolutionHeight: screen.height
			});
		
		//Check the current time when an error appears
		var currentTime = 1 * new Date(),
			stackClone = this.stack.slice(0);
			
		//Remove old stack items (older than this.seconds)
		for (var i = this.stack.length - 1; i >= 0; i--) {
			if ((currentTime - this.stack[i]) / 1000 > this.seconds) {stackClone.splice(i, 1);}
		}
		this.stack = stackClone.slice(0);
		
		if (this.stack.length < this.rate) {
			this.stack.push(currentTime);
			//Send error
			this.dispatch();
		}
	};
	
	//Dispatch the errors
	JsErrorCapture.prototype.dispatch = function() {
		if (this.options.sendOptions && this.options.sendOptions.url) {
			var data = this.formatError[this.options.sendOptions.format](this.error);
		
			this.options.sendOptions.method = this.options.sendOptions.method.toLowerCase();
			this.options.sendOptions.format = this.options.sendOptions.format.toLowerCase();
		
			//Create an AJAX request
			if (this.options.sendOptions.method === "post" || this.options.sendOptions.method === "get") { 
				this.requestXHR({
					type: this.options.sendOptions.method,
					url: this.options.sendOptions.url,
					data: data
				});
			}
			
			//Compose the URL: url?data=XML|JSON / url?STRING
			var url = this.options.sendOptions.url + (this.options.sendOptions.url.indexOf("?") > -1 ? "&" : "?") + (this.options.sendOptions.format === "url" ? "" : "data=") + data;
			
			//Make an Image request (<img>)
			if (this.options.sendOptions.method === "img") { 
				this.requestImage(url);
			}
			
			//Make a JSONP request
			if (this.options.sendOptions.method === "script") {
				this.requestScript(url, { timeout: 5 });
			}
		}
	};
	
	//XML
	JsErrorCapture.prototype.formatError = {};
	JsErrorCapture.prototype.formatError['xml'] = function(error) {
		var xml = "<?xml version='1.0' encoding='UTF-8' ?>";
		
		xml += "<error>";
		for (var key in error) {
			if (error.hasOwnProperty(key)) {
				xml += "<" + key + ">" + escapeXml(error[key]) + "</" + key + ">";
			}
		}
		xml += "</error>";
		
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
	JsErrorCapture.prototype.formatError['json'] = function(error) {
		var elem = [];
		
		for (var key in error) {
			if (error.hasOwnProperty(key)) {
				elem.push('"' + key + '":"' + escapeJson(error[key]) + '"');
			}
		}
		
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
		
		return '{' + elem.join(",") + '}';
	};
	
	//Query param
	JsErrorCapture.prototype.formatError['url'] = function(error) {
		function serialize(obj) {
			var str = [];
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					str.push(typeof obj[p] == "object" ? serialize(obj[p]) : encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
			}
			return str.join("&");
		}
		
		return serialize(error);
	};
	
	//Helper function for making AJAX calls
	//@param options {Object} required options: { type [POST, GET], url, data [Object], success [function], error [function] }
	JsErrorCapture.prototype.requestXHR = function(options) {
		var data = options.data,
			xhr;
			
		if (options.type === "get") {
			if (this.options.sendOptions.format === "json" || this.options.sendOptions.format === "xml") {
				options.url += (options.url.indexOf("?") > -1 ? "&" : "?") + "data=" + data; 	
			} else {
				options.url += (options.url.indexOf("?") > -1 ? "&" : "?") + data;
			}			
		}	
			
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
		
		if (!xhr) { console && console.log && console.log("Error, no support for AJAX!"); return; }
		try { xhr.withCredentials = false; } catch(e) {};
		
		if (xhr.setRequestHeader) {
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			if (this.options.sendOptions.format === "json") {
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			}
			if (this.options.sendOptions.format === "url") {			
				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}	
		}	
		
	    xhr.send(data || null);
		
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
	};
	
	//JSONP - Cross Origin Calls
    JsErrorCapture.prototype.requestScript = function(url, options) {
		var script,
			scripts = document.getElementsByTagName("script");
			
		for (var i = scripts.length - 1; i >= 0; i--) {
			if (scripts[i].src.indexOf(this.options.sendOptions.url) > -1) { 
				document.getElementsByTagName('head')[0].removeChild(scripts[i]);
			}
		}
		
		script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = url + "&r0=" + Math.floor((Math.random() * 1000) + 1) + "&r1=" + (1 * new Date());
		document.getElementsByTagName('head')[0].appendChild(script);	
	};
	
	//Image request
	JsErrorCapture.prototype.requestImage = function(url, data) {
		var img = document.getElementById("JsErrorCapture_img");
		if (!img) {
			img = document.createElement("img");
			img.id = "JsErrorCapture_img";
			img.style.position = "absolute";
			img.style.display = "none";
			img.style.width = 1;
			img.style.height = 1;
			document.getElementsByTagName("body")[0].appendChild(img);
		} 
		
		img.src = url + (url.indexOf("?") > -1 ? "&" : "?") + 
				  "data=" + data + 
				  "&r0=" + Math.floor((Math.random() * 1000) + 1) + 
				  "&r1=" + (1 * new Date());
	};
	
	//Capture HTTP errors
	JsErrorCapture.prototype.captureHTTPErrors = function() {
		if (XMLHttpRequest) {
			this.captureHTTPErrorsXmlHTTPRequest();
		}
	};
	
	JsErrorCapture.prototype.captureHTTPErrorsXmlHTTPRequest = function() {
		var self = this,
			RealXHRSend = XMLHttpRequest.prototype.send,
			RealXHROpen = XMLHttpRequest.prototype.open,
			method, 
			url,
			rules = self.options.ajax.rules;
		
		//Overwrite the Open method of XMLHttpRequest
		XMLHttpRequest.prototype.open = function(m, u) {
			url = u;
			method = m;
			RealXHROpen.apply(this, arguments);
		};
		
		//Overwrite the Send method of XMLHttpRequest
		XMLHttpRequest.prototype.send = function() {
			if (this.addEventListener) {
				this.addEventListener("readystatechange", function() {
					if (this.readyState === 4) {
						_handleStatus(method, url, this.status);
					}
				}, false);
			} else {
				var realOnReadyStateChange = this.onreadystatechange;
				if (realOnReadyStateChange) {
					this.onreadystatechange = function() {
					if (this.readyState === 4) {
						_handleStatus(method, url, this.status);
					}
					realOnReadyStateChange();
					};
				}
			}

			RealXHRSend.apply(this, arguments);
		}	
		
		//Handle the HTTP call response status
		var _handleStatus = function(method, url, status) {
			var isUrl, isStatus, isMethod, action;
			
			console.log(methdo, status, url);
			
			for (var i = rules.length - 1; i >= 0; i--) {
				isUrl = new RegExp(rules[i].url, "i");
				isStatus = new RegExp(rules[i].status, "i");
				isMethod = new RegExp(rules[i].method, "i");
				console.log(rules[i], isUrl.test(), isStatus.test(), isMethod.test());
				
				if (isUrl.test() && isStatus.test() && isMethod.test()) {
					_doAction(action, method, url, status);
					return;
				}
			}
		};
		
		//If action is to Report error send it
		var _doAction = function(action, method, url, status) {
			if (action.toLowerCase() === "report") {
				self.registerError({
					status: status,
					method: method,
					url: url
				});
			}
		};
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

new jsErrorCapture({
		sendOptions: {
			url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php',
			method: "img",
			format: "url"
		},
		ajax: {
			rules: [
				{
					url: "jserrorlogger/error",
					status: "500",
					method: ".",
					action: "ignore"
				},
				{
					url: "jserrorlogger/request",
					status: ".",
					method: ".",
					action: "report"
				}
			]
		}
	});	