# Math Problem Generator

## Overview
Math Problem Generator is a GUI-based application that allows users to create customizable worksheets with various math problems, including addition, subtraction, multiplication, and division. It's designed to be user-friendly and flexible, providing options to set the difficulty and number of problems.

## Features
- **Customizable Problem Types**: Generate problems for addition, subtraction, multiplication, and division.
- **Adjustable Difficulty**: Set the difficulty level for each type of problem by choosing the number of digits.
- **Division Problem Customization**: Independently set the difficulty for numerators and denominators in division problems.
- **Worksheet Generation**: Output math problems in a neatly formatted PDF file, arranged in a grid layout for easy printing and use.

## Installation

### Requirements
- Python 3.x
- Tkinter (usually comes with Python)
- PyInstaller (for creating standalone executables)

### Setup
1. Clone the repository or download the source code.
2. Navigate to the project directory.

   ```bash
   cd path/to/MathProblemGenerator

pip install -r requirements.txt

python gui.py

## Usage
1. **Start the Application**: Run `gui.py` to open the user interface.
2. **Set Problem Types and Difficulty**: Choose the number and difficulty of each problem type using the provided spin boxes.
3. **Generate PDF**: Click on 'Generate Worksheet' to create a PDF file with the math problems.
4. **Adjust Layout Settings**: Use the 'Settings' button to open a dialog for adjusting layout parameters like problems per row and line height.

## Building Executable
To build a standalone executable:

1. Install PyInstaller:

   ```bash
   pip install pyinstaller

pyinstaller --windowed --onefile gui.py
