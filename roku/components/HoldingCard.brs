' Holding Card Logic

sub init()
    m.bg = m.top.findNode("bg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.icon = m.top.findNode("icon")
    m.symbol = m.top.findNode("symbol")
    m.name = m.top.findNode("name")
    m.value = m.top.findNode("value")
    m.amount = m.top.findNode("amount")
    m.pnl = m.top.findNode("pnl")
end sub

sub onContentSet()
    item = m.top.itemContent
    if item = invalid then return

    m.symbol.text = item.symbol
    m.name.text = item.title ' ContentNode uses title
    
    if item.HDPOSTERURL <> invalid
        m.icon.uri = item.HDPOSTERURL
    end if

    ' Format Numbers
    m.value.text = item.valueFormatted
    m.amount.text = item.amountFormatted
    m.pnl.text = item.pnlFormatted
    
    ' Color P&L
    if item.isPositive = true
        m.pnl.color = "#10b981" ' Green
    else
        m.pnl.color = "#ef4444" ' Red
    end if
end sub

sub onFocusChanged()
    percent = m.top.focusPercent
    
    if percent > 0
        m.focusBorder.opacity = percent
        ' Scale effect
        scale = 1.0 + (0.05 * percent)
        m.top.scale = [scale, scale]
    else
        m.focusBorder.opacity = 0
        m.top.scale = [1.0, 1.0]
    end if
end sub
