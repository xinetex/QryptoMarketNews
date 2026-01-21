' RSVPDisplay.brs
' Implements Rapid Serial Visual Presentation logic

function init()
    m.wordLabel = m.top.findNode("wordLabel")
    m.progressBar = m.top.findNode("progressBar")
    m.statusLabel = m.top.findNode("statusLabel")
    m.speedLabel = m.top.findNode("speedLabel")
    m.timer = m.top.findNode("rsvpTimer")
    
    m.timer.observeField("fire", "onTimerFire")
    
    m.words = []
    m.currentIndex = 0
    m.top.wpm = 400
end function

function onContentChange()
    text = m.top.content
    if text <> invalid and text <> ""
        ' Safe string splitting using roString object
        strObj = CreateObject("roString")
        strObj.SetString(text)
        m.words = strObj.Split(" ")
        
        reset()
        m.top.isPlaying = true
    end if
end function

function onPlayStateChange()
    if m.top.isPlaying
        msPerWord = 60000 / m.top.wpm
        m.timer.duration = msPerWord / 1000
        m.timer.control = "start"
        m.statusLabel.text = "RSVP // PLAYING"
        m.statusLabel.color = "#10b981" ' Emerald
    else
        m.timer.control = "stop"
        m.statusLabel.text = "RSVP // PAUSED"
        m.statusLabel.color = "#ef4444" ' Red
    end if
    
    m.speedLabel.text = m.top.wpm.toStr() + " WPM"
end function

function onTimerFire()
    if m.currentIndex < m.words.Count()
        word = m.words[m.currentIndex]
        m.wordLabel.text = word
        
        ' Update Progress
        progress = (m.currentIndex + 1) / m.words.Count()
        m.progressBar.width = 800 * progress
        
        m.currentIndex = m.currentIndex + 1
    else
        ' Finished
        m.top.isPlaying = false
        m.wordLabel.text = "TRANSMISSION COMPLETE"
        m.statusLabel.text = "RSVP // DONE"
        m.statusLabel.color = "#6366f1" ' Indigo
    end if
end function

function reset()
    m.currentIndex = 0
    m.progressBar.width = 0
    if m.words.Count() > 0
        m.wordLabel.text = "READY"
    end if
end function
