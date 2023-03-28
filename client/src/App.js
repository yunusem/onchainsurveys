import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
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
      <div className="App bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
        <h1>Please install the Casper Wallet Extension.</h1>
      </div>
    );
  }

  return (
    <CasperWalletContext.Provider value={provider}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" exact component={Home} />
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
