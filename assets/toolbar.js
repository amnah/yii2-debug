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
        currentBlockActiveClass = null,

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
            loadToolbar(this.value);
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

        // store old href (for when iframe is open)
        var externalEl = debugToolbar.querySelector(externalSelector);
        var oldHref = externalEl ? externalEl.href : '';

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

                // load everything in for the firstLoad, including the iframe stuff
                // in subsequent loads, we can simply replace the contents in $(barSelector)
                var div = document.createElement('div');
                div.innerHTML = html;
                if (firstLoad) {
                    // use parent to replace everything
                    debugToolbar.parentNode.replaceChild(div, debugToolbar);
                } else {
                    var oldBarContent = debugToolbar.querySelector(barSelector);
                    var newBarContent = div.querySelector(barSelector);
                    debugToolbar.replaceChild(newBarContent, oldBarContent);
                }

                // set up the newly loaded toolbar and set external href
                showToolbar();
                setupTagSelector();

                // check if iframe is open
                if (isIframeActive()) {

                    // use tag or calculate tag from data
                    // (this is needed for ajax updates, which don't specify a tag)
                    if (!tag) {
                        tag = debugToolbar.innerHTML.match(/\?tag=([A-Za-z0-9]*)"/);
                        tag = tag ? tag[1] : null;
                    }

                    // use tag to show the proper iframe page
                    if (tag) {
                        var newHref = oldHref.replace(/&tag=(.*)/, '&tag=' + tag);
                        showIframe(newHref);
                    }

                    // set active block
                    // note: this has a chance of not setting an active block. this would occur
                    // when the newly loaded toolbar doesn't have the specific block
                    //   eg, one request has a "mail" block while another request doesn't
                    //   so this would not set the active block
                    //   BUT it would still load the iframe page
                    var blockEls = getDebugBlocks();
                    for (var i = 0, len = blockEls.length; i < len; i++) {
                        if (blockEls[i].classList.contains(currentBlockActiveClass)) {
                            blockEls[i].classList.add(blockActiveClass);
                        }
                    }
                }

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
    var getDebugBlocks = function() {
        return getDebugToolbar().querySelector(barSelector).querySelectorAll(blockSelector);
    };
    var removeActiveBlocksCls = function () {
        var blockEls = getDebugBlocks();
        for (var i = 0, len = blockEls.length; i < len; i++) {
            blockEls[i].classList.remove(blockActiveClass);
        }
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
            // otherwise if user is clicking a different block  -> toggle the toolbar up and load iframe page
            var activeBlock = block && block.className.indexOf(blockActiveClass) >= 0;
            var differentBlock = block && e.which !== 2 && !e.ctrlKey; // not mouse wheel and not ctrl+click
            if (activeBlock) {
                togglePosition();
                e.preventDefault();
            } else if (differentBlock) {
                while (target !== this) {
                    if (target.href) {
                        removeActiveBlocksCls();
                        block.classList.add(blockActiveClass);
                        currentBlockActiveClass = block.classList[1];
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
