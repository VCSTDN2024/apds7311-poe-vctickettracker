import React, { useState, useEffect, useRef } from 'react'

function PaymentPortal({ amount }) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'ZAR', // Default currency
    swiftCode: '',
    status: 'pending'
  })
  const [paymentMethod, setPaymentMethod] = useState('paypal')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypal = useRef()

  // List of common currencies
  const currencies = [
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'EUR', name: 'Euro' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'USD', name: 'US Dollar' },
    // Add more currencies as needed
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setPaymentData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      if (response.ok) {
        const result = await response.json();
        alert(`Payment recorded successfully. Payment ID: ${result.paymentId}`);

        // Reset form or redirect user as needed
      } else {
        const errorData = await response.json();
        alert(`Payment failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    }
  }


  useEffect(() => {
    if (window.paypal) {
      setPaypalLoaded(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID'
      script.addEventListener('load', () => setPaypalLoaded(true))
      document.body.appendChild(script)
    }
  }, [])


  useEffect(() => {
    if (paypalLoaded && paymentMethod === 'paypal') {
      window.paypal
        .Buttons({
          createOrder: (data, actions, err) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: "Cool stuff",
                  amount: {
                    currency_code: "ZAR",
                    value: amount,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            console.log(order);
            alert("PayPal payment successful!");
          },
          onError: (err) => {
            console.log(err);
            alert("PayPal payment failed. Please try again.");
          },
        })
        .render(paypal.current);
    }
  }, [paymentMethod, amount, paypalLoaded])


  const handleSwiftTransfer = async (e) => {
    e.preventDefault();
    try {
      console.log('Processing Swift transfer:', { accountName, accountNumber, swiftCode, amount });
      alert('Swift transfer initiated successfully!');
    } catch (error) {
      console.error('Swift transfer error:', error);
      alert('Swift transfer failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Make International Payment</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="currency">Currency:</label>
          <select
            id="currency"
            name="currency"
            value={paymentData.currency}
            onChange={handleChange}
            required
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
        <div>
        <label>
          <input 
            type="radio" 
            value="paypal" 
            checked={paymentMethod === 'paypal'} 
            onChange={() => setPaymentMethod('paypal')}
          />
          PayPal
        </label>
        <label>
          <input 
            type="radio" 
            value="swiftTransfer" 
            checked={paymentMethod === 'swiftTransfer'} 
            onChange={() => setPaymentMethod('swiftTransfer')}
          />
          Swift Transfer
        </label>
      </div>
      {paymentMethod === 'paypal' ? (
        paypalLoaded ? (
          <div ref={paypal}></div>
        ) : (
          <p>Loading PayPal...</p>
        )
      ) : (
        <form onSubmit={handleSwiftTransfer}>
          <input
            type="text"
            placeholder="Recipient Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Recipient Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="SWIFT/BIC Code"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            required
          />
        </form>
      )}
        <button type="submit">Pay Now</button>
      </form>
    </div>
  )
}

export default PaymentPortal;