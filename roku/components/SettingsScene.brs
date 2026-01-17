' Prophet TV Settings Scene

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.settingsMenu = m.top.findNode("settingsMenu")
    m.displaySettings = m.top.findNode("displaySettings")
    m.secondScreenSettings = m.top.findNode("secondScreenSettings")
    m.audioSettings = m.top.findNode("audioSettings")
    m.pairingCode = m.top.findNode("pairingCode")
    m.pairingStatus = m.top.findNode("pairingStatus")
    
    ' Setup menu
    menuContent = CreateObject("roSGNode", "ContentNode")
    
    items = [
        "📺 Display & Screensaver",
        "📱 Second Screen",
        "🎵 Audio & Music",
        "💎 Launch Screensaver",
        "🌊 Launch Ambient Mode",
        "🖼️ Launch NFT Gallery",
        "🎯 Launch Predictions",
        "🔊 Launch Briefing"
    ]
    
    for each item in items
        node = menuContent.createChild("ContentNode")
        node.title = item
    end for
    
    m.settingsMenu.content = menuContent
    m.settingsMenu.observeField("itemSelected", "onMenuSelect")
    m.settingsMenu.setFocus(true)
    
    ' Show pairing code if available
    if m.top.pairingToken <> invalid
        m.pairingCode.text = "Pairing Code: " + m.top.pairingToken
    end if
    
    ' Show first section by default
    showSection(0)
end sub

sub showSection(index as integer)
    m.displaySettings.visible = (index = 0)
    m.secondScreenSettings.visible = (index = 1)
    m.audioSettings.visible = (index = 2)
end sub

sub onMenuSelect()
    index = m.settingsMenu.itemSelected
    
    if index < 3
        showSection(index)
    else if index = 3
        ' Launch Screensaver
        m.top.launchMode = "screensaver"
        m.top.exitRequested = true
    else if index = 4
        ' Launch Ambient
        m.top.launchMode = "ambient"
        m.top.exitRequested = true
    else if index = 5
        ' Launch NFT Gallery
        m.top.launchMode = "nft"
        m.top.exitRequested = true
    else if index = 6
        ' Launch Predictions
        m.top.launchMode = "predictions"
        m.top.exitRequested = true
    else if index = 7
        ' Launch Briefing
        m.top.launchMode = "briefing"
        m.top.exitRequested = true
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
