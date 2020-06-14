import React from "react";
import { v4 as uuidv4 } from 'uuid';
import * as funnyName from 'sillyname';
import PropTypes from "prop-types";


function Home({ onJoin, ...props }) {
    const meetingId = new URLSearchParams(window.location.search).get('meeting_id');

    const handleClick = () => {
        if (!meetingId) {
            onJoin({ room: uuidv4(), username: funnyName() });
        } else {
            onJoin({ room: meetingId, username: funnyName() });
        }
    }

    return (
        <header className={"header"}>
            <div className={"brand-box"}>
                <span className={"brand"}>Voice chat room</span>
            </div>

            <div className={"text-box"}>
                <h1 className={"heading-primary"}>
                    <span className={"heading-primary-main"}>Audio Conferencing for the Digital Workplace</span>
                    <span className={"heading-primary-sub"}>Try it. It's simple.</span>
                </h1>
                <a className={"host-button"} onClick={handleClick}>{
                    meetingId
                        ? 'Join meeting' : 'Host a meeting'}</a>
            </div>
        </header>
    );
}

Home.propTypes = {
    onJoin: PropTypes.func.isRequired
};


export default Home;
