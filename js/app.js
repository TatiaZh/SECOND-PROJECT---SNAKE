window.onload = () => {
    //--- caching all the buttons and inputs: --- //

    const noviceBtn = document.getElementById('novice');
    const intermediateBtn = document.getElementById('intermediate');
    const hardBtn = document.getElementById('hard');

    const newGameBtn = document.getElementById('new');
    const continueBtn = document.getElementById('continue');
    const customizeBtn = document.getElementById('customize');

    const startBtn = document.getElementById('start');
    const saveBtn = document.getElementById('save');
    const cancelBtn = document.getElementById('cancel');

    const tryAgainBtn = document.getElementById('tryAgain');

    const boardWidthInp = document.getElementById('boardWidth');
    const boardHeightInp = document.getElementById('boardHeight');
    const NofApplesInp = document.getElementById('NofApples');
    const initLengthInp = document.getElementById('initLength');
    const speedInp = document.getElementById('speed');

    // ------------------------------------------------------------------- //
    
    // regulates speed input min and max according to the level
    function regulateSpeedInput(level, speedInp) {
        let minSpeedSpan = document.getElementById('minSpeed');
        let maxSpeedSpan = document.getElementById('maxSpeed');
        switch (level) {
            case 1:
                speedInp.setAttribute('min', '1');
                speedInp.setAttribute('max', '1.9');
                minSpeedSpan.innerText = '1';
                maxSpeedSpan.innerText = '1.9';
                break;
            case 2:
                speedInp.setAttribute('min', '2');
                speedInp.setAttribute('max', '3.5');
                minSpeedSpan.innerText = '2';
                maxSpeedSpan.innerText = '3.5';
                break;
            case 3:
                speedInp.setAttribute('min', '4');
                speedInp.setAttribute('max', '5');
                minSpeedSpan.innerText = '4';
                maxSpeedSpan.innerText = '5';
                break;
        }
    }


    // creating new game 
    let newGame = new Game();
    let settings;
    let level = 1;


    // ------------------------ LEVEL LISTENERS -------------------- //

    noviceBtn.addEventListener('click', () => {
        level = 1;
        settings = newGame.configure(level);
        newGame.updateStoredSettings(settings, level);
        hideLevels();
        showNewContinue();
        regulateSpeedInput(level, speedInp);
    })

    intermediateBtn.addEventListener('click', () => {
        level = 2;
        settings = newGame.configure(level);
        newGame.updateStoredSettings(settings, level);
        hideLevels();
        showNewContinue();
        regulateSpeedInput(level, speedInp);
    })

    hardBtn.addEventListener('click', () => {
        level = 3;
        settings = newGame.configure(level);
        newGame.updateStoredSettings(settings, level);
        hideLevels();
        showNewContinue()
        regulateSpeedInput(level, speedInp);
    })


    // ---------------------- INPUT LISTENERS ---------------------------------- //

    boardWidthInp.addEventListener('change', (e) => {
        let newBoardWidth = parseFloat(e.target.value);
        settings.setBoardWidth(newBoardWidth);
    })

    boardHeightInp.addEventListener('change', (e) => {
        let newBoardHeight = parseFloat(e.target.value);
        settings.setBoardHeight(newBoardHeight);
    })

    NofApplesInp.addEventListener('change', (e) => {
        let newNofApples = parseFloat(e.target.value);
        settings.setNOfApples(newNofApples);
    })

    initLengthInp.addEventListener('change', (e) => {
        let newInitLength = parseFloat(e.target.value);
        settings.setSnakeLength(newInitLength);
    })

    speedInp.addEventListener('change', (e) => {
        let newSpeed = parseFloat(e.target.value);
        settings.setSnakeSpeed(newSpeed);
    })

    // ------------------------------------------------------------ //

    // ---------------- BUTTON LISTENERS ---------------------------- //
    saveBtn.addEventListener('click', () => {
        showNewContinue();
        newGame.updateStoredSettings(settings, level);

    })

    newGameBtn.addEventListener('click', () => {
        hideControls();
        showCanvasWrapper();
        newGame.reset(level);
        newGame.start(level);
    });

    continueBtn.addEventListener('click', () => {
        hideControls();
        showCanvasWrapper();
        newGame.start(level);
    });

    startBtn.addEventListener('click', () => {
        hideControls();
        showCanvasWrapper();
        newGame.start(level);
    });

    customizeBtn.addEventListener('click', () => {
        showSettings();
    });

    cancelBtn.addEventListener('click', () => {
        hideSettings();
        showNewContinue();
    });

    tryAgainBtn.addEventListener('click', () => {
        hideHighScores();
        showLevels();
        showControls();
    });
    // --------------------------------------------------- //
}
// ----------------------------------------------------------------//

//#region GAME LOGIC

