// ===== GLOBAL CONFIGURATION =====
const CONFIG = {
    MIN_USDT: 500,
    MAX_USDT: 500000,
    FEE_PER_500_USDT: 20, // 20 TRX per 500 USDT
    FEE_DISCOUNT_PERCENTAGE: 5, // 5% discount on fees
    USDT_PRICE_USD: 1.00, // Current USDT price (could be fetched from API)
    TRX_PRICE_USD: 0.25,  // Current TRX price (for display purposes)
    ANIMATION_DELAY: 100,
    TIMER_DURATION: 30 * 60, // 30 minutes in seconds
    DEPOSIT_ADDRESS: 'TMJCNQRMWaR7EG4jENd7xK1nkmHDSnqQaH'
};

// ===== DOM ELEMENTS =====
const elements = {
    usdtAmount: document.getElementById('usdtAmount'),
    email: document.getElementById('email'),
    walletAddress: document.getElementById('walletAddress'),
    pasteBtn: document.getElementById('pasteBtn'),
    youPay: document.getElementById('youPay'),
    youReceive: document.getElementById('youReceive'),
    usdtPrice: document.getElementById('usdtPrice'),
    payButton: document.getElementById('payButton'),
    form: document.getElementById('purchaseForm'),
    amountHelp: document.getElementById('amountHelp'),
    amountError: document.getElementById('amountError'),
    addressError: document.getElementById('addressError'),
    statusMessage: document.getElementById('statusMessage'),
    
    // New elements for calculations
    originalAmount: document.getElementById('originalAmount'),
    discountAmount: document.getElementById('discountAmount'),
    
    // Payment method toggle
    cryptoToggle: document.getElementById('cryptoToggle'),
    fiatToggle: document.getElementById('fiatToggle'),
    
    // Transaction fee display
    transactionFee: document.getElementById('transactionFee'),
    
    // Fee discount elements
    originalFee: document.getElementById('originalFee'),
    feeDiscount: document.getElementById('feeDiscount'),
    
    // Popup elements
    depositPopup: document.getElementById('depositPopup'),
    closePopup: document.getElementById('closePopup'),
    copyAddress: document.getElementById('copyAddress'),
    depositAmount: document.getElementById('depositAmount'),
    timerCountdown: document.getElementById('timerCountdown'),
    cancelPayment: document.getElementById('cancelPayment'),
    checkPayment: document.getElementById('checkPayment'),
    depositAddress: document.getElementById('depositAddress')
};

