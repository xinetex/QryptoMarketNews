' Prophet TV Control Center logic
sub init()
    m.top.setFocus(true)
    
    ' Data Model for Menu
    m.menuItems = [
        { title: "My Watchlist", icon: "📺", desc: "Browse your crypto zones with the new Netflix-style interface.", mode: "watchlist", color: "#bc13fe", image: "pkg:/images/zones/solana-hero.png" },
        { title: "Ambient Mode", icon: "🌊", desc: "Turn your TV into a living window with cyberpunk visuals and live data overlay.", mode: "ambient", color: "#00d9ff", image: "pkg:/images/zones/ai-hero.png" },
        { title: "NFT Gallery", icon: "🖼️", desc: "Display high-value NFT collections on your big screen.", mode: "nft", color: "#ec4899", image: "pkg:/images/zones/nft-hero.png" },
        { title: "Predictions", icon: "🎯", desc: "Vote on market movements and compete on the global leaderboard.", mode: "predictions", color: "#f59e0b", image: "pkg:/images/zones/gaming-hero.png" },
        { title: "Briefing", icon: "🔊", desc: "Listen to your daily AI-generated crypto market briefing.", mode: "briefing", color: "#10b981", image: "pkg:/images/zones/rwa-hero.png" },
        { title: "Screensaver", icon: "💤", desc: "Classic screensaver mode with drifting ticker and clock.", mode: "screensaver", color: "#8b5cf6", image: "pkg:/images/zones/layer2-hero.png" },
        { title: "Pair Device", icon: "📱", desc: "Connect your mobile phone to control the TV experience.", mode: "pair", color: "#ffffff", image: "pkg:/images/zones/defi-hero.png" }
    ]
    
    m.currentIndex = 0
    m.count = m.menuItems.count()
    
    ' UI References
    m.previewTitle = m.top.findNode("previewTitle")
    m.previewDesc = m.top.findNode("previewDesc")
    m.previewIcon = m.top.findNode("previewIcon")
    m.previewImage = m.top.findNode("previewImage")
    m.bgVisual = m.top.findNode("bgVisual")
    
    ' Initialize Menu UI
    updateSelection(0)
end sub

sub updateSelection(index as integer)
    ' 1. Update Menu List Visuals
    for i = 0 to m.count - 1
        bg = m.top.findNode("bg" + str(i).trim())
        lbl = m.top.findNode("lbl" + str(i).trim())
        
        if i = index
            ' Selected State
            bg.opacity = 1.0
            bg.color = m.menuItems[i].color
            lbl.font = "font:MediumBoldSystemFont"
        else
            ' Idle State
            bg.opacity = 0.1
            bg.color = "#ffffff"
            lbl.font = "font:MediumSystemFont"
        end if
    end for
    
    ' 2. Update Preview Panel
    item = m.menuItems[index]
    m.previewTitle.text = item.title
    m.previewDesc.text = item.desc
    m.previewIcon.text = item.icon
    m.previewImage.uri = item.image
    m.bgVisual.uri = item.image ' Ambient background matches selection
    
    m.currentIndex = index
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    if key = "up"
        if m.currentIndex > 0
            updateSelection(m.currentIndex - 1)
        else
            ' Loop to bottom
            updateSelection(m.count - 1)
        end if
        return true
    else if key = "down"
        if m.currentIndex < m.count - 1
            updateSelection(m.currentIndex + 1)
        else
            ' Loop to top
            updateSelection(0)
        end if
        return true
    end if
    
    if key = "OK"
        item = m.menuItems[m.currentIndex]
        print "[Settings] Launching mode: " + item.mode
        m.top.launchMode = item.mode
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
