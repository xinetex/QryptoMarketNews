' QChannel MainScene - TV News Style Layout
' BrightScript logic for main scene with grid navigation

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.heroTitle = m.top.findNode("heroTitle")
    m.spotlightZoneName = m.top.findNode("spotlightZoneName")
    m.spotlightStats = m.top.findNode("spotlightStats")
    m.spotlightDesc = m.top.findNode("spotlightDesc")
    m.heroImage = m.top.findNode("heroImage")
    m.tickerContent = m.top.findNode("tickerContent")
    m.newsContent = m.top.findNode("newsContent")
    m.zoneGrid = m.top.findNode("zoneGrid")
    m.liveDot = m.top.findNode("liveDot")
    
    ' Zone detail scene reference
    m.zoneDetailScene = invalid
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataChanged")
    m.cryptoService.observeField("zoneData", "onZoneDataChanged")
    m.cryptoService.observeField("newsData", "onNewsDataChanged")
    m.cryptoService.observeField("intelligenceData", "onIntelligenceDataChanged")
    m.cryptoService.control = "run"
    
    ' Setup Ad Timers
    m.adTimer = m.top.findNode("adTimer")
    m.adRevertTimer = m.top.findNode("adRevertTimer")
    
    m.adTimer.observeField("fire", "onAdTimerFired")
    m.adRevertTimer.observeField("fire", "onAdRevertTimerFired")
    
    m.adTimer.control = "start"
    
    ' Track original data for reverting
    m.originalZoneData = invalid
    m.adIndex = -1
    
    ' Ambient Mode references
    m.ambientScene = invalid
    m.idleTimer = invalid
    m.idleSeconds = 0
    setupIdleTimer()
    
    ' Setup focus observers for grid
    m.zoneGrid.observeField("itemFocused", "onZoneFocused")
    m.zoneGrid.observeField("itemSelected", "onZoneSelected")
    
    ' Start live indicator animation
    startLiveAnimation()
    
    ' Load initial data
    loadZoneData()
end sub

sub startLiveAnimation()
    ' Blink live dot animation
    m.liveAnimation = m.top.createChild("Animation")
    m.liveAnimation.repeat = true
    m.liveAnimation.duration = 1.0
    
    alphaPair = m.liveAnimation.createChild("FloatFieldInterpolator")
    alphaPair.key = [0.0, 0.5, 1.0]
    alphaPair.keyValue = [1.0, 0.3, 1.0]
    alphaPair.fieldToInterp = m.liveDot.id + ".opacity"
    
    m.liveAnimation.control = "start"
end sub