class Coordinats {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Snake {
    constructor() {
        this.dx;
        this.dy;
        this.units;
        this.speed = 1;
        this.length = 3;
        this.size = 15;
        this.dead;
    }

    // initializes the snake - creates snake's body and stores it in an array
    init(coords) {
        this.death(false);
        this.dx = 1;
        this.dy = 0;
        // our snake will have body with random coordinates 
        let randX = coords.x[Math.floor(Math.random() * (coords.x.length / 2 - this.length))];
        let randY = coords.y[Math.floor(Math.random() * coords.y.length)];
        this.units = [];
        for (let i = 0; i < this.length; ++i) {
            let newUnit = new Coordinats(randX + this.size, randY);
            this.units.push(newUnit);
        }
    }

    // draws snake body on the provided context
    draw(context) {
        context.fillStyle = '#414048';
        context.beginPath();
        for (let i = 0; i < this.length; ++i) {
            context.fillRect(this.units[i].x, this.units[i].y, this.size, this.size);
        }
        context.closePath();
    }

    // makes the snake move according to the direction
    update() {
        this.changeDirection();
        let head = this.getHeadPos();
        head.x += (this.size) * this.dx;
        head.y += (this.size) * this.dy;
        this.collisionWithSelf(head.x, head.y)
        let tail = this.units.pop();
        tail.x = head.x;
        tail.y = head.y;
        this.units.unshift(tail);
    }

    // grows snake's body and length
    eat() {
        let x = this.units[this.units.length - 1].x;
        let y = this.units[this.units.length - 1].y;
        this.units.push(new Coordinats(x, y));
        this.length++;
    }

    //  checks if the snake has crashed with itself, if it has, calls the death function
    collisionWithSelf(x, y) {
        for (let i = 1; i < this.units.length; ++i) {
            if (this.units[i].x === x && this.units[i].y === y) {
                this.death(true);
            }
        }
    }

    // changes snake's direction according to the keys user presses
    changeDirection() {
        document.onkeydown = (e) => {
            switch (e.keyCode) {
                case 37:    //left
                    e.preventDefault()
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 38:    //up
                    e.preventDefault()
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 39:    //right
                    e.preventDefault()
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case 40:    //down
                    e.preventDefault()
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
            }
        }
    }

    // sets the state of snake's death
    death(flag) {
        this.dead = flag;
    }

    // returns if the snake is dead
    isDead() {
        return this.dead;
    }

    // sets the snake's length
    setLenght(length) {
        this.length = length;
    }

    // sets the snake's speed    
    setSpeed(speed) {
        this.speed = speed;
    }

    // returns the position of the snake's head
    getHeadPos() {
        return this.units[0]
    }

    // returns the snake's size
    getSize() {
        return this.size;
    }

    // returns the snake's speed
    getSpeed() {
        return this.speed;
    }
}

class Food {
    constructor() {
        this.size = 15;
        this.quantity = 1;
    }

    // initializes the food - saves it's random coordinats in an array
    init(coords) {
        this.units = [];
        for (let i = 0; i < this.quantity; ++i) {
            let randX = coords.x[Math.floor(Math.random() * coords.x.length)];
            let randY = coords.y[Math.floor(Math.random() * coords.y.length)];
            let newUnit = new Coordinats(randX, randY);
            this.units.push(newUnit);
        }
    }

    // draws the food on the provided context
    draw(context) {
        context.fillStyle = '#f8333c';
        context.beginPath();
        for (let i = 0; i < this.quantity; ++i) {
            context.fillRect(this.units[i].x, this.units[i].y, this.size, this.size);
        }
        // context.closePath();
    }

    // sets the food's quantity
    setQuantity(quantity) {
        this.quantity = quantity;
    }

    // returns the position of the food
    getPos() {
        return this.units;
    }

    // sets the size of the food
    setSize(size) {
        this.size = size;
    }

    // gets the size of the food
    getSize() {
        return this.size;
    }
}

class Board {
    constructor(width = 1200, height = 500) {
        this.width = width;
        this.height = height;
    }

    // initializes the board - 
    // if the canvas doesn't exist creates canvas and appends it to the container
    // if it does sets it's parameters
    init() {
        const wrapper = document.getElementById('canvasWrapper');
        let newCanvas;
        if (!document.querySelector('canvas')) {
            newCanvas = document.createElement('canvas');
            newCanvas.width = this.width;
            newCanvas.height = this.height;
            newCanvas.setAttribute('id', 'canvas');
            this.context = newCanvas.getContext('2d');
            wrapper.appendChild(newCanvas);
        } else {
            newCanvas = document.getElementById('canvas');
            newCanvas.width = this.width;
            newCanvas.height = this.height;
            this.context = newCanvas.getContext('2d');
        }
        this.style(wrapper);
    }

