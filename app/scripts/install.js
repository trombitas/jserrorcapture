(function(w, d, s, n, o) {
	var scr = d.createElement(s), cs;
	scr.type = 'text/javascript'; 
	scr.src = 'http://jserrorcapture.byethost18.com/jserrorcapture.js';
	cs = d.getElementsByTagName(s)[0];
	cs.parentNode.insertBefore(scr, cs);
	w[n] = o;
}(window, document, 'script', 'jsErrorCaptureObject', {
	sendOptions: {
		url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php',
		method: "post",
		format: "json"
	}
}));

<script type="text/javascript">
	window.jsErrorCaptureObject = {sendOptions:{url:'http://qu-b/api/jserrorlogger',method:"post",format:"json"}};
</script>
<script type="text/javascript" src="http://jserrorcapture.byethost18.com/jserrorcapture.js"></script>