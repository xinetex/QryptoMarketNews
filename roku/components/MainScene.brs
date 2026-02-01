' QChannel MainScene - TV News Style Layout
' BrightScript logic for main scene with grid navigation

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.zoneGrid = m.top.findNode("zoneGrid")
    
    ' Transition Components
    m.transitionOverlay = m.top.findNode("transitionOverlay")
    m.fadeAnimation = m.top.findNode("fadeAnimation")
    
    ' Zone detail scene reference
    m.zoneDetailScene = invalid
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataChanged")
    m.cryptoService.observeField("zoneData", "onZoneDataChanged")
    m.cryptoService.observeField("newsData", "onNewsDataChanged")
    m.cryptoService.observeField("intelligenceData", "onIntelligenceDataChanged")
    m.cryptoService.observeField("briefingData", "onBriefingDataReceived")
    
    ' Prophet OS Observers
    m.cryptoService.observeField("alphaVector", "onAlphaVectorChanged")
    m.cryptoService.observeField("newsHeadlines", "onNewsHeadlinesChanged")
    m.cryptoService.observeField("alertData", "onAlertReceived")
    m.cryptoService.observeField("whaleAlerts", "onWhaleAlertsReceived")
    
    m.cryptoService.control = "run"
    
    ' Prophet OS Nodes
    m.alphaHud = m.top.findNode("alphaHud")
    m.rsvpDisplay = m.top.findNode("rsvpDisplay")
    m.tvAlert = m.top.findNode("tvAlert")
    
    ' Setup Ad Timers
    m.adTimer = m.top.findNode("adTimer")
    m.adRevertTimer = m.top.findNode("adRevertTimer")
    
    ' (Optional) adTimer logic if nodes exist
    if m.adTimer <> invalid
        m.adTimer.observeField("fire", "onAdTimerFired")
        m.adTimer.control = "start"
    end if
    
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
    
    ' Setup Sidebar Menu
    m.mainMenu = m.top.findNode("mainMenu")
    setupMainMenu()
    
    ' Load initial data
    loadZoneData()

    ' Initialize MoltConnect (Agent Interface)
    m.moltConnect = m.top.findNode("moltConnect")
    if m.moltConnect <> invalid
        m.moltConnect.submolt = "qcrypto"
    end if
end sub

sub setupMainMenu()
    menuContent = CreateObject("roSGNode", "ContentNode")
    
    items = [
        { title: "  ORACLE" },
        { title: "  ZONES" },
        { title: "  RSVP" },
        { title: "  SETTINGS" }
    ]
    
    for each item in items
        node = menuContent.createChild("ContentNode")
        node.title = item.title
    end for
    
    m.mainMenu.content = menuContent
    m.mainMenu.observeField("itemSelected", "onMenuSelected")
end sub

sub onMenuSelected()
    idx = m.mainMenu.itemSelected
    print "Menu Selected: " + str(idx)
    
    ' 0: ORACLE (Market Pulse / Briefing)
    if idx = 0
         if m.briefingScene = invalid or not m.briefingScene.visible
             launchBriefingMode()
         end if
         
    ' 1: ZONES (Grid)
    else if idx = 1
         ' Return focus to grid
         m.zoneGrid.setFocus(true)
         
    ' 2: RSVP (Featured News)
    else if idx = 2
         ' Focus the RSVP Display for playback controls?
         ' For now, just ensure we are on the main view
         if m.rsvpDisplay <> invalid
             ' Maybe toggle play/pause or focus it?
             ' m.rsvpDisplay.setFocus(true) ' If it supports focus
         end if
         m.zoneGrid.setFocus(true)
         
    ' 3: SETTINGS
    else if idx = 3
         launchSettingsMode()
    end if
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
    ' Legacy spotlight logic removed for Prophet OS
    ' print "Focused: " + zone.name
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
    print "[MainScene] Launching Control Center (Settings)..."
    launchSettingsMode()
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
    ' Legacy ticker support - optional
    tickerData = m.cryptoService.tickerData
    if tickerData <> invalid and tickerData.count() > 0 and m.tickerContent <> invalid
        ' Implementation removed/simplified since m.tickerContent is likely null
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
    
    ' Check for Fear & Greed in briefingData (exposed via intelligence or separate?)
    ' Actually CryptoService updates briefingData separately.
    ' Let's observe briefingData in MainScene too.
end sub

sub onBriefingDataReceived()
    data = m.cryptoService.briefingData
    if data <> invalid and data.marketStatus <> invalid
        status = data.marketStatus
        fngLabel = m.top.findNode("fngLabel")
        if fngLabel <> invalid
            fngLabel.text = "F&G: " + str(status.score).trim()
            
            ' Color code
            if status.score >= 50
                 fngLabel.color = "#10b981" ' Green
            else
                 fngLabel.color = "#ef4444" ' Red
            end if
        end if
    end if
end sub

