import React, {useState} from "react";
import { Form, Button, Input, Notification, Radio, Progress } from "element-react";
import { PhotoPicker } from 'aws-amplify-react';
import  aws_exports from '../aws-exports';
import { Storage, Auth, API, graphqlOperation } from 'aws-amplify';
import { createProduct } from '../graphql/mutations';
import { convertPoundsToPence } from '../utils';

const NewProduct = ({marketId}) => {

  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState(0);

  const setInitialState = () => {
    setShipped(false);
    setDescription("");
    setPrice('');
    setImagePreview(null);
    setImage(null);
    setIsUploading(false);
    setPercentUploaded(0);
    setPreviewSrc(null);
  };

  const handleAddProduct = async () => {
    try {
      setIsUploading(true);
      const visibility = "public";
      const {identityId} = await Auth.currentCredentials();
      const filepath = `/${visibility}/${identityId}/${Date.now()}-${image.name}`;
      const uploadedFile = await Storage.put(filepath, image.file,
        {
            'contentType': image.type,
            'progressCallback': progress => {
              console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            const percentUploaded = Math.round(progress.loaded/progress.total * 100);
            setPercentUploaded(percentUploaded);
            }
          }
      );

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_user_files_s3_bucket_region
      };

      //input for create product mutation
      const input = {
        productMarketId: marketId,
        description,
        shipped,
        price:convertPoundsToPence(price),
        file
      };

      const result = await API.graphql(graphqlOperation(createProduct, {input}));
      console.log('Created product ', result);
      Notification({
        title: 'Success',
        message: 'Product successfully created!',
        type: 'success'
      });

    } catch (error) {
      console.error('Error adding product', error)
    } finally {
      setInitialState();
    }
  };

  return (
    <div className='flex-center'>
      <h2 className='header'>Add New Product</h2>
      <div>
        <Form className='market-header'>
          <Form.Item label='Add Product Description'>
            <Input type='text'
            icon='information'
            placeholder='Description'
            onChange={description => setDescription(description)}
            value={description}
            />
          </Form.Item>
          <Form.Item label='Set Product Price'>
            <Input type='number'
                   icon='plus'
                   placeholder='Price (£GBP)'
                   onChange={price => setPrice(price)}
                   value={price}
            />
          </Form.Item>
          <Form.Item label='Is the product shipped or emailed to the customer?'>
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
          {imagePreview && (
            <img
              className='image-preview'
              src={imagePreview}
              alt='Product Preview'
            />
          )}
          {percentUploaded > 0 && (
            <Progress
              type='circle'
              className='progress'
              status='success'
              showText={true}
              percentage={percentUploaded}/>
          )}
          <PhotoPicker
            title='Upload a Photo'
            previewSrc={previewSrc}
            preview='hidden'
            onLoad={url => setImagePreview(url)}
            onPick={file => setImage(file)}
          />
          <Form.Item>
            <Button
              type='primary'
              onClick={handleAddProduct}
              disabled={!image || !description || !price || isUploading}
              loading={isUploading}
              >
              {isUploading ? 'Uploading Product....' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>);
};

export default NewProduct;
