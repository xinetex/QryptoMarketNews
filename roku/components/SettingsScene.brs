' Prophet TV Settings Scene - Simplified

sub init()
    m.top.setFocus(true)
    
    ' Menu state
    m.currentIndex = 0
    m.menuCount = 7
    
    ' Get menu backgrounds
    m.menuBgs = []
    for i = 0 to m.menuCount - 1
        m.menuBgs.push(m.top.findNode("menuBg" + str(i).trim()))
    end for
    
    ' Modes that each menu item launches
    m.modes = ["screensaver", "ambient", "nft", "predictions", "briefing", "pair", "watchlist"]
    
    ' Highlight first item
    highlightItem(0)
end sub

sub highlightItem(index as integer)
    ' Reset all
    for i = 0 to m.menuBgs.count() - 1
        if i = index
            m.menuBgs[i].color = "#bc13fe"
        else
            m.menuBgs[i].color = "#ffffff10"
        end if
    end for
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
            highlightItem(m.currentIndex - 1)
        end if
        return true
    else if key = "down"
        if m.currentIndex < m.menuCount - 1
            highlightItem(m.currentIndex + 1)
        end if
        return true
    end if
    
    if key = "OK"
        m.top.launchMode = m.modes[m.currentIndex]
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
