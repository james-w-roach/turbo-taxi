let jumping = false;
let jump;
let gameOver = false;
let firstObstacleInterval;
let secondObstacleInterval;
let secondObstacleTimeout;
let addEasyShapes;
let addMediumShapes;
let addHardShapes
let scoreInterval;

let score = 0;

const spawnlist = ['block', 'low-wide block', 'floating block', 'gap'];

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    if (!gameOver) {
      let direction = 'up';
      if (!jumping) {
        jumping = true;
        jump = setInterval(() => {
          if (getComputedStyle(document.querySelector('.car')).bottom !== '150px' && direction === 'up') {
            document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) + 2) + 'px';
          } else if (getComputedStyle(document.querySelector('.car')).bottom !== '0px' && direction === 'down') {
            document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
          } else if (getComputedStyle(document.querySelector('.car')).bottom === '150px') {
            direction = 'down';
          } else if (getComputedStyle(document.querySelector('.car')).bottom === '0px') {
            direction = 'up';
            clearInterval(jump);
            jumping = false;
          }
        }, 4);
      }
    }
  }
});

window.addEventListener('click', event => {
  if (event.target.className === 'start-button') {
    document.querySelector('.start-modal').remove();
    startGame();
  } else if (event.target.className === 'start-over') {
    gameOver = false;
    document.querySelector('.car').style.bottom = '0px';
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    document.querySelector('#game-over-modal').className = 'hidden';
    score = 0;
    document.querySelector('.score').textContent = 0;
    startGame();
  }
});

endGame = () => {
  gameOver = true;
  jumping = false;
  const obstacleOverflow = spawnlist.length - 4;
  if (obstacleOverflow) {
    spawnlist.splice((spawnlist.length - obstacleOverflow), obstacleOverflow);
  }
  clearInterval(jump);
  clearInterval(firstObstacleInterval);
  clearInterval(secondObstacleInterval);
  clearInterval(scoreInterval);
  clearTimeout(secondObstacleTimeout);
  clearTimeout(addEasyShapes);
  clearTimeout(addMediumShapes);
  clearTimeout(addHardShapes);
  document.querySelector('#game-over-modal').className = 'game-over-modal';
  document.querySelector('.game-over-score').textContent = 'Score: ' + score;
}

moveObstacle = obstacle => {

  const move = setInterval(() => {

    if (gameOver) {
      // ensures all obstacles stop moving once game is over
      clearInterval(move);
    }

    if (getComputedStyle(obstacle).left !== '-350px') {
      obstacle.style.left = (parseInt(getComputedStyle(obstacle).left.split('px')[0]) - 2) + 'px';
    } else {
      // each obstacle is removed after leaving the player area
      document.querySelector('.player-area').removeChild(obstacle);
    }

    // declares boundaries of the obstacle as well as each section of the car
    // individual sections are declared instead of the entire .car element to improve hit detection accuracy

    const obstacleRect = obstacle.getBoundingClientRect();
    const wheelsRect = document.querySelector('.wheels').getBoundingClientRect();
    const lowerCarRect = document.querySelector('.car-bottom').getBoundingClientRect();
    const upperCarRect = document.querySelector('.car-top').getBoundingClientRect();

    const rects = [wheelsRect, lowerCarRect, upperCarRect];

    // loops through each bounding rect to see if its touching the obstacle
    // if the car is touching the obstacle, the game is over and all intervals are cleared

    for (i = 0; i < rects.length; i++) {
      if ((rects[i].bottom >= obstacleRect.top) && (rects[i].bottom <= obstacleRect.bottom)
        && (rects[i].right >= obstacleRect.left) && (rects[i].left <= obstacleRect.right)) {
        clearInterval(move);
        endGame();
      }
    }
  }, 4);
}

spawnObstacle = () => {
  const $playerArea = document.querySelector('.player-area');
  const block = document.createElement('div');

  block.className = 'obstacle ' + spawnlist[Math.floor(Math.random() * spawnlist.length)];

  $playerArea.appendChild(block);

  moveObstacle(block);
}

startGame = () => {

  scoreInterval = setInterval(() => {
    score++;
    document.querySelector('.score').textContent = score;
  }, 200);

  // the first interval spawns an obstacle every 2.5 seconds

  firstObstacleInterval = setInterval(spawnObstacle, 2500);

  // the second interval adds another obstacle (they now spawn every 1.25s)

  secondObstacleInterval;

  secondObstacleTimeout = setTimeout(() => {
    if (!gameOver) {
      secondObstacleInterval = setInterval(spawnObstacle, 2500);
    }
  }, 11250)

  // a wider gap is added to the game after 25s to increase difficulty

  addEasyShapes = setTimeout(() => {
    spawnlist.push('wide gap');
    spawnlist.push('medium block');
  }, 20000)

  addMediumShapes = setTimeout(() => {
    spawnlist.push('tall block');
    spawnlist.push('tall-wide block');
  }, 40000)

  addHardShapes = setTimeout(() => {
    spawnlist.push('wide-floating block');
    spawnlist.push('low floating block');
  }, 60000)

}
