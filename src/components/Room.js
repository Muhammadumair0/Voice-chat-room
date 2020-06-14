import React, { useRef, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";
import { usePeerData } from "react-peer-data";
import UserMediaActions from "components/UserMediaActions";
import MessageForm from "components/MessageForm";
import MessageList from "components/MessageList";

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

function Room({ name, username, stream }) {
  const room = useRef();
  const peerData = usePeerData();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [messages, setMessages] = useState([]);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInput, setShowInput] = useState(false);

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

            setNewMessagesCount(count => ++count);
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
    setNewMessagesCount(0);

    if (room.current) {
      room.current.send(JSON.stringify({ username, message }));
    }
  };

  const handleToggleSidebar = isOpen => {
    if (isOpen) {
      setNewMessagesCount(0);
    }

    setShowSidebar(isOpen);
  };

  const toggleInputControl = (toggleValue) => {
    setShowInput(toggleValue);
  }

  const { participants, streams } = state;

  return (
    // <div className={"chat-room"}>
    //   {/* {stream && (
    //     <Video stream={stream} autoPlay muted className={styles.webcam} />
    //   )}
    //   <div className={showSidebar ? "col-md-9" : "col-md-12"}>
    //     <SidebarActions
    //       className={`${styles.sidebarActions} mt-2 mb-2`}
    //       count={newMessagesCount}
    //       isOpen={showSidebar}
    //       onToggleSidebar={handleToggleSidebar}
    //     />
    //     <ParticipantList participants={participants} streams={streams} />
    //   </div> */}
    //   {/* {(

    //   )}
    // </div> */}
    <div className={"chat-room"}>
      <div className={"sidebar"}>
        <div className={"profile"}>
          <p className={"username"}>{username}</p>
          {showInput == true ?
            (<div className={"form-input"}>
              <input />
              <div className={"save-cancel"}>
                <p onClick={e => toggleInputControl(false)}>Cancel</p>
                <button>Save</button>
              </div>
            </div>)
            :
            <button className={"change-button"} onClick={e => toggleInputControl(true)}>Change your name</button>
          }


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
    </div>
  );
}

Room.propTypes = {
  name: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  stream: PropTypes.object
};

export default Room;
