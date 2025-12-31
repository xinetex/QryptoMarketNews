' QChannel MarketPulse
' Shows overall market health with animated pulse indicator

sub init()
    m.pulseGlow = m.top.findNode("pulseGlow")
    m.pulseDot = m.top.findNode("pulseDot")
    m.statusLabel = m.top.findNode("statusLabel")
    m.statusValue = m.top.findNode("statusValue")
    m.upCount = m.top.findNode("upCount")
    m.downCount = m.top.findNode("downCount")
    m.pulseAnim = m.top.findNode("pulseAnim")
    
    ' Start pulse animation
    m.pulseAnim.control = "start"
end sub

sub onMarketDataChanged()
    data = m.top.marketData
    if data = invalid then return
    
    upCoins = 0
    downCoins = 0
    totalChange = 0
    coinCount = 0
    
    ' Calculate market stats from array of coins
    if data.coins <> invalid
        for each coin in data.coins
            if coin.price_change_percentage_24h <> invalid
                change = coin.price_change_percentage_24h
                totalChange = totalChange + change
                coinCount = coinCount + 1
                
                if change >= 0
                    upCoins = upCoins + 1
                else
                    downCoins = downCoins + 1
                end if
            end if
        end for
    else if data.up <> invalid and data.down <> invalid
        ' Pre-computed stats
        upCoins = data.up
        downCoins = data.down
        if data.avgChange <> invalid
            totalChange = data.avgChange
            coinCount = 1
        end if
    end if
    
    ' Update counts
    m.upCount.text = "↑ " + Str(upCoins).Trim()
    m.downCount.text = "↓ " + Str(downCoins).Trim()
    
    ' Determine market status and color
    avgChange = 0
    if coinCount > 0 then avgChange = totalChange / coinCount
    
    if upCoins > downCoins * 1.5
        setMarketStatus("BULLISH", "#10b981")
    else if downCoins > upCoins * 1.5
        setMarketStatus("BEARISH", "#ef4444")
    else if Abs(avgChange) < 1
        setMarketStatus("NEUTRAL", "#f59e0b")
    else if avgChange > 0
        setMarketStatus("POSITIVE", "#10b981")
    else
        setMarketStatus("NEGATIVE", "#ef4444")
    end if
end sub

sub setMarketStatus(status as String, color as String)
    m.statusValue.text = status
    m.statusValue.color = color
    m.pulseDot.color = color
    m.pulseGlow.color = color + "40"  ' Add alpha
    
    ' Adjust pulse speed based on market volatility
    if status = "BULLISH" or status = "BEARISH"
        m.pulseAnim.duration = 0.8  ' Fast pulse for strong markets
    else
        m.pulseAnim.duration = 1.5  ' Slow pulse for neutral
    end if
end sub
