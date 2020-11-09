import React, { useState, useEffect } from "react";

import { Router, Route} from 'react-router-dom';
import { createBrowserHistory } from 'history';
//dep of r-r-d so we can still use even though not in pkg.json

import { Auth, Hub,  API, graphqlOperation } from 'aws-amplify';
import { AmplifyTheme, Authenticator } from 'aws-amplify-react';
import { getUser} from './graphql/queries';
import { registerUser } from './graphql/mutations';//reqs { input:rUInput }

import locale from 'element-react/src/locale/lang/en';
import { i18n } from 'element-react';

import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import Navbar from './components/Navbar';

import "./assets/styles/App.css";
import { ThemeProvider } from 'styled-components';
import mainTheme from './assets/styles/theme';

import { GlobalStyles } from './assets/styles/global';

i18n.use(locale);

export const history = createBrowserHistory();

const amplifyTheme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor:"#f90"
  }
};



const UserContext = React.createContext();

const App = () => {

  let [user, setUser] = useState(null);
  let [userAttributes, setUserAttributes] = useState(null);
  let [theme, setTheme] = useState('light');

// The function that toggles between themes
  const toggleTheme = () => {
    // if the theme is not light, then set it to dark
    if (theme === 'light') {
      setTheme('dark');
      // otherwise, it should be light
    } else {
      setTheme('light');
    }
  };


  const getUserAttributes = async (authUserData) => {
    const currentUserInfo = await Auth.currentUserInfo();
    console.log('currentUserInfo',currentUserInfo);
    if(currentUserInfo)
      setUserAttributes(currentUserInfo.attributes);
  };

  useEffect(() => {
    getUserAttributes(user);
  }, [user]);

  const getUserData = async () => {
    user = await Auth.currentAuthenticatedUser();
    user ? setUser(user) : setUser(null);
  };

  const registerNewUser = async signInData => {
    const getUserInput = {
      id:signInData.signInUserSession.idToken.payload.sub
    };

    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username:signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        };

        const newUser = await API.graphql(graphqlOperation(registerUser, {input: registerUserInput } ));
        console.log('newUser', newUser);

      } catch (error) {
        console.error('Error registering new user', error);
      }
    }

  };

  const onHubCapsule = capsule => {
    switch(capsule.payload.event) {
      case "signIn":
        getUserData();
        registerNewUser(capsule.payload.data);
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
  // eslint-disable-next-line
  },[]);

  const handleSignOut = async () => {
    console.log('handleSignOut');
    try {
      await Auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.log('error', error);
    }
  };

  return !userAttributes ? <Authenticator theme={amplifyTheme}/> : (
    <ThemeProvider theme={theme === 'light' ? mainTheme.lightTheme :mainTheme.darkTheme}>
      <GlobalStyles />
      <h1></h1>
      <UserContext.Provider value={{ user, userAttributes }}>
        <Router history={history}>
          <>
            {/*Navbar*/}
            <Navbar user={user} toggleTheme={toggleTheme} theme={theme} handleSignOut={handleSignOut}/>
            {/*Routes*/}
            <div >
              <Route exact path='/' component={HomePage}/>
              <Route path='/profile' component={() => <ProfilePage user={user} userAttributes={userAttributes}/>} />
              <Route path='/markets/:marketId' component={({match}) => <MarketPage user={user} userAttributes={userAttributes} marketId={match.params.marketId} />} />
            </div>
          </>
        </Router>
      </UserContext.Provider>
    </ThemeProvider>
    );
};

export default App;
export { UserContext };
