import React, { useState } from "react";
// import { Link } from 'react-router-dom';
// import { Col, Container, Input, Row, Button } from "reactstrap";
// import ParticlesAuth from "./ParticlesAuth";
// import { useMutation, gql } from "@apollo/client";
// import moment from "moment";
import "./css/goldValley.css";

//import images
// import logoLight from "../../../assets/images/logo-light.png";
// console.log("the data",JSON.stringify(data))
// const LASTLOGIN_MUTATION = gql`
//   mutation setLastLogin($username: String = "", $last_login: timestamptz = "") {
//     update_shops(
//       where: { username: { _eq: $username } }
//       _set: { last_login: $last_login }
//     ) {
//       affected_rows
//     }
//   }
// `;
async function loginUser(username, password) {
  const url = process.env.REACT_APP_BACKEND_URL + "/api/frontend/authenticate/";
  const data = {
    username: String(username),
    password: String(password),
    client_type: "user",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(data),
      // body: data
    });
    // console.log("response0", response);

    if (!response.ok) {
      console.log("response1", response);

      throw new Error("Failed to log in.");
    }

    const token = await response.json();
    console.log("response", token.token);

    return token.token;
  } catch (error) {
    console.error(error);
    alert(error);
  }
}

const BasicSignIn = () => {

  // const [set_Last_Login_Game] = useMutation(LASTLOGIN_MUTATION);
  function login(username, password) {

    loginUser(username, password)
      .then((token) => {
        if (token !== undefined) {
          // console.log("Logged in successfully:", token);
          // Add code here to redirect the user to the appropriate page
          localStorage.setItem("token_Lobby_Gold_Valley", token);
          localStorage.setItem("user", username);
          // const right_now = moment().format("YYYY-MM-DDTHH:mm:ssZ");
          // set_Last_Login_Game({
          //   variables: {
          //     username: username,
          //     last_login: right_now,
          //   },
          // });
          window.location.href = "/#/home";
        } else {
          // alert("Wrong Credentials")
        }
      })
      .catch((error) => {
        console.error("Failed to log in:", error);
      });
  }
  const [Username, setUsername] = useState("")
  const [Password, setPassword] = useState("")
  // const handleKeyPress = (event) => {
  //   if (event.key === "Enter") {
  //     login();
  //   }
  // };
  // const togglePasswordVisibility = () => {
  //   setIsPasswordVisible(!isPasswordVisible);
  // };

  // useEffect(
  //   () => {
  //     if ("aviator") ||
  //     window.location.hostname === "localhost") {
  //       document.documentElement.classList.add("aviator_a");
  //     }
  //     else{
  //       document.documentElement.classList.remove("aviator_a");
  //     }
  //   },
  //   // eslint-disable-next-line
  //   []
  // );

  return (
<div id="login" className="content content-active gold-valley">
              <div className="formContainer">
                <label>
                  <div className="inputContainer inputContainerLogin gold-valley">
                    <input
                      type="text"
                      name="login"
                      id="login_input"
                      className="input inputLogin"
                      placeholder="Login"
                      value={Username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </label>
                <label>
                  <div className="inputContainer inputContainerPassword gold-valley">
                    <input
                      type="password"
                      name="password"
                      id="password_input"
                      className="input inputPassword"
                      placeholder="Password"
                      value={Password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          login(
                            String(Username).toLowerCase(),
                            String(Password)
                          );
                        }
                      }}
                    />
                  </div>
                </label>

                <div className="submitButtonContainer">
                  <button
                    className="submitButton"
                    onClick={() => {
                      login(String(Username).toLowerCase(), String(Password));
                    }}
                  >
                    <span>Log in</span>
                  </button>
                </div>
                <div 
                  style={{color: "white", cursor: "pointer", textAlign: "center", padding: "20px 0px", fontSize: "1.15rem",
                  "-webkit-text-stroke": "0.03rem #d3b16b"
                }}
                onClick={()=>{
                  window.location.href = "/#/signup";
                }}>
                  No account? Register here
                </div>
              </div>
            </div>


  );
};

export default BasicSignIn;
