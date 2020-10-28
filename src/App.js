import React, { useState, useEffect } from "react";
import { Auth, Hub } from 'aws-amplify';
import { AmplifyTheme, Authenticator } from 'aws-amplify-react';
import { BrowserRouter as Router, Route} from 'react-router-dom';

import "./App.css";
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import Navbar from './components/Navbar';

import { i18n } from 'element-react';
import locale from 'element-react/src/locale/lang/en';

i18n.use(locale);

const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor:"#f90"
  }
};

const UserContext = React.createContext();

const App = () => {

  let [user, setUser] = useState(null);

  const getUserData = async () => {
    user = await Auth.currentAuthenticatedUser();
    user ? setUser(user) : setUser(null);
    console.dir(user);
  };

  const onHubCapsule = capsule => {
    switch(capsule.payload.event) {
      case "signIn":
        getUserData();
        break;
      case "signUp":
        break;
      case "signOut":
        setUser(null);
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    getUserData();
    Hub.listen('auth', onHubCapsule);
    console.dir(AmplifyTheme);
  },[]);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('error', error);
    }
  };

  return !user ? <Authenticator theme={theme}/> : (
     <UserContext.Provider value={{ user }}>
      <Router>
        <>
          {/*Navbar*/}
          <Navbar user={user} handleSignOut={handleSignOut}/>
          {/*Routes*/}
          <div className='app-container'>
            <Route exact path='/' component={HomePage}/>
            <Route path='/profile' component={ProfilePage}/>
            <Route path='/markets/:marketId' component={({match}) => <MarketPage user={user} marketId={match.params.marketId} />} />
          </div>
        </>
      </Router>
     </UserContext.Provider>
    );
};

//export default withAuthenticator(App, true, [], null, theme);
export default App;
export { UserContext };
