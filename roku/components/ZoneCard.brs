' QChannel ZoneCard - Compact Card Design
' BrightScript logic for zone card component

sub init()
    ' Get node references
    m.cardContainer = m.top.findNode("cardContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.focusGlow = m.top.findNode("focusGlow")
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
    
    if content.zoneColor <> invalid
        m.accentBar.color = content.zoneColor
        if m.focusGlow <> invalid then m.focusGlow.blendColor = content.zoneColor
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        ' Punchy scale up (10%) when focused
        ' Card size: 310x240
        ' Max Growth: 31x24
        ' Center Shift: -15.5, -12
        
        scale = 1.0 + (0.10 * focusPct)
        m.cardContainer.scale = [scale, scale]
        
        ' Show focus glow
        m.focusGlow.opacity = focusPct * 0.8
        
        ' Brighten background significantly
        m.cardBg.color = "#27272a" ' Zinc 800
        
        ' Precise shift to scale from center
        shiftX = -15.5 * focusPct
        shiftY = -12.0 * focusPct
        m.cardContainer.translation = [shiftX, shiftY]
    else
        ' Reset to normal
        m.cardContainer.scale = [1.0, 1.0]
        if m.focusGlow <> invalid then m.focusGlow.opacity = 0
        m.cardBg.color = "#18181b" ' Zinc 900
        m.cardContainer.translation = [0, 0]
    end if
end sub
