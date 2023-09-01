var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.addEventListener("keydown", function(e){get_input(e)});
canvas.addEventListener("keyup", function(e){get_input(e)});
canvas.focus();

// utility classes
class Dimension
{
  constructor(w, h)
  {
    this.w = w;
    this.h = h;
  }
}

class Position
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }
}

//CONSTANTS
const PADDLE_W = 20;
const PADDLE_H = 60;
const BALL_SZ = 10;
const GAP = 10;
const BALL_START = new Position((canvas.width / 2) - (BALL_SZ/2), (canvas.height / 2) - (BALL_SZ/2));
const PADDLE_L_START = (canvas.width / 2) - PADDLE_H / 2;
const PADDLE_R_START = (canvas.width / 2) - PADDLE_H / 2;
const FONT_SZ = 36;
const PADDLE_SEG = 3;
const PADDLE_SEG_SZ = PADDLE_H / PADDLE_SEG;

// class definitions
class Asset
{
  constructor(x, y, w, h, color)
  {
    this.position = new Position(x, y);
    this.size = new Dimension(w, h);
    this.color = color;
    this.is_moving_up = false;
    this.is_moving_down = false;
  }
}

class Game
{
  constructor(ball_speed, paddle_speed)
  {
    this.ball_speed = ball_speed;
    this.paddle_speed = paddle_speed;
    this.ball_speed_y = 0;
    this.ball_speed_y_arr = [-3, 0, 3];
    this.state = "stop";
    this.p1_score = 0;
    this.p2_score = 0;
  }
}
// game asset definitions
var assets = [];
var paddle_l = new Asset(GAP, (canvas.width / 2) - PADDLE_H / 2, PADDLE_W, PADDLE_H, "white");
paddle_l_segments = [];
var paddle_r = new Asset(canvas.width - (PADDLE_W + GAP), (canvas.width / 2) - PADDLE_H / 2, PADDLE_W, PADDLE_H, "white");
paddle_r_segments = [];
var ball = new Asset(BALL_START.x, BALL_START.y, BALL_SZ, BALL_SZ, "white");

assets.push(paddle_l);
assets.push(paddle_r);
assets.push(ball);

var game = new Game(5, 10);

// game physics
function physics()
{
  if(game.state == "run")
  {
    // ball movement
    ball.position.x += game.ball_speed;
    ball.position.y += game.ball_speed_y;

    // paddle movement
    if(paddle_l.is_moving_up)
    {
      paddle_l.position.y -= game.paddle_speed;
    }else if(paddle_l.is_moving_down)
    {
      paddle_l.position.y += game.paddle_speed;
    }
    if(paddle_r.is_moving_up)
    {
      paddle_r.position.y -= game.paddle_speed;
    }else if(paddle_r.is_moving_down)
    {
      paddle_r.position.y += game.paddle_speed;
    }

    // paddle bounds
    if(paddle_l.position.y < 0)
    {
      paddle_l.position.y = 0;
    }else if(paddle_l.position.y + PADDLE_H > canvas.height)
    {
      paddle_l.position.y = canvas.height - (PADDLE_H + 1);
    }

    if(paddle_r.position.y < 0)
    {
      paddle_r.position.y = 0;
    }else if(paddle_r.position.y + PADDLE_H > canvas.height)
    {
      paddle_r.position.y = canvas.height - (PADDLE_H + 1);
    }
  }
}

// collisions
function collisions()
{
  get_segments();
  check_edge();
  check_paddles();
}

function get_segments()
{
  paddle_l_segments = [];
  paddle_r_segments = [];
  let multiplier = PADDLE_H / PADDLE_SEG;
  for(let i = 0; i < PADDLE_SEG; i++)
  {
    paddle_l_segments.push(paddle_l.position.y + (i * multiplier));
    //console.log(paddle_l_segments[i]);
    paddle_r_segments.push(paddle_r.position.y + (i * multiplier));
    //console.log(paddle_r_segments[i]);
  }
}

