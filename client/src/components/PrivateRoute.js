import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, userIsActivated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        userIsActivated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/',
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
