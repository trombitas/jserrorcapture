window.jsErrorCapture = (function(window) {
	
	//Constructor
	JsErrorCapture = function(options) {
		this.options = copy({
			captureErrors: true,      //Capture errors (if set to false the tool does not do anything)
			logErrorsViaAjax: true,   //Send the errors via ajax or ....
            crossDomain: true,        //Send the errors to different domain
            ajaxUrl: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/request.php',
			logErrorsTimeout: 3000,   //When an error is captured wait a bit to see whether others would join in the package (milliseconds)
			logErrorsCount: 3,        //Send a package if the number of errors captured within the Timeout reaches this number
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
	};
		
	//When an error occurs this function is called
	JsErrorCapture.prototype.handleError = function(errorObj) {
		//Increment the error counter 
		this.errorCount++;
		//Save the error
		this.errors.push(errorObj);
		
		//Start the timer
		if (!this.timeout) {
			this.timeout = window.setTimeout(bind(this, this.log), this.options.logErrorsTimeout);
		} else {
			//If a new error has been found clear the timeout and start a new one again
			window.clearTimeout(this.timeout);
			this.timeout = window.setTimeout(bind(this, this.log), this.options.logErrorsTimeout);
		}
	};
	
	//Send the error package
	JsErrorCapture.prototype.log = function() {
		//Check if the the maxLogsCount has been reached
		if (this.options.maxLogsCount === -1 || (this.logsCount < this.options.maxLogsCount && this.errors.length)) {
			//Send the errors
			if (this.options.logErrorsViaAjax) {
				this.sendErrorsViaAjax();
			}
			
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
	
	//Send the errors via AJAX
	JsErrorCapture.prototype.sendErrorsViaAjax = function() {
        if (this.options.crossDomain) {
            $jsonp.send(this.options.ajaxUrl + '?callback=test', {
                callbackName: 'test',
                onSuccess: function(json){
                    console.log('success!', json);
                },
                onTimeout: function(){
                    console.log('timeout!');
                },
                timeout: 5
            });
        }
	};
	
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
				errorMsg: errorMsg,
				url: url,
				lineNumber: lineNumber, 
				columnNumber: columnNumber,
				errorObject: errorObject
			};
			
			bind(self, callback).call(this, errorObj);
			if (typeof originalOnError === "function") { originalOnError.apply(this, arguments); }
		};
	};
	
	JsErrorCapture.prototype.collectBrowserData = function() {
		return {
			location: window.location,//protocol, hostname, etc. (http://www.w3schools.com/jsref/obj_location.asp)
			userAgent: window.navigator, //appName, appCodeName, appVersion etc. (http://www.w3schools.com/jsref/obj_navigator.asp)
			platform: window.navigator.platform, //win32 for Windows
			browserResolution: getBrowserData("resolution"),
			browserOrientation: getBrowserData("orientation")
		};
	};
	
	//Helper function for making AJAX calls
	var ajax = function() {
		//Returns cross-browser XMLHttpRequest, or null if unable
		function _Xhr(){ 
			try {
				return new XMLHttpRequest();
			}catch(e){}
			try {
				return new ActiveXObject("Msxml3.XMLHTTP");
			}catch(e){}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP.6.0");
			}catch(e){}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP.3.0");
			}catch(e){}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			}catch(e){}
			try {
				return new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){}
			return null;
		}
	};

    //JSONP
    var $jsonp = (function(){
        var that = {};

        that.send = function(src, options) {
            var callback_name = options.callbackName || 'callback',
                on_success = options.onSuccess || function(){},
                on_timeout = options.onTimeout || function(){},
                timeout = options.timeout || 10; // sec

            var timeout_trigger = window.setTimeout(function(){
                window[callback_name] = function(){};
                on_timeout();
            }, timeout * 1000);

            window[callback_name] = function(data){
                window.clearTimeout(timeout_trigger);
                on_success(data);
            };

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = src;

            document.getElementsByTagName('head')[0].appendChild(script);
        };

        return that;
    })();
	
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
				if (srcObj.hasOwnProperty(attr)) destObj[attr] = srcObj[attr];
			}
		}
		
		return destObj;
	};
	
	//Collects data about the browser
	var getBrowserData = function(data) {
		switch (data) {
			case "resolution":
				return {
					width: screen.width,
					availWidth: screen.availWidth,
					height: screen.height,
					availHeight: screen.availHeight
				};
				break;
			case "orientation":
				return 'orientation'    in screen ? screen.orientation :
                       'mozOrientation' in screen ? screen.mozOrientation :
                       'msOrientation'  in screen ? screen.msOrientation :
                       null;
				break;
		}
	};
	
	return JsErrorCapture;

})(window);


var jsec = new jsErrorCapture();