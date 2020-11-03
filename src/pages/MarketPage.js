import React, {useEffect, useState} from "react";
import { Loading, Tabs, Icon } from "element-react";
import { API, graphqlOperation } from 'aws-amplify';
//import { getMarket } from '../graphql/queries';
import {onCreateProduct, onDeleteProduct, onUpdateProduct} from '../graphql/subscriptions';
import { Link } from 'react-router-dom';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = ( {marketId, user} ) => {
  const [market, setMarket] = useState(null);
  const [showProductUpdate, setShowProductUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);



  const checkMarketOwner = () => {
    console.log('USER', user);
    console.log('market', market);
    if(user && market) {
      setIsMarketOwner(user.username === market.owner)
    }
  };

  useEffect( () => {
    let createProductListener;
    let updateProductListener;
    let deleteProductListener;

    const handleGetMarket = async () => {
      const input = {
        id:marketId
      };
      const result = await API.graphql(graphqlOperation(getMarket, input));
      console.log('result', result);
      let market = result.data.getMarket;
      setMarket(market);
      setIsLoading(false);

      createProductListener = API.graphql(graphqlOperation(onCreateProduct, {owner:user.username}))
        .subscribe({
            next: productData => {
              console.log('next',productData);
              const createdProduct = productData.value.data.onCreateProduct;
              const prevProducts = market.products.items.filter(
                item => item.id !== createdProduct.id
              );
              const updatedProducts = [createdProduct, ...prevProducts];
              const _market = { ...market };
              market.products.items = updatedProducts;
              setMarket(_market);
              setShowProductUpdate(true);
            }
          }
        );
      updateProductListener = API.graphql(graphqlOperation(onUpdateProduct, {owner:user.username}))
        .subscribe({
          next: productData => {
            const updatedProduct = productData.value.data.onUpdateProduct;
            const updatedProductIndex = market.products.items.findIndex(
              item => item.id === updatedProduct.id
            );
            const updatedProducts = [
              ...market.products.items.slice(0, updatedProductIndex),
              updatedProduct,
              ...market.products.items.slice(updatedProductIndex+1)
            ];
            const _market = { ...market };
            market.products.items = updatedProducts;
            setMarket(_market);
            setShowProductUpdate(true);
          }
        });
      deleteProductListener = API.graphql(graphqlOperation(onDeleteProduct, {owner:user.username}))
        .subscribe({
            next: productData => {
              const deletedProduct = productData.value.data.onDeleteProduct;
              const prevProducts = market.products.items.filter(
                item => item.id !== deletedProduct.id
              );
              const updatedProducts = [...prevProducts];
              const _market = { ...market };
              market.products.items = updatedProducts;
              setMarket(_market);
              setShowProductUpdate(true);
            }
          }
        );

    };


    handleGetMarket();
    return () => {
      createProductListener.unsubscribe();
      updateProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setShowProductUpdate(false);
    checkMarketOwner();
  // eslint-disable-next-line
  }, [market, user]);

  return isLoading ? <Loading fullscreen={true} /> : (
    <>
      {/*Back Button*/}
      <Link className='link' to='/'>
        Back to Markets List
      </Link>
      {/*Market Metadata*/}
      <span className='items-center pt-2'>
        <h2 className="">{market.name}</h2>- {market.owner}
      </span>
      <div className='items-center pt-2'>
        <span style={{color:'blue', paddingBottom:'1em'}}>
          <Icon className='icon' name='date'/>
          {market.createdAt}
        </span>
      </div>
      {/*New Product*/}
      <Tabs type='border-card' value={isMarketOwner && !showProductUpdate ? "1" : "2"}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name='plus' className='icon'/>
                  Add Product
              </>
            }
            name='1'
            >
            <NewProduct marketId={marketId}/>
          </Tabs.Pane>)}
        {/*Products list*/}
          <Tabs.Pane label = {
            <>
              <Icon name='menu' className='icon'/>
              Products ({ market.products.items.length})
            </>
          }
          name='2'
          >
         {<div className='product-list'>
            {market.products.items.map(product => <Product key={product.id} product={product}/>)}
          </div>}
          </Tabs.Pane>
      </Tabs>

    </>
  )

};

export default MarketPage;
