// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { HashRouter } from "react-router-dom";
// import { Provider } from "react-redux";
import { setContext } from '@apollo/client/link/context';

// import { configureStore } from "./store";
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client';
// require('dotenv').config()
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API_URL
});
function checkTokenValidity () {

  const token = localStorage.getItem("token_Lobby_Gold_Valley")
// console.log("the token",token)
//   fetch(process.env.REACT_APP_BACKEND_URL+"/api/frontend/whoami/", {
//     method: "POST",
//     headers: {
//       "Content-type": "application/json"
//     },
//     body: JSON.stringify({ "token":token })
//   })
//     // .then(response => response.json())
//     .then(response => console.log(response))
//     .then(data => {
//       if (!data || !data.ok) {
//         window.location.href = "/login"
//       }
//     })
//     .catch(error => {
//       console.error("Error checking token validity:", error)
//     })
    return token
}


const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem("token");
  const token = checkTokenValidity()
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "authorization": token ,
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
  {/* <Provider> */}
    <React.Fragment>
      <HashRouter basename={process.env.PUBLIC_URL}>
        <App />
      </HashRouter>
    </React.Fragment>
  {/* </Provider> */}
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
