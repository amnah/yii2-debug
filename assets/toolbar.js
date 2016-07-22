(function () {
    'use strict';

    // check if we have a toolbar
    var getDebugToolbar = function () {
        return document.querySelector('#yii-debug-toolbar');
    };
    if (!getDebugToolbar()) {
        return;
    }

    // define variables
    var barSelector = '.yii-debug-toolbar__bar',
        viewSelector = '.yii-debug-toolbar__view',
        blockSelector = '.yii-debug-toolbar__block',
        toggleSelector = '.yii-debug-toolbar__toggle',
        externalSelector = '.yii-debug-toolbar__external',

        cacheKey = 'yii-debug-toolbar',

        activeClass = 'yii-debug-toolbar_active',
        iframeActiveClass = 'yii-debug-toolbar_iframe_active',
        blockClass = 'yii-debug-toolbar__block',
        blockActiveClass = 'yii-debug-toolbar__block_active',

        // set up data to load toolbar
        baseDebugUrl = '<?= $baseDebugUrl ?>',
        currentTag = '<?= $tag ?>',
        firstLoad = true,
        currentXhr = null;

    // define functions
    var ajax = function (url, settings) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        settings = settings || {};
        xhr.open(settings.method || 'GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'text/html');
        xhr.onreadystatechange = function (state) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && settings.success) {
                    settings.success(xhr);
                } else if (xhr.status != 200 && settings.error) {
                    settings.error(xhr);
                }
            }
        };
        xhr.send(settings.data || '');
        return xhr;
    };
    var setupTagSelector = function() {
        var tagSelectorEl = document.querySelector('#yii-debug-toolbar__tag-selector');
        tagSelectorEl.onchange = function() {
            // check for value
            if (this.value == "0") {
                return;
            }

            // load new toolbar based on tag if iframe is NOT active
            if (!isIframeActive()) {
                return loadToolbar(this.value);
            }

            // load new iframe page

        };
    };
    var loadToolbar = function(tag) {
        // check for toolbar
        // call this every time (in case of new instance loaded from ajax)
        var debugToolbar = getDebugToolbar();
        if (!debugToolbar) {
            return;
        }

        // compute url
        var url = baseDebugUrl + '?currentTag=' + currentTag;
        if (tag) {
            url = url + '&tag=' + tag;
        }

        // cancel prev xhr request
        if (currentXhr) {
            currentXhr.abort();
        }

        // find the toolbar and make new ajax request
        currentXhr = ajax(url, {
            success: function (xhr) {

                // check if parentNode is set
                if (!debugToolbar.parentNode) {
                    return;
                }

                // add active class if first time or previously active
                var html = xhr.responseText;
                var storageState = restoreStorageState(cacheKey);
                if (storageState === null || storageState == 1) {
                    var pos = xhr.responseText.indexOf('class="');
                    var insertClass = 'class="' + activeClass + ' ';
                    html = html.substr(0, pos) + insertClass + html.substr(pos+7);
                }

                // create <div> for the first load. afterwards, we can set the innerHTML directly
                if (firstLoad) {
                    var div = document.createElement('div');
                    div.innerHTML = html;
                    debugToolbar.parentNode.replaceChild(div, debugToolbar);
                } else {
                    debugToolbar.parentNode.innerHTML = html;
                }

                showToolbar();
                setupTagSelector();

                // clean up
                currentXhr = null;
                firstLoad = null;
            },
            error: function (xhr) {
                if (xhr.responseText) {
                    debugToolbar.innerHTML = xhr.responseText;
                }
            }
        });
    };
    var toggleStorageState = function (key) {
        if (window.localStorage) {
            var item = localStorage.getItem(key);
            if (item == 1) {
                localStorage.setItem(key, 0);
            } else {
                localStorage.setItem(key, 1);
            }
        }
    };
    var restoreStorageState = function (key) {
        if (window.localStorage) {
            return localStorage.getItem(key);
        }
    };
    var iframeHeight = function () {
        return (window.innerHeight * 0.7) + 'px';
    };
    var isIframeActive = function () {
        return getDebugToolbar().classList.contains(iframeActiveClass);
    };
    var showIframe = function (href) {
        var debugToolbar = getDebugToolbar(),
            viewEl = debugToolbar.querySelector(viewSelector),
            externalEl = debugToolbar.querySelector(externalSelector),
            iframeEl = viewEl.querySelector('iframe');

        debugToolbar.classList.add(iframeActiveClass);
        iframeEl.src = externalEl.href = href;
        viewEl.style.height = iframeHeight();
    };
    var hideIframe = function () {
        var debugToolbar = getDebugToolbar(),
            viewEl = debugToolbar.querySelector(viewSelector),
            externalEl = debugToolbar.querySelector(externalSelector);

        debugToolbar.classList.remove(iframeActiveClass);
        removeActiveBlocksCls();

        externalEl.href = '#';
        viewEl.style.height = '';
    };
    var removeActiveBlocksCls = function () {
        var debugToolbar = getDebugToolbar(),
            barEl = debugToolbar.querySelector(barSelector),
            blockEls = barEl.querySelectorAll(blockSelector);

        [].forEach.call(blockEls, function (el) {
            el.classList.remove(blockActiveClass);
        });
    };
    var toggleToolbarClass = function (className) {
        var debugToolbar = getDebugToolbar();
        if (debugToolbar.classList.contains(className)) {
            debugToolbar.classList.remove(className);
        } else {
            debugToolbar.classList.add(className);
        }
    };
    var togglePosition = function () {
        if (isIframeActive()) {
            hideIframe();
        } else {
            toggleToolbarClass(activeClass);
            toggleStorageState(cacheKey);
        }
    };
    var findAncestor = function (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    };
    var showToolbar = function () {
        var debugToolbar = getDebugToolbar(),
            barEl = debugToolbar.querySelector(barSelector),
            viewEl = debugToolbar.querySelector(viewSelector),
            toggleEl = debugToolbar.querySelector(toggleSelector);

        debugToolbar.style.display = 'block';

        window.onresize = function () {
            if (debugToolbar.classList.contains(iframeActiveClass)) {
                viewEl.style.height = iframeHeight();
            }
        };

        barEl.onclick = function (e) {

            // check if the toolbar is collapsed. in that case, the only thing to click is
            // the yii logo, which will open up debug in a new tab
            var toolbarActive = getDebugToolbar().classList.contains(activeClass);
            if (!toolbarActive) {
                return;
            }

            var target = e.target,
                block = findAncestor(target, blockClass);

            // check if user is clicking on the currently active block -> toggle the toolbar up/down
            // or if user is clicking a different block  -> toggle the toolbar up and load iframe page
            var activeBlock = block && block.className.indexOf('yii-debug-toolbar__block_active') >= 0;
            var differentBlock = block && e.which !== 2 && !e.ctrlKey; // not mouse wheel and not ctrl+click
            if (activeBlock) {
                togglePosition();
                e.preventDefault();
            } else if (differentBlock) {
                while (target !== this) {
                    if (target.href) {
                        removeActiveBlocksCls();
                        block.classList.add(blockActiveClass);
                        showIframe(target.href);
                    }
                    target = target.parentNode;
                }
                e.preventDefault();
            }
        };

        toggleEl.onclick = togglePosition;
    };

    // add callback for ajax requests
    // @link http://stackoverflow.com/questions/18259301/how-to-run-a-function-when-any-xmlhttprequest-is-complete
    var oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function() {
            // process DONE only
            // refresh debugbar if 1) NOT debug ajax call and 2) NOT html template file
            var url = this.responseURL;
            var isAjaxDebug = url.indexOf(baseDebugUrl) >= 0;
            var isAjaxHtml = url.substr(url.lastIndexOf('.') + 1) === 'html';
            if (url && this.readyState === 4 && !isAjaxDebug && !isAjaxHtml) {
                loadToolbar();
            }
        });
        oldOpen.apply(this, arguments);
    };

    // load the toolbar for the first time
    loadToolbar();

})();
