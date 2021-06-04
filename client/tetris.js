const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');
const currentScore = document.querySelector('#current-score');
const currentUser = document.querySelector('#current-user');
const leaderboard = document.querySelector('#leaderboard');
const userList = leaderboard.querySelector('.user-list');
let bestScore = document.querySelector('#best-score');
const btnLogout = document.querySelector('#logout');
let userInfo;

const ROW = 20;
const COL = (COLUMN = 10);
const SQ = (squareSize = 30);
const VACANT = '#f4f5f8';

const getBestScore = async id => {
	const res = await fetch(`http://localhost:4000/api/users/${id}`);
	const data = await res.json();
	return data.BestScore;
};

const setBestScore = async (id, score) => {
	const res = await fetch(`http://localhost:4000/api/users/${id}/set-score`, {
		method: 'PUT',
		body: JSON.stringify({ id, score }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

const loadLeaderboard = async () => {
	const res = await fetch('http://localhost:4000/api/leaderboard');
	const data = await res.json();

	userList.innerHTML = '';

	data.forEach((item, idx) => {
		userList.innerHTML += `
            <li class="user-item">
                <span>${idx + 1}. ${item.Username}</span>
                <span>${item.BestScore}</span>
            </li>
        `;
	});
};

const loadUserInfo = async () => {
	if (!localStorage.getItem('current-user')) {
		return (location.pathname = '/client/login.html');
	}

	userInfo = JSON.parse(localStorage.getItem('current-user'));
	const { userId, username } = userInfo;

	bestScore.textContent = await getBestScore(userId);
	currentUser.textContent = username;
};

const showModal = () => {
	const modal = document.createElement('div');
	const h2 = document.createElement('h2');
	const btn = document.createElement('button');

	h2.textContent = 'Game over!';
	btn.textContent = 'Try again';

	modal.id = 'modal';
	btn.id = 'restart';
	btn.addEventListener('click', () => {
		location.reload();
	});

	modal.appendChild(h2);
	modal.appendChild(btn);
	document.body.appendChild(modal);
};

window.addEventListener('load', loadLeaderboard);
window.addEventListener('load', loadUserInfo);

function logout() {
	if (localStorage.getItem('current-user')) {
		localStorage.removeItem('current-user');
		location.pathname = '/client/login.html';
	}
}

btnLogout.addEventListener('click', logout);

function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
	ctx.strokeStyle = '#090909';
	ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

let board = [];
for (r = 0; r < ROW; r++) {
	board[r] = [];
	for (c = 0; c < COL; c++) {
		board[r][c] = VACANT;
	}
}

function drawBoard() {
	for (r = 0; r < ROW; r++) {
		for (c = 0; c < COL; c++) {
			drawSquare(c, r, board[r][c]);
		}
	}
}

drawBoard();

const PIECES = [
	[Z, '#F00000'],
	[S, '#00F000'],
	[T, '#A000F0'],
	[O, '#F0F000'],
	[L, '#F0A000'],
	[I, '#00F0F0'],
	[J, '#0000F0'],
];

function randomPiece() {
	let r = (randomN = Math.floor(Math.random() * PIECES.length));
	return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

function Piece(tetromino, color) {
	this.tetromino = tetromino;
	this.color = color;
	this.tetrominoN = 0;
	this.activeTetromino = this.tetromino[this.tetrominoN];
	this.x = 3;
	this.y = -2;
}

Piece.prototype.fill = function (color) {
	for (r = 0; r < this.activeTetromino.length; r++) {
		for (c = 0; c < this.activeTetromino.length; c++) {
			if (this.activeTetromino[r][c]) {
				drawSquare(this.x + c, this.y + r, color);
			}
		}
	}
};

Piece.prototype.draw = function () {
	this.fill(this.color);
};

Piece.prototype.unDraw = function () {
	this.fill(VACANT);
};

Piece.prototype.moveDown = function () {
	if (!this.collision(0, 1, this.activeTetromino)) {
		this.unDraw();
		this.y++;
		this.draw();
	} else {
		this.lock();
		p = randomPiece();
	}
};

Piece.prototype.moveRight = function () {
	if (!this.collision(1, 0, this.activeTetromino)) {
		this.unDraw();
		this.x++;
		this.draw();
	}
};

Piece.prototype.moveLeft = function () {
	if (!this.collision(-1, 0, this.activeTetromino)) {
		this.unDraw();
		this.x--;
		this.draw();
	}
};

Piece.prototype.rotate = function () {
	let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
	let kick = 0;

	if (this.collision(0, 0, nextPattern)) {
		if (this.x > COL / 2) {
			kick = -1;
		} else {
			kick = 1;
		}
	}

	if (!this.collision(kick, 0, nextPattern)) {
		this.unDraw();
		this.x += kick;
		this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
		this.activeTetromino = this.tetromino[this.tetrominoN];
		this.draw();
	}
};

let score = 0;

Piece.prototype.lock = async function () {
	for (r = 0; r < this.activeTetromino.length; r++) {
		for (c = 0; c < this.activeTetromino.length; c++) {
			if (!this.activeTetromino[r][c]) {
				continue;
			}
			if (this.y + r < 0) {
				if (!gameOver) {
					gameOver = true;

					if (+currentScore.textContent > +bestScore.textContent) {
						bestScore.textContent = currentScore.textContent;
						await setBestScore(userInfo.userId, +bestScore.textContent);
						await loadLeaderboard();
					}

					showModal();
				}

				break;
			}
			board[this.y + r][this.x + c] = this.color;
		}
	}
	for (r = 0; r < ROW; r++) {
		let isRowFull = true;
		for (c = 0; c < COL; c++) {
			isRowFull = isRowFull && board[r][c] != VACANT;
		}
		if (isRowFull) {
			for (y = r; y > 1; y--) {
				for (c = 0; c < COL; c++) {
					board[y][c] = board[y - 1][c];
				}
			}
			for (c = 0; c < COL; c++) {
				board[0][c] = VACANT;
			}
			score += 100;
		}
	}
	drawBoard();
	currentScore.innerHTML = score;
};

Piece.prototype.collision = function (x, y, piece) {
	for (r = 0; r < piece.length; r++) {
		for (c = 0; c < piece.length; c++) {
			if (!piece[r][c]) {
				continue;
			}
			let newX = this.x + c + x;
			let newY = this.y + r + y;

			if (newX < 0 || newX >= COL || newY >= ROW) {
				return true;
			}
			if (newY < 0) {
				continue;
			}
			if (board[newY][newX] != VACANT) {
				return true;
			}
		}
	}
	return false;
};

document.addEventListener('keydown', CONTROL);

function CONTROL(event) {
	if (event.keyCode == 37) {
		p.moveLeft();
		dropStart = Date.now();
	} else if (event.keyCode == 38) {
		p.rotate();
		dropStart = Date.now();
	} else if (event.keyCode == 39) {
		p.moveRight();
		dropStart = Date.now();
	} else if (event.keyCode == 40) {
		p.moveDown();
	}
}

let dropStart = Date.now();
let gameOver = false;
function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	if (delta > 500) {
		p.moveDown();
		dropStart = Date.now();
	}
	if (!gameOver) {
		requestAnimationFrame(drop);
	}
}

drop();
