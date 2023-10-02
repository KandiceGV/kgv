import "./css/Lobby.css";
import CountUp from "react-countup";
import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql } from "@apollo/client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import SoundPlayer from "./SoundPlayer.js"

let intervalRunning = null;
let locToken;
let loggedInUser = 0;


function importAll(r) {
  return r.keys().map(r);
}

const images = importAll(
  require.context("../../images/menu", false, /\.(png|jpe?g|svg)$/)
);


const imagesLanguages = importAll(
  require.context("../../images/languages", false, /\.(png|jpe?g|svg)$/)
);





export const killIntervalRunning = () => {
  if (intervalRunning != null) {
    clearInterval(intervalRunning);
    intervalRunning = null;
  }
};







const checkAliveToken = async () => {
  let response = "";
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
    window.location.href = "/#/login";
  }
  if (response.status !== 200) {
    console.log(response);
    window.location.href = "/#/login";
  }
};

const GAMES_QUERY = gql`
  query GamesQuery {
    games(order_by: { gp_game_category: asc_nulls_last }) {
      gp_game_category
      gp_game_flash
      gp_game_id
      gp_game_image
      gp_game_menu_title
      gp_game_mobile
      id
      gp_game_name
    }
  }
`;

const USER_QUERY = gql`
  query UserQuery {
    users {
      bonus
      credits
      current_game
      gp_user_id
      id
      is_enabled
      is_panic
      last_login
      name
      shop_id
      username
    }
  }
`;

// const the_categories_photos = [
//   "ainsworth",
//   "amatic",
//   "apex",
//   "apollo",
//   "aristocrat",
//   "bingo",
//   "egt",
//   "habanero",
//   "igrosoft",
//   "igt",
//   "live_betting",
//   "merkur",
//   "microgaming",
//   "netent",
//   "novomatic",
//   "pragmatic",
//   "quickspin",
//   "scientific_games",
//   "table_games",
//   "vegas",
// ];

const the_Jackpot_values = [
  {
    name: "Diamond",
    value: 345.92,
  },
  {
    name: "Platinum",
    value: 145.57,
  },
  {
    name: "Gold",
    value: 95.54,
  },
  {
    name: "Silver",
    value: 45.28,
  },
  {
    name: "Bronze",
    value: 39.57,
  },
  {
    name: "Iron",
    value: 1.09,
  },
];

var windowVertical = false;


