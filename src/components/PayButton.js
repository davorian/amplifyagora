import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { getUser } from '../graphql/queries';
// eslint-disable-next-line
import { createOrders } from '../graphql/mutations';
// eslint-disable-next-line
import { Notification, Message } from 'element-react';
// eslint-disable-next-line
import { history } from '../App';

const stripeConfig = {
  currency: 'GBP',
  publishableAPIKey: 'pk_test_DpRBQjP7MCnMZtjsZVBd6hS900WKmba8yz'
};

const PayButton = ({product, userAttributes}) => {

  const getOwnerEmail = async ownerId => {
    console.log('getOwnerEmail - owner Id',ownerId);
    const input = {id:ownerId};
    try {
    const result = await API.graphql(graphqlOperation(getUser, input));
      return result.data.getUser.email;
    } catch (error) {
      console.log(`Error fetching product owner's email`, error);
    }
  };

  const createShippingAddress = source => ({
      city: source.address_city,
      country: source.address_country,
      address_line1: source.address_line1,
      address_state: source.address_state,
      address_country: source.address_country,
      address_zip:source.address_zip
  });

  const handleCharge = async (token) => {
    try {

      const ownerEmail = await getOwnerEmail(product.owner);
      console.log('ownerEmail', ownerEmail);

      const body = {
        token,
        charge: {
          currency: stripeConfig.currency,
          amount: product.price,
          description: product.description
        },
        //userAttributes.email,
        //ownerEmail
        email: {
          customerEmail: 'don.fasanya@gmail.com',
          ownerEmail: 'don.fasanya@gmail.com' ,
          shipped: product.shipped
        }
      };
      const result = await API.post('orderlambda', '/charge', {body});
      console.log('result', result);
      if(result.charge.status === 'succeeded') {
        // eslint-disable-next-line
        let shippedAddress = null;
        if (product.shipped) {
          shippedAddress = createShippingAddress(result.charge.source)
        }

        const input = {
          orderUserId: userAttributes.sub,
          orderProductId: product.id,
          shippedAddress
        };

        const order = await API.graphql(graphqlOperation(createOrders, {input}));
        console.log('order',order);

        Notification({
          title:'Success!',
          message: `${result.message}`,
          type: 'success',
          duration: 3000,
          'onClose': () => {
            history.push('/');
            Message({
              type: 'info',
              message: 'Check your verified email for order details',
              duration: 4000,
              showClose: true
            })
          }
        });
      }

    } catch (error) {

      console.error(error);
      Notification.error({
        title:'Error',
        message: `${error.message || 'Error processing order'}`,
        duration: 3000,
      });

    }
  };

  return <StripeCheckout
    token={handleCharge}
    email={userAttributes.email}
    name={product.description}
    amount={product.price}
    currency={stripeConfig.currency}
    stripeKey={stripeConfig.publishableAPIKey}
    shippingAddress={product.shipped}
    billingAddress={false}
    locale='auto'
    allowRememberMe={true}/>;
}

export default PayButton;
