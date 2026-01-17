' Prophet TV Ambient Mode - Living Market Visualization
' BrightScript logic for animated ambient display

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.glowTop = m.top.findNode("glowTop")
    m.glowBottom = m.top.findNode("glowBottom")
    m.gradientLayer = m.top.findNode("gradientLayer")
    m.particleContainer = m.top.findNode("particleContainer")
    
    m.mainPrice = m.top.findNode("mainPrice")
    m.priceChange = m.top.findNode("priceChange")
    m.mainSymbol = m.top.findNode("mainSymbol")
    
    m.ethValue = m.top.findNode("ethValue")
    m.ethChange = m.top.findNode("ethChange")
    m.solValue = m.top.findNode("solValue")
    m.solChange = m.top.findNode("solChange")
    m.xrpValue = m.top.findNode("xrpValue")
    m.xrpChange = m.top.findNode("xrpChange")
    m.dogeValue = m.top.findNode("dogeValue")
    m.dogeChange = m.top.findNode("dogeChange")
    
    m.sentimentFill = m.top.findNode("sentimentFill")
    m.sentimentValue = m.top.findNode("sentimentValue")
    m.timeLabel = m.top.findNode("timeLabel")
    
    ' Initialize particles
    m.particles = []
    createParticles(25)
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataChanged")
    m.cryptoService.control = "run"
    
    ' Setup timers
    m.colorTimer = m.top.findNode("colorTimer")
    m.colorTimer.observeField("fire", "onColorTimerFired")
    m.colorTimer.control = "start"
    
    m.particleTimer = m.top.findNode("particleTimer")
    m.particleTimer.observeField("fire", "onParticleTimerFired")
    m.particleTimer.control = "start"
    
    m.priceTimer = m.top.findNode("priceTimer")
    m.priceTimer.observeField("fire", "onPriceTimerFired")
    m.priceTimer.control = "start"
    
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "onClockTimerFired")
    m.clockTimer.control = "start"
    
    ' Initialize animation state
    m.colorPhase = 0
    m.colors = [
        "#0a0a2e", ' Deep blue
        "#1a0a3e", ' Purple
        "#0a1a2e", ' Teal
        "#1a1a1a", ' Dark gray
        "#0a2a1a"  ' Green tint
    ]
    
    ' Start ambient animations
    startGlowAnimation()
    updateClock()
end sub

sub createParticles(count as integer)
    for i = 0 to count - 1
        particle = m.particleContainer.createChild("Rectangle")
        particle.width = 4 + rnd(6)
        particle.height = particle.width
        particle.color = "#ffffff"
        particle.opacity = 0.1 + rnd(0) * 0.2
        particle.translation = [rnd(1920), rnd(1080)]
        
        ' Store particle data
        particleData = {
            node: particle,
            speedX: (rnd(0) - 0.5) * 2,
            speedY: -0.5 - rnd(0) * 1.5,
            baseOpacity: particle.opacity
        }
        m.particles.push(particleData)
    end for
end sub

sub onParticleTimerFired()
    for each p in m.particles
        ' Move particle
        currentPos = p.node.translation
        newX = currentPos[0] + p.speedX
        newY = currentPos[1] + p.speedY
        
        ' Wrap around screen
        if newY < -10 then newY = 1090
        if newX < -10 then newX = 1930
        if newX > 1930 then newX = -10
        
        p.node.translation = [newX, newY]
        
        ' Gentle opacity pulse
        p.node.opacity = p.baseOpacity + sin(m.colorPhase * 0.5) * 0.05
    end for
end sub

sub startGlowAnimation()
    ' Animate top glow opacity
    glowAnim = m.top.createChild("Animation")
    glowAnim.duration = 8
    glowAnim.repeat = true
    glowAnim.easeFunction = "linear"
    
    opacityInterp = glowAnim.createChild("FloatFieldInterpolator")
    opacityInterp.key = [0.0, 0.5, 1.0]
    opacityInterp.keyValue = [0.3, 0.5, 0.3]
    opacityInterp.fieldToInterp = m.glowTop.id + ".opacity"
    
    glowAnim.control = "start"
    
    ' Animate bottom glow
    glowAnim2 = m.top.createChild("Animation")
    glowAnim2.duration = 6
    glowAnim2.repeat = true
    
    opacityInterp2 = glowAnim2.createChild("FloatFieldInterpolator")
    opacityInterp2.key = [0.0, 0.5, 1.0]
    opacityInterp2.keyValue = [0.2, 0.4, 0.2]
    opacityInterp2.fieldToInterp = m.glowBottom.id + ".opacity"
    
    glowAnim2.control = "start"
