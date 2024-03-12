
class memoryGame{
    constructor(
        board,
        difficulty,
        scoreboard,
        clock,
        volumeButton
    ){
        this.cards = [];
        this.board = board;

        this.difficulty = difficulty;
        this.difficultyTxt = undefined;
        this.scoreboard = scoreboard;
        // Basic set of time scores to incentivize a challenge to beat. 
        this.scores = 
        {
            novice: [15.000, 25.000, 35.000],
            easy: [25.000, 40.000, 50.000],
            normal: [35.000, 45.000, 60.000],
            hard: [60.000, 85.000, 100.000],
            extreme: [100.000, 130.000, 200.000]
        }
        
        this.clock = clock;
        this.previousCardObj = undefined;
        this.previousCardHTML = undefined;
        this.startTime = 0;
        this.time = 0;
        this.timeInterval = undefined;
        this.isBoardReady = 0; // 
        this.isGameActive = false; // Prevents game being reset before current game is finished (allowing cleaning procedures to execute)
        this.isGameReady = true; // Blocks card click before game processes previous card clicks with animation delays

        // Game Sound
        this.isSoundActive = false;
        this.volumeButton = volumeButton;
        this.volumeLevel = 0;
        this.soundEffects = {
            GameStart: new Audio('./SoundFX/GameStart.mp3'),
            GameEnd: new Audio('./SoundFX/Victory.mp3'),
            TickTock: new Audio('./SoundFX/TickTock.mp3'),
            CardHide: new Audio('./SoundFX/CardHide.mp3'),
            CardReveal: new Audio('./SoundFX/CardReveal.mp3'),
            CardMatch: new Audio('./SoundFX/CardMatch.mp3'),
            CardWrong: new Audio('./SoundFX/CardWrong.mp3'),
            Victory: new Audio('./SoundFX/Victory.mp3'),
        }
    }
    toggleAudio(){
        if(!this.isSoundActive) this.isSoundActive = true;
        else this.isSoundActive = false;
    }
    toggleAudioVolume(level){
        this.volumeLevel = level;
    }
    playSoundEffect(type){
        let mp3 = this.soundEffects[type];
        mp3.volume = this.volumeLevel / 100;
        mp3.play();
    }
    startGame(value, difficultyTxt){
        let charArray = [`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`, `N`,
                         `O`, `P`, `Q`, `R`, `S`, `T`, `U`, `V`, `W`, `X`, `Y`, `Z`];
        let difficulty = (value * 1) / 2;
        let tempArray = [];
        this.cards = [];
        this.isGameActive = true;
        let index = 0;
        this.clock.innerHTML = `&nbsp;`
        // set 'this' objects difficulty value from HTML element difficulty value 
        this.difficultyTxt = difficultyTxt;
        if(localStorage.getItem('memoryGameScores') !== null){
            this.scores = JSON.parse(localStorage.getItem('memoryGameScores'));
        }
        this.displayScores(this.difficultyTxt);

        this.playSoundEffect('GameStart');
        this.playSoundEffect('TickTock');

        // difficulty check
        if(value == 20) this.board.classList = 'hardSize'
        else if(value == 24) this.board.classList = 'maxSize'
        else this.board.classList = ''

        for(let i = 3; i > 0; i--){
            setTimeout(()=>{
                this.board.innerHTML = `<div class='gameStartCountDown'>${i}</div>`;
            }, 3000 - (i * 1000))
        }
        setTimeout(()=>{
            // Difficulty text saving
            if(!this.isBoardReady){
                // Orderly fill tempArray with required cards
                for(let i = 0; i < difficulty; i++){
                    let cardColor = `#${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`
                    for(let j = 0; j < 2; j++){
                        tempArray.push({
                            index: index++,
                            value: charArray[i],
                            fixed: false,
                            reveal: false,
                            color: cardColor
                        });
                    }
                }
                // Randomly fill this.cards array with cards
                while(tempArray.length){
                    let card = Math.floor(Math.random() * tempArray.length);
                    this.cards.push(tempArray[card])
                    tempArray.splice(card, 1);
                }
                // Create the HTML card elements to place on the board
                let boardHTML = ``;
                for(let i = 0; i < this.cards.length; i++){
                    boardHTML = boardHTML + `<div class="memoryGameCard" value='${this.cards[i].index}'></div>`
                }
                this.board.innerHTML = boardHTML;
                // Give each HTML card a click listener
                let memoryGameCards = document.querySelectorAll(`.memoryGameCard`);
                for(let i = 0; i < memoryGameCards.length; i++){
                    memoryGameCards[i].addEventListener(`click`,function(){
                        game.clickedCard(this.attributes.value.value, this)
                    })
                }
                // Time tracking
                this.startTime = new Date().getTime();
                clearInterval(this.timeInterval);
                this.timeInterval = undefined;
                this.timeInterval = setInterval(()=>{
                    this.time += 1;
                    this.clock.innerHTML = this.time;
                }, 1000)
                this.isBoardReady = 1;
            }
        }, 3000)
    }
    clickedCard(cardValue, currentCardHTML){
        // Current selected card
        let currentCardObj = this.cards.find(card =>{return card.index == cardValue});
        // Previously clicked card comparison
        if(this.previousCardObj == undefined && this.isGameReady){
            // No previous card to compare, set current card as previous card 
            this.playSoundEffect('CardReveal');
            this.previousCardObj = currentCardObj;
            this.previousCardHTML = currentCardHTML;
            currentCardHTML.style.backgroundColor = currentCardObj.color;
            currentCardHTML.innerHTML = currentCardObj.value;

        }
        else if(this.previousCardObj.index == currentCardObj.index && this.isGameReady){
            // Same index - Current card matches previous card (same card clicked twice)
            // this.cardMatchResult('incorrect');
            this.playSoundEffect('CardHide');
            currentCardHTML.style.backgroundColor = 'white';
            currentCardHTML.innerHTML = ``;
            this.previousCardObj = undefined;
            this.previousCardHTML = undefined;
            
        }
        else if(this.previousCardObj.value == currentCardObj.value && this.isGameReady){
            // Different index - Current card matches values (same card values found, GOOD MATCH FOUND!)

            this.previousCardObj.fixed = true;
            this.previousCardHTML.style.color = 'yellow';
            this.previousCardHTML.style.pointerEvents = `none`;
            this.previousCardObj = undefined;
            this.previousCardHTML = undefined;
            currentCardObj.fixed = true;
            currentCardHTML.style.color = 'yellow';
            currentCardHTML.style.backgroundColor = currentCardObj.color;
            currentCardHTML.style.pointerEvents = 'none';
            currentCardHTML.innerHTML = currentCardObj.value;
            // Check if game is over
            if(this.isGameOver()){
                // Play victory behavior
                this.cardMatchResult('finished');
                this.playSoundEffect('Victory');
            }
            else{
                // Play default behavior
                this.cardMatchResult('correct');
                this.playSoundEffect('CardMatch');
            }
        }
        else if(this.isGameReady){
            // Neither index, nor value were shared (2 different cards clicked)
            this.cardMatchResult('incorrect');
            // this.playSoundEffect('CardWrong');
            this.playSoundEffect('CardHide');
            setTimeout(this.playSoundEffect('CardHide'), 500);

            this.isGameReady = false; // Enforce game delay until animation procedure is done
            currentCardHTML.innerHTML = currentCardObj.value;
            currentCardHTML.style.background = currentCardObj.color;
            // Wait .2s to allow user to absorb wrong card selection
            currentCardHTML.style.animation = `wrongCardsAnimation .2s linear forwards 2 .1s`;
            this.previousCardHTML.style.animation = `wrongCardsAnimation .2s linear forwards 2 .1s`;
            
            setTimeout(() => {
                // Wait (5 second total) .1s for animation delay above + .2s x 2 (.4s) for animation to finish
                currentCardHTML.style.animation = ``;
                currentCardHTML.style.background = `white`;
                currentCardHTML.innerHTML = ``;
                this.previousCardHTML.style.animation = ``;
                this.previousCardHTML.style.background = `white`
                this.previousCardHTML.innerHTML = ``;
                this.previousCardObj = undefined;
                this.previousCardHTML = undefined;
                this.isGameReady = true; // Animation delay done - allow game to continue
            }, 500);
            
        }
    }
    cardMatchResult(matching){
        let correctArray = ['Nice!', 'Correct!', 'Awesome!', 'You got it!', 'Matched!', 'Sweet!']
        let incorrectArray = ['Oops!', 'Wrong!', 'Oh oh', 'Darn!', 'Try again', 'Woops']
        let finishedArray = ['You matched all the cards!', 'You beat the game!', 'Awesome, you did it!', 'Great, final card matched!']

        let moveResult = document.createElement('div');
        if(matching === 'correct'){
            moveResult.classList = 'matchResultDiv correct'
            moveResult.innerHTML = correctArray[Math.floor(Math.random() * correctArray.length)];
            moveResult.style.animation = 'moveResultAnimated 1s forwards'
            setTimeout(()=>{
                moveResult.remove();
            }, 1000);
        }
        else if(matching === 'incorrect'){
            moveResult.classList = 'matchResultDiv incorrect'
            moveResult.innerHTML = incorrectArray[Math.floor(Math.random() * incorrectArray.length)];
            moveResult.style.animation = 'moveResultAnimated 1s forwards'
            setTimeout(()=>{
                moveResult.remove();
            }, 1000);
        }
        else{
            moveResult.classList = 'matchResultDiv finished'
            moveResult.innerHTML = finishedArray[Math.floor(Math.random() * finishedArray.length)];
            moveResult.style.animation = 'moveResultAnimated 5s forwards'
            setTimeout(()=>{
                moveResult.remove();
            }, 5000);
        }
        this.board.append(moveResult);
    }
    displayScores(difficultyTxt){
        let max = (this.scores[difficultyTxt].length > 3) ? 3 : this.scores[difficultyTxt].length;
        let scoresHTML = `<div id='difficultyTitle'>${difficultyTxt}</div><ol>`;
        for(let i = 0; i < max; i++){
            scoresHTML = scoresHTML + `<li class='scoreBoardScore'> ${this.scores[difficultyTxt][i]} </li>`
        }
        scoresHTML = scoresHTML + `</ol>`;
        this.scoreboard.innerHTML = scoresHTML;
    }
    insertNewScore(score, difficulty){
        this.scores[difficulty].push(score);
        this.scores[difficulty].sort((a,b)=>{
            return a - b;
        })
        // this.scores[difficulty].splice(0,3)
    }
    isGameOver(){
        let fixedCards = 0;
        for(let i = 0; i < this.cards.length; i++){
            if(this.cards[i].fixed) fixedCards++;
        }
        if(fixedCards == this.cards.length){

            this.isGameActive = false;
            this.isBoardReady = 0;
            clearInterval(this.timeInterval);
            this.timeInterval = undefined;   
            this.time = 0;      
            let finishTime = new Date().getTime();
            let totalTime = (`totalTime`, (finishTime - this.startTime) / 1000) ;
            
            this.insertNewScore(totalTime, this.difficultyTxt);
            this.displayScores(this.difficultyTxt);

            localStorage.setItem('memoryGameScores', JSON.stringify(this.scores));

            let clock = this.clock; // persist clock element for setTimeout
            clock.innerHTML = totalTime;
            clock.style.animation = `flashClockResult .3s 3 forwards`;
            setTimeout(()=> clock.style.animation = '', 1000)
            return true;
        }
        else{
            return false;
        }
    }
}

