' QChannel ZoneDetailScene
' BrightScript logic for zone detail page

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.zoneIcon = m.top.findNode("zoneIcon")
    m.zoneTitle = m.top.findNode("zoneTitle")
    m.tvlLabel = m.top.findNode("tvlLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.protocolsLabel = m.top.findNode("protocolsLabel")
    m.accentLine = m.top.findNode("accentLine")
    m.coinsGrid = m.top.findNode("coinsGrid")
    m.newsRow = m.top.findNode("newsRow")
    m.adIndicator = m.top.findNode("adIndicator")
    
    m.coinsGrid.observeField("itemSelected", "onCoinSelected")
end sub

sub onZoneSet()
    zone = m.top.zone
    if zone = invalid then return
    
    ' Update UI with zone data
    m.zoneIcon.text = zone.icon
    m.zoneTitle.text = zone.name
    m.tvlLabel.text = "TVL: " + zone.tvl
    
    ' Set change color
    changeStr = zone.change
    if left(changeStr, 1) = "-"
        m.changeLabel.color = "#ef4444"
    else
        m.changeLabel.color = "#10b981"
    end if
    m.changeLabel.text = "24h: " + changeStr
    
    ' Set accent color
    if zone.zoneColor <> invalid
        m.accentLine.color = zone.zoneColor
    end if
    
    ' Fetch zone-specific data
    fetchZoneData(zone.id)
end sub

sub fetchZoneData(zoneId as string)
    ' Make API request for zone coins
    url = m.global.apiBaseUrl + "/api/crypto/zone/" + zoneId
    
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    request.enableEncodings(true)
    request.addHeader("Accept", "application/json")
    
    response = request.getToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.data <> invalid
            m.top.coins = json.data.coins
        end if
    end if
end sub

sub onCoinsSet()
    coins = m.top.coins
    if coins = invalid or coins.count() = 0 then return
    
    ' Populate coins grid
    content = CreateObject("roSGNode", "ContentNode")
    
    for each coin in coins
        item = content.createChild("ContentNode")
        item.addFields({
            title: coin.name,
            symbol: coin.symbol,
            price: coin.price,
            change24h: coin.change24h,
            image: coin.image
        })
    end for
    
    m.coinsGrid.content = content
    m.coinsGrid.setFocus(true)
    
    ' Update protocols count
    m.protocolsLabel.text = "Protocols: " + str(coins.count()).trim()
end sub

sub onCoinSelected(event as object)
    index = event.getData()
    coins = m.top.coins
    if coins <> invalid and index < coins.count()
        coin = coins[index]
        print "Selected coin: " + coin.name
        ' TODO: Show coin detail or open external link
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if press
        if key = "back"
            ' Navigate back to main scene
            m.top.visible = false
            return true
        end if
    end if
    return false
end function
