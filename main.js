let jumping = false;

const spawnlist = ['block', 'long block', 'floating block', 'gap'];

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    let direction = 'up';
    if (!jumping) {
      jumping = true;
      const jump = setInterval(() => {
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
});

moveObject = object => {
  const move = setInterval(() => {
    if (getComputedStyle(object).left !== '-300px') {
      object.style.left = (parseInt(getComputedStyle(object).left.split('px')[0]) - 2) + 'px';
    } else {
      document.querySelector('.player-area').removeChild(object);
    }
  }, 4);
}

spawnObject = () => {
  const $playerArea = document.querySelector('.player-area');
  const block = document.createElement('div');

  block.className = spawnlist[Math.floor(Math.random() * spawnlist.length)];

  console.log(spawnlist, block.className);

  $playerArea.appendChild(block);

  moveObject(block);
}

setInterval(spawnObject, 2500);

setTimeout(() => {
  setInterval(spawnObject, 2500);
}, 11250)

setTimeout(() => {
  spawnlist.push('gap wide');
  console.log(spawnlist);
}, 25000)
