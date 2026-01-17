' Prophet TV Voice Result Scene
' BrightScript logic for AI-powered voice search results

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.queryLabel = m.top.findNode("queryLabel")
    m.coinName = m.top.findNode("coinName")
    m.coinSymbol = m.top.findNode("coinSymbol")
    m.priceLabel = m.top.findNode("priceLabel")
    m.changeLabel = m.top.findNode("changeLabel")
    m.summaryText = m.top.findNode("summaryText")
    m.coinIcon = m.top.findNode("coinIcon")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("coinData", "onCoinDataChanged")
    m.cryptoService.control = "run"
    
    ' Coin mapping for voice queries
    m.coinKeywords = {
        "bitcoin": "bitcoin",
        "btc": "bitcoin",
        "ethereum": "ethereum",
        "eth": "ethereum",
        "solana": "solana",
        "sol": "solana",
        "xrp": "ripple",
        "ripple": "ripple",
        "dogecoin": "dogecoin",
        "doge": "dogecoin",
        "cardano": "cardano",
        "ada": "cardano"
    }
end sub

sub onQuerySet()
    query = lCase(m.top.query)
    if query = "" then return
    
    m.queryLabel.text = chr(34) + m.top.query + chr(34)
    
    ' Parse query for coin mentions
    coinId = parseCoinFromQuery(query)
    
    if coinId <> ""
        ' Fetch coin data
        m.cryptoService.coinRequest = coinId
    else
        ' Generic market query
        showGenericResult(query)
    end if
end sub

function parseCoinFromQuery(query as string) as string
    ' Check for known coin keywords
    for each keyword in m.coinKeywords
        if instr(1, query, keyword) > 0
            return m.coinKeywords[keyword]
        end if
    end for
    return ""
end function

sub onCoinDataChanged()
    coinData = m.cryptoService.coinData
    if coinData = invalid then return
    
    ' Update display with coin data
    if coinData.name <> invalid
        m.coinName.text = coinData.name
    end if
    
    if coinData.symbol <> invalid
        m.coinSymbol.text = uCase(coinData.symbol)
    end if
    
    if coinData.image <> invalid
        m.coinIcon.uri = coinData.image
    end if
    
    if coinData.current_price <> invalid
        m.priceLabel.text = "$" + formatPrice(coinData.current_price)
    end if
    
    if coinData.price_change_percentage_24h <> invalid
        change = coinData.price_change_percentage_24h
        if change >= 0
            m.changeLabel.text = "+" + formatPercent(change) + " (24h)"
            m.changeLabel.color = "#10b981"
        else
            m.changeLabel.text = formatPercent(change) + " (24h)"
            m.changeLabel.color = "#ef4444"
        end if
    end if
    
    ' Generate AI summary
    m.summaryText.text = generateAISummary(coinData)
end sub

sub showGenericResult(query as string)
    m.coinName.text = "Market Overview"
    m.coinSymbol.text = "AI ANALYSIS"
    m.priceLabel.text = ""
    m.changeLabel.text = ""
    m.summaryText.text = "Analyzing your query: '" + query + "'. The crypto market is currently showing mixed signals. Bitcoin leads with bullish momentum while altcoins show varied performance. Try asking about specific coins for detailed analysis."
end sub

function generateAISummary(data as object) as string
    name = data.name
    if name = invalid then name = "This asset"
    
    change = 0
    if data.price_change_percentage_24h <> invalid
        change = data.price_change_percentage_24h
    end if
    
    if change > 5
        return name + " is showing strong bullish momentum with a gain of over 5% in the last 24 hours. Volume indicators suggest healthy market participation and continued buying pressure. Consider setting price alerts for key resistance levels."
    else if change > 0
        return name + " is trading slightly higher with modest gains. The market appears stable with balanced buying and selling pressure. Current price action suggests consolidation before the next major move."
    else if change > -5
        return name + " is experiencing minor selling pressure but remains within normal trading range. Support levels are holding and this could present a potential buying opportunity for long-term holders."
    else
        return name + " is facing significant selling pressure with a decline of over 5%. Market sentiment has shifted bearish in the short term. Consider waiting for support confirmation before adding to positions."
    end if
end function

function formatPrice(price as dynamic) as string
    p = val(str(price))
    if p >= 1000
        return str(int(p)).trim()
    else if p >= 1
        return str(int(p * 100) / 100).trim()
    else
        return str(int(p * 10000) / 10000).trim()
    end if
end function

function formatPercent(pct as dynamic) as string
    p = val(str(pct))
    return str(int(p * 10) / 10).trim() + "%"
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    return false
end function
