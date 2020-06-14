import React, { Fragment, useState } from "react";
import {
  UserMediaError,
  useUserMediaFromContext
} from "@vardius/react-user-media";
import Room from "components/Room";
import Home from "components/Home";

function App() {
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState(null);
  const { stream, error } = useUserMediaFromContext();

  const handleJoin = values => {
      setUsername(values.username);
      setRoom(values.room);

    if (window.history.pushState) {
      let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?meeting_id=${values.room}`;
      window.history.pushState({path:newurl},'',newurl);
  }
  };

  return (
    <div>
      {room && username ? (
        <Room name={room} username={username} stream={stream} />
      ) : (
        <Fragment>
          {error && (
            <div className="row justify-content-center mt-2">
              <UserMediaError error={error} />
            </div>
          )}
          <Home onJoin={handleJoin} /> 
        </Fragment>
      )}
    </div>
  );
}

export default App;
