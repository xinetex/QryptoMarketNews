' MoltConnect.brs
' Connects to the Moltbook Bridge and displays agent feed

sub init()
    m.statusLabel = m.top.findNode("statusLabel")
    m.messageLabel = m.top.findNode("messageLabel")
    m.pulseBorder = m.top.findNode("pulseBorder")
    m.tickerTimer = m.top.findNode("tickerTimer")
    m.pollTimer = m.top.findNode("pollTimer")
    
    m.tickerTimer.observeField("fire", "rotateMessage")
    m.pollTimer.observeField("fire", "fetchData")
    
    m.feedItems = []
    m.currentIndex = 0
    
    ' Initial status
    updateStatus("INITIALIZING")
end sub

sub onSubmoltChanged()
    if m.top.submolt <> invalid and m.top.submolt <> ""
        updateStatus("CONNECTING TO: " + ucase(m.top.submolt))
        fetchData()
        m.pollTimer.control = "start"
    end if
end sub

sub fetchData()
    ' In a real scenario, we would use a Task node for HTTP
    ' For simplicity here, we assume a global helper or a dedicated Task
    ' We will create a ContentTask on the fly just for this fetch
    
    task = CreateObject("roSGNode", "ContentTask")
    task.requestType = "url"
    task.url = "https://qryptomarket-news.vercel.app/api/roku/molt-bridge?submolt=" + m.top.submolt
    task.observeField("contentResult", "onDataReceived")
    task.control = "RUN"
end sub

sub onDataReceived(event as object)
    result = event.getData()
    
    if result <> invalid and result.jsonString <> invalid
        json = ParseJson(result.jsonString)
        if json <> invalid and json.items <> invalid
            m.feedItems = json.items
            updateStatus("ONLINE // SYNCED")
            m.pulseBorder.color = "#10b981" ' Green sync
            m.tickerTimer.control = "start"
            rotateMessage()
        else
            updateStatus("ERROR // PARSE FAIL")
            m.pulseBorder.color = "#ef4444" ' Red error
        end if
    else
        updateStatus("OFFLINE // RETRYING")
        m.pulseBorder.color = "#ef4444"
    end if
end sub

sub rotateMessage()
    if m.feedItems.Count() > 0
        item = m.feedItems[m.currentIndex]
        
        prefix = "[" + ucase(item.author) + "]: "
        m.messageLabel.text = prefix + item.title
        
        m.currentIndex = m.currentIndex + 1
        if m.currentIndex >= m.feedItems.Count()
            m.currentIndex = 0
        end if
    else
        m.messageLabel.text = "Waiting for agent signals..."
    end if
end sub

sub updateStatus(msg as string)
    m.top.status = msg
    m.statusLabel.text = "MOLT-CONNECT // " + msg
end sub
