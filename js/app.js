const _version = "1.0.1";
const _layoutCount = 16; // default layout for 8x2 match config

const _statusCode = {
    'NONE': 0,
    'STARTED': 1,
    'FINISHED': 2,
}

var _chars = "abcdefghijklmnoprstuvxyz0123456789!+%&=?*><";
const _cardIcons = [
    {
        id: 1,
        uniCode: 'f084',
        desc: 'key',
    },
    {
        id: 2,
        uniCode: 'f6e3',
        desc: 'hammer',
    },
    {
        id: 3,
        uniCode: 'f015',
        desc: 'home',
    },
    {
        id: 4,
        uniCode: 'f44e',
        desc: 'football',
    },
    {
        id: 5,
        uniCode: 'f0ad',
        desc: 'wrench',
    },
    {
        id: 6,
        uniCode: 'f6be',
        desc: 'cat',
    },
    {
        id: 7,
        uniCode: 'f185',
        desc: 'sun',
    },
    {
        id: 8,
        uniCode: 'f514',
        desc: 'wolf',
    }
]

var Card = (function () {
    function Card(p_Id, p_Code) {
        this.id = p_Id;
        var cardBoxEl = document.createElement('div');
        var cardBoxInnerEl = document.createElement('div');
        var cardBoxInnerFrontEl = document.createElement('div');
        var cardBoxInnerBackEl = document.createElement('div');
        cardBoxEl.className = "card-box";
        cardBoxEl.id = 'card-box-' + p_Id;
        cardBoxInnerEl.className = "card-box-inner";
        cardBoxInnerFrontEl.className = "card-box-inner-front flex-center";
        cardBoxInnerFrontEl.id = 'card-box-inner-front-' + p_Id;
        cardBoxInnerBackEl.className = "card-box-inner-back flex-center";
        cardBoxInnerBackEl.id = 'card-box-inner-back-' + p_Id;
        cardBoxInnerBackEl.setAttribute('data-before', p_Code);
        cardBoxInnerBackEl.setAttribute('data-matched', '0');
        cardBoxInnerFrontEl.addEventListener('click', event => {
            this.el.children[0].classList.add('flipStart')
            window.memoryGame.increaseFlips();

        })
        cardBoxInnerEl.appendChild(cardBoxInnerFrontEl);
        cardBoxInnerEl.appendChild(cardBoxInnerBackEl);
        cardBoxEl.appendChild(cardBoxInnerEl);
        this.el = cardBoxEl;
    }

    return Card;

})();