end sub

sub onColorTimerFired()
    m.colorPhase = m.colorPhase + 1
    if m.colorPhase >= m.colors.count() then m.colorPhase = 0
    
    ' Smoothly transition gradient layer color
    colorAnim = m.top.createChild("Animation")
    colorAnim.duration = 4
    colorAnim.easeFunction = "inOutQuad"
    
    colorInterp = colorAnim.createChild("ColorFieldInterpolator")
    colorInterp.key = [0.0, 1.0]
    colorInterp.keyValue = [m.gradientLayer.color, m.colors[m.colorPhase]]
    colorInterp.fieldToInterp = m.gradientLayer.id + ".color"
    
    colorAnim.control = "start"
end sub

sub onPriceTimerFired()
    ' Trigger crypto service refresh
    m.cryptoService.control = "run"
end sub

sub onTickerDataChanged()
    tickerData = m.cryptoService.tickerData
    if tickerData = invalid or tickerData.count() = 0 then return
    
    ' Update main BTC display
    for each coin in tickerData
        if coin.symbol = "BTC"
            animatePriceChange(m.mainPrice, "$" + formatLargePrice(coin.price))
            updateChangeLabel(m.priceChange, coin.change24h)
        else if coin.symbol = "ETH"
            m.ethValue.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.ethChange, coin.change24h)
        else if coin.symbol = "SOL"
            m.solValue.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.solChange, coin.change24h)
        else if coin.symbol = "XRP"
            m.xrpValue.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.xrpChange, coin.change24h)
        else if coin.symbol = "DOGE"
            m.dogeValue.text = "$" + formatPrice(coin.price)
            updateChangeLabel(m.dogeChange, coin.change24h)
        end if
    end for
    
    ' Calculate sentiment from average change
    totalChange = 0
    for each coin in tickerData
        totalChange = totalChange + val(str(coin.change24h))
    end for
    avgChange = totalChange / tickerData.count()
    
    ' Map to sentiment (clamp -10 to +10 range to 0-100%)
    sentiment = 50 + (avgChange * 5)
    if sentiment < 0 then sentiment = 0
    if sentiment > 100 then sentiment = 100
    
    updateSentiment(sentiment)
end sub

sub animatePriceChange(label as object, newText as string)
    ' Quick fade out, change text, fade in
    fadeAnim = m.top.createChild("Animation")
    fadeAnim.duration = 0.3
    
    fadeInterp = fadeAnim.createChild("FloatFieldInterpolator")
    fadeInterp.key = [0.0, 0.5, 1.0]
    fadeInterp.keyValue = [1.0, 0.5, 1.0]
    fadeInterp.fieldToInterp = label.id + ".opacity"
    
    label.text = newText
    fadeAnim.control = "start"
end sub

sub updateChangeLabel(label as object, change as dynamic)
    changeVal = val(str(change))
    if changeVal >= 0
        label.text = "+" + formatPercent(changeVal)
        label.color = "#10b981"
    else
        label.text = formatPercent(changeVal)
        label.color = "#ef4444"
    end if
end sub

sub updateSentiment(pct as float)
    m.sentimentFill.width = int(600 * pct / 100)
    
    if pct >= 60
        m.sentimentFill.color = "#10b981"
        m.sentimentValue.color = "#10b981"
        m.sentimentValue.text = str(int(pct)).trim() + "% Bullish"
    else if pct >= 40
        m.sentimentFill.color = "#f59e0b"
        m.sentimentValue.color = "#f59e0b"
        m.sentimentValue.text = "Neutral"
    else
        m.sentimentFill.color = "#ef4444"
        m.sentimentValue.color = "#ef4444"
        m.sentimentValue.text = str(int(100 - pct)).trim() + "% Bearish"
    end if
end sub

sub onClockTimerFired()
    updateClock()
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
    
    m.timeLabel.text = str(hour).trim() + ":" + minStr + " " + ampm
end sub

function formatLargePrice(price as dynamic) as string
    p = val(str(price))
    return str(int(p)).trim()
end function

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
    p = val(str(pct))
    return str(int(p * 10) / 10).trim() + "%"
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "OK" or key = "back"
        m.top.exitRequested = true
        m.top.visible = false
        return true
    end if
    
    return false
end function
