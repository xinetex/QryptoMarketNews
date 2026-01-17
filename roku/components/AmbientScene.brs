' Prophet TV Ambient Mode - Full Featured
' Live crypto prices with proper focus management

sub init()
    print "[AmbientScene] >>> INIT STARTED <<<"
    m.top.setFocus(true)
    
    ' Get node references
    m.timeLabel = m.top.findNode("timeLabel")
    m.dateLabel = m.top.findNode("dateLabel")
    m.mainPrice = m.top.findNode("mainPrice")
    m.mainChange = m.top.findNode("mainChange")
    m.ethPrice = m.top.findNode("ethPrice")
    m.ethChange = m.top.findNode("ethChange")
    m.solPrice = m.top.findNode("solPrice")
    m.solChange = m.top.findNode("solChange")
    m.xrpPrice = m.top.findNode("xrpPrice")
    m.xrpChange = m.top.findNode("xrpChange")
    m.dogePrice = m.top.findNode("dogePrice")
    m.dogeChange = m.top.findNode("dogeChange")
    m.sentimentFill = m.top.findNode("sentimentFill")
    m.sentimentValue = m.top.findNode("sentimentValue")
    m.mainVol = m.top.findNode("mainVol")
    m.mainCap = m.top.findNode("mainCap")
    m.newsTicker = m.top.findNode("newsTicker")
    m.tickerAnim = m.top.findNode("tickerAnim")
    
    ' Start ticker
    if m.tickerAnim <> invalid
        m.tickerAnim.control = "start"
    end if
    
    ' Setup visuals timer
    m.visualsTimer = m.top.findNode("visualsTimer")
    if m.visualsTimer <> invalid
        m.visualsTimer.observeField("fire", "onVisualsTimerFired")
    end if
    
    m.visuals = []
    m.currentVisualIndex = 0
    m.bgImage = m.top.findNode("bgImage")
    
    ' Setup crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    if m.cryptoService <> invalid
        m.cryptoService.observeField("tickerData", "onTickerDataChanged")
        m.cryptoService.observeField("newsData", "onNewsDataChanged")
        m.cryptoService.observeField("visualsData", "onVisualsDataChanged")
        m.cryptoService.newsRequest = true
        m.cryptoService.control = "run"
    end if
    
    ' Setup timers
    m.clockTimer = m.top.findNode("clockTimer")
    if m.clockTimer <> invalid
        m.clockTimer.observeField("fire", "onClockTimerFired")
        m.clockTimer.control = "start"
    end if
    
    m.priceTimer = m.top.findNode("priceTimer")
    if m.priceTimer <> invalid
        m.priceTimer.observeField("fire", "onPriceTimerFired")
        m.priceTimer.control = "start"
    end if
    
    ' Initial updates
    updateClock()
    updateDate()
    
    print "[AmbientScene] >>> INIT COMPLETE <<<"
end sub

sub onVisualsDataChanged()
    data = m.cryptoService.visualsData
    if data <> invalid and data.count() > 0
        m.visuals = data
        m.currentVisualIndex = 0
        updateBackground()
        
        if m.visualsTimer <> invalid
            m.visualsTimer.control = "start"
        end if
    end if
end sub

sub onVisualsTimerFired()
    m.currentVisualIndex = m.currentVisualIndex + 1
    if m.currentVisualIndex >= m.visuals.count()
        m.currentVisualIndex = 0
    end if
    updateBackground()
end sub

sub updateBackground()
    if m.bgImage <> invalid and m.visuals.count() > 0
        item = m.visuals[m.currentVisualIndex]
        if item.url <> invalid
            print "[AmbientScene] Switching bg to: " + item.title
            m.bgImage.uri = item.url
        end if
    end if
end sub

sub onNewsDataChanged()
    news = m.cryptoService.newsData
    if news <> invalid and news.count() > 0
        tickerText = ""
        for each item in news
            if item.title <> invalid
                tickerText = tickerText + "   +++   " + ucase(item.title)
            end if
        end for
        if m.newsTicker <> invalid
            m.newsTicker.text = tickerText
        end if
    end if
end sub

sub onClockTimerFired()
    updateClock()
end sub

sub onPriceTimerFired()
    if m.cryptoService <> invalid
        m.cryptoService.control = "run"
        m.cryptoService.newsRequest = true
    end if
end sub

sub updateClock()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    hour = dt.getHours()
    mins = dt.getMinutes()
    ampm = "AM"
    
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    
    minStr = str(mins).trim()
    if mins < 10 then minStr = "0" + minStr
    
    if m.timeLabel <> invalid
        m.timeLabel.text = str(hour).trim() + ":" + minStr + " " + ampm
    end if
end sub

sub updateDate()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    dayName = days[dt.getDayOfWeek()]
    monthName = months[dt.getMonth() - 1]
    dayNum = dt.getDayOfMonth()
    year = dt.getYear()
    
    if m.dateLabel <> invalid
        m.dateLabel.text = dayName + ", " + monthName + " " + str(dayNum).trim() + ", " + str(year).trim()
    end if
end sub

