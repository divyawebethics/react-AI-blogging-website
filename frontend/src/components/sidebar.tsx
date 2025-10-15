import React from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FaHome, FaBars, FaSignOutAlt } from "react-icons/fa";
import { IoMdCreate } from "react-icons/io";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth"; 

export const SideBar = ({ onToggle }: { onToggle: (collapsed: boolean) => void }) => {
  const [collapsed, setCollapsed] = React.useState(true);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setCollapsed(false);
    onToggle(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
    onToggle(true);
  };

  const handleLogout = () => {
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (confirmed) {
    logout(); 
    navigate("/login"); 
  }
};

  return (
    <div
      className="fixed top-0 left-0 h-screen z-50 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar
        collapsed={collapsed}
        collapsedWidth="80px"
        className="h-full bg-[#be7dd8] text-black transition-all duration-300 flex flex-col justify-between"
      >
        <Menu
          menuItemStyles={{
            button: {
              [`&.active`]: {
                backgroundColor: "#be7dd8",
                color: "#b6c8d9",
              },
              ":hover": {
                backgroundColor: "#ad69c9",
                color: "white",
              },
            },
          }}
        >
          <div>
            <MenuItem icon={<FaBars />}> {!collapsed && "Menu"} </MenuItem>
            <MenuItem icon={<FaHome />} component={<Link to="/home" />}>
              Home
            </MenuItem>
            <MenuItem icon={<IoMdCreate />} component={<Link to="/posts/create-post" />}>
              Create Post
            </MenuItem>
            <MenuItem icon={<IoMdCreate />} component={<Link to="/dashboard" />}>
              Dashboard
            </MenuItem>
            <MenuItem
              icon={<BiSolidCategoryAlt />}
              component={<Link to="/categories" />}
            >
              Categories
            </MenuItem>
          </div>

          <div className="mt-auto">
            <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
              Logout
            </MenuItem>
          </div>

        </Menu>
      </Sidebar>
    </div>
  );
};
