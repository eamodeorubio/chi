var chi = require('./chi').make();

// Register internal plugins
require('./internal/plugins/failed')(chi);
require('./internal/plugins/success')(chi);
require('./internal/plugins/unit')(chi);

module.exports = chi;