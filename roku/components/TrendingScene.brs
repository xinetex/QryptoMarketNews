' Prophet TV Trending Scene - AI-Powered Market Movers
' BrightScript logic for displaying trending assets with AI insights

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.trendingGrid = m.top.findNode("trendingGrid")
    m.sentimentLabel = m.top.findNode("sentimentLabel")
    m.updateTime = m.top.findNode("updateTime")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("intelligenceData", "onIntelligenceDataChanged")
    m.cryptoService.control = "run"
    
    ' Setup refresh timer
    m.refreshTimer = m.top.findNode("refreshTimer")
    m.refreshTimer.observeField("fire", "onRefreshTimerFired")
    m.refreshTimer.control = "start"
    
    ' Load initial data
    loadTrendingData()
end sub

sub loadTrendingData()
    ' Trigger intelligence fetch
    ' CryptoService will call AgentCache endpoint
    m.cryptoService.control = "run"
end sub

sub onIntelligenceDataChanged()
    intelligence = m.cryptoService.intelligenceData
    if intelligence = invalid then return
    
    movers = intelligence.data
    if movers = invalid or movers.count() = 0 then return
    
    ' Populate grid
    content = CreateObject("roSGNode", "ContentNode")
    
    for each mover in movers
        item = content.createChild("ContentNode")
        item.addFields({
            symbol: mover.symbol,
            name: mover.name,
            price: mover.price,
            change24h: mover.change24h,
            reason: mover.reason,
            sentiment: mover.sentiment,
            trending: mover.trending
        })
    end for
    
    m.trendingGrid.content = content
    
    ' Update sentiment display
    if intelligence.type = "sentiment" or movers.count() > 0
        bullish = 0
        for each mover in movers
            if mover.sentiment = "bullish" then bullish = bullish + 1
        end for
        pct = int((bullish / movers.count()) * 100)
        
        if pct >= 50
            m.sentimentLabel.text = "Market Sentiment: " + str(pct).trim() + "% Bullish"
            m.sentimentLabel.color = "#10b981"
        else
            m.sentimentLabel.text = "Market Sentiment: " + str(100 - pct).trim() + "% Bearish"
            m.sentimentLabel.color = "#ef4444"
        end if
    end if
    
    ' Update timestamp
    m.updateTime.text = "Last updated: Just now"
end sub

sub onRefreshTimerFired()
    loadTrendingData()
    m.updateTime.text = "Last updated: Just now"
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
