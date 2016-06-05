(function () {
    'use strict';

    var findToolbar = function () {
            return document.querySelector('#yii-debug-toolbar');
        },
        ajax = function (url, settings) {
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
        },
        toolbarEl = findToolbar(),
        barSelector = '.yii-debug-toolbar__bar',
        viewSelector = '.yii-debug-toolbar__view',
        blockSelector = '.yii-debug-toolbar__block',
        toggleSelector = '.yii-debug-toolbar__toggle',
        externalSelector = '.yii-debug-toolbar__external',

        CACHE_KEY = 'yii-debug-toolbar',

        activeClass = 'yii-debug-toolbar_active',
        iframeActiveClass = 'yii-debug-toolbar_iframe_active',
        titleClass = 'yii-debug-toolbar__title',
        blockClass = 'yii-debug-toolbar__block',
        blockActiveClass = 'yii-debug-toolbar__block_active',

        tagSelectorClass = '.tag-selector',
        setupTagSelector = function(toolbarEl) {
            var tagSelectorEl = document.querySelector(tagSelectorClass);
            tagSelectorEl.onchange = function() {
                if (this.value != "0") {
                    loadToolbar(this.value);
                }
            };
        },

        baseDebugUrl = '<?= $baseDebugUrl ?>',
        currentTag = '<?= $tag ?>',
        firstLoad = true,
        currentXhr = null,
        loadToolbar = function(tag) {

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
            var theToolbar = findToolbar();
            currentXhr = ajax(url, {
                success: function (xhr) {

                    // check if parentNode is set
                    if (!theToolbar.parentNode) {
                        return;
                    }

                    // add active class if first time or previously active
                    var html = xhr.responseText;
                    var storageState = restoreStorageState(CACHE_KEY);
                    if (storageState === null || storageState == 1) {
                        var pos = xhr.responseText.indexOf('class="');
                        var insertClass = 'class="' + activeClass + ' ';
                        html = html.substr(0, pos) + insertClass + html.substr(pos+7);
                    }

                    // create <div> for the first load. afterwards, we can set the innerHTML directly
                    if (firstLoad) {
                        var div = document.createElement('div');
                        div.innerHTML = html;
                        theToolbar.parentNode.replaceChild(div, theToolbar);
                    } else {
                        theToolbar.parentNode.innerHTML = html;
                    }

                    // get toolbar again here (needed for firstLoad because theToolbar won't be set)
                    var toolbar = findToolbar();
                    showToolbar(toolbar);
                    setupTagSelector(toolbar);

                    // clean up
                    currentXhr = null;
                    firstLoad = null;
                },
                error: function (xhr) {
                    theToolbar.innerHTML = xhr.responseText;
                }
            });
        },

        toggleStorageState = function (key) {
            if (window.localStorage) {
                var item = localStorage.getItem(key);

                if (item == 1) {
                    localStorage.setItem(key, 0);
                } else {
                    localStorage.setItem(key, 1);
                }
            }
        },
        restoreStorageState = function (key) {
            if (window.localStorage) {
                return localStorage.getItem(key);
            }
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

    if (toolbarEl) {
        loadToolbar();
    }

    function showToolbar(toolbarEl) {
        var barEl = toolbarEl.querySelector(barSelector),
            viewEl = toolbarEl.querySelector(viewSelector),
            toggleEl = toolbarEl.querySelector(toggleSelector),
            externalEl = toolbarEl.querySelector(externalSelector),
            blockEls = barEl.querySelectorAll(blockSelector),
            iframeEl = viewEl.querySelector('iframe'),
            iframeHeight = function () {
                return (window.innerHeight * 0.7) + 'px';
            },
            isIframeActive = function () {
                return toolbarEl.classList.contains(iframeActiveClass);
            },
            showIframe = function (href) {
                toolbarEl.classList.add(iframeActiveClass);

                iframeEl.src = externalEl.href = href;
                viewEl.style.height = iframeHeight();
            },
            hideIframe = function () {
                toolbarEl.classList.remove(iframeActiveClass);
                removeActiveBlocksCls();

                externalEl.href = '#';
                viewEl.style.height = '';
            },
            removeActiveBlocksCls = function () {
                [].forEach.call(blockEls, function (el) {
                    el.classList.remove(blockActiveClass);
                });
            },
            toggleToolbarClass = function (className) {
                if (toolbarEl.classList.contains(className)) {
                    toolbarEl.classList.remove(className);
                } else {
                    toolbarEl.classList.add(className);
                }
            },
            togglePosition = function () {
                if (isIframeActive()) {
                    hideIframe();
                } else {
                    toggleToolbarClass(activeClass);
                    toggleStorageState(CACHE_KEY);
                }
            };

        toolbarEl.style.display = 'block';

        window.onresize = function () {
            if (toolbarEl.classList.contains(iframeActiveClass)) {
                viewEl.style.height = iframeHeight();
            }
        };

        barEl.onclick = function (e) {

            // check if the toolbar is collapsed. in that case, the only thing to click is
            // the yii logo, which will open up debug in a new tab
            var toolbarActive = findToolbar().classList.contains(activeClass);
            if (!toolbarActive) {
                return;
            }

            var target = e.target,
                block = findAncestor(target, blockClass);

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
    }

    function findAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }
})();
