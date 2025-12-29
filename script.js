
const board = document.querySelector('.board')
const startButton = document.querySelector('.btn-start')
const startButtonNoWalls = document.querySelector('.btn-start-nowalls')
const modal = document.querySelector('.modal')
const startGameModal = document.querySelector('.start-game')
const gameOverModal = document.querySelector('.game-over')
const restartButton = document.querySelector('.btn-restart')
const pauseButton = document.querySelector('.btn-pause')

const highScoreElement = document.querySelector('#high-score')
const scoreElement = document.querySelector('#score')
const timeElement = document.querySelector('#time')
const gameModeElement = document.querySelector('#game-mode')

const blockHeight = 80
const blockWidth = 80

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

const blocks = []

let isPaused=false
let wrapAround=false
let highScore = localStorage.getItem('highScore') || 0
let score = 0
let time = `00-00`

highScoreElement.innerText = highScore

let intervalId = null
let timerIntervalId = null
let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }


let snake = [{ x: 1, y: 3 }]
let direction = 'down'
let nextDirection = 'down' // Prevents reversing into itself

// Create board blocks
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    let block = document.createElement('div')
    block.classList.add('block')
    board.appendChild(block)
    //block.innerText = `${row}-${col}`
    blocks[`${row}-${col}`] = block
  }
}

function drawSnake() {
  // Update direction (prevents reverse)
  direction = nextDirection

  blocks[`${food.x}-${food.y}`]?.classList.add('food')

  let head = null
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 }
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 }
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y }
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y }
  }

  if(wrapAround){
    if(head.x<0){
      head.x=rows-1

    }
    else if(head.x>=rows){
      head.x=0
    }
     if (head.y < 0) {
      head.y = cols - 1 
    } else if (head.y >= cols) {
      head.y = 0  
    }
  }else{
  // Check wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    gameOver()
    return
  }
  }
  // Check self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver()
    return
  }

  // Food consumed logic
  if (head.x == food.x && head.y == food.y) {
    blocks[`${food.x}-${food.y}`]?.classList.remove('food')
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
    blocks[`${food.x}-${food.y}`]?.classList.add('food')
    snake.unshift(head)

    score += 10
    scoreElement.innerText = score
    if (score > highScore) {
      highScore = score
      highScoreElement.innerText = highScore
      localStorage.setItem('highScore', highScore.toString())
    }
  } else {
    // Remove old snake
    snake.forEach(segment => blocks[`${segment.x}-${segment.y}`]?.classList.remove('fill'))
    snake.unshift(head)
    snake.pop()
  }

  // Draw new snake
  snake.forEach(segment => {
    blocks[`${segment.x}-${segment.y}`]?.classList.add('fill')
  })
}

function startGame(mode){
  wrapAround=mode;
  modal.style.display = 'none'
  if(gameModeElement){
    gameModeElement.innerText = wrapAround ? 'No Walls Mode' : 'Classic Mode'
  }
   if (intervalId) clearInterval(intervalId)
  if (timerIntervalId) clearInterval(timerIntervalId)

  intervalId = setInterval(() => { drawSnake() }, 300)
timerIntervalId = setInterval(() => {
    let [min, sec] = time.split('-').map(Number)
    if (sec === 59) {
      min += 1
      sec = 0
    } else {
      sec += 1
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`
    timeElement.innerText = time
  }, 1000)
}

startButton.addEventListener('click', () => {
  startGame(false) // Classic mode with walls
})

startButtonNoWalls.addEventListener('click', () => {
  startGame(true) // No walls mode
})

function gameOver() {
  clearInterval(intervalId)
  clearInterval(timerIntervalId)
  modal.style.display = 'flex'
  startGameModal.style.display = 'none'
  gameOverModal.style.display = 'flex'
}

startButton.addEventListener('click', () => {
  modal.style.display = 'none'
  
  // Clear any existing intervals
  if (intervalId) clearInterval(intervalId)
  if (timerIntervalId) clearInterval(timerIntervalId)
  
  intervalId = setInterval(() => { drawSnake() }, 300)

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split('-').map(Number)
    if (sec === 59) {
      min += 1
      sec = 0
    } else {
      sec += 1
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`
    timeElement.innerText = time
  }, 1000) // Added the missing 1000ms delay
})

restartButton.addEventListener('click', restartGame)

function restartGame() {
  // Clear intervals
  clearInterval(intervalId)
  clearInterval(timerIntervalId)

  // Clear board
  blocks[`${food.x}-${food.y}`]?.classList.remove('food')
  snake.forEach(segment => blocks[`${segment.x}-${segment.y}`]?.classList.remove('fill'))

  // Reset game state
  score = 0
  time = `00-00`
  scoreElement.innerText = score
  timeElement.innerText = time
  highScoreElement.innerText = highScore

  modal.style.display = 'none'
  direction = 'down'
  nextDirection = 'down'
  snake = [{ x: 1, y: 3 }] // Fixed: removed 'let' to update global variable
  food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
  
  // Start new game
  intervalId = setInterval(() => { drawSnake() }, 300)
  
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split('-').map(Number)
    if (sec === 59) {
      min += 1
      sec = 0
    } else {
      sec += 1
    }
    time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`
    timeElement.innerText = time
  }, 1000)
}
pauseButton.addEventListener('click',togglePause)
function togglePause()
{
  
 if (isPaused) {
    // RESUME
    isPaused = false
    pauseButton.innerText = 'Pause'
    
    // Restart intervals with same state
    intervalId = setInterval(() => { drawSnake() }, 300)
    timerIntervalId = setInterval(() => {
      let [min, sec] = time.split('-').map(Number)
      if (sec === 59) {
        min += 1
        sec = 0
      } else {
        sec += 1
      }
      time = `${String(min).padStart(2, '0')}-${String(sec).padStart(2, '0')}`
      timeElement.innerText = time
    }, 1000)
  } else {
    // PAUSE
    isPaused = true
    pauseButton.innerText = 'Resume'
    
    // Stop intervals but keep all game state
    clearInterval(intervalId)
    clearInterval(timerIntervalId)
  }
}

addEventListener('keydown', (event) => {
  // Prevent reversing into itself
  if (event.key === 'ArrowLeft' && direction !== 'right') {
    nextDirection = 'left'
  } else if (event.key === 'ArrowRight' && direction !== 'left') {
    nextDirection = 'right'
  } else if (event.key === 'ArrowUp' && direction !== 'down') {
    nextDirection = 'up'
  } else if (event.key === 'ArrowDown' && direction !== 'up') {
    nextDirection = 'down'
  }
  else if(event.key===' ' || event.key==='Spacebar'){
    event.preventDefault()
togglePause()
  }
  if(isPaused){return}
})