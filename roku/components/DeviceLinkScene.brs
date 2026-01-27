' DeviceLinkScene.brs
' Manages the user activation flow

sub init()
    m.qrPoster = m.top.findNode("qrPoster")
    m.codeLabel = m.top.findNode("codeLabel")
    m.statusLabel = m.top.findNode("statusLabel")
    m.deviceTask = m.top.findNode("deviceTask")
    m.pollTimer = m.top.findNode("pollTimer")
    
    m.pollTimer.observeField("fire", "checkStatus")
    m.deviceTask.observeField("codeResult", "onCodeReceived")
    m.deviceTask.observeField("statusResult", "onStatusReceived")
    
    ' API Base URL (hardcoded for dev, effectively same as CryptoService default)
    m.deviceTask.apiBaseUrl = "http://192.168.4.110:3000"
    ' In production, would be dynamic. For now using placeholder IP.
    
    ' Start flow
    requestActivationCode()
end sub

sub requestActivationCode()
    deviceInfo = CreateObject("roDeviceInfo")
    serial = deviceInfo.getChannelClientId() ' Using Client ID as serial for privacy
    
    m.deviceTask.rokuSerial = serial
    m.deviceTask.deviceName = "Roku TV"
    m.deviceTask.command = "getCode"
    m.deviceTask.control = "RUN" 
end sub

sub onCodeReceived()
    data = m.deviceTask.codeResult
    if data <> invalid and data.code <> invalid
        m.currentCode = data.code
        
        ' Update UI
        m.codeLabel.text = m.currentCode
        
        ' Generate QR Code URL
        ' Activation URL: https://qchannel.com/activate?code=XYZ
        targetUrl = "https://qchannel.com/activate?code=" + m.currentCode
        
        ' Use roUrlTransfer for escaping
        ut = CreateObject("roUrlTransfer")
        qrApi = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" + ut.Escape(targetUrl)
        
        m.qrPoster.uri = qrApi
        
        ' Start Polling
        m.pollTimer.control = "start"
    else
        m.statusLabel.text = "Error getting code. Retrying..."
        ' Simple retry logic?
    end if
end sub

sub checkStatus()
    if m.currentCode <> invalid
        m.deviceTask.activationCode = m.currentCode
        m.deviceTask.command = "checkStatus"
        m.deviceTask.control = "RUN"
    end if
end sub

sub onStatusReceived()
    data = m.deviceTask.statusResult
    if data <> invalid
        print "Status Request: " + FormatJson(data)
        
        if data.status = "linked"
            handleSuccess(data)
        else if data.status = "expired"
            m.statusLabel.text = "Code expired. Refreshing..."
            m.pollTimer.control = "stop"
            requestActivationCode()
        end if
    end if
end sub

sub handleSuccess(data as object)
    m.statusLabel.text = "Success! Linked to User " + Left(data.user_id, 8) + "..."
    m.pollTimer.control = "stop"
    
    m.top.linkedUser = data
    m.top.linkComplete = true
    
    ' In a real app, we would transition to Home or MainScene here
    ' or close if this was a modal.
end sub
