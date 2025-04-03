document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const numberButtons = document.querySelectorAll('[data-number]');
    const operatorButtons = document.querySelectorAll('[data-operator]');
    const scientificButtons = document.querySelectorAll('[data-scientific]');
    const clearButton = document.querySelector('[data-action="clear"]');
    const deleteButton = document.querySelector('[data-action="delete"]');
    const calculateButton = document.querySelector('[data-action="calculate"]');
    const toggleSignButton = document.querySelector('[data-action="toggle-sign"]');
    const scientificToggleButton = document.getElementById('scientific-toggle');
    const scientificPanel = document.getElementById('scientific-panel');

    // Calculator state
    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;
    let resetInput = false;
    let lastResult = null;
    let equationMode = false;
    let equationInput = '';
    let scientificMode = false;
    
    // Initialize calculator
    updateDisplay();

    // Add ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Button press animation
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('btn-pressed');
            setTimeout(() => {
                this.classList.remove('btn-pressed');
            }, 150);
        });
    });

    // Number button event listeners
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (equationMode) {
                appendToEquation(button.dataset.number);
            } else {
                inputNumber(button.dataset.number);
            }
        });
    });

    // Operator button event listeners
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (equationMode) {
                appendToEquation(getOperatorSymbol(button.dataset.operator));
            } else {
                selectOperation(button.dataset.operator);
            }
        });
    });

    // Scientific button event listeners
    scientificButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (equationMode) {
                appendScientificToEquation(button.dataset.scientific);
            } else {
                executeScientificOperation(button.dataset.scientific);
            }
        });
    });

    // Action button event listeners
    clearButton.addEventListener('click', clear);
    deleteButton.addEventListener('click', deleteNumber);
    calculateButton.addEventListener('click', () => {
        if (equationMode) {
            evaluateEquation();
        } else {
            calculate();
        }
    });
    toggleSignButton.addEventListener('click', toggleSign);
    scientificToggleButton.addEventListener('click', toggleScientificMode);

    // Keyboard support
    document.addEventListener('keydown', handleKeyboard);

    // Functions
    function inputNumber(number) {
        if (resetInput) {
            currentOperand = '';
            resetInput = false;
        }

        // Handle decimal point
        if (number === '.' && currentOperand.includes('.')) return;
        
        // Replace 0 if it's the only digit
        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        
        updateDisplay();
    }

    function selectOperation(operator) {
        if (currentOperand === '') return;
        
        if (previousOperand !== '') {
            calculate();
        }
        
        operation = operator;
        previousOperand = currentOperand;
        currentOperand = '';
        
        updateDisplay();
    }

    function calculate() {
        if (operation === undefined || previousOperand === '') return;
        
        let computation;
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    displayError();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Animate result
        animateResult();
        
        currentOperand = String(computation);
        operation = undefined;
        previousOperand = '';
        resetInput = true;
        lastResult = computation;
        
        updateDisplay();
    }

    function executeScientificOperation(type) {
        if (currentOperand === '') return;
        
        const num = parseFloat(currentOperand);
        if (isNaN(num)) return;
        
        let result;
        
        try {
            switch (type) {
                case 'sin':
                    result = Math.sin(degToRad(num));
                    break;
                case 'cos':
                    result = Math.cos(degToRad(num));
                    break;
                case 'tan':
                    result = Math.tan(degToRad(num));
                    break;
                case 'sqrt':
                    if (num < 0) {
                        displayError();
                        return;
                    }
                    result = Math.sqrt(num);
                    break;
                case 'power':
                    previousOperand = currentOperand;
                    operation = 'power';
                    currentOperand = '';
                    updateDisplay();
                    return;
                case 'log':
                    if (num <= 0) {
                        displayError();
                        return;
                    }
                    result = Math.log10(num);
                    break;
                case 'ln':
                    if (num <= 0) {
                        displayError();
                        return;
                    }
                    result = Math.log(num);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'factorial':
                    if (num < 0 || !Number.isInteger(num)) {
                        displayError();
                        return;
                    }
                    result = factorial(num);
                    break;
                case 'abs':
                    result = Math.abs(num);
                    break;
                case 'exp':
                    result = num.toExponential();
                    break;
                default:
                    return;
            }
            
            // Animate result
            animateResult();
            
            currentOperand = String(result);
            resetInput = true;
            lastResult = result;
            
            updateDisplay();
            
        } catch (e) {
            displayError();
        }
    }

    function clear() {
        if (equationMode) {
            equationInput = '';
            currentOperand = '0';
        } else {
            currentOperand = '0';
            previousOperand = '';
            operation = undefined;
        }
        resetInput = false;
        
        updateDisplay();
    }

    function deleteNumber() {
        if (equationMode) {
            equationInput = equationInput.slice(0, -1);
            if (equationInput === '') {
                currentOperand = '0';
            } else {
                currentOperand = equationInput;
            }
        } else {
            if (currentOperand.length === 1 || currentOperand === '0') {
                currentOperand = '0';
            } else {
                currentOperand = currentOperand.slice(0, -1);
            }
        }
        
        updateDisplay();
    }

    function toggleSign() {
        if (equationMode) {
            // Add negative sign at appropriate position in equation
            if (equationInput === '' || equationInput === '0') {
                equationInput = '-';
            } else {
                // Find last number start position
                const lastOperatorIndex = Math.max(
                    equationInput.lastIndexOf('+'),
                    equationInput.lastIndexOf('-'),
                    equationInput.lastIndexOf('*'),
                    equationInput.lastIndexOf('/')
                );
                
                if (lastOperatorIndex === -1) {
                    // No operator, negate the whole expression
                    if (equationInput.startsWith('-')) {
                        equationInput = equationInput.substring(1);
                    } else {
                        equationInput = '-' + equationInput;
                    }
                } else {
                    // Check if there's a number after the last operator
                    const afterOperator = equationInput.substring(lastOperatorIndex + 1);
                    if (afterOperator === '') {
                        // No number after operator, do nothing
                        return;
                    } else if (equationInput.charAt(lastOperatorIndex) === '-') {
                        // Change minus to plus
                        equationInput = equationInput.substring(0, lastOperatorIndex) + '+' + afterOperator;
                    } else if (equationInput.charAt(lastOperatorIndex) === '+') {
                        // Change plus to minus
                        equationInput = equationInput.substring(0, lastOperatorIndex) + '-' + afterOperator;
                    } else {
                        // For * and /, insert negative for the operand
                        equationInput = equationInput.substring(0, lastOperatorIndex + 1) + '(-' + afterOperator + ')';
                    }
                }
            }
            currentOperand = equationInput;
        } else {
            if (currentOperand === '0' || currentOperand === '') return;
            currentOperand = String(-parseFloat(currentOperand));
        }
        
        updateDisplay();
    }

    function toggleScientificMode() {
        scientificMode = !scientificMode;
        
        if (scientificMode) {
            scientificPanel.classList.add('visible');
            scientificToggleButton.classList.add('active');
        } else {
            scientificPanel.classList.remove('visible');
            scientificToggleButton.classList.remove('active');
        }
    }

    // Toggle between standard calculator and equation input mode
    function toggleEquationMode() {
        equationMode = !equationMode;
        
        if (equationMode) {
            equationInput = currentOperand !== '0' ? currentOperand : '';
            previousOperandElement.textContent = 'Equation Mode: Type full expression';
        } else {
            currentOperand = equationInput !== '' ? equationInput : '0';
            previousOperand = '';
            operation = undefined;
            previousOperandElement.textContent = '';
        }
        
        updateDisplay();
    }

    function appendToEquation(value) {
        equationInput += value;
        currentOperand = equationInput;
        updateDisplay();
    }

    function appendScientificToEquation(type) {
        switch (type) {
            case 'sin':
                equationInput += 'sin(';
                break;
            case 'cos':
                equationInput += 'cos(';
                break;
            case 'tan':
                equationInput += 'tan(';
                break;
            case 'sqrt':
                equationInput += 'sqrt(';
                break;
            case 'power':
                equationInput += '^';
                break;
            case 'log':
                equationInput += 'log(';
                break;
            case 'ln':
                equationInput += 'ln(';
                break;
            case 'pi':
                equationInput += 'π';
                break;
            case 'e':
                equationInput += 'e';
                break;
            case 'factorial':
                equationInput += '!';
                break;
            case 'abs':
                equationInput += 'abs(';
                break;
            case 'exp':
                equationInput += 'E';
                break;
        }
        currentOperand = equationInput;
        updateDisplay();
    }

    function evaluateEquation() {
        try {
            // Prepare equation for evaluation
            let equation = equationInput;
            
            // Replace mathematical symbols with JavaScript equivalents
            equation = equation.replace(/×/g, '*')
                              .replace(/÷/g, '/')
                              .replace(/π/g, 'Math.PI')
                              .replace(/e/g, 'Math.E')
                              .replace(/sin\(/g, 'Math.sin(degToRad(')
                              .replace(/cos\(/g, 'Math.cos(degToRad(')
                              .replace(/tan\(/g, 'Math.tan(degToRad(')
                              .replace(/sqrt\(/g, 'Math.sqrt(')
                              .replace(/log\(/g, 'Math.log10(')
                              .replace(/ln\(/g, 'Math.log(')
                              .replace(/abs\(/g, 'Math.abs(')
                              .replace(/\^/g, '**');
            
            // Handle factorial notation
            while (equation.includes('!')) {
                const factIndex = equation.indexOf('!');
                // Find the number before the factorial
                let numStart = factIndex - 1;
                let parenCount = 0;
                
                // Handle parentheses
                if (equation[numStart] === ')') {
                    parenCount = 1;
                    numStart--;
                    
                    while (numStart >= 0 && parenCount > 0) {
                        if (equation[numStart] === ')') parenCount++;
                        if (equation[numStart] === '(') parenCount--;
                        numStart--;
                    }
                } else {
                    // Find start of the number
                    while (numStart >= 0 && (
                        /[0-9.]/.test(equation[numStart]) || 
                        (numStart === 0 && equation[numStart] === '-') ||
                        (numStart > 0 && equation[numStart] === '-' && /[+\-*/^(]/.test(equation[numStart-1]))
                    )) {
                        numStart--;
                    }
                }
                
                const numToFactorial = equation.substring(numStart + 1, factIndex);
                equation = equation.substring(0, numStart + 1) + 
                           `factorial(${numToFactorial})` + 
                           equation.substring(factIndex + 1);
            }
            
            // Add closing parentheses where needed
            const openParens = (equation.match(/\(/g) || []).length;
            const closeParens = (equation.match(/\)/g) || []).length;
            if (openParens > closeParens) {
                equation += ')'.repeat(openParens - closeParens);
            }
            
            // Create a function with all helper methods
            const evalFunc = new Function(
                'degToRad', 'factorial',
                `return ${equation}`
            );
            
            // Execute the calculation with our helper functions
            const result = evalFunc(
                (deg) => deg * (Math.PI / 180),
                (n) => {
                    if (n < 0 || !Number.isInteger(parseFloat(n))) throw new Error("Invalid factorial");
                    if (n <= 1) return 1;
                    let result = 1;
                    for (let i = 2; i <= n; i++) result *= i;
                    return result;
                }
            );
            
            // Check for valid result
            if (result === undefined || isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation");
            }
            
            // Animate result
            animateResult();
            
            // Update state
            equationInput = String(result);
            currentOperand = equationInput;
            
            // Display equation result
            previousOperandElement.textContent = `${equation.replace(/Math\./g, '').replace(/degToRad/g, '')} =`;
            
            updateDisplay();
        } catch (e) {
            console.error("Equation evaluation error:", e);
            displayError();
        }
    }

    function updateDisplay() {
        // Format the current operand for display
        let displayValue = currentOperand;
        
        // Handle large numbers and decimals
        if (displayValue !== '' && !equationMode) {
            const numberValue = parseFloat(displayValue);
            if (!isNaN(numberValue)) {
                if (Math.abs(numberValue) > 1e9) {
                    displayValue = numberValue.toExponential(5);
                } else if (displayValue.includes('.') && displayValue.split('.')[1].length > 10) {
                    displayValue = numberValue.toFixed(10).replace(/0+$/, '');
                }
            }
        }
        
        currentOperandElement.textContent = displayValue || '0';
        
        if (!equationMode && operation != null) {
            previousOperandElement.textContent = `${previousOperand} ${operation}`;
        } else if (!equationMode) {
            previousOperandElement.textContent = '';
        }
    }

    function handleKeyboard(e) {
        // Toggle equation mode with Tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            toggleEquationMode();
            return;
        }
        
        // Numbers
        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            if (equationMode) {
                appendToEquation(e.key);
            } else {
                inputNumber(e.key);
            }
        }
        
        // Decimal point
        if (e.key === '.') {
            e.preventDefault();
            if (equationMode) {
                appendToEquation('.');
            } else {
                inputNumber('.');
            }
        }
        
        // Basic operators
        if (e.key === '+' || e.key === '-') {
            e.preventDefault();
            if (equationMode) {
                appendToEquation(e.key);
            } else {
                selectOperation(e.key);
            }
        }
        
        // Multiplication
        if (e.key === '*') {
            e.preventDefault();
            if (equationMode) {
                appendToEquation('*');
            } else {
                selectOperation('×');
            }
        }
        
        // Division
        if (e.key === '/') {
            e.preventDefault();
            if (equationMode) {
                appendToEquation('/');
            } else {
                selectOperation('÷');
            }
        }
        
        // Parentheses for equation mode
        if ((e.key === '(' || e.key === ')') && equationMode) {
            e.preventDefault();
            appendToEquation(e.key);
        }
        
        // Power operator
        if (e.key === '^' && equationMode) {
            e.preventDefault();
            appendToEquation('^');
        }
        
        // Calculate
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            if (equationMode) {
                evaluateEquation();
            } else {
                calculate();
            }
        }
        
        // Delete
        if (e.key === 'Backspace') {
            e.preventDefault();
            deleteNumber();
        }
        
        // Clear
        if (e.key === 'Escape' || e.key === 'Delete') {
            e.preventDefault();
            clear();
        }
        
        // Scientific toggle
        if (e.key === 'f') {
            e.preventDefault();
            toggleScientificMode();
        }
    }

    // Helper functions
    function getOperatorSymbol(operator) {
        switch (operator) {
            case '×': return '*';
            case '÷': return '/';
            default: return operator;
        }
    }
    
    function degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    function displayError() {
        currentOperandElement.textContent = 'Error';
        currentOperandElement.classList.add('error-animation');
        
        setTimeout(() => {
            currentOperandElement.classList.remove('error-animation');
            if (equationMode) {
                equationInput = '';
            }
            currentOperand = '0';
            updateDisplay();
        }, 1500);
    }
    
    function animateResult() {
        currentOperandElement.classList.add('result-animation');
        setTimeout(() => {
            currentOperandElement.classList.remove('result-animation');
        }, 300);
    }

    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        const rect = button.getBoundingClientRect();
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        // Remove the ripple after animation completes
        setTimeout(() => {
            if (circle) {
                circle.remove();
            }
        }, 600);
    }
});