' QChannel ZoneCard - Premium Card Design
' BrightScript logic for zone card component

sub init()
    ' Get node references
    m.cardContainer = m.top.findNode("cardContainer")
    m.cardBg = m.top.findNode("cardBg")
    m.focusBorder = m.top.findNode("focusBorder")
    m.iconEmoji = m.top.findNode("iconEmoji")
    m.tvlLabel = m.top.findNode("tvlLabel")
    m.titleLabel = m.top.findNode("titleLabel")
    m.descLabel = m.top.findNode("descLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.changeArrow = m.top.findNode("changeArrow")
    m.changeBg = m.top.findNode("changeBg")
    m.accentBar = m.top.findNode("accentBar")
    m.selectionGlow = m.top.findNode("selectionGlow")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set zone data
    m.titleLabel.text = content.title
    m.descLabel.text = content.description
    
    ' Set icon
    if content.icon <> invalid
        m.iconEmoji.text = content.icon
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
            m.changeBg.color = "#ef444420"
        else
            m.changeLabel.color = "#10b981"
            m.changeArrow.text = "▲"
            m.changeArrow.color = "#10b981"
            m.changeBg.color = "#10b98120"
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
        scale = 1.0 + (0.05 * focusPct)
        m.cardContainer.scale = [scale, scale]
        
        ' Show focus border
        m.focusBorder.opacity = focusPct
        
        ' Add glow effect
        m.selectionGlow.opacity = 0.1 * focusPct
        
        ' Shift position to scale from center
        shift = -10 * focusPct
        m.cardContainer.translation = [shift, shift]
    else
        ' Reset to normal
        m.cardContainer.scale = [1.0, 1.0]
        m.focusBorder.opacity = 0
        m.selectionGlow.opacity = 0
        m.cardContainer.translation = [0, 0]
    end if
end sub
