if (!Element.prototype.remove) {
    Element.prototype.remove = function remove() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

let homeworkContainer = document.querySelector('#homework-container'),
    filterBlock = document.getElementById('filter-block'),
    filterInput = homeworkContainer.querySelector('#filter-input'),
    filterResult = homeworkContainer.querySelector('#filter-result'),
    filterList = homeworkContainer.querySelector('.filter-list'),
    info = homeworkContainer.querySelector('.info-block'),
    reoladBtn = document.createElement('div'),
    filtrFocusOut;

function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != 'undefined') {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    
    return xhr;
}

function loadAndSortTowns() {
    return new Promise(function(resolve) {
        let url = '../data/kladr.json',
            preloader = document.createElement('div'),
            xhr = createCORSRequest('GET', url);

        preloader.className = 'input__preloader';

        if (!xhr) {
            alert('CORS not supported');
            
            return;
        }
        xhr.responseType = 'json';
        filtrFocusOut = true;
        filterBlock.appendChild(preloader);

        xhr.onload = function() {
            let resp = xhr.response;

            preloader.remove();
            filtrFocusOut = false;

            if (xhr.status === 200 && xhr.readyState === 4) {
                resp.sort(function(a, b) {
                    if (a.name > b.name) {
                        return 1
                    }

                    return -1
                });
                resolve(resp);
            } else {
                reoladBtn.innerHTML = 'Обновить';
                reoladBtn.className += 'reolad-btn';
                filterList.appendChild(reoladBtn);
                filterResult.innerHTML = 'Что то пошло не так. Проверьте соеденинеие с интернетом и попробуйте еще раз'

            }
        };

        xhr.send();

    })
}

function checkFilterStatus (array, count) {
    if (array.length === 0) {
        info.innerHTML = 'Не чего не найдено';
        filtrFocusOut = true;
    } else {
        filtrFocusOut = false;
        filterInput.parentNode.classList.remove('filter-erore');
        if (count > 1) {
            info.innerHTML = 'Показано ' + count + ' из ' + array.length + ' найденых городов. Уточните запрос, чтобы увидеть остальные'
			info.className = 'info-block'
        } else {
            info.innerHTML = ''
			info.className = 'info-block hide-info'
        }
    }
}

function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();
    if (full.substr(0, chunk.length) === chunk) {
        return true;
    } 
    
    return false;
    
}

filterInput.oninput = function(e) {
    e.target.parentNode.classList.remove('filter-erore');

    loadAndSortTowns().then(function (data) {
        let value = e.target.value.trim(),
            htmlText = '',
            checkArray = [],
            count = 0;

        if (value.length > 0) {
            filterList.classList.add('is--show');
            for (let i= 0; i<data.length; i++) {
                if (isMatching(data[i].City, value)) {
                    checkArray.push(data[i].City);
                    if (checkArray.length <= 5) {
                        count++;
                        htmlText += '<div id=' + data[i].Id + ' ' + 'class="result__item">' + data[i].City + '</div>';
                    }
                } else {
                    checkFilterStatus(checkArray, count, htmlText)
                }
            }

        } else {
            filterList.classList.remove('is--show');
            info.innerHTML = '';
        }

        filterResult.innerHTML = htmlText;

    });
};

filterList.onclick = function (e) {
    if ( e.target.className.indexOf('result__item') === 0) {
        filterList.classList.remove('is--show');
        filterInput.value = e.target.innerHTML;
    }
};

filterInput.onchange = function (e) {

    if (filtrFocusOut) {
        e.target.parentNode.classList.add('filter-erore');
        info.innerHTML = 'Выберите значение из списка';
    }
};

filterInput.onfocus = function(e) {
    e.target.setSelectionRange(0, this.value.length);
};

reoladBtn.onclick = function () {
    loadAndSortTowns();
};

