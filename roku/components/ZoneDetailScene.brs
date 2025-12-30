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
    m.newsRow = m.top.findNode("newsRow")
    m.adIndicator = m.top.findNode("adIndicator")
    
    m.coinsGrid.observeField("itemSelected", "onCoinSelected")
    
    ' Get reference to CryptoService for API calls
    m.cryptoService = invalid
end sub

sub onZoneSet()
    zone = m.top.zone
    if zone = invalid then return
    
    ' Update UI with zone data
    if zone.icon <> invalid then m.zoneIcon.text = zone.icon
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
        
        ' Determine zone ID
        zoneId = ""
        if zone.coingeckoId <> invalid then zoneId = zone.coingeckoId
        if zoneId = "" and zone.id <> invalid then zoneId = zone.id
        
        ' Request coins
        if zoneId <> ""
            m.cryptoService.zoneCoinsRequest = zoneId
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
        if coinCount >= 12 then exit for ' Limit to 12 coins for 3x4 grid
        
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

sub onNewsReceived()
    if m.cryptoService = invalid then return
    
    news = m.cryptoService.newsData
    if news = invalid or news.count() = 0 then return
    
    ' Populate news row
    content = CreateObject("roSGNode", "ContentNode")
    row = content.createChild("ContentNode")
    
    newsCount = 0
    for each article in news
        if newsCount >= 6 then exit for ' Limit to 6 news items
        
        item = row.createChild("ContentNode")
        
        articleTitle = ""
        if article.title <> invalid then articleTitle = article.title
        
        articleSource = ""
        if article.source <> invalid then articleSource = article.source
        
        articleTime = ""
        if article.published <> invalid then articleTime = article.published
        
        item.addFields({
            title: articleTitle,
            source: articleSource,
            published: articleTime
        })
        
        newsCount = newsCount + 1
    end for
    
    m.newsRow.content = content
end sub

sub onCoinSelected(event as object)
    index = event.getData()
    content = m.coinsGrid.content
    if content <> invalid and index < content.getChildCount()
        coin = content.getChild(index)
        print "Selected coin: " + coin.title
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
    else if key = "up"
        if m.newsRow.hasFocus()
            m.coinsGrid.setFocus(true)
            return true
        end if
    else if key = "down"
        if m.coinsGrid.hasFocus()
            m.newsRow.setFocus(true)
            return true
        end if
    end if
    
    return false
end function
