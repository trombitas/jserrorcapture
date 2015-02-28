(function(w, d, s, n, o) {
	var scr = d.createElement(s), cs;
	scr.type = 'text/javascript'; 
	scr.async = true;
	scr.src = 'http://jserrorcapture.byethost18.com/jserrorcapture.js';
	cs = d.getElementsByTagName(s)[0];
	cs.parentNode.insertBefore(scr, cs);
	w[n] = o;
}(window, document, 'script', 'jsErrorCaptureObject', {
	sendOptions: {
		url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php',
		method: "img",
		format: "url"
	}
}));

(function(d,a,c,e,f){var b=a.createElement(c);b.type="text/javascript";b.async=!0;b.src="http://jserrorcapture.byethost18.com/jserrorcapture.js";a=a.getElementsByTagName(c)[0];a.parentNode.insertBefore(b,a);d[e]=f})(window,document,"script","jsErrorCaptureObject",{sendOptions:{url:"http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php",method:"img",format:"url"}});