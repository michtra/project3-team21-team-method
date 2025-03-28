// validates API keys

const auth = (req, res, next) => {
    const apiKey = req.header("X-API-Key");

    // No API key provided
    if (!apiKey) {
        return res.status(401).json({ error: "API key is required" });
    }

    // Get valid API keys from environment variable (comma-separated list)
    const masterKey = process.env.API_MASTER_KEY;

    // Validate the provided API key
    if (!(masterKey === apiKey)) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    // valid key, proceed
    next();
};

module.exports = auth;