let IDElement = x =>{return document.getElementById(x)}
let queryAll = x =>{return document.querySelectorAll(x)};
// let listen = (x, y)=>{this.addEventListener(x, y)}


let game = new memoryGame( // constructor(board, difficulty, scoreboard, clock, button)
    IDElement('memoryGameBoard'),
    IDElement('memoryGameDifficulties'),
    IDElement('memoryGameScores'),
    IDElement('memoryGameClock'),
    IDElement('gameVolumeButton')
)
// console.log(localStorage.getItem('memoryGameScores'));

let memoryGameDifficultyInput = queryAll('#memoryGameDifficulties input');
for(let i = 0 ; i < memoryGameDifficultyInput.length; i++){
    memoryGameDifficultyInput[i].addEventListener(`click`, function(){
        if(!game.isGameActive) game.startGame(this.value, this.attributes.difficulty.value);
    });
}
    
IDElement('gameVolumeButton').addEventListener('click', game.toggleAudio)
IDElement('gameVolumeRange').addEventListener('input', event =>{ game.toggleAudioVolume(event.target.value)});
    

// TESTING PURPOSES
document.addEventListener('DOMContentLoaded', ()=>{
    // console.log(this.innerWidth);
    // IDElement('memoryGameSiteWidth').innerText = this.innerWidth;
    // memoryGameDifficultyInput[1].click();
})
