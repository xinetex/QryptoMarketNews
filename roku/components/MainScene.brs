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
    
    ' Setup focus observers for row list
    m.zoneGrid.observeField("rowItemFocused", "onZoneFocused")
    m.zoneGrid.observeField("rowItemSelected", "onZoneSelected")
    
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
        }
    ]
    
    ' Store zones for reference
    m.zones = zones
    
    ' Populate RowList dynamically (supports any number of zones)
    content = CreateObject("roSGNode", "ContentNode")
    itemsPerRow = 4
    numRows = int((zones.count() + itemsPerRow - 1) / itemsPerRow) ' Ceiling division
    
    for rowIndex = 0 to numRows - 1
        row = content.createChild("ContentNode")
        startIndex = rowIndex * itemsPerRow
        endIndex = startIndex + itemsPerRow - 1
        
        for i = startIndex to endIndex
            if i < zones.count()
                zone = zones[i]
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
            end if
        end for
    end for
    
    m.zoneGrid.content = content
    m.zoneGrid.setFocus(true)
    
    ' Set initial spotlight to first zone
    if zones.count() > 0
        updateSpotlight(zones[0])
    end if
end sub

sub onZoneFocused(event as object)
    gridInfo = event.getData() ' Returns [rowIndex, itemIndex]
    if gridInfo = invalid or gridInfo.count() < 2 then return
    
    itemIndex = gridInfo[1]
    
    ' Fix for "Gap" issue:
    ' If Item 0: Snap focus to Left (0) using minimal offset (to avoid gap caused by 320px offset).
    ' If Item 1+: Snap focus to 2nd Slot (320px) to lock scrolling there.
    if itemIndex = 0
        m.zoneGrid.focusXOffset = [0]
    else
        m.zoneGrid.focusXOffset = [320]
    end if

    ' Flatten index for m.zones lookup
    ' We have 2 rows, 4 items per row (dynamic population logic uses 4)
    itemsPerRow = 4 
    rowIndex = gridInfo[0]
    flatIndex = (rowIndex * itemsPerRow) + itemIndex
    
    if m.zones <> invalid and flatIndex < m.zones.count()
        updateSpotlight(m.zones[flatIndex])
        
        ' Update backdrop color based on zone color?
        ' Optional visual flair
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
    gridIndices = event.getData()
    if gridIndices <> invalid and gridIndices.count() = 2
        rowIndex = gridIndices[0]
        itemIndex = gridIndices[1]
        itemsPerRow = 4
        flatIndex = (rowIndex * itemsPerRow) + itemIndex
        
        if m.zones <> invalid and flatIndex < m.zones.count()
            zone = m.zones[flatIndex]
            print "Selected zone: " + zone.name
            showZoneDetail(zone)
        end if
    end if
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
    
    if key = "back"
        return false ' Exit channel
    end if
    
    return false
end function
