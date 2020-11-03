import React, {useState, useEffect} from "react";
import {API, Auth, graphqlOperation} from 'aws-amplify';
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { convertPenceToPounds } from '../utils';

export const getUser =`
query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC, limit: 999) {
        items {
          id
          createdAt
          updatedAt
          product {
            id
            description
            price
            owner
            createdAt
          }
          shippingAddress {
            city 
            country 
            address_line1 
            address_state 
            address_zip
          }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
}
`;

const ProfilePage = ({user, userAttributes}) => {
  console.log('userAttributes', userAttributes);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState(userAttributes.email);
  const [emailDialog, setEmailDialog] = useState(false);
  const [verificationForm, setVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const getUserOrders = async userId => {
    const input = {id: userId};
    const result = await API.graphql(graphqlOperation(getUser, input));
    setOrders(result.data.getUser.orders.items);
  };

  const [columns] = useState([
      {prop: 'name', width: '150'},
      {prop: 'value', width: '330'},
      {
        prop: 'tag', width: '150', render: row => {
          if (row.name === "Email") {
            const emailVerified = userAttributes.email_verified;
            console.log('userAttributes', userAttributes);
            return emailVerified ?
              (<Tag type='success'>Verified</Tag>)
              :
              (<Tag type='danger'>Unverified</Tag>)
          }
        }
      },
      {
        prop: 'operations', width: '150', render: row => {
          switch (row.name) {
            case "Email":
              return (
                <Button type='info'
                        size='small'
                        onClick={() => {
                          setEmailDialog(true)
                        }}
                >
                  Edit
                </Button>
              );
            case "Delete Profile":
              return (
                <Button type='danger'
                        size='small'
                >
                  Delete Profile
                </Button>
              );

            default :
              return;
          }
        }
      }
    ]
  );

  useEffect( () => {
    if (user) {
       getUserOrders(userAttributes.sub);
    }
    }, [orders]
  );


  const handleUpdateEmail = async () => {
    const updatedAttributes = {
      email,

    };

    const sendVerificationCode  = async (attr) => {
      await Auth.verifyCurrentUserAttribute(attr);
      setVerificationForm(true);
      Message({
        type:'info',
        customClass: 'message',
        message: `Verification code sent to ${email}`
      })
    };

    try {

      const result = await Auth.updateUserAttributes(user, updatedAttributes);

      if (result === 'SUCCESS') {
        sendVerificationCode('email');
      }
    } catch (error) {
      console.error(error);
      Notification.error({
        title:'Error',
        message: `${error.message || 'Error in updating'}`
      })
    }
  };

  const handleVerifyEmail = async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        verificationCode
      );

      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${result.toLowerCase()}`,
        'onClose': () => window.location.reload()
      })
    } catch (error) {
      console.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error updating'}`
      })
    }
  };

  return (userAttributes ? <>
      <Tabs activeName='1' className='profile-tabs'>
        <Tabs.Pane
          name='1'
          label={
            <>
              <Icon name='document' className='icon'/>
              Summary
            </>
          }
        >
          <h2 className='header'>Profile Summary</h2>
          <Table
            stripe={true}
            columns={columns}
            data={[
              {
                name: 'Your Id',
                value: userAttributes.sub
              },
              {
                name: 'Username',
                value: user.username
              },
              {
                name: 'Email',
                value: userAttributes.email
              },
              {
                name: 'Phone number',
                value: userAttributes.phone_number
              },
              {
                name: 'Delete Profile',
                value: 'Sorry to see you go.'
              }
            ]}
            showHeader={false}
            rowClassName={row => row.name === 'Delete Profile' && 'delete-profile'}
          />
        </Tabs.Pane>
        <Tabs.Pane
          name='2'
          label={
            <>
              <Icon name='document' className='icon'/>
              Orders
            </>
          }
        >
          <h2 className='header'>Order History</h2>
          {orders.map(order => {
            const {
              shippingAddress: {address_line1, city, address_state, country, address_zip},
              product: {description, price}, id, createdAt
            } = order;
            return ( userAttributes && (
              <div className='mb-1' key={id}>
                <Card>
                    <pre>
                      <p>Order Id: {id}</p>
                      <p>Product Description: {description}</p>
                      <p>Price: £{convertPenceToPounds(price)}</p>
                      <p>Purchased on: {createdAt}</p>
                      {address_line1 && (
                        <>
                          Shipping Address
                          <div className='m1-2'>
                            <p>{address_line1}</p>
                            <p>{city}</p>
                            <p>{address_state}</p>
                            <p>{country}</p>
                            <p>{address_zip}</p>
                          </div>
                        </>
                      )}
                    </pre>
                </Card>
              </div>)
            )
          })}
        </Tabs.Pane>
      </Tabs>
      {/*Email Dialog*/}
      <Dialog
        size='large'
        customClass='dialog'
        title='Edit Email'
        visible={emailDialog}
        onCancel={() => setEmailDialog(false)}
        >
          <Dialog.Body>
            <Form labelPosition='top'>
              <Form.Item label='Email'>
                <Input
                  value={email}
                  onChange={email => setEmail(email)}
                />
              </Form.Item>
              {verificationForm && (
                <Form.Item
                  label={'Enter verification code'}
                  labelWidth="120"
                >
                  <Input
                    onChange={verificationCode => setVerificationCode(verificationCode)}
                    value={verificationCode}
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => setEmailDialog(false)}>
              Cancel
            </Button>
            {!verificationForm && <Button type='primary' onClick={() => handleUpdateEmail()}>
              Save
            </Button>}
            {verificationForm && <Button type='primary' onClick={() => handleVerifyEmail('email')}>
              Submit
            </Button>}
          </Dialog.Footer>
      </Dialog>
    </> : null
  )
};

export default ProfilePage;
