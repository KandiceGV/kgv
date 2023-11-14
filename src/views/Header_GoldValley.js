import React, { useState } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
// import { styled, alpha } from "@mui/material/styles";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MenuIcon from "@mui/icons-material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
// import SearchIcon from "@mui/icons-material/Search";
// import InputBase from "@mui/material/InputBase";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Box from "@mui/material/Box";

import Drawer from "@mui/material/Drawer";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import InboxIcon from "@mui/icons-material/MoveToInbox";
// import MailIcon from "@mui/icons-material/Mail";

// const Search = styled("div")(({ theme }) => ({
//   position: "relative",
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha(theme.palette.common.white, 0.15),
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.common.white, 0.25),
//   },
//   marginRight: theme.spacing(2),
//   marginLeft: 20,
//   width: "100%",
//   color: "#d7b56d",
//   [theme.breakpoints.up("sm")]: {
//     marginLeft: theme.spacing(10),
//     width: "auto",
//   },
// }));

// const SearchIconWrapper = styled("div")(({ theme }) => ({
//   padding: theme.spacing(0, 2),
//   height: "100%",
//   position: "absolute",
//   pointerEvents: "none",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   color: "#d7b56d",
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: "#d7b56d",
//   "& .MuiInputBase-input": {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//     transition: theme.transitions.create("width"),
//     width: "100%",
//     [theme.breakpoints.up("md")]: {
//       width: "20ch",
//     },
//   },
// }));

export const HeaderGoldValley = ({ logOut, theBalance, theUsername }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [OpenDrawer, setOpenDrawer] = useState(false);

  const open = Boolean(anchorEl);

  return (
    <div>
      <AppBar
        style={{
          backgroundColor: "#292929",
          borderBottom: '8px solid transparent',
          borderImage: 'linear-gradient(to right, #c58209, #ffff6c,#a86506 ) 1' ,
          borderImageSlice: 1,
          borderImageWidth: '0 0 3px 0',
        }}
      >
        <Toolbar style={{ padding: "0px", backgroundColor: "transparent" }}>
          <div className="gold_Valley_3dtext"></div>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            sx={{ display: { xs: "inherit", sm: "none" } }}
            size="small"
            edge="end"
            color="inherit"
            disableRipple
            style={{ borderRadius: "0px" }}
            onClick={() => {
              setOpenDrawer(true);
            }}
          >
            <MenuIcon fontSize="large" style={{ color: "white" }} />
            <Typography
              sx={{ display: { xs: "none", sm: "inherit" } }}
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                marginLeft: "15px",
              }}
            >
              {theUsername}
            </Typography>
          </IconButton>

          <Drawer
            anchor={"right"}
            open={OpenDrawer}
            onClick={() => {
              setOpenDrawer(false);
            }}
            PaperProps={{
              style: {
                backgroundColor: "#d9a41c",
                // backgroundColor: "#ce9400",
                color: "black",
              },
            }}
          >
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountCircleOutlinedIcon style={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText primary={theUsername} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoneyIcon style={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText primary={theBalance} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccountBalanceIcon style={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText>DEPOSIT</ListItemText>
              </ListItem>
            </List>
            <Divider style={{ color: "black", border: "1px solid black" }} />
            <List>
              <ListItem
                onClick={() => {
                  logOut();
                }}
              >
                <ListItemIcon>
                  <LogoutOutlinedIcon style={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText>Log Out</ListItemText>
              </ListItem>
            </List>
          </Drawer>
          <IconButton
            sx={{ display: { xs: "none", sm: "inherit" } }}
            size="small"
            edge="end"
            color="inherit"
            id="iconbutton_log_out"
            disableRipple
            style={{ borderRadius: "0px" }}
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
          >
            <AccountCircleOutlinedIcon
              fontSize="large"
              style={{ color: "white" }}
            />
            <Typography
              sx={{ display: { xs: "none", sm: "inherit" } }}
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                // WebkitTextStroke: "0.5px black",
                marginLeft: "10px",
                paddingRight: "50px"
              }}
            >
              {theUsername}
            </Typography>
          </IconButton>
          <Menu
            MenuListProps={{
              "aria-labelledby": "fade-button",
              style: {
                // backgroundColor: "#2c2d30",
                // color: "#D7B56C",
                backgroundColor: "#ce9400",
                color: "black",
                width: "fit-content",
                minWidth:
                  document.getElementById("iconbutton_log_out")?.clientWidth,
              },
            }}
            anchorEl={anchorEl}
            open={open}
            variant="menu"
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            onClose={() => {
              setAnchorEl(null);
            }}
            TransitionComponent={Fade}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logOut();
              }}
            >
              <ListItemIcon>
                <LogoutOutlinedIcon style={{ color: "black" }} />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </MenuItem>
          </Menu>
          <Button
            sx={{ display: { xs: "none", sm: "inherit" } }}
            style={{
              backgroundColor: "#ce9400",
              color: "white",
              fontWeight: "700",
              fontSize: "16px",
              borderRadius: "50px",
              marginLeft: "8px",
              marginRight: "50px",
              padding: "6px 15px ",
              lineHeight: "20px",
            }}
          >
            DEPOSIT
          </Button>

          <span>
            <Typography
              sx={{ display: { xs: "none", sm: "inherit" } }}
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                marginLeft: "10px",
                paddingRight: "50px"
              }}
            >
              {"BALANCE:"}
            </Typography>
            <Typography
              sx={{ display: { xs: "none", sm: "inherit" } }}
              style={{
                fontSize: "1rem",
                fontWeight: "700",
                color: "white",
                marginLeft: "10px",
              }}
            >
              {theBalance}
            </Typography>
          </span>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default HeaderGoldValley;