function formatPrice(price as float) as string
    if price >= 1000
        return Int(price).toStr()
    else if price >= 1
        ' Manual decimal formatting since toStr() is simple
        p = Int(price * 100)
        s = p.toStr()
        if s.Len() > 2
            return Left(s, s.Len() - 2) + "." + Right(s, 2)
        else
            return "0." + s
        end if
    else
        p = Int(price * 10000)
        s = p.toStr()
        ' Pad if needed (simple approximation for safety)
        if s.Len() < 4
             return "0.000" + s
        else
             return "0." + s
        end if
    end if
end function

function formatPercent(pct as float) as string
    p = Int(pct * 10)
    s = p.toStr()
    if s.Len() > 1
        return Left(s, s.Len() - 1) + "." + Right(s, 1) + "%"
    else
        return "0." + s + "%"
    end if
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
    


    ' Fast Forward launches Portfolio (Gamification)
    if key = "fastforward"
        launchPortfolioMode()
        return true
    end if
    ' Debug focus state
    if m.mainMenu.hasFocus()
        if key = "right"
            m.zoneGrid.setFocus(true)
            return true
        end if
    else if m.zoneGrid.hasFocus()
        if key = "left"
            ' Check if we are on the left edge (Column 0)
            if (m.zoneGrid.itemFocused MOD 4) = 0
                m.mainMenu.setFocus(true)
                return true
            end if
        else if key = "back"
            ' Back from grid -> Menu
            m.mainMenu.setFocus(true)
            return true
        end if
    end if
    
    return false
end function
sub onAlphaVectorChanged()
    ' Received new component data from CryptoService
    data = m.cryptoService.alphaVector
    if data <> invalid and m.alphaHud <> invalid
        print "[MainScene] Updating AlphaHUD: Risk=" + str(data.risk_score)
        
        ' Update fields (AlphaHUD observes these)
        if data.risk_score <> invalid then m.alphaHud.riskScore = data.risk_score
        if data.sentiment <> invalid then m.alphaHud.sentiment = data.sentiment
        if data.momentum <> invalid then m.alphaHud.momentum = data.momentum
    end if
end sub

sub onNewsHeadlinesChanged()
    ' Received concatenated headlines string for RSVP
    text = m.cryptoService.newsHeadlines
    if text <> invalid and text <> "" and m.rsvpDisplay <> invalid
        print "[MainScene] Sending " + str(len(text)) + " chars to RSVP."
        m.rsvpDisplay.content = text
        
        ' Also update the legacy text ticker if it exists
        if m.newsContent <> invalid
             m.newsContent.text = "📰 " + text
        end if
    end if
end sub

sub onWhaleAlertsReceived()
    alerts = m.cryptoService.whaleAlerts
    if alerts <> invalid and alerts.count() > 0
        print "[MainScene] >>> WHALE SONAR ACTIVE: " + str(alerts.count()) + " signals detected."
        ' Future: Pass to a specific visual component
        ' For now, we confirm the data pipeline is open.
    end if
end sub

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
    
    ' Hide Main Content to prevent overlap
    m.headerBar = m.top.findNode("headerBar")
    m.tickerSection = m.top.findNode("tickerSection")
    m.heroSection = m.top.findNode("heroSection")
    m.zonesSection = m.top.findNode("zonesSection")
    m.newsSection = m.top.findNode("newsSection")
    
    if m.headerBar <> invalid then m.headerBar.visible = false
    if m.tickerSection <> invalid then m.tickerSection.visible = false
    if m.heroSection <> invalid then m.heroSection.visible = false
    if m.zonesSection <> invalid then m.zonesSection.visible = false
    if m.newsSection <> invalid then m.newsSection.visible = false
    
    print "[MainScene] Ambient scene set up complete"
    
    ' Trigger Fade Transition
    performTransition(m.ambientScene)
end sub

sub performTransition(targetScene as object)
    m.transitionOverlay.visible = true
    m.pendingTargetScene = targetScene
    m.fadeAnimation.observeField("state", "onFadeAnimationState")
    m.fadeAnimation.control = "start"
end sub

sub onFadeAnimationState()
    if m.fadeAnimation.state = "stopped"
        m.transitionOverlay.visible = false
        m.fadeAnimation.unobserveField("state")
        m.pendingTargetScene = invalid
    else if m.fadeAnimation.state = "running"
        ' Check if we are at peak opacity (midway)
        ' But SG animations don't give a callback at keyframes easily.
        ' Instead, we'll swap visibility halfway through using a timer or just immediately if fast.
        ' Actually, cleaner way: Fade In (to black) -> Swap -> Fade Out (to clear).
        ' But our animation is 0 -> 1 -> 0.
        ' We can just swap visibility immediately? No, user sees jump.
        ' Let's set a timer for 0.2s (half of 0.4s duration) to do the swap.
        
        if m.transitionTimer = invalid
             m.transitionTimer = m.top.createChild("Timer")
             m.transitionTimer.duration = 0.2
             m.transitionTimer.repeat = false
             m.transitionTimer.observeField("fire", "onTransitionSwap")
        end if
        m.transitionTimer.control = "start"
    end if
