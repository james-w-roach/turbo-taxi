let jumping = false;

window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    let direction = 'up';
    if (!jumping) {
      jumping = true;
      const jump = setInterval(() => {
        if (getComputedStyle(document.querySelector('.car')).bottom !== '100px' && direction === 'up') {
          document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) + 1) + 'px';
        } else if (getComputedStyle(document.querySelector('.car')).bottom !== '0px' && direction === 'down') {
          document.querySelector('.car').style.bottom = (parseInt(getComputedStyle(document.querySelector('.car')).bottom.split('px')[0]) - 1) + 'px';
        } else if (getComputedStyle(document.querySelector('.car')).bottom === '100px') {
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
