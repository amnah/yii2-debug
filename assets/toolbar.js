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
        },
        url,
        div,
        toolbarEl = findToolbar(),
        barSelector = '.yii-debug-toolbar__bar',
        viewSelector = '.yii-debug-toolbar__view',
        blockSelector = '.yii-debug-toolbar__block',
        toggleSelector = '.yii-debug-toolbar__toggle',
        externalSelector = '.yii-debug-toolbar__external',

        CACHE_KEY = 'yii-debug-toolbar',
        ACTIVE_STATE = 'active',

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

        baseUrl = '<?= $baseUrl ?>',
        currentTag = '<?= $tag ?>',
        firstLoad = true,
        loadToolbar = function(tag) {
            url = baseUrl + '?currentTag=' + currentTag;
            if (tag) {
                url = url + '&tag=' + tag;
            }

            var theToolbar = findToolbar();
            ajax(url, {
                success: function (xhr) {

                    // check if parentNode is set
                    if (!theToolbar.parentNode) {
                        return;
                    }

                    // create <div> for the first load. afterwards, we can simply set the innerhtml
                    if (firstLoad) {
                        div = document.createElement('div');
                        div.innerHTML = xhr.responseText;
                        theToolbar.parentNode.replaceChild(div, theToolbar);
                    } else {
                        theToolbar.parentNode.innerHTML = xhr.responseText;
                    }

                    var toolbar = findToolbar();
                    showToolbar(toolbar);
                    setupTagSelector(toolbar);

                    firstLoad = false;
                },
                error: function (xhr) {
                    theToolbar.innerHTML = xhr.responseText;
                }
            });
        };

    // add callback for ajax requests
    // @link http://stackoverflow.com/questions/18259301/how-to-run-a-function-when-any-xmlhttprequest-is-complete
    var oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function() {
            // process DONE only
            // check for non-debug url and refresh debugbar
            if (this.readyState === 4 && this.responseURL.indexOf(baseUrl) < 0) {
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
            toggleStorageState = function (key, value) {
                if (window.localStorage) {
                    var item = localStorage.getItem(key);

                    if (item) {
                        localStorage.removeItem(key);
                    } else {
                        localStorage.setItem(key, value);
                    }
                }
            },
            restoreStorageState = function (key) {
                if (window.localStorage) {
                    return localStorage.getItem(key);
                }
            },
            togglePosition = function () {
                if (isIframeActive()) {
                    hideIframe();
                } else {
                    toggleToolbarClass(activeClass);
                    toggleStorageState(CACHE_KEY, ACTIVE_STATE);
                }
            };

        toolbarEl.style.display = 'block';

        if (restoreStorageState(CACHE_KEY) == ACTIVE_STATE) {
            toolbarEl.classList.add(activeClass);
        }

        window.onresize = function () {
            if (toolbarEl.classList.contains(iframeActiveClass)) {
                viewEl.style.height = iframeHeight();
            }
        };

        barEl.onclick = function (e) {
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
