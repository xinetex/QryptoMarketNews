' QChannel CoinDetailScene
' BrightScript logic for coin/token/NFT detail view

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.coinImage = m.top.findNode("coinImage")
    m.coinName = m.top.findNode("coinName")
    m.coinSymbol = m.top.findNode("coinSymbol")
    m.priceLabel = m.top.findNode("priceLabel")
    m.priceChange = m.top.findNode("priceChange")
    m.marketCapValue = m.top.findNode("marketCapValue")
    m.volumeValue = m.top.findNode("volumeValue")
    m.supplyValue = m.top.findNode("supplyValue")
    m.athValue = m.top.findNode("athValue")
    m.coinDescription = m.top.findNode("coinDescription")
    m.chartSection = m.top.findNode("chartSection")
    m.simpleChart = m.top.findNode("simpleChart")
    m.nftGallery = m.top.findNode("nftGallery")
    m.nftGrid = m.top.findNode("nftGrid")
    m.heroBackdrop = m.top.findNode("heroBackdrop")
    
    ' Get CryptoService
    m.cryptoService = invalid
    scene = m.top.getScene()
    if scene <> invalid
        m.cryptoService = scene.findNode("cryptoService")
    end if
end sub

sub onCoinSet()
    coin = m.top.coin
    if coin = invalid then return
    
    ' Setup Listener for Live Updates
    if m.cryptoService <> invalid
        m.cryptoService.observeField("coinData", "onCoinDataReceived")
        
        ' If data is minimal (missing description/sparkline), request full details
        ' Or just always request to get latest live price
        if coin.id <> invalid
            m.cryptoService.coinRequest = coin.id
        end if
    end if
    
    updateUI(coin)
end sub

sub onCoinDataReceived()
    if m.cryptoService = invalid then return
    data = m.cryptoService.coinData
    
    ' Ensure data matches current coin
    currentCoin = m.top.coin
    if currentCoin <> invalid and data.id = currentCoin.id
        ' Merge data ? checking updateUI handles full data object
        updateUI(data)
    end if
end sub

sub updateUI(coin as object)
    ' Set coin image & backdrop
    if coin.image <> invalid
        m.coinImage.uri = coin.image
        m.heroBackdrop.uri = coin.image
    end if
    
    ' Set name and symbol
    if coin.name <> invalid then m.coinName.text = coin.name
    if coin.symbol <> invalid then m.coinSymbol.text = ucase(coin.symbol)
    
    ' Set price
    if coin.current_price <> invalid
        m.priceLabel.text = formatPrice(coin.current_price)
    else if coin.price <> invalid
        m.priceLabel.text = formatPrice(coin.price)
    end if
    
    ' Set price change
    change = 0
    if coin.price_change_percentage_24h <> invalid then change = coin.price_change_percentage_24h
    if coin.change24h <> invalid then change = coin.change24h
    
    changeStr = formatPercent(change)
    m.priceChange.text = changeStr
    if change >= 0
        m.priceChange.color = "#10b981"
    else
        m.priceChange.color = "#ef4444"
    end if
    
    ' Set market cap
    if coin.market_cap <> invalid
        m.marketCapValue.text = formatLargeNumber(coin.market_cap)
    else
        m.marketCapValue.text = "---"
    end if
    
    ' Set volume
    if coin.total_volume <> invalid
        m.volumeValue.text = formatLargeNumber(coin.total_volume)
    else
        m.volumeValue.text = "---"
    end if
    
    ' Set circulating supply
    if coin.circulating_supply <> invalid and coin.symbol <> invalid
        m.supplyValue.text = formatLargeNumber(coin.circulating_supply) + " " + ucase(coin.symbol)
    else
        m.supplyValue.text = "---"
    end if
    
    ' Set ATH
    if coin.ath <> invalid
        m.athValue.text = formatPrice(coin.ath)
    else
        m.athValue.text = "---"
    end if
    
    ' Set Description
    if coin.description <> invalid and coin.description.en <> invalid
        m.coinDescription.text = coin.description.en
    else if coin.description <> invalid and type(coin.description) = "roString"
        m.coinDescription.text = coin.description
    else
        m.coinDescription.text = "Loading details..."
    end if
    
    ' Check if NFT (show gallery instead of chart)
    isNFT = m.top.isNFT
    m.chartSection.visible = not isNFT
    m.nftGallery.visible = isNFT
    
    ' Update chart data
    if not isNFT
        if coin.sparkline_in_7d <> invalid and coin.sparkline_in_7d.price <> invalid
            m.simpleChart.data = coin.sparkline_in_7d.price
        else
            ' Clear chart or show loading?
            ' m.simpleChart.data = []
        end if
    end if
    
    ' For NFTs, could load collection images here
    if isNFT
        loadNFTGallery()
    end if
end sub

sub loadNFTGallery()
    ' Placeholder - would fetch NFT collection images from API
    ' For now, just show empty gallery
    content = CreateObject("roSGNode", "ContentNode")
    m.nftGrid.content = content
end sub

function formatPrice(price as dynamic) as string
    if price = invalid then return "$0.00"
    
    if type(price) <> "roFloat" and type(price) <> "roDouble" and type(price) <> "Float" and type(price) <> "Double"
        if type(price) = "roInteger" or type(price) = "Integer"
            price = price * 1.0
        else
            return "$0.00"
        end if
    end if
    
    if price >= 1000
        return "$" + str(int(price)).trim()
    else if price >= 1
        return "$" + str(int(price * 100) / 100).trim()
    else if price >= 0.01
        return "$" + str(int(price * 10000) / 10000).trim()
    else
        return "$" + str(int(price * 1000000) / 1000000).trim()
    end if
end function

function formatPercent(pct as dynamic) as string
    if pct = invalid then return "0%"
    
    sign = ""
    if pct >= 0 then sign = "+"
    
    return sign + str(int(pct * 10) / 10).trim() + "%"
end function

function formatLargeNumber(num as dynamic) as string
    if num = invalid then return "N/A"
    
    if type(num) <> "roFloat" and type(num) <> "roDouble" and type(num) <> "Float" and type(num) <> "Double"
        if type(num) = "roInteger" or type(num) = "Integer" or type(num) = "LongInteger"
            num = num * 1.0
        else
            return "N/A"
        end if
    end if
    
    if num >= 1000000000000
        return "$" + str(int(num / 100000000000) / 10).trim() + "T"
    else if num >= 1000000000
        return "$" + str(int(num / 100000000) / 10).trim() + "B"
    else if num >= 1000000
        return "$" + str(int(num / 100000) / 10).trim() + "M"
    else if num >= 1000
        return "$" + str(int(num / 100) / 10).trim() + "K"
    else
        return "$" + str(int(num)).trim()
    end if
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        ' Stop asking for updates
        if m.cryptoService <> invalid
            m.cryptoService.unobserveField("coinData")
            m.cryptoService.coinRequest = ""
        end if
        
        m.top.visible = false
        return true
    end if
    
    return false
end function
