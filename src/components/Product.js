import React, {useState} from "react";
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio, Progress } from "element-react";
import { convertPenceToPounds, convertPoundsToPence } from '../utils';
import { UserContext} from '../App';
import PayButton from './PayButton';
import  {API, graphqlOperation} from 'aws-amplify';
import { PhotoPicker, S3Image } from 'aws-amplify-react';
import { deleteProduct, updateProduct } from '../graphql/mutations';

const Product = ({product})  => {

  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(null);
  const [shipped, setShipped] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const handleUpdateProduct = async (productId) => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id:productId,
        description,
        shipped,
        price:convertPoundsToPence(price)
      };

      const result  = await API.graphql(graphqlOperation(updateProduct, {input}));

      Notification({
        title:'Success',
        message: 'Product successfully updated',
        type: 'success',
        duration: 3000
      });
      //setTimeout(()=>window.location.reload(), 3500)
    } catch (error) {
      Notification.error({
        title:'Error',
        message: `Failed to update product with id ${productId} - ${error}`,
        type: 'success'
      })
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setDeleteProductDialog(false);
      const input = {
        id:productId
      };

      const result  = await API.graphql(graphqlOperation(deleteProduct, {input}));

      Notification({
        title:'Success',
        message: 'Product successfully deleted',
        type: 'success',
        duration: 3000
      });
      //setTimeout(()=>window.location.reload(), 3500)
    } catch (error) {
      Notification.error({
        title:'Error',
        message: `Failed to delete product with id ${productId} - ${error}`,
        type: 'success'
      })
    }
  };

  return (
      <UserContext.Consumer>
        {({user}) => {

          const isProductOwner = user && user.attributes.sub === product.owner;

          let div = <>
            <div className='card-container'>
              <Card bosyStyle={{padding: 0, minWidth: '200px'}}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: {maxWidth: '100%', maxHeight: '100%'}
                  }}
                />
                <div className='card-body'>
                  <h3 className='m-0'>{product.description}</h3>
                  <div className='items-center'>
                    <img
                      src={`https://icon.now.sh/${product.shipped ? 'markunread_mailbox' : 'mail'}`}
                      alt='Shipping Icon'
                      className='icon'
                    />
                    {product.shipped ? 'Shipped' : 'Emailed'}
                  </div>
                  <div className='text-right'>
              <span className='mx-1'>
                £{convertPenceToPounds(product.price)}
              </span>
                    {!isProductOwner && (
                      <PayButton product={product} user={user}/>
                    )}
                  </div>
                </div>
              </Card>
              {/*Update / Delete Product Buttons*/}
              <div className='text-center'>
                {isProductOwner && (
                  <>
                    <Button
                      type='warning'
                      icon='edit'
                      className='m-1'
                      onClick={() => {
                        setUpdateProductDialog(true);
                        setDescription(product.description);
                        setShipped(product.shipped);
                        setPrice(convertPenceToPounds(product.price));
                      }}
                    />
                    <Popover
                     placement='top'
                     width='160'
                     trigger='click'
                     visible={deleteProductDialog}
                     content={
                       <>
                         <p>Do you want to delete this?</p>
                         <div className="text-right">
                           <Button
                            size='mini'
                            type='text'
                            className='m-1'
                            onClick={() => setDeleteProductDialog(false)}
                           >
                             Cancel
                           </Button>
                           <Button
                             size='mini'
                             type='primary'
                             className='m-1'
                             onClick={() => handleDeleteProduct(product.id)}
                           >
                             Confirm
                           </Button>
                         </div>
                       </>
                     }
                    >
                    <Button
                      type='danger'
                      icon='delete'
                      onClick={() => setDeleteProductDialog(true)}
                    />
                    </Popover>
                  </>
                )}
              </div>
              {/*Update product dialog*/}
              <Dialog
                title='Update Product'
                size='large'
                visible={updateProductDialog}
                onCancel={() => setUpdateProductDialog(false)}
              >
                <Dialog.Body>
                  <Form labelPosition='top'>
                    <Form.Item label='Update Description'>
                      <Input icon='information'
                             placeholder='Description'
                             trim={true}
                             onChange={description => setDescription(description)}
                             value={description}
                      />
                    </Form.Item>
                    <Form.Item label='Update Price'>
                      <Input type='number'
                             icon='plus'
                             placeholder='Price (£GBP)'
                             onChange={price => setPrice(price)}
                             value={price}
                      />
                    </Form.Item>
                    <Form.Item label='Update shipped or emailed to the customer?'>
                      <div className='text-center'>
                        <Radio
                          value='true'
                          checked={shipped === true}
                          onChange={() => {
                            setShipped(true)
                          }}
                        >
                          Shipped
                        </Radio>
                        <Radio value='false'
                               checked={shipped === false}
                               onChange={() => {
                                 setShipped(false)
                               }}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() => setUpdateProductDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='primary'
                    onClick={() => handleUpdateProduct(product.id)}
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          </>;
          return div;
        }}
      </UserContext.Consumer>
    );

};

export default Product;
