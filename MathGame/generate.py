from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

# Global variables for settings

# In both GUI.py and generate.py
import settings

# Use like this
settings.problems_per_row
settings.lines_per_problem
settings.line_height 
settings.vertical_margin


def generate_worksheet(num_add, digits_add, num_sub, digits_sub, num_mul, digits_mul, num_div, digits_div, problems_per_row, lines_per_problem, line_height, vertical_margin, digits_div_num, digits_div_denom):
    # Calculate problem height using the passed parameters
    problem_height = lines_per_problem * line_height

    # Convert string inputs to integers
    num_add, digits_add, num_sub, digits_sub, num_mul, digits_mul, num_div, digits_div = map(int, [num_add, digits_add, num_sub, digits_sub, num_mul, digits_mul, num_div, digits_div])

    division_problems = generate_division_problems(num_div, digits_div_num, digits_div_denom)


    # Generate math problems
    addition_problems = generate_addition_problems(num_add, digits_add)
    subtraction_problems = generate_subtraction_problems(num_sub, digits_sub)
    multiplication_problems = generate_multiplication_problems(num_mul, digits_mul)
    division_problems = generate_division_problems(num_div, digits_div_num, digits_div_denom)


    # Create a PDF
    c = canvas.Canvas("math_worksheet.pdf", pagesize=letter)
    width, height = letter  # Get the dimensions of the page

    # Add a header
    c.drawString(100, height - 50, "Math Worksheet")

    y_start_position = height - 100  # Starting y-position (below the header)
    x_position = 0  # Starting x-position
    y_position = y_start_position

    # Function to check if we need a new page
    def new_page_needed(y_pos):
        return y_pos < vertical_margin + problem_height

    # Layout the problems in a grid format
    all_problems = addition_problems + subtraction_problems + multiplication_problems + division_problems
    for i, problem in enumerate(all_problems):
        if i % problems_per_row == 0 and i != 0:  # Start a new row
            x_position = 0
            y_position -= problem_height
            if new_page_needed(y_position):
                c.showPage()
                y_position = y_start_position  # Reset y-position after page break

        # Reset y_position for each new problem
        current_y_position = y_position

        formatted_problem = format_problem_vertically(problem)
        for line in formatted_problem.split('\n'):
            c.drawString(x_position + 20, current_y_position, line)
            current_y_position -= line_height  # Move down for next line of the problem

        x_position += width // problems_per_row  # Move to the next problem position horizontally

    c.save()
    print("Worksheet generated as 'math_worksheet.pdf'")



def format_problem_vertically(problem):
    # Split the problem based on spaces to identify the operation
    parts = problem.split()
    if len(parts) != 3:
        return problem  # Return the problem as is if it doesn't match expected format

    num1, operator, num2 = parts

    # Ensure the smaller number is on the left for division
    if operator == "÷":
        num1, num2 = sorted([num1, num2], key=int)

    if operator in ["+", "-"]:
        formatted_problem = f"{num1.rjust(5)}\n{operator}{num2.rjust(4)}\n-----"
    elif operator == "x":
        formatted_problem = f"{num1.rjust(5)}\n{operator}{num2.rjust(4)}\n-----"
    elif operator == "÷":
        # Formatting for long division
        divisor_len = max(len(num1), len(num2)) + 1
        formatted_problem = f"{'_' * divisor_len}\n{num1}|{num2}"
    else:
        formatted_problem = problem  # Fallback if the operator is not recognized

    return formatted_problem


import random

def generate_addition_problems(num_problems, num_digits):
    problems = []
    for _ in range(num_problems):
        num1 = random.randint(10**(num_digits-1), 10**num_digits - 1)
        num2 = random.randint(10**(num_digits-1), 10**num_digits - 1)
        problem = f"{num1} + {num2}"
        problems.append(problem)
    return problems

def generate_subtraction_problems(num_problems, num_digits):
    problems = []
    for _ in range(num_problems):
        num1 = random.randint(10**(num_digits-1), 10**num_digits - 1)
        num2 = random.randint(10**(num_digits-1), num1)  # Ensure num2 is not greater than num1
        problem = f"{num1} - {num2}"
        problems.append(problem)
    return problems

def generate_multiplication_problems(num_problems, num_digits):
    problems = []
    for _ in range(num_problems):
        num1 = random.randint(10**(num_digits-1), 10**num_digits - 1)
        num2 = random.randint(10**(num_digits-1), 10**num_digits - 1)
        problem = f"{num1} x {num2}"
        problems.append(problem)
    return problems

import random

def generate_division_problems(num_problems, num_digits_num, num_digits_denom):
    problems = []
    for _ in range(num_problems):
        # Convert to integers
        num_digits_num = int(num_digits_num)
        num_digits_denom = int(num_digits_denom)

        num1 = random.randint(10**(num_digits_num-1), 10**num_digits_num - 1)
        num2 = random.randint(10**(num_digits_denom-1), 10**num_digits_denom - 1)
        
        # Ensure num2 is not zero
        while num2 == 0:
            num2 = random.randint(10**(num_digits_denom-1), 10**num_digits_denom - 1)

        problem = f"{num1} ÷ {num2}"
        problems.append(problem)
    return problems



# Integrate with GUI
if __name__ == "__main__":
    gui = create_gui()
    gui.mainloop()
