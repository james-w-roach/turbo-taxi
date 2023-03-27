let score = 0;
let hiScore = 0;
let blasterAmmo = 5;
let jumps = 5;

let newHiScore = false;
let gameOver = false;

let jumping = false;
let falling = false;

let jump;
let fall;
let fly;

let firstObstacleInterval;
let secondObstacleInterval;
let secondObstacleTimeout;

let addEasyShapes;
let addMediumShapes;
let addHardShapes

let scoreInterval;

let blasterInterval;
let blasterEnabled = false;
let blastCount = 0;

let doubleJumpEnabled = false;
let secondJump = false;

let turboModeEnabled = false;
let turboModeTimer;
let turboModeCounter = 10;

let respawnInterval;
const respawnTimers = {
  blaster: 20,
  "double-jump": 20,
  turbo: 40
}

let buildingInterval;

activePowerups = [];

let hiScores = [];

if (localStorage.getItem('Hi-Scores') && localStorage.getItem('Hi-Scores')[0]) {
  hiScores = JSON.parse(localStorage.getItem('Hi-Scores'));
}

if (hiScores[0]) {
  hiScore = hiScores[0];
  document.querySelector('.hi-score').textContent = hiScore;
}

const spawnList = ['block', 'low-wide block', 'floating block', 'gap'];

jumpCar = secondJumpPosition => {

  let jumpTarget = '150px';
  let fallSpeed = 1;

  if (secondJumpPosition) {
    secondJumpPosition = Math.floor(secondJumpPosition + 100);
    if (secondJumpPosition % 2) {
      secondJumpPosition++;
    }
    let carPosition = parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]);
    if (carPosition < 0 && carPosition % 2) {
      document.querySelector('.car').style.bottom = (carPosition - 1) + 'px';
    } else if (carPosition % 2) {
      document.querySelector('.car').style.bottom = (carPosition + 1) + 'px';
    }
    jumpTarget = secondJumpPosition + 'px';
    fallSpeed = 2;
  }

  let direction = 'up';
  jumping = true;
  jump = setInterval(() => {
    if (turboModeEnabled) {
      clearInterval(jump);
    }
    if (getComputedStyle(document.querySelector('.car')).bottom !== jumpTarget && direction === 'up') {
      document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) + 2) + 'px';
    } else if (getComputedStyle(document.querySelector('.car')).bottom > '0px' && direction === 'down') {
      document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - fallSpeed) + 'px';
    } else if (getComputedStyle(document.querySelector('.car')).bottom === jumpTarget) {
      direction = 'down';
    } else if (getComputedStyle(document.querySelector('.car')).bottom <= '0px') {
      direction = 'up';
      clearInterval(jump);
      jumping = false;
      if (secondJumpPosition) {
        secondJump = false;
      }
    }
  }, 4)
}

flyCar = () => {

  fly = setInterval(() => {

    const carTop = parseInt(getComputedStyle(document.querySelector('.car')).top.split('px')[0]);
    const carBottom = parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]);

    if (turboModeEnabled) {
      if (carTop > 0 && turboDirection === 'up') {
        document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) + 2) + 'px'
      } else if (carBottom > 0 && turboDirection === 'down') {
        document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
      }
    } else {
      if (carBottom > 0) {
        document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
      } else {
        clearInterval(fly);
        for (let i = 0; i < activePowerups.length; i++) {
          if (activePowerups[i] === 'turbo powerup') {
            activePowerups.splice(i, 1);
          }
        }
        respawnTimers.turbo = 40;
      }
    }
  }, 4);
}

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {

    const carBottom = parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0])

    if (!gameOver) {
      if (turboModeEnabled) {
        turboDirection = 'up';
      } else if (!jumping && !falling && carBottom === 0) {
        jumpCar();
      } else if (doubleJumpEnabled) {
        if (!secondJump) {
          secondJump = true;
          if (jumping) {
            clearInterval(jump);
          }
          if (falling) {
            falling = false;
            clearInterval(fall);
          }
          clearInterval(fly);
          jumpCar(parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]));
          jumps--;
          document.querySelector('.jumps').textContent = jumps;
          if (jumps === 0) {
            document.querySelector('#jump-counter').className = 'hidden';
            document.querySelector('.jumps').textContent = 5;
            jumps = 5;
            doubleJumpEnabled = false;
            for (let i = 0; i < activePowerups.length; i++) {
              if (activePowerups[i] === 'double-jump powerup') {
                activePowerups.splice(i, 1);
              }
            }
            respawnTimers["double-jump"] = 20;
          }
        }
      }
    }
  }
  if (event.code === 'Enter') {
    if (blasterEnabled) {
      shootBlaster();
    }
  }
});

