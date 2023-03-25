// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Survey from './components/Survey';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import ThankYou from './components/ThankYou';
import CasperWalletPresence from './components/CasperWalletPresence';
import CasperWalletContext from './components/CasperWalletContext';

function App() {
  const provider = CasperWalletPresence();

  if (!provider) {
    return (
      <div className="App">
        <p>Please install the Casper Wallet Extension.</p>
      </div>
    );
  } else {
    localStorage.setItem('walletprovider', provider);
  }

  return (
    <CasperWalletContext.Provider value={provider}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/survey/:id" component={Survey} />
            <Route path="/thankyou" component={ThankYou} />
            <Route path="/surveys" exact component={SurveyList} />
            <Route path="/surveys/new" component={SurveyForm} />
            <Route path="/surveys/:id/edit" component={SurveyForm} />
            <Route path="/thankyou" component={ThankYou} />
          </Switch>
        </div>
      </Router>
    </CasperWalletContext.Provider>
  );
}

export default App;