sub loadZoneData()
    ' Define crypto zones with colors
    zones = [
        {
            id: "solana",
            name: "Solana Ecosystem",
            description: "DeFi, NFTs, meme coins",
            icon: "pkg:/images/zones/solana-hero.png",
            color: "#9945FF",
            tvl: "$8.2B",
            change: "+5.2%",
            coingeckoId: "solana-ecosystem"
        },
        {
            id: "ai",
            name: "AI Agents",
            description: "Machine learning tokens",
            icon: "pkg:/images/zones/ai-hero.png",
            color: "#00D9FF",
            tvl: "$4.1B",
            change: "+12.5%",
            coingeckoId: "artificial-intelligence"
        },
        {
            id: "memes",
            name: "Meme Trenches",
            description: "Viral meme coins",
            icon: "pkg:/images/zones/memes-hero.png",
            color: "#FF6B35",
            tvl: "$2.8B",
            change: "+8.7%",
            coingeckoId: "meme-token"
        },
        {
            id: "rwa",
            name: "Real World Assets",
            description: "Tokenized treasuries",
            icon: "pkg:/images/zones/rwa-hero.png",
            color: "#10B981",
            tvl: "$30B+",
            change: "+2.1%",
            coingeckoId: "real-world-assets-rwa"
        },
        {
            id: "nft",
            name: "NFT Market",
            description: "Digital collectibles",
            icon: "pkg:/images/zones/nft-hero.png",
            color: "#EC4899",
            tvl: "$1.2B",
            change: "-1.4%",
            coingeckoId: "non-fungible-tokens-nft"
        },
        {
            id: "gaming",
            name: "GameFi",
            description: "Play-and-own gaming",
            icon: "pkg:/images/zones/gaming-hero.png",
            color: "#F59E0B",
            tvl: "$6.2B",
            change: "+3.8%",
            coingeckoId: "gaming"
        },
        {
            id: "defi",
            name: "DeFi 2.0",
            description: "Next-gen DeFi protocols",
            icon: "pkg:/images/zones/defi-hero.png",
            color: "#8B5CF6",
            tvl: "$180B",
            change: "+1.9%",
            coingeckoId: "decentralized-finance-defi"
        },
        {
            id: "metals",
            name: "Precious Metals",
            description: "Tokenized gold & silver",
            icon: "pkg:/images/zones/metals-hero.png",
            color: "#D4AF37",
            tvl: "$1.2B",
            change: "+0.8%",
            coingeckoId: "tokenized-gold"
        },
        {
            id: "special-modes",
            name: "✨ Special Modes",
            description: "Screensaver, Ambient, NFT Gallery",
            icon: "pkg:/images/zones/ai-hero.png",
            color: "#bc13fe",
            tvl: "MODES",
            change: "→ OK",
            coingeckoId: ""
        }
    ]
    
    ' Store zones for reference
    m.zones = zones
    
    ' Populate MarkupGrid (Flat list)
    content = CreateObject("roSGNode", "ContentNode")
    
    for each zone in zones
        item = content.createChild("ContentNode")
        item.addFields({
            id: zone.id,
            title: zone.name,
            description: zone.description,
            icon: zone.icon,
            zoneColor: zone.color,
            tvl: zone.tvl,
            change: zone.change,
            coingeckoId: zone.coingeckoId
        })
    end for
    
    m.zoneGrid.content = content
    m.zoneGrid.setFocus(true)
    
    ' Set initial spotlight to first zone
    if zones.count() > 0
        updateSpotlight(zones[0])
    end if
end sub

sub onZoneFocused(event as object)
    itemIndex = event.getData() ' Returns flat index for MarkupGrid
    
    if m.zones <> invalid and itemIndex < m.zones.count()
        updateSpotlight(m.zones[itemIndex])
    end if
end sub

sub updateSpotlight(zone as object)
    m.spotlightZoneName.text = zone.name
    
    ' Color the change indicator
    changeColor = "#10b981"
    if left(zone.change, 1) = "-"
        changeColor = "#ef4444"
    end if
    
    m.spotlightStats.text = "TVL " + zone.tvl + " • 24h " + zone.change
    m.spotlightStats.color = changeColor
    m.spotlightDesc.text = zone.description
    
    ' Update hero image
    m.heroImage.uri = "pkg:/images/zones/" + zone.id + "-hero.png"
end sub

sub onZoneSelected(event as object)
    itemIndex = event.getData() ' Flat index for MarkupGrid
    
    if m.zones <> invalid and itemIndex < m.zones.count()
        zone = m.zones[itemIndex]
        print "Selected zone: " + zone.name
        
        ' Handle special modes zone
        if zone.id = "special-modes"
            handleSpecialModes()
        else
            showZoneDetail(zone)
        end if
    end if
end sub

sub handleSpecialModes()
    print "[MainScene] handleSpecialModes called"
    print "[MainScene] Launching Ambient Mode..."
    launchAmbientMode()
    print "[MainScene] Ambient Mode launched"
end sub

' Navigate to zone detail screen
sub showZoneDetail(zone as object)
    ' Create zone detail scene if not exists
    if m.zoneDetailScene = invalid
        m.zoneDetailScene = m.top.createChild("ZoneDetailScene")
        m.zoneDetailScene.observeField("visible", "onZoneDetailVisibleChanged")
    end if
    
    ' Pass zone data
    m.zoneDetailScene.zone = zone
    m.zoneDetailScene.visible = true
    m.zoneDetailScene.setFocus(true)
end sub

sub onZoneDetailVisibleChanged()
    if m.zoneDetailScene <> invalid and not m.zoneDetailScene.visible
        ' Returned from zone detail, restore focus
        m.zoneGrid.setFocus(true)
    end if
