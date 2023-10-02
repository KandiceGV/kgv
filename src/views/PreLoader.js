import React from "react";
import CountUp from "react-countup";
import "./css/goldValley.css";


export const PreLoader = ({
  setLoadingReady,

}) => {
  //   const classes = useStyles();
  return (

    <div className="preloader active" id="preloader">
    {/* <div id="loader"></div> */}
    <div className="logo_spinning"></div>
    <span>
    <span>
      {
        <CountUp
          start={0}
          end={100}
          duration={1}
          decimals={0}
          onEnd={() => {
            setLoadingReady(true);
          }}
        />
      }
    </span>
    %

      
    </span>
  </div>
  );
};

export default PreLoader;