window.addEventListener('keyup', event => {
  if (event.code === 'Space' && turboModeEnabled) {
    turboDirection = 'down';
  }
});

window.addEventListener('click', event => {
  if (event.target.className === 'start-button') {
    document.querySelector('.start-modal').remove();
    document.querySelector('.instructions').style.opacity = '1';
    setTimeout(() => {
      document.querySelector('.instructions').style.opacity = '0';
      startGame();
      setTimeout(() => {
        document.querySelector('.powerup-instructions').style.opacity = '1';
        setTimeout(() => {
          document.querySelector('.powerup-instructions').style.opacity = '0';
        }, 5000);
      }, 1000);
    }, 5000);
  } else if (event.target.className === 'start-over') {
    gameOver = false;

    document.querySelector('.car').style.bottom = '0px';
    document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());

    document.querySelector('#game-over-modal').className = 'hidden';
    document.querySelector('#car-blaster').className = 'car-blaster deactivated';
    document.querySelector('#ammo-counter').className = 'hidden';
    document.querySelector('#jump-counter').className = 'hidden';
    document.querySelector('#turbo-counter').className = 'hidden';
    document.querySelector('#blaster-help').className = 'hidden';
    document.querySelector('#turbo-help').className = 'hidden';
    document.querySelector('#new-hi-score').className = 'hidden';
    document.querySelector('#wheel-left').className = 'wheel left';
    document.querySelector('#wheel-right').className = 'wheel right';

    blasterAmmo = 5;
    jumps = 5;
    turboModeCounter = 10;
    score = 0;

    respawnTimers.blaster = 20;
    respawnTimers['double-jump'] = 20;
    respawnTimers.turbo = 40;

    document.querySelector('.ammo').textContent = 5;
    document.querySelector('.jumps').textContent = 5;
    document.querySelector('.score').textContent = 0;

    for (let i = 1; i <= blastCount; i++) {
      if (document.querySelector(`#blast${i}`)) {
        document.querySelector(`#blast${i}`).remove();
      }
    }
    blastCount = 0;

    animateBackground();

    startGame();
  } else if (event.target.className === 'scores-button') {
    document.querySelector('#start-modal').className = 'hidden';
    document.querySelector('#scores-modal').className = 'scores-modal';

    const $scoresList = document.querySelector('.scores-list');

    if (hiScores[0]) {
      hiScores.map((score, index) => {
        const $scoresListItem = document.createElement('li');
        $scoresListItem.className = 'scores-list-item';
        $scoresListItem.textContent = (index + 1) + '.   ' + score;
        $scoresList.appendChild($scoresListItem);
      });
    } else {
      const $scoresModal = document.querySelector('#scores-modal');
      const $noScores = document.createElement('h3');
      $noScores.className = 'no-scores-found';
      $noScores.textContent = 'NO HI-SCORES FOUND';
      $scoresModal.appendChild($noScores);
    }
  } else if (event.target.className === 'menu-button') {
    document.querySelector('#start-modal').className = 'start-modal';
    document.querySelector('#scores-modal').className = 'hidden';

    while (document.querySelector('.scores-list').children.length) {
      document.querySelector('.scores-list').children[0].remove();
    }

    if (document.querySelector('.no-scores-found')) {
      document.querySelector('.no-scores-found').remove();
    }
  }
});