end sub

sub onTickerDataChanged()
    tickerData = m.cryptoService.tickerData
    if tickerData <> invalid and tickerData.count() > 0
        tickerText = ""
        for each coin in tickerData
            changeSign = "+"
            ' Convert change24h to number for comparison (API may send as string)
            changeVal = 0
            if coin.change24h <> invalid
                if type(coin.change24h) = "roString" or type(coin.change24h) = "String"
                    changeVal = val(coin.change24h)
                else
                    changeVal = coin.change24h
                end if
            end if
            
            if changeVal < 0
                changeSign = ""
            end if
            
            priceVal = 0
            if coin.price <> invalid
                if type(coin.price) = "roString" or type(coin.price) = "String"
                    priceVal = val(coin.price)
                else
                    priceVal = coin.price
                end if
            end if
            
            tickerText = tickerText + coin.symbol + " $" + formatPrice(priceVal) + " " + changeSign + formatPercent(changeVal) + " • "
        end for
        m.tickerContent.text = tickerText
    end if
end sub

sub onZoneDataChanged()
    zoneData = m.cryptoService.zoneData
    ' Update live data from API
    if zoneData <> invalid
        for i = 0 to m.zones.count() - 1
            for each apiZone in zoneData
                if m.zones[i].id = apiZone.id or m.zones[i].name = apiZone.name
                    if apiZone.tvl <> invalid
                        m.zones[i].tvl = apiZone.tvl
                    end if
                    if apiZone.change <> invalid
                        m.zones[i].change = apiZone.change
                    end if
                end if
            end for
        end for
    end if
end sub

sub onNewsDataChanged()
    newsData = m.cryptoService.newsData
    if newsData <> invalid and newsData.count() > 0
        ' Cycle through headlines for the news ticker
        headlines = []
        for each item in newsData
            if item.title <> invalid
                headlines.push(item.title)
            end if
        end for
        
        if headlines.count() > 0
            m.newsContent.text = "📰 " + headlines[0]
            
            ' Store for cycling
            m.newsHeadlines = headlines
            m.currentNewsIndex = 0
        end if
    end if
end sub

sub onIntelligenceDataChanged()
    intelligence = m.cryptoService.intelligenceData
    if intelligence <> invalid and intelligence.data <> invalid
        ' Update market pulse or trending info if we have UI for it
        print "[MainScene] Intelligence data received: " + str(intelligence.data.count()) + " movers"
    end if
end sub

function formatPrice(price as float) as string
    if price >= 1000
        return str(int(price)).trim()
    else if price >= 1
        return str(int(price * 100) / 100).trim()
    else
        return str(int(price * 10000) / 10000).trim()
    end if
end function

function formatPercent(pct as float) as string
    return str(int(pct * 10) / 10).trim() + "%"
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    ' Reset idle timer on any key press
    m.idleSeconds = 0
    
    ' Handle active overlay scenes
    if m.ambientScene <> invalid and m.ambientScene.visible
        return false
    end if
    if m.zoneDetailScene <> invalid and m.zoneDetailScene.visible
        return false
    end if
    
    ' PLAY button launches Ambient Mode
    if key = "play"
        launchAmbientMode()
        return true
    end if
    
    ' OPTIONS button launches Settings
    if key = "options"
        launchSettingsMode()
        return true
    end if
    
    ' Rewind button launches NFT Gallery
    if key = "rewind"
        launchNFTGalleryMode()
        return true
    end if
    
    if key = "back"
        return false ' Exit channel
    end if
    
    return false
end function

' ===== AMBIENT MODE =====
sub setupIdleTimer()
    m.idleTimer = m.top.createChild("Timer")
    m.idleTimer.repeat = true
    m.idleTimer.duration = 1
    m.idleTimer.observeField("fire", "onIdleTimerFired")
    m.idleTimer.control = "start"
end sub

sub onIdleTimerFired()
    m.idleSeconds = m.idleSeconds + 1
    
    ' Auto-launch ambient mode after 90 seconds of inactivity
    if m.idleSeconds >= 90
        if m.ambientScene = invalid or not m.ambientScene.visible
            launchAmbientMode()
        end if
    end if
