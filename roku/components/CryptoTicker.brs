' QChannel CryptoTicker
' Animated scrolling price ticker for bottom of screen

sub init()
    m.tickerContent = m.top.findNode("tickerContent")
    m.scrollAnim = m.top.findNode("scrollAnim")
    m.brandLabel = m.top.findNode("brandLabel")
    
    ' Start animation if running
    if m.top.running = true
        m.scrollAnim.control = "start"
    end if
end sub

sub onTickerDataChanged()
    data = m.top.tickerData
    if data = invalid or data.Count() = 0 then return
    
    ' Clear existing items
    m.tickerContent.removeChildrenIndex(m.tickerContent.getChildCount(), 0)
    
    ' Build ticker items
    for each coin in data
        item = createTickerItem(coin)
        m.tickerContent.appendChild(item)
    end for
    
    ' Duplicate items for seamless loop
    for each coin in data
        item = createTickerItem(coin)
        m.tickerContent.appendChild(item)
    end for
    
    ' Calculate animation duration based on content width
    itemCount = data.Count() * 2
    duration = itemCount * 3  ' ~3 seconds per item
    m.scrollAnim.duration = duration
    
    ' Restart animation
    if m.top.running = true
        m.scrollAnim.control = "start"
    end if
end sub

function createTickerItem(coin as Object) as Object
    ' Container for each ticker item
    container = CreateObject("roSGNode", "LayoutGroup")
    container.layoutDirection = "horiz"
    container.itemSpacings = [8]
    
    ' Coin Symbol
    symbolLabel = CreateObject("roSGNode", "Label")
    symbolLabel.text = ucase(coin.symbol)
    symbolLabel.font = "font:SmallBoldSystemFont"
    symbolLabel.color = "#ffffff"
    container.appendChild(symbolLabel)
    
    ' Price
    priceLabel = CreateObject("roSGNode", "Label")
    priceLabel.text = formatPrice(coin.current_price)
    priceLabel.font = "font:SmallSystemFont"
    priceLabel.color = "#cccccc"
    container.appendChild(priceLabel)
    
    ' Change Arrow & Percentage
    changeLabel = CreateObject("roSGNode", "Label")
    change = 0
    if coin.price_change_percentage_24h <> invalid
        change = coin.price_change_percentage_24h
    end if
    
    if change >= 0
        changeLabel.text = "▲ " + formatPercent(change)
        changeLabel.color = "#10b981"
    else
        changeLabel.text = "▼ " + formatPercent(change)
        changeLabel.color = "#ef4444"
    end if
    changeLabel.font = "font:SmallBoldSystemFont"
    container.appendChild(changeLabel)
    
    ' Separator
    sepLabel = CreateObject("roSGNode", "Label")
    sepLabel.text = "│"
    sepLabel.font = "font:SmallSystemFont"
    sepLabel.color = "#333333"
    container.appendChild(sepLabel)
    
    return container
end function

sub onRunningChanged()
    if m.top.running = true
        m.scrollAnim.control = "start"
    else
        m.scrollAnim.control = "pause"
    end if
end sub

function formatPrice(price as Dynamic) as String
    if price = invalid then return "$--"
    if price >= 10000
        return "$" + str(int(price)).trim()
    else if price >= 100
        return "$" + str(int(price * 10) / 10).trim()
    else if price >= 1
        return "$" + str(int(price * 100) / 100).trim()
    else
        return "$" + str(int(price * 10000) / 10000).trim()
    end if
end function

function formatPercent(pct as Float) as String
    return str(int(Abs(pct) * 10) / 10).trim() + "%"
end function
