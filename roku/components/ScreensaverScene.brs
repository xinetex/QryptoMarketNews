' Prophet TV Screensaver - NFT Art Gallery & Bouncing Ticker
' Cycles through high-quality NFT artwork with "DVD Bounce" logo

sub init()
    m.top.setFocus(true)
    
    ' Nodes
    m.artLayer1 = m.top.findNode("artLayer1")
    m.artLayer2 = m.top.findNode("artLayer2")
    m.fadeAnim = m.top.findNode("fadeAnim")
    m.fadeInInterp = m.top.findNode("fadeInInterp")
    m.fadeOutInterp = m.top.findNode("fadeOutInterp")
    
    m.collectionName = m.top.findNode("collectionName")
    m.artTitle = m.top.findNode("artTitle")
    m.artPrice = m.top.findNode("artPrice")
    m.clockLabel = m.top.findNode("clockLabel")
    
    ' Bounce Nodes
    m.bounceGroup = m.top.findNode("bounceGroup")
    m.bounceLabel = m.top.findNode("bounceLabel")
    
    ' State
    m.currentLayer = 1
    m.playlist = []
    m.currentIndex = 0
    
    ' Physics State
    m.x = 500
    m.y = 500
    m.dx = 3
    m.dy = 3
    m.maxX = 1920 - 300
    m.maxY = 1080 - 60
    
    ' Timers
    m.clockTimer = m.top.findNode("clockTimer")
    m.clockTimer.observeField("fire", "updateClock")
    m.clockTimer.control = "start"
    
    m.slideTimer = m.top.findNode("slideTimer")
    m.slideTimer.observeField("fire", "nextSlide")
    
    m.animTimer = m.top.findNode("animTimer")
    m.animTimer.observeField("fire", "updateAnimation")
    m.animTimer.control = "start"
    
    updateClock()
end sub

sub onContentDataChanged()
    data = m.top.contentData
    if data <> invalid and data.collections <> invalid
        m.playlist = []
        
        ' Flatten collections into a playlist
        for each collection in data.collections
           if collection.items <> invalid
               for each item in collection.items
                   ' Ensure high-res image
                   img = item.image
                   if img = invalid then img = ""
                   
                   m.playlist.push({
                       image: img,
                       title: item.title,
                       collection: collection.name,
                       price: item.price
                   })
               end for
           end if
        end for
        
        if m.playlist.count() > 0
            ' Start show
            loadSlide(m.playlist[0], m.artLayer1)
            updateInfo(m.playlist[0])
            m.slideTimer.control = "start"
        else
            m.collectionName.text = "No Art Found"
        end if
    end if
end sub

sub nextSlide()
    if m.playlist.count() = 0 then return
    
    m.currentIndex = m.currentIndex + 1
    if m.currentIndex >= m.playlist.count() then m.currentIndex = 0
    
    item = m.playlist[m.currentIndex]
    
    ' Cross-fade logic
    if m.currentLayer = 1
        ' Transition 1 -> 2
        loadSlide(item, m.artLayer2)
        
        m.fadeInInterp.fieldToInterp = "artLayer2.opacity"
        m.fadeOutInterp.fieldToInterp = "artLayer1.opacity"
        
        m.currentLayer = 2
    else
        ' Transition 2 -> 1
        loadSlide(item, m.artLayer1)
        
        m.fadeInInterp.fieldToInterp = "artLayer1.opacity"
        m.fadeOutInterp.fieldToInterp = "artLayer2.opacity"
        
        m.currentLayer = 1
    end if
    
    updateInfo(item)
    m.fadeAnim.control = "start"
end sub

sub updateInfo(item as object)
    m.collectionName.text = item.collection
    m.artTitle.text = item.title
    m.artPrice.text = "Last Sale: " + str(item.price) + " ETH"
    
    ' Update Bounce Label randomly
    pick = Rnd(3)
    if pick = 1
        m.bounceLabel.text = "PROPHET TV"
        m.bounceLabel.color = "#00f3ff"
    else if pick = 2
        m.bounceLabel.text = "BTC $98,420"
        m.bounceLabel.color = "#f59e0b"
    else
        m.bounceLabel.text = "ETH $3,400"
        m.bounceLabel.color = "#bc13fe"
    end if
end sub

sub loadSlide(item as object, poster as object)
    if item.image <> invalid
        poster.uri = item.image
    end if
end sub

sub updateAnimation()
    ' Update Position
    m.x = m.x + m.dx
    m.y = m.y + m.dy
    
    ' Bounce X
    if m.x <= 0 
        m.x = 0
        m.dx = -m.dx
    else if m.x >= m.maxX
        m.x = m.maxX
        m.dx = -m.dx
    end if
    
    ' Bounce Y
    if m.y <= 0
        m.y = 0
        m.dy = -m.dy
    else if m.y >= m.maxY
        m.y = m.maxY
        m.dy = -m.dy
    end if
    
    m.bounceGroup.translation = [m.x, m.y]
end sub

sub updateClock()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    hour = dt.getHours()
    mins = dt.getMinutes()
    ampm = "AM"
    
    if hour >= 12
        ampm = "PM"
        if hour > 12 then hour = hour - 12
    end if
    if hour = 0 then hour = 12
    
    minStr = str(mins).trim()
    if mins < 10 then minStr = "0" + minStr
    
    m.clockLabel.text = str(hour).trim() + ":" + minStr + " " + ampm
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    ' Any key exits
    m.top.exitRequested = true
    return true
end function
