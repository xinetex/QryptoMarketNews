' AdService.brs
' Connects Prophet TV Roku app to Verdoni.com ad network
' Supports wallet-targeted advertising via second-screen wallet connect

sub init()
    m.top.functionName = "runAdService"
    
    ' Verdoni API configuration
    m.adNetworkBaseUrl = "https://verdoni.com"
    m.apiKey = "" ' Will be set from registry or config
    
    ' Load API key from registry if available
    sec = createObject("roRegistrySection", "prophet_config")
    if sec.exists("ad_api_key")
        m.apiKey = sec.read("ad_api_key")
    end if
end sub

sub runAdService()
    ' Watch for ad requests
    m.port = createObject("roMessagePort")
    m.top.observeField("requestAds", m.port)
    m.top.observeField("connectWallet", m.port)
    
    while true
        msg = wait(0, m.port)
        if type(msg) = "roSGNodeEvent"
            field = msg.getField()
            if field = "requestAds" and m.top.requestAds = true
                fetchAds()
                m.top.requestAds = false
            else if field = "connectWallet" and m.top.connectWallet = true
                connectWalletToDevice()
                m.top.connectWallet = false
            end if
        end if
    end while
end sub

' Fetch ads from Verdoni decision engine
sub fetchAds()
    print "[AdService] Requesting ads from Verdoni..."
    
    url = m.adNetworkBaseUrl + "/api/decision"
    
    request = createObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Content-Type", "application/json")
    request.addHeader("x-api-key", m.apiKey)
    
    ' Build request body
    body = {
        deviceId: m.top.deviceId,
        venueId: m.top.venueId,
        limit: 2
    }
    
    response = request.postFromString(formatJson(body))
    
    if response <> invalid and response <> ""
        parsed = parseJson(response)
        if parsed <> invalid
            print "[AdService] Received " + str(parsed.ads.count()) + " ads"
            m.top.adsResult = parsed
        else
            m.top.error = "Failed to parse ad response"
        end if
    else
        code = request.getResponseCode()
        print "[AdService] Request failed with code: " + str(code)
        m.top.error = "Ad request failed: " + str(code)
    end if
end sub

' Connect wallet to device for targeting
sub connectWalletToDevice()
    if m.top.walletAddress = "" or m.top.walletAddress = invalid
        m.top.error = "No wallet address provided"
        return
    end if
    
    print "[AdService] Connecting wallet to device..."
    
    url = m.adNetworkBaseUrl + "/api/wallet/connect"
    
    request = createObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.addHeader("Content-Type", "application/json")
    
    body = {
        deviceId: m.top.deviceId,
        walletAddress: m.top.walletAddress
    }
    
    response = request.postFromString(formatJson(body))
    
    if response <> invalid and response <> ""
        parsed = parseJson(response)
        if parsed <> invalid and parsed.success = true
            print "[AdService] Wallet connected with segments: " + formatJson(parsed.segments)
            m.top.walletResult = parsed
            
            ' Store segments in registry for future use
            sec = createObject("roRegistrySection", "prophet_wallet")
            sec.write("segments", formatJson(parsed.segments))
            sec.write("connected", "true")
            sec.flush()
        else
            m.top.error = "Wallet connection failed"
        end if
    else
        code = request.getResponseCode()
        m.top.error = "Wallet connect failed: " + str(code)
    end if
end sub

' Get stored wallet segments
function getStoredSegments() as object
    sec = createObject("roRegistrySection", "prophet_wallet")
    if sec.exists("segments")
        return parseJson(sec.read("segments"))
    end if
    return []
end function

' Check if wallet is connected
function isWalletConnected() as boolean
    sec = createObject("roRegistrySection", "prophet_wallet")
    return sec.exists("connected") and sec.read("connected") = "true"
end function

' Clear wallet connection
sub clearWalletConnection()
    sec = createObject("roRegistrySection", "prophet_wallet")
    sec.delete("segments")
    sec.delete("connected")
    sec.flush()
end sub
