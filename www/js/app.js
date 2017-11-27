if (localStorage.db) {
    db = JSON.parse(localStorage.db);
}
if (localStorage.viewed){
    var tmp = [];
    for (var i = 0; i < db.indexOf(localStorage.viewed); i++){
        tmp.push(db[i]);
    };
    db = db.slice(db.indexOf(localStorage.viewed)+1);
    for (var i = 0; i < tmp.length; i++){
        db.push(tmp[i]);
    }
}
var support = { animations : Modernizr.cssanimations },
    animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
    animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
    onEndAnimation = function( el, callback ) {
        var onEndCallbackFn = function( ev ) {
            if( support.animations ) {
                if( ev.target != this ) return;
                this.removeEventListener( animEndEventName, onEndCallbackFn );
            }
            if( callback && typeof callback === 'function' ) { callback.call(); }
        };
        if( support.animations ) {
            el.addEventListener( animEndEventName, onEndCallbackFn );
        }
        else {
            onEndCallbackFn();
        }
    };

function extend( a, b ) {
    for( var key in b ) { 
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
}

function getColor(str, alpha) {
    let colors =   [
        'rgba(82, 84, 163)',
        'rgba(107, 110, 207)',
        'rgba(156, 158, 222)',
        'rgba(99, 121, 57)',
        'rgba(140, 162, 82)',
        'rgba(181, 207, 107)',
        'rgba(206, 219, 156)',
        'rgba(140, 109, 49)',
        'rgba(189, 158, 57)',
        'rgba(231, 186, 82)',
        'rgba(231, 203, 148)',
        'rgba(132, 60, 57)',
        'rgba(173, 73, 74)',
        'rgba(214, 97, 107)',
        'rgba(231, 150, 156)',
        'rgba(123, 65, 115)',
        'rgba(165, 81, 148)',
        'rgba(206, 109, 189)',
        'rgba(222, 158, 214)',
    ]
    let limit = 3;
    let firstCharcode = 1072;
    str = str.toLowerCase();
    str = str.slice(0, limit);
    let mean = 0;
    for (let i = 0; i < str.length; i++) {
        mean += str.charCodeAt(i) - firstCharcode;
    }
    mean = Math.round(mean / str.length);
    if (mean >= colors.length) mean = mean - colors.length;
    let color;
    if (colors.hasOwnProperty(mean)) {
        color = colors[mean];
        if (alpha != undefined) color = `${color.slice(0, color.length - 1)}, ${alpha})`;
    } else {
        color = 'rgba(0, 0, 0, 0)';
    }
    return color;
}

function firstToUpperCase(str) {
    return str[0].toUpperCase() + str.slice(1);
}

let c = 0;
class Stack {
    constructor (el, options, data) {
        // this.data = data;
        this.dataKeysArray = data;
        // console.log(this.dataKeysArray);
        // console.log(this.data);

        this._defaultOpts();
        this.el = el;
        this.current = 0;
        
        this.options = extend( {}, this.options );
        // this.counter = this.options.visible;
        extend( this.options, options );
        this._createStack();
    }

    _defaultOpts() {
        this.options = {
            // stack's perspective value
            perspective: 1000,
            // stack's perspective origin
            perspectiveOrigin : '50% -50%',
            // number of visible items in the stack
            visible : 3,
            // infinite navigation
            infinite : true,
            // callback: when reaching the end of the stack
            onEndStack : function() {return false;},
            // animation settings for the items' movements in the stack when the items rearrange
            // object that is passed to the dynamicsjs animate function (see more at http://dynamicsjs.com/)
            // example:
            // {type: dynamics.spring,duration: 1641,frequency: 557,friction: 459,anticipationSize: 206,anticipationStrength: 392}
            stackItemsAnimation : {
                duration : 500,
                type : dynamics.bezier,
                points : [{'x':0,'y':0,'cp':[{'x':0.25,'y':0.1}]},{'x':1,'y':1,'cp':[{'x':0.25,'y':1}]}]
            },
            // delay for the items' rearrangement / delay before stackItemsAnimation is applied
            stackItemsAnimationDelay : 0,
            // animation settings for the items' movements in the stack before the rearrangement
            // we can set up different settings depending on whether we are approving or rejecting an item
            /*
            stackItemsPreAnimation : {
                reject : {
                    // if true, then the settings.properties parameter will be distributed through the items in a non equal fashion
                    // for instance, if we set settings.properties = {translateX:100} and we have options.visible = 4, 
                    // then the second item in the stack will translate 100px, the second one 75px and the third 50px
                    elastic : true,
                    // object that is passed into the dynamicsjs animate function - second parameter -  (see more at http://dynamicsjs.com/)
                    animationProperties : {},
                    // object that is passed into the dynamicsjs animate function - third parameter - (see more at http://dynamicsjs.com/)
                    animationSettings : {} 
                },
                accept : {
                    // if true, then the settings.properties parameter will be distributed through the items in a non equal fashion
                    // for instance, if we set settings.properties = {translateX:100} and we have options.visible = 4, 
                    // then the second item on the stack will translate 100px, the second one 75px and the third 50px
                    elastic : true,
                    // object that is passed into the dynamicsjs animate function - second parameter -  (see more at http://dynamicsjs.com/)
                    animationProperties : {},
                    // object that is passed into the dynamicsjs animate function (see more at http://dynamicsjs.com/)
                    animationSettings : {}
                }
            }
            */
        }
    }

    _createStack() {
        this.dbIndex = this.options.visible;
        let self = this;
        let counter = this.dbIndex;
        for (let i = this.current; i < this.dbIndex; i++) {
            let term = this.dataKeysArray[i];
            let dictionary = new Query();
            dictionary.get(term, (result) => {
                self._createCard(term, result);
                dictionary = null;
                counter--;
                if (!counter) next();
            });
            
        }

        function next() {
            self.items = [].slice.call(self.el.children);
            self.itemsTotal = self.items.length;
            // if( this.options.infinite && this.options.visible >= this.itemsTotal || !this.options.infinite && this.options.visible > this.itemsTotal || this.options.visible <=0 ) {
            //     this.options.visible = 1;
            // }
            self._init();
        }
    }

    _createCard(term, res) {
        // console.log(term, res);
        
        let li = document.createElement('li');
        li.setAttribute('class', 'stack__item-background');
        let liContent = document.createElement('div');
        // liContent.setAttribute('class', 'stack__item-content');
        li.appendChild(liContent);
        let results = document.createElement('div');
        // let hr = document.createElement('hr');
        let divider = document.createElement('div')
        divider.setAttribute('class', 'divider');

        // <div class="card-title"><span class='highlight-container'><span class='highlight'>Надо в отпуск</span></span> </div>
        // _before _after - pseudo elements
        let word = document.createElement('div');
        word.setAttribute('class', 'card-title');
        let titleHighlightContainer = document.createElement('span');
        titleHighlightContainer.setAttribute('class', 'highlight-container');
        let titleHighlightContainer_before = document.createElement('span');
        titleHighlightContainer_before.setAttribute('class', 'highlight-container__before');
        titleHighlightContainer_before.style.backgroundImage = `linear-gradient(-100deg, rgba(255,241,225, 0), ${getColor(term, 0.2)}, rgba(255,241,225, 0))`
        let titleHighlightContainer_after = document.createElement('span');
        titleHighlightContainer_after.setAttribute('class', 'highlight-container__after');
        titleHighlightContainer_after.style.backgroundImage = `linear-gradient(-100deg, rgba(255,241,225, 0), ${getColor(term, 0.1)}, rgba(255,241,225, 0))`

        let titleText = document.createElement('span');
        titleText.setAttribute('class', 'highlight');
        titleText.innerText = firstToUpperCase(term);
        titleHighlightContainer.appendChild(titleHighlightContainer_before);
        titleHighlightContainer.appendChild(titleText);
        titleHighlightContainer.appendChild(titleHighlightContainer_after);
        word.appendChild(titleHighlightContainer);
        word.appendChild(divider);
        for (var posVariant in res) {
            if (res.hasOwnProperty(posVariant)) {
                var r = res[posVariant];
                // console.log(r);
                let div = document.createElement('div');
                // morphology
                // let morph = document.createElement('p');
                // morph.setAttribute('class', 'morphology');
                // morph.innerHTML = '<b>Часть речи: </b>';
                // let morphProperties = document.createTextNode(r.partOfSpeech);
                // morph.appendChild(morphProperties);
                
                // meanings
                let meaningsContainer = document.createElement('div');
                for (var meaning in r.meanings) {
                    if (r.meanings.hasOwnProperty(meaning)) {
                        // meaning
                        let meaningHeader = document.createElement('div');
                        meaningHeader.setAttribute('class', 'card-header');
                        meaningHeader.innerText = 'Значение:';
                        let meaningP = document.createElement('p');
                        meaningP.setAttribute('class', 'meaning');
                        // examples
                        let examplesHeader = document.createElement('div');
                        examplesHeader.setAttribute('class', 'card-header');
                        let examplesUl = document.createElement('ul');
                        let examples = r.meanings[meaning];
                        meaningP.innerText = meaning;
                        if(examples.length > 0) {
                            examplesHeader.innerText = (examples.length == 1) ? 'Пример употребления:' : 'Примеры употребления:';
                            examples.forEach((example) => {
                                let li = document.createElement('li');
                                let p = document.createElement('p');
                                p.setAttribute('class', 'example');
                                p.innerText = example;
                                li.appendChild(p);
                                examplesUl.appendChild(li);
                            })
                        }

                        meaningsContainer.appendChild(meaningHeader);
                        meaningsContainer.appendChild(meaningP);
                        meaningsContainer.appendChild(examplesHeader);
                        meaningsContainer.appendChild(examplesUl);
                    }
                }
                
                // div.appendChild(morph);
                div.appendChild(meaningsContainer);
        
                results.appendChild(div);
                
            }
        }

        liContent.appendChild(word);
        liContent.appendChild(results);
        this.el.appendChild(li);
    }

    _init() {
        // set default styles
        // first, the stack
        this.el.style.WebkitPerspective = this.el.style.perspective = this.options.perspective + 'px';
        this.el.style.WebkitPerspectiveOrigin = this.el.style.perspectiveOrigin = this.options.perspectiveOrigin;
    
        // let self = this;
    
        // the items
        let opacityStep = 0.5 / this.options.visible;
        let firstOpacityValue = 1 + opacityStep;
        for(var i = 0; i < this.itemsTotal; ++i) {
            var item = this.items[i];
            if( i < this.options.visible) {
                item.style.opacity = firstOpacityValue -= opacityStep;
                item.style.pointerEvents = 'auto';
                item.style.zIndex = i === 0 ? parseInt(this.options.visible + 1) : parseInt(this.options.visible - i);
                item.style.WebkitTransform = item.style.transform = 'translate3d(0px, 0px, ' + parseInt(-1 * 50 * i) + 'px)';
            } else {
                item.style.WebkitTransform = item.style.transform = 'translate3d(0,0,-' + parseInt(this.options.visible * 50) + 'px)';
            }
            item.hammertime = new Hammer(item);
            item.hammertime.on('swipeleft', () => {
                this.reject();
            });
            item.hammertime.on('swiperight', () => {
                this.accept();
            });
        }
        
        classie.add(this.items[this.current], 'stack__item--current');
    }

    reject(callback) {
        this._next('reject', callback);
    }

    accept(callback) {
        this._next('accept', callback);
    }

    restart() {
        this.hasEnded = false;
        this._init();
    }

   
    _next(action, callback) {
        //
        this.dbIndex = (this.dbIndex + 1 < this.dataKeysArray.length) ? this.dbIndex + 1 : 0;
        let term = this.dataKeysArray[this.dbIndex];
        let dictionary = new Query();
        dictionary.get(term, (result) => {
            next(term, result);
            dictionary = null;
        });
        
        var self = this;
        function next(term, result) {
            if( self.isAnimating || ( !self.options.infinite && self.hasEnded ) ) return;
            self.isAnimating = true;
        
            // current item
            // var currentItem = this.items[this.current];
            var currentItem = self.items[0];
            classie.remove(currentItem, 'stack__item--current');
        
            // add animation class
            classie.add(currentItem, action === 'accept' ? 'stack__item--accept' : 'stack__item--reject');
        
            
            onEndAnimation(currentItem, function() {
                // reset current item
                currentItem.style.opacity = 0;
                // currentItem.style.pointerEvents = 'none';
                // currentItem.style.zIndex = -1;
                // currentItem.style.WebkitTransform = currentItem.style.transform = 'translate3d(0px, 0px, -' + parseInt(self.options.visible * 50) + 'px)';
        
                // classie.remove(currentItem, action === 'accept' ? 'stack__item--accept' : 'stack__item--reject');
                
                // self.items[self.current].style.zIndex = self.options.visible + 1;
                // console.log(self.items[0].childNodes[0].childNodes[0].innerText);
                localStorage.viewed = ((self.items[0].childNodes[0].childNodes[0].innerText).toLowerCase()).trim();
                self.items.shift();
                self.el.removeChild(self.el.firstChild);
                self.isAnimating = false;
                
                if( callback ) callback();
                
                if( !self.options.infinite && self.current === 0 ) {
                    self.hasEnded = true;
                    // callback
                    self.options.onEndStack(self);
                }
            });

            function animateStackItems(item, i) {
                item.style.pointerEvents = 'auto';
                // console.log(i, item.outerText.slice(0, 2))
                item.style.opacity = 1 - (i * 0.5 / self.options.visible);
                item.style.zIndex = parseInt(self.options.visible - i);
                
                dynamics.animate(item, {
                    translateZ : parseInt(-1 * 50 * i)
                }, self.options.stackItemsAnimation);
            };

            // let result = {
            //     "http://sw.kloud.one/redbook#59c3d92f47affb9e3de53ec7" : {
            //         "meanings" : {
            //             "aaa" : []
            //             },
            //         "partOfSpeech" : "preposition",
            //         "canonicalForm" : null 
            //     }
            // }

        
            self._createCard(term, result);
            self.items = [].slice.call(self.el.children);
            let newItem = self.items[self.options.visible];
            newItem.style.WebkitTransform = newItem.style.transform = 'translate3d(0,0,-' + parseInt(self.options.visible * 50) + 'px)';
            newItem.hammertime = new Hammer(newItem);
            newItem.hammertime.on('swipeleft', () => {
                self.reject()
            });
            newItem.hammertime.on('swiperight', () => {
                self.accept();
            });
            // debugger;
            ///////
            self.items[0].style.zIndex = self.options.visible + 1;
            // set style for the other items
            for(var i = 0; i < self.options.visible; ++i) {
                // if( i > this.options.visible ) break;
                let pos;
                if( !self.options.infinite ) {
                    if( i >= self.options.visible - 1 ) break;
                    pos = i + 1;
                }
                else {
                    pos = self.current + i < self.itemsTotal - 1 ? self.current + i + 1 : i - (self.itemsTotal - self.current - 1);
                }
    
                var item = self.items[i + 1];
                
                // stack items animation
                setTimeout(function(item, i) {
                    return function() {
                        var preAnimation;
        
                        if( self.options.stackItemsPreAnimation ) {
                            preAnimation = action === 'accept' ? self.options.stackItemsPreAnimation.accept : self.options.stackItemsPreAnimation.reject;
                        }
                        
                        if( preAnimation ) {
                            // items "pre animation" properties
                            var animProps = {};
                            
                            for (var key in preAnimation.animationProperties) {
                                var interval = preAnimation.elastic ? preAnimation.animationProperties[key]/self.options.visible : 0;
                                animProps[key] = preAnimation.animationProperties[key] - Number(i*interval);
                            }
        
                            // this one remains the same..
                            animProps.translateZ = parseInt(-1 * 50 * (i+1));
        
                            preAnimation.animationSettings.complete = function() {
                                animateStackItems(item, i);
                            };
                            
                            dynamics.animate(item, animProps, preAnimation.animationSettings);
                        } else {
                            animateStackItems(item, i);
                        }
                    };
                }(item,i), self.options.stackItemsAnimationDelay);
            }
        
            // update current
            // this.current = this.current < this.itemsTotal - 1 ? this.current + 1 : 0;
            classie.add(self.items[self.current], 'stack__item--current');
        }
    }

}

var cards = new Stack(document.getElementById('stack'), {}, db);

var infoScreen = document.querySelector('#info');
var helpButton = document.querySelector('#show-info-button');
helpButton.onclick = () => {
    infoScreen.setAttribute('class', 'open');
}
var closeInfoButton = document.querySelector('#close-info-button')
closeInfoButton.onclick = () => {
    infoScreen.removeAttribute('class', 'open');
}
