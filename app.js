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
    let awaitingSecondOperand = false;
    let scientificMode = false;
    let scientificFunction = null;
    
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
            inputNumber(button.dataset.number);
        });
    });

    // Operator button event listeners
    operatorButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectOperation(button.dataset.operator);
        });
    });

    // Scientific button event listeners
    scientificButtons.forEach(button => {
        button.addEventListener('click', () => {
            executeScientificOperation(button.dataset.scientific);
        });
    });

    // Action button event listeners
    clearButton.addEventListener('click', clear);
    deleteButton.addEventListener('click', deleteNumber);
    calculateButton.addEventListener('click', calculate);
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
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
        resetInput = false;
        
        updateDisplay();
    }

    function deleteNumber() {
        if (currentOperand.length === 1 || currentOperand === '0') {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
        }
        
        updateDisplay();
    }

    function toggleSign() {
        if (currentOperand === '0' || currentOperand === '') return;
        
        currentOperand = String(-parseFloat(currentOperand));
        
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

    function updateDisplay() {
        // Format the current operand for display
        let displayValue = currentOperand;
        
        // Handle large numbers and decimals
        if (displayValue !== '') {
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
        
        if (operation != null) {
            previousOperandElement.textContent = `${previousOperand} ${operation}`;
        } else {
            previousOperandElement.textContent = '';
        }
    }

    function handleKeyboard(e) {
        // Numbers
        if (/^\d$/.test(e.key)) {
            e.preventDefault();
            inputNumber(e.key);
        }
        
        // Decimal point
        if (e.key === '.') {
            e.preventDefault();
            inputNumber('.');
        }
        
        // Operations
        if (e.key === '+') {
            e.preventDefault();
            selectOperation('+');
        }
        if (e.key === '-') {
            e.preventDefault();
            selectOperation('-');
        }
        if (e.key === '*') {
            e.preventDefault();
            selectOperation('×');
        }
        if (e.key === '/') {
            e.preventDefault();
            selectOperation('÷');
        }
        
        // Calculate
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
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