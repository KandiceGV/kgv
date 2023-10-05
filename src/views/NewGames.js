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
// import UndoIcon from '@mui/icons-material/Undo';
// import MenuIcon from '@mui/icons-material/Menu';
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

const newGames = [
  "./microgaming.png",
  "./spinomenal.png",
  "./playtech.png",
  "./pragmatic.png",
  "./evoplay.png",
  "./platipus.png",
  "./kagaming.png",
];

const newGamesCategories = [
  "microgaming",
  "spinomenal",
  "playtech",
  "pragmatic",
  "evoplay",
  "platipus",
  "kagaming",
];

function importAllSlotGames(r) {
  return newGames.map(r);
}

const imagesNewGames = importAllSlotGames(
  require.context("./images/new_games_providers", false, /\.(png|jpe?g|svg)$/)
);

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
let KeepLobbyIndex = 0;

const NewGames = () => {
  const [SkipUntilLogin, setSkipUntilLogin] = useState(true);
  const [LoadingReady, setLoadingReady] = useState(false);
  const [LoadingReady2, setLoadingReady2] = useState(false);
  const [LoadingReady3, setLoadingReady3] = useState(false);

  const [FrameUrl, setFrameUrl] = useState("");

  const [GameStarted, setGameStarted] = useState(false);

  const [TheCurrency, setTheCurrency] = useState("R");

  const [TheSpecificGameCategory, setTheSpecificGameCategory] = useState("");

  const [Novomatic_big_Exit, setNovomatic_big_Exit] = useState(true);

  const [TheGamesCategoriesImages, setTheGamesCategoriesImages] = useState([]);

  const [GoldValleyGames, setGoldValleyGames] = useState([]);

  const [ShowTheGames, setShowTheGames] = useState(false);
  const [GoldValleyCategoryIndex, setGoldValleyCategoryIndex] = useState(null);

  const [TheColumns, setTheColumns] = useState(5);
  const [TheRowHeight, setTheRowHeight] = useState(164);
  const [TheColumnsProviders, setTheColumnsProviders] = useState(3);
  const [TheRowHeightProviders, setTheRowHeightProviders] = useState(164);

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

      let games_categories = [];
      let game_categories_images = [];
      let the_index = -1;

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

        let the_category_banner_img = undefined;

        for (let b = 0; b < the_query_games_categories.length; b++) {
          the_category_title = the_query_games_categories[b].Category_Label;
          if (newGamesCategories.indexOf(the_category_title.toLowerCase()) === -1) {
            continue;
          }

          the_index = all_the_games.length;
          all_the_games[the_index] = [];

          the_category_banner_img = the_query_games_categories[b].Banner_Img;
          the_category_general = the_query_games_categories[b].Game_Ids;

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

              all_the_games[the_index].push(tmp_game);

              break;
            }
          }

          games_categories.push(the_category_title);

          if (the_category_banner_img !== undefined) {
            game_categories_images.push(the_category_banner_img);
          } else {
            if (all_the_games[the_index][0] !== undefined) {
              for (let jj = 0; jj < imagesNewGames.length; jj++) {
                if (
                  imagesNewGames[jj]
                    .toLowerCase()
                    .includes(the_category_title.toLowerCase())
                ) {
                  game_categories_images.push(imagesNewGames[jj]);
                  break;
                }
              }
            }
          }

          if (game_categories_images.length !== games_categories.length) {
            game_categories_images.push("");
          }
        }

        //setGoldValleyGames([...all_the_games[0]]);

        for (let i = 0; i < all_the_games.length; ) {
          if (all_the_games[i] === undefined || all_the_games[i].length === 0) {
            all_the_games.splice(i, 1);
            games_categories.splice(i, 1);
            game_categories_images.splice(i, 1);
          } else {
            i++;
          }
        }

        // setTheGamesCategories(games_categories);

        setTheGamesCategoriesImages(game_categories_images);
        SingleAllTheGames = [...all_the_games];
      }

      let coming_from_game = await localStorage.getItem(
        "GoldValleyCategoryIndex"
      );

      if (coming_from_game !== undefined && coming_from_game !== null) {
        setGoldValleyCategoryIndex(parseInt(coming_from_game));
        let the_keepIndex = parseInt(
          await localStorage.getItem("KeepLobbyIndex")
        );
        setGoldValleyGames(SingleAllTheGames[the_keepIndex]);
        setShowTheGames(true);
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

  const ProviderPressed = async (index) => {
    setGoldValleyGames(SingleAllTheGames[index]);
    KeepLobbyIndex = index;
    setShowTheGames(true);
  };

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
          .scrollIntoView({ behavior: 'smooth', block: 'center' });
        setGoldValleyCategoryIndex(-1);
        KeepLobbyIndex = 0;
        localStorage.removeItem("GoldValleyCategoryIndex");
        localStorage.removeItem("KeepLobbyIndex");
      }
    },
    // eslint-disable-next-line
    [
      GoldValleyCategoryIndex,
      // eslint-disable-next-line
      document.getElementById("GoldValleyGames_" + GoldValleyCategoryIndex),
    ]
  );

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
    refetch_games();
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
      setTheColumns(1);
      setTheColumnsProviders(1);
      setTheRowHeight(200);
      setTheRowHeightProviders(window.innerHeight / 4);
      // } else if (window.innerWidth < 900) {
      //   setTheColumns(3);
      //   setTheRowHeight(100);
    } else {
      setTheColumns(5);
      setTheColumnsProviders(3);
      setTheRowHeight(164);
      setTheRowHeightProviders(window.innerWidth / 6);
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

    //gold valley
    setGoldValleyCategoryIndex(null);
    setGoldValleyGames([]);

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
    localStorage.setItem("KeepLobbyIndex", KeepLobbyIndex);
    localStorage.setItem("PageThatCameFrom", "newgames");
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
                <span
                  className="toolbar_height"
                ></span>

                <div className="AllCategories_goldValley newgames">
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
                      <div className="Chips" id="new_games_in_page"></div>
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
                  className="Main_screen newgames"
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
                    {ShowTheGames ? (
                      <ImageList
                        cols={TheColumns}
                        gap={20}
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
                    ) : (
                      <ImageList
                        cols={TheColumnsProviders}
                        gap={15}
                        rowHeight={TheRowHeightProviders}
                        // variant="quilted"
                        sx={{
                          width: "90%",
                          height: "100%",
                        }}
                      >
                        {TheGamesCategoriesImages.map((images, i) => (
                          <ImageListItem
                            key={i}
                            rows={1}
                            cols={1}
                            className={
                              i === 6 && TheColumnsProviders !== 1
                                ? "lastSingleItemProvider"
                                : null
                            }
                          >
                            <div
                              className="game-img_goldValley_outer"
                              onClick={() => {
                                //GamesPressedGoldValley(i);
                                ProviderPressed(i);
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
                    )}
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

export default NewGames;