// ===== UTILITY FUNCTIONS =====
const utils = {
    // Format number to currency
    formatCurrency: (amount, currency = 'TRX', decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(amount) + ' ' + currency;
    },

    // Format large numbers with K/M suffixes
    formatLargeNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Validate TRC20 address format
    isValidTRC20Address: (address) => {
        const trc20Pattern = /^T[A-Za-z1-9]{33}$/;
        return trc20Pattern.test(address);
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    },

    // Debounce function for input events
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate random transaction ID
    generateTransactionId: () => {
        return 'TX' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
};

// ===== PRICE CALCULATION =====
const calculator = {
    // Calculate transaction fee based on USDT amount (20 TRX per 500 USDT)
    calculateTransactionFee: (usdtAmount) => {
        const feeUnits = Math.ceil(usdtAmount / 500);
        return feeUnits * CONFIG.FEE_PER_500_USDT;
    },

    // Calculate fee discount amount
    calculateFeeDiscount: (usdtAmount) => {
        const originalFee = calculator.calculateTransactionFee(usdtAmount);
        return originalFee * (CONFIG.FEE_DISCOUNT_PERCENTAGE / 100);
    },

    // Calculate discounted transaction fee
    calculateDiscountedTransactionFee: (usdtAmount) => {
        const originalFee = calculator.calculateTransactionFee(usdtAmount);
        const discount = calculator.calculateFeeDiscount(usdtAmount);
        return originalFee - discount;
    },

    // Calculate total TRX to pay (discounted transaction fee only)
    calculateTotalTRX: (usdtAmount) => {
        return calculator.calculateDiscountedTransactionFee(usdtAmount);
    },

    // Calculate USD equivalent
    calculateUSDEquivalent: (amount, currency) => {
        if (currency === 'USDT') {
            return amount * CONFIG.USDT_PRICE_USD;
        } else if (currency === 'TRX') {
            return amount * CONFIG.TRX_PRICE_USD;
        }
        return amount;
    },

    // Update calculation display
    updateCalculation: () => {
        const usdtAmount = parseFloat(elements.usdtAmount.value) || 0;
        
        if (usdtAmount >= CONFIG.MIN_USDT && usdtAmount <= CONFIG.MAX_USDT) {
            const totalTRX = calculator.calculateTotalTRX(usdtAmount);
            const originalFee = calculator.calculateTransactionFee(usdtAmount);
            const feeDiscount = calculator.calculateFeeDiscount(usdtAmount);
            const discountedFee = calculator.calculateDiscountedTransactionFee(usdtAmount);
            const feeUnits = Math.ceil(usdtAmount / 500);
            const usdEquivalent = calculator.calculateUSDEquivalent(usdtAmount, 'USDT');
            
            // Update displays with animation
            setTimeout(() => {
                elements.youPay.textContent = utils.formatCurrency(totalTRX, 'TRX');
                elements.youReceive.textContent = utils.formatCurrency(usdtAmount, 'USDT');
                elements.originalAmount.textContent = '';
                elements.discountAmount.textContent = '';
                elements.transactionFee.textContent = `${utils.formatCurrency(discountedFee, 'TRX')}`;
                elements.originalFee.textContent = `Original: ${utils.formatCurrency(originalFee, 'TRX')}`;
                elements.feeDiscount.textContent = `-${utils.formatCurrency(feeDiscount, 'TRX')}`;
                elements.amountHelp.textContent = `Fee: ${utils.formatCurrency(feeUnits, '', 0)} × ${CONFIG.FEE_PER_500_USDT} TRX = ${utils.formatCurrency(originalFee, 'TRX')} (${CONFIG.FEE_DISCOUNT_PERCENTAGE}% off = ${utils.formatCurrency(discountedFee, 'TRX')})`;
                
                // Update button text with discounted fee amount
                const btnText = document.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = `Pay ${utils.formatCurrency(discountedFee, 'TRX'} Fee`;
                }
            }, CONFIG.ANIMATION_DELAY);
        } else {
            elements.youPay.textContent = '-';
            elements.youReceive.textContent = '-';
            elements.originalAmount.textContent = '';
            elements.discountAmount.textContent = '';
            elements.transactionFee.textContent = '-';
            elements.originalFee.textContent = '';
            elements.feeDiscount.textContent = '';
            elements.amountHelp.textContent = '';
            
            // Reset button text
            const btnText = document.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Pay TRX Fee';
            }
        }
    }
};

