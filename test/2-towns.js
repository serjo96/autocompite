import assert from 'assert';
let template = require('../towns-content.hbs');

describe('ДЗ 6.2 - Фильтр городов', () => {
    let homeworkContainer = document.createElement('div');
    let loadingBlock;
    let filterBlock;
    let filterInput;
    let filterResult;
    let filterPage;

    homeworkContainer.id = 'homework-container';
    homeworkContainer.innerHTML = template();
    document.body.appendChild(homeworkContainer);
    filterPage = require('../src/towns');

    describe('Функциональное тестирование', () => {
        describe('isMatching', () => {
            it('должна определять присутствие подстроки в строке', () => {
                assert.strictEqual(filterPage.isMatching('Сочи', 'сочи'), true);
                assert.strictEqual(filterPage.isMatching('Сочи', 'соч'), true);
                assert.strictEqual(filterPage.isMatching('Сочи', 'Соч'), true);
                assert.strictEqual(filterPage.isMatching('Сочи', 'соч'), true);
                assert.strictEqual(filterPage.isMatching('Сочи', 'Анапа'), false);
            });
        });
        describe('loadTowns', () => {
            it('должна возвращать Promise', () => {
                let result = filterPage.loadAndSortTowns();

                // в FF + babel есть проблема при проверке instanceof Promise
                // поэтому приходится проверять так
                assert.equal(result.constructor.name, 'Promise');
                assert.equal(typeof result.then, 'function');
                assert.equal(typeof result.catch, 'function');
            });

            it('Promise должен разрешаться массивом из городов', done => {
                /* eslint-disable max-nested-callbacks */
                let result = filterPage.loadAndSortTowns();

                result.then(towns => {
                    assert(Array.isArray(towns), 'должен быть массивом');
                    assert(towns.length == 50, 'неверный размер массива');
                    towns.forEach((town, i, towns) => {
                        assert(town.hasOwnProperty('City'), 'город должен иметь свойтво City');

                        if (i) {
                            assert(towns[i - 1].City < town.City, 'города должны быть отсортированы');
                        }
                    });
                    done();
                }).catch(done);
                /* eslint-enable */
            });
        });
    });

    describe('Интеграционное тестирование', () => {
        it('на старнице должны быть элементы с нужными id', () => {
            loadingBlock = homeworkContainer.querySelector('#loading-block');
            filterBlock = homeworkContainer.querySelector('#filter-block');
            filterInput = homeworkContainer.querySelector('#filter-input');
            filterResult = homeworkContainer.querySelector('#filter-result');

            assert(loadingBlock !== null, 'элемент не найден');
            assert(loadingBlock instanceof Element, 'id элемента должен быть loading-block');
            assert(filterBlock !== null, 'элемент не найден');
            assert(filterBlock instanceof Element, 'id элемента должен быть filter-block');
            assert(filterInput !== null, 'элемент не найден');
            assert(filterInput instanceof Element, 'id элемента должен быть filter-input');
            assert(filterResult !== null, 'элемент не найден');
            assert(filterResult instanceof Element, 'id элемента должен быть filter-result');
        });

        it('должен показываться список городов, соответствующих фильтру', done => {
            filterInput.value = 'fr';
            filterInput.dispatchEvent(new KeyboardEvent('keyup'));
            setTimeout(() => {
                assert.equal(filterResult.children.length, 3);
                done();
            }, 1000);
        });

        it('результат должен быть пуст, если в поле пусто', done => {
            filterInput.value = '';
            filterInput.dispatchEvent(new KeyboardEvent('keyup'));
            setTimeout(() => {
                assert.equal(filterResult.children.length, 0);
                done();
            }, 1000);
        });
    });
});
