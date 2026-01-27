sub init()
    print "[TVAlert] Initializing..."
    m.background = m.top.findNode("background")
    m.pulseRing = m.top.findNode("pulseRing")
    m.iconLabel = m.top.findNode("iconLabel")
    m.pulseAnimation = m.top.findNode("pulseAnimation")
    
    m.top.visible = false
end sub

sub onTypeChanged()
    currentType = m.top.alertType
    if currentType = "BULL"
        m.background.color = "#064e3b" ' Dark Emerald
        m.pulseRing.blendColor = "#10b981" ' Emerald
        m.iconLabel.text = "🚀"
    elseif currentType = "BEAR"
        m.background.color = "#450a0a" ' Dark Red
        m.pulseRing.blendColor = "#ef4444" ' Red
        m.iconLabel.text = "🔻"
    else
        m.background.color = "#000000"
        m.pulseRing.blendColor = "#ffffff"
        m.iconLabel.text = "⚠️"
    end if
end sub

sub show()
    m.top.visible = true
    m.pulseAnimation.control = "start"
    
    ' Auto hide after 10 seconds
    if m.hideTimer = invalid
        m.hideTimer = m.top.createChild("Timer")
        m.hideTimer.duration = 10
        m.hideTimer.observeField("fire", "hide")
    end if
    m.hideTimer.control = "start"
end sub

sub hide()
    m.top.visible = false
    m.pulseAnimation.control = "stop"
end sub
