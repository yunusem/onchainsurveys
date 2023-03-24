import './App.css';
//import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
//import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
//import { MDBBadge, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
//import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle } from 'mdb-react-ui-kit';
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

function App() {
  return (
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
  );
}

export default App;

