import * as React from 'react';
import NavItem from './nav-item';
import Brand from './brand';
const Header = (props: { height: number }) => (
    <div style={getStyles(props)}>
        <Brand brandName={"Concierge"}/>
        {navItems.map((text, key) => <NavItem text={text} href={''} key={key} />)}
    </div>
)

const getStyles = (props: { height: number }): React.CSSProperties => ({
    height: props.height,
    backgroundColor: '#02578d',
    display: 'flex',
    alignItems: 'center',
})

const navItems = [
    'Hosts',
    'Containers',
    'Images',
    'Configuration'
]

export default Header;