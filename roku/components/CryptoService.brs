' QChannel Crypto Service
' BrightScript Task for fetching API data and ad tags

sub init()
    m.top.functionName = "runLoop"
end sub

sub runLoop()
    ' Initial fetch
    fetchTickerData()
    fetchZoneData()
    fetchAdTags()
    
    ' Polling loop - refresh every 60 seconds for ticker, 5 minutes for zones
    tickerTimer = 0
    zoneTimer = 0
    
    while true
        sleep(1000) ' Sleep 1 second
        
        tickerTimer = tickerTimer + 1
        zoneTimer = zoneTimer + 1
        
        if tickerTimer >= 60
            fetchTickerData()
            tickerTimer = 0
        end if
        
        if zoneTimer >= 300
            fetchZoneData()
            zoneTimer = 0
        end if
    end while
end sub

sub fetchTickerData()
    url = m.top.apiBaseUrl + "/api/crypto/prices"
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.tickerData = response.data
    end if
end sub

sub fetchZoneData()
    ' Use AgentCache QChannel zones endpoint for managed content
    url = m.top.apiBaseUrl + "/api/qchannel/zones"
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.zoneData = response.data
    else
        ' Fallback to CoinGecko categories if AgentCache unavailable
        url = m.top.apiBaseUrl + "/api/crypto/categories"
        response = makeApiRequest(url)
        if response <> invalid and response.data <> invalid
            m.top.zoneData = response.data
        end if
    end if
end sub

sub fetchAdTags()
    ' Fetch VAST preroll tag for ad integration
    url = m.top.apiBaseUrl + "/api/qchannel/ads/vast/preroll"
    ' Note: This is used by RAF (Roku Ad Framework) - we just store the URL
    m.top.prerollVastUrl = url
end sub

function makeApiRequest(url as string) as object
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.enableEncodings(true)
    request.addHeader("Accept", "application/json")
    
    response = request.getToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        return json
    end if
    
    return invalid
end function

' Log analytics event to AgentCache
sub logAnalyticsEvent(eventType as string, zoneId as string)
    url = m.top.apiBaseUrl + "/api/qchannel/analytics/view"
    
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Content-Type", "application/json")
    
    deviceInfo = CreateObject("roDeviceInfo")
    payload = {
        zone_id: zoneId,
        content_type: "zone",
        device_type: "roku",
        device_id: deviceInfo.getChannelClientId()
    }
    
    request.postFromString(FormatJson(payload))
end sub

' Fetch coins for a specific zone (called via field observer)
sub onZoneCoinsRequest()
    zoneId = m.top.zoneCoinsRequest
    if zoneId = "" or zoneId = invalid then return
    
    url = m.top.apiBaseUrl + "/api/crypto/zone/" + zoneId
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.zoneCoins = response.data
    else
        m.top.zoneCoins = []
    end if
end sub

' Fetch news (called via field observer)
sub onNewsRequest()
    url = m.top.apiBaseUrl + "/api/news"
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.newsData = response.data
    else
        m.top.newsData = []
    end if
end sub
