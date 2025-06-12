       // Chess piece Unicode symbols
        const pieces = {
            'white': {
                'king': '♔', 'queen': '♕', 'rook': '♖',
                'bishop': '♗', 'knight': '♘', 'pawn': '♙'
            },
            'black': {
                'king': '♚', 'queen': '♛', 'rook': '♜',
                'bishop': '♝', 'knight': '♞', 'pawn': '♟'
            }
        };

        // Initial board setup
        let gameBoard = [
            ['♜','♞','♝','♛','♚','♝','♞','♜'],
            ['♟','♟','♟','♟','♟','♟','♟','♟'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['♙','♙','♙','♙','♙','♙','♙','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖']
        ];

        let currentPlayer = 'white';
        let selectedSquare = null;
        let moveCount = 1;
        let gameHistory = [];
        let showHints = true;
        let gameState = 'playing'; // 'playing', 'check', 'checkmate', 'stalemate'
        let lastMove = null;
        let soundEnabled = true;



        // Initialize the game
        function initGame() {
            createBoard();
            updateDisplay();
        }

        function createBoard() {
            const board = document.getElementById('chessboard');
            board.innerHTML = '';

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const square = document.createElement('div');
                    square.classList.add('square');
                    square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                    square.dataset.row = row;
                    square.dataset.col = col;
                    
                    if (gameBoard[row][col]) {
                        const piece = document.createElement('span');
                        piece.classList.add('piece');
                        piece.textContent = gameBoard[row][col];
                        square.appendChild(piece);
                    }
                    
                    square.addEventListener('click', handleSquareClick);
                    board.appendChild(square);
                }
            }
        }

        function handleSquareClick(event) {
            const row = parseInt(event.currentTarget.dataset.row);
            const col = parseInt(event.currentTarget.dataset.col);
            const clickedSquare = event.currentTarget;

            if (selectedSquare) {
                const selectedRow = parseInt(selectedSquare.dataset.row);
                const selectedCol = parseInt(selectedSquare.dataset.col);
                
                if (selectedSquare === clickedSquare) {
                    // Deselect if clicking the same square
                    deselectSquare();
                } else if (isValidMove(selectedRow, selectedCol, row, col)) {
                    // Make the move
                    makeMove(selectedRow, selectedCol, row, col);
                    deselectSquare();
                    switchPlayer();
                    updateDisplay();
                } else {
                    // Select new piece if it belongs to current player
                    deselectSquare();
                    if (gameBoard[row][col] && isPieceOfCurrentPlayer(gameBoard[row][col])) {
                        selectSquare(clickedSquare);
                    }
                }
            } else {
                // Select piece if it belongs to current player
                if (gameBoard[row][col] && isPieceOfCurrentPlayer(gameBoard[row][col])) {
                    selectSquare(clickedSquare);
                }
            }
        }

        function selectSquare(square) {
            selectedSquare = square;
            square.classList.add('selected');
            
            if (showHints) {
                highlightPossibleMoves(
                    parseInt(square.dataset.row), 
                    parseInt(square.dataset.col)
                );
            }
        }

        function deselectSquare() {
            if (selectedSquare) {
                selectedSquare.classList.remove('selected');
                selectedSquare = null;
            }
            clearHighlights();
        }

        function highlightPossibleMoves(row, col) {
            // Basic highlight system - you can expand this with actual move validation
            const squares = document.querySelectorAll('.square');
            squares.forEach(square => {
                const r = parseInt(square.dataset.row);
                const c = parseInt(square.dataset.col);
                
                // Simple example: highlight adjacent squares for demonstration
                if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1 && !(r === row && c === col)) {
                    square.classList.add('possible-move');
                }
            });
        }

        function clearHighlights() {
            document.querySelectorAll('.possible-move').forEach(square => {
                square.classList.remove('possible-move');
            });
        }

        function isPieceOfCurrentPlayer(piece) {
            const whitePieces = Object.values(pieces.white);
            const blackPieces = Object.values(pieces.black);
            
            if (currentPlayer === 'white') {
                return whitePieces.includes(piece);
            } else {
                return blackPieces.includes(piece);
            }
        }

        function isValidMove(fromRow, fromCol, toRow, toCol) {
            // Basic validation - expand this with proper chess rules
            const piece = gameBoard[fromRow][fromCol];
            const targetPiece = gameBoard[toRow][toCol];
            
            // Can't capture own pieces
            if (targetPiece && isPieceOfCurrentPlayer(targetPiece)) {
                return false;
            }
            
            // Basic move validation (simplified for demo)
            return true;
        }

        function makeMove(fromRow, fromCol, toRow, toCol) {
            // Save move to history
            gameHistory.push({
                from: [fromRow, fromCol],
                to: [toRow, toCol],
                piece: gameBoard[fromRow][fromCol],
                captured: gameBoard[toRow][toCol],
                player: currentPlayer
            });
            
            // Make the move
            gameBoard[toRow][toCol] = gameBoard[fromRow][fromCol];
            gameBoard[fromRow][fromCol] = null;
            
            createBoard();
        }

        function switchPlayer() {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            if (currentPlayer === 'white') {
                moveCount++;
            }
        }

        function updateDisplay() {
            document.getElementById('current-player').textContent = 
                currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
            document.getElementById('move-count').textContent = moveCount;
            
            const status = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn to move`;
            document.getElementById('game-status').textContent = status;
        }

        function newGame() {
            gameBoard = [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']
            ];
            currentPlayer = 'white';
            moveCount = 1;
            gameHistory = [];
            selectedSquare = null;
            createBoard();
            updateDisplay();
        }

        function undoMove() {
            if (gameHistory.length === 0) return;
            
            const lastMove = gameHistory.pop();
            const [fromRow, fromCol] = lastMove.from;
            const [toRow, toCol] = lastMove.to;
            
            gameBoard[fromRow][fromCol] = lastMove.piece;
            gameBoard[toRow][toCol] = lastMove.captured;
            
            currentPlayer = lastMove.player;
            if (currentPlayer === 'black') {
                moveCount--;
            }
            
            createBoard();
            updateDisplay();
        }

        function toggleHighlights() {
            showHints = !showHints;
            if (!showHints) {
                clearHighlights();
            }
        }

        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);