' QChannel ZoneCard - Compact Card Design
' BrightScript logic for zone card component

sub init()
    ' Get node references
    m.cardContainer = m.top.findNode("cardContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.iconImage = m.top.findNode("iconImage")
    m.tvlLabel = m.top.findNode("tvlLabel")
    m.titleLabel = m.top.findNode("titleLabel")
    m.descLabel = m.top.findNode("descLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.changeArrow = m.top.findNode("changeArrow")
    m.accentBar = m.top.findNode("accentBar")
    m.selectionGlow = m.top.findNode("selectionGlow")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set zone data
    if content.title <> invalid then m.titleLabel.text = content.title
    if content.description <> invalid then m.descLabel.text = content.description
    
    ' Set icon
    if content.icon <> invalid
        m.iconImage.uri = content.icon
    end if
    
    ' Set TVL
    if content.tvl <> invalid
        m.tvlLabel.text = content.tvl
    end if
    
    ' Set change indicator safely
    changeStr = ""
    changeField = content.getField("change")
    if changeField <> invalid
        changeType = type(changeField)
        if changeType = "roString" or changeType = "String"
            changeStr = changeField
        else if changeType = "roFloat" or changeType = "roDouble" or changeType = "Float" or changeType = "Double"
            changeStr = str(changeField).trim()
            if changeField >= 0 then changeStr = "+" + changeStr
            changeStr = changeStr + "%"
        else if changeType = "roInteger" or changeType = "roInt" or changeType = "Integer"
            changeStr = str(changeField).trim()
            if changeField >= 0 then changeStr = "+" + changeStr
            changeStr = changeStr + "%"
        end if
    end if
    
    if len(changeStr) > 0
        m.changeLabel.text = changeStr
        
        ' Color based on positive/negative
        if left(changeStr, 1) = "-"
            m.changeLabel.color = "#ef4444"
            m.changeArrow.text = "▼"
            m.changeArrow.color = "#ef4444"
        else
            m.changeLabel.color = "#10b981"
            m.changeArrow.text = "▲"
            m.changeArrow.color = "#10b981"
        end if
    end if
    
    ' Set accent bar color
    if content.zoneColor <> invalid
        m.accentBar.color = content.zoneColor
        m.focusBorder.color = content.zoneColor
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        ' Scale up slightly when focused
        scale = 1.0 + (0.03 * focusPct)
        m.cardContainer.scale = [scale, scale]
        
        ' Show focus border
        m.focusBorder.opacity = focusPct
        
        ' Brighten background
        m.cardBg.color = "#1a1a25"
        
        ' Shift position to scale from center
        shift = -5 * focusPct
        m.cardContainer.translation = [shift, shift]
    else
        ' Reset to normal
        m.cardContainer.scale = [1.0, 1.0]
        m.focusBorder.opacity = 0
        m.cardBg.color = "#12121a"
        m.cardContainer.translation = [0, 0]
    end if
end sub