end sub

sub launchAmbientMode()
    print "[MainScene] launchAmbientMode called"
    if m.ambientScene = invalid
        print "[MainScene] Creating AmbientScene..."
        m.ambientScene = m.top.createChild("AmbientScene")
        m.ambientScene.observeField("exitRequested", "onAmbientExitRequested")
    end if
    
    print "[MainScene] Setting ambient visible and focused"
    m.ambientScene.visible = true
    m.ambientScene.setFocus(true)
    m.idleSeconds = 0
    print "[MainScene] Ambient scene set up complete"
end sub

sub onAmbientExitRequested()
    if m.ambientScene <> invalid
        m.ambientScene.visible = false
        m.zoneGrid.setFocus(true)
        m.idleSeconds = 0
    end if
end sub

sub launchSettingsMode()
    if m.settingsScene = invalid
        m.settingsScene = m.top.createChild("SettingsScene")
        m.settingsScene.observeField("exitRequested", "onSettingsExitRequested")
    end if
    
    m.settingsScene.visible = true
    m.settingsScene.setFocus(true)
end sub

sub onSettingsExitRequested()
    if m.settingsScene <> invalid
        launchMode = m.settingsScene.launchMode
        m.settingsScene.visible = false
        m.settingsScene.launchMode = ""
        
        ' Launch requested mode
        if launchMode = "screensaver"
            launchScreensaverMode()
        else if launchMode = "ambient"
            launchAmbientMode()
        else if launchMode = "nft"
            launchNFTGalleryMode()
        else if launchMode = "predictions"
            launchPredictionMode()
        else if launchMode = "briefing"
            launchBriefingMode()
        else if launchMode = "pair"
            launchActivationView()
        else if launchMode = "watchlist"
            launchWatchlistMode()
        else
            m.zoneGrid.setFocus(true)
        end if
    end if
end sub

sub onLaunchModeChanged()
    mode = m.top.launchMode
    if mode = invalid or mode = "" then return
    
    print "[MainScene] Launch Mode Triggered: " + mode
    
    ' Reset mode so it can be triggered again later if needed
    ' But careful not to infinite loop if we set it to "" immediately inside here?
    ' Typically we handle the action then clear it, or just leave it.
    ' Let's handle it.
    
    if mode = "screensaver"
        launchScreensaverMode()
    else if mode = "ambient"
        launchAmbientMode()
    else if mode = "nft"
        launchNFTGalleryMode()
    else if mode = "predictions"
        launchPredictionMode()
    else if mode = "briefing"
        launchBriefingMode()
    else if mode = "pair"
        launchActivationView()
    else if mode = "watchlist"
        launchWatchlistMode()
    else if mode = "settings"
        launchSettingsMode()
    end if
    
    ' Clear it so we can re-trigger same mode if needed
    m.top.launchMode = ""
end sub

' ===== VOICE & SECOND SCREEN =====
sub onVoiceQuery()
    query = m.top.voiceQuery
    if query = invalid or query = "" then return
    
    print "[MainScene] Voice query: " + query
    
    ' Create voice result scene
    if m.voiceResultScene = invalid
        m.voiceResultScene = m.top.createChild("VoiceResultScene")
        m.voiceResultScene.observeField("exitRequested", "onVoiceExitRequested")
    end if
    
    m.voiceResultScene.query = query
    m.voiceResultScene.visible = true
    m.voiceResultScene.setFocus(true)
end sub

sub onVoiceExitRequested()
    if m.voiceResultScene <> invalid
        m.voiceResultScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub onDeepLink()
    link = m.top.deepLink
    if link = invalid then return
    
    print "[MainScene] Deep link: " + link.contentId
    
    ' Handle different content types
    if link.mediaType = "zone"
        ' Navigate to specific zone
        for each zone in m.zones
            if zone.id = link.contentId
                showZoneDetail(zone)
                exit for
            end if
        end for
    else if link.mediaType = "coin"
        ' Navigate to coin detail
        showCoinDetail(link.contentId)
    else if link.mediaType = "ambient"
        launchAmbientMode()
    else if link.mediaType = "trending"
        launchTrendingMode()
    end if
