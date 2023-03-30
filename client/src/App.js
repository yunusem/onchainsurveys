import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Survey from './components/Survey';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import ThankYou from './components/ThankYou';
import CasperWalletPresence from './components/CasperWalletPresence';
import CasperWalletContext from './components/CasperWalletContext';
import PrivateRoute from './components/PrivateRoute';
import { UserActivationProvider } from './components/UserActivationContext';

function App() {
  const provider = CasperWalletPresence();

  if (!provider) {
    return (
      <div className="App bg-gray-800 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
        <h1>Please install the Casper Wallet Extension.</h1>
      </div>
    );
  }

  return (
    <UserActivationProvider>
      <CasperWalletContext.Provider value={provider}>
        <Router>
          <div className="App">
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/survey/:id" component={Survey} />
              <PrivateRoute path="/surveys" exact component={SurveyList} />
              <PrivateRoute path="/surveys/new" component={SurveyForm} />
              <PrivateRoute path="/surveys/:id/edit" component={SurveyForm} />
              <Route path="/thankyou" component={ThankYou} />
            </Switch>
          </div>
        </Router>
      </CasperWalletContext.Provider>
    </UserActivationProvider>
  );
}

export default App;
