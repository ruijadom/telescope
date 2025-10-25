# @ruijadom/telescope-cli

Command line interface for Telescope.

## Installation

```bash
npm install --save-dev @ruijadom/telescope-cli
```

Or use directly with npx:

```bash
npx telescope --help
```

## Commands

### Initialize Configuration

Create a `telescope.config.js` file in your project:

```bash
npx telescope init
```

### Start Server

Start the Telescope WebSocket server:

```bash
npx telescope start
```

The server typically starts automatically when you run your dev server with the Telescope plugin configured.

### Check Status

Check if the Telescope server is running:

```bash
npx telescope status
```

### Stop Server

Stop the running Telescope server:

```bash
npx telescope stop
```

## Global Installation

Install globally for easier access:

```bash
npm install -g @ruijadom/telescope-cli

# Now use without npx
telescope start
telescope status
```

## Configuration

The CLI reads configuration from `telescope.config.js` in your project root. Generate a default config with:

```bash
telescope init
```

## Documentation

For full documentation, see the [main Telescope repository](https://github.com/ruijadom/telescope).

## License

MIT
