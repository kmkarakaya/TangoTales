const React = require('react');

module.exports = {
  BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  // Render the element prop so Route works in tests
  Route: ({ element }) => element || null,
  Link: ({ children }) => React.createElement('a', null, children),
};