// ===== FORM VALIDATION =====
const validator = {
    // Validate USDT amount
    validateAmount: () => {
        const amount = parseFloat(elements.usdtAmount.value);
        const amountHelp = elements.amountHelp;
        const amountError = elements.amountError;

        if (!amount) {
            amountHelp.style.display = 'block';
            amountError.style.display = 'none';
            elements.usdtAmount.setCustomValidity('');
            return false;
        }

        if (amount < CONFIG.MIN_USDT) {
            amountHelp.style.display = 'none';
            amountError.style.display = 'block';
            amountError.textContent = `Minimum amount is ${utils.formatCurrency(CONFIG.MIN_USDT, 'USDT', 0)}`;
            elements.usdtAmount.setCustomValidity('Below minimum');
            return false;
        }

        if (amount > CONFIG.MAX_USDT) {
            amountHelp.style.display = 'none';
            amountError.style.display = 'block';
            amountError.textContent = `Maximum amount is ${utils.formatCurrency(CONFIG.MAX_USDT, 'USDT', 0)}`;
            elements.usdtAmount.setCustomValidity('Above maximum');
            return false;
        }

        amountHelp.style.display = 'block';
        amountError.style.display = 'none';
        elements.usdtAmount.setCustomValidity('');
        return true;
    },

    // Validate email
    validateEmail: () => {
        const email = elements.email.value.trim();
        
        if (!email) {
            elements.email.setCustomValidity('Email is required');
            return false;
        }

        if (!utils.isValidEmail(email)) {
            elements.email.setCustomValidity('Invalid email format');
            return false;
        }

        elements.email.setCustomValidity('');
        return true;
    },

    // Validate wallet address
    validateAddress: () => {
        const address = elements.walletAddress.value.trim();
        
        if (!address) {
            elements.walletAddress.setCustomValidity('Wallet address is required');
            return false;
        }

        if (!utils.isValidTRC20Address(address)) {
            elements.walletAddress.setCustomValidity('Invalid TRC20 address format');
            return false;
        }

        elements.walletAddress.setCustomValidity('');
        return true;
    },

    // Validate entire form
    validateForm: () => {
        const isAmountValid = validator.validateAmount();
        const isEmailValid = validator.validateEmail();
        const isAddressValid = validator.validateAddress();
        
        const isValid = isAmountValid && isEmailValid && isAddressValid;
        elements.payButton.disabled = !isValid;
        
        return isValid;
    }
};

// ===== UI MANAGEMENT =====
const ui = {
    // Show status message
    showStatus: (message, type = 'info') => {
        const statusEl = elements.statusMessage;
        statusEl.className = `status-message ${type}`;
        statusEl.innerHTML = ui.getStatusIcon(type) + message;
        statusEl.style.display = 'flex';
        
        // Auto hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    },

    // Get status icon
    getStatusIcon: (type) => {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        };
        return icons[type] || icons.info;
    },

    // Update button state during transaction
    updateButtonState: (loading = false, text = '') => {
        const btnText = elements.payButton.querySelector('.btn-text');
        const btnLoader = elements.payButton.querySelector('.btn-loader');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
            elements.payButton.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            if (text) {
                btnText.textContent = text;
            }
        }
    },

    // Clear form
    clearForm: () => {
        elements.form.reset();
        elements.youPay.textContent = '-';
        elements.youReceive.textContent = '-';
        elements.payButton.disabled = true;
        elements.statusMessage.style.display = 'none';
    }
};

