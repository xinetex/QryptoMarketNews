' Prophet TV Briefing Scene
' BrightScript logic for daily market briefing & podcasts

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.headerDate = m.top.findNode("headerDate")
    m.greetingLabel = m.top.findNode("greetingLabel")
    m.summaryText = m.top.findNode("summaryText")
    
    ' Podcast UI
    m.episodeList = m.top.findNode("episodeList")
    m.audioPlayer = m.top.findNode("audioPlayer")
    m.podcastImage = m.top.findNode("podcastImage")
    m.podcastName = m.top.findNode("podcastName")
    m.episodeTitle = m.top.findNode("episodeTitle")
    m.playStatus = m.top.findNode("playStatus")
    m.progressBar = m.top.findNode("progressBar")
    m.progressFill = m.top.findNode("progressFill")
    m.progressTimer = m.top.findNode("progressTimer")
    
    ' Setup List
    m.episodeList.observeField("itemFocused", "onEpisodeFocused")
    m.episodeList.observeField("itemSelected", "onEpisodeSelected")
    
    ' Setup Audio
    m.audioPlayer.observeField("state", "onAudioStateChanged")
    m.progressTimer.observeField("fire", "onProgressTimerFired")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.apiBaseUrl = "http://192.168.4.34:3000" ' Ensure this matches your dev server
    
    updateDate()
    updateGreeting()
    
    ' Load Data
    loadBriefing()
end sub

sub updateDate()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    m.headerDate.text = months[dt.getMonth()-1] + " " + str(dt.getDayOfMonth()).trim() + ", " + str(dt.getYear()).trim()
end sub

sub updateGreeting()
    dt = CreateObject("roDateTime")
    dt.toLocalTime()
    h = dt.getHours()
    if h < 12 
        m.greetingLabel.text = "Good Morning"
        m.greetingLabel.color = "#f59e0b"
    else if h < 18
        m.greetingLabel.text = "Good Afternoon"
        m.greetingLabel.color = "#3b82f6"
    else
        m.greetingLabel.text = "Good Evening"
        m.greetingLabel.color = "#10b981"
    end if
end sub

sub loadBriefing()
    m.summaryText.text = "Fetching latest crypto insights..."
    
    ' Fetch from our new API
    url = m.cryptoService.apiBaseUrl + "/api/roku/briefing"
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Accept", "application/json")
    
    ' Async fetch would be better, but keeping simple for this phase
    response = request.getToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.items <> invalid
            populateEpisodes(json.items)
            m.summaryText.text = "Latest updates from Bankless, Unchained, and Daily Gwei."
        else
            m.summaryText.text = "Unable to load briefing feed."
        end if
    else
        m.summaryText.text = "Connection error. Check API."
    end if
end sub

sub populateEpisodes(items as object)
    content = CreateObject("roSGNode", "ContentNode")
    
    for each item in items
        node = content.createChild("ContentNode")
        node.title = item.title
        node.hdPosterUrl = item.image
        node.url = item.url ' Audio Stream URL
        node.streamFormat = "mp3"
        
        ' Custom fields for BriefingItem
        node.addFields({
            shortDescriptionLine1: item.podcast,
            shortDescriptionLine2: item.color,
            releaseDate: item.duration,
            description: item.description
        })
    end for
    
    m.episodeList.content = content
    m.episodeList.setFocus(true)
end sub

sub onEpisodeFocused()
    item = m.episodeList.content.getChild(m.episodeList.itemFocused)
    if item <> invalid
        m.summaryText.text = item.description
        ' Preview image if not playing
        if m.audioPlayer.state <> "playing"
            m.podcastImage.uri = item.hdPosterUrl
            m.podcastName.text = item.shortDescriptionLine1
            m.episodeTitle.text = item.title
        end if
    end if
end sub

sub onEpisodeSelected()
    item = m.episodeList.content.getChild(m.episodeList.itemFocused)
    if item <> invalid
        playAudio(item)
    end if
end sub

sub playAudio(item as object)
    m.audioPlayer.control = "stop"
    m.audioPlayer.content = item
    m.audioPlayer.control = "play"
    
    ' Update UI
    m.podcastImage.uri = item.hdPosterUrl
    m.podcastName.text = item.shortDescriptionLine1
    m.episodeTitle.text = item.title
    m.playStatus.text = "Loading..."
    m.progressBar.visible = true
    m.progressFill.width = 0
end sub

sub onAudioStateChanged()
    state = m.audioPlayer.state
    m.playStatus.text = state
    
    if state = "playing"
        m.playStatus.text = "▶ Now Playing"
        m.progressTimer.control = "start"
    else if state = "stopped"
        m.playStatus.text = "Stopped"
        m.progressTimer.control = "stop"
        m.progressFill.width = 0
    else if state = "finished"
        m.playStatus.text = "Finished"
        m.progressTimer.control = "stop"
        m.progressFill.width = 0
        
        ' Auto-play next episode
        playNextEpisode()
    end if
end sub

sub playNextEpisode()
    if m.episodeList.content = invalid then return
    
    ' Find current index using the focused item as a proxy (usually synced)
    ' Or better, track m.currentEpisodeIndex explicitly when playing
    nextIdx = m.episodeList.itemFocused + 1
    
    if nextIdx < m.episodeList.content.getChildCount()
        ' Move focus and play
        m.episodeList.jumpToItem = nextIdx
        ' Give UI a moment to update focus? No, just play.
        item = m.episodeList.content.getChild(nextIdx)
        if item <> invalid
            playAudio(item)
        end if
    end if
end sub

sub onProgressTimerFired()
    if m.audioPlayer.duration > 0
        pct = m.audioPlayer.position / m.audioPlayer.duration
        if pct > 1 then pct = 1
        m.progressFill.width = 600 * pct
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        if m.audioPlayer.state = "playing"
            m.audioPlayer.control = "stop"
            return true ' Consume back to stop audio first
        else
            m.top.exitRequested = true
            return true
        end if
    end if
    
    if key = "OK" or key = "play"
        if m.audioPlayer.state = "playing"
            m.audioPlayer.control = "pause"
            m.playStatus.text = "⏸ Paused"
        else if m.audioPlayer.state = "paused"
            m.audioPlayer.control = "resume"
        end if
        return true
    end if
    
    return false
end function