sub onTickerDataChanged()
    tickerData = m.cryptoService.tickerData
    if tickerData = invalid then return
    if tickerData.count() = 0 then return
    
    for each coin in tickerData
        if coin.symbol = "BTC"
            if m.mainPrice <> invalid then m.mainPrice.text = "$" + formatLargePrice(coin.price)
            updateChangeLabel(m.mainChange, coin.change24h)
        else if coin.symbol = "ETH"
            if m.ethPrice <> invalid then m.ethPrice.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.ethChange, coin.change24h)
        else if coin.symbol = "SOL"
            if m.solPrice <> invalid then m.solPrice.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.solChange, coin.change24h)
        else if coin.symbol = "XRP"
            if m.xrpPrice <> invalid then m.xrpPrice.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.xrpChange, coin.change24h)
        else if coin.symbol = "DOGE"
            if m.dogePrice <> invalid then m.dogePrice.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.dogeChange, coin.change24h)
        end if
    end for
    
    ' Update sentiment based on market
    updateSentiment(tickerData)
end sub

sub updateChangeLabel(label as object, change as dynamic)
    if label = invalid then return
    
    ' Handle both string and numeric change values
    changeVal = 0
    if type(change) = "roString" or type(change) = "String"
        changeVal = val(change)
    else if type(change) = "roFloat" or type(change) = "Float" or type(change) = "roInt" or type(change) = "Integer"
        changeVal = change
    else
        changeVal = val(str(change))
    end if
    
    if changeVal >= 0
        label.text = "+" + formatPercent(changeVal)
        label.color = "#10b981"
    else
        label.text = formatPercent(changeVal)
        label.color = "#ef4444"
    end if
end sub

sub updateSentiment(tickerData as object)
    totalChange = 0
    validCount = 0
    
    for each coin in tickerData
        changeVal = 0
        if type(coin.change24h) = "roString" or type(coin.change24h) = "String"
            changeVal = val(coin.change24h)
        else if type(coin.change24h) = "roFloat" or type(coin.change24h) = "Float" or type(coin.change24h) = "roInt" or type(coin.change24h) = "Integer"
            changeVal = coin.change24h
        end if
        
        totalChange = totalChange + changeVal
        validCount = validCount + 1
    end for
    
    if validCount = 0 then return
    avgChange = totalChange / validCount
    
    ' Map to 0-100 scale
    sentiment = 50 + (avgChange * 5)
    if sentiment < 0 then sentiment = 0
    if sentiment > 100 then sentiment = 100
    
    if m.sentimentFill <> invalid
        m.sentimentFill.width = int(600 * sentiment / 100)
    end if
    
    if m.sentimentValue <> invalid
        if sentiment >= 60
            m.sentimentFill.color = "#10b981"
            m.sentimentValue.color = "#10b981"
            m.sentimentValue.text = str(int(sentiment)).trim() + "% Bullish"
        else if sentiment >= 40
            m.sentimentFill.color = "#f59e0b"
            m.sentimentValue.color = "#f59e0b"
            m.sentimentValue.text = "Neutral"
        else
            m.sentimentFill.color = "#ef4444"
            m.sentimentValue.color = "#ef4444"
            m.sentimentValue.text = str(int(100 - sentiment)).trim() + "% Bearish"
        end if
    end if
end sub

function formatLargePrice(price as dynamic) as string
    p = 0
    if type(price) = "roString" or type(price) = "String"
        p = val(price)
    else if type(price) = "roFloat" or type(price) = "Float" or type(price) = "roInt" or type(price) = "Integer"
        p = price
    else
        p = val(str(price))
    end if
    
    return str(int(p)).trim()
end function

function formatPrice(price as dynamic) as string
    p = 0
    if type(price) = "roString" or type(price) = "String"
        p = val(price)
    else if type(price) = "roFloat" or type(price) = "Float" or type(price) = "roInt" or type(price) = "Integer"
        p = price
    else
        p = val(str(price))
    end if

    if p >= 1000
        return str(int(p)).trim()
    else if p >= 1
        return str(int(p * 100) / 100).trim()
    else if p = 0
        return "0.00"
    else
        return str(int(p * 10000) / 10000).trim()
    end if
end function

function formatPercent(pct as dynamic) as string
    p = 0
    if type(pct) = "roString" or type(pct) = "String"
        p = val(pct)
    else if type(pct) = "roFloat" or type(pct) = "Float" or type(pct) = "roInt" or type(pct) = "Integer"
        p = pct
    else
        p = val(str(pct))
    end if
    
    return str(int(p * 10) / 10).trim() + "%"
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "OK" or key = "back"
        print "[AmbientScene] Exiting..."
        ' Stop timers
        if m.clockTimer <> invalid then m.clockTimer.control = "stop"
        if m.priceTimer <> invalid then m.priceTimer.control = "stop"
        
        m.top.visible = false
        m.top.exitRequested = true
        return true
    end if
    
    return true ' Consume all other keys while in ambient mode
end function

function formatLargeNumber(num as dynamic) as string
    n = 0
    if type(num) = "roString" or type(num) = "String"
        n = val(num)
    else if type(num) = "roFloat" or type(num) = "Float" or type(num) = "roInt" or type(num) = "Integer"
        n = num
    else
        n = val(str(num))
    end if
    
    if n >= 1000000000
        return str(int(n / 1000000000 * 10) / 10).trim() + "B"
    else if n >= 1000000
        return str(int(n / 1000000 * 10) / 10).trim() + "M"
    else if n >= 1000
        return str(int(n / 1000 * 10) / 10).trim() + "K"
    else
        return str(int(n)).trim()
    end if
end function
