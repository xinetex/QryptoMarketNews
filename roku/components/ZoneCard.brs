' QChannel Zone Card Logic
' BrightScript

sub init()
    m.cardBackground = m.top.findNode("cardBackground")
    m.glowBorder = m.top.findNode("glowBorder")
    m.zoneNameLabel = m.top.findNode("zoneName")
    m.changeBadge = m.top.findNode("changeBadge")
    m.changeLabel = m.top.findNode("changeLabel")
end sub

sub updateContent()
    ' Update zone name
    m.zoneNameLabel.text = m.top.zoneName
    
    ' Update change label
    m.changeLabel.text = "24h: " + m.top.zoneChange
    
    ' Update colors based on positive/negative
    if m.top.isPositive
        m.changeBadge.color = "#00ff0020"
        m.changeLabel.color = "#00ff00"
    else
        m.changeBadge.color = "#ff000020"
        m.changeLabel.color = "#ff0000"
    end if
end sub

sub onFocusChanged()
    if m.top.hasFocus()
        ' Show glow border on focus
        m.glowBorder.color = "#00f3ff40"
        
        ' Scale up animation
        scaleUp = CreateObject("roSGNode", "Animation")
        scaleUp.duration = 0.2
        interpolator = CreateObject("roSGNode", "FloatFieldInterpolator")
        interpolator.key = [0.0, 1.0]
        interpolator.keyValue = [1.0, 1.05]
        interpolator.fieldToInterp = "scale.x"
        scaleUp.appendChild(interpolator)
        m.top.appendChild(scaleUp)
        scaleUp.control = "start"
    else
        ' Hide glow border
        m.glowBorder.color = "#00000000"
    end if
end sub
