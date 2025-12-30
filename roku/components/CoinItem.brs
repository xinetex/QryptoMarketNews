' QChannel CoinItem
' BrightScript logic for coin grid item

sub init()
    m.itemContainer = m.top.findNode("itemContainer")
    m.itemBg = m.top.findNode("itemBg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.coinImage = m.top.findNode("coinImage")
    m.coinName = m.top.findNode("coinName")
    m.coinSymbol = m.top.findNode("coinSymbol")
    m.coinPrice = m.top.findNode("coinPrice")
    m.coinChange = m.top.findNode("coinChange")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    m.coinName.text = content.title
    m.coinSymbol.text = content.symbol
    
    ' Format price
    if content.price <> invalid
        m.coinPrice.text = formatPriceDisplay(content.price)
    end if
    
    ' Format change with color
    if content.change24h <> invalid
        change = content.change24h
        if change >= 0
            m.coinChange.text = "+" + formatPercent(change)
            m.coinChange.color = "#10b981"
        else
            m.coinChange.text = formatPercent(change)
            m.coinChange.color = "#ef4444"
        end if
    end if
    
    ' Set coin image
    if content.image <> invalid and content.image <> ""
        m.coinImage.uri = content.image
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        m.focusBorder.opacity = focusPct
        m.itemBg.color = "#1a1a1a"
    else
        m.focusBorder.opacity = 0
        m.itemBg.color = "#0f0f0f"
    end if
end sub

function formatPriceDisplay(price as float) as string
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

function formatPercent(pct as float) as string
    return str(int(pct * 10) / 10).trim() + "%"
end function
