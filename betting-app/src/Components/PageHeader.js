import React from 'react';

const PageHeader = ({children}) => {
    return(
        <div style={{ display:'flex', margin:'50px'}}>
        <h1 >{children}</h1>
        </div>
    );
};

export default PageHeader;