const Lobby = () => {
  const [TheGames, setTheGames] = useState([]);
  const [TheGamesCategories, setTheGamesCategories] = useState([]);
  const [TheGamesCategoriesImages, setTheGamesCategoriesImages] = useState([]);
  const [GamesToShow, setGamesToShow] = useState([]);
  const [ShowLobby, setShowLobby] = useState(true);
  const [GamesToShowAllSlides, setGamesToShowAllSlides] = useState(1);
  const [GamesToShowCurrentSlide, setGamesToShowCurrentSlide] = useState(1);
  const [SlidesToShow, setSlidesToShow] = useState(3);
  const [SlidesToShowGames, setSlidesToShowGames] = useState(3);



  const sliderRef = useRef(null);
  const sliderGamesRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: SlidesToShow,
    slidesToScroll: SlidesToShow,
    arrows: false,
  };

  const settingsGames = {
    infinite: true,
    arrows: false,
    centerPadding: "0px",
    slidesToShow: 1,
    speed: 500,
    rows: SlidesToShowGames,
    slidesPerRow: SlidesToShowGames,
  };

  // const { data, loading, error } =  useQuery(
  useQuery(GAMES_QUERY, {
    // variables: {
    //   fixture_id: cur_MatchID
    // },
    onCompleted: async (the_data) => {
      const the_games = the_data.games;

      let all_the_games = [];
      // setTheGames(the_games);

      let games_categories = [];
      let game_categories_images = [];
      let the_index = -1;

      for (let i = 0; i < the_games.length; i++) {
        if (!games_categories.includes(the_games[i].gp_game_category)) {
          all_the_games[games_categories.length] = [];
          all_the_games[games_categories.length].push(the_games[i]);

          games_categories.push(the_games[i].gp_game_category);
          for (let j = 0; j < images.length; j++) {
            if (images[j].includes(the_games[i].gp_game_category)) {
              game_categories_images.push(images[j]);
              break;
            }
          }
          if (game_categories_images.length !== games_categories.length) {
            game_categories_images.push("");
          }
        } else {
          the_index = games_categories.indexOf(the_games[i].gp_game_category);

          all_the_games[the_index].push(the_games[i]);
        }
      }
      setTheGamesCategories(games_categories);
      setTheGamesCategoriesImages(game_categories_images);

      setTheGames(all_the_games);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const { data: data_user } = useQuery(USER_QUERY);


  

  useEffect(() => {
    async function fetchData() {

      console.log(imagesLanguages)


      locToken = localStorage.getItem("token_Lobby_Gold_Valley");
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
        window.location.href = "/#/login";
      }
      if (response.status !== 200) {
        window.location.href = "/#/login";
      } else {
        loggedInUser = 1;
      }

      if (intervalRunning === null && loggedInUser === 1) {
        intervalRunning = setInterval(checkAliveToken, 6000);
      }

      document.body.classList.add("authorized");
      document.body.classList.add("with-lang-select");
      AdjustSizeFunction();

      window.addEventListener("resize", AdjustSizeFunction);
      
    }

    fetchData();
  }, []);

  function next() {
    sliderRef.current.slickNext();
  }
  function previous() {
    sliderRef.current.slickPrev();
  }

  function nextGames() {
    sliderGamesRef.current.slickNext();
  }
  function previousGames() {
    sliderGamesRef.current.slickPrev();
  }

  function AdjustSizeFunction() {
    if (window.innerWidth < window.innerHeight) {
      if (!windowVertical) {
        document.body.classList.add("vertical");
        document.body.classList.remove("horizontal");
        windowVertical = true;
        setSlidesToShowGames(3);
      }
      if (window.innerWidth <= 500) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    } else {
      if (windowVertical) {
        document.body.classList.add("horizontal");
        document.body.classList.remove("vertical");
        windowVertical = false;
      }
      if (window.innerWidth <= 1270) {
        setSlidesToShow(2);
        setSlidesToShowGames(2);
      } else {
        setSlidesToShow(3);
        setSlidesToShowGames(3);
      }
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

    window.localStorage.clear();
    window.location.href = "/#/login";
  };

  const providerPressed = (index) => {
    setGamesToShow(TheGames[index]);

    setShowLobby(false);

    if(SlidesToShowGames === 3){
      setGamesToShowAllSlides(parseInt((TheGames[index].length - 1) / 9) + 1);
    }
    else{
      setGamesToShowAllSlides(parseInt((TheGames[index].length - 1) / 4) + 1);
    }
    setGamesToShowCurrentSlide(1);
  };

  const mouseDownCoords = (e) => {
    window.checkForDrag = e.clientX;
  };
  const clickOrDrag = (e, index) => {
    const mouseUp = e.clientX;
    if (
      mouseUp < window.checkForDrag + 5 &&
      mouseUp > window.checkForDrag - 5
    ) {
      providerPressed(index);
    }
  };

  const mouseDownCoordsGames = (e) => {
    window.checkForDrag = e.clientX;
  };

  const clickOrDragGames = (e, index) => {
    const mouseUp = e.clientX;
    if (
      mouseUp < window.checkForDrag + 5 &&
      mouseUp > window.checkForDrag - 5
    ) {
      GamesPressed(index);
    }
  };
  const GamesPressed = (index) => {
    console.log(GamesToShow[index]);
  };

  return (
    <div className="App">
      <div className="App-header">
        <div className="head">
          <div
            className="head_button head_button--screen"
            style={{ display: "block" }}
          ></div>
          <div className="head_button head_button--sound"></div>
          <div className="dropdown-languages-wrap">
            <div className="dropdown-languages" style={{height: "fit-content"}}>


              {imagesLanguages.map((lang, i) => (
                  <div
                  key={i}
                  className={i===0 ? "select-language selected": "select-language"}>
                  <p className="lang-img" 
                    style={{
                      backgroundImage: `url(${lang})`,
                    }}>
                  </p>
                </div>
              ))}



						<span className="arrow-for-open"></span>
		</div>




          </div>

          {/* <div class="head_button head_button--search" id="search_bg">
		<input type="text" name="search" class="search-input" id="search_input">
		<button class="search-clean"></button>
	</div> */}
        </div>

        <div className="top-panel">
          {data_user ? (
            <div className="balance-and-bonuse">
              <div className="head_button">
                <div data-text="Balance:">Balance:</div>
                <div
                  className="head_button_value"
                  data-text={data_user.users[0].credits}
                >
                  {data_user.users[0].credits}
                </div>
              </div>
              <div className="head_button">
                <div data-text="Bonus:">Bonus:</div>
                <div
                  className="head_button_value"
                  data-text={data_user.users[0].bonus.toFixed(2)}
                >
                  {data_user.users[0].bonus.toFixed(2)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="spin-logo"></div>

        {ShowLobby ? (
          <div className="providers_slider active">
            <div className="provider-arrows">
              <div
                onClick={() => {
                  previous();
                }}
                className="provider-arrow-left slick-arrow"
                style={{ display: "inline-block" }}
              ></div>
              <div
                onClick={() => {
                  next();
                }}
                className="provider-arrow-right slick-arrow"
                style={{ display: "inline-block" }}
              ></div>
            </div>

            <Slider
              ref={sliderRef}
              {...settings}
              className="providers providers_list"
            >
              {TheGamesCategoriesImages.map((image, i) => (
                <div
                  onMouseDown={(e) => {
                    mouseDownCoords(e, i);
                  }}
                  onMouseUp={(e) => clickOrDrag(e, i)}
                  key={i}
                  className="provider-wrap"
                  style={{ width: "100%", display: "inline-block" }}
                >
                  <div
                    provider={
                      image === ""
                        ? TheGamesCategories[0]
                        : TheGamesCategories[i]
                    }
                    className="provider"
                    style={{
                      backgroundImage: `url(${
                        image === "" ? TheGamesCategoriesImages[0] : image
                      })`,
                    }}
                  />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="games_slider active">
            <div className="games" style={{ height: "100%" }}>
              {/* eslint-disable-next-line */}
              <a
                className="game_control game_control--left slick-arrow"
                id="scroll_left"
                onClick={() => {
                  previousGames();
                }}
                style={{ display: "block" }}
              ></a>
              {/* eslint-disable-next-line */}
              <a
                className="game_control game_control--right slick-arrow"
                id="scroll_right"
                onClick={() => {
                  nextGames();
                }}
                style={{ display: "block" }}
              ></a>
              <Slider
                ref={sliderGamesRef}
                {...settingsGames}
                className="games_inner"
                afterChange={(index) => setGamesToShowCurrentSlide(index + 1)}
              >
                {GamesToShow.map((games, i) => (
                  <div
                    onMouseDown={(e) => {
                      mouseDownCoordsGames(e, i);
                    }}
                    onMouseUp={(e) => clickOrDragGames(e, i)}
                    className="game"
                    provider={games.gp_game_category}
                    key={i}
                  >
                    <div
                      className="game-img loaded"
                      style={{
                        backgroundImage: `url(${games.gp_game_image})`,
                      }}
                    >
                      {/* <div className="star " onclick="favouriteToggle(7730);event.cancelBubble=true;"></div>  */}
                    </div>

                    <div
                      className="game_open"
                      // game="7729"
                      // provider="pragmatic"
                    ></div>
                  </div>
                ))}
              </Slider>
              <div style={{ height: "auto" }} className="page-number">
                <span
                  className="current-page"
                  data-text={GamesToShowCurrentSlide}
                >
                  {GamesToShowCurrentSlide}
                </span>
                <span data-text="/">/</span>
                <span className="total-page" data-text={GamesToShowAllSlides}>
                  {GamesToShowAllSlides}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="tablets">
          <div className="lady"></div>
          <div className="jack-top"></div>

          {the_Jackpot_values.map((jackpot, i) => (
            <div className="table" key={i}>
              <div className="label">{jackpot.name}</div>
              <div className="value active" name={jackpot.name}>
                <div className="odometer-digits">
                  <CountUp
                    start={0}
                    end={jackpot.value}
                    duration={10}
                    decimals={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="jack-bottom"></div>
        </div>
        <div className="footer_linee"></div>

        <div className="footer">
          {/* eslint-disable-next-line */}
          <a
            className="footer-menu"
            onClick={() => {
              setShowLobby(true);
              setGamesToShow([]);
            }}
          >
            <span className="footer-menu-text" data-text="Menu">
              Menu
            </span>
          </a>

          <div className="footer-left"></div>

          <div className="footer-right">
            {data_user ? (
              <div className="footer_link footer_link--id">
                <span className="text-id" data-text="id">
                  id:
                </span>
                <span className="id-value" data-text={data_user.users[0].id}>
                  {data_user.users[0].id}
                </span>
              </div>
            ) : null}
            {/* eslint-disable-next-line */}
            <a
              onClick={() => {
                logOut();
              }}
              className="footer_link footer_link--logout visible"
              data-text="Exit"
              style={{ display: "inline" }}
            >
              <span className="link-name" data-text="Exit">
                Exit
              </span>
              <span className="link-icon"></span>
            </a>
          </div>
        </div>
        {/* <audio  src={require("./sounds/casino_sound.mp3").default} autoPlay type="audio/mp3"></audio> */}

        


      </div>
    </div>
  );
};

export default Lobby;
