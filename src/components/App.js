import React, { Fragment, useState } from "react";
import {
  UserMediaError,
  useUserMediaFromContext
} from "@vardius/react-user-media";
import Room from "components/Room";
import Home from "components/Home";
import Loading from "components/Loading";

function App() {
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState(null);
  const { stream, error } = useUserMediaFromContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = values => {
    setIsLoading(true);
    setTimeout(() => {
      setUsername(values.username);
      setRoom(values.room);
    }, 3000);


    if (window.history.pushState) {
      let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?meeting_id=${values.room}`;
      window.history.pushState({ path: newurl }, '', newurl);
    }
  };

  const setNewUserName = (newUserName) => {
    setUsername(newUserName);
  }

  return (
    <div style={{height:'100%'}}>
      {room && username && isLoading ? (
        <Room name={room} username={username} stream={stream} onNameChange={setNewUserName} />
      ) : (
          <Fragment>
            {error && (
              <div className="row justify-content-center mt-2">
                <UserMediaError error={error} />
              </div>
            )}
            { isLoading == false && <Home onJoin={handleJoin} />}
            { !room && !username && isLoading && <div className={'loading-parent'}><Loading /></div> }
          </Fragment>
        )}
    </div>
  );
}

export default App;
