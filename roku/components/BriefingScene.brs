' Prophet TV Briefing Scene
' BrightScript logic for daily market briefing

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.headerDate = m.top.findNode("headerDate")
    m.greetingLabel = m.top.findNode("greetingLabel")
    m.summaryText = m.top.findNode("summaryText")
    m.highlight1 = m.top.findNode("highlight1")
    m.highlight2 = m.top.findNode("highlight2")
    m.highlight3 = m.top.findNode("highlight3")
    m.highlight4 = m.top.findNode("highlight4")
    m.sentimentLabel = m.top.findNode("sentimentLabel")
    m.volumeLabel = m.top.findNode("volumeLabel")
    m.volatilityLabel = m.top.findNode("volatilityLabel")
    m.mover1 = m.top.findNode("mover1")
    m.mover2 = m.top.findNode("mover2")
    m.mover3 = m.top.findNode("mover3")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("briefingData", "onBriefingDataChanged")
    m.cryptoService.control = "run"
    
    ' Set initial date
    updateDate()
    
    ' Set greeting based on time
    updateGreeting()
    
    ' Load briefing data
    loadBriefing()
end sub

sub updateDate()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    
    months = ["January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"]
    
    monthName = months[dt.getMonth() - 1]
    day = dt.getDayOfMonth()
    year = dt.getYear()
    
    m.headerDate.text = monthName + " " + str(day).trim() + ", " + str(year).trim()
end sub

sub updateGreeting()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    hour = dt.getHours()
    
    if hour < 12
        m.greetingLabel.text = "Good Morning"
        m.greetingLabel.color = "#f59e0b"
    else if hour < 18
        m.greetingLabel.text = "Good Afternoon"
        m.greetingLabel.color = "#3b82f6"
    else
        m.greetingLabel.text = "Good Evening"
        m.greetingLabel.color = "#10b981"
    end if
end sub

sub loadBriefing()
    ' Trigger briefing fetch from AgentCache
    ' CryptoService will handle the API call
    m.summaryText.text = "Loading your personalized market briefing..."
end sub

sub onBriefingDataChanged()
    briefing = m.cryptoService.briefingData
    if briefing = invalid then return
    
    ' Update summary
    if briefing.summary <> invalid
        m.summaryText.text = briefing.summary
    end if
    
    ' Update highlights
    if briefing.highlights <> invalid and briefing.highlights.count() >= 4
        m.highlight1.text = "• " + briefing.highlights[0]
        m.highlight2.text = "• " + briefing.highlights[1]
        m.highlight3.text = "• " + briefing.highlights[2]
        m.highlight4.text = "• " + briefing.highlights[3]
    end if
    
    ' Update market status
    if briefing.marketStatus <> invalid
        status = briefing.marketStatus
        if status.sentiment <> invalid and status.score <> invalid
            m.sentimentLabel.text = "Sentiment: " + status.sentiment + " (" + str(status.score).trim() + "%)"
            if status.sentiment = "Bullish"
                m.sentimentLabel.color = "#10b981"
            else if status.sentiment = "Bearish"
                m.sentimentLabel.color = "#ef4444"
            else
                m.sentimentLabel.color = "#f59e0b"
            end if
        end if
        if status.volume <> invalid
            m.volumeLabel.text = "Volume: " + status.volume
        end if
        if status.volatility <> invalid
            m.volatilityLabel.text = "Volatility: " + status.volatility
        end if
    end if
    
    ' Update top movers
    if briefing.topMovers <> invalid and briefing.topMovers.count() >= 3
        m.mover1.text = "🥇 " + briefing.topMovers[0].symbol + " " + briefing.topMovers[0].change
        m.mover2.text = "🥈 " + briefing.topMovers[1].symbol + " " + briefing.topMovers[1].change
        m.mover3.text = "🥉 " + briefing.topMovers[2].symbol + " " + briefing.topMovers[2].change
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    ' Future: Play audio briefing
    if key = "play"
        ' Audio playback would go here
        print "[BriefingScene] Play requested - audio coming soon"
        return true
    end if
    
    return false
end function
