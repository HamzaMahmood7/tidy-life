import React from "react";
import { NavLink } from "react-router-dom";
import Logo from '../assets/alliance-icon.jpeg'

const Navbar = () => {
  return (
    <nav>
      <img src={Logo} alt="logo" />
      <h2>Tidy Life</h2>
      <section>
        <NavLink to={"/"}>Sign Up</NavLink>
        <NavLink to={"/login"}>Login</NavLink>
      </section>
    </nav>
  );
};

export default Navbar;
