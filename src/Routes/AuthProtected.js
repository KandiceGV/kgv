import React , { useEffect,useState }from 'react';
// import { Navigate, Route } from "react-router-dom";
import { Route } from "react-router-dom";
// import { setAuthorization } from "../helpers/api_helper";
// import { useDispatch } from "react-redux";

// import { useProfile } from "../Components/Hooks/UserHooks";

// import { logoutUser } from "../store/actions";

const AuthProtected = (props) => {
  const [render, setRender] = useState(false);

  // const dispatch = useDispatch();
  // const { userProfile, loading, token } = useProfile();
  const checkTokenValidity = () => {
    const token = localStorage.getItem("token_Lobby_Gold_Valley")
  // console.log(token)
    fetch(process.env.REACT_APP_BACKEND_URL + "/api/frontend/whoami/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "token":token })
    })
    //   .then(response => response.json())
    // .then(response => console.log(response))

      .then(data => {
        if (!data || !data.ok) {
          setRender(false)
          window.location.href = "/#/login"
        }else{
          setRender(true)
        }
      })
      .catch(error => {
        console.error("Error checking token validity:", error)
      })
  }
  useEffect(() => {
    checkTokenValidity()
    // if (userProfile && !loading && token) {
    //   setAuthorization(token);
    // } else if (!userProfile && loading && !token) {
    //   dispatch(logoutUser());
    // }
  }, 
  // [token, userProfile, loading, dispatch]
  );

  /*
    redirect is un-auth access protected routes via url
  */

  // if (!userProfile && loading && !token) {
  //   return (
  //     <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
  //   );
  // }

  return <>{render?props.children:""}</>;
};

const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        return (<> <Component {...props} /> </>);
      }}
    />
  );
};

export { AuthProtected, AccessRoute };