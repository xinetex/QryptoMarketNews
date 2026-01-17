sub init()
    m.top.backgroundColor = "0x060606FF"
    m.top.backgroundUri = ""
    
    m.codeLabel = m.top.findNode("codeLabel")
    m.qrPoster = m.top.findNode("qrPoster")
    m.activationTask = m.top.findNode("activationTask")
    m.pollTimer = m.top.findNode("pollTimer")
    
    ' Get Roku Serial Number
    deviceInfo = CreateObject("roDeviceInfo")
    m.rokuSerial = deviceInfo.GetDeviceUniqueId()
    
    ' Start Activation Flow
    startActivation()
end sub

sub startActivation()
    m.activationTask.command = "getCode"
    m.activationTask.rokuSerial = m.rokuSerial
    m.activationTask.observeField("codeResult", "onCodeReceived")
    m.activationTask.control = "RUN"
end sub

sub onCodeReceived()
    result = m.activationTask.codeResult
    
    if result <> invalid and result.code <> invalid
        m.deviceCode = result.code
        m.codeLabel.text = m.deviceCode
        
        ' Generate QR URL - using a public QR API as fallback
        activateUrl = "https://qchannel.app/activate?code=" + m.deviceCode
        
        ' Use QR Server API for QR code generation (URL Encoded)
        transfer = CreateObject("roUrlTransfer")
        qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" + transfer.Escape(activateUrl)
        m.qrPoster.uri = qrUrl
        
        ' Start Polling for activation
        m.pollTimer.observeField("fire", "onPollTimer")
        m.pollTimer.control = "start"
        
        ' Show local code indicator if applicable
        if result.local = true
            print "Using local activation code (offline mode)"
        end if
    else
        m.codeLabel.text = "ERROR"
        print "Activation Error: " + FormatJson(result)
    end if
end sub

sub onPollTimer()
    m.activationTask.command = "poll"
    m.activationTask.deviceCode = m.deviceCode
    m.activationTask.observeField("pollResult", "onPollResult")
    m.activationTask.control = "RUN"
end sub

sub onPollResult()
    result = m.activationTask.pollResult
    
    if result <> invalid and result.status = "success"
        print "QChannel Device Activated!"
        m.pollTimer.control = "stop"
        
        ' Store activation flag in registry
        reg = CreateObject("roRegistrySection", "QChannel")
        reg.Write("activated", "true")
        if result.access_token <> invalid
            reg.Write("auth_token", result.access_token)
        end if
        reg.Flush()
        
        ' Signal success to parent (MainScene)
        m.top.visible = false
        m.top.activationComplete = true
    end if
end sub

function onKeyEvent(key as String, press as Boolean) as Boolean
    ' Allow skipping activation for demo purposes (OK button)
    if press and key = "OK"
        print "Skipping activation for demo..."
        m.pollTimer.control = "stop"
        m.top.visible = false
        m.top.activationComplete = true
        return true
    end if
    return false
end function
