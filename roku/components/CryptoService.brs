' QChannel Crypto Service
' BrightScript Task for fetching API data

sub init()
    m.top.functionName = "runLoop"
end sub

sub runLoop()
    ' Initial fetch
    fetchTickerData()
    fetchZoneData()
    
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
    url = m.top.apiBaseUrl + "/api/crypto/categories"
    response = makeApiRequest(url)
    
    if response <> invalid and response.data <> invalid
        m.top.zoneData = response.data
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
