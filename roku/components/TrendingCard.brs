' Prophet TV Trending Card
' BrightScript logic for trending item display

sub init()
    m.cardBg = m.top.findNode("cardBg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.symbolLabel = m.top.findNode("symbolLabel")
    m.nameLabel = m.top.findNode("nameLabel")
    m.priceLabel = m.top.findNode("priceLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.reasonLabel = m.top.findNode("reasonLabel")
    m.trendingBadge = m.top.findNode("trendingBadge")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set symbol and name
    if content.symbol <> invalid
        m.symbolLabel.text = content.symbol
    end if
    
    if content.name <> invalid
        m.nameLabel.text = content.name
    end if
    
    ' Set price
    if content.price <> invalid
        m.priceLabel.text = "$" + formatPrice(content.price)
    end if
    
    ' Set change with color
    if content.change24h <> invalid
        change = content.change24h
        if change >= 0
            m.changeLabel.text = "+" + formatPercent(change)
            m.changeLabel.color = "#10b981"
        else
            m.changeLabel.text = formatPercent(change)
            m.changeLabel.color = "#ef4444"
        end if
    end if
    
    ' Set AI reason
    if content.reason <> invalid
        m.reasonLabel.text = "🤖 " + content.reason
    end if
    
    ' Show trending badge if applicable
    if content.trending <> invalid and content.trending = true
        m.trendingBadge.visible = true
    else
        m.trendingBadge.visible = false
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    if focusPct > 0.5
        m.focusBorder.opacity = 1.0
        m.cardBg.color = "#ffffff15"
    else
        m.focusBorder.opacity = 0
        m.cardBg.color = "#ffffff08"
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
    p = val(str(pct))
    return str(int(p * 10) / 10).trim() + "%"
end function