// ===== TRANSACTION PROCESSING =====
const transaction = {
    timerInterval: null,
    timeRemaining: CONFIG.TIMER_DURATION,

    // Start payment process - show deposit popup
    startPaymentProcess() {
        const usdtAmount = parseFloat(elements.usdtAmount.value);
        const email = elements.email.value.trim();
        const address = elements.walletAddress.value.trim();

        if (!validator.validateForm()) {
            ui.showStatus('Please fix the form errors before proceeding', 'error');
            return;
        }

        // Update popup content
        elements.depositAmount.textContent = utils.formatCurrency(CONFIG.TRANSACTION_FEE_TRX, 'TRX');
        
        // Show popup
        elements.depositPopup.style.display = 'flex';
        
        // Start timer
        transaction.startTimer();
        
        ui.showStatus('Deposit popup opened. Please deposit 20 TRX to proceed.', 'info');
    },

    // Start countdown timer
    startTimer() {
        transaction.timeRemaining = CONFIG.TIMER_DURATION;
        transaction.updateTimerDisplay();
        
        transaction.timerInterval = setInterval(() => {
            transaction.timeRemaining--;
            transaction.updateTimerDisplay();
            
            if (transaction.timeRemaining <= 0) {
                transaction.stopTimer();
                transaction.handleTimeout();
            }
        }, 1000);
    },

    // Update timer display
    updateTimerDisplay() {
        const minutes = Math.floor(transaction.timeRemaining / 60);
        const seconds = transaction.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        elements.timerCountdown.textContent = timeString;
        
        // Change color when less than 5 minutes
        if (transaction.timeRemaining <= 300) {
            elements.timerCountdown.style.color = '#FF5C5C';
        } else if (transaction.timeRemaining <= 600) {
            elements.timerCountdown.style.color = '#FFC700';
        } else {
            elements.timerCountdown.style.color = '#00DC82';
        }
    },

    // Stop timer
    stopTimer() {
        if (transaction.timerInterval) {
            clearInterval(transaction.timerInterval);
            transaction.timerInterval = null;
        }
    },

    // Handle timer timeout
    handleTimeout() {
        ui.showStatus('Payment timeout. Please try again.', 'error');
        transaction.closePopup();
        ui.updateButtonState(false, 'Pay 20 TRX Fee');
        elements.payButton.disabled = false;
    },

    // Close popup
    closePopup() {
        transaction.stopTimer();
        elements.depositPopup.style.display = 'none';
    },

    // Simulate payment verification
    async checkPaymentStatus() {
        ui.showStatus('Checking payment status...', 'info');
        
        // Simulate checking blockchain for payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        const usdtAmount = parseFloat(elements.usdtAmount.value);
        const email = elements.email.value.trim();
        const transactionId = utils.generateTransactionId();
        
        ui.showStatus('Payment confirmed! Processing USDT transfer...', 'success');
        
        // Simulate USDT transfer
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        transaction.closePopup();
        
        ui.showStatus(
            `🎉 Transaction completed successfully!<br>
            <strong>Transaction ID:</strong> ${transactionId}<br>
            <strong>Amount:</strong> ${utils.formatCurrency(calculator.calculateDiscountedAmount(usdtAmount), 'USDT')} (5% discount applied)<br>
            <strong>Status:</strong> Confirmed<br>
            <strong>Confirmation sent to:</strong> ${email}`,
            'success'
        );
        
        ui.updateButtonState(false, 'Transaction Complete');
        elements.payButton.disabled = true;
        
        // Auto clear form after 15 seconds
        setTimeout(() => {
            ui.clearForm();
            ui.updateButtonState(false, 'Pay 20 TRX Fee');
        }, 15000);
    }
};

// ===== EVENT HANDLERS =====
const handlers = {
    // Handle amount input changes
    handleAmountChange: utils.debounce(() => {
        calculator.updateCalculation();
        validator.validateAmount();
        validator.validateForm();
    }, 150),

    // Handle email input changes
    handleEmailChange: utils.debounce(() => {
        validator.validateEmail();
        validator.validateForm();
    }, 150),

    // Handle address input changes
    handleAddressChange: utils.debounce(() => {
        validator.validateAddress();
        validator.validateForm();
    }, 150),

    // Handle paste button click
    async handlePasteClick() {
        try {
            const text = await navigator.clipboard.readText();
            elements.walletAddress.value = text.trim();
            handlers.handleAddressChange();
            ui.showStatus('Address pasted successfully', 'success');
        } catch (err) {
            ui.showStatus('Failed to paste from clipboard', 'error');
        }
    },

    // Handle form submission
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validator.validateForm()) {
            ui.showStatus('Please fix the form errors before proceeding', 'error');
            return;
        }

        // Show transaction details before proceeding
        const usdtAmount = parseFloat(elements.usdtAmount.value);
        const totalTRX = calculator.calculateTotalTRX(usdtAmount);
        const discountedAmount = calculator.calculateDiscountedAmount(usdtAmount);
        
        const confirmMessage = `
            Confirm your transaction:<br><br>
            <strong>Original Amount:</strong> ${utils.formatCurrency(usdtAmount, 'USDT')}<br>
            <strong>5% Discount:</strong> -${utils.formatCurrency(calculator.calculateDiscount(usdtAmount), 'USDT')}<br>
            <strong>Final Amount:</strong> ${utils.formatCurrency(discountedAmount, 'USDT')}<br>
            <strong>Fee:</strong> ${utils.formatCurrency(CONFIG.TRANSACTION_FEE_TRX, 'TRX')}<br>
            <strong>Total to Pay:</strong> ${utils.formatCurrency(totalTRX, 'TRX')}<br>
            <strong>Recipient:</strong> ${elements.walletAddress.value.substring(0, 10)}...<br><br>
            Proceed with payment?
        `;
        
        if (confirm(confirmMessage.replace(/<br>/g, '\n'))) {
            transaction.startPaymentProcess();
        }
    },

    // Handle payment method toggle
    handleCryptoToggle() {
        elements.cryptoToggle.classList.add('active');
        elements.fiatToggle.classList.remove('active');
        elements.payButton.disabled = false; // Enable button for crypto payment
        ui.showStatus('Crypto payment selected', 'info');
    },

    // Handle fiat payment toggle
    handleFiatToggle() {
        elements.fiatToggle.classList.add('active');
        elements.cryptoToggle.classList.remove('active');
        elements.payButton.disabled = true; // Disable button for fiat (coming soon)
        ui.showStatus('Fiat payment system coming soon!', 'warning');
    },

    // Handle popup close
    handleClosePopup() {
        transaction.closePopup();
        ui.updateButtonState(false, 'Pay 20 TRX Fee');
        elements.payButton.disabled = false;
    },

    // Handle address copy
    async handleCopyAddress() {
        try {
            await navigator.clipboard.writeText(CONFIG.DEPOSIT_ADDRESS);
            ui.showStatus('Deposit address copied to clipboard!', 'success');
        } catch (err) {
            ui.showStatus('Failed to copy address', 'error');
        }
    },

    // Handle payment cancel
    handleCancelPayment() {
        transaction.closePopup();
        ui.showStatus('Payment cancelled', 'warning');
        ui.updateButtonState(false, 'Pay 20 TRX Fee');
        elements.payButton.disabled = false;
    }
};

