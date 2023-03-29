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
import { useUserActivation } from './hooks/useUserActivation';


function App() {
  const provider = CasperWalletPresence();
  const [userIsActivated] = useUserActivation();

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
            <PrivateRoute path="/survey/:id" component={Survey} userIsActivated={userIsActivated} />
            <PrivateRoute path="/surveys" exact component={SurveyList} userIsActivated={userIsActivated} />
            <PrivateRoute path="/surveys/new" component={SurveyForm} userIsActivated={userIsActivated} />
            <PrivateRoute path="/surveys/:id/edit" component={SurveyForm} userIsActivated={userIsActivated} />
            <Route path="/thankyou" component={ThankYou} />
          </Switch>
        </div>
      </Router>
    </CasperWalletContext.Provider>
  );
}

export default App;
