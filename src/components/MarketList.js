import React, { Context } from "react";
import { Connect } from 'aws-amplify-react';
import { graphqlOperation } from 'aws-amplify';
import { listMarkets } from '../graphql/queries'
import { onCreateMarket } from '../graphql/subscriptions';
import { Loading, Card, Icon, Tag } from "element-react";
import Error from './Error';
import { Link } from 'react-router-dom';
import { Cart, Shop } from 'react-bootstrap-icons';

const MarketList = ({searchResults, searchTerm}) => {

  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ];
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  };

  return (
    <Connect
          query={graphqlOperation(listMarkets)}
          subscription={graphqlOperation(onCreateMarket)}
          onSubscriptionMsg={onNewMarket}>
      {({data, loading, errors}) => {
        if (errors.length > 0) {
          return <Error errors={errors}/>
        }
        if (loading) return <Loading fullscreen={true}/>;
        const markets = searchResults.length > 0 ? searchResults : data.listMarkets.items;
        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className='text-green'>
                <Icon type='success' name='check' className='icon' />
                 {searchResults.length} Results for {searchTerm}
              </h2>
            ): (
              <h2 className='header'>
              <Shop className='app-icon'/>
                Markets
              </h2>)}
            {markets.map(market => (
              <div key={market.id} className='my-2' style={{display:'flex'}}>
                <div className='body-style'>
                  <div>
                   <span>
                     <Link className='link' to={`/markets/${market.id}`}>
                       {market.name}
                     </Link>
                     <span>
                       {market.products.items ? ` ${market.products.items.length} `:' (0) '}
                     </span>
                     <Cart />
                   </span>
                    <div>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags && market.tags.map(tag => (
                      <Tag key={tag} type='danger' className='mx-1'>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>);
      }}
    </Connect>
  );
};

export default MarketList;
