import "./css/goldValley.css";
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
// import Slider from "react-slick";
import moment from "moment";

import { HeaderGoldValley } from "./Header_GoldValley";
import { PreLoader } from "./PreLoader";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import UTurnLeftIcon from "@mui/icons-material/UTurnLeft";
import Grid from "@mui/material/Grid";

import the_sound from "./sounds/casino_sound.mp3";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

let intervalRunning = null;
let intervalRunningCurrentGame = null;
let locToken;
let loggedInUser = 0;
let second_time_error = false;

let userLoggedInFlag = 0;

let My_website;

export const getCurrentToken = () => {
  return localStorage.getItem("token_Lobby_Gold_Valley");
};

export const getCurrentUsername = () => {
  let splitUsername = String(localStorage.getItem("user"));
  return splitUsername[0];
};

export const getUserLoggedInFlag = () => {
  return userLoggedInFlag;
};

export const killIntervalRunning = () => {
  if (intervalRunning != null) {
    clearInterval(intervalRunning);
    intervalRunning = null;
  }
};

export const killIntervalRunningCurrentGame = () => {
  if (intervalRunningCurrentGame != null) {
    clearInterval(intervalRunningCurrentGame);
    intervalRunningCurrentGame = null;
  }
};

const AviatorGames = [
  "./aviator.png",
  "./jetx.png",
];

function importAllSlotGames(r) {
  return AviatorGames.map(r);
}

const imagesAviator = importAllSlotGames(
  require.context("./images/aviator_providers", false, /\.(png|jpe?g|svg)$/)
);


const USER_QUERY = gql`
  query UserQuery {
    users {
      bonus
      credits
      wheel_of_fortune_multiplier
      current_game
      gp_user_id
      id
      is_enabled
      is_deleted
      is_panic
      last_login
      name
      shop_id
      username
      favorite_game_ids
      is_gaming_enabled
      shop {
        id
        gp_cur
        is_panic
        permissions
        jackpot_ids
        lobby
        is_aviator_enabled
      }
    }
  }
`;

const CURRENTGAME_MUTATION = gql`
  mutation setCurrentGame($id: Int = -1, $current_game: String = "") {
    update_users(
      where: { id: { _eq: $id } }
      _set: { current_game: $current_game }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_TIME_CURRENT_GAME_MUTATION = gql`
  mutation setUpdateCurrentGame(
    $username: String = ""
    $last_update_of_current_game: timestamptz = ""
  ) {
    update_users(
      where: { username: { _eq: $username } }
      _set: { last_update_of_current_game: $last_update_of_current_game }
    ) {
      affected_rows
    }
  }
