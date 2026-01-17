' Prophet TV Prediction Scene
' BrightScript logic for professional prediction markets

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.marketGrid = m.top.findNode("marketGrid")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("predictions", "onPredictionsChanged")
    m.cryptoService.control = "run"
end sub

sub onPredictionsChanged()
    predictions = m.cryptoService.predictions
    if predictions = invalid then return
    
    print "[PredictionScene] Data received: " + str(predictions.count()) + " markets"
    
    content = CreateObject("roSGNode", "ContentNode")
    
    for each market in predictions
        item = content.createChild("ContentNode")
        item.addFields({
            id: market.id,
            question: market.question,
            yesOdds: market.yesOdds,
            noOdds: market.noOdds,
            volume: market.volume,
            endDate: market.endDate
        })
    end for
    
    m.marketGrid.content = content
    m.marketGrid.setFocus(true)
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    ' Ensure grid keeps focus
    if not m.marketGrid.hasFocus()
        m.marketGrid.setFocus(true)
    end if
    
    return false
end function
