/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const AWS = require('aws-sdk');
const config = {
  adminEmail:'don.fasanya@gmail.com',
  region:'eu-west-2',
  accessKeyId:process.env.ACCESS_KEY_ID
  secretAccessKey:process.env.SECRET_ACCESS_KEY
};

const ses = new AWS.SES(config);

const corsOptions = {
  "origin": '*',
  "methods": 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  "preflightContinue": true,
  "optionsSuccessStatus": 200,
  "credentials":true,
  "allowedHeaders":"Content-Type, authorization, x-amz-date, x-amz-security-token"
};

// declare a new express app
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(awsServerlessExpressMiddleware.eventContext());

/****************************
* Example post method *
****************************/

const chargeHandler = async (req, res, next) => {

  const {token: {id}, email, charge: {currency, amount, description}} = req.body;

  try {
    const charge = await stripe.charges.create({
      source: id,
      amount: parseInt(amount, 10),
      currency,
      description
    });

    if (charge.status === 'succeeded') {
      req.charge = charge;
      req.description = description;
      req.email = email;
      next();
    }
  } catch (error) {
    res.status(500).json({error});
  }
};

const emailHandler = (req, res) => {
  const convertPenceToPounds = price => (price /100).toFixed(2);
  const { charge, description, email: { shipped, customerEmail, ownerEmail } } = req;
  ses.sendEmail({
    Source:config.adminEmail,
    ReturnPath:config.adminEmail,
    Destination: {
      ToAddresses: [config.adminEmail, customerEmail, ownerEmail]
    },
    Message: {
      Subject : {
        Data: 'Order Details - Amplify Agora'
      },
      Body: {
        Html:{
          Charset: 'UTF-8',
          Data: `<h3>Order Processed!</h3>
                   <p><span style="font-weight: bold">${description}</span>- 
                      £${convertPenceToPounds(charge.amount)}</p>
                   <p>Customer Email: <a href="mailTo:${customerEmail}">${customerEmail}</a></p>
                   <p>Contact your seller: <a href="mailTo:${ownerEmail}">${ownerEmail}</a></p>              
                   
                   ${shipped ?  
                                `<h4>Mailing Address</h4>
                                <p>${charge.source.name}</p>
                                <p>${charge.source.address_line1}</p>
                                <p>${charge.source.address_city}</p>, <p>${charge.source.address_state}, <p>${charge.source.address_zip}</p>
                                `
                                  : 'Emailed product'
                   }
                   
                   <p style='font-style:italic; color:grey'>
                   ${shipped ?
                        'Your product will be shipped in 2-3 days'
                      : 'Check your email for your emailed product.'
                    }
                    </p>
                 `
        }
      }
    }
  }, ((error, data) => {
    if(error) {
      return res.status(500).json({error})
    }
    res.json({
      message: "Order processed successfully!",
      charge,
      data
    })
  }));
};

app.post('/charge', chargeHandler, emailHandler);

app.listen(3000, function() {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