end sub

sub onTransitionSwap()
    if m.pendingTargetScene <> invalid
        ' Hide Main
        if m.headerBar <> invalid then m.headerBar.visible = false
        if m.tickerSection <> invalid then m.tickerSection.visible = false
        if m.heroSection <> invalid then m.heroSection.visible = false
        if m.zonesSection <> invalid then m.zonesSection.visible = false
        if m.newsSection <> invalid then m.newsSection.visible = false
        
        ' Show Target
        m.pendingTargetScene.visible = true
        m.pendingTargetScene.setFocus(true)
        m.idleSeconds = 0
    end if
end sub

sub onAmbientExitRequested()
    if m.ambientScene <> invalid
        m.ambientScene.visible = false
        
        ' Restore Main Content
        if m.headerBar <> invalid then m.headerBar.visible = true
        if m.tickerSection <> invalid then m.tickerSection.visible = true
        if m.heroSection <> invalid then m.heroSection.visible = true
        if m.zonesSection <> invalid then m.zonesSection.visible = true
        if m.newsSection <> invalid then m.newsSection.visible = true
        
        m.zoneGrid.setFocus(true)
        m.idleSeconds = 0
    end if
end sub

sub launchSettingsMode()
    if m.settingsScene = invalid
        m.settingsScene = m.top.createChild("SettingsScene")
        m.settingsScene.observeField("exitRequested", "onSettingsExitRequested")
    end if
    
    ' Trigger Fade Transition
    performTransition(m.settingsScene)
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
    
    performTransition(m.nftGalleryScene)
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
    
    performTransition(m.briefingScene)
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
    
    performTransition(m.predictionScene)
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
    
    performTransition(m.screensaverScene)
    
    ' Pass data if available
    if m.cryptoService.nftData <> invalid
        m.screensaverScene.contentData = m.cryptoService.nftData
    end if
end sub

sub onScreensaverExitRequested()
    if m.screensaverScene <> invalid
        m.screensaverScene.visible = false
        m.zoneGrid.setFocus(true)
        m.idleSeconds = 0
    end if
end sub

sub launchPortfolioMode()
    if m.portfolioScene = invalid
        m.portfolioScene = m.top.createChild("PortfolioScene")
        m.portfolioScene.observeField("exitRequested", "onPortfolioExitRequested")
    end if
    
    performTransition(m.portfolioScene)
end sub

sub onPortfolioExitRequested()
    if m.portfolioScene <> invalid
        m.portfolioScene.visible = false
        m.zoneGrid.setFocus(true)
    end if
end sub


sub launchActivationView()
    if m.deviceLinkScene = invalid
        m.deviceLinkScene = m.top.findNode("deviceLinkScene")
        m.deviceLinkScene.observeField("visible", "onDeviceLinkVisibleChanged")
        m.deviceLinkScene.observeField("linkComplete", "onDeviceLinkComplete")
    end if
    
    print "[MainScene] Launching Device Link Scene..."
    m.deviceLinkScene.visible = true
    m.deviceLinkScene.setFocus(true)
end sub

sub onDeviceLinkVisibleChanged()
    if m.deviceLinkScene <> invalid and not m.deviceLinkScene.visible
        ' Returned from linking logic (back/exit)
        if m.settingsScene <> invalid and m.settingsScene.visible
            m.settingsScene.setFocus(true)
        else
            m.zoneGrid.setFocus(true)
        end if
    end if
end sub

sub onDeviceLinkComplete()
    if m.deviceLinkScene.linkComplete
        print "[MainScene] Device paired successfully"
        user = m.deviceLinkScene.linkedUser
        print "User: " + FormatJson(user)
        
        ' Hide scene
        m.deviceLinkScene.visible = false
        
        ' TODO: Persist user session or update UI with points
    end if
end sub


sub launchWatchlistMode()
    if m.watchlistLayer = invalid
        m.watchlistLayer = m.top.findNode("watchlistLayer")
        m.watchlistLayer.observeField("visible", "onWatchlistVisibleChanged")
    end if
    
    m.watchlistLayer.visible = true
    m.watchlistLayer.setFocus(true)
end sub

sub onWatchlistVisibleChanged()
    if not m.watchlistLayer.visible
        m.zoneGrid.setFocus(true)
    end if
end sub

sub onAlertReceived()
    alert = m.cryptoService.alertData
    if alert <> invalid and m.tvAlert <> invalid
        print "[MainScene] Alert Data Received: " + FormatJson(alert)
        
        ' Validate required fields
        if alert.type <> invalid and alert.title <> invalid and alert.message <> invalid
            print "[MainScene] Valid Alert. Triggering UI..."
            m.tvAlert.alertType = alert.type
            m.tvAlert.title = alert.title
            m.tvAlert.message = alert.message
            m.tvAlert.callFunc("show")
        else
            print "[MainScene] Error: Invalid alert data structure."
        end if
    end if
end sub