end sub

sub onEcpAction()
    action = m.top.ecpAction
    if action = invalid or action = "" then return
    
    print "[MainScene] ECP action: " + action
    
    if action = "ambient"
        launchAmbientMode()
    else if action = "trending"
        launchTrendingMode()
    else if action = "home"
        ' Return to main grid
        if m.zoneDetailScene <> invalid then m.zoneDetailScene.visible = false
        if m.ambientScene <> invalid then m.ambientScene.visible = false
        if m.voiceResultScene <> invalid then m.voiceResultScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub launchTrendingMode()
    if m.trendingScene = invalid
        m.trendingScene = m.top.createChild("TrendingScene")
        m.trendingScene.observeField("exitRequested", "onTrendingExitRequested")
    end if
    
    m.trendingScene.visible = true
    m.trendingScene.setFocus(true)
end sub

sub onTrendingExitRequested()
    if m.trendingScene <> invalid
        m.trendingScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub launchNFTGalleryMode()
    if m.nftGalleryScene = invalid
        m.nftGalleryScene = m.top.createChild("NFTGalleryScene")
        m.nftGalleryScene.observeField("exitRequested", "onNFTGalleryExitRequested")
    end if
    
    m.nftGalleryScene.visible = true
    m.nftGalleryScene.setFocus(true)
end sub

sub onNFTGalleryExitRequested()
    if m.nftGalleryScene <> invalid
        m.nftGalleryScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub showCoinDetail(coinId as string)
    ' Use crypto service to fetch and show coin detail
    m.cryptoService.coinRequest = coinId
end sub

sub launchBriefingMode()
    if m.briefingScene = invalid
        m.briefingScene = m.top.createChild("BriefingScene")
        m.briefingScene.observeField("exitRequested", "onBriefingExitRequested")
    end if
    
    m.briefingScene.visible = true
    m.briefingScene.setFocus(true)
end sub

sub onBriefingExitRequested()
    if m.briefingScene <> invalid
        m.briefingScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub launchPredictionMode()
    if m.predictionScene = invalid
        m.predictionScene = m.top.createChild("PredictionScene")
        m.predictionScene.observeField("exitRequested", "onPredictionExitRequested")
    end if
    
    m.predictionScene.visible = true
    m.predictionScene.setFocus(true)
end sub

sub onPredictionExitRequested()
    if m.predictionScene <> invalid
        m.predictionScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub

sub launchScreensaverMode()
    if m.screensaverScene = invalid
        m.screensaverScene = m.top.createChild("ScreensaverScene")
        m.screensaverScene.observeField("exitRequested", "onScreensaverExitRequested")
    end if
    
    m.screensaverScene.visible = true
    m.screensaverScene.setFocus(true)
end sub

sub onScreensaverExitRequested()
    if m.screensaverScene <> invalid
        m.screensaverScene.visible = false
        m.zoneGrid.setFocus(true)
        m.idleSeconds = 0
    end if
end sub


sub launchActivationView()
    if m.activationView = invalid
        print "[MainScene] Creating ActivationView..."
        m.activationView = m.top.createChild("ActivationView")
        m.activationView.observeField("visible", "onActivationVisibleChanged")
        m.activationView.observeField("activationComplete", "onActivationComplete")
    end if
    
    print "[MainScene] Launching Activation View..."
    m.activationView.visible = true
    m.activationView.setFocus(true)
end sub

sub onActivationVisibleChanged()
    if m.activationView <> invalid and not m.activationView.visible
        ' Returned from activation logic
        m.settingsScene.visible = true
        m.settingsScene.setFocus(true)
    end if
end sub

sub onActivationComplete()
    if m.activationView.activationComplete
        print "[MainScene] Device paired successfully"
        ' Could show a success toast here
        m.activationView.visible = false
    end if
end sub


sub launchWatchlistMode()
    if m.watchlistLayer = invalid
        m.watchlistLayer = m.top.findNode("watchlistLayer")
        ' Pass crypto service reference if needed
    end if
    
    m.watchlistLayer.visible = true
    m.watchlistLayer.setFocus(true)
end sub