function check_paddles()
{
  if(game.ball_speed > 0)
  {
    if(ball.position.x + BALL_SZ >= paddle_r.position.x &&
    ball.position.y + BALL_SZ > paddle_r.position.y &&
    ball.position.y < paddle_r.position.y + PADDLE_H)
    {
      game.ball_speed = -game.ball_speed;
      for(let seg = 0; seg <= paddle_r_segments.length; seg++)
      {
        if(ball.position.y + BALL_SZ >= paddle_r_segments[seg] &&
        ball.position.y < paddle_r_segments[seg] + PADDLE_SEG_SZ)
        {
          game.ball_speed_y = game.ball_speed_y_arr[seg];
          break;
        }
      }
    }
  }else{
    if(ball.position.x <= paddle_l.position.x + PADDLE_W &&
    ball.position.y + BALL_SZ > paddle_l.position.y &&
    ball.position.y < paddle_l.position.y + PADDLE_H)
    {
      game.ball_speed = -game.ball_speed;
      for(let seg = 0; seg <= paddle_l_segments.length; seg++)
      {
        if(ball.position.y >= paddle_l_segments[seg] &&
        ball.position.y < paddle_l_segments[seg] + PADDLE_SEG_SZ)
        {
          game.ball_speed_y = game.ball_speed_y_arr[seg];
          break;
        }
      }
    }
  }
}

function check_edge()
{
  if((ball.position.x) > paddle_r.position.x)
  {
    game.state = "score p1";
  }else if(ball.position.x < paddle_l.position.x + PADDLE_W)
  {
    game.state = "score p2";
  }

  if(ball.position.y + BALL_SZ >= canvas.height ||
  ball.position.y <= 0 )
  {
    game.ball_speed_y = -game.ball_speed_y;
  }
}

function get_input(event)
{
  if(event.type == "keydown")
  {
    switch(event.key)
    {
      case "ArrowUp":
        paddle_r.is_moving_up = true;
        break;
      case "ArrowDown":
        paddle_r.is_moving_down = true;
        break;
      case "w":
        paddle_l.is_moving_up = true;
        break;
      case "s":
        paddle_l.is_moving_down = true;
        break;
    }
  }
  if(event.type == "keyup")
  {
    switch(event.key)
    {
      case "ArrowUp":
        paddle_r.is_moving_up = false;
        break;
      case "ArrowDown":
        paddle_r.is_moving_down = false;
        break;
      case "w":
        paddle_l.is_moving_up = false;
        break;
      case "s":
        paddle_l.is_moving_down = false;
        break;
    }
  }
  if(event.type == "keydown")
  {
    // console.log(event.key);
    if(event.key == " " && game.state == "hold")
    {
      game.state = "run";
    }
  }
}

function update_score()
{
  if(game.state == "score p1")
  {
    game.p1_score++;
  }else if(game.state == "score p2")
  {
    game.p2_score++;
  }
}

// main drawing function. draws everything to screen
function draw_game()
{
  // draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0,0, canvas.width, canvas.height);

  // center line
  ctx.strokeStyle = "purple";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // score board
  ctx.font = FONT_SZ + "px Arial";
  ctx.fillStyle = "purple";
  ctx.fillText(game.p1_score, canvas.width / 4, canvas.height / 2);
  ctx.fillText(game.p2_score, ((canvas.width / 4) * 3) - FONT_SZ / 2, canvas.height / 2);

  // draw assets
  for(let asset of assets)
  {
    ctx.fillStyle = asset.color;
    ctx.fillRect(asset.position.x, asset.position.y, asset.size.w, asset.size.h);
  }
}

// start game
function init_game()
{
  let rand = Math.floor(Math.random() * 100);
  if(rand % 2 == 0)
  {
    game.ball_speed = -game.ball_speed;
  }

  ball.position.x = BALL_START.x;
  ball.position.y = BALL_START.y;
  game.ball_speed_y = 0;

  paddle_l.position.y = PADDLE_L_START;
  paddle_r.position.y = PADDLE_R_START;
  game.state = "hold";
}

init_game();

//game loop
function game_loop()
{
  physics();
  collisions();
  update_score();
  draw_game();
  if(game.state.includes("score"))
  {
    init_game();
  }
}

setInterval(game_loop, 20)
