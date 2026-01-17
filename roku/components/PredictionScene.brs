' Prophet TV Prediction Scene
' BrightScript logic for community prediction polls

sub init()
    m.top.setFocus(true)
    
    ' Get node references
    m.pollQuestion = m.top.findNode("pollQuestion")
    m.option1Pct = m.top.findNode("option1Pct")
    m.option2Pct = m.top.findNode("option2Pct")
    m.option1Focus = m.top.findNode("option1Focus")
    m.option2Focus = m.top.findNode("option2Focus")
    m.yesBar = m.top.findNode("yesBar")
    m.voteCount = m.top.findNode("voteCount")
    m.voteStatus = m.top.findNode("voteStatus")
    
    ' Initialize crypto service
    m.cryptoService = m.top.findNode("cryptoService")
    m.cryptoService.observeField("predictions", "onPredictionsChanged")
    m.cryptoService.control = "run"
    
    ' Voting state
    m.hasVoted = false
    m.selectedOption = 0 ' 0 = none, 1 = yes, 2 = no
    m.currentPoll = invalid
    
    ' Start with YES focused
    focusOption(1)
end sub

sub focusOption(option as integer)
    if option = 1
        m.option1Focus.opacity = 1.0
        m.option2Focus.opacity = 0
        m.selectedOption = 1
    else
        m.option1Focus.opacity = 0
        m.option2Focus.opacity = 1.0
        m.selectedOption = 2
    end if
end sub

sub onPredictionsChanged()
    predictions = m.cryptoService.predictions
    if predictions = invalid or predictions.count() = 0 then return
    
    ' Get current active poll
    poll = predictions[0]
    m.currentPoll = poll
    
    if poll.question <> invalid
        m.pollQuestion.text = poll.question
    end if
    
    if poll.yesPercent <> invalid and poll.noPercent <> invalid
        m.option1Pct.text = str(poll.yesPercent).trim() + "%"
        m.option2Pct.text = str(poll.noPercent).trim() + "%"
        
        ' Update results bar
        barWidth = int(1120 * poll.yesPercent / 100)
        m.yesBar.width = barWidth
    end if
    
    if poll.voteCount <> invalid
        m.voteCount.text = formatVoteCount(poll.voteCount) + " votes"
        if poll.endsIn <> invalid
            m.voteCount.text = m.voteCount.text + " • Ends in " + poll.endsIn
        end if
    end if
end sub

sub submitVote(choice as integer)
    if m.hasVoted then return
    
    m.hasVoted = true
    
    if choice = 1
        m.voteStatus.text = "✅ You voted YES!"
        m.voteStatus.color = "#10b981"
    else
        m.voteStatus.text = "✅ You voted NO!"
        m.voteStatus.color = "#ef4444"
    end if
    
    ' TODO: Send vote to API
    print "[PredictionScene] Vote submitted: " + str(choice)
end sub

function formatVoteCount(count as integer) as string
    if count >= 1000
        return str(int(count / 100) / 10).trim() + "K"
    else
        return str(count).trim()
    end if
end function

function onKeyEvent(key as string, press as boolean) as boolean
    if not press then return false
    
    if key = "back"
        m.top.exitRequested = true
        return true
    end if
    
    if key = "left"
        focusOption(1)
        return true
    else if key = "right"
        focusOption(2)
        return true
    end if
    
    if key = "OK"
        submitVote(m.selectedOption)
        return true
    end if
    
    return false
end function
