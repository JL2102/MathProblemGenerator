const ALL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CELL_SIZE = 50;
let selectedCells = [];
let isMouseDown = false;
let isTouchActive = false;
let foundWords = [];
let score = 0;
let timerInterval;
let secondsElapsed = 0;
let initialDirection = null;
let highlightTimer;
let highlightQueue = [];

// Fetch words from a JSON file
async function fetchWords() {
    const response = await fetch('words.json');
    return await response.json();
}

// Generate puzzle grid
async function generatePuzzle() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
    startTimer();

    score = 0;
    foundWords = [];
    document.getElementById('score').textContent = score;
    selectedCells = [];
    initialDirection = null;

    const wordsDictionary = await fetchWords();
    const numWords = parseInt(document.getElementById('numWords').value);
    const gridSize = parseInt(document.getElementById('gridSize').value);

    const selectedWords = selectWords(wordsDictionary, numWords);
    const puzzle = new Generator().gen_word_search(selectedWords, getDirections(), gridSize / selectedWords.length);

    renderPuzzle(puzzle);
    renderWordList(selectedWords);
}

// Select words randomly from dictionary
function selectWords(dictionary, count) {
    const selected = [];
    while (selected.length < count) {
        const word = dictionary[Math.floor(Math.random() * dictionary.length)];
        if (!selected.includes(word)) selected.push(word);
    }
    return selected;
}

// Render the puzzle grid
function renderPuzzle(puzzle) {
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${puzzle.length}, ${CELL_SIZE}px)`;

    puzzle.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.addEventListener('mousedown', startSelection);
            cell.addEventListener('mouseover', continueSelection);
            cell.addEventListener('mouseup', endSelection);
            cell.addEventListener('touchstart', startTouchSelection);
            cell.addEventListener('touchmove', continueTouchSelection);
            cell.addEventListener('touchend', endTouchSelection);
            grid.appendChild(cell);
        });
    });
}

// Render word list to find
function renderWordList(words) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';

    words.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordList.appendChild(listItem);
    });
}

// Start selection process for mouse
function startSelection(event) {
    event.preventDefault();
    isMouseDown = true;
    handleSelection(event.clientX, event.clientY);
}

// Start selection process for touch
function startTouchSelection(event) {
    event.preventDefault();
    isTouchActive = true;
    handleSelection(event.touches[0].clientX, event.touches[0].clientY);
}

// Continue selection for mouse
function continueSelection(event) {
    if (isMouseDown) {
        handleSelection(event.clientX, event.clientY);
    }
}

// Continue selection for touch
function continueTouchSelection(event) {
    if (isTouchActive) {
        handleSelection(event.touches[0].clientX, event.touches[0].clientY);
    }
}

// End selection process for mouse
function endSelection() {
    isMouseDown = false;
    processSelection();
}

// End selection process for touch
function endTouchSelection() {
    isTouchActive = false;
    processSelection();
}

// Handle cell selection
function handleSelection(x, y) {
    const targetCell = document.elementFromPoint(x, y);
    if (targetCell && targetCell.classList.contains('grid-cell')) {
        toggleCellHighlight(targetCell);
    }
}

// Toggle cell highlight state
function toggleCellHighlight(cell) {
    if (cell.classList.contains('highlight')) {
        cell.classList.remove('highlight');
        selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);
    } else {
        cell.classList.add('highlight');
        selectedCells.push(cell);
    }
}

// Process the selection to check if it forms a valid word
function processSelection() {
    if (selectedCells.length === 0) return;

    let selectedWord = selectedCells.map(cell => cell.textContent).join('');
    let reversedWord = selectedCells.map(cell => cell.textContent).reverse().join('');
    const wordListItems = document.querySelectorAll('.word-list li');
    let wordFound = false;

    wordListItems.forEach(item => {
        if ((item.textContent === selectedWord || item.textContent === reversedWord) && !item.classList.contains('found')) {
            item.classList.add('found');
            selectedCells.forEach(cell => {
                cell.classList.add('found');
                cell.classList.remove('highlight');
            });
            foundWords.push(item.textContent);
            wordFound = true;

            let wordScore = item.textContent.length;
            if (item.textContent === reversedWord) {
                wordScore *= 2;
            } else if (initialDirection === 'diagonal') {
                wordScore *= 3;
            }
            score += wordScore;
            document.getElementById('score').textContent = score;
        }
    });

    if (wordFound) {
        drawLineThroughWord(selectedCells);
    }

    selectedCells = [];
    checkWinCondition();
}

// Draw line through found word
function drawLineThroughWord(cells) {
    const grid = document.getElementById('puzzleGrid');
    const startX = cells[0].offsetLeft + cells[0].offsetWidth / 2;
    const startY = cells[0].offsetTop + cells[0].offsetHeight / 2;
    const endX = cells[cells.length - 1].offsetLeft + cells[cells.length - 1].offsetWidth / 2;
    const endY = cells[cells.length - 1].offsetTop + cells[cells.length - 1].offsetHeight / 2;

    const line = document.createElement('div');
    line.classList.add('line');
    line.style.width = `${Math.hypot(endX - startX, endY - startY)}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`;
    line.style.transformOrigin = '0 0';
    grid.appendChild(line);
}

// Check if all words are found to determine win condition
function checkWinCondition() {
    const totalWords = document.querySelectorAll('.word-list li').length;
    if (foundWords.length === totalWords) {
        clearInterval(timerInterval);
        alert(`Congratulations! You've found all the words! Your score is ${score}.`);
    }
}

