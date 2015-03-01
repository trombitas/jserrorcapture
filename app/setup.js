'use strict';

angular.module('app', ['ui.bootstrap']).controller('App', function($scope) {

    $scope.config = {
        script: 'scripts/jserrorcapture.js',
        url: 'http://jserrorcapture.byethost18.com/api/jserrorlogger/request.php',
        method: 'post',
        format: 'json',
        ajax: {
            enabled: false,
            filters: []
        },
        fields: {},
        rate: {
            maxNotifs: 5,
            seconds: 3
        }
    };

    $scope.config.ajax.filters = [{
        url: '/backend/.*',
        status: '4..',
        method: '.*',
        action: 'ignore'
    }, {
        url: '/backend/.*',
        status: '.*',
        method: '.*',
        action: 'report'
    }, {
        url: '/static/.*',
        status: '404|409',
        method: '.*',
        action: 'ignore'
    }, {
        url: '.*',
        status: '2..|3..',
        method: 'post|get|put|delete',
        action: 'ignore'
    }, {
        url: '.*',
        status : '.*',
        method: '.*',
        action: 'report'
    }];

    $scope.methods = [{
        name: 'post'
    }, {
        name: 'get'
    }, {
        name: 'img'
    }, {
        name: 'script'
    }];


    $scope.formats = ['url', 'json', 'xml'];

    $scope.fields = {
        "url": {
            "label": "Page URL",
            "name": "url",
            "code": "w.location.href"
        },
        "timestamp": {
            "label": "Timestamp (seconds)",
            "name": "timestamp",
            "code": "1 * new Date()"
        },
        "browser": {
            "label": "Browser Name",
            "name": "browser",
            "code": "w.navigator.userAgent"
        },
        "platform": {
            "label": "Platform (OS)",
            "name": "platform",
            "code": "w.navigator.platform"
        },
        "lang": {
            "label": "Language",
            "name": "lang",
            "code": "w.navigator.language"
        },
        "width": {
            "label": "Resolution Width (pixels)",
            "name": "width",
            "code": "screen.width"
        },
        "height": {
            "label": "Resolution Height (pixels)",
            "name": "height",
            "code": "screen.height"
        },
        "orient": {
            "label": "Orientation",
            "name": "orientation",
            "code": "screen.orientation || screen.mozOrientation || screen.msOrientation"
        },
        "name": {
            "label": "Error Name",
            "name": "name",
            "code": "e.name"
        },
        "message": {
            "label": "Error Message",
            "name": "message",
            "code": "e.description||e.message||em"
        },
        "fileName": {
            "label": "File Name",
            "name": "fileName",
            "code": "e.fileName||fn"
        },
        "lineNumber": {
            "label": "Line Number",
            "name": "lineNumber",
            "code": "e.lineNumber||ln"
        },
        "columnNumber": {
            "label": "Column Number",
            "name": "columnNumber",
            "code": "e.columnNumber||cn"
        },
        "stackTrace": {
            "label": "Stack Trace",
            "name": "stackTrace",
            "code": "e.stack"
        },
        "statusCode": {
            "label": "HTTP Status Code",
            "name": "statusCode"
        },
        "statusText": {
            "label": "HTTP Status Text",
            "name": "statusText"
        },
        "requestType": {
            "label": "Request Type",
            "name": "requestType"
        },
        "requestUrl": {
            "label": "Request URL",
            "name": "requestUrl"
        },
        "requestBody": {
            "label": "Request Body (first n bytes)",
            "name": "requestBody"
        },
        "responseBody": {
            "label": "Response Body (first n bytes)",
            "name": "responseBody"
        }
    };

    $scope.fieldGroups = [{
        name: 'general',
        label: 'General and Browser Information',
        fields: ['url', 'timestamp', 'browser', 'platform', 'lang', 'width', 'height', 'orient']
    }, {
        name: 'js-error',
        label: 'JS Error',
        fields: ['name', 'message', 'fileName', 'lineNumber', 'columnNumber', 'stackTrace']
    }, {
        name: 'ajax-error',
        label: 'Ajax Error',
        fields: ['statusCode', 'statusText', 'requestType', 'requestUrl', 'requestBody', 'responseBody']
    }];

    angular.forEach($scope.fields, function(field, name) {
        $scope.config.fields[name] = true;
    });


    $scope.$watch('config.method', function(method) {
        $scope.config.format = method === 'post' ? 'json' : 'url';
    });

    $scope.$watch('config.ajax.enabled', function(enabled) {
    });

    $scope.$watch(function() {
        $scope.showCode = true;
        $scope.generatedConfig = angular.toJson($scope.config, true);
    });

    $scope.generate = function(live) {
        var c = angular.copy($scope.config);
        var config = {
            sendingOptions: {
                url: c.url,
                method: c.method,
                format: c.format
            },
            notificationRate: {
                maxNotifications: c.rate.maxNotifs,
                interval: c.rate.seconds
            },
            fields: c.fields
        }
        if(!c.ajax.enabled) {
            angular.forEach($scope.fieldGroups[2].fields, function(field) {
                delete config.fields[field];
            });
        }
        var configJson = angular.toJson(config);
        if(live) {
            $scope.generatedCode = '(function(d,a,c,e,f){var b=a.createElement(c);b.type="text/javascript";b.async=!0;b.src="http://jserrorcapture.byethost18.com/jserrorcapture.js";a=a.getElementsByTagName(c)[0];a.parentNode.insertBefore(b,a);d[e]=f})(window,document,"script","jsErrorCaptureObject",'+configJson+');';
        } else {
            //{url:"http://jserrorcapture.byethost18.com/api/jserrorlogger/errorPhp.php",method:"image",format:"string"}
            $scope.generatedCode = '<script>\njsErrorCaptureObject=' + configJson + '\n</script>\n\n';
            $scope.generatedCode += '<script type="text/javascript" src="' + c.script + '"></script>\n';
        }
    };

    $scope.xgenerate = function() {
        var config = $scope.config,
            format = config.format,
            method = config.method;

        var txt = "(function(w) {";

        if(format === 'xml') {
            // escape xml
            txt += "function e(v) { return (v||'').replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</, '&lt;').replace(/>/, '&gt;'); }";
            // token xml
            txt += "function t(k, v) { return '<' + k + '>' + ex(v) + '</' + k + '>'; };";
        }
        else if(format === 'json') {
            // escape json
            txt += "function e(v) { return (v||'').replace(/\\\\/g, '\\\\\\\\').replace(/\"/g, '\\\\\"').replace(/\\n/g, '\\\\n'); }";
            txt += "function t(k, v) {     return '\"'+k+'\":\"' + e(v) + '\"'; }";
        }
        else {
            // url
            txt += "var t = function(k, v) { return escapeURIComponent(k) + '=' + escapeURIComponent(v); };";
        }
        txt += "\n\n";

        if(method==='post') {
            // send post
            txt += "function s(text) { console.log('SEND POST:', text); }";
        }
        // send get
        // send img
        // send script

        txt += "\n\n";

        // event handler
        txt += "function hw(em, fn, ln, cn, e) { \
            console.log('hw', arguments); \
            e = e || {}; \
            s('{'+t('mesg', e.description||e.message||em)+','+t('file', fn)+','+t('stack', e.stack)+'}'); \
            s('<error>'+tx('mesg', e.description||e.message||em)+tx('file', fn)+'</error>'); \
        };";

        /*if (w.addEventListener) {
         w.addEventListener('error', he, false);
         console.log('JSEC: attached with addEventListener');
         } else if (w.attachEvent) {
         w.attachEvent('onerror', he);
         console.log('JSEC: attached with attachEvent');
         } else {
         w.onerror = hw;
         console.log('JSEC: attached with onerror');
         }
         */

        txt += "w.onerror = hw;";
        txt += "console.log('JSEC: attached with onerror');";
        txt += "}(window));";

        $scope.generatedCode = txt;
    };

    //var f = $scope.fields;
    //
    //var r = f.map(function(f) {
    //    return '"\t<' + f.name + '>"+escapeXml(' + f.code + ')+"</' + f.name + '>"';
    //}).join('+');
    //
    //console.log('send(' + r + ')');



    $scope.generateError = function() {
        throw 'xxx';
        a.y = 2;
        var b = a;
    };

    window.init = function(w) {


    }

    //window.init();
    ////

    $scope.ge = { millis: 500, prob: 1};
    var errInterval;

    $scope.startErrors = function() {
        if(errInterval) {
            clearInterval(errInterval);
        }
        errInterval = setTimeout(genError, $scope.ge.millis);
    };

    $scope.stopErrors = function() {
        clearInterval(errInterval);
        errInterval = 0;
    };

    var errorIndex = 0;
    function genError() {
        if (Math.random() < Number($scope.ge.prob)) {
            errorIndex++;
            var x = aaa;
            //throw "Eroarea " + errorIndex;
        }
    }
});