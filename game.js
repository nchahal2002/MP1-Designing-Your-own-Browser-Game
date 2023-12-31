const poolTable = document.getElementById('poolTable');
const balls = [];
const frictionFactor = 0.98; // Adjust this value to control the friction effect
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const stick = {
  x: canvas.width / 2 + (poolTable.offsetWidth - canvas.width) / 2,
  y: canvas.height / 2 + (poolTable.offsetHeight - canvas.height) / 2,
  length: 100,
  angle: 0
};

// Adjust canvas dimensions to match the poolTable
canvas.width = poolTable.offsetWidth;
canvas.height = poolTable.offsetHeight;

// Function to create a hole
function createHole(x, y) {
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.style.left = x + 'px';
  hole.style.top = y + 'px';
  poolTable.appendChild(hole);
}

// Create holes
createHole(0, 0);  // Adjust positions accordingly
createHole(590, 0);
createHole(0, 280);
createHole(590, 280);
createHole(295, 0);
createHole(295, 280);

function drawStick() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the stick
  ctx.beginPath();
  ctx.moveTo(stick.x, stick.y);
  const endX = stick.x + stick.length * Math.cos(stick.angle);
  const endY = stick.y + stick.length * Math.sin(stick.angle);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}


function drawTable() {
  // Clear the canvas and draw table components
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Balls
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw stick
  drawStick();
}

function handleKeyDown(event) {
  if (event.key === 'a') {
    stick.angle -= 0.1;
  } else if (event.key === 's') {
    stick.angle += 0.1;
  } else if (event.key === 'ArrowUp') {
    stick.y -= 5;
  } else if (event.key === 'ArrowDown') {
    stick.y += 5;
  } else if (event.key === 'ArrowLeft') {
    stick.x -= 5;
  } else if (event.key === 'ArrowRight') {
    stick.x += 5;
  }

  // Check for collision with balls
  balls.forEach(ball => {
    const dx = ball.x - stick.x;
    const dy = ball.y - stick.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.radius + 8) { // Adjust the value accordingly
      // Handle collision response here
      // For simplicity, we'll just reverse the direction of the ball
      const angleToBall = Math.atan2(dy, dx);
      const stickForce = 3; // Adjust this value to control the force of impact
      ball.dx = Math.cos(angleToBall) * stickForce; 
      ball.dy = Math.sin(angleToBall) * stickForce; // Fix here: change 'stick' to 'stickForce'
    }
  });

  drawStick();
}

let score = 0;

function updateScore() {
  score++;
  const scoreElement = document.getElementById('score');
  scoreElement.innerText = `Score: ${score}`;
}

function checkHoleCollision(ball) {
  const holes = document.getElementsByClassName('hole');

  for (let i = 0; i < holes.length; i++) {
    const hole = holes[i];
    const holeRect = hole.getBoundingClientRect();

    if (
      ball.x > holeRect.left &&
      ball.x < holeRect.right &&
      ball.y > holeRect.top &&
      ball.y < holeRect.bottom
    ) {
      if (hole.style.backgroundColor === 'black') {
        // Increase the score
        updateScore();

        // Remove the ball from the array
        balls.splice(balls.indexOf(ball), 1);

        // Remove the ball element from the DOM
        ball.element.remove();

        return true;
      }
    }  
  }

  return false;
}


// This function defines moving balls in the x and y positions
function moveBalls() {
  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check if the ball is in a hole
    if (checkHoleCollision(ball)) {
      // update the score here
      updateScore();
      return; // Skip further movement for this ball
    }

    // Apply friction to slow down the ball
    ball.dx *= frictionFactor;
    ball.dy *= frictionFactor;

    if (ball.x < 0 || ball.x + 2 * ball.radius >= poolTable.offsetWidth) {
      ball.dx = -ball.dx;
    }

    if (ball.y < 0 || ball.y + 2 * ball.radius >= poolTable.offsetHeight) {
      ball.dy = -ball.dy;
    }

    ball.element.style.left = ball.x + 'px';
    ball.element.style.top = ball.y + 'px';
  });

  // Check for collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const ball1 = balls[i];
      const ball2 = balls[j];
      const dx = ball2.x - ball1.x;
      const dy = ball2.y - ball1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball1.radius + ball2.radius) {
        // Balls have collided, update their velocities for a simple bounce effect
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities
        const vx1 = ball1.dx * cos + ball1.dy * sin;
        const vy1 = ball1.dy * cos - ball1.dx * sin;
        const vx2 = ball2.dx * cos + ball2.dy * sin;
        const vy2 = ball2.dy * cos - ball2.dx * sin;

        // Swap velocities
        ball1.dx = vx2;
        ball1.dy = vy1;
        ball2.dx = vx1;
        ball2.dy = vy2;

        // Move the balls slightly away to avoid continuous collision
        const overlap = ball1.radius + ball2.radius - distance + 1;
        ball1.x -= overlap * cos;
        ball1.y -= overlap * sin;
        ball2.x += overlap * cos;
        ball2.y += overlap * sin;
      }
    }

    drawTable();
  }

  requestAnimationFrame(moveBalls);
}

moveBalls();




document.addEventListener('keydown', handleKeyDown, event => {
  console.log('Key Pressed:', event.key);
});


const ballColors = ['white', 'red', 'yellow', 'blue', 'purple', 'orange', 'darkgreen', 'black', 'maroon', 'brown', 'magenta'];

// Initialize an array to store ball positions
let ballPositions = [];

// Function to store ball positions in local storage
function saveBallPositions() {
  localStorage.setItem('ballPositions', JSON.stringify(ballPositions));
}

// Function to retrieve ball positions from local storage
function loadBallPositions() {
  const savedPositions = localStorage.getItem('ballPositions');
  if (savedPositions) {
    ballPositions = JSON.parse(savedPositions);
    balls.forEach((ball, index) => {
      ball.x = ballPositions[index].x;
      ball.y = ballPositions[index].y;
      ball.element.style.left = ball.x + 'px';
      ball.element.style.left = ball.y + 'px';
    });
  }
}

// Call the function to load ball positions
loadBallPositions();

function createBall(x, y, color) {
  const ball = document.createElement('div');
  ball.className = 'ball';
  ball.style.left = x + 'px';
  ball.style.top = y + 'px';
  ball.style.backgroundColor = color;
  poolTable.appendChild(ball);
  balls.push({ element: ball, x, y, dx: 1, dy: 1, radius: 10 });

  // Arrange balls in a triangle formation
  const triangleBase = 5 * ball.radius; // Adjust as needed for desired triangle size
  const xOffset = balls.length % 3 * triangleBase; // Offset based on the number of balls already created

  if (xOffset < 2 * triangleBase) {
    ball.style.left = (200 + xOffset) + 'px'; // Adjust the initial position of the triangle
    ball.style.top = (200 + (xOfsset / 2) - (3 * triangleBase)) + 'px';
  }
}

// Create balls with different colors in a triangle formation
createBall(185, 95, ballColors[0]);   // White
createBall(315, 95, ballColors[1]);  // Red
createBall(340, 80, ballColors[2]);  // Yellow
createBall(340, 110, ballColors[3]);  // Blue
createBall(365, 95, ballColors[4]);  // Purple
createBall(365, 65, ballColors[5]);   // Orange
createBall(365, 125, ballColors[6]);  // Dark Green
createBall(390, 110, ballColors[7]);  // Black
createBall(390, 50, ballColors[8]);   // Maroon
createBall(390, 140, ballColors[9]);  // Brown
createBall(390, 80, ballColors[10]); // Magenta
