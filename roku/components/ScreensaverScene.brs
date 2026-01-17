' Prophet TV Screensaver
' BrightScript logic for portfolio screensaver with burn-in prevention

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.contentGroup = m.top.findNode("contentGroup")
    m.mainPrice = m.top.findNode("mainPrice")
    m.mainChange = m.top.findNode("mainChange")
    m.eth = m.top.findNode("eth")
    m.sol = m.top.findNode("sol")
    m.xrp = m.top.findNode("xrp")
    m.sentimentFill = m.top.findNode("sentimentFill")
    m.sentimentValue = m.top.findNode("sentimentValue")
    m.clockLabel = m.top.findNode("clockLabel")
    m.dateLabel = m.top.findNode("dateLabel")
    m.particleContainer = m.top.findNode("particleContainer")
    
    ' Position tracking for movement
    m.baseX = 480
    m.baseY = 270
    m.moveDirection = 1
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataChanged")
    m.cryptoService.control = "run"
    
    ' Setup timers
    m.updateTimer = m.top.findNode("updateTimer")
    m.updateTimer.observeField("fire", "onUpdateTimerFired")
    m.updateTimer.control = "start"
    
    m.moveTimer = m.top.findNode("moveTimer")
    m.moveTimer.observeField("fire", "onMoveTimerFired")
    m.moveTimer.control = "start"
    
    m.particleTimer = m.top.findNode("particleTimer")
    m.particleTimer.observeField("fire", "onParticleTimerFired")
    m.particleTimer.control = "start"
    
    ' Create particles
    m.particles = []
    createParticles(15)
    
    ' Initial updates
    updateClock()
    updateDate()
end sub

sub createParticles(count as integer)
    for i = 0 to count - 1
        particle = m.particleContainer.createChild("Rectangle")
        particle.width = 2 + rnd(3)
        particle.height = particle.width
        particle.color = "#ffffff"
        particle.opacity = 0.02 + rnd(0) * 0.03
        particle.translation = [rnd(1920), rnd(1080)]
        
        m.particles.push({
            node: particle,
            speedX: (rnd(0) - 0.5) * 0.5,
            speedY: -0.2 - rnd(0) * 0.3
        })
    end for
end sub

sub onParticleTimerFired()
    for each p in m.particles
        pos = p.node.translation
        newX = pos[0] + p.speedX
        newY = pos[1] + p.speedY
        
        if newY < -10 then newY = 1090
        if newX < -10 then newX = 1930
        if newX > 1930 then newX = -10
        
        p.node.translation = [newX, newY]
    end for
end sub

sub onMoveTimerFired()
    ' Move content slightly to prevent burn-in
    m.moveDirection = m.moveDirection * -1
    
    offsetX = 20 * m.moveDirection
    offsetY = 15 * m.moveDirection
    
    ' Animate movement
    moveAnim = m.top.createChild("Animation")
    moveAnim.duration = 5
    moveAnim.easeFunction = "inOutQuad"
    
    posInterp = moveAnim.createChild("Vector2DFieldInterpolator")
    posInterp.key = [0.0, 1.0]
    posInterp.keyValue = [m.contentGroup.translation, [m.baseX + offsetX, m.baseY + offsetY]]
    posInterp.fieldToInterp = m.contentGroup.id + ".translation"
    
    moveAnim.control = "start"
end sub

sub onUpdateTimerFired()
    updateClock()
    m.cryptoService.control = "run"
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
    
    m.clockLabel.text = str(hour).trim() + ":" + minStr + " " + ampm
end sub

sub updateDate()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    months = ["January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"]
    
    dayName = days[dt.getDayOfWeek()]
    monthName = months[dt.getMonth() - 1]
    dayNum = dt.getDayOfMonth()
    
    m.dateLabel.text = dayName + ", " + monthName + " " + str(dayNum).trim()
end sub

sub onTickerDataChanged()
    tickerData = m.cryptoService.tickerData
    if tickerData = invalid or tickerData.count() = 0 then return
    
    for each coin in tickerData
        if coin.symbol = "BTC"
            m.mainPrice.text = "$" + formatPrice(coin.price)
            updateChange(m.mainChange, coin.change24h)
        else if coin.symbol = "ETH"
            m.eth.text = "ETH $" + formatPrice(coin.price) + " " + formatChangeShort(coin.change24h)
            m.eth.color = getChangeColor(coin.change24h)
        else if coin.symbol = "SOL"
            m.sol.text = "SOL $" + formatPrice(coin.price) + " " + formatChangeShort(coin.change24h)
            m.sol.color = getChangeColor(coin.change24h)
        else if coin.symbol = "XRP"
            m.xrp.text = "XRP $" + formatPrice(coin.price) + " " + formatChangeShort(coin.change24h)
            m.xrp.color = getChangeColor(coin.change24h)
        end if
    end for
    
    ' Update sentiment
    updateSentiment(tickerData)
end sub

sub updateChange(label as object, change as dynamic)
    c = val(str(change))
    if c >= 0
        label.text = "+" + formatPercent(c)
        label.color = "#10b981"
    else
        label.text = formatPercent(c)
        label.color = "#ef4444"
    end if
end sub

sub updateSentiment(data as object)
    bullish = 0
    for each coin in data
        if val(str(coin.change24h)) > 0 then bullish = bullish + 1
    end for
    
    pct = int((bullish / data.count()) * 100)
    m.sentimentFill.width = int(400 * pct / 100)
    m.sentimentValue.text = str(pct).trim() + "% Bullish"
    
    if pct >= 50
        m.sentimentFill.color = "#10b981"
        m.sentimentValue.color = "#10b981"
    else
        m.sentimentFill.color = "#ef4444"
        m.sentimentValue.color = "#ef4444"
    end if
end sub

function formatPrice(price as dynamic) as string
    p = val(str(price))
    if p >= 1000
        return str(int(p)).trim()
    else if p >= 1
        return str(int(p * 100) / 100).trim()
    else
        return str(int(p * 10000) / 10000).trim()
    end if
end function

function formatPercent(pct as dynamic) as string
    return str(int(val(str(pct)) * 10) / 10).trim() + "%"
end function

function formatChangeShort(change as dynamic) as string
    c = val(str(change))
    if c >= 0
        return "+" + formatPercent(c)
    else
        return formatPercent(c)
    end if
end function

function getChangeColor(change as dynamic) as string
    if val(str(change)) >= 0
        return "#10b981"
    else
        return "#ef4444"
    end if
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if press
        m.top.exitRequested = true
        return true
    end if
    return false
end function
