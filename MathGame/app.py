from GUI import create_gui
from tkinter import messagebox
import tkinter as tk
from tkinter import ttk


def generate_problems(addition_var, digits_addition_var, subtraction_var, digits_subtraction_var, multiplication_var, digits_multiplication_var, division_var, digits_division_var):
    # Your logic for generating problems...
    pass



import random

def generate_single_division_problem(num_digits):
    """Generate a single division problem with specified number of digits."""
    num_digits = int(num_digits)  # Ensure num_digits is an integer
    lower_bound = 10 ** (num_digits - 1)
    upper_bound = 10 ** num_digits - 1
    divisor = random.randint(lower_bound, upper_bound)
    # Ensuring a whole number result by multiplying divisor with a random number
    dividend = divisor * random.randint(1, 10)

    problem = f"{dividend} ÷ {divisor} = _____"  # Include spaces for the answer
    return problem


def generate_division_problems(count, num_digits):
    """Generate multiple division problems."""
    problems = []
    for _ in range(count):
        problem, answer = generate_single_division_problem(num_digits)
        problems.append((problem, answer))
    return problems

def generate_single_multiplication_problem(num_digits):
    """Generate a single multiplication problem with specified number of digits."""
    num_digits = int(num_digits)  # Ensure num_digits is an integer
    lower_bound = 10 ** (num_digits - 1)
    upper_bound = 10 ** num_digits - 1
    num1, num2 = random.randint(lower_bound, upper_bound), random.randint(lower_bound, upper_bound)

    problem = f"{num1} × {num2} = _____"  # Include spaces for the answer
    return problem


def generate_multiplication_problems(count, num_digits):
    """Generate multiple multiplication problems."""
    problems = []
    for _ in range(count):
        problem, answer = generate_single_multiplication_problem(num_digits)
        problems.append((problem, answer))
    return problems

def generate_single_addition_problem(num_digits):
    """Generate a single addition problem with specified number of digits."""
    num_digits = int(num_digits)  # Convert num_digits to an integer
    lower_bound = 10 ** (num_digits - 1)
    upper_bound = 10 ** num_digits - 1
    num1, num2 = random.randint(lower_bound, upper_bound), random.randint(lower_bound, upper_bound)

    problem = f"{num1} + {num2} = _____"  # Include spaces for the answer
    return problem  # Return only the problem as a string

def generate_addition_problems(count, num_digits):
    """Generate multiple addition problems."""
    problems = []
    for _ in range(count):
        problem = generate_single_addition_problem(num_digits)
        problems.append(problem)  # Append the problem (string) to the list
    return problems

def generate_single_subtraction_problem(num_digits):
    """Generate a single subtraction problem with specified number of digits."""
    num_digits = int(num_digits)  # Ensure num_digits is an integer
    lower_bound = 10 ** (num_digits - 1)
    upper_bound = 10 ** num_digits - 1
    num1, num2 = random.randint(lower_bound, upper_bound), random.randint(lower_bound, upper_bound)
    
    # To ensure the result is not negative
    if num1 < num2:
        num1, num2 = num2, num1

    problem = f"{num1} - {num2} = _____"  # Include spaces for the answer
    return problem


def generate_subtraction_problems(count, num_digits):
    """Generate multiple subtraction problems."""
    problems = []
    for _ in range(count):
        problem, answer = generate_single_subtraction_problem(num_digits)
        problems.append((problem, answer))
    return problems


if __name__ == "__main__":
    # Create GUI and get variables
    root, addition_var, digits_addition_var, subtraction_var, digits_subtraction_var, multiplication_var, digits_multiplication_var, division_var, digits_division_var = create_gui()

    # Set up the generate button's command
    generate_button = ttk.Button(root, text="Generate", command=lambda: generate_problems(addition_var, digits_addition_var, subtraction_var, digits_subtraction_var, multiplication_var, digits_multiplication_var, division_var, digits_division_var))
    generate_button.grid(row=5, columnspan=3, padx=5, pady=5)

    root.mainloop()

