# QChannel - Roku Channel

A Roku channel that displays real-time cryptocurrency market data with a TV-style interface.

## Structure

```
roku/
├── manifest                 # Channel metadata
├── source/
│   ├── main.brs            # Entry point
│   ├── MainScene.brs       # Main scene component
│   └── components/
│       ├── TickerBar.brs   # Scrolling price ticker
│       ├── ZoneCard.brs    # Market sector cards
│       └── CryptoService.brs # API integration
├── components/
│   └── MainScene.xml       # Scene graph XML
└── images/
    └── channel-poster.png  # Channel artwork
```

## Development

1. Install Roku development tools
2. Enable developer mode on your Roku device
3. Side-load the channel for testing

## API Integration

The channel fetches data from the QChannel web API:
- `/api/crypto/prices` - Real-time ticker prices
- `/api/crypto/categories` - Market sector data
