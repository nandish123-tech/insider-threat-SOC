import React from 'react';
import htm from 'htm';
// htm lets us write JSX-like templates without a build-time JSX transform
export const html = htm.bind(React.createElement);