`;


let IsMobile = false;

const Aviator = () => {
  const [SkipUntilLogin, setSkipUntilLogin] = useState(true);
  const [LoadingReady, setLoadingReady] = useState(false);
  // const [LoadingReady2, setLoadingReady2] = useState(false);
  const [LoadingReady3, setLoadingReady3] = useState(false);

  const [GameStarted, setGameStarted] = useState(false);
  const [AviatorStartedWebsite, setAviatorStartedWebsite] = useState(`${process.env.REACT_APP_AVIATOR_WEBSITE}?token=${locToken}`);

  const [TheCurrency, setTheCurrency] = useState("R");

  const [Novomatic_big_Exit, setNovomatic_big_Exit] = useState(true);

  const [TheGamesCategoriesImages, setTheGamesCategoriesImages] = useState(imagesAviator);

  const [ShowTheGames, setShowTheGames] = useState(false);

  const [TheColumnsProviders, setTheColumnsProviders] = useState(3);
  const [TheRowHeightProviders, setTheRowHeightProviders] = useState(164);

  const myAudio = useRef(new Audio(the_sound));
  myAudio.loop = true;


  const { data: data_user, refetch: refetch_user } = useQuery(USER_QUERY, {
    onCompleted: async (data) => {
      if (!GameStarted) {
        setLoadingReady3(true);

        if (data.users[0].is_deleted) {
          returnEverythingToNormal();
          return;
        }

        set_Current_Game({
          variables: {
            id: data.users[0].id,
            current_game: "---",
          },
        });
      }

      const the_shop = data.users[0].shop;

      if(!the_shop.is_aviator_enabled){
        alert("Aviator not enabled!!!")
        window.location.href = "/#/home";
      }

      const parsedObject = JSON.parse(the_shop.permissions);
      const arrayOfObjects = Object.values(parsedObject);

      const safePage = arrayOfObjects
        .find(
          (obj) =>
            obj["key"] ===
            "Redirect to specific safe urls. Leave blank for default webpage. Press save."
        )
        .value.replace("https://", "")
        .replace("http://", "");

      const enable_to_safe = arrayOfObjects.find(
        (obj) =>
          obj["key"] ===
          "Enabled: leave completely from games to safe url when pressing ON/OFF or ESC. Disabled: redirect back to games on pressing ON/OFF (some urls will not work)"
      ).value;

      const Novomatic_big_Exit = arrayOfObjects.find(
        (obj) => obj["key"] === "Novomatic big exit"
      ).value;

      if (data.users[0].shop.is_panic) {
        returnEverythingToNormal();
        window.location.href = "https://" + safePage;
        return;
      }

      if (!data.users[0].is_enabled) {
        if (enable_to_safe) {
          window.location.href = "https://" + safePage;
          returnEverythingToNormal();
        }
        // else {
        //   setDarkMode(true);
        // }
        return;
      }
      // else {
      //   setDarkMode(false);
      // }

      // setThe_Safe_page(safePage); //9
      setNovomatic_big_Exit(Novomatic_big_Exit); //6
      setTheCurrency(FindSymbol(the_shop.gp_cur));
    },
    onError: (err) => {
      console.log(err);
    },
    skip: SkipUntilLogin,
    notifyOnNetworkStatusChange: true,
    pollInterval: 1000,
  });

  const [set_Update_Time_Current_Game] = useMutation(
    UPDATE_TIME_CURRENT_GAME_MUTATION,
    {
      onError: (err) => {
        console.log(err);
      },
    }
  );
  const [set_Current_Game] = useMutation(CURRENTGAME_MUTATION);



  useEffect(
    () => {
      My_website = window.location.href;
      let is_mobile;

      const navigator = window.navigator.userAgent;
      if (
        navigator.match(/Android/i) ||
        navigator.match(/webOS/i) ||
        navigator.match(/iPhone/i) ||
        navigator.match(/iPad/i) ||
        navigator.match(/iPod/i) ||
        navigator.match(/BlackBerry/i) ||
        navigator.match(/Windows Phone/i)
      ) {
        is_mobile = true;
      } else {
        is_mobile = false;
      }
      IsMobile = is_mobile;
      if (is_mobile) {
        // openFullscreen(document.documentElement);
        document.body.classList.add("mobile-game");
      } else {
        document.body.classList.remove("mobile-game");
      }

      locToken = localStorage.getItem("token_Lobby_Gold_Valley");

      if (
        localStorage.getItem("token_Lobby_Gold_Valley") === undefined ||
        localStorage.getItem("token_Lobby_Gold_Valley") === null
      ) {
        // setLoginScreen(true);
        setSkipUntilLogin(true);
        setLoadingReady(false);
        setLoadingReady3(false);
        killIntervalRunning();
        killIntervalRunningCurrentGame();
      } else {
        setSkipUntilLogin(false);
        fetchData();
      }
    },
    // eslint-disable-next-line
    []
  );

  async function fetchData() {
    refetchQueries();

    locToken = await localStorage.getItem("token_Lobby_Gold_Valley");
    console.log(locToken);
    let response = "";
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: locToken }),
    };
    try {
      response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/frontend/whoami/",
        requestOptions
      );
    } catch (error) {
      console.log(error);
      if (second_time_error) {
        returnEverythingToNormal();
      } else {
        second_time_error = true;
        console.log("first time error");
      }
      return;
    }
    if (response.status !== 200) {
      returnEverythingToNormal();
      return;
    }

    second_time_error = false;

    loggedInUser = 1;
    // setLoginScreen(false);

    if (intervalRunning === null && loggedInUser === 1) {
      intervalRunning = setInterval(checkAliveToken, 5000);
      intervalRunningCurrentGame = setInterval(
        checkAliveTokenCurrentGame,
        20000
      );
    }

    document.body.classList.add("authorized");
    document.body.classList.add("with-lang-select");
    AdjustSizeFunction();

    window.addEventListener("resize", AdjustSizeFunction);
  }

  function FindSymbol(symbol) {
    switch (symbol) {
      case "EUR":
        return "€";
      case "USD":
        return "$";
      case "ZAR":
        return "ZAR";
      default:
        return symbol;
    }
  }

  function refetchQueries() {
    refetch_user();
    // refetch_games();
  }

  const checkAliveTokenCurrentGame = async () => {
    if (intervalRunningCurrentGame == null) {
      return;
    }
    const right_now = moment().format("YYYY-MM-DDTHH:mm:ssZ");
    const currentUser = localStorage.getItem("user");

    set_Update_Time_Current_Game({
      variables: {
        username: currentUser,
        last_update_of_current_game: right_now,
      },
    });
  };

  const checkAliveToken = async () => {
    let response = "";
    locToken = await localStorage.getItem("token_Lobby_Gold_Valley");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: locToken }),
    };
    if (intervalRunning == null) {
      return;
    }
    try {
      response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/frontend/whoami/",
        requestOptions
      );
    } catch (error) {
      console.log(error);
      if (second_time_error) {
        returnEverythingToNormal();
      } else {
        second_time_error = true;
        console.log("first time error");
      }
      return;
    }
    if (response.status !== 200) {
      console.log(response);
      returnEverythingToNormal();
      return;
    }
    second_time_error = false;
  };

  function AdjustSizeFunction() {
    if (window.innerWidth < 600) {
      setTheColumnsProviders(1);
      setTheRowHeightProviders(window.innerHeight / 4);
    } else {
      setTheColumnsProviders(2);
      setTheRowHeightProviders(window.innerWidth / 5);
    }
  }

  const logOut = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: locToken }),
    };
    await fetch(
      process.env.REACT_APP_BACKEND_URL + "/api/frontend/logout/",
      requestOptions
    );

    returnEverythingToNormal();
  };

  const returnEverythingToNormal = () => {
    window.localStorage.clear();
    killIntervalRunning();
    killIntervalRunningCurrentGame();
    setTheGamesCategoriesImages([]);


    setLoadingReady(false);
    setLoadingReady3(false);

    setSkipUntilLogin(true);

    //static variables
    loggedInUser = 0;
    second_time_error = false;

    //refresh
    // window.location.reload();
    window.location.href = "/#/login";
  };

  function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }

  const GamesPressedAviator = async (index) => {

    setGameStarted(true);
    if (IsMobile) {
      openFullscreen(document.documentElement);
    }
    let currentUrl = process.env.REACT_APP_AVIATOR_WEBSITE;
    const updatedUrl = `${currentUrl}?token=${locToken}`;

    setAviatorStartedWebsite(updatedUrl);

    set_Current_Game({
      variables: {
        id: data_user.users[0].id,
        current_game: "aviator",
      },
    });
  };


  return (
    <>
      {!GameStarted ? (
        <>
          {LoadingReady && LoadingReady3 ? (
            <div className="goldValley_bg">
              <HeaderGoldValley
                logOut={logOut}
                theBalance={
                  TheCurrency +
                  " " +
                  (data_user.users[0].credits / 100).toFixed(2)
                }
                theUsername={data_user.users[0].username}
              />

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  className="toolbar_height"
                ></span>

                <div className="AllCategories_goldValley aviator">
                  <Grid
                    container
                    spacing={2}
                    style={{
                      height: "100%",
                      alignItems: "flex-start",
                      marginTop: "0px",
                    }}
                  >
                    <Grid item xs={12} className="column_chips">
                      <div className="Chips" id="aviator_spribe_in_page"></div>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        margin: {
                          xs: "75px 0px 0px 0px",
                          sm: "25px 0px 0px 0px",
                        }
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#2a2a2a",
                      }}
                    >
                      <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        disableRipple
                        style={{
                          borderRadius: "0px",
                          margin: "0px",
                          padding: "0px 12px 0px 12px",
                        }}
                        onClick={(event) => {
                          window.location.href = "/#/home";
                        }}
                      >
                        <HomeIcon
                          // fontSize="large"
                          style={{ color: "white", fontSize: "60px" }}
                        />
                      </IconButton>
                      {ShowTheGames && (
                        <IconButton
                          size="large"
                          edge="end"
                          color="inherit"
                          disableRipple
                          style={{
                            borderRadius: "0px",
                            margin: "0px",
                            padding: "0px 12px 0px 12px",
                          }}
                          onClick={(event) => {
                            setShowTheGames(false);
                          }}
                        >
                          <UTurnLeftIcon
                            // fontSize="large"
                            style={{
                              color: "white",
                              fontSize: "60px",
                              transform: "rotate(90deg)",
                            }}
                          />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </div>
                <Grid
                  container
                  className="Main_screen aviator"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid
                    item
                    xs={12}
                    style={{ display: "inline-flex" }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className="the_jackpot" id="grand_jackpot">
                      <span className="the_jackpot_first_line">
                        GRAND JACKPOT
                      </span>
                      <span className="the_jackpot_second_line">
                        {"1234569 GVK"}
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={4}
                    xs={12}
                    style={{ display: "inline-flex" }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className="the_jackpot" id="major_jackpot">
                      <span className="the_jackpot_first_line">
                        MAJOR JACKPOT
                      </span>
                      <span className="the_jackpot_second_line">
                        {"1234569 GVK"}
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={4}
                    xs={12}
                    style={{ display: "inline-flex" }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className="the_jackpot" id="minor_jackpot">
                      <span className="the_jackpot_first_line">
                        MINOR JACKPOT
                      </span>
                      <span className="the_jackpot_second_line">
                        {"1234569 GVK"}
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={4}
                    xs={12}
                    style={{ display: "inline-flex" }}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className="the_jackpot" id="mini_jackpot">
                      <span className="the_jackpot_first_line">
                        MINI JACKPOT
                      </span>
                      <span className="the_jackpot_second_line">
                        {"1234569 GVK"}
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    style={{
                      paddingTop: "20px",
                      display: "inline-flex",
                      justifyContent: "center",
                    }}
                  >
                   
                      <ImageList
                        cols={TheColumnsProviders}
                        gap={15}
                        rowHeight={TheRowHeightProviders}
                        // variant="quilted"
                        sx={{
                          width: "70%",
                          height: "100%",
                        }}
                      >
                        {TheGamesCategoriesImages.map((images, i) => (
                          <ImageListItem
                            key={i}
                            rows={1}
                            cols={1}
                          >
                            <div
                              className="game-img_goldValley_outer"
                              onClick={() => {
                                GamesPressedAviator();
                                
                              }}
                            >
                              <div className="game-img_goldValley_outer2">
                                <div
                                  className="game-img_goldValley providers"
                                  style={{
                                    backgroundImage: `url(${images})`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </ImageListItem>
                        ))}
                      </ImageList>
                  </Grid>
                </Grid>
              </div>
            </div>
          ) : (
            <PreLoader setLoadingReady={setLoadingReady} />
          )}
        </>
      ) : (
        <>
          <div className="launcher-game-block aviator">
            <div className="launcher-game">
              {/* eslint-disable-next-line */}
              <iframe
                id="the_game_iframe"
                src={AviatorStartedWebsite}
                style={{
                  border: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: "9",
                }}
                allowFullScreen
              ></iframe>
            </div>
          </div>
          {Novomatic_big_Exit && (
            <button
              className={"NovomaticButtonBigExit Aviator"}
              onClick={() => {
                window.location.href = My_website;
              }}
            >
              <span>EXIT</span>
            </button>
          )}
        </>
      )}
    </>
  );
};

export default Aviator;
