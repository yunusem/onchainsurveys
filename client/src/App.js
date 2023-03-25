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
//import { connectWallet } from './api';
//import { useState, useEffect } from 'react';

function App() {
  // const CasperWalletProvider = window.CasperWalletProvider;
  // const CasperWalletEventTypes = window.CasperWalletEventTypes;

  // const provider = CasperWalletProvider();

  // const [activePublicKey, setActivePublicKey] = useState(null);

  // const handleWalletConnect = async () => {
  //   try {
  //     const isConnected = await connectWallet(provider);
  //     if (isConnected) {
  //       // Set activePublicKey upon successful connection
  //       const publicKey = await provider.getActivePublicKey();
  //       setActivePublicKey(publicKey);
  //     }
  //   } catch (error) {
  //     console.error("Error connecting wallet: " + error.message);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener(CasperWalletEventTypes.Connected, handleConnected);
  //   return () => {
  //     window.removeEventListener(CasperWalletEventTypes.Connected, handleConnected);
  //   };
  // }, []);

  // const handleConnected = (event) => {
  //   try {
  //     const state = JSON.parse(event.detail);
  //     if (state.activeKey) {
  //       setActivePublicKey(state.activeKey);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  return (
    <Router>
      <div className="App">
        <Switch>
          {/* <Route path="/" exact render={(props) => <Home {...props} activePublicKey={activePublicKey} />} />
          <Route path="/register" component={Register} />
          <Route path="/login" render={(props) => <Login {...props} activePublicKey={activePublicKey} />} />
          <Route path="/logout" render={(props) => <Logout {...props} activePublicKey={activePublicKey} />} />
          <Route path="/survey/:id" render={(props) => <Survey {...props} activePublicKey={activePublicKey} />} /> */}
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
  );
}

export default App;

