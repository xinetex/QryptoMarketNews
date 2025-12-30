# QChannel Roku Channel

A premium Roku channel for crypto market intelligence, inspired by [zoneify.tv](https://zoneify.tv).

## Features

- **Hero Spotlight**: Featured zone with live stats
- **Zone Cards**: 8 crypto categories with TVL and change indicators
- **Market Ticker**: Scrolling live prices
- **News Ticker**: Latest crypto headlines
- **Zone Detail Pages**: Drill down into each category
- **Focus Animations**: Scale and glow effects on D-pad navigation
- **Ad Integration**: Google Ad Manager VAST via Roku RAF

## Components

| Component | Description |
|-----------|-------------|
| `MainScene` | Main screen with hero, zones, tickers |
| `ZoneCard` | Premium zone tile for horizontal row |
| `ZoneDetailScene` | Detail view for selected zone |
| `CoinItem` | Grid item for coin display |
| `NewsItem` | Row item for news articles |
| `CryptoService` | API fetch task for live data |

## API Integration

Uses AgentCache QChannel endpoints:
- `GET /api/qchannel/zones` - Zone data
- `GET /api/crypto/prices` - Live prices
- `GET /api/qchannel/ads/vast/preroll` - VAST tag for RAF

## Side-Loading

1. Enable Developer Mode on your Roku:
   - Press Home 3x, Up 2x, Right, Left, Right, Left, Right
   - Note the IP address and create password

2. Zip the channel:
   ```bash
   cd roku
   zip -r ../qchannel.zip . -x "*.DS_Store" -x "__MACOSX/*"
   ```

3. Upload via browser:
   - Go to `http://<roku-ip>:8060`
   - Click "Upload" and select `qchannel.zip`

## Required Images

Place in `images/` folder:
- `channel-poster-hd.png` (540x405)
- `channel-poster-sd.png` (246x140)
- `splash-hd.png` (1920x1080)
- `splash-sd.png` (720x480)
- `hero-gradient.png` (1920x500)
- `card-gradient.png` (280x340)
- `zones/solana-hero.png` (800x400)
- `zones/ai-hero.png` (800x400)
- etc.

## Design Specs

- **Background**: #060606 (near black)
- **Accent Blue**: #00f3ff
- **Accent Purple**: #bc13fe
- **Success Green**: #10b981
- **Error Red**: #ef4444
- **Card Background**: #0a0a0a
