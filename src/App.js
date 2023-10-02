import React, { Component } from 'react';
// import { HashRouter as Router, Route, Routes } from 'react-router-dom';
// import Lobby from "./views/Lobby"
// import Login from "./views/Login"
// import ThePage from "./views/ThePage"
import Route from './Routes';


// const audio = new Audio("./views/sounds/casino_sound.mp3")

// export const AudioStartPlay = () => {
//   audio.play()
// };


class App extends Component {

  render() {
    return (
      // <ThePage/>
    //   <Router>
    //     <Routes>
          
    //       <Route exact path="/lobby" element={<Lobby/>} />
    //       {/* <Route path="/" element={<Lobby/>} /> */}
    //       <Route exact path="/login" element={<Login/>} />
    //       <Route path="/" element={<Login/>} />
    //   </Routes>
    // </Router>
    <React.Fragment>
    {/* <ThemeProvider> */}
      <Route />
    {/* </ThemeProvider> */}
  </React.Fragment>
    );
  }
}

export default App;