// ===== INITIALIZATION =====
const init = () => {
    // Set initial USDT price
    elements.usdtPrice.textContent = CONFIG.USDT_PRICE_USD.toFixed(2);

    // Add event listeners
    elements.usdtAmount.addEventListener('input', handlers.handleAmountChange);
    elements.email.addEventListener('input', handlers.handleEmailChange);
    elements.walletAddress.addEventListener('input', handlers.handleAddressChange);
    elements.pasteBtn.addEventListener('click', handlers.handlePasteClick);
    elements.form.addEventListener('submit', handlers.handleFormSubmit);
    
    // Payment method toggle listeners
    elements.cryptoToggle.addEventListener('click', handlers.handleCryptoToggle);
    elements.fiatToggle.addEventListener('click', handlers.handleFiatToggle);
    
    // Popup event listeners
    elements.closePopup.addEventListener('click', handlers.handleClosePopup);
    elements.copyAddress.addEventListener('click', handlers.handleCopyAddress);
    elements.cancelPayment.addEventListener('click', handlers.handleCancelPayment);
    elements.checkPayment.addEventListener('click', () => transaction.checkPaymentStatus());
    
    // Close popup when clicking outside
    elements.depositPopup.addEventListener('click', (e) => {
        if (e.target === elements.depositPopup) {
            handlers.handleClosePopup();
        }
    });

    // Add input formatting for better UX
    elements.usdtAmount.addEventListener('blur', (e) => {
        const value = parseFloat(e.target.value);
        if (value && !isNaN(value)) {
            e.target.value = value.toFixed(0);
            handlers.handleAmountChange();
        }
    });

    // Initialize form validation
    validator.validateForm();
    
    // Initialize payment method toggle (crypto active by default)
    handlers.handleCryptoToggle();

    // Simulate live price updates (for demo purposes)
    setInterval(() => {
        // Simulate small price fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% change
        const newPrice = Math.max(0.95, Math.min(1.05, CONFIG.USDT_PRICE_USD + fluctuation));
        CONFIG.USDT_PRICE_USD = newPrice;
        elements.usdtPrice.textContent = newPrice.toFixed(2);
    }, 30000); // Update every 30 seconds

    console.log('🚀 USDT TRC20 Purchase Page Initialized');
};

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    ui.showStatus('An unexpected error occurred. Please refresh the page.', 'error');
});

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', init);

// ===== SERVICE WORKER REGISTRATION (for PWA capabilities) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be registered here for offline capabilities
        console.log('Service Worker support detected');
    });
}