var chi = require('./chi').make();

// Register internal plugins
require('./internal/states/failed')(chi);
require('./internal/states/success')(chi);
require('./internal/states/unit')(chi);

module.exports = chi;