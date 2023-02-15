let jumping = false;
let falling = false;
let jump;
let gameOver = false;
let firstObstacleInterval;
let secondObstacleInterval;
let secondObstacleTimeout;
let addEasyShapes;
let addMediumShapes;
let addHardShapes
let scoreInterval;
let fall;
let newHiScore = false;
let blasterTimeout;
let blasterInterval;

let blasterEnabled = false;
let energyBlastInAir = false;

let score = 0;
let hiScore = 0;

if (localStorage.getItem('Hi-Score')) {
  hiScore = JSON.parse(localStorage.getItem('Hi-Score'));
  document.querySelector('.hi-score').textContent = hiScore;
}

const spawnlist = ['block', 'low-wide block', 'floating block', 'gap'];

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    if (!gameOver) {
      let direction = 'up';
      if (!jumping && !falling) {
        jumping = true;
        jump = setInterval(() => {
          if (getComputedStyle(document.querySelector('.car')).bottom !== '150px' && direction === 'up') {
            document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) + 2) + 'px';
          } else if (getComputedStyle(document.querySelector('.car')).bottom > '0px' && direction === 'down') {
            document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
          } else if (getComputedStyle(document.querySelector('.car')).bottom === '150px') {
            direction = 'down';
          } else if (getComputedStyle(document.querySelector('.car')).bottom <= '0px') {
            direction = 'up';
            clearInterval(jump);
            jumping = false;
          }
        }, 4);
      }
    }
  }
  if (event.code === 'Enter') {
    if (blasterEnabled) {
      shootBlaster();
    }
  }
});

window.addEventListener('click', event => {
  if (event.target.className === 'start-button') {
    document.querySelector('.start-modal').remove();
    document.querySelector('.instructions').style.opacity = '1';
    setTimeout(() => {
      document.querySelector('.instructions').style.opacity = '0';
    }, 5000);
    startGame();
  } else if (event.target.className === 'start-over') {
    gameOver = false;
    document.querySelector('.car').style.bottom = '0px';
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
    document.querySelector('#game-over-modal').className = 'hidden';
    document.querySelector('#blaster').className = 'hidden';
    score = 0;
    document.querySelector('.score').textContent = 0;
    document.querySelector('#new-hi-score').className = 'hidden';
    startGame();
  }
});