window.addEventListener('beforeunload', () => {
  if (hiScores[0]) {
    localStorage.setItem('Hi-Scores', JSON.stringify(hiScores));
  }
});

endGame = () => {
  gameOver = true;
  jumping = false;
  const obstacleOverflow = spawnList.length - 4;
  if (obstacleOverflow) {
    spawnList.splice((spawnList.length - obstacleOverflow), obstacleOverflow);
  }
  activePowerups = [];
  clearInterval(jump);
  clearInterval(fly);
  clearInterval(firstObstacleInterval);
  clearInterval(secondObstacleInterval);
  clearInterval(scoreInterval);
  clearTimeout(secondObstacleTimeout);
  clearTimeout(addEasyShapes);
  clearTimeout(addMediumShapes);
  clearTimeout(addHardShapes);
  clearInterval(blasterInterval);
  clearInterval(turboModeTimer);
  clearInterval(respawnInterval);
  clearInterval(buildingInterval);
  blasterEnabled = false;
  doubleJumpEnabled = false;
  turboModeEnabled = false;
  secondJump = false;
  document.querySelector('#game-over-modal').className = 'game-over-modal';
  document.querySelector('.game-over-score').textContent = 'Score: ' + score;

  if (newHiScore) {
    hiScores.unshift(score);
    if (hiScores.length > 10) {
      hiScores.pop();
    }
    hiScore = hiScores[0];
    document.querySelector('#new-hi-score').className = 'new-hi-score';
    newHiScore = false;
  } else {
    for (let i = 0; i < hiScores.length; i++) {
      if (score >= hiScores[i]) {
        hiScores.splice(i, 0, score);
        if (hiScores.length > 10) {
          hiScores.pop();
        }
        break;
      }
      if (i === hiScores.length - 1 && hiScores.length < 10) {
        hiScores.push(score);
        break;
      }
    }
  }
  const hiScoresJSON = JSON.stringify(hiScores);
  localStorage.setItem('Hi-Scores', hiScoresJSON);
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
  const $car = document.querySelector('.car');

  if (powerup.includes('blaster')) {
    const blasterText = document.querySelector('#blaster-text');
    blasterText.className = 'powerup-text activated';

    setTimeout(() => {
      blasterText.className = 'powerup-text';
    }, 1000);
    document.querySelector('#car-blaster').className = 'car-blaster';
    document.querySelector('#ammo-counter').className = 'ammo-counter';
    document.querySelector('#blaster-help').className = 'blaster-help';
    blasterEnabled = true;
  } else if (powerup.includes('double-jump')) {
    const doubleJumpText = document.querySelector('#double-jump-text');
    doubleJumpText.className = 'powerup-text activated';

    setTimeout(() => {
      doubleJumpText.className = 'powerup-text';
    }, 1000);
    document.querySelector('#jump-counter').className = 'jump-counter';
    doubleJumpEnabled = true;
  } else if (powerup.includes('turbo')) {
    const turboText = document.querySelector('#turbo-text');
    turboText.className = 'powerup-text activated';

    setTimeout(() => {
      turboText.className = 'powerup-text';
    }, 1000);

    document.querySelector('#wheel-left').className = 'wheel left flying';
    document.querySelector('#wheel-right').className = 'wheel right flying';

    turboModeEnabled = true;
    document.querySelector('#turbo-counter').className = 'turbo-counter';
    document.querySelector('#turbo-help').className = 'turbo-help';
    turboDirection = 'down';
    flyCar();
    turboModeTimer = setInterval(() => {
      turboModeCounter--;
      document.querySelector('.turbo-seconds').textContent = turboModeCounter;
      if (turboModeCounter === 0) {
        turboModeEnabled = false;
        turboModeCounter = 10;
        document.querySelector('#turbo-counter').className = 'hidden';
        document.querySelector('#turbo-help').className = 'hidden';
        document.querySelector('.turbo-seconds').textContent = 10;
        document.querySelector('#wheel-left').className = 'wheel left';
        document.querySelector('#wheel-right').className = 'wheel right';
        clearInterval(turboModeTimer);
      }
    }, 1000);
  }

  activePowerups.push(powerup.split('obstacle ')[1]);
}

