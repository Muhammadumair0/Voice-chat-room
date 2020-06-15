import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

function MessageForm({ onMessageSend, ...props }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (String(inputRef.current).includes('textarea')) {
      inputRef.current.focus();
    }
  });

  const handleFormSubmit = event => {

    event.preventDefault();

    const msg = inputRef.current.value;
    if (msg.length === 0) {
      return;
    }

    onMessageSend(msg);

    inputRef.current.value = "";
  };

  return (
    <form {...props} onSubmit={handleFormSubmit}>
      <div className="input-group send-message">
        <textarea
          ref={inputRef}
          className="form-control"
          placeholder="Type a message..."
          aria-label="Type a message..."
        />
        <div className="input-group-append">
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </div>
      </div>
    </form>
  );
}

MessageForm.propTypes = {
  onMessageSend: PropTypes.func.isRequired
};

export default MessageForm;
