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
    ' In Phase 16, we will fetch from API
    ' For now, static mock data to visualize the design
    
    ' Header
    m.totalBalance.text = "$12,450.00"
    m.totalPnl.text = "+$2,450.00 (24.5%)"
    
    ' Holdings
    content = CreateObject("roSGNode", "ContentNode")
    
    addHolding(content, "BTC", "Bitcoin", "0.45", "$42,500.00", "+12%", true)
    addHolding(content, "ETH", "Ethereum", "4.2", "$12,400.00", "+5%", true)
    addHolding(content, "SOL", "Solana", "150", "$21,000.00", "+45%", true)
    addHolding(content, "DOGE", "Dogecoin", "50000", "$4,200.00", "-2%", false)
    
    m.holdingsGrid.content = content
    m.holdingsGrid.setFocus(true)
    
    ' Leaderboard
    lContent = CreateObject("roSGNode", "ContentNode")
    
    l1 = lContent.createChild("ContentNode")
    l1.title = "1. @ElonMusk ($42B)"
    
    l2 = lContent.createChild("ContentNode")
    l2.title = "2. @Satoshi ($1B)"
    
    l3 = lContent.createChild("ContentNode")
    l3.title = "3. @Vitalik ($500M)"
    
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
        HDPOSTERURL: "pkg:/images/icons/" + lcase(symbol) + ".png" ' Placeholder
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