shootBlaster = () => {
  if (blasterAmmo !== 0) {

    if (blastCount < 5) {
      blastCount++
    }

    const lowerCarRect = document.querySelector('.car-bottom').getBoundingClientRect();
    const $playerArea = document.querySelector('.player-area');

    const blaster = document.querySelector('#car-blaster');

    const $energyBlast = document.createElement('div');
    $energyBlast.className = 'energy-blast';
    $energyBlast.id = `blast${blastCount}`;

    $playerArea.appendChild($energyBlast);

    const energyBlast = document.querySelector(`#blast${blastCount}`);

    energyBlast.style.top = Math.floor(lowerCarRect.top) + 4 + 'px';
    energyBlast.style.left = Math.floor(lowerCarRect.right) + 7 + 'px';

    blasterAmmo--;
    document.querySelector('.ammo').textContent = blasterAmmo;

    moveBlast = energyBlast => {
      if (gameOver) {
        clearInterval(blasterInterval);
      } else if (parseInt(getComputedStyle(energyBlast).left.split('px')[0]) < window.innerWidth) {
        energyBlast.style.left = (parseInt(getComputedStyle(energyBlast).left.split('px')[0]) + 3) + 'px';
      } else {
        energyBlast.remove();
        if (blasterAmmo === 0 && blastCount === 5 && !document.querySelector('#blast5')) {
          clearInterval(blasterInterval);
          blasterEnabled = false;
          document.querySelector('#car-blaster').className = 'car-blaster deactivated';
          document.querySelector('#ammo-counter').className = 'hidden';
          document.querySelector('#blaster-help').className = 'hidden';
          blasterAmmo = 5;
          document.querySelector('.ammo').textContent = 5;
          for (let i = 0; i < activePowerups.length; i++) {
            if (activePowerups[i] === 'blaster powerup') {
              activePowerups.splice(i, 1);
            }
          }
          respawnTimers.blaster = 20;
        }
      }
    }

    blasterInterval = setInterval(() => {
      moveBlast(energyBlast)
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
      if (turboModeEnabled) {
        obstacle.style.left = (parseInt(getComputedStyle(obstacle).left.split('px')[0]) - 3) + 'px';
      } else {
        obstacle.style.left = (parseInt(getComputedStyle(obstacle).left.split('px')[0]) - 2) + 'px';
      }
    } else {
      // each obstacle is removed after leaving the player area
      if (obstacle.className.includes('powerup')) {
        const powerupName = obstacle.className.split(' powerup')[0];
        powerupTime = powerupName === 'turbo'
          ? 40
          : 20;
        respawnTimers[powerupName] = powerupTime;
      }
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
        obstacle.remove();
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
          if (!turboModeEnabled) {
            if (rects[i].right >= obstacleRect.right || rects[i].bottom >= obstacleRect.bottom) {
              clearInterval(move);
              endGame();
              break;
            } else if (!falling && !jumping && !secondJump) {
              falling = true;
              gapFall(obstacle);
            }
          }
      }
    }

    if (blasterEnabled) {

      for (let i = 1; i <= blastCount; i++) {
        const blast = `#blast${i}`;

        if (document.querySelector(blast)) {

          const energyBlast = document.querySelector(blast);
          const energyBlastRect = document.querySelector(blast).getBoundingClientRect();

          if (!obstacle.className.includes('powerup') &&
            ((energyBlastRect.bottom >= obstacleRect.top && energyBlastRect.bottom <= obstacleRect.bottom)
              || (energyBlastRect.top <= obstacleRect.bottom && energyBlastRect.top >= obstacleRect.top))
            && (energyBlastRect.right >= obstacleRect.left) && (energyBlastRect.left <= obstacleRect.right)) {
              obstacle.remove()
              energyBlast.remove();
          }
        }
      }
    }
  }, 4);
}

