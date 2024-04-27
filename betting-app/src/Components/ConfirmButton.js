import React from 'react';

const ConfirmButton = ({buttonName, message, action}) => {
    const confirm = () => {
         const confirmBox = window.confirm(
             message
         )
         if (confirmBox === true) {
             action();
         }
    }

    return (
        <button style= {{ margin: '5px', width: '150px', height: '50px', border: 'none',
        backgroundColor: 'teal', color: 'white', fontSize: '20px'}} onClick={confirm}> {buttonName}
       </button>
    );
};

export default ConfirmButton;
