import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useUserActivation } from './UserActivationContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [userIsActivated] = useUserActivation();

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