    // styles the board
    style(container) {
        container.style.width = `${this.width + 40}px`;
        container.style.height = `${this.height + 40}px`;
        container.style.padding = '20px';
    }

    // makes the board into an abstract grid and saves that grid in an object containing arrays
    // purpose is to make objects on the board align to each other
    initGrid(cellSize) {
        this.gridCells = {
            x: [],
            y: []
        }
        for (let i = 0; i < this.width - cellSize; i += cellSize) {
            this.gridCells.x.push(i)
        }
        for (let i = 0; i < this.height - cellSize; i += cellSize) {
            this.gridCells.y.push(i)
        }
    }

    // returns the abstract grid
    getGrid() {
        return this.gridCells;
    }

    // clears the board - erases everything on it
    clear() {
        this.context.fillStyle = '#d0fcb3';
        this.context.fillRect(0, 0, this.width, this.height);
    }

    // sets the width of the board
    setWidth(width) {
        this.width = width;
    }

    // sets the height of the board
    setHeight(height) {
        this.height = height;
    }

    // gets the width of the board
    getWidth() {
        return this.width;
    }

    // gets the height of the board
    getHeight() {
        return this.height;
    }

    // returns the context of the board, to be drawn on this board
    getboardContext() {
        return this.context;
    }
}

class Settings {
    // creates Settings object with parameters and level if provided, 
    // if not, creates it with default parameters
    constructor(level, obj = {
        boardWidth: 1200,
        boardHeight: 500,
        nOfApples: 1,
        snakeLength: 3,
        currentScore: 0,
        highScore: 0,
    }) {

        switch (level) {
            case 1: this.snakeSpeed = 1; break;
            case 2: this.snakeSpeed = 2; break;
            case 3: this.snakeSpeed = 4; break;
            default: return null;

        }
        if (obj.snakeSpeed) {
            this.snakeSpeed = obj.snakeSpeed;
        }
        this.boardWidth = obj.boardWidth;
        this.boardHeight = obj.boardHeight;
        this.nOfApples = obj.nOfApples;
        this.snakeLength = obj.snakeLength;
        this.currentScore = obj.currentScore;
        this.highScore = obj.highScore;
    }

    // following functions set and get the properties of the Settings object:
    setBoardWidth(width) {
        this.boardWidth = width;
    }

    setBoardHeight(height) {
        this.boardHeight = height;
    }

    getBoardWidth() {
        return this.boardWidth;
    }

    getBoardHeight() {
        return this.boardHeight;
    }

    setNOfApples(apples) {
        this.nOfApples = apples;
    }

    getNOfApples() {
        return this.nOfApples;
    }

    setSnakeLength(length) {
        this.snakeLength = length;
    }

    getSnakeLength() {
        return this.snakeLength;
    }

    setSnakeSpeed(speed) {
        this.snakeSpeed = speed;
    }

    getSnakeSpeed() {
        return this.snakeSpeed;
    }

    setLevel(level) {
        this.level = level;
    }

    getLevel() {
        return this.level;
    }

    setCurrentScore(score) {
        this.currentScore = score;
    }

    getCurrentScore() {
        return this.currentScore;
    }

    setHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
        }
    }

    getHighScore() {
        return this.highScore;
    }
    //

}

class Game {
    // creates the Game object with some default parameters
    // if already exists returns it
    constructor() {
        if (Game.exists) {
            return Game.instance;
        }
        this.board = new Board();
        this.snake = new Snake();
        this.food = new Food();
        this.currentScore = 0;
        this.highScore = 0;
        this.storage = window.localStorage;
        Game.instance = this;
        Game.exists = true;
        return this;
    }

    // starts the game - intializes everything and saves the current level
    start(level) {
        this.updateSettings(level);
        this.board.init();
        if (this.snake.getSize() !== this.food.getSize()) {
            this.food.setSize(this.snake.getSize());
        }
        this.board.initGrid(this.food.getSize());
        this.snake.init(this.board.getGrid());
        this.food.init(this.board.getGrid());
        this.animate();

        this.level = level;
    }