// Start the game timer
function startTimer() {
    timerInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('timer').textContent = formatTime(secondsElapsed);
    }, 1000);
}

// Format the time for display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get directions for placing words based on difficulty
function getDirections() {
    const difficulty = document.getElementById('difficulty').value;
    let directions;

    switch (difficulty) {
        case 'easy':
            directions = [[1, 0], [0, 1]]; // Horizontal and vertical
            break;
        case 'medium':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Backwards and upside-down
            break;
        case 'hard':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]; // Diagonals
            break;
        case 'impossible':
            directions = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1],
                          [1, 1], [1, -1], [-1, 1], [-1, -1]]; // Extra diagonals
            break;
        default:
            directions = [[1, 0], [0, 1]]; // Fallback to Easy
            break;
    }

    return directions;
}

// Generator class for word search puzzle
class Generator {
    get_puzzle_dim(words, size_fac) {
        let total = 0;
        for (let word of words) {
            total += word.length;
        }
        return Math.max(Math.ceil(Math.sqrt(total * size_fac)), Math.max(...words.map(word => word.length)));
    }

    create_empty_table(dim) {
        return Array.from({ length: dim }, () => Array(dim).fill(" "));
    }

    copy_table(table) {
        return JSON.parse(JSON.stringify(table));
    }

    create_blank_tried_pos(words) {
        const dictionary = {};
        words.forEach(word => dictionary[word] = []);
        return dictionary;
    }

    all_random_coords(dim) {
        const xlist = Array.from({ length: dim }, (_, i) => i).sort(() => Math.random() - 0.5);
        const ylist = Array.from({ length: dim }, (_, i) => i).sort(() => Math.random() - 0.5);
        return [xlist, ylist];
    }

    gen_word_search(words, directions, size_fac = 2) {
        const dim = this.get_puzzle_dim(words, size_fac);
        let table = this.create_empty_table(dim);
        const tried_positions = this.create_blank_tried_pos(words);
        let current_index = 0;

        while (current_index < words.length) {
            const word = words[current_index];
            const table_history = this.copy_table(table);
            const [xlist, ylist] = this.all_random_coords(dim);

            let success = false;

            for (let x of xlist) {
                for (let y of ylist) {
                    const shuffledDirections = this.shuffleArray(directions);
                    for (let dir of shuffledDirections) {
                        const tcopy = this.copy_table(table);
                        let pos = [x, y];
                        success = true;

                        for (let letter of word) {
                            try {
                                if (pos[0] < 0 || pos[1] < 0 || pos[0] >= dim || pos[1] >= dim) throw new Error();
                                tcopy[pos[1]][pos[0]];
                            } catch {
                                success = false;
                                break;
                            }

                            if (tcopy[pos[1]][pos[0]] === " ") {
                                tcopy[pos[1]][pos[0]] = letter;
                            } else if (tcopy[pos[1]][pos[0]] === letter) {
                                continue;
                            } else {
                                success = false;
                                break;
                            }

                            pos = [pos[0] + dir[0], pos[1] + dir[1]];
                        }

                        if (success) {
                            table = this.copy_table(tcopy);
                            tried_positions[word].push([x, y, dir]);
                            current_index++;
                            break;
                        }
                    }
                    if (success) break;
                }
                if (success) break;
            }

            if (!success) {
                current_index--;
                tried_positions[word] = [];
                table = this.copy_table(table_history);
                if (current_index < 0) {
                    table = this.create_empty_table(dim + 1);
                    current_index = 0;
                }
            }
        }

        for (let row of table) {
            for (let i = 0; i < row.length; i++) {
                if (row[i] === " ") row[i] = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
            }
        }

        return table;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

window.onload = generatePuzzle;
