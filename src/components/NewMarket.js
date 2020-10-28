import React, { useState }from "react";
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { API, graphqlOperation } from 'aws-amplify';
import {createMarket} from '../graphql/mutations';
import {UserContext} from '../App';

const NewMarket = ({handleSearchChange, handleClearSearch, handleSearch, isSearching, searchTerm}) => {
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [marketName, setMarketName] = useState("");
  const [tags, setTags] = useState(["Number", "Algebra", "Geometry and Measures", "Develop Fluency", "Reason Mathematically", "Solve Problems", "Probability", "Statistics", "Ratio, Proportion and Rates of Change" ]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [options, setOptions] = useState([]);
  const handleAddMarket = async (user) => {
   try {
     setAddMarketDialog(false);
     const input = {
       name: marketName,
       owner:user.username,
       tags:selectedTags
     };
     const result = await API.graphql(graphqlOperation(createMarket, {input}));
     console.log('result',result);
     console.info(`Created market:id ${result.data.createMarket.id}`);
     setMarketName('');
     setSelectedTags([]);
   } catch (error) {
     console.error('Error adding new market', error);
     Notification.error({
       title: 'Error',
       message: `${error.message || 'Error adding market'}`
     });
   }
  };

  const handleFilterTags = query => {
    const options = tags.map(tag => ({value:tag, label:tag }))
      .filter(tag => tag.value.toLowerCase().includes(query.toLowerCase()));
    setOptions(options);
  };
  return (
    <UserContext.Consumer>
      {({ user }) => <>
      <div className='market-header'>
        <h1 className='market-title'>
          Create Your MarketPlace
          <Button
            type='text'
            icon='edit'
            className='market-title-button'
            onClick={() => setAddMarketDialog(true)}
          />
        </h1>

        <Form inline={true} onSubmit={handleSearch}>
            <Form.Item>
              <Input placeholder='Search Markets...'
                     icon='circle-cross'
                     value={searchTerm}
                     onChange={handleSearchChange}
                     onIconClick={handleClearSearch}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type='info'
                icon='search'
                loading={isSearching}
                onClick={handleSearch}>
                Search

              </Button>
            </Form.Item>
        </Form>
      </div>

        <Dialog
        title='Create New Market'
        visible={addMarketDialog}
        onCancel={()=>setAddMarketDialog(false)}
        size='large'
        customClass='dialog'
      >
        <Dialog.Body>
          <Form labelPosition='top'>
            <Form.Item label='Add Market Name'/>
            <Input
                placeholder='Market Name'
                trim={true}
                onChange={marketName => setMarketName(marketName)}
                value={marketName}>
            </Input>
            <Form.Item>
              <Select
                multiple={true}
                filterable={true}
                placeholder="Content Tags"
                onChange={selectedTags => setSelectedTags(selectedTags)}
                remoteMethod={handleFilterTags}
                remote={true}
              >
                {options.map(option =>
                  <Select.Option
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />)
                }
              </Select>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={()=>setAddMarketDialog(false)}>
            Cancel
          </Button>
          <Button type='primary' disabled={!marketName} onClick={() => handleAddMarket(user)}>
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
      </>}
    </UserContext.Consumer>)
};

export default NewMarket;
