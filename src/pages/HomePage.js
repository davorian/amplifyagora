import React, {useState} from "react";
import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';
import { searchMarkets } from '../graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';

const HomePage = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = searchTerm => setSearchTerm(searchTerm);
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };
 const handleSearch = async (event) => {
   try {
    event.preventDefault();
    console.log('searchTerm', searchTerm);
   const results = await API.graphql(graphqlOperation(searchMarkets, {
      filter: {
        or : [
          { name: { match:searchTerm } },
          { owner:  {match:searchTerm} },
          { tags: { match: searchTerm} }
        ]
      },
        sort: {
          field: "name",
          direction:"desc"
        }
    }));
     console.log('results', results);
     setSearchResults(results.data.searchMarkets.items);
     setIsSearching(false);
   } catch (error) {
     console.error(error);
   }
 };
  return (
        <>
          <NewMarket
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            handleSearch={handleSearch}
            isSearching={isSearching}
            searchTerm={searchTerm}
          />
          <MarketList searchResults={searchResults} searchTerm={searchTerm}/>
        </>
  );
};

export default HomePage;