spawnObstacle = () => {
  const $playerArea = document.querySelector('.player-area');
  const block = document.createElement('div');

  block.className = 'obstacle ' + spawnList[Math.floor(Math.random() * spawnList.length)];

  if (block.className.includes('powerup')) {

    const powerupCenter = document.createElement('h1');

    const type = block.className.split('obstacle ')[1].split(' powerup')[0];

    if (type === 'blaster') {
      powerupCenter.textContent = 'B';
    } else if (type === 'double-jump') {
      powerupCenter.textContent = 'D';
    } else if (type === 'turbo') {
      powerupCenter.textContent = 'T';
    }

    powerupCenter.className = `type-${type}`;
    block.appendChild(powerupCenter);

    for (let i = 0; i < spawnList.length; i++) {
      if (spawnList[i] === block.className.split('obstacle ')[1]) {
        spawnList.splice(i, 1);
      }
    }
  }

  $playerArea.appendChild(block);

  moveObstacle(block);
}

animateBackground = () => {
  const $buildingsContainer = document.querySelector('.buildings-container');

  const buildings = ['shorter', 'short', 'regular', 'large', 'larger', 'skyscraper'];

  addBuilding = () => {
    const building = document.createElement('div');
    building.className = 'building ' + buildings[Math.floor(Math.random() * buildings.length)];
    $buildingsContainer.appendChild(building);
  }

  buildingInterval = setInterval(() => {
    if (!$buildingsContainer.children[0]) {
      addBuilding();
    } else {
      for (let i = 0; i < $buildingsContainer.children.length; i++) {
        $buildingsContainer.children[i].style.left = (parseInt(getComputedStyle($buildingsContainer.children[i]).left.split('px')[0]) - 1) + 'px';
        if (i === ($buildingsContainer.children.length - 1) && parseInt(getComputedStyle($buildingsContainer.children[i]).left.split('px')[0]) === (window.innerWidth - 100)) {
          addBuilding();
        } else if ($buildingsContainer.children[i].style.left === '-100px') {
          $buildingsContainer.children[i].remove();
        }
      }
    }
  }, 4);
}

animateBackground();

startGame = () => {

  if (falling) {
    clearInterval(fall);
    falling = false;
  }

  scoreInterval = setInterval(() => {
    if (turboModeEnabled) {
      score = score + 2;
    } else {
      score++;
    }

    document.querySelector('.score').textContent = score;

    if (score > hiScore) {
      newHiScore = true;
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

  // more shapes are added at different points in the game to increase difficulty

  addEasyShapes = setTimeout(() => {
    spawnList.push('wide gap');
    spawnList.push('medium-wide block');
  }, 20000)

  addMediumShapes = setTimeout(() => {
    spawnList.push('tall block');
    spawnList.push('tall-wide block');
    spawnList.push('wider gap');
  }, 40000)

  addHardShapes = setTimeout(() => {
    spawnList.push('wide-floating block');
    spawnList.push('mid floating block');
    spawnList.push('taller block');
  }, 60000)

  respawnInterval = setInterval(() => {
    for(let key in respawnTimers) {
      if (respawnTimers[key] === 0 && !spawnList.includes(key + ' powerup') && !activePowerups.includes(key + ' powerup') && !document.querySelector(`.obstacle.${key}.powerup`)) {
        spawnList.push(key + ' powerup');
      } else if (respawnTimers[key] > 0) {
        respawnTimers[key]--;
      }
    }
  }, 1000);
}