    // resposible for animation(changing the frames)
    animate() {
        if (this.snake.isDead()) {
            this.over();
            return;
        }
        this.board.clear();
        this.food.draw(this.board.getboardContext());
        this.snake.update();
        this.snake.draw(this.board.getboardContext());
        this.collisionWithFood();
        this.collisionWithBorder();
        setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, 100 / this.snake.getSpeed());
        // requestAnimationFrame(() => this.animate())
    }

    // checks if the snake has crashed into the border 
    // if it has, kills the snake
    collisionWithBorder() {
        let snakeHeadPos = this.snake.getHeadPos()
        if (snakeHeadPos.x < 0 || snakeHeadPos.x >= this.board.getWidth()
            || snakeHeadPos.y < 0 || snakeHeadPos.y >= this.board.getHeight()) {
            this.snake.death(true);
        }
    }

    // checks if the snake has crashed with the food
    // if it has, calls the snake's method reponsible for eating and generates new food
    collisionWithFood() {
        let snakeHeadPos = this.snake.getHeadPos();
        let foodPos = this.food.getPos();
        for (let i = 0; i < foodPos.length; ++i) {
            if (snakeHeadPos.x == foodPos[i].x && snakeHeadPos.y == foodPos[i].y) {
                this.snake.eat();
                this.food.init(this.board.getGrid());
                this.food.draw(this.board.getboardContext());
                this.currentScore += 10;
            }
        }
    }

    // when the game is over, saves scores and shows the "gameOver screen"
    over() {
        this.saveHighScore(this.settings, this.level)
        this.showHighScore();
        this.settings.setHighScore(this.highScore);
        this.updateStoredSettings(this.settings, this.level)
        hideCanvasWrapper();
        hideNewContinue();
        hideSettings();
        showScores(this.currentScore, this.highScore);
        // showLevels();
        showControls();
        this.currentScore = 0;
    }

    // configures the settings - if there is not a history of settings creates the default one
    // if there is, updates it (all of this according to level)
    configure(level) {
        const storage = window.localStorage;
        const key = `SNAKE_SETTINGS_${level}`;
        if (storage && storage.getItem(key)) {
            this.settings = new Settings(level, this.getStoredSettings(level));

        } else {
            this.settings = new Settings(level);
            this.saveHighScore(this.settings, level);
            this.updateStoredSettings(settings, level)
        }
        return this.settings;
    }

    // returns settings stored according to level
    getStoredSettings(level) {
        if (window.localStorage && window.localStorage.getItem(`SNAKE_SETTINGS_${level}`)) {
            let settings = new Settings(level, JSON.parse(window.localStorage.getItem(`SNAKE_SETTINGS_${level}`)));
            return settings;
        } else {
            return null;
        }
    }

    // updates settings stored according to level
    updateStoredSettings(obj, level) {
        if (window.localStorage) {
            window.localStorage.setItem(`SNAKE_SETTINGS_${level}`, JSON.stringify(obj));
        }
    }

    // updates current settings
    updateSettings(level) {
        // this.updateStoredSettings(obj);
        let settings = this.getStoredSettings(level);
        this.snake.setLenght(settings.getSnakeLength());
        this.snake.setSpeed(settings.getSnakeSpeed());
        this.board.setHeight(settings.getBoardHeight());
        this.board.setWidth(settings.getBoardWidth());
        this.food.setQuantity(settings.getNOfApples());
    }

    // resets the settings - both current and stored
    reset(level) {
        let settings = new Settings(level);
        this.saveHighScore(settings, level);
        this.updateStoredSettings(settings, level);
    }

    // saves high score
    saveHighScore(settings, level) {
        if (this.getStoredSettings(level)) {
            this.highScore = this.getStoredSettings(level).getHighScore();
        }
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
        }
        settings.setHighScore(this.highScore);
    }

    // displays high score
    showHighScore() {
        alert(`YOUR SCORE: ${this.currentScore}
         HIGHSCORE: ${this.highScore}`);
        // this.currentScore = 0;
    }
}

//#endregion GAME LOGIC

/// ---------------------------------------------------------------------------------- ///



//#region FUNCTIONS FOR MANIPULATING UI

// changes text inside the high scores div and displays the div
function showScores(cScore, hScore) {
    document.getElementById('highScores').style.display = 'flex';
    document.getElementById('cScore').innerText = cScore;
    document.getElementById('hScore').innerText = hScore;
}

// following functions manipulate the divs displaying 
// the settings, highscores, levels, starting buttons
function hideHighScores() {
    document.getElementById('highScores').style.display = 'none'
}

function showSettings() {
    document.getElementById('settings').style.display = 'flex'
}

function hideSettings() {
    document.getElementById('settings').style.display = 'none'
}

function hideControls() {
    document.getElementById('controls').style.display = 'none'
}

function showControls() {
    document.getElementById('controls').style.display = 'block'
}

function hideCanvasWrapper() {
    document.getElementById('canvasWrapper').style.display = 'none'
}

function showCanvasWrapper() {
    document.getElementById('canvasWrapper').style.display = 'block'
}

function hideLevels() {
    document.getElementById('levels').style.display = 'none'
}

function showLevels() {
    document.getElementById('levels').style.display = 'flex'
}

function hideNewContinue() {
    document.getElementById('newContinue').style.display = 'none'
}

function showNewContinue() {
    document.getElementById('newContinue').style.display = 'flex'
}
//#endregion FUNCTIONS FOR MANIPULATING UI
