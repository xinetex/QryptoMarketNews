' QChannel Crypto Service
' BrightScript Task for fetching API data and ad tags

sub init()
    m.top.functionName = "runLoop"
end sub

sub runLoop()
    ' Initial fetch from Roku feed (includes ticker, zones, market pulse)
    fetchRokuFeed()
    fetchAdTags()
    fetchAdTags()
    fetchVisuals()
    m.top.nftRequest = true ' Trigger initial NFT load for screensaver
    
    ' Track pending requests
    m.pendingZoneCoinsRequest = ""
    m.pendingNewsRequest = false
    m.pendingCoinRequest = ""
    
    ' Polling loop - refresh every 60 seconds for ticker, 5 minutes for zones
    tickerTimer = 0
    zoneTimer = 0
    
    while true
        sleep(100) ' Sleep 100ms for responsive polling
        
        tickerTimer = tickerTimer + 1
        zoneTimer = zoneTimer + 1
        
        ' Check for zone coins request
        currentRequest = m.top.requestZoneCoins
        if currentRequest <> "" and currentRequest <> m.pendingZoneCoinsRequest
            m.pendingZoneCoinsRequest = currentRequest
            fetchZoneCoins(currentRequest)
        end if
        
        ' Check for NFT request
        if m.top.nftRequest = true or m.top.nftData = invalid
            ' Auto-fetch if missing or requested
            ' Auto-fetch if missing or requested
            url = m.top.apiBaseUrl + "/api/content/nfts?mode=" + m.top.nftMode
            response = makeApiRequest(url)
            if response <> invalid and response.collections <> invalid
                m.top.nftData = response ' Screensaver expects { collections: [...] }
                print "[CryptoService] NFT Data Loaded: " + str(response.collections.count()) + " collections"
            end if
            m.top.nftRequest = false
        end if
        
        ' Check for news request
        if m.top.newsRequest and not m.pendingNewsRequest
            m.pendingNewsRequest = true
            fetchNews()
            m.top.newsRequest = false
            m.pendingNewsRequest = false
        end if
        
        ' Check for coin request (detail page)
        if m.top.coinRequest <> invalid and m.top.coinRequest <> "" and m.top.coinRequest <> m.pendingCoinRequest
            m.pendingCoinRequest = m.top.coinRequest
            fetchCoinDetails(m.top.coinRequest)
        end if
        
        ' Ticker refresh every 60 seconds (600 * 100ms)
        ' Unified Feed Refresh every 60 seconds
        if tickerTimer >= 600
            ' Also refresh active coin detail if open
            if m.top.coinRequest <> ""
                fetchCoinDetails(m.top.coinRequest)
            end if
            
            fetchRokuFeed()
            tickerTimer = 0
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

sub fetchCoinDetails(coinId as string)
    if coinId = "" then return
    
    url = m.top.apiBaseUrl + "/api/crypto/coin/" + coinId
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.coinData = response.data
    end if
end sub

' Fetch all data from unified Roku feed API
sub fetchRokuFeed()
    url = m.top.apiBaseUrl + "/api/roku/feed"
    response = makeApiRequest(url)
    
    if response <> invalid
        ' Set ticker data from feed
        if response.ticker <> invalid
            m.top.tickerData = response.ticker
        end if
        
        ' Set zone data from feed
        if response.zones <> invalid
            m.top.zoneData = response.zones
        end if
        
        ' Set market pulse data from feed
        if response.marketPulse <> invalid
            m.top.marketPulse = response.marketPulse
        end if
        
        ' Store config for reference
        if response.config <> invalid
            m.top.appConfig = response.config
        end if
        
        ' Set predictions data from feed
        if response.predictions <> invalid
            m.top.predictions = response.predictions
        end if
    end if
    
    ' Call Alpha Fetch
    fetchAlphaData()
    
    ' Also fetch from AgentCache for enhanced data
    fetchAgentCacheNews()
    fetchAgentCacheIntelligence()
end sub

sub fetchAlphaData()
    ' fetch Alpha Vector
    url = m.top.apiBaseUrl + "/api/alpha/vector"
    request = CreateObject("roUrlTransfer")
    request.SetUrl(url)
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    
    response = request.GetToString()
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.data <> invalid
            m.top.alphaVector = json.data
        end if
    end if

    ' fetch News (RSVP)
    url = m.top.apiBaseUrl + "/api/news"
    request.SetUrl(url)
    response = request.GetToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.data <> invalid
             ' Format for RSVP: just concatenate titles
             text = ""
             for each item in json.data
                 text = text + item.title + " • "
             end for
             m.top.newsHeadlines = text
        end if
    end if
end sub

sub fetchZoneData()
    ' Use AgentCache QChannel zones endpoint for managed content
    url = m.top.apiBaseUrl + "/api/defi/zones"
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

sub fetchZoneCoins(zoneId as string)
    if zoneId = "" then return
    
    url = m.top.apiBaseUrl + "/api/crypto/zone/" + zoneId
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.zoneCoins = response.data
    else
        m.top.zoneCoins = []
    end if
end sub

sub fetchNews()
    ' First try AgentCache news endpoint
    url = "https://agentcache.ai/api/qchannel/news?format=roku&limit=5"
    response = makeApiRequest(url)
    
    if response <> invalid and response.items <> invalid
        m.top.newsData = response.items
    else
        ' Fallback to local API
        url = m.top.apiBaseUrl + "/api/news"
        response = makeApiRequest(url)
        if response <> invalid and response.data <> invalid
            m.top.newsData = response.data
        else
            m.top.newsData = []
        end if
    end if
end sub

' Fetch news from AgentCache
sub fetchAgentCacheNews()
    url = m.top.apiBaseUrl + "/api/qchannel/news?format=roku&limit=5"
    response = makeApiRequest(url)
    
    if response <> invalid and response.headlines <> invalid
        m.top.newsData = response.items
    end if
end sub

' Fetch market intelligence from AgentCache
sub fetchAgentCacheIntelligence()
    url = m.top.apiBaseUrl + "/api/qchannel/intelligence?type=movers&limit=10"
    response = makeApiRequest(url)
    
    if response <> invalid
        m.top.intelligenceData = response
    end if
end sub

' Fetch background visuals from AgentCache
sub fetchVisuals()
    ' Use AgentCache API to get random visuals
    url = "https://agentcache.ai/api/qchannel/visuals?type=background&random=true&limit=10"
    ' Note: In production we might point to local dev server if agentcache.ai DNS isn't ready
    ' But assuming we want to use the local server user is running:
    ' url = "http://192.168.4.34:3000/api/qchannel/visuals?type=background&random=true&limit=10"
    ' Let's stick to the convention used in fetchAdTags (m.top.apiBaseUrl which is usually set to local dev)
    ' Actually fetchAdTags uses apiBaseUrl.
    ' Let's use apiBaseUrl if available, or fallback.
    
    url = m.top.apiBaseUrl + "/api/qchannel/visuals?type=background&random=true&limit=10"
    
    response = makeApiRequest(url)
    
    if response <> invalid and response.items <> invalid
        m.top.visualsData = response.items
    end if
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
sub logAnalyticsEvent(zoneId as string)
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
