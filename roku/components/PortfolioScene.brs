' Prophet TV Portfolio Logic

sub init()
    m.top.setFocus(true)
    
    m.totalBalance = m.top.findNode("totalBalance")
    m.totalPnl = m.top.findNode("totalPnl")
    m.holdingsGrid = m.top.findNode("holdingsGrid")
    m.leaderList = m.top.findNode("leaderList")
    m.rankLabel = m.top.findNode("rankLabel")
    m.qrCode = m.top.findNode("qrCode")
    
    ' Generate QR Code dynamically
    m.qrCode.uri = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + "http://192.168.4.34:3000/portfolio"
    
    loadMockPortfolio()
end sub

sub loadMockPortfolio()
    ' Fetch from API
    url = "http://192.168.4.34:3000/api/roku/portfolio"
    
    request = CreateObject("roUrlTransfer")
    request.setUrl(url)
    request.setCertificatesFile("common:/certs/ca-bundle.crt")
    request.initClientCertificates()
    
    response = request.getToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid
             updateUI(json)
        end if
    end if
end sub

sub updateUI(data as object)
    ' Header
    m.totalBalance.text = data.totalBalance
    m.totalPnl.text = data.pnlFormatted + " (" + data.pnlPercent + ")"
    if data.isPositive
        m.totalPnl.color = "#10b981"
    else
        m.totalPnl.color = "#ef4444"
    end if
    
    ' Holdings
    content = CreateObject("roSGNode", "ContentNode")
    
    for each h in data.holdings
        addHolding(content, h.symbol, h.name, h.amount, h.value, h.pnl, h.isPositive)
    end for
    
    m.holdingsGrid.content = content
    m.holdingsGrid.setFocus(true)
    
    ' Leaderboard
    lContent = CreateObject("roSGNode", "ContentNode")
    
    for each l in data.leaderboard
        node = lContent.createChild("ContentNode")
        node.title = str(l.rank).trim() + ". " + l.name + " (" + l.score + ")"
    end for
    
    m.leaderList.content = lContent
end sub

sub addHolding(parent, symbol, name, amount, value, pnl, isPos)
    item = parent.createChild("ContentNode")
    item.addFields({
        symbol: symbol,
        title: name,
        amountFormatted: amount + " " + symbol,
        valueFormatted: value,
        pnlFormatted: pnl,
        isPositive: isPos,
        HDPOSTERURL: "pkg:/images/icons/" + lcase(symbol) + ".png" 
    })
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
