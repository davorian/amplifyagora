import React from "react";
import { Menu as Nav, Icon, Button } from "element-react";
import { NavLink } from 'react-router-dom';
import { Cart } from 'react-bootstrap-icons';
import styled from 'styled-components';

const StyledNav = styled(Nav)`

  /* Color the border and text with theme */
  color: ${props => props.theme};
  border: 2px solid ${props => props.theme};
`;


const Navbar = ({user, handleSignOut, className}) =>
  ( <StyledNav mode='horizontal' theme='dark' defaultActive='1' className={className}>
    <div className={`nav-container ${className}`}>
      {/*App Title/icon*/}
      <Nav.Item index='1'>
        <NavLink to='/' className='nav-link'>
          <span className='app-title'>
            <Cart className='app-icon'/>
            Bryzl Math
          </span>
        </NavLink>
      </Nav.Item>
      {/*Navbar Items*/}
      <div className='nav-items'>
        {user && <Nav.Item index='2'>
          <span className='app-user'>Hello, {user.attributes.email}</span>
        </Nav.Item>}
        <Nav.Item index='3'>
          <NavLink to='/profile' className='nav-link'>
            <Icon name='setting'/>
            Profile
          </NavLink>
        </Nav.Item>
        <Nav.Item index='4'>
          <Button type='warning' onClick={handleSignOut} >Sign Out</Button>
        </Nav.Item>
      </div>
    </div>
  </StyledNav>
  );

export default Navbar;
