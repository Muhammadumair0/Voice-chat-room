import React, { useRef, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";
import { usePeerData } from "react-peer-data";
import UserMediaActions from "components/UserMediaActions";
import MessageForm from "components/MessageForm";
import MessageList from "components/MessageList";
import ParticipantList from "components/ParticipantList";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialState = { participants: {}, streams: {} };

function reducer(state, action) {
  switch (action.type) {
    case "connect":
      return {
        participants: {
          ...state.participants,
          [action.participantId]: action.participant
        },
        streams: state.streams
      };
    case "disconnect":
      const {
        [action.participantId]: omitParticipant,
        ...participants
      } = state.participants;
      const { [action.participantId]: omitStream, ...streams } = state.streams;

      return {
        participants,
        streams
      };
    case "addStream":
      return {
        streams: { ...state.streams, [action.participantId]: action.stream },
        participants: state.participants
      };
    default:
      throw new Error("Invalid action type");
  }
}

function Room({ name, username, stream, ...props }) {
  const room = useRef();
  const peerData = usePeerData();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [messages, setMessages] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [nameValue, setNameValue] = useState('');


  const meetingURL = window.location.href;

  useEffect(() => {
    if (room.current) return;

    room.current = peerData.connect(name, stream);
    room.current
      .on("participant", participant => {
        dispatch({
          type: "connect",
          participantId: participant.id,
          participant: participant
        });

        participant
          .on("disconnected", () =>
            dispatch({ type: "disconnect", participantId: participant.id })
          )
          .on("track", event =>
            dispatch({
              type: "addStream",
              participantId: participant.id,
              stream: event.streams[0]
            })
          )
          .on("message", payload => {
            setMessages(msgs => [
              ...msgs,
              { ...JSON.parse(payload), incoming: true }
            ]);

          })
          .on("error", event => {
            console.error("peer", participant.id, event);
            participant.renegotiate();
          });
      })
      .on("error", event => {
        console.error("room", name, event);
      });

    return () => room.current.disconnect();
  }, [name, peerData, stream]);

  const handleSendMessage = message => {
    setMessages(msgs => [...msgs, { username, message }]);

    if (room.current) {
      room.current.send(JSON.stringify({ username, message }));
    }
  };

  const toggleInputControl = (toggleValue) => {
    setShowInput(toggleValue);
  }

  const { participants, streams } = state;

  const navigateToHomePage = () => {
    let newurl = window.location.protocol + "//" + window.location.host;
    window.location.href = newurl;
  }

  const copyLinkToClipBoard = () => {
    navigator.clipboard.writeText(meetingURL);
    toast("Copied to clipboard!");
  }

  const nameValueHandler = (event) => {
    setNameValue(event.target.value)
  }

  const saveNameChange = () => {
    props.onNameChange(nameValue);
    setShowInput(false);
  }

  return (
    <div className={"chat-room"}>
      <div className={"sidebar"}>
        <div className={"sidebar-header"}>
          <p onClick={navigateToHomePage}>Voice chat room</p>
        </div>
        <div className={"profile"}>
          <p className={"username"} onClick={e => toggleInputControl(true)}>{username}</p>
          {showInput === true ?
            (<div className={"form-input"}>
              <input value={nameValue} onChange={nameValueHandler} />
              <div className={"save-cancel"}>
                <p onClick={e => toggleInputControl(false)}>Cancel</p>
                <button onClick={saveNameChange}>Save</button>
              </div>
            </div>)
            :
            <button className={"change-button"} onClick={e => toggleInputControl(true)}>Change your name</button>
          }


        </div>
        <div className={"clipboard"}>
          <div className={"form-input"}>
            <input value={meetingURL} readOnly />
            <div>
              <button className={"change-button"} onClick={copyLinkToClipBoard}>Copy meeting link</button>
              <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </div>
          </div>
        </div>
        <div className={"media-action"}>
          <UserMediaActions stream={stream} />
        </div>
      </div>
      <div className={"message"}>
        <div className={"message-list"}>
          <MessageList messages={messages} />
        </div>
        <div className={"message-form"}>
          <MessageForm onMessageSend={handleSendMessage} />
        </div>
      </div>
      <ParticipantList participants={participants} streams={streams} />
    </div>
  );
}

Room.propTypes = {
  name: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  stream: PropTypes.object
};

export default Room;
