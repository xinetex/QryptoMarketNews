' QChannel MainScene - Zoneify-Inspired Design
' BrightScript logic for main scene with vertical navigation

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
    m.zoneRowList = m.top.findNode("zoneRowList")
    m.liveDot = m.top.findNode("liveDot")
    m.heroSection = m.top.findNode("heroSection")
    m.zonesSection = m.top.findNode("zonesSection")
    m.newsSection = m.top.findNode("newsSection")
    
    ' Navigation state: "zones" (default), "hero", "news"
    m.currentSection = "zones"
    
    ' Zone detail scene reference
    m.zoneDetailScene = invalid
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataChanged")
    m.cryptoService.observeField("zoneData", "onZoneDataChanged")
    m.cryptoService.control = "run"
    
    ' Zone row focus handling
    m.zoneRowList.observeField("itemFocused", "onZoneFocused")
    m.zoneRowList.observeField("itemSelected", "onZoneSelected")
    
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
            description: "High-performance blockchain with DeFi, NFTs, and meme coins",
            icon: "⚡",
            color: "#9945FF",
            tvl: "$8.2B",
            change: "+5.2%",
            coingeckoId: "solana-ecosystem"
        },
        {
            id: "ai",
            name: "AI Agents",
            description: "Artificial intelligence and machine learning tokens",
            icon: "🧠",
            color: "#00D9FF",
            tvl: "$4.1B",
            change: "+12.5%",
            coingeckoId: "artificial-intelligence"
        },
        {
            id: "memes",
            name: "Meme Trenches",
            description: "Community-driven meme coins and viral tokens",
            icon: "🐸",
            color: "#FF6B35",
            tvl: "$2.8B",
            change: "+8.7%",
            coingeckoId: "meme-token"
        },
        {
            id: "rwa",
            name: "Real World Assets",
            description: "Tokenized treasuries, bonds, and real estate",
            icon: "🏛️",
            color: "#10B981",
            tvl: "$30B+",
            change: "+2.1%",
            coingeckoId: "real-world-assets-rwa"
        },
        {
            id: "nft",
            name: "NFT Market",
            description: "Digital collectibles and gaming assets",
            icon: "🎨",
            color: "#EC4899",
            tvl: "$1.2B",
            change: "-1.4%",
            coingeckoId: "non-fungible-tokens-nft"
        },
        {
            id: "gaming",
            name: "GameFi",
            description: "Play-and-own gaming with on-chain assets",
            icon: "🎮",
            color: "#F59E0B",
            tvl: "$6.2B",
            change: "+3.8%",
            coingeckoId: "gaming"
        },
        {
            id: "defi",
            name: "DeFi 2.0",
            description: "Next-gen decentralized finance protocols",
            icon: "📈",
            color: "#8B5CF6",
            tvl: "$180B",
            change: "+1.9%",
            coingeckoId: "decentralized-finance-defi"
        },
        {
            id: "layer2",
            name: "L2 Scaling",
            description: "Layer 2 solutions for faster, cheaper transactions",
            icon: "⚙️",
            color: "#06B6D4",
            tvl: "$45B",
            change: "+4.2%",
            coingeckoId: "layer-2"
        }
    ]
    
    ' Store zones for reference
    m.zones = zones
    
    ' Populate row list
    content = CreateObject("roSGNode", "ContentNode")
    row = content.createChild("ContentNode")
    
    for each zone in zones
        item = row.createChild("ContentNode")
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
    
    m.zoneRowList.content = content
    m.zoneRowList.setFocus(true)
    
    ' Set initial spotlight to first zone
    if zones.count() > 0
        updateSpotlight(zones[0])
    end if
end sub

sub onZoneFocused(event as object)
    focusedIndex = event.getData()
    if m.zones <> invalid and focusedIndex < m.zones.count()
        updateSpotlight(m.zones[focusedIndex])
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
    selectedIndex = event.getData()
    if m.zones <> invalid and selectedIndex < m.zones.count()
        zone = m.zones[selectedIndex]
        print "Selected zone: " + zone.name
        showZoneDetail(zone, selectedIndex)
    end if
end sub

' Navigate to zone detail screen
sub showZoneDetail(zone as object, index as integer)
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
        m.zoneRowList.setFocus(true)
    end if
end sub

sub onTickerDataChanged()
    tickerData = m.cryptoService.tickerData
    if tickerData <> invalid and tickerData.count() > 0
        tickerText = ""
        for each coin in tickerData
            changeSign = "+"
            if coin.change24h < 0
                changeSign = ""
            end if
            tickerText = tickerText + coin.symbol + " $" + formatPrice(coin.price) + " " + changeSign + formatPercent(coin.change24h) + " • "
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
    
    ' Handle zone detail scene first
    if m.zoneDetailScene <> invalid and m.zoneDetailScene.visible
        return false ' Let detail scene handle it
    end if
    
    if key = "up"
        ' Move focus up from zones to hero area
        if m.currentSection = "zones"
            m.currentSection = "hero"
            highlightSection("hero")
            return true
        end if
    else if key = "down"
        ' Move focus down from hero to zones
        if m.currentSection = "hero"
            m.currentSection = "zones"
            m.zoneRowList.setFocus(true)
            highlightSection("zones")
            return true
        end if
    else if key = "OK" or key = "play"
        ' Select current zone from hero spotlight
        if m.currentSection = "hero"
            focusedIndex = m.zoneRowList.itemFocused
            if m.zones <> invalid and focusedIndex < m.zones.count()
                showZoneDetail(m.zones[focusedIndex], focusedIndex)
                return true
            end if
        end if
    else if key = "back"
        if m.currentSection = "hero"
            m.currentSection = "zones"
            m.zoneRowList.setFocus(true)
            highlightSection("zones")
            return true
        end if
        return false
    end if
    
    return false
end function

sub highlightSection(sectionName as string)
    ' Visual feedback for section focus
    if sectionName = "hero"
        m.heroSection.opacity = 1.0
        m.zonesSection.opacity = 0.7
    else if sectionName = "zones"
        m.heroSection.opacity = 0.9
        m.zonesSection.opacity = 1.0
        m.zoneRowList.setFocus(true)
    end if
end sub