var Game = (function () {
    function Game() {
        this.version = _version;
        this.cardCount = _layoutCount;
        this.countDownInterval;
        this.status = _statusCode.NONE;
        this.counterEl = document.querySelector("#gameCounter");
        this.timerEl = document.querySelector("#timeCount");
        this.flipperEl = document.querySelector("#flipCount");
        this.startEl = document.querySelector(".starterContainer");
        this.startDescEl = document.querySelector("#starterDesc");
        this.resetEl = document.querySelector("#resetterBtn");
        this.playGroundEl = document.querySelector('.card-container');
        this.cardContainerEls = document.getElementsByClassName('card-box-inner');
        this.currentScore = 0;
        this.flipsFollower = [];
        this.matchCards = null;
    }

    Game.prototype.init = function (cb) {
        this.flipsFollower = 0;
        this.currentScore = 0;
        this.playGroundEl.innerHTML = '';
        this.flipperEl.innerHTML = this.flipsFollower.toString();
        this.prepareControls();

    }

    Game.prototype.startGame = function () {

        this.status = _statusCode.STARTED;
        this.startEl.className = "hidden";
        this.flipperEl.innerHTML = this.flipsFollower.toString();

        clearInterval(this.countDownInterval);
        this.initCountDown(100);
    }

    Game.prototype.initCountDown = function (p_StartPoint) {
        var refStart = p_StartPoint;
        this.timerEl.innerHTML = p_StartPoint.toString();
        this.countDownInterval = setInterval(() => {
            refStart -= 1;
            this.timerEl.innerHTML = refStart.toString();
            if (refStart === 0) {
                this.endGame();
            }
        }, 1000);

    }

    Game.prototype.increaseFlips = function () {
        this.flipsFollower += 1;
    }



    Game.prototype.prepareControls = function () {



        //generate cards
        var selection = [];
        var selectionProcessAllowed = true;
        while (selectionProcessAllowed) {
            const randomIndex = Math.floor(Math.random() * _chars.length);
            const randomChar = _chars[randomIndex];
            if (randomChar && selection.indexOf(randomChar) === -1) {
                selection.push(randomChar);
            }
            if (selection.length === (_layoutCount / 2)) {
                selectionProcessAllowed = false;
            } else {
                selectionProcessAllowed = true;
            }
        }

        this.matchCards = [...selection];
        var selectedOnes = [];
        var allowedToGo;
        for (let i = 1; i <= _layoutCount; i += 1) {
            allowedToGo = true;
            while (allowedToGo) {
                const randomIndex = Math.floor(Math.random() * this.matchCards.length);
                const randomChar = this.matchCards[randomIndex];
                var rets = selectedOnes.filter(s => s === randomChar);
                if (rets.length === 2) {
                    allowedToGo = true;
                } else {
                    allowedToGo = false;
                    selectedOnes.push(randomChar);
                    const cardToAdd = new Card(i, randomChar);
                    this.playGroundEl.appendChild(cardToAdd.el);
                }
            }



        }

        this.resetEl.addEventListener("click", () => {
            this.endGame(true);
        });

        this.playGroundEl.addEventListener("click", () => {
            this.flipperEl.innerHTML = this.flipsFollower.toString();
            var container = document.querySelectorAll(".flipStart");


            if (container.length % 2 === 0) {
                var itemsToCheck = [];
                for (let i = 0; i < container.length; i += 1) {
                    let retCheck = container[i].children[1].getAttribute('data-matched');
                    if (+retCheck === 0) {
                        itemsToCheck.push(container[i].children[1]);
                    }
                }

                const yesMatch = itemsToCheck[0].getAttribute('data-before') === itemsToCheck[1].getAttribute('data-before');
                if (yesMatch) {
                    this.currentScore += 1;
                    if(container.length === _layoutCount) {
                        this.endGame();
                    }
                    setTimeout(() => {

                        itemsToCheck.forEach(s => {
                            s.setAttribute('data-matched', '1');
                        })

                    }, 100);
                } else {
                    setTimeout(() => {
                        itemsToCheck.forEach(s => {
                            s.parentElement.classList.remove('flipStart');
                        })

                    }, 500);
                }

            }
        });

    }

    Game.prototype.endGame = function (p_isReset) {

        clearInterval(this.countDownInterval);
        this.startEl.className = "starterContainer";
        this.status = _statusCode.NONE;
        if (p_isReset) {
            this.startDescEl.className = "starterDesc";
            this.startDescEl.innerHTML = "Ready to Re-Play?";
            return;
        }
        let flipCount = this.flipperEl.innerHTML;
        this.startDescEl.className = "starterDesc";
        if (+flipCount === 0) {
            this.startDescEl.innerHTML = "Time is Up!!";
        } else if (this.currentScore === 8) {
            this.startDescEl.innerHTML = "Won!!";
        } else if (this.currentScore > 0 && this.currentScore < 8) {
            this.startDescEl.innerHTML = "Lose!!";
        } else {
            console.warn("not implemented condition - 101");
            this.startDescEl.innerHTML = "Let's go!!";
        }

    }

    return Game;

})();


var XStartEl = document.querySelector(".starterContainer");
XStartEl.addEventListener("click", (event) => {
    window.memoryGame = new Game();
    window.memoryGame.init();
    window.memoryGame.startGame();
});
