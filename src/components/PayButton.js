import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { getUser } from '../graphql/queries';

const stripeConfig = {
  currency: 'GBP',
  publishableAPIKey: 'pk_test_DpRBQjP7MCnMZtjsZVBd6hS900WKmba8yz'
};

const PayButton = ({product, user}) => {

  const getOwnerEmail = async ownerId => {
    const input = {id:ownerId};
    try {
    const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (error) {
      console.error(`Error fetching product owner's email`, error);
    }
  };

  const handleCharge = async (token) => {
    try {
      const ownerEmail = getOwnerEmail(product.owner);
      console.log('ownerEmail', ownerEmail);
      const input = {
        token,
        charge: {
          currency: stripeConfig.currency,
          amount: product.price,
          description: product.description
        },
        email: {
          customerEmail: user.attributes.email,
          ownerEmail,
          shipped: product.shipped
        }
      };
      const result = await API.post('orderlambda', '/charge', {body:input});
      console.log('resultC', result);
    } catch (error) {
      console.log('error fork');
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
