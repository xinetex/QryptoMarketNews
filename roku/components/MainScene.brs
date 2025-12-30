' QChannel Main Scene Logic
' BrightScript

sub init()
    m.top.setFocus(true)
    
    ' Get references to UI components
    m.tickerContent = m.top.findNode("tickerContent")
    m.zoneGrid = m.top.findNode("zoneGrid")
    m.liveIndicator = m.top.findNode("liveIndicator")
    
    ' Initialize crypto service
    m.cryptoService = CreateObject("roSGNode", "CryptoService")
    m.cryptoService.observeField("tickerData", "onTickerDataReceived")
    m.cryptoService.observeField("zoneData", "onZoneDataReceived")
    
    ' Start fetching data
    m.cryptoService.control = "run"
    
    ' Setup ticker animation
    m.tickerAnimation = createTickerAnimation()
    
    ' Start live indicator blink
    startLiveIndicatorBlink()
end sub

sub startLiveIndicatorBlink()
    m.blinkTimer = CreateObject("roSGNode", "Timer")
    m.blinkTimer.repeat = true
    m.blinkTimer.duration = 1.0
    m.blinkTimer.observeField("fire", "onBlinkTimer")
    m.blinkTimer.control = "start"
end sub

sub onBlinkTimer()
    if m.liveIndicator.opacity = 1.0
        m.liveIndicator.opacity = 0.3
    else
        m.liveIndicator.opacity = 1.0
    end if
end sub

function createTickerAnimation() as object
    animation = CreateObject("roSGNode", "Animation")
    animation.duration = 20
    animation.repeat = true
    animation.easeFunction = "linear"
    
    interpolator = CreateObject("roSGNode", "Vector2DFieldInterpolator")
    interpolator.key = [0.0, 1.0]
    interpolator.keyValue = [[1920, 18], [-2000, 18]]
    interpolator.fieldToInterp = "tickerContent.translation"
    
    animation.appendChild(interpolator)
    m.top.appendChild(animation)
    
    return animation
end function

sub onTickerDataReceived(event as object)
    tickerData = event.getData()
    
    if tickerData <> invalid and tickerData.Count() > 0
        tickerText = ""
        for each coin in tickerData
            changeColor = "#00ff00"
            if coin.change24h < 0
                changeColor = "#ff0000"
            end if
            
            tickerText = tickerText + coin.symbol + " $" + formatPrice(coin.price)
            tickerText = tickerText + " (" + formatChange(coin.change24h) + ")    "
        end for
        
        m.tickerContent.text = tickerText
        
        ' Restart ticker animation
        m.tickerAnimation.control = "start"
    end if
end sub

sub onZoneDataReceived(event as object)
    zoneData = event.getData()
    
    if zoneData <> invalid and zoneData.Count() > 0
        ' Update zone grid with data
        content = CreateObject("roSGNode", "ContentNode")
        
        for each zone in zoneData
            row = content.createChild("ContentNode")
            row.title = zone.name
            row.description = zone.change
        end for
        
        m.zoneGrid.content = content
    end if
end sub

function formatPrice(price as float) as string
    if price >= 1000
        return Str(price).trim()
    else if price >= 1
        return Str(price).trim()
    else
        return Str(price).trim()
    end if
end function

function formatChange(change as float) as string
    sign = ""
    if change >= 0
        sign = "+"
    end if
    return sign + Str(change).trim() + "%"
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if press
        if key = "back"
            ' Handle back button
            return true
        else if key = "OK"
            ' Handle select
            return true
        end if
    end if
    return false
end function
