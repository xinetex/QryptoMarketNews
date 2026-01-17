' QChannel ZoneDetailScene
' BrightScript logic for zone detail page with coin data

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.zoneIcon = m.top.findNode("zoneIcon")
    m.zoneTitle = m.top.findNode("zoneTitle")
    m.tvlLabel = m.top.findNode("tvlLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.protocolsLabel = m.top.findNode("protocolsLabel")
    m.accentLine = m.top.findNode("accentLine")
    m.coinsGrid = m.top.findNode("coinsGrid")
    m.newsContent = m.top.findNode("newsContent")
    m.adIndicator = m.top.findNode("adIndicator")
    
    m.coinsGrid.observeField("itemSelected", "onCoinSelected")
    
    ' Get reference to CryptoService for API calls
    m.cryptoService = invalid
    
    ' News Cycle Timer
    m.newsTimer = m.top.findNode("newsTimer")
    m.newsTimer.observeField("fire", "onNewsTimerFired")
    m.newsIndex = 0
    m.newsItems = invalid
end sub

sub onZoneSet()
    zone = m.top.zone
    if zone = invalid then return
    
    ' Update UI with zone data
    if zone.icon <> invalid then m.zoneIcon.uri = zone.icon
    if zone.name <> invalid then m.zoneTitle.text = zone.name
    if zone.tvl <> invalid then m.tvlLabel.text = "TVL: " + zone.tvl
    
    ' Set change color
    if zone.change <> invalid
        changeStr = zone.change
        if type(changeStr) <> "roString" and type(changeStr) <> "String"
            changeStr = str(changeStr).trim() + "%"
        end if
        if len(changeStr) > 0 and left(changeStr, 1) = "-"
            m.changeLabel.color = "#ef4444"
        else
            m.changeLabel.color = "#10b981"
        end if
        m.changeLabel.text = "24h: " + changeStr
    end if
    
    ' Set accent color
    if zone.color <> invalid
        m.accentLine.color = zone.color
    else if zone.zoneColor <> invalid
        m.accentLine.color = zone.zoneColor
    end if
    
    ' Get CryptoService reference from parent scene
    scene = m.top.getScene()
    if scene <> invalid
        m.cryptoService = scene.findNode("cryptoService")
    end if
    
    ' Request zone coins via CryptoService Task
    if m.cryptoService <> invalid
        ' Set up observer for response
        m.cryptoService.observeField("zoneCoins", "onZoneCoinsReceived")
        m.cryptoService.observeField("newsData", "onNewsReceived")
        
        ' Determine zone ID - use zone.id which matches API keys like "solana", "defi", etc.
        zoneId = ""
        if zone.id <> invalid then zoneId = zone.id
        if zoneId = "" and zone.coingeckoId <> invalid then zoneId = zone.coingeckoId
        
        ' Request coins
        if zoneId <> ""
            m.cryptoService.requestZoneCoins = zoneId
        end if
        
        ' Request news
        m.cryptoService.newsRequest = true
    else
        ' Fallback - show empty state
        m.protocolsLabel.text = "Coins: Loading..."
    end if
end sub

sub onZoneCoinsReceived()
    if m.cryptoService = invalid then return
    
    coins = m.cryptoService.zoneCoins
    if coins = invalid or coins.count() = 0
        m.protocolsLabel.text = "Coins: 0"
        return
    end if
    
    ' Populate coins grid
    content = CreateObject("roSGNode", "ContentNode")
    
    coinCount = 0
    for each coin in coins
        if coinCount >= 20 then exit for ' Limit to 20 coins for 5x4 grid
        
        item = content.createChild("ContentNode")
        
        ' Safely get coin data with fallbacks
        coinName = ""
        if coin.name <> invalid then coinName = coin.name
        
        coinSymbol = ""
        if coin.symbol <> invalid then coinSymbol = ucase(coin.symbol)
        
        coinPrice = 0
        if coin.current_price <> invalid then coinPrice = coin.current_price
        if coin.price <> invalid then coinPrice = coin.price
        
        coinChange = 0
        if coin.price_change_percentage_24h <> invalid then coinChange = coin.price_change_percentage_24h
        if coin.change24h <> invalid then coinChange = coin.change24h
        
        coinImage = ""
        if coin.image <> invalid then coinImage = coin.image
        
        item.addFields({
            title: coinName,
            symbol: coinSymbol,
            price: coinPrice,
            change24h: coinChange,
            image: coinImage
        })
        
        coinCount = coinCount + 1
    end for
    
    m.coinsGrid.content = content
    m.coinsGrid.setFocus(true)
    
    ' Update protocols count
    m.protocolsLabel.text = "Coins: " + str(coins.count()).trim()
end sub



sub onNewsTimerFired()
    if m.newsItems = invalid or m.newsItems.count() <= 1 then return
    
    m.newsIndex = m.newsIndex + 1
    if m.newsIndex >= m.newsItems.count() then m.newsIndex = 0
    
    updateNewsDisplay()
end sub

sub updateNewsDisplay()
    if m.newsItems = invalid or m.newsItems.count() = 0
        m.newsContent.text = "Loading QChannel News..."
        return
    end if
    
    article = m.newsItems[m.newsIndex]
    if article <> invalid and article.title <> invalid
        newsText = article.title
        if article.source <> invalid
            newsText = newsText + " • " + article.source
        end if
        m.newsContent.text = newsText
    end if
end sub

sub onNewsReceived()
    if m.cryptoService = invalid then return
    
    news = m.cryptoService.newsData
    if news = invalid or news.count() = 0 then return
    
    m.newsItems = news
    m.newsIndex = 0
    updateNewsDisplay()
    
    ' Start cycle if we have multiple items
    if news.count() > 1
        m.newsTimer.control = "start"
    end if
end sub

sub onCoinSelected(event as object)
    index = event.getData()
    content = m.coinsGrid.content
    if content <> invalid and index < content.getChildCount()
        coinNode = content.getChild(index)
        print "Selected coin: " + coinNode.title
        
        ' Build coin data object from ContentNode fields
        coin = {
            id: coinNode.id,
            name: coinNode.title,
            symbol: coinNode.symbol,
            image: coinNode.image,
            current_price: coinNode.price,
            price_change_percentage_24h: coinNode.change24h
        }
        
        showCoinDetail(coin)
    end if
end sub

' Navigate to coin detail screen
sub showCoinDetail(coin as object)
    ' Create coin detail scene if not exists
    if m.coinDetailScene = invalid
        m.coinDetailScene = m.top.getParent().createChild("CoinDetailScene")
        m.coinDetailScene.observeField("visible", "onCoinDetailVisibleChanged")
    end if
    
    ' Check if this is NFT zone
    zone = m.top.zone
    isNFT = false
    if zone <> invalid and zone.id <> invalid
        if zone.id = "nft" then isNFT = true
    end if
    
    m.coinDetailScene.isNFT = isNFT
    m.coinDetailScene.coin = coin
    m.coinDetailScene.visible = true
    m.coinDetailScene.setFocus(true)
end sub

sub onCoinDetailVisibleChanged()
    if m.coinDetailScene <> invalid and not m.coinDetailScene.visible
        m.coinsGrid.setFocus(true)
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        ' Clean up observers
        if m.cryptoService <> invalid
            m.cryptoService.unobserveField("zoneCoins")
            m.cryptoService.unobserveField("newsData")
        end if
        ' Navigate back to main scene
        m.top.visible = false
        return true
    end if
    
    ' Coins grid handles its own navigation
    return false
end function
