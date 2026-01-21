' AlphaHUD.brs

function init()
    m.riskLabel = m.top.findNode("riskLabel")
    m.sentimentLabel = m.top.findNode("sentimentLabel")
    m.momentumLabel = m.top.findNode("momentumLabel")
    m.riskBar = m.top.findNode("riskBar")
end function

function onDataChange()
    ' Update Labels - Use toStr() to avoid padding spaces
    m.riskLabel.text = m.top.riskScore.toStr() + "/100"
    m.sentimentLabel.text = m.top.sentiment
    m.momentumLabel.text = m.top.momentum.toStr() + "x"
    
    ' Color Logic based on Risk
    color = "#ffffff"
    score = m.top.riskScore
    
    if score > 75
        color = "#ef4444" ' High Risk (Red)
    else if score > 40
        color = "#eab308" ' Medium (Yellow)
    else
        color = "#10b981" ' Low Risk (Green/Emerald)
    end if
    
    m.riskLabel.color = color
    m.riskBar.color = color
    
    ' Sentiment Color
    if m.top.sentiment = "BULLISH"
        m.sentimentLabel.color = "#10b981"
    else if m.top.sentiment = "BEARISH"
        m.sentimentLabel.color = "#ef4444" 
    else
        m.sentimentLabel.color = "#ffffff"
    end if
end function
