import "./css/goldValley.css";
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
// import Slider from "react-slick";
import moment from "moment";

import { HeaderGoldValley } from "./Header_GoldValley";
import { PreLoader } from "./PreLoader";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

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

const GAMES_QUERY = gql`
  query GamesQuery {
    gv_games(
      order_by: { pname: asc_nulls_last }
      where: { is_disabled: { _eq: false } }
    ) {
      id
      pname
      image
      code
    }
    games(
      order_by: { gp_game_category: asc_nulls_last }
      where: { is_disabled: { _eq: false } }
    ) {
      id
      gp_game_category
      gp_game_image
      gp_game_menu_title
      gp_game_mobile
    }
    users {
      id
      shop {
        id
        disabled_games
        lobby
        is_aviator_enabled
      }
    }
    settings(order_by: { id: asc }) {
      value
      json_value
    }
    game_categories(order_by: { id: asc }) {
      id
      lobby
      categories
    }
  }
`;

const JACKPOT_QUERY = gql`
  query JackpotQuery($jackpot_ids: [Int!] = []) {
    jackpots(
      order_by: { current_value: desc }
      where: { id: { _in: $jackpot_ids } }
    ) {
      currency
      id
      level
      current_value
      jackpot_winners(limit: 1, order_by: { created_at: desc }) {
        award_value
        created_at
        id
        jackpot_id
        user_id
        jackpot {
          currency
          level
        }
      }
    }
  }
`;

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
      }
    }
  }
`;

// const SETTINGS_QUERY = gql`
//   query SettingsQuery {
//     settings(order_by: { id: asc }) {
//       value
//     }
//   }
// `;

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

let SingleAllTheGames = [];
let IsMobile = false;

