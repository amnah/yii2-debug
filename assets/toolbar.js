
var yiiDebugToolbar = new function() {

    this.baseUrl = function() {
        return '<?= $baseUrl ?>';
    };

    this.currentTag = function() {
        return '<?= $tag ?>';
    };

    this.ajax = function(url, settings) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        settings = settings || {};
        xhr.open(settings.method || 'GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'text/html');
        xhr.onreadystatechange = function (state) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 && settings.success) {
                    settings.success(xhr);
                } else if (xhr.status != 200 && settings.error) {
                    settings.error(xhr);
                }
            }
        };
        xhr.send(settings.data || '');
    };

    // get tag data
    // @link http://stackoverflow.com/a/12080149
    this.getTagData = function(selectDropdown) {

        // check for yii-debug-toolbar and valid tag
        var e = document.getElementById('yii-debug-toolbar');
        if (!e) {
            return;
        }
        var tag = selectDropdown ? selectDropdown.value : e.getAttribute('data-tag');
        if (tag == '0') {
            return;
        }

        // compute currentTag and url to make ajax call to
        tag = tag || '';
        var currentTag = this.currentTag();
        var url = this.baseUrl() + '?tag=' + tag + '&currentTag=' + currentTag;

        // show block and make ajax call
        e.style.display = 'block';
        this.ajax(url, {
            success: function (xhr) {
                var div = document.createElement('div');
                div.innerHTML = xhr.responseText;
                e.parentNode.replaceChild(div, e);
                if (window.localStorage) {
                    var pref = localStorage.getItem('yii-debug-toolbar');
                    if (pref == 'minimized') {
                        document.getElementById('yii-debug-toolbar').style.display = 'none';
                        document.getElementById('yii-debug-toolbar-min').style.display = 'block';
                    }
                }

            },
            error: function (xhr) {
                e.innerHTML = xhr.responseText;
            }
        });
    };

    // add callback for ajax requests
    // @link http://stackoverflow.com/questions/18259301/how-to-run-a-function-when-any-xmlhttprequest-is-complete
    this.setupAjaxCallback = function() {

        // add a listener for its readystatechange events when an XHR object is opened
        var thisDebug = this;
        var baseUrl = this.baseUrl();
        var oldOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener("readystatechange", function() {
                // process DONE only
                // check for non-debug url and refresh debugbar
                if (this.readyState === 4 && this.responseURL.indexOf(baseUrl) < 0) {
                    thisDebug.getTagData();
                }
            });
            oldOpen.apply(this, arguments);
        }
    };
};

(function () {
    yiiDebugToolbar.setupAjaxCallback();
    yiiDebugToolbar.getTagData();
})();