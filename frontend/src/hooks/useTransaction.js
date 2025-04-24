// custom hook for handling payment processing and transaction creation
import {useState, useEffect} from 'react';
import {createTransaction, fetchTransactions} from '../api';

const useTransaction = (cart, orderTotal, clearCart) => {
    const [transactionNumber, setTransactionNumber] = useState(2001); // Initial fallback
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    // load the next transaction number when component mounts
    useEffect(() => {
        const loadTransactionNumber = async () => {
            try {
                const transactions = await fetchTransactions();
                const latestTransactionNum = transactions.length > 0 ?
                    transactions[0].customer_transaction_num : 2000;
                setTransactionNumber(latestTransactionNum + 1); // get the next number in sequence
                console.log('Next transaction number set to:', latestTransactionNum + 1);
            }
            catch (error) {
                console.error('Error loading transaction number:', error);
                // fallback to default number is handled by initial state
            }
        };

        loadTransactionNumber();
    }, []);

    // helper function to get current date in central time zone with proper format
    function getTransactionDateInCDT() {
        const currentDate = new Date();
        // using swedish locale gives ISO format (YYYY-MM-DD HH:MM:SS)
        // then convert space to T for proper datetime format
        return currentDate.toLocaleString('sv-SE', {timeZone: 'America/Chicago'}).replace(' ', 'T');
    }

    // processes payment and creates transaction record in the backend
    const processPayment = async () => {
        if (cart.length === 0) {
            setPaymentError('Your cart is empty.');
            return;
        }

        setProcessingPayment(true);
        setPaymentError('');
        setPaymentSuccess(false);

        try {
            // use the current transaction number from state
            const currentTransactionNum = transactionNumber;

            // format transaction data for the api
            const transactionData = {
                customer_id: 0, // kiosk orders are anonymous
                transaction_date: getTransactionDateInCDT(),
                transaction_number: currentTransactionNum,
                items: cart.map(item => ({
                    product_id: parseInt(item.product_id, 10),
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    customizations: item.customizations || {} // ensure it's an object
                })),
            };

            console.log('Processing payment for transaction:', transactionData);

            // send transaction to the server
            const result = await createTransaction(transactionData);
            console.log('Transaction saved:', result);

            // payment successful
            setPaymentSuccess(true);

            // increment transaction number for next order
            setTransactionNumber(prev => prev + 1);

            // save current order details for receipt/confirmation
            setCurrentOrder({
                items: [...cart], // create a copy of the cart items
                total: orderTotal.total,
                date: new Date(),
                receiptNumber: currentTransactionNum
            });

            setProcessingPayment(false);
            setShowConfirmation(true); // show confirmation dialog

        }
        catch (err) {
            console.error('Failed to save transaction:', err);
            // use the error message from the API if available
            setPaymentError(err.message || 'Error processing transaction. Please check inventory or try again.');
            setProcessingPayment(false);
            setPaymentSuccess(false);
        }
    };

    // closes order confirmation and resets states for next order
    const handleConfirmationClose = () => {
        setShowConfirmation(false);
        clearCart(); // clear cart for the next order
        setCurrentOrder(null); // clear the displayed order
        setPaymentError(''); // clear any previous payment errors
        setPaymentSuccess(false); // reset success state
    };

    return {
        transactionNumber,
        processingPayment,
        paymentSuccess,
        paymentError,
        showConfirmation,
        currentOrder,
        processPayment,
        handleConfirmationClose,
        setPaymentSuccess
    };
};

export default useTransaction;