const Home = () => {
  const [SkipUntilLogin, setSkipUntilLogin] = useState(true);
  const [LoadingReady, setLoadingReady] = useState(false);
  const [LoadingReady2, setLoadingReady2] = useState(false);
  const [LoadingReady3, setLoadingReady3] = useState(false);
  const [FrameUrl, setFrameUrl] = useState("");

  // const [AudioPlaying, setAudioPlaying] = useState(false);
  const [GameStarted, setGameStarted] = useState(false);
  const [GoldValleyCategoryIndex, setGoldValleyCategoryIndex] = useState(-1);

  const [TheCurrency, setTheCurrency] = useState("R");

  const [TheSpecificGameCategory, setTheSpecificGameCategory] = useState("");

  const [Novomatic_big_Exit, setNovomatic_big_Exit] = useState(true);

  const [GoldValleyGames, setGoldValleyGames] = useState(SingleAllTheGames);

  const [TheColumns, setTheColumns] = useState(5);
  const [TheRowHeight, setTheRowHeight] = useState(164);

  const [Jackpot_Ids, setJackpot_Ids] = useState([]);
  const [TheJackpotValues, setTheJackpotValues] = useState([
    {
      name: "Grand",
      value: "0.00",
    },
    {
      name: "Gold",
      value: "0.00",
    },
    {
      name: "Silver",
      value: "0.00",
    },
    {
      name: "Bronze",
      value: "0.00",
    },
  ]);

  const myAudio = useRef(new Audio(the_sound));
  myAudio.loop = true;

  const { refetch: refetch_games } = useQuery(GAMES_QUERY, {
    onCompleted: async (the_data) => {
      if (GameStarted) {
        console.log("Game has Started!!!");
        return;
      }

      const the_games_gp = the_data.games;
      const the_games_gv = the_data.gv_games;

      let the_games = [];

      for (let i = 0; i < the_games_gp.length; i++) {
        the_games.push({
          id: the_games_gp[i].id,
          category: the_games_gp[i].gp_game_category,
          image: the_games_gp[i].gp_game_image,
          title: the_games_gp[i].gp_game_menu_title,
          mobile: the_games_gp[i].gp_game_mobile,
          provider: "gpgames",
        });
      }

      for (let i = 0; i < the_games_gv.length; i++) {
        the_games.push({
          id: the_games_gv[i].id,
          category: the_games_gv[i].pname,
          image: the_games_gv[i].image,
          title: the_games_gv[i].code,
          mobile: 1,
          provider: "gvgames",
        });
      }

      const the_disabled_games = the_data.users[0].shop.disabled_games;

      const the_lobby = the_data.users[0].shop.lobby;

      let the_query_games_categories = null;
      for (let i = 0; i < the_data.game_categories.length; i++) {
        if (the_data.game_categories[i].lobby === the_lobby) {
          the_query_games_categories = the_data.game_categories[i].categories;
          break;
        }
      }

      let all_the_games = [];

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

      if (the_query_games_categories !== null) {
        let the_category_title = "";
        let the_category_general = [];
        let the_game_id = -1;

        for (let b = 0; b < the_query_games_categories.length; b++) {
          the_category_title = the_query_games_categories[b].Category_Label;
          if (the_category_title.toLowerCase() !== "all games") {
            continue;
          }
          the_category_general = the_query_games_categories[b].Game_Ids;

          all_the_games = [];

          for (let x = 0; x < the_category_general.length; x++) {
            the_game_id = the_category_general[x];

            for (let i = 0; i < the_games.length; i++) {
              if (
                the_games[i].id !== the_game_id.id ||
                the_games[i].provider !== the_game_id.provider
              ) {
                continue;
              }

              let is_disabled = false;

              for (let j = 0; j < the_disabled_games.length; j++) {
                if (
                  the_games[i].id === the_disabled_games[j].id &&
                  the_games[i].provider === the_disabled_games[j].provider
                ) {
                  is_disabled = true;
                  break;
                }
              }

              if (
                window.innerWidth < window.innerHeight &&
                is_mobile &&
                the_games[i].mobile !== 1
              ) {
                continue;
              }

              if (is_disabled) {
                continue;
              }

              let tmp_game = { ...the_games[i] };

              all_the_games.push(tmp_game);

              // break;
            }
          }
        }

        setGoldValleyGames([...all_the_games]);
        SingleAllTheGames = [...all_the_games];
      }

      let coming_from_game = await localStorage.getItem(
        "GoldValleyCategoryIndex"
      );

      if (coming_from_game !== undefined && coming_from_game !== null) {
        setGoldValleyCategoryIndex(parseInt(coming_from_game));
      }

      setLoadingReady2(true);
    },
    onError: (err) => {
      console.log(err);
    },
    skip: SkipUntilLogin,
    notifyOnNetworkStatusChange: true,
    pollInterval: 60000,
  });

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

      if (the_shop.lobby !== "online") {
        alert("User not found in this lobby!");
        returnEverythingToNormal();
        return;
      }

      const the_jackpot_ids = the_shop.jackpot_ids;

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
        return;
      }
      setNovomatic_big_Exit(Novomatic_big_Exit);
      setTheCurrency(FindSymbol(the_shop.gp_cur));

      setJackpot_Ids(the_jackpot_ids);
    },
    onError: (err) => {
      console.log(err);
    },
    skip: SkipUntilLogin,
    notifyOnNetworkStatusChange: true,
    pollInterval: 1000,
  });

  useQuery(JACKPOT_QUERY, {
    variables: {
      jackpot_ids: Jackpot_Ids,
    },
    onCompleted: async (data) => {
      const the_jackpots = data.jackpots;
      if (the_jackpots.length === 0) {
        return;
      }

      let the_jackpot_values = [...TheJackpotValues];

      for (let i = 0; i < the_jackpots.length; i++) {
        for (let j = 0; j < the_jackpot_values.length; j++) {
          if (
            the_jackpots[i].level.toLowerCase() ===
            the_jackpot_values[j].name.toLowerCase()
          ) {
            the_jackpot_values[j] = {
              name: the_jackpot_values[j].name,
              value: (the_jackpots[i].current_value / 100).toFixed(2),
            };
            break;
          }
        }
      }

      setTheJackpotValues(the_jackpot_values);
    },
    onError: (err) => {
      console.log(err);
      console.log(locToken);
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
        setLoadingReady2(false);
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

  useEffect(
    () => {
      let GoldValleyGames_name = "GoldValleyGames_" + GoldValleyCategoryIndex;
      if (
        document.getElementById(GoldValleyGames_name) &&
        GoldValleyCategoryIndex !== -1 &&
        !GameStarted
      ) {
        document
          .getElementById(GoldValleyGames_name)
          .scrollIntoView({ behavior: "smooth", block: "center" });
        setGoldValleyCategoryIndex(-1);
        localStorage.removeItem("GoldValleyCategoryIndex");
      }
    },
    // eslint-disable-next-line
    [
      GoldValleyCategoryIndex,
      // eslint-disable-next-line
      document.getElementById("GoldValleyGames_" + GoldValleyCategoryIndex),
    ]
  );

  async function returnTheLink(
    game_provider,
    game_code,
    gp_user_id,
    language,
    exit_url
  ) {
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

    locToken = await localStorage.getItem("token_Lobby_Gold_Valley");
    let response = "";

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: locToken,
        game_provider: game_provider,
        game_code: game_code,
        gp_user_id: gp_user_id,
        language: language,
        backend_url: process.env.REACT_APP_BACKEND_URL,
        exit_url: exit_url,
        is_mobile: is_mobile,
      }),
    };
    try {
      response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "/api/frontend/open-game-session/",
        requestOptions
      );
    } catch (error) {
      console.log(error);
      return "error";
    }

    if (response.status !== 200) {
      return "error";
    }

    const result = await response.json();

    const result_ans = result.game_url;

    return result_ans;
  }

  async function fetchData() {
    refetchQueries();

    locToken = await localStorage.getItem("token_Lobby_Gold_Valley");
    // console.log(locToken);
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
    refetch_games();
    // refetch_settings();
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
      setTheColumns(3);
      setTheRowHeight(100);
    } else {
      setTheColumns(5);
      setTheRowHeight(164);
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
    // setTheGamesCategories([]);

    //gold valley
    // setGoldValleyCategoryIndex(null);
    setGoldValleyGames(SingleAllTheGames);
    // setSearchGoldValley("");

    // setAudioPlaying(false);
    // setUsername("");
    // setPassword("");

    // setLoginScreen(true);
    setLoadingReady(false);
    setLoadingReady2(false);
    setLoadingReady3(false);

    setSkipUntilLogin(true);

    //static variables
    loggedInUser = 0;
    second_time_error = false;
    SingleAllTheGames = [];

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

  const GamesPressedGoldValley = async (index) => {
    setGameStarted(true);

    const tmp_result = await returnTheLink(
      GoldValleyGames[index].provider,
      GoldValleyGames[index].title,
      data_user.users[0].gp_user_id,
      "en",
      My_website
    );

    setTheSpecificGameCategory(GoldValleyGames[index].category.toLowerCase());

    setFrameUrl(tmp_result);

    if (IsMobile) {
      openFullscreen(document.documentElement);
    }
    await StoreInLocalStorageGoldValley(index);

    set_Current_Game({
      variables: {
        id: data_user.users[0].id,
        current_game: GoldValleyGames[index].title,
      },
    });
  };

  const StoreInLocalStorageGoldValley = (index) => {
    localStorage.setItem("GoldValleyCategoryIndex", index);
    localStorage.setItem("PageThatCameFrom", "home");
  };

  return (
    <>
      {!GameStarted ? (
        <>
          {LoadingReady && LoadingReady2 && LoadingReady3 ? (
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
                <div className="AllCategories_goldValley main_screen" >
                <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={3}
                    style={{
                      height: "700px",
                      alignItems: "flex-start",
                      marginTop: "80px",
                      marginBottom: "-10px",
                    }}
                  >
                    <Grid item xs={1} sm={4}>
                    <div
                       style={{
                        flexDirection: "row"}}
                        className="jackpot_mainmajor"
                        id="jackpot_mainmajor"
                      ></div>                     
                    </Grid>
                    <Grid item xs={1} sm={3}>
                      <div
                        className="jackpot_maingrand"
                        id="jackpot_maingrand"
                      ></div>                       
                    </Grid>
                    
                    <Grid item xs={1} sm={1}>
                      <div
                        className="jackpot_mainminor"
                        id="jackpot_mainminor"
                      ></div>
                    </Grid>

                  <Grid
                    container
                    spacing={1}
                    style={{
                      height: "400px",
                      alignItems: "flex-start",
                      marginTop: "0px",
                    }}
                  >                  
                   <Grid item xs={3} sm={3} className="column_chips">
                      <div
                        className="Chips main_screen"
                        id="slot_games"
                        onClick={() => {
                          window.location.href = "/#/slotgames";
                        }}
                      ></div>
                      
                    </Grid>
                    <Grid item xs={3} sm={3} className="column_chips">
                      <div
                        className="Chips main_screen"
                        id="new_games"
                        onClick={() => {
                          window.location.href = "/#/newgames";
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={3} sm={3} className="column_chips">
                      <div
                        className="Chips main_screen"
                        id="live_tables"
                        onClick={() => {
                          window.location.href = "/#/livegames";
                        }}
                      ></div>
                    </Grid>
                    <Grid xs={3} sm={3} className="column_chips">
                      <div
                        className="Chips main_screen"
                        id="aviator_spribe"
                        onClick={() => {
                          window.location.href = "/#/aviator";
                        }}
                      ></div>
                      </Grid>
                      <Grid item xs={3} sm={3} className="column_chips">
                     <div
                     className="Chips_letters"
                        id="slot_games_letters"
                        onClick={() => {
                          window.location.href = "/#/slotgames";
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={3} sm={3} className="column_chips">
                      <div
                      className="Chips_letters"
                        id="new_games_letters"
                        onClick={() => {
                          window.location.href = "/#/newgames";
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={3} sm={3} className="column_chips">
                      <div
                      className="Chips_letters"
                        id="live_tables_letters"
                        onClick={() => {
                          window.location.href = "/#/livegames";
                        }}
                      ></div>
                    </Grid>
                    <Grid xs={3} sm={3} className="column_chips">
                      <div
                      className="Chips_letters"
                        id="aviator_spribe_letters"
                        onClick={() => {
                          window.location.href = "/#/aviator";
                        }}
                      ></div>
                      </Grid>
                    </Grid>  
                    </Grid>  
                  </div>


                <Grid
                  container
                  className="Main_screen"
                  justifyContent="center"
                  alignItems="center"
                >
                 <div
                  className="column_providers_menu"
                  id="providers_menubar"
                  
                      ></div>
                 <div
                  className="column_providers_menu"
                  id="providers_logos"
                  
                      ></div>
                  <Grid
                    item
                    sm={12}
                    xs={12}
                    style={{
                      paddingTop: "0px",
                      display: "inline-flex",
                      justifyContent: "center",
                    }}
                  >
                    
                    <ImageList
                      cols={TheColumns}
                      gap={15}
                      rowHeight={TheRowHeight}
                      variant="quilted"
                      sx={{
                        width: "92%",
                        height: "100%",
                      }}
                    >
                      {GoldValleyGames.map((games, i) => (
                        <React.Fragment key={i}>
                          {i % 17 === 3 && TheColumns !== 1 ? (
                            <ImageListItem
                              id={"GoldValleyGames_" + i}
                              rows={3}
                              cols={2}
                            >
                              <div
                                title={games.title}
                                className="game-img_goldValley_outer big"
                                onClick={() => {
                                  GamesPressedGoldValley(i);
                                }}
                              >
                                <div className="game-img_goldValley_outer2 big">
                                  <div
                                    className="game-img_goldValley big"
                                    style={{
                                      backgroundImage: `url(${games.image.replace(
                                        / /g,
                                        "%20"
                                      )})`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </ImageListItem>
                          ) : (
                            <>
                              {i % 17 === 10 && TheColumns !== 1 ? (
                                <ImageListItem
                                  id={"GoldValleyGames_" + i}
                                  rows={2}
                                  cols={2}
                                >
                                  <div
                                    title={games.title}
                                    className="game-img_goldValley_outer semibig"
                                    onClick={() => {
                                      GamesPressedGoldValley(i);
                                    }}
                                  >
                                    <div className="game-img_goldValley_outer2">
                                      <div
                                        className="game-img_goldValley semibig"
                                        style={{
                                          backgroundImage: `url(${games.image.replace(
                                            / /g,
                                            "%20"
                                          )})`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </ImageListItem>
                              ) : (
                                <ImageListItem id={"GoldValleyGames_" + i}>
                                  <div
                                    title={games.title}
                                    className="game-img_goldValley_outer"
                                    onClick={() => {
                                      GamesPressedGoldValley(i);
                                    }}
                                  >
                                    <div className="game-img_goldValley_outer2">
                                      <div
                                        className="game-img_goldValley"
                                        style={{
                                          backgroundImage: `url(${games.image.replace(
                                            / /g,
                                            "%20"
                                          )})`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </ImageListItem>
                              )}
                            </>
                          )}
                        </React.Fragment>
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
          <div className="launcher-game-block">
            <div className="launcher-game">
              {/* eslint-disable-next-line */}
              <iframe
                id="the_game_iframe"
                src={FrameUrl}
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
          {Novomatic_big_Exit && TheSpecificGameCategory === "novomatic" && (
            <button
              className={"NovomaticButtonBigExit"}
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

export default Home;
