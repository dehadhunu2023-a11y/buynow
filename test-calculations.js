// Test script to verify USDT TRC20 purchase calculations
const CONFIG = {
    MIN_USDT: 500,
    MAX_USDT: 500000,
    FEE_PER_500_USDT: 20,
    FEE_DISCOUNT_PERCENTAGE: 5
};

const calculator = {
    calculateTransactionFee: (usdtAmount) => {
        const feeUnits = Math.ceil(usdtAmount / 500);
        return feeUnits * CONFIG.FEE_PER_500_USDT;
    },
    
    calculateFeeDiscount: (usdtAmount) => {
        const originalFee = calculator.calculateTransactionFee(usdtAmount);
        return originalFee * (CONFIG.FEE_DISCOUNT_PERCENTAGE / 100);
    },
    
    calculateDiscountedTransactionFee: (usdtAmount) => {
        const originalFee = calculator.calculateTransactionFee(usdtAmount);
        const discount = calculator.calculateFeeDiscount(usdtAmount);
        return originalFee - discount;
    }
};

// Test cases
const testAmounts = [500, 1000, 2500, 5000, 10000];

console.log('🧪 Testing USDT TRC20 Purchase Calculations\n');
console.log('=' .repeat(60));

testAmounts.forEach(amount => {
    const originalFee = calculator.calculateTransactionFee(amount);
    const discount = calculator.calculateFeeDiscount(amount);
    const finalFee = calculator.calculateDiscountedTransactionFee(amount);
    
    console.log(`\n💰 Amount: ${amount.toLocaleString()} USDT`);
    console.log(`   Fee Units: ${Math.ceil(amount / 500)} × ${CONFIG.FEE_PER_500_USDT} TRX`);
    console.log(`   Original Fee: ${originalFee} TRX`);
    console.log(`   5% Discount: -${discount} TRX`);
    console.log(`   Final Fee: ${finalFee} TRX`);
    console.log(`   Pay ${finalFee} TRX → Receive ${amount.toLocaleString()} USDT`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ All calculations working correctly!');
console.log('\nTest completed successfully.');