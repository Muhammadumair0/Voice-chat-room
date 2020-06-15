import React from "react";
import PropTypes from "prop-types";
import Stream from "components/Stream";

function Participant({ stream, ...props }) {
  if (!stream) {
    return null;
  }

  return <Stream stream={stream} {...props} autoPlay />;
}

Participant.propTypes = {
  stream: PropTypes.object
};

export default Participant;
