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

                    // Highlight last move
                    if (lastMove && 
                        ((lastMove.from[0] === row && lastMove.from[1] === col) ||
                         (lastMove.to[0] === row && lastMove.to[1] === col))) {
                        square.classList.add('last-move');
                    }
                    
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


        function animateCapture(row, col) {
            const squares = document.querySelectorAll('.square');
            const targetSquare = squares[row * 8 + col];
            const piece = targetSquare.querySelector('.piece');
            
            if (piece) {
                piece.classList.add('captured');
            }
        }
        function updateGameStatus(message) {
            document.getElementById('game-status').textContent = message;
        }

          function hasAnyValidMoves(player) {
            for (let fromRow = 0; fromRow < 8; fromRow++) {
                for (let fromCol = 0; fromCol < 8; fromCol++) {
                    const piece = gameBoard[fromRow][fromCol];
                    if (piece && isPlayerPiece(piece, player)) {
                        for (let toRow = 0; toRow < 8; toRow++) {
                            for (let toCol = 0; toCol < 8; toCol++) {
                                if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                                    // Test if this move would leave king in check
                                    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
                                    tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
                                    tempBoard[fromRow][fromCol] = null;
                                    
                                    if (!isKingInCheck(tempBoard, player)) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

          function isKingInCheck(board, player) {
            // Find the king
            const kingPiece = player === 'white' ? pieces.white.king : pieces.black.king;
            let kingPos = null;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (board[row][col] === kingPiece) {
                        kingPos = [row, col];
                        break;
                    }
                }
                if (kingPos) break;
            }
            
            if (!kingPos) return false;
            
            const opponent = player === 'white' ? 'black' : 'white';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col];
                    if (piece && isPlayerPiece(piece, opponent)) {
                        if (canPieceAttack(board, row, col, kingPos[0], kingPos[1])) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        }

        function isPlayerPiece(piece, player) {
            const playerPieces = player === 'white' ? Object.values(pieces.white) : Object.values(pieces.black);
            return playerPieces.includes(piece);
        }

         function canPieceAttack(board, fromRow, fromCol, toRow, toCol) {
            const piece = board[fromRow][fromCol];
            const pieceType = getPieceType(piece);
            const isWhite = Object.values(pieces.white).includes(piece);
            
            switch (pieceType) {
                case 'pawn':
                    return canPawnAttack(fromRow, fromCol, toRow, toCol, isWhite);
                case 'rook':
                    return isValidRookMove(fromRow, fromCol, toRow, toCol) && !isPathBlockedInBoard(board, fromRow, fromCol, toRow, toCol);
                case 'bishop':
                    return isValidBishopMove(fromRow, fromCol, toRow, toCol) && !isPathBlockedInBoard(board, fromRow, fromCol, toRow, toCol);
                case 'queen':
                    return (isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol)) && 
                           !isPathBlockedInBoard(board, fromRow, fromCol, toRow, toCol);
                case 'king':
                    return isValidKingMove(fromRow, fromCol, toRow, toCol);
                case 'knight':
                    return isValidKnightMove(fromRow, fromCol, toRow, toCol);
                default:
                    return false;
            }
        }

            function isPathBlockedInBoard(board, fromRow, fromCol, toRow, toCol) {
            const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
            const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
            
            let currentRow = fromRow + rowStep;
            let currentCol = fromCol + colStep;
            
            while (currentRow !== toRow || currentCol !== toCol) {
                if (board[currentRow][currentCol] !== null) {
                    return true;
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
            
            return false;
        }


         function canPawnAttack(fromRow, fromCol, toRow, toCol, isWhite) {
            const direction = isWhite ? -1 : 1;
            const rowDiff = toRow - fromRow;
            const colDiff = Math.abs(toCol - fromCol);
            
            return colDiff === 1 && rowDiff === direction;
        }
        function checkGameState() {
            const inCheck = isKingInCheck(gameBoard, currentPlayer);
            const hasValidMoves = hasAnyValidMoves(currentPlayer);
            if (inCheck && !hasValidMoves) {
                gameState = 'checkmate';
                updateGameStatus(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            } else if (!hasValidMoves) {
                gameState = 'stalemate';
                updateGameStatus('Stalemate! No valid moves left and the game is a draw.');
            }
            else if (inCheck) {
                gameState = 'check';
                updateGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} is in check!`);
            } else {
                gameState = 'playing';
                updateGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn to move`);
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
                   if (makeMove(selectedRow, selectedCol, row, col)) {
                       deselectSquare();
                       switchPlayer();
                       checkGameState();
                       updateDisplay();
                   }
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
            // Highlight only valid moves for the selected piece
            const squares = document.querySelectorAll('.square');
            squares.forEach(square => {
                const r = parseInt(square.dataset.row);
                const c = parseInt(square.dataset.col);
                // Only highlight if the move is valid and not the current square
                if ((r !== row || c !== col) && isValidMove(row, col, r, c)) {
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
        ////
        
      function isValidMove(fromRow, fromCol, toRow, toCol) {
            if (fromRow === toRow && fromCol === toCol) return false;
            
            const piece = gameBoard[fromRow][fromCol];
            const targetPiece = gameBoard[toRow][toCol];
            
            if (targetPiece && isPieceOfCurrentPlayer(targetPiece)) {
                return false;
            }
            
            // Get piece type and validate move
            const pieceType = getPieceType(piece);
            const isWhite = Object.values(pieces.white).includes(piece);
            
            switch (pieceType) {
                case 'pawn':
                    return isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, targetPiece);
                case 'rook':
                    return isValidRookMove(fromRow, fromCol, toRow, toCol);
                case 'bishop':
                    return isValidBishopMove(fromRow, fromCol, toRow, toCol);
                case 'queen':
                    return isValidQueenMove(fromRow, fromCol, toRow, toCol);
                case 'king':
                    return isValidKingMove(fromRow, fromCol, toRow, toCol);
                case 'knight':
                    return isValidKnightMove(fromRow, fromCol, toRow, toCol);
                default:
                    return false;
            }
        }

        function getPieceType(piece) {
            const whitePieces = pieces.white;
            const blackPieces = pieces.black;
            
            for (let type in whitePieces) {
                if (whitePieces[type] === piece || blackPieces[type] === piece) {
                    return type;
                }
            }
            return null;
        }

        function isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, targetPiece) {
            const direction = isWhite ? -1 : 1; // White moves up (-1), black moves down (+1)
            const startRow = isWhite ? 6 : 1;
            const rowDiff = toRow - fromRow;
            const colDiff = Math.abs(toCol - fromCol);
            
            if (fromCol === toCol && !targetPiece) {
                if (rowDiff === direction) return true;
                if (fromRow === startRow && rowDiff === 2 * direction) return true;
            } 
            if (colDiff === 1 && rowDiff === direction && targetPiece) return true;
            
            return false;
        }

        function isValidRookMove(fromRow, fromCol, toRow, toCol) {
            // Rook moves horizontally or vertically
            if (fromRow !== toRow && fromCol !== toCol) return false;
            
            return !isPathBlocked(fromRow, fromCol, toRow, toCol);
        }

        function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
            const rowDiff = Math.abs(toRow - fromRow);
            const colDiff = Math.abs(toCol - fromCol);
            
            // Bishop moves diagonally
            if (rowDiff !== colDiff) return false;
            
            return !isPathBlocked(fromRow, fromCol, toRow, toCol);
        }

        function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
            // Queen combines rook and bishop moves
            return isValidRookMove(fromRow, fromCol, toRow, toCol) || 
                   isValidBishopMove(fromRow, fromCol, toRow, toCol);
        }

        function isValidKingMove(fromRow, fromCol, toRow, toCol) {
            const rowDiff = Math.abs(toRow - fromRow);
            const colDiff = Math.abs(toCol - fromCol);
            
            // King moves one square in any direction
            return rowDiff <= 1 && colDiff <= 1;
        }

        function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
            const rowDiff = Math.abs(toRow - fromRow);
            const colDiff = Math.abs(toCol - fromCol);
            
            // Knight moves in L-shape: 2+1 or 1+2
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        }




        function isPathBlocked(fromRow, fromCol, toRow, toCol) {
            const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
            const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
            
            let currentRow = fromRow + rowStep;
            let currentCol = fromCol + colStep;
            
            while (currentRow !== toRow || currentCol !== toCol) {
                if (gameBoard[currentRow][currentCol] !== null) {
                    return true; // Path is blocked
                }
                currentRow += rowStep;
                currentCol += colStep;
            }
            
            return false; // Path is clear
        }
        function makeMove(fromRow, fromCol, toRow, toCol) {
            // Check if this move would leave king in check
            const tempBoard = JSON.parse(JSON.stringify(gameBoard));
            tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
            tempBoard[fromRow][fromCol] = null;
            
            if (isKingInCheck(tempBoard, currentPlayer)) {
                updateGameStatus("Invalid move: King would be in check!");
                return false;
            }
            
            const capturedPiece = gameBoard[toRow][toCol];
            
            
            // Animate capture if there's a piece being captured
            if (capturedPiece) {
                animateCapture(toRow, toCol);
            }
            
            // Save move to history
            const moveData = {
                from: [fromRow, fromCol],
                to: [toRow, toCol],
                piece: gameBoard[fromRow][fromCol],
                captured: capturedPiece,
                player: currentPlayer
            };
            gameHistory.push(moveData);
            lastMove = moveData;
            
            // Make the move
            gameBoard[toRow][toCol] = gameBoard[fromRow][fromCol];
            gameBoard[fromRow][fromCol] = null;
            
            // Animate the move
            setTimeout(() => {
                createBoard();
            }, capturedPiece ? 250 : 0);
            
            return true;
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
            if (gameState === 'playing') {
                const status = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn to move`;
                document.getElementById('game-status').textContent = status;
            }
            // Other game states are handled by checkGameState()

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
            gameState = 'playing';
            lastMove = null;
            createBoard();
            updateDisplay();
            updateGameStatus("Welcome to Chess! White moves first.");
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
            lastMove = gameHistory.length > 0 ? gameHistory[gameHistory.length - 1] : null;
            gameState = 'playing';
            createBoard();
            updateDisplay();
            updateGameStatus(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn to move`);
        }

        function toggleHighlights(event) {
            showHints = !showHints;
            if (!showHints) {
                clearHighlights();
            }
            if (event && event.target) {
                event.target.textContent = showHints ? 'Hints Off' : 'Toggle Hints';
            }
        }

        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);