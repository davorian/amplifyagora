import React from "react";
import { Notification, Message } from "element-react";
import { API } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';

const stripeConfig = {
  currency: 'GBP',
  publishableAPIKey: 'pk_test_DpRBQjP7MCnMZtjsZVBd6hS900WKmba8yz'
};


const PayButton = ({product, user}) => {

  const handleCharge = async (token) => {
    console.log('token', token);
    try {
      const result = await API.post('orderlambda', '/charge', {
        body : JSON.stringify(token),
        charge: {
          currency: stripeConfig.currency,
          amount: product.price,
          description: product.description
        }
      });
      console.log('result',result);
    } catch (error) {
      console.error(error);
    }
  };

  return <StripeCheckout
    token={handleCharge}
    email={user.attributes.email}
    name={product.description}
    amount={product.price}
    currency={stripeConfig.currency}
    stripeKey={stripeConfig.publishableAPIKey}
    shippingAddress={product.shippingAddress}
    billingAddress={product.billingAddress}
    locale='auto'
    allowRememberMe={true}/>;
};

export default PayButton;