window.addEventListener('beforeunload', () => {
  if (hiScore) {
    localStorage.setItem('Hi-Score', JSON.stringify(hiScore));
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
  clearTimeout(blasterTimeout);
  energyBlastInAir = false;
  blasterEnabled = false;
  document.querySelector('#game-over-modal').className = 'game-over-modal';
  document.querySelector('.game-over-score').textContent = 'Score: ' + score;
  if (newHiScore) {
    const hiScoreJSON = JSON.stringify(hiScore);
    localStorage.setItem('Hi-Score', hiScoreJSON);
    document.querySelector('#new-hi-score').className = 'new-hi-score';
    newHiScore = false;
  }
}

gapFall = obstacle => {
  fall = setInterval(() => {

    const obstacleRect = obstacle.getBoundingClientRect();
    const wheelsRect = document.querySelector('.wheels').getBoundingClientRect();

    if (falling && wheelsRect.bottom < obstacleRect.bottom) {
      document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
    }
  }, 4);
}

grantPowerup = powerup => {
  if (powerup.includes('blaster')) {
    document.querySelector('.blaster').remove();
    document.querySelector('#blaster').className = 'car-blaster';
    blasterEnabled = true;
  }
}

shootBlaster = () => {
  if (!energyBlastInAir) {

    energyBlastInAir = true;

    const carBottom = document.querySelector('.car-bottom');
    const lowerCarRect = document.querySelector('.car-bottom').getBoundingClientRect();
    const $playerArea = document.querySelector('.player-area');

    const blaster = document.querySelector('#car-blaster');

    const $energyBlast = document.createElement('div');
    $energyBlast.className = 'energy-blast';

    $playerArea.appendChild($energyBlast);

    const energyBlast = document.querySelector('.energy-blast');

    energyBlast.style.top = Math.floor(lowerCarRect.top) + 'px';
    energyBlast.style.left = Math.floor(lowerCarRect.right) + 'px';

    blasterInterval = setInterval(() => {

      const energyBlastRect = document.querySelector('.energy-blast').getBoundingClientRect();

      if (parseInt(getComputedStyle(energyBlast).left.split('px')[0]) < window.innerWidth) {
        energyBlast.style.left = (parseInt(getComputedStyle(energyBlast).left.split('px')[0]) + 3) + 'px';
      } else {
        clearInterval(blasterInterval);
        energyBlast.remove();
        energyBlastInAir = false;
      }
    }, 4);
  }

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
      if (obstacle.className.includes('powerup') && (((rects[i].bottom >= obstacleRect.top) && (rects[i].bottom <= obstacleRect.bottom))
        || ((rects[i].top <= obstacleRect.bottom) && (rects[i].top >= obstacleRect.top)))
        && (rects[i].right >= obstacleRect.left) && (rects[i].left <= obstacleRect.right)) {
        grantPowerup(obstacle.className);
        break;
      } else if (!obstacle.className.includes('gap') && (((rects[i].bottom >= obstacleRect.top) && (rects[i].bottom <= obstacleRect.bottom))
        || ((rects[i].top <= obstacleRect.bottom) && (rects[i].top >= obstacleRect.top)))
        && (rects[i].right >= obstacleRect.left) && (rects[i].left <= obstacleRect.right)) {
          clearInterval(move);
          endGame();
          break;
      } else if (obstacle.className.includes('gap') &&
        (rects[0].left >= obstacleRect.left) &&
        (rects[0].right <= obstacleRect.right) &&
        (rects[0].bottom >= obstacleRect.top)) {
          if (rects[i].right >= obstacleRect.right || rects[i].bottom >= obstacleRect.bottom) {
            clearInterval(move);
            endGame();
            break;
          } else if (!falling) {
            falling = true;
            gapFall(obstacle);
          }
      }
    }
  }, 4);
}

spawnObstacle = () => {
  const $playerArea = document.querySelector('.player-area');
  const block = document.createElement('div');

  block.className = 'obstacle ' + spawnlist[Math.floor(Math.random() * spawnlist.length)];

  if (block.className.includes('powerup')) {
    const powerupCenter = document.createElement('h1');

    const type = block.className.split('obstacle ')[1].split(' powerup')[0];

    if (type === 'blaster') {
      powerupCenter.textContent = 'B';
    }

    powerupCenter.className = `type-${type}`;
    block.appendChild(powerupCenter);

    for (let i = 0; i < spawnlist.length; i++) {
      if (spawnlist[i] === block.className.split('obstacle ')[1]) {
        spawnlist.splice(i, 1);
      }
    }
  }

  $playerArea.appendChild(block);

  moveObstacle(block);
}

startGame = () => {

  if (falling) {
    clearInterval(fall);
    falling = false;
  }

  scoreInterval = setInterval(() => {
    score++;

    document.querySelector('.score').textContent = score;

    if (score > hiScore) {
      newHiScore = true;
      hiScore = score;
      document.querySelector('.hi-score').textContent = score;
    }
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
    spawnlist.push('medium-wide block');
  }, 20000)

  addMediumShapes = setTimeout(() => {
    spawnlist.push('tall block');
    spawnlist.push('tall-wide block');
  }, 40000)

  blasterTimeout = setTimeout(() => {
    spawnlist.push('blaster powerup');
  }, 5000);

  addHardShapes = setTimeout(() => {
    spawnlist.push('wide-floating block');
    spawnlist.push('low floating block');
    spawnlist.push('taller block');
  }, 60000)

}
