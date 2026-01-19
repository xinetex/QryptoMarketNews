' AdPlayer.brs
' Displays video ads from Verdoni with skip functionality and tracking

sub init()
    m.adVideo = m.top.findNode("adVideo")
    m.skipLabel = m.top.findNode("skipLabel")
    m.sponsorLabel = m.top.findNode("sponsorLabel")
    m.targetedBadge = m.top.findNode("targetedBadge")
    m.adContainer = m.top.findNode("adContainer")
    
    m.top.adComplete = false
    m.top.adSkipped = false
    m.skipCountdown = 5
    m.canSkip = false
    
    ' Setup video callbacks
    m.adVideo.observeField("state", "onVideoState")
    m.adVideo.observeField("position", "onVideoPosition")
    
    ' Watch for play command
    m.top.observeField("play", "onPlayCommand")
    m.top.observeField("adData", "onAdDataSet")
    
    ' Timer for skip countdown
    m.skipTimer = createObject("roSGNode", "Timer")
    m.skipTimer.duration = 1
    m.skipTimer.repeat = true
    m.skipTimer.observeField("fire", "onSkipTimer")
end sub

sub onAdDataSet()
    ad = m.top.adData
    if ad = invalid then return
    
    print "[AdPlayer] Loading ad: " + ad.title
    
    ' Set video source
    content = createObject("roSGNode", "ContentNode")
    content.url = ad.streamUrl
    content.title = ad.title
    m.adVideo.content = content
    
    ' Update sponsor label
    if ad.customData <> invalid and ad.customData.campaignName <> invalid
        m.sponsorLabel.text = "Sponsored by " + ad.customData.campaignName
    end if
    
    ' Show targeted badge if wallet-targeted
    if ad.customData <> invalid and ad.customData.walletTargeted = true
        m.targetedBadge.visible = true
    else
        m.targetedBadge.visible = false
    end if
    
    ' Reset state
    m.skipCountdown = 5
    m.canSkip = false
    m.skipLabel.text = "Skip in 5s"
    m.top.adComplete = false
    m.top.adSkipped = false
end sub

sub onPlayCommand()
    if m.top.play = true
        print "[AdPlayer] Starting ad playback"
        m.adVideo.control = "play"
        m.skipTimer.control = "start"
        m.adContainer.visible = true
        trackAdEvent("impression")
    end if
end sub

sub onVideoState()
    state = m.adVideo.state
    print "[AdPlayer] Video state: " + state
    
    if state = "finished"
        m.skipTimer.control = "stop"
        m.top.adComplete = true
        trackAdEvent("complete")
        hideAd()
    else if state = "error"
        print "[AdPlayer] Video error - skipping ad"
        m.skipTimer.control = "stop"
        m.top.adComplete = true
        hideAd()
    end if
end sub

sub onVideoPosition()
    ' Could track quartiles here for analytics
    position = m.adVideo.position
    duration = m.adVideo.duration
    
    if duration > 0
        progress = position / duration
        if progress >= 0.25 and m.tracked25 = invalid
            m.tracked25 = true
            trackAdEvent("firstQuartile")
        else if progress >= 0.5 and m.tracked50 = invalid
            m.tracked50 = true
            trackAdEvent("midpoint")
        else if progress >= 0.75 and m.tracked75 = invalid
            m.tracked75 = true
            trackAdEvent("thirdQuartile")
        end if
    end if
end sub

sub onSkipTimer()
    m.skipCountdown = m.skipCountdown - 1
    
    if m.skipCountdown <= 0
        m.canSkip = true
        m.skipLabel.text = "Press OK to skip"
        m.skipTimer.control = "stop"
    else
        m.skipLabel.text = "Skip in " + str(m.skipCountdown) + "s"
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if press = false then return false
    
    if key = "OK" and m.canSkip
        print "[AdPlayer] Ad skipped by user"
        m.adVideo.control = "stop"
        m.skipTimer.control = "stop"
        m.top.adSkipped = true
        m.top.adComplete = true
        trackAdEvent("skip")
        hideAd()
        return true
    else if key = "back"
        ' Don't allow backing out during ad
        return true
    end if
    
    return false
end function

sub hideAd()
    m.adContainer.visible = false
    m.adVideo.control = "stop"
end sub

sub trackAdEvent(eventType as string)
    ad = m.top.adData
    if ad = invalid then return
    
    print "[AdPlayer] Tracking event: " + eventType
    
    ' Send tracking event to Verdoni
    url = "https://verdoni.com/api/track"
    
    request = createObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Content-Type", "application/json")
    
    body = {
        adId: ad.id,
        eventType: eventType,
        timestamp: createObject("roDateTime").toISOString(),
        deviceInfo: {
            model: createObject("roDeviceInfo").getModel(),
            displayType: "roku"
        }
    }
    
    ' Fire and forget - don't wait for response
    request.asyncPostFromString(formatJson(body))
end sub
