import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './components/Logout';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <Route path="/surveys" exact component={SurveyList} />
          <Route path="/surveys/new" component={SurveyForm} />
          <Route path="/surveys/:id/edit" component={SurveyForm} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

