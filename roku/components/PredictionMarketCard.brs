' Prediction Market Card Logic

sub init()
    m.container = m.top.findNode("container")
    m.cardBg = m.top.findNode("cardBg")
    m.focusBorder = m.top.findNode("focusBorder")
    
    m.iconLabel = m.top.findNode("iconLabel")
    m.questionLabel = m.top.findNode("questionLabel")
    m.volumeLabel = m.top.findNode("volumeLabel")
    m.dateLabel = m.top.findNode("dateLabel")
    
    m.yesPct = m.top.findNode("yesPct")
    m.noPct = m.top.findNode("noPct")
    
    m.depthBarYes = m.top.findNode("depthBarYes")
    m.depthBarNo = m.top.findNode("depthBarNo")
end sub

sub onContentSet()
    content = m.top.itemContent
    if content = invalid then return
    
    ' Set Text
    if content.question <> invalid then m.questionLabel.text = content.question
    
    ' Set Odds
    yesVal = 50
    noVal = 50
    
    if content.yesOdds <> invalid then yesVal = content.yesOdds
    if content.noOdds <> invalid then noVal = content.noOdds
    
    m.yesPct.text = str(yesVal).trim() + "%"
    m.noPct.text = str(noVal).trim() + "%"
    
    ' Set Volume & Date
    volStr = "$0"
    if content.volume <> invalid 
        volStr = "$" + formatNumber(content.volume)
    end if
    m.volumeLabel.text = "Vol: " + volStr
    
    if content.endDate <> invalid
        ' Simple date formatter would go here, using raw string for now
        m.dateLabel.text = "Ends: " + left(content.endDate, 10)
    end if
    
    ' Update Depth Bars
    totalWidth = 880
    yesWidth = int(totalWidth * (yesVal / 100.0))
    noWidth = totalWidth - yesWidth
    
    m.depthBarYes.width = yesWidth
    m.depthBarNo.width = noWidth
    m.depthBarNo.translation = [yesWidth, 116]
    
    ' Icon (using first letter of question as fallback if no category icon)
    if content.question <> invalid and len(content.question) > 0
        m.iconLabel.text = left(content.question, 1)
    end if
end sub

sub onFocusChanged()
    focusPct = m.top.focusPercent
    
    if focusPct > 0
        m.focusBorder.opacity = focusPct
        m.cardBg.color = "#ffffff15"
        
        ' Slight scale up
        scale = 1.0 + (0.02 * focusPct)
        m.container.scale = [scale, scale]
        
        ' Center the scale
        shift = -8 * focusPct
        m.container.translation = [shift, shift]
    else
        m.focusBorder.opacity = 0
        m.cardBg.color = "#ffffff08"
        m.container.scale = [1.0, 1.0]
        m.container.translation = [0, 0]
    end if
end sub

function formatNumber(n as integer) as string
    if n >= 1000000
        return str(int(n/100000)/10).trim() + "M"
    else if n >= 1000
        return str(int(n/100)/10).trim() + "K"
    else
        return str(n).trim()
    end if
end function
